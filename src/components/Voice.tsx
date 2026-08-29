"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "./I18n";

/**
 * Dictation for the question box.
 *
 * Typing is not a neutral requirement. This was asked for by someone testing
 * the page with both hands in casts, and it is the ordinary case for anyone
 * working one-handed, on a phone, or with a tremor. The whole page is two text
 * fields and a slider, so the field being unreachable makes the rest of it
 * unreachable too.
 *
 * Built on the browser's own SpeechRecognition. That means no dependency, no
 * audio leaving the page through us, and no key to run out — the recognition
 * happens wherever the browser does it, on the same terms as every other site
 * the reader dictates into. It also means the support is uneven: Chrome and
 * Edge have it, Firefox does not. So the control is absent rather than broken
 * where it cannot work, because a dead microphone button is worse than none.
 *
 * Interim results are shown as they arrive. Dictation that displays nothing
 * until the speaker stops feels broken for the first few seconds, and the
 * people most likely to need this are the least able to recover from thinking
 * it failed and starting over.
 */

/** The narrow slice of the API this uses, since TypeScript's DOM lib omits it. */
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal: boolean }
  >;
};

type Ctor = new () => SpeechRecognitionLike;

function ctor(): Ctor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: Ctor;
    webkitSpeechRecognition?: Ctor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * The recogniser wants a BCP-47 tag; the picker holds a two-letter code.
 *
 * Getting this wrong is not cosmetic — a recogniser set to en-US transcribes
 * Indonesian into English-sounding nonsense rather than failing, so the speaker
 * sees a wrong sentence and no error. The regional choices below are the
 * largest speaker population for each language, which is the best guess
 * available from a language code alone.
 */
const SPEECH_TAG: Record<string, string> = {
  en: "en-US",
  id: "id-ID",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
  ru: "ru-RU",
  uk: "uk-UA",
  tr: "tr-TR",
  vi: "vi-VN",
  th: "th-TH",
  hi: "hi-IN",
  ar: "ar-SA",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
};

export function VoiceInput({
  onTranscript,
  disabled,
}: {
  /** Called with the text so far. Replaces what dictation added, not the field. */
  onTranscript: (text: string, final: boolean) => void;
  disabled?: boolean;
}) {
  const { locale, t } = useI18n();
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const ref = useRef<SpeechRecognitionLike | null>(null);

  // Support is checked in an effect rather than at render, because the server
  // has no window and a first render that disagrees with it is a hydration
  // mismatch. The button appears a moment after the page does.
  useEffect(() => {
    setSupported(ctor() !== null);
    return () => ref.current?.abort();
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const C = ctor();
    if (!C) return;
    setProblem(null);

    const rec = new C();
    rec.lang = SPEECH_TAG[locale] ?? "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    // Only the results from this event onward are new. Replaying the whole
    // list on every event would repeat every sentence already spoken.
    rec.onresult = (e) => {
      let text = "";
      let final = false;
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        text += r[0]?.transcript ?? "";
        if (r.isFinal) final = true;
      }
      if (text) onTranscript(text, final);
    };

    rec.onerror = (e) => {
      // "no-speech" and "aborted" are what happens when someone opens the mic
      // and thinks; neither is worth a message. A denied permission is, because
      // nothing will work until the reader changes it and the browser will not
      // ask twice.
      const code = e.error ?? "";
      if (code === "not-allowed" || code === "service-not-allowed") {
        setProblem(t("chat.voice.denied"));
      } else if (code !== "no-speech" && code !== "aborted") {
        setProblem(t("chat.voice.failed"));
      }
      setListening(false);
    };

    rec.onend = () => setListening(false);

    ref.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      // start() throws if called while already running. Nothing to report.
    }
  }, [locale, onTranscript, t]);

  if (!supported) return null;

  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={listening ? stop : start}
        disabled={disabled}
        aria-pressed={listening}
        title={problem ?? (listening ? t("chat.voice.stop") : t("chat.voice.start"))}
        className={
          "flex h-[38px] w-[38px] items-center justify-center rounded-lg border transition-colors disabled:opacity-35 " +
          (listening
            ? "border-[var(--signal)] bg-[color-mix(in_oklab,var(--signal)_14%,transparent)] text-[var(--signal)]"
            : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]")
        }
      >
        {listening ? (
          // A square, because a listening microphone needs a stop control and a
          // microphone that means "stop" reads as "start" at a glance.
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
            <rect x="4" y="4" width="8" height="8" rx="1.4" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <rect
              x="6"
              y="1.8"
              width="4"
              height="7.4"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M3.6 7.4a4.4 4.4 0 0 0 8.8 0M8 11.8v2.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        )}
        <span className="sr-only">
          {listening ? t("chat.voice.stop") : t("chat.voice.start")}
        </span>
      </button>
    </div>
  );
}
