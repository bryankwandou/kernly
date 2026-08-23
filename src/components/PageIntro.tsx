"use client";

import { useI18n } from "./I18n";
import type { Key } from "@/lib/i18n";

/**
 * The heading and standfirst of a tool page.
 *
 * These three pages are server components so they can export `metadata`, and a
 * server component cannot read the language the visitor picked in the browser.
 * Rather than convert the pages to client components — which would cost the
 * metadata export and the static render for the sake of two paragraphs — the
 * two translated paragraphs are lifted into this island.
 *
 * The `<title>` and description in `metadata` stay English. They are what a
 * crawler and a link preview read, and both are per-URL facts a client-side
 * language switch cannot change no matter where the strings live.
 */
export function PageIntro({
  title,
  lede,
  wide,
}: {
  title: Key;
  lede: Key;
  wide?: boolean;
}) {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-[clamp(1.8rem,3.6vw,2.4rem)] font-semibold tracking-[-0.03em]">
        {t(title)}
      </h1>
      <p
        className={`mt-2 text-[15px] leading-[1.65] text-[var(--muted)] ${
          wide ? "" : "max-w-2xl"
        }`}
      >
        {t(lede)}
      </p>
    </>
  );
}
