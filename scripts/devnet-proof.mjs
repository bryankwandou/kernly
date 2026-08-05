/**
 * End-to-end devnet proof.
 *
 * Runs the whole claim in one pass with no browser and no trust in this repo:
 * compress a fixture, write the receipt digest to Solana devnet through the SPL
 * Memo program, read the record back off the chain, recompute the digest
 * locally, and compare. If the last two lines print true, the on-chain number
 * was produced by the published algorithm and nothing else.
 *
 *   KERNLY_SIGNER=<base58 secret key> node scripts/devnet-proof.mjs
 */
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { compress } from "@kernly/core";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const RPC = process.env.KERNLY_RPC || "https://api.devnet.solana.com";

const secret = process.env.KERNLY_SIGNER;
if (!secret) {
  console.error("Set KERNLY_SIGNER to a base58 devnet secret key before running.");
  process.exit(1);
}

const signer = Keypair.fromSecretKey(bs58.decode(secret));
const connection = new Connection(RPC, "confirmed");

const balance = await connection.getBalance(signer.publicKey);
console.log("signer          :", signer.publicKey.toBase58());
console.log("balance lamports:", balance);
if (balance < 10_000) {
  console.error("Not enough devnet SOL. Fund the address at https://faucet.solana.com");
  process.exit(2);
}

// A fixture that exercises every stage: repeated prose, a fenced code block that
// must survive untouched, three near-identical log lines, and one padded
// sentence that lexical compaction should tighten.
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
const config = { budget: 120, query: "rollback deploy" };

const { receipt } = await compress(input, config);
console.log("tokens in/out   :", receipt.tokensIn, "->", receipt.tokensOut);
console.log("digest          :", receipt.digest);

const attestation = {
  v: "kernly.v1",
  d: receipt.digest,
  i: receipt.tokensIn,
  o: receipt.tokensOut,
  g: Number(receipt.gramsCo2eSaved.toFixed(4)),
  t: Math.floor(Date.now() / 1000),
};

const instruction = new TransactionInstruction({
  keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: false }],
  programId: MEMO_PROGRAM_ID,
  data: Buffer.from(JSON.stringify(attestation), "utf8"),
});

const signature = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(instruction),
  [signer],
  { commitment: "confirmed" },
);
console.log("signature       :", signature);
console.log("explorer        :", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

// Confirmed does not guarantee the transaction is queryable on the very next
// call, so give the RPC a moment before reading it back.
await new Promise((resolve) => setTimeout(resolve, 4000));

const tx = await connection.getTransaction(signature, {
  maxSupportedTransactionVersion: 0,
  commitment: "confirmed",
});

let onchain = null;
for (const line of tx?.meta?.logMessages || []) {
  const match = line.match(/Program log: Memo \(len \d+\): "(.*)"$/);
  if (!match) continue;
  try {
    const parsed = JSON.parse(match[1].replace(/\\"/g, '"'));
    if (parsed?.v === "kernly.v1") onchain = parsed;
  } catch {
    // Another program's memo in the same transaction is not a failure.
  }
}
console.log("read back       :", JSON.stringify(onchain));

const { receipt: recomputed } = await compress(input, config);
const digestMatches = onchain?.d === recomputed.digest;
const countersMatch = onchain?.i === recomputed.tokensIn && onchain?.o === recomputed.tokensOut;
console.log("digest matches  :", digestMatches);
console.log("counters match  :", countersMatch);

process.exit(digestMatches && countersMatch ? 0 : 1);
