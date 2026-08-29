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

/**
 * How many times a candidate is asked cold before it is believed.
 *
 * One ask was not enough, and the cost of that showed up in public. The Apollo
 * employment question passed a single cold ask, shipped as a preset, and was
 * then caught by the proof script reciting four hundred thousand with no
 * document in front of it. The model had known it all along; the one sample
 * that cleared it had simply landed on a decline.
 *
 * Sampling is the whole reason. A model that produces a fact three times in
 * four is a model that knows the fact, and a demo built on the fourth reply is
 * a demo waiting to be contradicted live. Three asks, and producing the answer
 * on ANY of them disqualifies. That is deliberately the strict direction: this
 * test throws away good questions rather than keep a bad one, because the
 * question wrongly kept is the one that gets argued with in front of an
 * audience.
 */
const COLD_ASKS = Number(process.env.KERNLY_COLD_ASKS ?? 3);

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
    process.stdout.write("  (minute ceiling reached, waiting 65s)\n");
    await sleep(65_000);
  }
  return ask(question, context, mode);
}

// The marker means the model answered from memory. A demo question that comes
// back marked has failed even when the text after the marker is correct.
const fromMemory = (a) => a.startsWith("[Not in the reference material.]");

/**
 * The three phases run in this order for a reason that is entirely about cost.
 *
 * A compressed ask spends most of a minute's token budget, so the run is paced
 * at roughly one a minute and the warm phase is what the wall clock is made of.
 * A cold ask is a question and nothing else — under a hundred tokens, no pacing
 * needed. Reading the document costs nothing at all.
 *
 * So the cheap tests go first and each is allowed to end a candidate early. The
 * earlier version interleaved them and paid a full minute window for candidates
 * that a free string search would have rejected before any request was made.
 */
const docs = new Map();
const live = [];

// ---------------------------------------------------------------------------
// Phase 0 — is the answer even in the document?
//
// Free, and it catches the failure that wastes the most time: an expected
// answer that was mistyped, or was never on the page, or sits in a table the
// text extractor drops. Without this the run spends a minute window on the
// candidate and reports "lost the answer", which reads like a compressor fault
// and is not one. A candidate that fails here is a broken candidate, and the
// difference matters when this output is being read as evidence.
// ---------------------------------------------------------------------------
process.stdout.write("phase 0 — is the answer present in the source document?\n");
for (const c of CANDIDATES) {
  if (!docs.has(c.url)) {
    docs.set(c.url, await fetchDoc(c.url));
    await sleep(600);
  }
  const doc = docs.get(c.url);
  const present = new RegExp(c.expect, "i").test(doc.text);
  process.stdout.write(`  ${present ? "present" : "MISSING"}  ${c.id}\n`);
  if (present) live.push(c);
}

// ---------------------------------------------------------------------------
// Phase 1 — can the model already answer with no document?
// ---------------------------------------------------------------------------
process.stdout.write(`\nphase 1 — cold asks, ${COLD_ASKS} each, any hit disqualifies\n`);
const cold = [];
for (const c of live) {
  const want = new RegExp(c.expect, "i");
  let hits = 0;
  for (let i = 0; i < COLD_ASKS; i += 1) {
    const out = await askPatiently(c.question, "", "full");
    if (want.test(out.answer)) hits += 1;
    await sleep(1500);
  }
  const label = hits === 0 ? "does not know" : `KNOWS IT ${hits}/${COLD_ASKS}`;
  process.stdout.write(`  ${label.padEnd(15)} ${c.id}\n`);
  if (hits === 0) cold.push(c);
}

// ---------------------------------------------------------------------------
// Phase 2 — does the fact survive the cut?
// ---------------------------------------------------------------------------
process.stdout.write(`\nphase 2 — compressed asks at ratio ${RATIO}\n`);
const qualified = [];
for (const c of cold) {
  const want = new RegExp(c.expect, "i");
  const doc = docs.get(c.url);
  const warm = await askPatiently(c.question, doc.text, "kernly");
  const answered = want.test(warm.answer) && !fromMemory(warm.answer);
  const rc = warm.receipt ?? {};
  const verdict = warm.error
    ? "ERROR " + warm.error.slice(0, 40)
    : answered
      ? "QUALIFIES"
      : fromMemory(warm.answer)
        ? "answered from memory"
        : "lost the answer";
  process.stdout.write(`  ${verdict.padEnd(22)} ${c.id}  (${rc.tokensIn ?? "?"} -> ${rc.tokensOut ?? "?"})\n`);
  if (answered) qualified.push(c);
  await sleep(2500);
}

process.stdout.write(`\n${qualified.length} of ${CANDIDATES.length} candidates qualify\n`);
for (const c of qualified) process.stdout.write(`  ${c.id}\n`);
