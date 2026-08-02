import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kernly.vercel.app"),
  title: {
    default: "Kernly — keep the kernel, drop the chaff",
    template: "%s · Kernly",
  },
  description:
    "A deterministic context compressor for LLM agents. Cuts prompt tokens without a GPU, tells you when not to trust the result, and anchors every saving on Solana so the number is checkable rather than claimed.",
  keywords: [
    "prompt compression",
    "context compression",
    "LLM efficiency",
    "green AI",
    "token reduction",
    "Solana",
    "verifiable savings",
  ],
  openGraph: {
    title: "Kernly — keep the kernel, drop the chaff",
    description:
      "Deterministic context compression for LLM agents, with savings anchored on Solana.",
    url: "https://kernly.vercel.app",
    siteName: "Kernly",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
