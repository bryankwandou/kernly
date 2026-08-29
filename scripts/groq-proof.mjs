/**
 * Does a Groq key on the free tier hold a long document? No. Does it hold one
 * that Kernly compressed? That is the question this answers, and it answers it
 * against the live API rather than against a recording.
 *
 * Nothing here talks to a Kernly server. The page is fetched from its origin,
 * stripped to text in this file, compressed by the local library, and handed
 * straight to api.groq.com with the key in your environment. If the numbers
 * below are wrong, they are wrong on your machine with your key, which is the
 * only way a claim like this is worth anything.
 *
 *   GROQ_API_KEY=gsk_... node scripts/groq-proof.mjs
 *   GROQ_API_KEY=gsk_... node scripts/groq-proof.mjs https://en.wikipedia.org/wiki/Apollo_program "who commanded Apollo 11"
 */
import { compress, estimate } from "@kernly/core";

/**
 * Two ways to run this, and the difference matters to what it proves.
 *
 * With GROQ_API_KEY set, every call goes straight from this file to
 * api.groq.com. No Kernly server exists in that path, so the refusal and the
 * acceptance are both between you and Groq, and nothing we run can have shaped
 * them. That is the version to trust.
 *
 * Without a key it goes through the deployed endpoint, which holds the key
 * server-side. Weaker, because our code is in the loop — but the provider's
 * refusal is passed through verbatim, error message and token counts intact,
 * and it lets someone check the claim before deciding whether to sign up for a
 * key. Which mode ran is printed at the top and again beside every result.
 */
const KEY = process.env.GROQ_API_KEY && /^gsk_/.test(process.env.GROQ_API_KEY)
  ? process.env.GROQ_API_KEY
  : null;
const SITE = process.env.KERNLY_SITE ?? "https://kernly.vercel.app";
const DIRECT = KEY !== null;

const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/**
 * The cases, chosen before the results were known.
 *
 * Each question has a checkable answer that sits in the body of a long article
 * rather than its opening paragraph, because an answer in the first two hundred
 * words survives any compressor and proves nothing about selection.
 */
/**
 * Questions whose correct answer can only have come from the document.
 *
 * The three this file used to run — the conference that divided Germany, the
 * experiment tracing oxygen to water, what killed the Apollo 1 crew — were all
 * answerable with no document at all. Asked cold, gpt-oss-20b produces Yalta,
 * Ruben and Kamen, and the cabin fire from training alone. So "2 of 3 answered
 * correctly on the compressed context" was never evidence that the compression
 * had carried anything. It was consistent with the compressor dropping every
 * relevant passage and the model reciting Wikipedia from memory.
 *
 * Then the replacement set made the same mistake in a smaller way. The Apollo
 * employment question was selected by a qualifier that asked it cold exactly
 * once, and one ask is a coin toss on a fact the model half-produces: it shipped
 * here, and the very next run of this file caught the model reciting 400,000
 * with no document in front of it. Asked three times it produces the number
 * three times out of three. It had always known it.
 *
 * These three come from a qualifier that now asks cold three times and throws
 * the candidate out on any hit. Eighteen candidates went in and five came out —
 * seven the model already knew, five whose fact did not survive the cut, one
 * whose answer the text extractor never carried off the page. The three below
 * are one each from three different articles, so a quirk of a single Wikipedia
 * page cannot be what the run is measuring.
 *
 * The COLD row still re-checks all of it on every run rather than trusting the
 * selection, because a later model may simply know more, and a question that
 * proved something in August can quietly stop proving it.
 */
const CASES = [
  {
    url: "https://en.wikipedia.org/wiki/Chernobyl_disaster",
    question:
      "how many individual fuel channels did Chernobyl reactor no. 4 have",
    expect: /1,?661/,
  },
  {
    url: "https://en.wikipedia.org/wiki/History_of_Indonesia",
    question:
      "how old is the wild boar hunt cave painting in the Maros-Pangkep karst of Sulawesi",
    expect: /43,?900/,
  },
  {
    url: "https://en.wikipedia.org/wiki/Borobudur",
    question:
      "how many surfaces of stone stairs does Borobudur have in total",
    expect: /2,?033/,
  },
];

/** HTML to text. Deliberately small and readable — it is part of the evidence. */
function textFrom(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(nav|header|footer|aside|form)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, lvl, inner) => {
      const t = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return t ? `\n\n${"#".repeat(Number(lvl))} ${t}\n\n` : "\n\n";
    })
    .replace(/<\/(p|div|section|article|li|tr|blockquote|pre)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/[ \t]+/g, " ").replace(/\n[ \t]+/g, "\n")
    .split("\n")
    .filter((line) => {
      const l = line.trim();
      if (!l) return true;
      if (/^Main articles?:/i.test(l)) return false;
      if (/^(edit|talk|v t e|show|hide|Retrieved from)$/i.test(l)) return false;
      if (/^[←→]/.test(l) || /^\[\d+\]$/.test(l)) return false;
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SYSTEM =
  "Answer the question directly and concretely. Reference material may be supplied. " +
  "When it answers the question, use it and prefer it over what you already know. " +
  "When it does not, open with the exact sentence [Not in the reference material.] and then " +
  "still answer the question from your own knowledge. Never invent details and attribute them " +
  "to the material. Keep it short.";

/** One call to Groq. Returns the verdict without throwing, so a refusal is data. */
async function askGroq(material, question) {
  if (!DIRECT) return askViaSite(material, question);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          // With no material, ask the bare question. An empty "Reference
          // material:" heading is a different prompt from the one a person
          // asking cold would send, and this row exists to establish what the
          // model knows unaided — it has to be an honest version of that
          // question rather than a hollowed-out version of this one.
          content: material
            ? `Reference material:

${material}

---

Question: ${question}`
            : question,
        },
      ],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message ?? `HTTP ${res.status}`;
    return {
      ok: false,
      status: res.status,
      message: msg,
      limit: Number(/Limit (\d+)/.exec(msg)?.[1]) || null,
      requested: Number(/Requested (\d+)/.exec(msg)?.[1]) || null,
    };
  }
  return {
    ok: true,
    answer: json.choices?.[0]?.message?.content?.trim() ?? "",
    promptTokens: json.usage?.prompt_tokens ?? null,
  };
}

/**
 * The same question through the deployed route, which sends the material on
 * unchanged when mode is "full". The provider's error text is returned as-is,
 * so the limit and requested figures survive the trip.
 */
async function askViaSite(material, question) {
  const res = await fetch(`${SITE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, context: material, mode: "full", model: MODEL, locale: "en" }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error ?? `HTTP ${res.status}`;
    return {
      ok: false,
      status: res.status,
      message: msg,
      limit: Number(/Limit (\d+)/.exec(msg)?.[1]) || null,
      requested: Number(/Requested (\d+)/.exec(msg)?.[1]) || null,
    };
  }
  return { ok: true, answer: json.answer ?? "", promptTokens: json.promptTokens ?? null };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const argUrl = process.argv[2];
const argQ = process.argv[3];
const cases = argUrl ? [{ url: argUrl, question: argQ ?? "what is this about", expect: null }] : CASES;

console.log(`model:    ${MODEL}`);
if (DIRECT) {
  console.log(`path:     this file → ${ENDPOINT} (no Kernly server in the path)`);
  console.log(`key:      ${KEY.slice(0, 8)}… from GROQ_API_KEY
`);
} else {
  console.log(`path:     this file → ${SITE}/api/chat → Groq`);
  console.log(`key:      held server-side. Set GROQ_API_KEY to cut the middle out.
`);
}

let passed = 0;
let alreadyKnown = 0;

for (const c of cases) {
  console.log("=".repeat(78));
  console.log(c.url);
  console.log(`Q: ${c.question}\n`);

  const html = await fetch(c.url, { headers: { "User-Agent": "KernlyProof/1.0" } }).then((r) => r.text());
  const text = textFrom(html);
  const tokensIn = estimate(text);
  console.log(`  page      ${text.length.toLocaleString()} chars, ~${tokensIn.toLocaleString()} tokens`);

  // Cold first: no document at all. If the model produces the answer here, the
  // rest of this case proves nothing, and saying so in the output is cheaper
  // than a reader having to think of the objection themselves.
  const cold = await askGroq("", c.question);
  const knewCold = cold.ok && c.expect && c.expect.test(cold.answer ?? "");
  if (knewCold) alreadyKnown += 1;
  console.log(
    `  COLD      ${knewCold ? "MODEL ALREADY KNOWS IT — this case proves nothing" : "model does not know it without the document"}`,
  );
  await wait(3000);

  // Uncompressed, next. The refusal is the baseline and it has to be real.
  const full = await askGroq(text, c.question);
  if (full.ok) {
    console.log(`  UNCUT     accepted at ${full.promptTokens} prompt tokens`);
  } else {
    console.log(`  UNCUT     REFUSED ${full.status} — limit ${full.limit}, requested ${full.requested}`);
  }

  // A refused call spends nothing, so this pause only needs to clear the clock
  // for the accepted one that follows.
  await wait(3000);

  // Then compressed. The ratio is searched rather than fixed, because "10% of
  // the document" means a different number of tokens for each of these pages
  // and only one of those numbers has to clear 8,000. Searching asks the
  // question the ceiling actually poses: what is the *least* compression that
  // gets through? Compressing harder than necessary would throw away context
  // and make the result look worse than the method is.
  let ratio = null;
  let output = "";
  let receipt = null;
  for (const candidate of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.15, 0.12, 0.1, 0.08, 0.05]) {
    const r = await compress(text, { ratio: candidate, query: c.question });
    if (r.receipt.tokensOut <= 6400) {
      ratio = candidate;
      output = r.output;
      receipt = r.receipt;
      break;
    }
  }
  if (!receipt) {
    console.log("  KERNLY    no ratio in the sweep fits under the ceiling.\n");
    continue;
  }
  const cut = ((1 - receipt.tokensOut / receipt.tokensIn) * 100).toFixed(1);
  const kern = await askGroq(output, c.question);

  if (!kern.ok) {
    console.log(`  KERNLY    REFUSED ${kern.status} — ${kern.message.slice(0, 90)}`);
  } else {
    console.log(
      `  KERNLY    accepted at ${kern.promptTokens} prompt tokens, ratio ${Math.round(ratio * 100)}% ` +
        `(${receipt.tokensIn.toLocaleString()} → ${receipt.tokensOut.toLocaleString()}, ${cut}% cut, ` +
        `confidence ${receipt.confidence.toFixed(2)}${receipt.escalate ? ", GATE WARNS" : ""})`,
    );
    const a = kern.answer.replace(/\s+/g, " ");
    console.log(`  ANSWER    ${a.slice(0, 200)}${a.length > 200 ? "…" : ""}`);
    if (c.expect) {
      const hit = c.expect.test(kern.answer);
      console.log(`  CHECK     ${hit ? "correct" : "WRONG"} (expected /${c.expect.source}/)`);
      if (hit && !full.ok) passed += 1;
    }
  }
  console.log();

  // Sixty seconds, because the ceiling is measured per minute and the accepted
  // call just spent most of it. The first run of this script waited four
  // seconds, and cases two and three came back 429 — a rate limit produced by
  // the test harness rather than by anything it was measuring. A proof that
  // trips over its own pacing is not evidence of anything.
  if (c !== cases[cases.length - 1]) {
    console.log("  (pausing 60s so the per-minute token window resets)");
    await wait(60_000);
  }
}

if (cases.length > 1) {
  console.log("=".repeat(78));
  console.log(
    `${passed}/${cases.length} cases where the uncompressed request was refused ` +
      `and the compressed one answered correctly.`,
  );
  // Correct and attributable are different counts, and collapsing them is the
  // error this file used to make. A case the model answers cold is correct
  // whatever the compressor did with the passage, so it belongs outside the
  // number that carries the claim.
  if (alreadyKnown > 0) {
    console.log(
      `${passed - alreadyKnown} of those are attributable to the compression. ` +
        `${alreadyKnown} the model already knew without the document, so that row ` +
        `demonstrates the ceiling but not the retrieval.`,
    );
  }
}
