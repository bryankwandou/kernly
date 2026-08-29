/**
 * Watch for the failure that would flatter this page.
 *
 * Both columns send the same question to the same model. Only the reference
 * material differs, so the page's whole claim is that any gap between the
 * answers is the compression and nothing else. That claim has an asymmetric
 * risk attached to it: if the uncompressed column refuses more often than the
 * compressed one, the compressed side looks superior for a reason that has
 * nothing to do with retrieval — less irrelevant text to anchor on — and the
 * demonstration quietly starts arguing for itself.
 *
 * A screenshot showed exactly that once. Qwen, asked a question the material
 * did not cover, declined with the full 1,972-token context and answered fully
 * with the 602-token compressed one. Eleven attempts failed to reproduce it and
 * a broader sweep found no asymmetry at all, so it was variance rather than a
 * defect. But "I saw it once and could not make it happen again" is the reason
 * to build a detector, not the reason to drop it: the next prompt change could
 * make it systematic, and nobody would notice until someone happened to be
 * looking at the right screen.
 *
 * The questions are deliberately off-document. On a question the material
 * answers, both columns should differ — that is the compression working. This
 * measures the case where the material is irrelevant to both, where the two
 * columns have no honest reason to diverge at all.
 *
 *   npm run check:symmetry
 */
const BASE = process.env.KERNLY_BASE ?? "https://kernly.vercel.app";
const ROUNDS = Number(process.env.KERNLY_ROUNDS ?? 2);

const CONTEXT =
  "Postmortem: the read timeout on the shared HTTP client was raised from 8s to 90s in " +
  "release v412. The connection pool exhausted at 14:02 and POST /checkout began returning " +
  "502. The on-call engineer rolled back at 14:31.";

const MODELS = [
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "openai/gpt-oss-120b",
  "gemini-flash-lite-latest",
];

// Ordinary questions with no relation to the material, each with a word that a
// real answer is very unlikely to omit.
const QUESTIONS = [
  { q: "sebutkan beberapa merek mobil listrik yang terkenal", answered: /tesla|byd|hyundai|wuling|nissan|bmw/i },
  { q: "apa saja gejala awal diabetes tipe 2", answered: /haus|buang air|lelah|berat badan|pandangan/i },
  { q: "sungai terpanjang di dunia itu apa", answered: /nil|nile|amazon/i },
  { q: "bagaimana cara kerja mesin diesel", answered: /kompresi|bahan bakar|udara|panas/i },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ask(question, mode, model) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, context: CONTEXT, mode, ratio: 0.05, model, locale: "id" }),
  });
  const json = await res.json().catch(() => null);
  if (!json || json.error) return null;
  return (json.answer ?? "").replace("[Not in the reference material.]", "").trim();
}

let fullRefused = 0;
let kernRefused = 0;
let compared = 0;
const divergences = [];

for (const model of MODELS) {
  process.stdout.write(`\n${model}\n`);
  for (const { q, answered } of QUESTIONS) {
    for (let round = 0; round < ROUNDS; round += 1) {
      const full = await ask(q, "full", model);
      await sleep(2500);
      const kern = await ask(q, "kernly", model);
      await sleep(2500);
      if (full === null || kern === null) continue;

      const fullOk = answered.test(full);
      const kernOk = answered.test(kern);
      compared += 1;
      if (!fullOk) fullRefused += 1;
      if (!kernOk) kernRefused += 1;
      if (fullOk !== kernOk) {
        divergences.push({ model, q, refused: fullOk ? "compressed" : "uncompressed" });
      }
      process.stdout.write(`  ${fullOk ? "." : "F"}${kernOk ? "." : "K"}`);
    }
  }
}

process.stdout.write(`\n\n${compared} paired asks. `);
process.stdout.write(`uncompressed declined ${fullRefused}, compressed declined ${kernRefused}.\n`);

if (divergences.length === 0) {
  process.stdout.write("No divergence. The columns agree on every off-document question.\n");
} else {
  for (const d of divergences) {
    process.stdout.write(`  ${d.refused} side declined: ${d.model} — ${d.q}\n`);
  }
}

// Only one direction is a problem. The compressed column declining more often
// is the compressor losing something, which the page already reports and which
// is honest. The uncompressed column declining more often has no honest reading:
// it makes compression look like an improvement in the model's willingness to
// answer, which it is not.
const flattering = fullRefused - kernRefused;
if (flattering > Math.max(1, compared * 0.1)) {
  process.stdout.write(
    `\nFLATTERING ASYMMETRY: the uncompressed column declined ${flattering} more times than the ` +
      `compressed one. That gap makes the compressor look better for a reason unrelated to ` +
      `retrieval, and it needs explaining before this page is shown to anyone.\n`,
  );
  process.exit(1);
}
process.stdout.write("\nNo flattering asymmetry.\n");
