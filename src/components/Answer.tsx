import type { ReactNode } from "react";

/**
 * Render a model reply as text a person can read.
 *
 * The replies were previously dropped into a single pre-wrapped paragraph
 * exactly as the model wrote them, which meant every asterisk the model typed
 * arrived on screen as an asterisk. A numbered list of steps came out as
 *
 *   1. **Create a TikTok Account:** If you don't have one, sign up...
 *       *   To be at least 18 years old.
 *
 * and a reader working through a long answer had to mentally strip punctuation
 * from every heading in it. On the two-column screen, where the whole point is
 * to compare two replies closely, that is the difference between a page that
 * can be read and one that cannot.
 *
 * These models are instruction-tuned and they write Markdown whether or not
 * anyone asked. Telling them to stop is the weaker fix — it spends prompt
 * budget on formatting, it is obeyed inconsistently, and the structure is
 * genuinely useful. Rendering it is the fix.
 *
 * Deliberately small: bold, italic, inline code, bulleted and numbered lists,
 * and paragraphs. That is the whole of what these replies contain. A Markdown
 * library would pull in a parser and a sanitiser to gain headings and tables
 * that never appear here.
 *
 * Nothing here goes near dangerouslySetInnerHTML. The input is text a language
 * model produced from a document a visitor chose, which is the definition of
 * untrusted, and every branch below builds React elements instead of markup.
 * Angle brackets in a reply stay angle brackets on screen.
 */

/** Matches the inline spans, longest form first so `**a**` never reads as `*a*`. */
const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const tok = match[0];
    const key = `${keyPrefix}-${match.index}`;

    if (tok.startsWith("**") || tok.startsWith("__")) {
      out.push(
        <strong key={key} className="font-semibold">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("`")) {
      out.push(
        <code
          key={key}
          className="rounded bg-[color-mix(in_oklab,var(--husk)_16%,transparent)] px-1 py-0.5 font-mono text-[0.9em]"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else {
      out.push(
        <em key={key} className="italic">
          {tok.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + tok.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Item = { depth: number; marker: string | null; text: string };

const BULLET = /^(\s*)([-*•])\s+(.*)$/;
const NUMBER = /^(\s*)(\d{1,2})[.)]\s+(.*)$/;

/**
 * One blank-line-separated block, which is either a list or a paragraph.
 *
 * Models indent sub-points rather than nesting them in any structural way, so
 * indentation is all there is to go on. Two levels is as deep as these replies
 * ever go, and clamping there keeps a stray run of spaces from pushing a line
 * off the right edge of a narrow column.
 */
function Block({ lines, k }: { lines: string[]; k: string }) {
  const items: Item[] = [];
  let isList = true;

  for (const line of lines) {
    const b = BULLET.exec(line);
    const n = b ? null : NUMBER.exec(line);
    if (!b && !n) {
      isList = false;
      break;
    }
    const m = (b ?? n) as RegExpExecArray;
    items.push({
      depth: Math.min(1, Math.floor(m[1].length / 2)),
      marker: b ? null : `${m[2]}.`,
      text: m[3],
    });
  }

  if (isList && items.length > 0) {
    return (
      <ul className="my-1.5 space-y-1">
        {items.map((it, i) => (
          <li
            key={`${k}-${i}`}
            className="flex gap-2"
            style={{ paddingLeft: `${it.depth * 1.1}rem` }}
          >
            <span className="tnum shrink-0 text-[var(--muted)]">
              {it.marker ?? "•"}
            </span>
            <span className="min-w-0">{inline(it.text, `${k}-${i}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Not a list. Single newlines inside a paragraph are the model wrapping its
  // own prose, and they are kept rather than collapsed — a reply that put a
  // line break somewhere meant to.
  return (
    <p className="whitespace-pre-wrap">{inline(lines.join("\n"), k)}</p>
  );
}

export function Answer({ text }: { text: string }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.split("\n").filter((l) => l.trim().length > 0))
    .filter((b) => b.length > 0);

  return (
    <div className="space-y-2 text-[14px] leading-[1.65]">
      {blocks.map((lines, i) => (
        <Block key={`b${i}`} lines={lines} k={`b${i}`} />
      ))}
    </div>
  );
}
