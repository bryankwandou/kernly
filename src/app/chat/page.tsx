import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import { Chat } from "@/components/Chat";
import { PageIntro } from "@/components/PageIntro";

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
        <PageIntro title="page.chat.title" lede="page.chat.lede" />
        <div className="mt-8">
          <Chat />
        </div>
      </main>
      <Footer />
    </>
  );
}
