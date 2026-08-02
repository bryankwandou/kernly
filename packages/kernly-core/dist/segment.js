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
function classify(text) {
    const t = text.trim();
    if (!t)
        return "prose";
    if (/^#{1,6}\s/.test(t))
        return "heading";
    if (/^[+-]{3}\s|^@@ |^[+-][^+-]/m.test(t))
        return "diff";
    if (/^[[{]/.test(t) && /[}\]]$/.test(t))
        return "json";
    if (/^\|.*\|$/m.test(t))
        return "table";
    if (/^\s*[-*]\s|^\s*\d+[.)]\s/m.test(t))
        return "list";
    if (/^\[?\d{4}-\d{2}-\d{2}|^(ERROR|WARN|INFO|DEBUG|TRACE)\b/m.test(t))
        return "log";
    if (/[;{}]\s*$|^\s*(function|class|const|let|var|def|import|export|fn|pub|impl)\b/m.test(t)) {
        return "code";
    }
    return "prose";
}
export function normalize(input) {
    return input
        .normalize("NFKC")
        .replace(/[​-‍﻿]/g, "") // zero-width junk from copy-paste
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}
export function segment(input, pinPatterns = []) {
    const blocks = [];
    const lines = input.split("\n");
    let buf = [];
    let bufStart = 0;
    let cursor = 0;
    let inFence = false;
    let fenceLang = "";
    const flush = (kindHint) => {
        const text = buf.join("\n").trim();
        buf = [];
        if (!text)
            return;
        const kind = kindHint ?? classify(text);
        blocks.push({
            id: blocks.length,
            kind,
            text,
            start: bufStart,
            tokens: estimate(text),
            pinned: pinPatterns.some((r) => r.test(text)),
            score: 0,
        });
    };
    for (const line of lines) {
        if (FENCE.test(line)) {
            if (inFence) {
                buf.push(line);
                flush(fenceLang === "json" ? "json" : "code");
                inFence = false;
                fenceLang = "";
            }
            else {
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
        }
        else if (/^#{1,6}\s/.test(line)) {
            flush();
            bufStart = cursor;
            buf.push(line);
            flush("heading");
            bufStart = cursor + line.length + 1;
        }
        else {
            if (!buf.length)
                bufStart = cursor;
            buf.push(line);
        }
        cursor += line.length + 1;
    }
    flush();
    return blocks;
}
