import assert from "node:assert/strict";
import { compress, gate, compact, normalize, segment } from "../dist/index.js";

let pass = 0;
const t = async (name, fn) => {
  await fn();
  pass++;
  console.log("  ok  " + name);
};

const AGENT_LOG = `
# Task
Please refactor the authentication module so that it uses the new session store.

It is worth noting that the current implementation is basically using the old cookie jar,
and in order to migrate we need to make use of the SessionStore class that lives in
\`src/auth/session.ts\`.

\`\`\`ts
export class SessionStore {
  constructor(private redis: RedisClient) {}
  async get(id: string) { return this.redis.get("sess:" + id); }
}
\`\`\`

Reading file src/auth/legacy.ts
Reading file src/auth/legacy.ts
Reading file src/auth/legacy.ts

ERROR: TypeError: cannot read property 'get' of undefined at src/auth/legacy.ts:42

The vast majority of the callers are actually in the API layer, and due to the fact that
they all import from the barrel file, we should be able to swap the implementation without
touching them at all.

Some unrelated background about the company retreat in Bali last quarter, which was very
nice and had a large number of attendees, but has nothing whatsoever to do with sessions.
`;

const TIMELINE_FIXTURE = `14:02 Deploy begins. Rollout is canary, ten percent.
14:06 The on-call notes elevated latency. It is not in the checkout path
      but it shares a node pool, so it looked relevant.
14:11 Checkout error rate crosses two percent.
14:17 Rolled back. Error rate returns to baseline.`;

const PROSE_FIXTURE = `The migration ran over three evenings and nobody had to be paged.
2 of the shards needed a manual nudge, which we expected.
Everything else came up on its own.`;

console.log("kernly/core");

await t("normalize collapses whitespace and strips zero-width", () => {
  assert.equal(normalize("a​  b\n\n\n\nc"), "a b\n\nc");
});

await t("segment classifies fenced code as code", () => {
  const blocks = segment(AGENT_LOG);
  const kinds = new Set(blocks.map((b) => b.kind));
  assert.ok(kinds.has("code"), "expected a code block, got " + [...kinds].join(","));
  assert.ok(kinds.has("heading"), "expected a heading block");
});

await t("lexical layer never touches protected spans", () => {
  const src = 'The value of the constant `MAX_RETRIES` is 5 and the url is https://a.io/x?y=1';
  const out = compact(src, 1).text;
  assert.ok(out.includes("`MAX_RETRIES`"), "backticked identifier lost: " + out);
  assert.ok(out.includes("https://a.io/x?y=1"), "url mangled: " + out);
  assert.ok(out.includes("5"), "numeric literal lost: " + out);
  assert.ok(!/\bthe\b/i.test(out), "determiners survived: " + out);
});

await t("lexical layer is a no-op at strength 0", () => {
  assert.equal(compact(AGENT_LOG, 0).text, AGENT_LOG);
});

await t("compress hits roughly the requested ratio", async () => {
  const r = await compress(AGENT_LOG, { ratio: 0.4, query: "refactor auth to SessionStore" });
  assert.ok(r.receipt.tokensOut < r.receipt.tokensIn, "no compression happened");
  assert.ok(r.receipt.ratio <= 0.55, "ratio overshot: " + r.receipt.ratio);
  console.log(
    `        ${r.receipt.tokensIn} -> ${r.receipt.tokensOut} tokens ` +
      `(${(r.receipt.ratio * 100).toFixed(0)}%), confidence ${r.receipt.confidence}`,
  );
});

await t("code blocks survive compression byte-identical", async () => {
  const r = await compress(AGENT_LOG, { ratio: 0.6, query: "SessionStore redis get" });
  assert.ok(r.output.includes("async get(id: string)"), "code body was altered:\n" + r.output);
});

await t("triplicated tool output is folded", async () => {
  const r = await compress(AGENT_LOG, { ratio: 0.9 });
  const hits = (r.output.match(/Reading file src\/auth\/legacy\.ts/g) || []).length;
  assert.ok(hits <= 1, "duplicate reads survived: " + hits);
});

await t("pins are never dropped even at a brutal ratio", async () => {
  const r = await compress(AGENT_LOG, { ratio: 0.05, pin: ["ERROR:"] });
  assert.ok(r.output.includes("ERROR:"), "pinned block was dropped:\n" + r.output);
});

await t("digest is deterministic and config-sensitive", async () => {
  const a = await compress(AGENT_LOG, { ratio: 0.4 });
  const b = await compress(AGENT_LOG, { ratio: 0.4 });
  const c = await compress(AGENT_LOG, { ratio: 0.41 });
  assert.equal(a.receipt.digest, b.receipt.digest, "same input produced different digests");
  assert.notEqual(a.receipt.digest, c.receipt.digest, "config change did not move the digest");
  assert.match(a.receipt.digest, /^[0-9a-f]{64}$/);
});

await t("router escalates when salience is gutted", () => {
  assert.ok(gate(0.95, 0.5, 8, 10) > 0.55, "healthy run should not escalate");
  assert.ok(gate(0.2, 0.05, 1, 40) < 0.55, "gutted run should escalate");
});

await t("empty input does not throw", async () => {
  const r = await compress("");
  assert.equal(r.output, "");
  assert.equal(r.receipt.tokensIn, 0);
});

await t("savings accounting is internally consistent", async () => {
  const r = await compress(AGENT_LOG, { ratio: 0.3 });
  assert.equal(r.receipt.tokensSaved, r.receipt.tokensIn - r.receipt.tokensOut);
  const expectWh = r.receipt.tokensSaved * 0.0003;
  assert.ok(Math.abs(r.receipt.wattHoursSaved - expectWh) < 1e-6);
});

/**
 * The digest published in PROOF.md and written to Solana devnet on 5 August
 * 2026, in transactions 4khmn679… and 2jNCWyHH….
 *
 * This is the only test here that guards a claim made outside the repository.
 * The argument on the site is that a number on a public chain can be
 * regenerated from open-source code by anyone who doubts it, and that argument
 * dies quietly the first time a change to the scorer moves the output for this
 * fixture. Nothing else would notice: every other test asserts a property, and
 * a pipeline that selects different blocks still satisfies all of them.
 *
 * If this fails, the on-chain records are stale rather than wrong. Either the
 * change is unintended and should be reverted, or it is intended and the proof
 * must be re-run and PROOF.md updated before the claim is made again.
 */
await t("published on-chain digest still reproduces", async () => {
  const input = `# Deployment runbook
The service is deployed from the main branch. The service is deployed from the main branch.
\`\`\`ts
export function retry(fn: () => Promise<void>, times = 3) { /* keep */ }
\`\`\`
2026-08-05T10:00:01Z INFO worker started
2026-08-05T10:00:02Z INFO worker started
2026-08-05T10:00:03Z INFO worker started
In order to be able to roll back, it is necessary that you should retain the previous build artifact.
`;
  const { receipt } = await compress(input, { budget: 120, query: "rollback deploy" });
  assert.equal(
    receipt.digest,
    "191f39d9f7537c56dad2b7d46e5a42a4520d4427a8861f270e14512aa57c6d9a",
    "digest no longer matches the one published on devnet — see PROOF.md",
  );
  assert.equal(receipt.tokensIn, 150);
  assert.equal(receipt.tokensOut, 65);
});

/**
 * Feedback must not promote a block on the strength of vocabulary it supplied
 * itself.
 *
 * The second scoring pass recruits terms from the best blocks of the first. On
 * a long document that is harmless, and eight long fixtures in the evaluation
 * harness never caught what happens on a short one: a paragraph sharing a
 * single ordinary word with the question gets into the feedback pool, has its
 * own terms recruited, and is then re-scored using them. Here that put a
 * paragraph about billing dates above the paragraph stating the refund window.
 */
await t("feedback does not promote a weak match over the answer", async () => {
  const doc = `# Billing policy

Monthly plans bill on the calendar day of signup. Failed charges retry three times over six days before the account is suspended.

## Refunds

Annual plans carry a 30 day refund window from the date of purchase. After that the term runs to completion. Monthly plans are not refundable but can be cancelled at any time.

## Invoices

Invoices are issued as PDFs and mailed to the billing contact on file.`;

  const { blocks } = await compress(doc, {
    ratio: 0.55,
    query: "what is the refund window for annual plans",
  });
  const live = blocks.filter((b) => b.duplicateOf === undefined && b.kind !== "heading");
  const answer = live.find((b) => b.text.includes("30 day refund window"));
  const distractor = live.find((b) => b.text.startsWith("Monthly plans bill"));

  assert.ok(answer && distractor, "fixture no longer segments as expected");
  assert.ok(
    answer.score > distractor.score,
    `answer block scored ${answer.score.toFixed(3)}, distractor ${distractor.score.toFixed(3)}`,
  );
});

/**
 * The gate has to be about the question, not about the setting it was given.
 *
 * Confidence used to be assembled from retained salience, achieved ratio and
 * surviving block count. All three fall as the budget tightens whether or not
 * the answer survived, so the gate ended up reporting the ratio back to the
 * caller: it warned on 34 of 37 healthy runs in the harness, which is the same
 * as having no gate at all.
 */
await t("gate is led by query coverage, not by ratio", async () => {
  const withQuery = await compress(AGENT_LOG, { ratio: 0.4, query: "session store migration" });
  assert.ok(
    withQuery.receipt.queryCoverage !== null,
    "a query was supplied, so coverage should be measured",
  );

  const noQuery = await compress(AGENT_LOG, { ratio: 0.4 });
  assert.equal(
    noQuery.receipt.queryCoverage,
    null,
    "no query means no coverage evidence, which is not the same as perfect coverage",
  );

  // Absent coverage must fall back to the shape-only reasoning rather than
  // treating the missing signal as a perfect score, which would make an
  // untargeted compression incapable of ever escalating.
  assert.ok(gate(0.2, 0.05, 1, 40, null) < 0.55, "gutted run with no query should escalate");
  assert.ok(gate(0.95, 0.5, 8, 10, 0.95) > 0.55, "healthy run with good coverage should not");
  assert.ok(gate(0.95, 0.5, 8, 10, 0.2) < 0.55, "losing the question's terms should escalate");
});

/**
 * Line-oriented material has to segment into records, not into one lump.
 *
 * Blank-line paragraphs were the only unit segmentation knew, so a log tail or
 * an incident timeline — one line per event, no blank lines anywhere — arrived
 * as a single block. A single block is atomic to every stage after it: scored
 * as one lump, admitted or evicted as one lump. A seventeen-line timeline came
 * through at 224 tokens against a 111-token budget, could not fit at any price,
 * and was dropped whole while the budget went to a shorter paragraph of
 * unrelated follow-ups.
 *
 * The two assertions pull in opposite directions on purpose. Splitting is the
 * fix; splitting an ordinary hard-wrapped paragraph would be a worse bug than
 * the one being fixed, so the second holds that line.
 */
await t("line-oriented runs segment per record, prose does not", () => {
  const timeline = TIMELINE_FIXTURE;

  const records = segment(timeline);
  assert.equal(records.length, 4, "expected one block per timestamped event");
  assert.ok(
    records[1].text.includes("node pool"),
    "a wrapped continuation must stay with the record above it: " + records[1].text,
  );

  // A hard-wrapped paragraph is one thought and must survive as one block, even
  // though one of its lines opens with something a looser rule would read as a
  // marker.
  assert.equal(segment(PROSE_FIXTURE).length, 1, "hard-wrapped prose was fractured");
});


/**
 * The invariant that matters most, and it was missing.
 *
 * The allocator skipped any block that would overrun the budget, which is right
 * while another block can still be chosen and destroys the document when none
 * can. One paragraph is one block, and a 69-token paragraph against a 62-token
 * budget matched no branch at all — so short pasted text came back as an empty
 * string at every ratio, 90 percent included, because the budget scales with
 * the very input that is overrunning it.
 *
 * The failure was invisible from outside. The model answered "not in the
 * reference material", which was true of the empty context it had been handed,
 * and read as the model refusing rather than the compressor deleting.
 */
await t("a non-empty input never compresses to nothing", async () => {
  const one =
    "Postmortem: the read timeout on the shared HTTP client was raised from 8s to 90s " +
    "in release v412. Every downstream call now holds a connection for up to 90 seconds " +
    "instead of failing fast. The pool exhausted at 14:02 and POST /checkout began returning 502.";

  // Generous to brutal. The 0.9 case is the one that regressed hardest: a caller
  // asking to keep nine tenths of a paragraph was given none of it.
  for (const ratio of [0.9, 0.6, 0.4, 0.15, 0.05]) {
    const { output, receipt } = await compress(one, { ratio, query: "what caused the incident" });
    assert.ok(output.trim().length > 0, `ratio ${ratio} returned an empty context`);
    assert.ok(receipt.tokensOut > 0, `ratio ${ratio} reported zero tokens out`);
    assert.ok(
      /timeout|90 seconds|v412/.test(output),
      `ratio ${ratio} kept text but dropped the substance: ${output}`,
    );
  }

  // A budget below any single block states the same situation directly.
  const { output } = await compress(one, { budget: 5, query: "what caused the incident" });
  assert.ok(output.trim().length > 0, "an impossible budget returned an empty context");
});

console.log(`\n${pass} passed`);
