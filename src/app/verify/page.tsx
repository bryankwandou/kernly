import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import { Verifier } from "@/components/Verifier";
import { PageIntro } from "@/components/PageIntro";
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
        <PageIntro title="page.verify.title" lede="page.verify.lede" wide />
        <div className="mt-8">
          <Verifier />
        </div>
      </main>
      <Footer />
    </SolanaProviders>
  );
}
