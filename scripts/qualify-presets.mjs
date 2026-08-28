/**
 * Decide whether a demo question demonstrates anything.
 *
 * The first set of presets shipped without this check and all four were worth
 * nothing. Every question — the Yalta conference, the Apollo 1 fire, the Round
 * Table Conference — was something the model could answer with no document in
 * front of it at all. A correct answer therefore proved only that the model had
 * read Wikipedia during training. The compression could have dropped the
 * relevant passage entirely, and on the Indonesia article at a tenth it did
 * exactly that: the reply came back correct and carrying the marker that says
 * it came from memory rather than from the material.
 *
 * A question earns its place only by failing one test and passing another:
 *
 *   1. Asked cold, with no material, the model must NOT produce the answer.
 *      Otherwise a correct reply later tells us nothing.
 *   2. Asked with the compressed material, it MUST produce the answer. That is
 *      the demonstration — the fact survived a ninety percent cut and arrived
 *      intact.
 *
 * Both halves are necessary. The first alone finds obscure questions; the
 * second alone finds easy ones; only together do they find a question whose
 * correct answer is attributable to the compressor and to nothing else.
 *
 * Run it whenever the model list changes. Models learn things between versions,
 * and a question that qualified last year can quietly stop proving anything.
 */
import { readFileSync } from "node:fs";

const BASE = process.env.KERNLY_BASE ?? "https://kernly.vercel.app";
const MODEL = process.env.KERNLY_MODEL ?? "openai/gpt-oss-20b";
const RATIO = Number(process.env.KERNLY_RATIO ?? 0.1);

const CANDIDATES = JSON.parse(readFileSync(new URL("./preset-candidates.json", import.meta.url), "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchDoc(url) {
  const res = await fetch(`${BASE}/api/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  return res.json();
}

async function ask(question, context, mode) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      context,
      mode,
      ratio: RATIO,
      model: MODEL,
      locale: "en",
    }),
  });
  const json = await res.json().catch(() => null);
  if (!json || json.error) return { answer: "", error: json?.error ?? `HTTP ${res.status}`, status: res.status };
  return json;
}

/**
 * Wait out the minute ceiling rather than recording it as a rejected question.
 *
 * Each compressed call here spends about six thousand of Groq's eight thousand
 * tokens per minute, so a run that fires them back to back qualifies its first
 * candidate and then reports every remaining one as a failure it never actually
 * tested. The first version of this file did exactly that. The ceiling being
 * demonstrated by the page is the same ceiling that breaks the tool measuring
 * it, which is fitting but not useful.
 *
 * Sixty-five seconds, because the window is a minute and the extra five keep a
 * clock difference from costing a whole extra wait.
 */
async function askPatiently(question, context, mode) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const out = await ask(question, context, mode);
    if (out.status !== 429) return out;
    process.stdout.write(`  (minute ceiling reached, waiting 65s)
`);
    await sleep(65_000);
  }
  return ask(question, context, mode);
}

// The marker means the model answered from memory. A demo question that comes
// back marked has failed even when the text after the marker is correct.
const fromMemory = (a) => a.startsWith("[Not in the reference material.]");

const docs = new Map();
let qualified = 0;

for (const c of CANDIDATES) {
  process.stdout.write(`\n${c.id}\n  ${c.question}\n`);
  const want = new RegExp(c.expect, "i");

  const cold = await askPatiently(c.question, "", "full");
  const knowsCold = want.test(cold.answer);
  process.stdout.write(`  cold (no material)     ${knowsCold ? "KNOWS IT  <- disqualified" : "does not know"}\n`);
  await sleep(2500);

  if (!docs.has(c.url)) {
    docs.set(c.url, await fetchDoc(c.url));
    await sleep(1000);
  }
  const doc = docs.get(c.url);

  const warm = await askPatiently(c.question, doc.text, "kernly");
  const answered = want.test(warm.answer) && !fromMemory(warm.answer);
  const rc = warm.receipt ?? {};
  process.stdout.write(
    `  compressed (${rc.tokensIn ?? "?"} -> ${rc.tokensOut ?? "?"})  ${
      warm.error ? "ERROR " + warm.error.slice(0, 40) : answered ? "answers from material" : fromMemory(warm.answer) ? "answered from memory" : "lost the answer"
    }\n`,
  );
  await sleep(2500);

  const ok = !knowsCold && answered;
  process.stdout.write(`  => ${ok ? "QUALIFIES" : "rejected"}\n`);
  if (ok) qualified += 1;
}

process.stdout.write(`\n${qualified} of ${CANDIDATES.length} candidates qualify\n`);
