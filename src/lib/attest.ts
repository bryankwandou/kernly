import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import type { Receipt } from "@kernly/core";

/**
 * On-chain attestation of a compression receipt.
 *
 * Kernly writes one thing to Solana and one thing only: the digest of a
 * compression run plus the counters that back it. That is enough for anybody to
 * re-run the open-source pipeline against the same input and config and confirm
 * the numbers, and it is small enough that anchoring a receipt costs a fraction
 * of a cent.
 *
 * The devnet MVP uses the SPL Memo program rather than a bespoke Anchor program
 * so that the flow is genuinely live today with no deployment step. Memo is
 * deployed on every Solana cluster, the payload lands in the transaction log,
 * and any explorer will render it. The richer registry version — cumulative
 * per-signer totals in a PDA, filter authorship, staking — lives in
 * `programs/kernly-attest` and is the natural next step; it changes where the
 * data is stored, not what is claimed.
 */

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

export const DEVNET_RPC = "https://api.devnet.solana.com";

/** Schema version so a future indexer can tell record shapes apart. */
export const ATTESTATION_VERSION = "kernly.v1";

export interface Attestation {
  v: typeof ATTESTATION_VERSION;
  /** sha256 receipt digest, the only field that has to be trusted. */
  d: string;
  /** Tokens in. */
  i: number;
  /** Tokens out. */
  o: number;
  /** Grams CO2e avoided, rounded — a derived estimate, not a measurement. */
  g: number;
  /** Unix seconds, client-supplied and therefore advisory only. */
  t: number;
}

export function toAttestation(receipt: Receipt): Attestation {
  return {
    v: ATTESTATION_VERSION,
    d: receipt.digest,
    i: receipt.tokensIn,
    o: receipt.tokensOut,
    g: Number(receipt.gramsCo2eSaved.toFixed(4)),
    t: Math.floor(Date.now() / 1000),
  };
}

export function buildAttestInstruction(
  signer: PublicKey,
  attestation: Attestation,
): TransactionInstruction {
  return new TransactionInstruction({
    // Memo treats a signer key as an attributed author, which is what makes the
    // record say "this wallet claims these savings" rather than "someone did".
    keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(JSON.stringify(attestation), "utf8"),
  });
}

export async function buildAttestTransaction(
  connection: Connection,
  signer: PublicKey,
  attestation: Attestation,
): Promise<Transaction> {
  const tx = new Transaction().add(buildAttestInstruction(signer, attestation));
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = signer;
  return tx;
}

export function explorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

/**
 * Read an attestation back off the chain.
 *
 * Verification is deliberately client-side and permissionless: fetch the
 * transaction, pull the memo out of the logs, and compare its digest against a
 * locally recomputed one. No Kernly server sits in the middle, which is the
 * entire point of putting it on chain in the first place.
 */
export async function fetchAttestation(
  connection: Connection,
  signature: string,
): Promise<Attestation | null> {
  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  if (!tx) return null;

  const logs = tx.meta?.logMessages || [];
  for (const line of logs) {
    const match = line.match(/Program log: Memo \(len \d+\): "(.*)"$/);
    if (!match) continue;
    try {
      const parsed = JSON.parse(match[1].replace(/\\"/g, '"'));
      if (parsed?.v === ATTESTATION_VERSION) return parsed as Attestation;
    } catch {
      // A non-Kernly memo in the same transaction is not an error.
    }
  }
  return null;
}
