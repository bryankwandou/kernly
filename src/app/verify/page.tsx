import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import { Verifier } from "@/components/Verifier";
import { SolanaProviders } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Verify",
  description:
    "Recompute a Kernly receipt from the original input and check it against the digest recorded on Solana devnet.",
};

export default function VerifyPage() {
  return (
    <SolanaProviders>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="text-[clamp(1.8rem,3.6vw,2.4rem)] font-semibold tracking-[-0.03em]">
          Verify a receipt
        </h1>
        <p className="mt-2 text-[15px] leading-[1.65] text-[var(--muted)]">
          Paste a devnet transaction signature and the original context. This
          page fetches the attestation off the chain, re-runs the pipeline
          locally, and compares the two digests. If they match, the savings
          claim held; if they do not, something was changed after the fact.
          No Kernly server is involved in either half of that check.
        </p>
        <div className="mt-8">
          <Verifier />
        </div>
      </main>
      <Footer />
    </SolanaProviders>
  );
}
