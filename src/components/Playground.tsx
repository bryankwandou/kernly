"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { compress, type CompressResult } from "@kernly/core";
import { SAMPLES } from "@/lib/samples";
import { buildAttestTransaction, explorerUrl, toAttestation } from "@/lib/attest";

type AnchorState =
  | { status: "idle" }
  | { status: "signing" }
  | { status: "confirming"; signature: string }
  | { status: "done"; signature: string }
  | { status: "error"; message: string };

export function Playground() {
  const [sampleId, setSampleId] = useState(SAMPLES[0].id);
  const sample = useMemo(() => SAMPLES.find((s) => s.id === sampleId)!, [sampleId]);

  const [text, setText] = useState(sample.text);
  const [query, setQuery] = useState(sample.query);
  const [ratio, setRatio] = useState(0.35);
  const [strength, setStrength] = useState(0.5);
  const [lexical, setLexical] = useState(true);
  const [nearDedup, setNearDedup] = useState(true);

  const [result, setResult] = useState<CompressResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState<AnchorState>({ status: "idle" });

  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  // Re-running on every keystroke of a 4000-character textarea is wasteful even
  // for a pipeline this cheap, so the run is debounced. The stated cost of the
  // compressor is a claim the playground has to honour, not just advertise.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(async () => {
    const t0 = performance.now();
    const r = await compress(text, {
      ratio,
      query: query || undefined,
      lexical,
      lexicalStrength: strength,
      nearDedup,
    });
    setElapsed(performance.now() - t0);
    setResult(r);
    setAnchor({ status: "idle" });
  }, [text, query, ratio, strength, lexical, nearDedup]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(run, 140);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [run]);

  const pickSample = (id: string) => {
    const s = SAMPLES.find((x) => x.id === id)!;
    setSampleId(id);
    setText(s.text);
    setQuery(s.query);
  };

  const onAnchor = async () => {
    if (!result || !publicKey) return;
    try {
      setAnchor({ status: "signing" });
      const tx = await buildAttestTransaction(connection, publicKey, toAttestation(result.receipt));
      const signature = await sendTransaction(tx, connection);
      setAnchor({ status: "confirming", signature });
      const latest = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction({ signature, ...latest }, "confirmed");
      setAnchor({ status: "done", signature });
    } catch (e) {
      setAnchor({ status: "error", message: e instanceof Error ? e.message : "Transaction failed" });
    }
  };

  const r = result?.receipt;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* ---------------------------------------------------------------- input */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => pickSample(s.id)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                s.id === sampleId
                  ? "border-[var(--kernel)] bg-[color-mix(in_oklab,var(--kernel)_14%,transparent)] text-[var(--fg)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--husk)] hover:text-[var(--fg)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-[var(--muted)]">{sample.hint}</p>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
            Task the context is for
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Leave empty to score on information density alone"
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[14px] outline-none focus:border-[var(--kernel)]"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <Pane title="Original" tokens={r?.tokensIn}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              className="h-[420px] w-full resize-none bg-transparent font-mono text-[12.5px] leading-[1.65] outline-none"
            />
          </Pane>
          <Pane title="Compressed" tokens={r?.tokensOut} accent>
            <pre className="h-[420px] w-full overflow-auto whitespace-pre-wrap font-mono text-[12.5px] leading-[1.65]">
              {result?.output || ""}
            </pre>
          </Pane>
        </div>

        <div className="grid gap-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-2">
          <Slider
            label="Target ratio"
            value={ratio}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setRatio}
            display={`${Math.round(ratio * 100)}% of original`}
          />
          <Slider
            label="Lexical strength"
            value={strength}
            min={0}
            max={1}
            step={0.05}
            onChange={setStrength}
            disabled={!lexical}
            display={strengthLabel(strength)}
          />
          <Toggle label="Lexical compaction" checked={lexical} onChange={setLexical} />
          <Toggle label="Near-duplicate folding" checked={nearDedup} onChange={setNearDedup} />
        </div>
      </div>

      {/* -------------------------------------------------------------- receipt */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Receipt
            </h3>
            <span className="tnum text-[11px] text-[var(--muted)]">
              {elapsed.toFixed(1)} ms
            </span>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={r?.tokensOut ?? 0}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="tnum text-[44px] font-semibold leading-none tracking-[-0.03em]"
              >
                {r ? Math.round((1 - r.ratio) * 100) : 0}%
              </motion.span>
            </AnimatePresence>
            <span className="pb-1.5 text-[13px] text-[var(--muted)]">fewer tokens</span>
          </div>

          <div className="mt-1 tnum text-[12.5px] text-[var(--muted)]">
            {r?.tokensIn ?? 0} → {r?.tokensOut ?? 0} tokens
          </div>

          <Bar value={r ? 1 - r.ratio : 0} />

          <dl className="mt-5 space-y-2.5 text-[13px]">
            <Row k="Salience retained" v={r ? `${Math.round(r.salienceRetained * 100)}%` : "—"} />
            <Row
              k="Question coverage"
              v={
                !r
                  ? "—"
                  : r.queryCoverage === null
                    ? "no query"
                    : `${Math.round(r.queryCoverage * 100)}%`
              }
            />
            <Row
              k="Router confidence"
              v={r ? r.confidence.toFixed(2) : "—"}
              tone={r?.escalate ? "signal" : "shoot"}
            />
            <Row
              k="CO₂e avoided"
              v={r ? `${r.gramsCo2eSaved.toFixed(3)} g` : "—"}
              tone="shoot"
            />
          </dl>

          {r?.escalate && (
            <p className="mt-4 rounded-lg border border-[color-mix(in_oklab,var(--signal)_35%,transparent)] bg-[color-mix(in_oklab,var(--signal)_9%,transparent)] p-3 text-[12.5px] leading-relaxed text-[var(--fg)]">
              Confidence fell below the gate. Kernly is telling you not to trust this
              run — lower the ratio, or send the original to a larger model. A
              compressor that never says no is a compressor that quietly loses answers.
            </p>
          )}
        </div>

        {/* stage breakdown */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Stages
          </h3>
          <ol className="mt-3 space-y-2.5">
            {r?.stages.map((s, i) => (
              <li key={s.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium">
                    <span className="tnum mr-1.5 text-[var(--muted)]">{i + 1}</span>
                    {s.name}
                  </span>
                  <span className="tnum text-[12px] text-[var(--muted)]">
                    {s.tokensBefore} → {s.tokensAfter}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">{s.note}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* attestation */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Anchor on Solana
          </h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
            Writes the receipt digest to devnet so the saving is checkable by
            anyone, not just claimed by us.
          </p>

          {r && (
            <code className="mt-3 block break-all rounded-lg bg-[color-mix(in_oklab,var(--fg)_5%,transparent)] p-2.5 font-mono text-[11px] leading-relaxed">
              {r.digest}
            </code>
          )}

          <div className="mt-4 space-y-2.5">
            <WalletMultiButton
              style={{
                width: "100%",
                height: 38,
                fontSize: 13,
                borderRadius: 8,
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "1px solid var(--line)",
                color: "var(--fg)",
                fontFamily: "inherit",
              }}
            />

            <button
              onClick={onAnchor}
              disabled={!connected || !r || anchor.status === "signing" || anchor.status === "confirming"}
              className="h-[38px] w-full rounded-lg bg-[var(--kernel)] text-[13px] font-semibold text-[#1a1205] transition-opacity disabled:opacity-35"
            >
              {anchor.status === "signing"
                ? "Approve in wallet…"
                : anchor.status === "confirming"
                  ? "Confirming…"
                  : "Anchor receipt"}
            </button>
          </div>

          {anchor.status === "done" && (
            <a
              href={explorerUrl(anchor.signature)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-[12.5px] font-medium text-[var(--shoot)] underline underline-offset-4"
            >
              Confirmed on devnet — open in Explorer
            </a>
          )}
          {anchor.status === "error" && (
            <p className="mt-3 text-[12.5px] text-[var(--signal)]">{anchor.message}</p>
          )}

          <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
            Devnet only. Fund the wallet from faucet.solana.com first.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

function Pane({
  title,
  tokens,
  accent,
  children,
}: {
  title: string;
  tokens?: number;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border bg-[var(--panel)] p-4 ${
        accent ? "border-[color-mix(in_oklab,var(--kernel)_45%,var(--line))]" : "border-[var(--line)]"
      }`}
    >
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          {title}
        </span>
        <span className="tnum text-[12px] text-[var(--muted)]">{tokens ?? 0} tok</span>
      </div>
      {children}
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--fg)_8%,transparent)]">
      <motion.div
        className="h-full rounded-full bg-[var(--kernel)]"
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
      />
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "shoot" | "signal" }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--muted)]">{k}</dt>
      <dd
        className="tnum font-medium"
        style={tone ? { color: `var(--${tone})` } : undefined}
      >
        {v}
      </dd>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  disabled?: boolean;
}) {
  return (
    <label className={`block ${disabled ? "opacity-40" : ""}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
          {label}
        </span>
        <span className="tnum text-[12.5px]">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--kernel)]"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--kernel)]" : "bg-[color-mix(in_oklab,var(--fg)_15%,transparent)]"
        }`}
      >
        <motion.span
          className="absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? 19 : 3 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        />
      </button>
      {label}
    </label>
  );
}

function strengthLabel(v: number): string {
  if (v === 0) return "off";
  if (v < 0.3) return "phrases only";
  if (v < 0.5) return "filler";
  if (v < 0.75) return "determiners";
  if (v < 0.9) return "copulas";
  return "maximum";
}
