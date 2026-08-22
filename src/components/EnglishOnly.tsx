"use client";

import { useI18n } from "./I18n";

/**
 * Shown at the top of the Method page in every language except English.
 *
 * The alternative was to machine-translate a four-thousand-word argument about
 * BM25 length normalisation into eighteen languages and let it stand
 * unreviewed. A page that explains exactly why it does not trust its own
 * confidence score should not then publish, in nineteen languages, prose nobody
 * has checked.
 */
export function EnglishOnlyNote() {
  const { locale, t } = useI18n();
  if (locale === "en") return null;

  return (
    <p className="mt-6 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[13.5px] leading-[1.6] text-[var(--muted)]">
      {t("method.englishOnly")}
    </p>
  );
}
