import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import { Playground } from "@/components/Playground";
import { SolanaProviders } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Compress a real context in the browser, inspect every stage, and anchor the receipt on Solana devnet.",
};

export default function PlaygroundPage() {
  return (
    <SolanaProviders>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <h1 className="text-[clamp(1.8rem,3.6vw,2.4rem)] font-semibold tracking-[-0.03em]">
          Playground
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-[1.6] text-[var(--muted)]">
          Everything below runs locally. The text never leaves the tab, no
          request is made to any model, and the timing in the receipt is the
          real cost of the pipeline on this device.
        </p>
        <div className="mt-8">
          <Playground />
        </div>
      </main>
      <Footer />
    </SolanaProviders>
  );
}
