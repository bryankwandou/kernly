"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { compress } from "@kernly/core";
import { SAMPLES } from "@/lib/samples";

/**
 * The hero runs the real compressor on a real sample in the browser on mount.
 * Nothing here is a mock or a hardcoded number: if the engine regresses, the
 * headline figure on the landing page moves with it. That is deliberate — a
 * product whose whole claim is verifiability should not ship a fake demo.
 */
export function Hero() {
  const [stat, setStat] = useState<{ inTok: number; outTok: number; ms: number } | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    const s = SAMPLES[0];
    const t0 = performance.now();
    compress(s.text, { ratio: 0.35, query: s.query }).then((r) => {
      if (!alive) return;
      setStat({ inTok: r.receipt.tokensIn, outTok: r.receipt.tokensOut, ms: performance.now() - t0 });
    });
    return () => {
      alive = false;
    };
  }, []);

  const cut = stat ? Math.round((1 - stat.outTok / stat.inTok) * 100) : null;

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { y: 14, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="field relative overflow-hidden border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-20 sm:pt-28">
        <motion.p
          {...rise(0)}
          className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--husk)]"
        >
          Context compression, verified
        </motion.p>

        <motion.h1
          {...rise(0.06)}
          className="mt-4 max-w-3xl text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1.03] tracking-[-0.04em]"
        >
          Keep the kernel.
          <br />
          <span className="text-[var(--husk)]">Drop the chaff.</span>
        </motion.h1>

        <motion.p
          {...rise(0.12)}
          className="mt-6 max-w-xl text-[17px] leading-[1.6] text-[var(--muted)]"
        >
          Most of what an agent sends to a model is packaging. Kernly strips it
          out with a deterministic six-stage filter that runs in a browser tab,
          costs nothing to operate, and writes a checkable receipt for every
          token it saves.
        </motion.p>

        <motion.div {...rise(0.18)} className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/playground"
            className="rounded-lg bg-[var(--fg)] px-5 py-3 text-[14px] font-semibold text-[var(--bg)] transition-transform hover:-translate-y-0.5"
          >
            Compress something
          </Link>
          <Link
            href="/chat"
            className="rounded-lg border border-[var(--line)] px-5 py-3 text-[14px] font-medium transition-colors hover:border-[var(--husk)]"
          >
            Watch it answer both ways
          </Link>
          <Link
            href="/method"
            className="rounded-lg border border-[var(--line)] px-5 py-3 text-[14px] font-medium transition-colors hover:border-[var(--husk)]"
          >
            Read the algorithm
          </Link>
        </motion.div>

        {/* Live figures, measured on this device, this page load. */}
        <motion.dl
          {...rise(0.26)}
          className="mt-14 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)]"
        >
          <Stat
            k="Tokens cut"
            v={cut === null ? "—" : `${cut}%`}
            note="on the sample transcript"
          />
          <Stat
            k="Compressor cost"
            v={stat ? `${stat.ms.toFixed(0)} ms` : "—"}
            note="no GPU, no API call"
          />
          <Stat k="Model needed" v="none" note="pure statistics" />
        </motion.dl>

        <motion.p {...rise(0.32)} className="mt-3 text-[12px] text-[var(--muted)]">
          Measured live in your browser when this page loaded, not pre-rendered.
        </motion.p>
      </div>
    </section>
  );
}

function Stat({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <div className="bg-[var(--bg)] px-5 py-5">
      <dt className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">{k}</dt>
      <dd className="tnum mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em]">{v}</dd>
      <p className="mt-1.5 text-[12px] text-[var(--muted)]">{note}</p>
    </div>
  );
}
