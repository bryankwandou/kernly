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

console.log(`\n${pass} passed`);
