import { estimate } from "./tokens.js";
import type { Block } from "./types.js";

/**
 * Stage 2 — redundancy folding.
 *
 * Agent transcripts are pathologically repetitive: the same file gets read four
 * times, the same error is echoed by the tool and then by the model, the same
 * system preamble is re-sent every turn. Removing that costs nothing in quality
 * and is usually the single largest win in the whole pipeline, which is why it
 * runs before anything lossy.
 */

const SHINGLE = 4;

function shingles(text: string): Set<number> {
  const words = text.toLowerCase().match(/[a-z0-9_]+/g) || [];
  const out = new Set<number>();
  for (let i = 0; i + SHINGLE <= words.length; i++) {
    out.add(hash32(words.slice(i, i + SHINGLE).join(" ")));
  }
  // Very short blocks produce no shingles; fall back to the whole string so
  // they can still match an identical twin.
  if (!out.size && words.length) out.add(hash32(words.join(" ")));
  return out;
}

/** FNV-1a. Fast, no deps, good enough for shingle buckets. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function jaccard(a: Set<number>, b: Set<number>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const v of small) if (large.has(v)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Line-level folding inside a single block.
 *
 * Block-level dedup cannot see repetition that lives inside one paragraph, and
 * that is exactly the shape agent tool output takes: three consecutive
 * "Reading file x" lines with no blank line between them arrive as one block.
 * Collapsing them here, before scoring, is both the cheapest and the most
 * frequently triggered win in the pipeline.
 *
 * Only exact matches after whitespace normalization are folded, and only when
 * the line appears more than once. Anything subtler is left to the block stage,
 * where the near-duplicate threshold is under the caller's control.
 */
export function foldLines(text: string): { text: string; folded: number } {
  const lines = text.split("\n");
  if (lines.length < 3) return { text, folded: 0 };

  const seen = new Map<string, number>();
  const out: string[] = [];
  let folded = 0;

  for (const line of lines) {
    const key = line.replace(/\s+/g, " ").trim();
    if (!key) {
      out.push(line);
      continue;
    }
    const prev = seen.get(key);
    if (prev !== undefined) {
      seen.set(key, prev + 1);
      folded++;
      continue;
    }
    seen.set(key, 1);
    out.push(line);
  }

  if (!folded) return { text, folded: 0 };

  // Annotate the survivor so the model can tell "this happened once" apart from
  // "this happened forty times", which sometimes carries real signal.
  const annotated = out.map((line) => {
    const key = line.replace(/\s+/g, " ").trim();
    const n = seen.get(key) || 1;
    return n > 1 ? `${line}  (x${n})` : line;
  });

  return { text: annotated.join("\n"), folded };
}

export function dedup(blocks: Block[], near: boolean, threshold: number): Block[] {
  const exact = new Map<string, number>();
  const sigs: (Set<number> | null)[] = [];

  for (const b of blocks) {
    if (b.pinned) {
      sigs.push(null);
      continue;
    }

    // Fold repeated lines inside the block first. Code is exempt: repeated
    // lines there are usually meaningful (closing braces, repeated imports).
    if (b.kind !== "code" && b.kind !== "diff") {
      const f = foldLines(b.text);
      if (f.folded) {
        b.text = f.text;
        b.tokens = estimate(f.text);
      }
    }

    const key = b.text.replace(/\s+/g, " ").trim();
    const twin = exact.get(key);
    if (twin !== undefined) {
      b.duplicateOf = twin;
      sigs.push(null);
      continue;
    }
    exact.set(key, b.id);

    if (!near) {
      sigs.push(null);
      continue;
    }

    const sig = shingles(b.text);
    let matched = false;
    for (let j = 0; j < sigs.length; j++) {
      const other = sigs[j];
      if (!other || blocks[j].duplicateOf !== undefined) continue;
      if (blocks[j].kind !== b.kind) continue;
      if (jaccard(sig, other) >= threshold) {
        // Keep whichever copy carries more information, drop the other.
        if (b.tokens > blocks[j].tokens) {
          blocks[j].duplicateOf = b.id;
        } else {
          b.duplicateOf = blocks[j].id;
          matched = true;
        }
        break;
      }
    }
    sigs.push(matched ? null : sig);
  }

  return blocks;
}
