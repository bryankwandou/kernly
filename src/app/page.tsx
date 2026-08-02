import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { Hero } from "@/components/Hero";

const STAGES = [
  {
    n: "01",
    name: "Segment",
    body: "Split the context into typed blocks — prose, code, JSON, diffs, logs, tables. Everything downstream is type-aware, because the fastest way to break an agent is to run a stopword stripper over its source code.",
  },
  {
    n: "02",
    name: "Fold",
    body: "Collapse repetition at both block and line level. Agent transcripts read the same file four times and echo the same error twice. Removing that costs nothing in quality, which is why it runs before anything lossy.",
  },
  {
    n: "03",
    name: "Score",
    body: "Rank every surviving block on four signals: BM25 affinity with the task, a positional prior for the lost-in-the-middle effect, information density, and structural weight for headings and error lines.",
  },
  {
    n: "04",
    name: "Allocate",
    body: "Fit the survivors to a token budget as a knapsack, solved density-first. Pinned blocks are charged against the budget but never compete for it, and document order is preserved on output.",
  },
  {
    n: "05",
    name: "Compact",
    body: "Strip grammar from prose only. Identifiers, quoted strings, URLs and numeric literals are vaulted before the pass and restored after, so even the aggressive settings stay safe.",
  },
  {
    n: "06",
    name: "Gate",
    body: "Score how much salience survived, and refuse to pretend. When confidence drops below the threshold Kernly says so and recommends escalating, rather than silently returning a context that lost the answer.",
  },
];

const CONTRASTS = [
  {
    them: "LLMLingua and its descendants",
    they: "score every token by perplexity under a small language model. Accurate — and the reason the compressor needs a GPU in order to save you GPU time.",
    us: "scores blocks with statistics that finish in single-digit milliseconds on a phone. A slightly worse ranking, in exchange for a compressor that is genuinely free to run.",
  },
  {
    them: "Naive stopword strippers",
    they: "delete grammar everywhere, including inside code and identifiers, and give you no signal at all about when they went too far.",
    us: "touches prose only, vaults every literal before the pass, and puts strength on a dial with an escalation gate sitting behind it.",
  },
  {
    them: "Bigger context windows",
    they: "move the cost rather than removing it, and long contexts measurably degrade retrieval somewhere around the middle.",
    us: "sends less. A shorter context is cheaper, faster, and past a certain length more accurate than the long one it replaced.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />

        {/* ------------------------------------------------------- the problem */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <h2 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold leading-[1.12] tracking-[-0.03em]">
              The context window is where the money goes
            </h2>
            <div className="space-y-4 text-[16px] leading-[1.65] text-[var(--muted)]">
              <p>
                An agent loop re-sends its entire history every turn. By turn
                twenty the model is reading the same system prompt for the
                twentieth time, the same file it already read three times, and a
                paragraph about an offsite in Lisbon that has nothing to do with
                the task. All of it is billed, all of it burns power, and a good
                share of it actively hurts the answer.
              </p>
              <p>
                The industry response has been longer windows and sparser
                models. Both help, and both are somebody else&apos;s research
                budget. The lever available to everyone today sits upstream:
                stop sending the parts that were never going to matter.
              </p>
              <p className="text-[var(--fg)]">
                Kernly is that lever, and it is small enough to read in an
                afternoon.
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- the stages */}
        <section id="method" className="border-y border-[var(--line)] bg-[var(--panel)]">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.03em]">
              Six stages, in this order
            </h2>
            <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.65] text-[var(--muted)]">
              The ordering is load-bearing. Folding runs before scoring so that
              duplicates cannot distort term rarity. Compaction runs after
              selection, because it changes token counts and would otherwise
              leave the allocator solving the wrong problem.
            </p>

            <ol className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {STAGES.map((s) => (
                <li key={s.n} className="border-t border-[var(--line)] pt-5">
                  <div className="flex items-baseline gap-3">
                    <span className="tnum text-[12px] font-semibold text-[var(--kernel)]">
                      {s.n}
                    </span>
                    <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{s.name}</h3>
                  </div>
                  <p className="mt-2.5 text-[14px] leading-[1.6] text-[var(--muted)]">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------- differences */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.03em]">
            What Kernly gives up, on purpose
          </h2>
          <div className="mt-10 space-y-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)]">
            {CONTRASTS.map((c) => (
              <div key={c.them} className="grid gap-4 bg-[var(--bg)] p-6 md:grid-cols-2">
                <div>
                  <h3 className="text-[15px] font-semibold">{c.them}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.6] text-[var(--muted)]">{c.they}</p>
                </div>
                <div className="md:border-l md:border-[var(--line)] md:pl-6">
                  <h3 className="text-[15px] font-semibold text-[var(--kernel)]">Kernly</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.6] text-[var(--muted)]">{c.us}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------- on-chain */}
        <section className="border-y border-[var(--line)] bg-[var(--panel)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2">
            <div>
              <h2 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.03em]">
                A savings claim nobody has to take on faith
              </h2>
              <div className="mt-5 space-y-4 text-[15.5px] leading-[1.65] text-[var(--muted)]">
                <p>
                  Every product in this category asks you to believe its own
                  dashboard. That is a weak position, and it gets weaker the
                  moment the number is attached to a sustainability report or a
                  procurement claim.
                </p>
                <p>
                  Kernly hashes each run — the normalized input, the output and
                  the exact config — and writes that digest to Solana. Because
                  the pipeline is deterministic and the source is public, anyone
                  can re-run it and confirm the digest matches. The chain is not
                  decoration here; it is the only part of the design that makes
                  the claim adversarially checkable.
                </p>
                <p className="text-[var(--fg)]">
                  Tokens are counted exactly. The carbon figure derived from them
                  is an estimate, and Kernly labels it as one everywhere it
                  appears.
                </p>
              </div>
              <Link
                href="/verify"
                className="mt-7 inline-block rounded-lg border border-[var(--line)] px-5 py-3 text-[14px] font-medium transition-colors hover:border-[var(--husk)]"
              >
                Verify a receipt
              </Link>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-6 font-mono text-[12.5px] leading-[1.8]">
              <div className="text-[var(--muted)]"># what lands on chain</div>
              <div className="mt-2 break-all">
                <span className="text-[var(--husk)]">{"{"}</span>
                <br />
                &nbsp;&nbsp;<span className="text-[var(--kernel)]">&quot;v&quot;</span>: &quot;kernly.v1&quot;,
                <br />
                &nbsp;&nbsp;<span className="text-[var(--kernel)]">&quot;d&quot;</span>: &quot;9f2c…a41e&quot;,
                <br />
                &nbsp;&nbsp;<span className="text-[var(--kernel)]">&quot;i&quot;</span>: 336,
                <br />
                &nbsp;&nbsp;<span className="text-[var(--kernel)]">&quot;o&quot;</span>: 121,
                <br />
                &nbsp;&nbsp;<span className="text-[var(--kernel)]">&quot;g&quot;</span>: 0.031
                <br />
                <span className="text-[var(--husk)]">{"}"}</span>
              </div>
              <div className="mt-5 text-[var(--muted)]">
                # five fields. no prompt content, no
                <br /># identifiers, nothing that needs a
                <br /># privacy policy to justify.
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- green */}
        <section className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h2 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.03em]">
            Efficiency is the only honest sustainability story in AI
          </h2>
          <p className="mt-5 text-[16px] leading-[1.7] text-[var(--muted)]">
            Offsets are bought after the fact. Renewable procurement changes
            where the power comes from. Neither reduces the work being done.
            Sending fewer tokens is the one intervention that shrinks the load
            itself, and it happens to be the same one that lowers the bill.
            Kernly makes that reduction countable, then makes the count
            checkable.
          </p>
          <Link
            href="/playground"
            className="mt-9 inline-block rounded-lg bg-[var(--fg)] px-6 py-3.5 text-[14px] font-semibold text-[var(--bg)] transition-transform hover:-translate-y-0.5"
          >
            Try it on your own context
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
