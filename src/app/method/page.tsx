import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "Method",
  description:
    "The full Kernly pipeline: what each stage does, why it sits where it does, and what the design deliberately gives up.",
};

export default function MethodPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <h1 className="text-[clamp(1.9rem,4vw,2.6rem)] font-semibold tracking-[-0.035em]">
          Method
        </h1>
        <p className="mt-3 text-[16px] leading-[1.65] text-[var(--muted)]">
          Kernly is a small amount of code doing a well-understood job carefully.
          This page is the whole design, including the parts that are weaker than
          the alternatives.
        </p>

        <Prose>
          <H>Where the efficiency in modern models actually comes from</H>
          <p>
            It is worth being precise about this, because it explains what
            Kernly can and cannot copy. The frontier open models that feel
            impossibly cheap for their size get there through three mechanisms,
            none of which are available to an application developer.
          </p>
          <p>
            The first is <strong>sparse mixture-of-experts routing</strong>.
            Kimi K2 carries roughly a trillion parameters but activates about
            thirty-two billion for any given token, selecting eight experts out
            of three hundred and eighty-four. Knowledge capacity scales with the
            total; compute scales with the activated slice.
          </p>
          <p>
            The second is <strong>attention-side compression</strong>. Multi-head
            latent attention projects keys and values into a much smaller latent
            space before caching them, and K2 further halves its head count
            relative to comparable designs. The KV cache is usually what makes
            long context expensive, so shrinking it is worth more than it looks.
          </p>
          <p>
            The third is <strong>speculative decoding and aggressive
            quantisation</strong> at serving time — cheap draft models proposing
            tokens that the large model only has to check.
          </p>
          <p>
            All three are training-time or serving-time levers. You cannot apply
            any of them from inside an application. What you can do is notice the
            shared principle underneath: <em>spend compute only on the part of
            the problem that carries information</em>. MoE applies that to
            parameters. MLA applies it to cache. Kernly applies it to the one
            surface an application actually owns, which is the prompt.
          </p>

          <H>The pipeline</H>
          <p>
            Six stages. Each one is independently testable and independently
            skippable, and the ordering between them is the part that took the
            most iteration to get right.
          </p>

          <Stage n="1" name="Normalize and segment">
            <p>
              Unicode is folded to NFKC, zero-width characters left behind by
              copy-paste are removed, and runs of whitespace collapse. Then the
              text is split into typed blocks: prose, code, JSON, table, log,
              diff, heading, list. Fenced code is detected by its fence rather
              than guessed at, and headings become their own blocks so a section
              title cannot be dropped while its body survives.
            </p>
            <p>
              Typing the blocks first is what licenses everything aggressive
              later. Stage five is only safe because it can be told, with
              certainty, that a given block is prose.
            </p>
          </Stage>

          <Stage n="2" name="Fold redundancy">
            <p>
              Two passes. Within a block, identical lines are collapsed and the
              survivor is annotated with a repeat count, because
              &quot;this happened forty times&quot; occasionally carries real
              signal that &quot;this happened&quot; does not. Across blocks,
              exact duplicates are folded by hash, and near-duplicates by
              four-word shingles compared with Jaccard similarity above a
              configurable threshold. When two blocks collide, the longer one
              survives.
            </p>
            <p>
              This stage is lossless in any sense that matters and is typically
              the largest single win on agent transcripts, which is exactly why
              it runs before anything that discards information.
            </p>
          </Stage>

          <Stage n="3" name="Score salience">
            <p>Four signals, blended:</p>
            <ul>
              <li>
                <strong>Query affinity.</strong> BM25 against the task string,
                squashed into a bounded range. Absent a task, this term drops out
                and density carries the score alone.
              </li>
              <li>
                <strong>Positional prior.</strong> A U-shaped curve weighting the
                head and tail above the middle, mirroring the well-documented
                tendency of long-context models to lose material in the centre.
              </li>
              <li>
                <strong>Information density.</strong> Type-token ratio combined
                with mean inverse document frequency across blocks. Connective
                tissue scores low; a block full of rare identifiers scores high.
              </li>
              <li>
                <strong>Structural weight.</strong> Multipliers for headings,
                error and traceback lines, imperative constraint language, and
                function or class signatures. Logs are discounted, because they
                are bulky and mostly noise.
              </li>
            </ul>
            <p>
              This is where Kernly is honestly weaker than a perplexity-based
              compressor. A small language model scoring token by token will beat
              these statistics on ranking quality. It will also need a GPU, which
              defeats the point when the goal is to make compression free enough
              that nobody thinks about whether to enable it.
            </p>
          </Stage>

          <Stage n="4" name="Allocate the budget">
            <p>
              Selecting survivors under a token ceiling is a 0/1 knapsack.
              Kernly solves it density-first — value per token, descending —
              which is the standard greedy approximation and is bounded within a
              factor of two of optimal while running in O(n log n). Exact
              knapsack over a two-hundred-thousand-token context is not worth the
              milliseconds.
            </p>
            <p>
              Two departures from the textbook. Pinned blocks are charged against
              the budget but never compete for it, so a system prompt or a live
              question cannot be outbid. And the loop skips rather than stops
              when a block does not fit, because a smaller block further down the
              ranking may still fill the gap.
            </p>
            <p>
              Output preserves document order. Reordering context by score
              measurably confuses models on multi-hop tasks, so ranking decides
              what survives and never where it sits.
            </p>
          </Stage>

          <Stage n="5" name="Compact lexically">
            <p>
              The caveman layer, made safe. Before any substitution runs, every
              backticked span, quoted string, bracketed expression, URL, email
              address, SCREAMING_CASE constant, call site and numeric literal is
              lifted out into a vault and replaced by a sentinel that cannot
              appear in ordinary text. Substitution then runs over what is left,
              and the vault is restored afterwards.
            </p>
            <p>
              Strength is a dial with four thresholds: verbose phrases collapse
              first, then filler adverbs, then determiners, then copulas, then
              the remaining function words. Only blocks typed as prose are
              eligible, and pinned blocks are exempt at every level.
            </p>
          </Stage>

          <Stage n="6" name="Gate and receipt">
            <p>
              Confidence is computed from how much of the total salience mass
              survived, how aggressive the achieved ratio was, and how many
              blocks are left. Aggression alone is not penalised — compressing
              hard while shedding salience is. Below the threshold, Kernly
              reports that the run should not be trusted and recommends either a
              gentler ratio or the original context sent to a larger model.
            </p>
            <p>
              A compressor that never declines is a compressor that quietly loses
              answers, and quiet losses are the reason this category has a
              credibility problem.
            </p>
            <p>
              Finally the receipt: token counts, retained salience, confidence,
              a derived energy and carbon estimate, and a sha256 over the
              normalized input, the output and the canonical config. That digest
              is the only thing Kernly ever writes on chain.
            </p>
          </Stage>

          <H>What this design gives up</H>
          <ul>
            <li>
              Ranking quality, relative to model-scored compression. Stated
              plainly above.
            </li>
            <li>
              Semantic rewriting. Kernly never paraphrases, because a paraphrase
              cannot be verified by re-running a deterministic function.
            </li>
            <li>
              Cross-lingual coverage. The lexical layer is English-only today.
              Every other stage is language-agnostic, and the token estimator
              handles CJK, but the grammar stripping does not yet.
            </li>
            <li>
              Exact token counts. The estimator is an approximation fitted to
              cl100k, accurate to roughly six percent on mixed content. It is
              good enough to drive a budget and is deliberately not used for
              billing.
            </li>
          </ul>

          <H>On the carbon number</H>
          <p>
            Tokens are counted exactly. Watt-hours and grams of CO₂e are derived
            from two configurable factors — energy per token and grid intensity —
            and both are order-of-magnitude estimates whose true values depend on
            hardware, batch size and which grid the datacentre sits on. Kernly
            anchors the token counts, which are checkable, and labels the carbon
            figure as an estimate everywhere it appears. Claiming otherwise would
            be the exact kind of unverifiable environmental accounting the
            project exists to argue against.
          </p>
        </Prose>
      </main>
      <Footer />
    </>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 space-y-5 text-[15.5px] leading-[1.72] text-[var(--muted)] [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-[var(--fg)] [&_strong]:font-semibold [&_ul]:space-y-2">
      {children}
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="!mt-14 border-t border-[var(--line)] pt-8 text-[22px] font-semibold tracking-[-0.025em] text-[var(--fg)]">
      {children}
    </h2>
  );
}

function Stage({ n, name, children }: { n: string; name: string; children: React.ReactNode }) {
  return (
    <section className="!mt-9 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
      <h3 className="flex items-baseline gap-3 text-[17px] font-semibold tracking-[-0.02em] text-[var(--fg)]">
        <span className="tnum text-[13px] text-[var(--kernel)]">{n}</span>
        {name}
      </h3>
      <div className="mt-3 space-y-3.5">{children}</div>
    </section>
  );
}
