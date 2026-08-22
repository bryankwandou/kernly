import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { THEME_SCRIPT } from "@/components/Theme";
import { I18nProvider } from "@/components/I18n";

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
    template: "%s Â· Kernly",
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
    // `lang` is a starting value, not the final one: I18nProvider negotiates the
    // visitor's language on mount and rewrites this attribute along with `dir`.
    // It has to be here for the server render, and it has to be allowed to
    // change afterwards.
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Applies the stored colour scheme before first paint. Without it a
            reader on dark gets a white flash on every navigation. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
