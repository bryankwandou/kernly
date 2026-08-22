import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import { Chat } from "@/components/Chat";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Ask a question twice — once against the full context, once against the context Kernly compressed — and compare the two answers and the two bills.",
};

export default function ChatPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <h1 className="text-[clamp(1.8rem,3.6vw,2.4rem)] font-semibold tracking-[-0.03em]">
          Chat
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-[1.6] text-[var(--muted)]">
          Kernly is not a model. It is the layer that decides what a model gets
          to read. This page proves the point the only way that counts: the same
          question goes to the same open-weights model twice, once with the whole
          context and once with the compressed version, and both replies land
          here for you to compare.
        </p>
        <div className="mt-8">
          <Chat />
        </div>
      </main>
      <Footer />
    </>
  );
}
