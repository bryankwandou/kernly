import type { Block, BlockKind } from "./types.js";
import { estimate } from "./tokens.js";

/**
 * Stage 1 — segmentation.
 *
 * Everything downstream is type-aware, because the single fastest way to break
 * an agent is to run a stopword stripper over its source code. Splitting the
 * context into typed blocks first is what lets the lexical layer stay
 * aggressive on prose while leaving code, JSON and diffs byte-identical.
 */

const FENCE = /^```/;

function classify(text: string): BlockKind {
  const t = text.trim();
  if (!t) return "prose";
  if (/^#{1,6}\s/.test(t)) return "heading";
  if (/^[+-]{3}\s|^@@ |^[+-][^+-]/m.test(t)) return "diff";
  if (/^[[{]/.test(t) && /[}\]]$/.test(t)) return "json";
  if (/^\|.*\|$/m.test(t)) return "table";
  if (/^\s*[-*]\s|^\s*\d+[.)]\s/m.test(t)) return "list";
  if (/^\[?\d{4}-\d{2}-\d{2}|^(ERROR|WARN|INFO|DEBUG|TRACE)\b/m.test(t)) return "log";
  if (/[;{}]\s*$|^\s*(function|class|const|let|var|def|import|export|fn|pub|impl)\b/m.test(t)) {
    return "code";
  }
  return "prose";
}

/**
 * A line that opens a record: a bullet, a numbered item, a clock or calendar
 * stamp, or a bare log level.
 */
const RECORD =
  /^(?:\s*[-*+]\s|\s*\d+[.)]\s|\[?\d{1,2}:\d{2}(?::\d{2})?\b|\[?\d{4}-\d{2}-\d{2}\b|(?:ERROR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\b)/;

/**
 * Split a line-oriented run into one block per record.
 *
 * Paragraph segmentation on blank lines alone is wrong for the material this
 * library exists to handle. An agent transcript, a log tail and an incident
 * timeline are all written one line per event with no blank lines anywhere, so
 * the entire run arrives as a single block — and a single block is atomic to
 * every stage downstream. It is scored as one lump and it is admitted or
 * evicted as one lump.
 *
 * The failure that produced this function: a seventeen-line outage timeline
 * with the cause on line thirteen came through as one 224-token block. Against
 * a budget of 111 tokens it could not fit at any price, so the allocator
 * skipped it and spent the budget on a 43-token paragraph of unrelated
 * follow-ups. The compressor returned the red herrings, dropped the answer, and
 * finished at 14 per cent of the input against a requested 40 — most of the
 * budget was never spent. Nothing was wrong in scoring or allocation. The unit
 * they were handed was simply too coarse to choose within.
 *
 * Splitting is deliberately reluctant, because fracturing an ordinary
 * hard-wrapped paragraph would be a worse bug than the one being fixed. Two
 * conditions have to hold together: at least two lines open a record, and
 * record lines are at least half the run. Prose with one stray bullet at the
 * end is left intact. A line that opens no record attaches to the record above
 * it, which is what keeps a wrapped continuation with the event it belongs to.
 */
function records(text: string): string[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [text];

  const marks = lines.filter((l) => RECORD.test(l)).length;
  if (marks < 2 || marks * 2 < lines.length) return [text];

  const out: string[] = [];
  for (const line of lines) {
    if (RECORD.test(line) || !out.length) out.push(line);
    else out[out.length - 1] += "\n" + line;
  }
  return out.map((r) => r.trim()).filter(Boolean);
}

export function normalize(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[​-‍﻿]/g, "") // zero-width junk from copy-paste
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function segment(input: string, pinPatterns: RegExp[] = []): Block[] {
  const blocks: Block[] = [];
  const lines = input.split("\n");

  let buf: string[] = [];
  let bufStart = 0;
  let cursor = 0;
  let inFence = false;
  let fenceLang = "";

  const push = (text: string, kind: BlockKind, start: number) => {
    blocks.push({
      id: blocks.length,
      kind,
      text,
      start,
      tokens: estimate(text),
      pinned: pinPatterns.some((r) => r.test(text)),
      score: 0,
    });
  };

  const flush = (kindHint?: BlockKind) => {
    const text = buf.join("\n").trim();
    buf = [];
    if (!text) return;

    // Fenced and heading blocks arrive with their kind already decided and are
    // atomic by definition: a code fence split down the middle is not code.
    if (kindHint) {
      push(text, kindHint, bufStart);
      return;
    }

    let offset = bufStart;
    for (const record of records(text)) {
      push(record, classify(record), offset);
      offset += record.length + 1;
    }
  };

  for (const line of lines) {
    if (FENCE.test(line)) {
      if (inFence) {
        buf.push(line);
        flush(fenceLang === "json" ? "json" : "code");
        inFence = false;
        fenceLang = "";
      } else {
        flush();
        inFence = true;
        fenceLang = line.replace(/^```/, "").trim().toLowerCase();
        bufStart = cursor;
        buf.push(line);
      }
      cursor += line.length + 1;
      continue;
    }

    if (inFence) {
      buf.push(line);
      cursor += line.length + 1;
      continue;
    }

    // A blank line closes a prose paragraph; a heading opens its own block.
    if (!line.trim()) {
      flush();
      bufStart = cursor + 1;
    } else if (/^#{1,6}\s/.test(line)) {
      flush();
      bufStart = cursor;
      buf.push(line);
      flush("heading");
      bufStart = cursor + line.length + 1;
    } else {
      if (!buf.length) bufStart = cursor;
      buf.push(line);
    }
    cursor += line.length + 1;
  }
  flush();

  return blocks;
}
