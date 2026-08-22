"use client";

import Link from "next/link";
import { Wordmark } from "./Mark";
import { ThemeToggle } from "./Theme";
import { LanguagePicker, useI18n } from "./I18n";
import type { Key } from "@/lib/i18n";

const NAV: { href: string; key: Key }[] = [
  { href: "/playground", key: "nav.playground" },
  { href: "/chat", key: "nav.chat" },
  { href: "/method", key: "nav.method" },
  { href: "/verify", key: "nav.verify" },
];

export function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <Link href="/" className="shrink-0 text-[var(--fg)]">
          <Wordmark />
        </Link>

        {/* The nav scrolls sideways below the fold of a narrow screen rather
            than collapsing into a hamburger. Four destinations do not earn a
            menu, and hiding them behind one costs a tap on the devices where
            taps are dearest. */}
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="shrink-0 rounded-md px-3 py-1.5 text-[13.5px] text-[var(--muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--fg)_5%,transparent)] hover:text-[var(--fg)]"
            >
              {t(n.key)}
            </Link>
          ))}
          <a
            href="https://github.com/bryankwandou/kernly"
            target="_blank"
            rel="noreferrer"
            className="ml-1 shrink-0 rounded-md border border-[var(--line)] px-3 py-1.5 text-[13.5px] transition-colors hover:border-[var(--husk)]"
          >
            {t("nav.source")}
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguagePicker />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-24 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-[13px] text-[var(--muted)]">
        <span>{t("footer.licence")}</span>
        <span>{t("footer.chain")}</span>
      </div>
    </footer>
  );
}
