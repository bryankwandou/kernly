"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SAMPLES } from "@/lib/samples";

/**
 * The side-by-side chat.
 *
 * Every question is sent twice: once with the raw context, once with the
 * context Kernly compressed. Both answers are shown, and either one is allowed
 * to look worse. A compression demo that only ever displays the compressed
 * result is asking to be taken on faith, and this one should not need to be.
 */

const MODELS = [
  { key: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
  { key: "qwen/qwen3.6-27b", label: "Qwen 3.6 27B" },
  { key: "openai/gpt-oss-120b", label: "GPT-OSS 120B" },
];

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

type Turn = {
  id: number;
  question: string;
  full: Reply | null;
  kernly: Reply | null;
  error: string | null;
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

export function Chat() {
  const [sampleId, setSampleId] = useState(SAMPLES[1].id);
  const [context, setContext] = useState(SAMPLES[1].text);
  const [question, setQuestion] = useState(SAMPLES[1].query);
  const [ratio, setRatio] = useState(0.35);
  const [model, setModel] = useState(MODELS[0].key);
  const [showContext, setShowContext] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);

  const pickSample = (id: string) => {
    const s = SAMPLES.find((x) => x.id === id)!;
    setSampleId(id);
    setContext(s.text);
    setQuestion(s.query);
    setTurns([]);
  };

  const send = async () => {
    const q = question.trim();
    if (!q || busy) return;

    const id = nextId.current++;
    setTurns((t) => [...t, { id, question: q, full: null, kernly: null, error: null, pending: true }]);
    setQuestion("");
    setBusy(true);

    const payload = { question: q, context, model, ratio };

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
              error:
                full.status === "rejected"
                  ? full.reason?.message ?? "Request failed"
                  : kern.status === "rejected"
                    ? kern.reason?.message ?? "Request failed"
                    : null,
            },
      ),
    );
    setBusy(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* ------------------------------------------------------------ controls */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Reference material
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

          <button
            onClick={() => setShowContext((v) => !v)}
            className="mt-3 text-[12.5px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--fg)]"
          >
            {showContext ? "Hide" : "Edit"} the {context.length.toLocaleString()} characters being sent
          </button>

          {showContext && (
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              spellCheck={false}
              className="mt-3 h-56 w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 font-mono text-[11.5px] leading-[1.6] outline-none focus:border-[var(--kernel)]"
            />
          )}
        </div>

        <div className="space-y-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Model
            </span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2.5 py-2 text-[13.5px] outline-none focus:border-[var(--kernel)]"
            >
              {MODELS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                Target ratio
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

          <p className="text-[12px] leading-relaxed text-[var(--muted)]">
            Both columns hit the same model with the same question. Only the
            reference material differs, so any gap in the answers is the
            compression and nothing else.
          </p>
        </div>
      </aside>

      {/* -------------------------------------------------------------- thread */}
      <div className="min-w-0 space-y-5">
        {turns.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--line)] p-10 text-center">
            <p className="text-[14px] text-[var(--muted)]">
              Ask something the reference material can answer. Two requests go
              out; you read both replies.
            </p>
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

              {turn.error && (
                <p className="rounded-lg border border-[color-mix(in_oklab,var(--signal)_35%,transparent)] bg-[color-mix(in_oklab,var(--signal)_9%,transparent)] p-3 text-[13px]">
                  {turn.error}
                </p>
              )}

              {turn.pending ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton title="Full context" />
                  <Skeleton title="Kernly compressed" accent />
                </div>
              ) : (
                <>
                  <Verdict full={turn.full} kern={turn.kernly} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Column title="Full context" reply={turn.full} />
                    <Column title="Kernly compressed" reply={turn.kernly} accent />
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
            placeholder="Ask about the reference material…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[14.5px] outline-none"
          />
          <button
            onClick={() => void send()}
            disabled={busy || !question.trim()}
            className="h-[38px] shrink-0 rounded-lg bg-[var(--kernel)] px-5 text-[13.5px] font-semibold text-[#1a1205] transition-opacity disabled:opacity-35"
          >
            {busy ? "Asking…" : "Ask both"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

function Verdict({ full, kern }: { full: Reply | null; kern: Reply | null }) {
  if (!full || !kern) return null;
  const a = full.promptTokens;
  const b = kern.promptTokens;
  const saved = a && b ? 1 - b / a : null;
  const sim = overlap(full.answer, kern.answer);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-[var(--line)] px-4 py-2.5 text-[12.5px]">
      {saved !== null && (
        <span>
          <strong className="tnum text-[15px] font-semibold">{Math.round(saved * 100)}%</strong>{" "}
          <span className="text-[var(--muted)]">
            fewer prompt tokens billed ({a!.toLocaleString()} → {b!.toLocaleString()})
          </span>
        </span>
      )}
      {sim !== null && (
        <span className="text-[var(--muted)]">
          Answers share{" "}
          <strong className="tnum font-semibold text-[var(--fg)]">{Math.round(sim * 100)}%</strong>{" "}
          of their content words — a word-level check, not a judgement of correctness. Read both.
        </span>
      )}
    </div>
  );
}

function Column({
  title,
  reply,
  accent,
}: {
  title: string;
  reply: Reply | null;
  accent?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border bg-[var(--panel)] p-4 ${
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
          {reply?.promptTokens?.toLocaleString() ?? "—"} tok in ·{" "}
          {reply ? `${(reply.elapsedMs / 1000).toFixed(1)}s` : "—"}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-[14px] leading-[1.65]">
        {reply?.answer || <span className="text-[var(--muted)]">No reply.</span>}
      </p>

      {reply?.receipt && (
        <div className="mt-3 border-t border-[var(--line)] pt-3">
          <code className="block break-all font-mono text-[10.5px] leading-relaxed text-[var(--muted)]">
            {reply.receipt.digest}
          </code>
          <p className="mt-1.5 tnum text-[11.5px] text-[var(--muted)]">
            confidence {reply.receipt.confidence.toFixed(2)}
            {reply.receipt.queryCoverage !== null && (
              <> · {Math.round(reply.receipt.queryCoverage * 100)}% of the question&apos;s rare terms survived</>
            )}{" "}
            · {reply.receipt.tokensIn} → {reply.receipt.tokensOut} by Kernly&apos;s own count
          </p>
        </div>
      )}

      {reply?.escalate && (
        <p className="mt-3 rounded-lg border border-[color-mix(in_oklab,var(--signal)_35%,transparent)] bg-[color-mix(in_oklab,var(--signal)_9%,transparent)] p-2.5 text-[12px] leading-relaxed">
          Confidence fell below the gate on this run. Kernly is flagging the
          compressed answer as untrustworthy before you read it — raise the ratio
          or send the original.
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
