import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import { Playground } from "@/components/Playground";
import { PageIntro } from "@/components/PageIntro";
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
        <PageIntro title="page.playground.title" lede="page.playground.lede" />
        <div className="mt-8">
          <Playground />
        </div>
      </main>
      <Footer />
    </SolanaProviders>
  );
}
