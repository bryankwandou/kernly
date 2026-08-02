"use client";

import { useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { compress } from "@kernly/core";
import { explorerUrl, fetchAttestation, type Attestation } from "@/lib/attest";

type Outcome =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "checked"; onChain: Attestation; local: string; match: boolean };

export function Verifier() {
  const { connection } = useConnection();
  const [signature, setSignature] = useState("");
  const [text, setText] = useState("");
  const [ratio, setRatio] = useState("0.35");
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  const check = async () => {
    setOutcome({ kind: "working" });
    try {
      const onChain = await fetchAttestation(connection, signature.trim());
      if (!onChain) {
        setOutcome({ kind: "missing" });
        return;
      }
      // The config has to match exactly, which is the honest cost of a
      // deterministic scheme: reproducing a claim means reproducing its inputs.
      const local = await compress(text, {
        ratio: Number(ratio),
        query: query || undefined,
      });
      setOutcome({
        kind: "checked",
        onChain,
        local: local.receipt.digest,
        match: local.receipt.digest === onChain.d,
      });
    } catch (e) {
      setOutcome({ kind: "error", message: e instanceof Error ? e.message : "Lookup failed" });
    }
  };

  return (
    <div className="space-y-5">
      <Field label="Devnet transaction signature">
        <input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="5Kq…"
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 font-mono text-[13px] outline-none focus:border-[var(--kernel)]"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target ratio used">
          <input
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 font-mono text-[13px] outline-none focus:border-[var(--kernel)]"
          />
        </Field>
        <Field label="Task used (blank if none)">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px] outline-none focus:border-[var(--kernel)]"
          />
        </Field>
      </div>

      <Field label="Original context">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder="Paste the exact text that was compressed."
          className="h-52 w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3 font-mono text-[12.5px] leading-[1.6] outline-none focus:border-[var(--kernel)]"
        />
      </Field>

      <button
        onClick={check}
        disabled={!signature.trim() || !text.trim() || outcome.kind === "working"}
        className="rounded-lg bg-[var(--fg)] px-5 py-2.5 text-[14px] font-semibold text-[var(--bg)] disabled:opacity-35"
      >
        {outcome.kind === "working" ? "Checking…" : "Check the claim"}
      </button>

      {outcome.kind === "missing" && (
        <Note tone="signal">
          No Kernly attestation found in that transaction. Confirm the signature
          is from devnet and that it was produced by the playground.
        </Note>
      )}

      {outcome.kind === "error" && <Note tone="signal">{outcome.message}</Note>}

      {outcome.kind === "checked" && (
        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <div
            className="text-[15px] font-semibold"
            style={{ color: outcome.match ? "var(--shoot)" : "var(--signal)" }}
          >
            {outcome.match
              ? "Digests match. The recorded saving is reproducible."
              : "Digests differ. The recorded claim does not reproduce from this input."}
          </div>

          <dl className="space-y-2 text-[13px]">
            <Row k="On chain" v={outcome.onChain.d} mono />
            <Row k="Recomputed" v={outcome.local} mono />
            <Row k="Tokens claimed" v={`${outcome.onChain.i} → ${outcome.onChain.o}`} />
            <Row k="CO₂e claimed" v={`${outcome.onChain.g} g (estimate)`} />
          </dl>

          {!outcome.match && (
            <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
              A mismatch does not always mean dishonesty. The config has to be
              identical — ratio, task string, and the lexical and dedup settings
              — because the digest covers all of them. Reproducing a claim means
              reproducing its inputs, and that is the price of determinism.
            </p>
          )}

          <a
            href={explorerUrl(signature.trim())}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-[13px] font-medium underline underline-offset-4"
          >
            Open the transaction in Explorer
          </a>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <dt className="text-[var(--muted)]">{k}</dt>
      <dd className={`${mono ? "break-all font-mono text-[11.5px]" : "tnum"} max-w-full`}>{v}</dd>
    </div>
  );
}

function Note({ tone, children }: { tone: "signal" | "shoot"; children: React.ReactNode }) {
  return (
    <p
      className="rounded-lg border p-3 text-[13px] leading-relaxed"
      style={{
        borderColor: `color-mix(in oklab, var(--${tone}) 35%, transparent)`,
        background: `color-mix(in oklab, var(--${tone}) 8%, transparent)`,
      }}
    >
      {children}
    </p>
  );
}
