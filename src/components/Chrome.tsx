import Link from "next/link";
import { Wordmark } from "./Mark";

const NAV = [
  { href: "/playground", label: "Playground" },
  { href: "/method", label: "Method" },
  { href: "/verify", label: "Verify" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-[var(--fg)]">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-[13.5px] text-[var(--muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--fg)_5%,transparent)] hover:text-[var(--fg)]"
            >
              {n.label}
            </Link>
          ))}
          <a
            href="https://github.com/VincentiusBryanKwandou/kernly"
            target="_blank"
            rel="noreferrer"
            className="ml-2 rounded-md border border-[var(--line)] px-3 py-1.5 text-[13.5px] transition-colors hover:border-[var(--husk)]"
          >
            Source
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-[13px] text-[var(--muted)]">
        <span>MIT licensed. The algorithm is the product, and it is open.</span>
        <span>Attestations run on Solana devnet.</span>
      </div>
    </footer>
  );
}
