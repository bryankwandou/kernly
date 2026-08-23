"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { compress, estimate } from "@kernly/core";
import { SAMPLES } from "@/lib/samples";
import { useI18n } from "./I18n";

/**
 * The side-by-side chat.
 *
 * Every question is sent twice: once with the raw context, once with the
 * context Kernly compressed. Both answers are shown, and either one is allowed
 * to look worse. A compression demo that only ever displays the compressed
 * result is asking to be taken on faith, and this one should not need to be.
 */

/**
 * Grouped by whether the weights are published, because that distinction is the
 * whole reason both groups are here. The open ones let a sceptic download the
 * model and confirm Kernly is not secretly doing the answering; the closed one
 * is what most people actually deploy against, and a compression layer that
 * only worked in front of inspectable models would be a much narrower tool.
 */
interface ModelChoice {
  key: string;
  label: string;
  /** Prompt tokens this key can push in a minute, null where it is not a limit worth warning about. */
  ceiling: number | null;
}

const MODEL_GROUPS: { label: string; models: ModelChoice[] }[] = [
  {
    label: "Open weights — downloadable, via Groq",
    models: [
      { key: "openai/gpt-oss-20b", label: "GPT-OSS 20B", ceiling: 8000 },
      { key: "qwen/qwen3.6-27b", label: "Qwen 3.6 27B", ceiling: 8000 },
      { key: "openai/gpt-oss-120b", label: "GPT-OSS 120B", ceiling: 8000 },
    ],
  },
  {
    label: "Closed weights — via Google",
    models: [
      { key: "gemini-flash-latest", label: "Gemini Flash", ceiling: null },
      { key: "gemini-flash-lite-latest", label: "Gemini Flash Lite", ceiling: null },
    ],
  },
];

const ALL_MODELS = MODEL_GROUPS.flatMap((g) => g.models);

type Reply = {
  answer: string;
  escalate: boolean;
  receipt: {
    tokensIn: number;
    tokensOut: number;
    digest: string;
    confidence: number;
    queryCoverage: number | null;
    escalate: boolean;
  } | null;
  promptTokens: number | null;
  completionTokens: number | null;
  elapsedMs: number;
};

/**
 * Each side carries its own failure.
 *
 * The first version collapsed both into one `error` and hid both columns when
 * either failed, which threw away the single most convincing thing this page
 * can show. Send a 60,000-character article at a model with an 8,000-token
 * minute budget and the uncompressed request is refused before it is read,
 * while the compressed one goes through and answers. That is not an error to be
 * swept up — it is the entire argument, and it needs to be visible in the column
 * it happened to.
 */
type Turn = {
  id: number;
  question: string;
  full: Reply | null;
  kernly: Reply | null;
  fullError: string | null;
  kernlyError: string | null;
  pending: boolean;
};

async function ask(payload: Record<string, unknown>): Promise<Reply> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return json as Reply;
}

/**
 * Overlap of content words between the two answers, reported as a plain
 * percentage. This is a lexical measure and nothing more — it cannot tell you
 * whether the compressed answer is *correct*, only whether it said roughly the
 * same words. The label in the UI says exactly that, because dressing a word
 * count up as a semantic score would be the dishonest move here.
 */
const STOP = new Set(
  "a an the and or but of to in on for with is are was were be been it its this that as at by from not no if then than so such which who whom what when where how".split(
    " ",
  ),
);

function overlap(a: string, b: string): number | null {
  const words = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s._-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP.has(w)),
    );
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return null;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared += 1;
  return shared / Math.min(A.size, B.size);
}

/**
 * The marker the system prompt asks for when an answer did not come from the
 * supplied material.
 *
 * The model is no longer fenced into the reference document, which makes the
 * page useful for questions the samples never covered and introduces a way for
 * the comparison to mislead: a compressed context that lost the answer, followed
 * by the model smoothly supplying it from memory, reads as a success. Pulling
 * the marker out of the reply and rendering it as a badge is what keeps that
 * visible — it is most interesting precisely when it appears on one column and
 * not the other.
 */
const OUTSIDE = "[Not in the reference material.]";

function split(answer: string): { outside: boolean; body: string } {
  const trimmed = answer.trimStart();
  if (!trimmed.startsWith(OUTSIDE)) return { outside: false, body: answer };

  const body = trimmed.slice(OUTSIDE.length).trimStart();

  // A reply that is nothing but the marker has to keep the marker as its text.
  // Asked about a person it has never heard of, the model answers with the
  // marker and stops, which is a perfectly good answer — and stripping it into a
  // badge left the column reading "No reply", as though the request had failed.
  // It had not. Blanking a real answer is a worse fault than repeating a badge.
  return body ? { outside: true, body } : { outside: false, body: trimmed };
}


/**
 * The largest target ratio whose output still clears a provider's ceiling.
 *
 * Headroom is deliberate. The number compared here is Kernly's own estimate,
 * and the provider counts differently — in practice its count has come in
 * *below* the estimate, but a compressor that squeezes right up to a hard limit
 * and is wrong in the other direction has failed at the one job it was given.
 * Eighty per cent leaves room for the question, the system prompt and the
 * reply, all of which are billed against the same minute.
 *
 * Returns null when even the tightest setting will not fit, rather than
 * pretending a ratio exists. The caller shows the failure instead of a false
 * reassurance.
 */
const FIT_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05];
const FIT_HEADROOM = 0.8;

async function fit(text: string, query: string | undefined, ceiling: number): Promise<number | null> {
  const budget = ceiling * FIT_HEADROOM;
  for (const ratio of FIT_STEPS) {
    const { receipt } = await compress(text, { ratio, query });
    if (receipt.tokensOut <= budget) return ratio;
  }
  return null;
}

export function Chat() {
  const { t, locale } = useI18n();

  // The postmortem opens by default because it is the only sample long enough
  // for the comparison to mean anything. A 70-token transcript compressed to 35
  // percent leaves 25 tokens, and no selection policy rescues that; the demo
  // would be showing the budget running out rather than the compressor working.
  const DEFAULT = SAMPLES.find((s) => s.id === "postmortem") ?? SAMPLES[0];

  const [sampleId, setSampleId] = useState<string>(DEFAULT.id);
  const [context, setContext] = useState(DEFAULT.text);
  const [question, setQuestion] = useState(DEFAULT.query);
  // 40 percent sits inside the band the harness measured as safe. Defaulting
  // lower would make the escalation warning the common case, which is honest
  // about the setting and dishonest about the tool.
  const [ratio, setRatio] = useState(0.4);
  const [model, setModel] = useState(MODEL_GROUPS[0].models[0].key);
  const [showContext, setShowContext] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [switched, setSwitched] = useState<string | null>(null);

  const nextId = useRef(1);

  const pickSample = (id: string) => {
    const s = SAMPLES.find((x) => x.id === id)!;
    setSampleId(id);
    setContext(s.text);
    setQuestion(s.query);
    setSource(null);
    setTurns([]);
  };

  const load = async () => {
    const target = url.trim();
    if (!target || loading) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
      setContext(json.text);
      setSource(json.title || json.url);
      setSampleId("");
      setTurns([]);
      setUrl("");

      // A long page against an 8,000-token minute budget is the case this whole
      // project exists for, so the response is to compress harder rather than to
      // move to a provider with a bigger allowance. Reaching for Gemini here
      // would sidestep the only test that matters: the article is 20,000 tokens,
      // the ceiling is 8,000, and either the compressor closes that gap or the
      // claim is empty.
      //
      // The ratio is searched rather than calculated, because output size is not
      // a smooth function of the target — blocks are admitted whole, so the
      // achieved size steps. Compressing at each candidate is a few milliseconds
      // locally and gives the true figure instead of an extrapolation.
      const ceiling = ALL_MODELS.find((m) => m.key === model)?.ceiling ?? null;
      if (ceiling !== null && estimate(json.text) > ceiling) {
        const fitted = await fit(json.text, question || undefined, ceiling);
        if (fitted) {
          setRatio(fitted);
          setSwitched(`${Math.round(fitted * 100)}%`);
        }
      } else {
        setSwitched(null);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load that page.");
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    const q = question.trim();
    if (!q || busy) return;

    const id = nextId.current++;
    setTurns((t) => [
      ...t,
      { id, question: q, full: null, kernly: null, fullError: null, kernlyError: null, pending: true },
    ]);
    setQuestion("");
    setBusy(true);

    // The interface language rides along, so the answer comes back in the
    // language the reader is already reading the page in.
    const payload = { question: q, context, model, ratio, locale };

    // Both runs go out together. Sequencing them would make the compressed
    // side look faster purely because the provider had warmed up.
    const [full, kern] = await Promise.allSettled([
      ask({ ...payload, mode: "full" }),
      ask({ ...payload, mode: "kernly" }),
    ]);

    setTurns((t) =>
      t.map((turn) =>
        turn.id !== id
          ? turn
          : {
              ...turn,
              pending: false,
              full: full.status === "fulfilled" ? full.value : null,
              kernly: kern.status === "fulfilled" ? kern.value : null,
              fullError:
                full.status === "rejected" ? (full.reason?.message ?? "Request failed") : null,
              kernlyError:
                kern.status === "rejected" ? (kern.reason?.message ?? "Request failed") : null,
            },
      ),
    );
    setBusy(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* ------------------------------------------------------------ controls */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            {t("chat.material")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => pickSample(s.id)}
                className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
                  s.id === sampleId
                    ? "border-[var(--kernel)] bg-[color-mix(in_oklab,var(--kernel)_14%,transparent)] text-[var(--fg)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--husk)] hover:text-[var(--fg)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* The samples are small enough that the compressor never has to make
              an interesting decision on them. This is the way in for material
              that does. */}
          <div className="mt-4 border-t border-[var(--line)] pt-4">
            <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              {t("chat.url.title")}
            </label>
            <div className="mt-2 flex gap-1.5">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void load();
                  }
                }}
                placeholder="en.wikipedia.org/wiki/…"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[var(--kernel)]"
              />
              <button
                onClick={() => void load()}
                disabled={loading || !url.trim()}
                className="shrink-0 rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12.5px] transition-colors hover:border-[var(--husk)] disabled:opacity-35"
              >
                {loading ? t("chat.url.loading") : t("chat.url.load")}
              </button>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--muted)]">
              {t("chat.url.note")}
            </p>
            {loadError && (
              <p className="mt-2 rounded-lg border border-[color-mix(in_oklab,var(--signal)_35%,transparent)] bg-[color-mix(in_oklab,var(--signal)_9%,transparent)] p-2 text-[11.5px] leading-relaxed">
                {loadError}
              </p>
            )}
            {source && (
              <p className="mt-2 truncate text-[11.5px] text-[var(--shoot)]" title={source}>
                {t("chat.url.loaded")} {source}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowContext((v) => !v)}
            className="mt-3 text-[12.5px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--fg)]"
          >
            {showContext ? t("chat.hide") : t("chat.edit")} · {context.length.toLocaleString()}{" "}
            {t("chat.chars")}
          </button>

          {showContext && (
            <textarea
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                setSampleId("");
                setSource(null);
              }}
              spellCheck={false}
              className="mt-3 h-56 w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 font-mono text-[11.5px] leading-[1.6] outline-none focus:border-[var(--kernel)]"
            />
          )}
        </div>

        <div className="space-y-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              {t("chat.model")}
            </span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2.5 py-2 text-[13.5px] outline-none focus:border-[var(--kernel)]"
            >
              {MODEL_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.models.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {switched && (
            <p className="-mt-2 rounded-lg border border-[color-mix(in_oklab,var(--kernel)_40%,transparent)] bg-[color-mix(in_oklab,var(--kernel)_10%,transparent)] p-2.5 text-[11.5px] leading-relaxed">
              {t("chat.fitted.a")} <strong className="tnum font-semibold">{switched}</strong>{" "}
              {t("chat.fitted.b")}
            </p>
          )}

          <label className="block">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                {t("chat.ratio")}
              </span>
              <span className="tnum text-[12.5px]">{Math.round(ratio * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.9}
              step={0.05}
              value={ratio}
              onChange={(e) => setRatio(Number(e.target.value))}
              className="w-full accent-[var(--kernel)]"
            />
          </label>

          <Preview
            context={context}
            question={question}
            ratio={ratio}
            ceiling={ALL_MODELS.find((m) => m.key === model)?.ceiling ?? null}
          />

          <p className="text-[12px] leading-relaxed text-[var(--muted)]">{t("chat.note")}</p>
        </div>
      </aside>

      {/* -------------------------------------------------------------- thread */}
      <div className="min-w-0 space-y-5">
        {turns.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--line)] p-10 text-center">
            <p className="text-[14px] leading-relaxed text-[var(--muted)]">{t("chat.empty")}</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {turns.map((turn) => (
            <motion.div
              key={turn.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="space-y-3"
            >
              <div className="rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] px-4 py-3 text-[14.5px]">
                {turn.question}
              </div>

              {turn.pending ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton title={t("chat.full")} />
                  <Skeleton title={t("chat.compressed")} accent />
                </div>
              ) : (
                <>
                  <Verdict
                    full={turn.full}
                    kern={turn.kernly}
                    fullError={turn.fullError}
                    kern1Ok={!!turn.kernly}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Column title={t("chat.full")} reply={turn.full} error={turn.fullError} />
                    <Column
                      title={t("chat.compressed")}
                      reply={turn.kernly}
                      error={turn.kernlyError}
                      accent
                    />
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* composer */}
        <div className="sticky bottom-4 flex gap-2 rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--panel)_92%,transparent)] p-2 backdrop-blur-md">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={t("chat.placeholder")}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[14.5px] outline-none"
          />
          <button
            onClick={() => void send()}
            disabled={busy || !question.trim()}
            className="h-[38px] shrink-0 rounded-lg bg-[var(--kernel)] px-5 text-[13.5px] font-semibold text-[#1a1205] transition-opacity disabled:opacity-35"
          >
            {busy ? t("chat.asking") : t("chat.ask")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

/**
 * What the slider will do, before anything is sent.
 *
 * The compressor runs locally in single-digit milliseconds and the page was not
 * using that. Dragging the ratio changed a percentage label and nothing else,
 * so the only way to discover that 15 per cent destroys a document was to spend
 * two API calls finding out. Running it on every change turns the slider into
 * the instrument it should have been: the token count and the gate's own
 * warning move under your hand.
 */
function Preview({
  context,
  question,
  ratio,
  ceiling,
}: {
  context: string;
  question: string;
  ratio: number;
  ceiling: number | null;
}) {
  const { t } = useI18n();
  const [stat, setStat] = useState<{
    tokensIn: number;
    tokensOut: number;
    confidence: number;
    escalate: boolean;
    ms: number;
  } | null>(null);

  // Debounced, because a 60,000-character document is not free to segment and a
  // slider drag fires this a dozen times a second. 120 ms is below the point a
  // reader registers lag and well above the point this thrashes.
  const key = useMemo(() => ({ context, question, ratio }), [context, question, ratio]);

  useEffect(() => {
    if (!key.context.trim()) {
      setStat(null);
      return;
    }
    let alive = true;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      compress(key.context, { ratio: key.ratio, query: key.question || undefined })
        .then((r) => {
          if (!alive) return;
          setStat({
            tokensIn: r.receipt.tokensIn,
            tokensOut: r.receipt.tokensOut,
            confidence: r.receipt.confidence,
            escalate: r.receipt.escalate,
            ms: performance.now() - t0,
          });
        })
        .catch(() => alive && setStat(null));
    }, 120);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [key]);

  if (!stat) return null;

  const cut = stat.tokensIn ? 1 - stat.tokensOut / stat.tokensIn : 0;

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          {t("chat.preview")}
        </span>
        <span className="tnum text-[11px] text-[var(--muted)]">{stat.ms.toFixed(0)} ms</span>
      </div>

      {/* The bar is the compressed share of the original, drawn to scale. A
          number alone makes 40 per cent and 15 per cent feel adjacent. */}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--fg)_10%,transparent)]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: stat.escalate ? "var(--signal)" : "var(--shoot)",
          }}
          animate={{ width: `${Math.max(2, (1 - cut) * 100)}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
        />
      </div>

      <p className="tnum mt-2 text-[11.5px] text-[var(--muted)]">
        {stat.tokensIn.toLocaleString()} → {stat.tokensOut.toLocaleString()} {t("chat.tokens")} ·{" "}
        <strong className="font-semibold text-[var(--fg)]">{Math.round(cut * 100)}%</strong>{" "}
        {t("chat.preview.cut")} · {t("chat.preview.confidence")} {stat.confidence.toFixed(2)}
      </p>

      {stat.escalate && (
        <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--signal)]">
          {t("chat.preview.escalate")}
        </p>
      )}

      {/* Kernly's estimate, not the provider's count, so this is a forecast and
          is worded as one. It is compared against the key's per-minute ceiling
          rather than a context window: on the free Groq tier the request is
          rejected for the minute's budget long before any window is reached. */}
      {ceiling !== null && stat.tokensIn > ceiling && (
        <p className="mt-2 text-[11.5px] leading-relaxed">
          {stat.tokensOut <= ceiling ? (
            <span className="text-[var(--shoot)]">{t("chat.ceiling.only")}</span>
          ) : (
            <span className="text-[var(--signal)]">{t("chat.ceiling.neither")}</span>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * `TOO_LARGE` is matched on the provider's own words rather than a status code,
 * because the status arrives here flattened into a message string. Both Groq and
 * Google phrase this failure plainly enough that a substring is reliable, and a
 * miss costs a headline, not correctness — the column still shows the raw error.
 */
const TOO_LARGE = /too large|context length|maximum context|tokens per minute|reduce your message/i;

function Verdict({
  full,
  kern,
  fullError,
  kern1Ok,
}: {
  full: Reply | null;
  kern: Reply | null;
  fullError?: string | null;
  kern1Ok?: boolean;
}) {
  const { t } = useI18n();

  // The uncompressed request did not fit and the compressed one did. There is
  // no percentage to report here because the comparison is not one of degree:
  // one request was answerable and the other was refused before it was read.
  if (fullError && TOO_LARGE.test(fullError) && kern1Ok && kern) {
    return (
      <div className="rounded-lg border border-[color-mix(in_oklab,var(--shoot)_45%,transparent)] bg-[color-mix(in_oklab,var(--shoot)_10%,transparent)] px-4 py-3 text-[13px] leading-relaxed">
        <strong className="font-semibold">{t("chat.verdict.didNotFit")}</strong>{" "}
        <span className="text-[var(--muted)]">
          {t("chat.verdict.didNotFit.note")}
          {kern.receipt && (
            <>
              {" "}
              <span className="tnum">
                {kern.receipt.tokensIn.toLocaleString()} →{" "}
                {kern.receipt.tokensOut.toLocaleString()}
              </span>
            </>
          )}
        </span>
      </div>
    );
  }

  if (!full || !kern) return null;
  const a = full.promptTokens;
  const b = kern.promptTokens;
  const saved = a && b ? 1 - b / a : null;
  const sim = overlap(full.answer, kern.answer);

  // The case worth calling out: the intact context answered from the document
  // and the compressed one fell back on the model's own knowledge. The answers
  // can look identical and one of them is a compression failure.
  const drift = !split(full.answer).outside && split(kern.answer).outside;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-[var(--line)] px-4 py-2.5 text-[12.5px]">
        {saved !== null && (
          <span>
            <strong className="tnum text-[15px] font-semibold">{Math.round(saved * 100)}%</strong>{" "}
            <span className="text-[var(--muted)]">
              {t("chat.verdict.saved")} ({a!.toLocaleString()} → {b!.toLocaleString()})
            </span>
          </span>
        )}
        {sim !== null && (
          <span className="text-[var(--muted)]">
            {t("chat.verdict.share.a")}{" "}
            <strong className="tnum font-semibold text-[var(--fg)]">{Math.round(sim * 100)}%</strong>{" "}
            {t("chat.verdict.share.b")}
          </span>
        )}
      </div>

      {drift && (
        <p className="rounded-lg border border-[color-mix(in_oklab,var(--signal)_35%,transparent)] bg-[color-mix(in_oklab,var(--signal)_9%,transparent)] px-4 py-2.5 text-[12.5px] leading-relaxed">
          {t("chat.verdict.drift")}
        </p>
      )}
    </div>
  );
}

function Column({
  title,
  reply,
  error,
  accent,
}: {
  title: string;
  reply: Reply | null;
  error?: string | null;
  accent?: boolean;
}) {
  const { t } = useI18n();
  const parsed = reply ? split(reply.answer) : null;

  return (
    <div
      className={`min-w-0 rounded-xl border bg-[var(--panel)] p-4 transition-colors ${
        accent
          ? "border-[color-mix(in_oklab,var(--kernel)_45%,var(--line))]"
          : "border-[var(--line)]"
      }`}
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          {title}
        </span>
        <span className="tnum shrink-0 text-[11.5px] text-[var(--muted)]">
          {reply?.promptTokens?.toLocaleString() ?? "—"} {t("chat.tokIn")} ·{" "}
          {reply ? `${(reply.elapsedMs / 1000).toFixed(1)}s` : "—"}
        </span>
      </div>

      {parsed?.outside && (
        <p className="mb-2 inline-block rounded-md border border-[var(--line)] bg-[color-mix(in_oklab,var(--husk)_12%,transparent)] px-2 py-1 text-[11px] text-[var(--muted)]">
          {t("chat.outside")}
        </p>
      )}

      {error ? (
        <p className="rounded-lg border border-[color-mix(in_oklab,var(--signal)_35%,transparent)] bg-[color-mix(in_oklab,var(--signal)_9%,transparent)] p-3 text-[12.5px] leading-relaxed">
          {error}
        </p>
      ) : (
        <p className="whitespace-pre-wrap text-[14px] leading-[1.65]">
          {parsed?.body || <span className="text-[var(--muted)]">{t("chat.noreply")}</span>}
        </p>
      )}

      {reply?.receipt && (
        <div className="mt-3 border-t border-[var(--line)] pt-3">
          <code className="block break-all font-mono text-[10.5px] leading-relaxed text-[var(--muted)]">
            {reply.receipt.digest}
          </code>
          <p className="mt-1.5 tnum text-[11.5px] text-[var(--muted)]">
            {t("chat.preview.confidence")} {reply.receipt.confidence.toFixed(2)}
            {reply.receipt.queryCoverage !== null && (
              <>
                {" "}
                · {Math.round(reply.receipt.queryCoverage * 100)}% {t("chat.coverage")}
              </>
            )}{" "}
            · {reply.receipt.tokensIn} → {reply.receipt.tokensOut} {t("chat.ownCount")}
          </p>
        </div>
      )}

      {reply?.escalate && (
        <p className="mt-3 rounded-lg border border-[color-mix(in_oklab,var(--signal)_35%,transparent)] bg-[color-mix(in_oklab,var(--signal)_9%,transparent)] p-2.5 text-[12px] leading-relaxed">
          {t("chat.escalated")}
        </p>
      )}
    </div>
  );
}

function Skeleton({ title, accent }: { title: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border bg-[var(--panel)] p-4 ${
        accent
          ? "border-[color-mix(in_oklab,var(--kernel)_45%,var(--line))]"
          : "border-[var(--line)]"
      }`}
    >
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {title}
      </span>
      <div className="mt-3 space-y-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-3 rounded bg-[color-mix(in_oklab,var(--fg)_8%,transparent)]"
            style={{ width: `${100 - i * 18}%` }}
            animate={{ opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.14 }}
          />
        ))}
      </div>
    </div>
  );
}
