/**
 * Answer-span retention harness.
 *
 * The audit's sharpest criticism of Kernly was that the confidence gate is a
 * statement about the shape of the output rather than about whether the answer
 * survived. This harness attacks that directly and without an LLM in the loop,
 * which keeps the result reproducible by anyone.
 *
 * Method: each fixture is a long context, a question, and the exact span that
 * contains the answer. Compress at a range of ratios and check whether the
 * answer span is still recoverable from the output. Recovery is measured as the
 * fraction of the span's content tokens that survived, and a span counts as
 * retained at 0.8 or above, which tolerates lexical compaction dropping
 * grammatical filler but not the loss of a fact.
 *
 * What this does and does not show: it shows that the selector puts the
 * answer-bearing region inside the budget. It does not show that a model reading
 * the compressed context produces the same answer. That is a stronger claim and
 * needs a model in the loop; this is the floor beneath it, and a pipeline that
 * fails here cannot possibly pass that.
 *
 *   node scripts/eval.mjs
 */
import { compress } from "@kernly/core";
import { FIXTURES } from "./eval-fixtures.mjs";

const RATIOS = [0.5, 0.4, 0.3, 0.25, 0.2, 0.15, 0.1];
const RETENTION_THRESHOLD = 0.8;

const STOP = new Set(
  "the a an of to in on at for and or is are was were be been it its this that with as by from".split(" "),
);

function contentTokens(text) {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9._-]*/g) || []).filter(
    (t) => !STOP.has(t),
  );
}

/** Fraction of the answer span's content tokens still present in the output. */
function spanRecovery(span, output) {
  const wanted = contentTokens(span);
  if (!wanted.length) return 1;
  const have = new Set(contentTokens(output));
  let found = 0;
  for (const token of wanted) if (have.has(token)) found += 1;
  return found / wanted.length;
}

const rows = [];

for (const ratio of RATIOS) {
  let retained = 0;
  let recoverySum = 0;
  let ratioSum = 0;
  let confidenceSum = 0;
  let escalated = 0;

  for (const fixture of FIXTURES) {
    const { output, receipt } = await compress(fixture.context, {
      ratio,
      query: fixture.question,
    });
    const recovery = spanRecovery(fixture.answerSpan, output);
    if (recovery >= RETENTION_THRESHOLD) retained += 1;
    recoverySum += recovery;
    ratioSum += receipt.ratio;
    confidenceSum += receipt.confidence;
    if (receipt.escalate) escalated += 1;
  }

  const n = FIXTURES.length;
  rows.push({
    target: ratio,
    achieved: ratioSum / n,
    retention: retained / n,
    recovery: recoverySum / n,
    confidence: confidenceSum / n,
    escalated: escalated / n,
  });
}

const pct = (v) => (v * 100).toFixed(1).padStart(6) + "%";
console.log(`Fixtures: ${FIXTURES.length}   retention threshold: ${RETENTION_THRESHOLD}\n`);
console.log("target  achieved  answer kept  mean recovery  confidence  escalated");
for (const r of rows) {
  console.log(
    [
      (r.target * 100).toFixed(0).padStart(5) + "%",
      pct(r.achieved),
      pct(r.retention),
      pct(r.recovery),
      pct(r.confidence),
      pct(r.escalated),
    ].join("  "),
  );
}

// The gate earns its place only if it flags the runs that lost the answer. A
// pipeline that fails silently is worse than one that compresses less.
//
// Both error directions are counted, and the second one is the reason this
// section reads the way it does. An earlier version of the gate caught almost
// every lost answer and looked excellent by that number alone — while also
// warning on 34 of the 37 runs that came through perfectly intact. A detector
// that fires on everything has perfect recall and no value, so recall is never
// reported here without the false alarm rate printed beside it.
let caught = 0;
let missed = 0;
let falseAlarms = 0;
let clean = 0;

for (const ratio of RATIOS) {
  for (const fixture of FIXTURES) {
    const { output, receipt } = await compress(fixture.context, {
      ratio,
      query: fixture.question,
    });
    const kept = spanRecovery(fixture.answerSpan, output) >= RETENTION_THRESHOLD;
    const warned = receipt.escalate || receipt.confidence < 0.7;
    if (!kept && warned) caught += 1;
    else if (!kept) missed += 1;
    else if (warned) falseAlarms += 1;
    else clean += 1;
  }
}

const lost = caught + missed;
const fine = falseAlarms + clean;
console.log(
  `\nRuns that lost the answer: ${lost} of ${lost + fine}` +
    (lost ? `  (gate warned on ${caught}, missed ${missed})` : ""),
);
console.log(
  `Runs that kept it: ${fine}` + (fine ? `  (gate warned anyway on ${falseAlarms})` : ""),
);
