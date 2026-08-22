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
          to read. This page makes the point the only way that counts: your
          question goes to the same model twice, once with the whole document
          and once with the compressed version, and both replies land here side
          by side. Pick one of the open-weights models if you want to verify
          that for yourself — those you can download and run, so there is
          nowhere for a hidden answer to come from.
        </p>
        <div className="mt-8">
          <Chat />
        </div>
      </main>
      <Footer />
    </>
  );
}
