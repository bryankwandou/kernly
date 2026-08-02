/**
 * Stage 5 - lexical compaction.
 *
 * This is the layer that the caveman extension by Julius Brussee popularised:
 * strip the grammar, keep the nouns. It is genuinely effective and genuinely
 * dangerous, so Kernly applies it under three constraints the naive version
 * does not have.
 *
 *   - It only ever touches blocks classified as prose. Code, JSON, diffs,
 *     tables and logs pass through byte-identical.
 *   - Anything inside backticks, quotes, brackets or a URL is protected, because
 *     that is where identifiers and literal values live.
 *   - Strength is a dial, not a switch. At 0.3 it only removes filler; at 1.0 it
 *     removes every determiner and copula it can find.
 *
 * See github.com/juliusbrussee/caveman for the original idea. Kernly's variant
 * is a reimplementation, not a fork, and carries no upstream code.
 */

const FILLER = [
  "basically", "actually", "essentially", "simply", "just", "really", "very",
  "quite", "rather", "somewhat", "fairly", "of course", "as you know",
  "it is worth noting that", "it should be noted that", "please note that",
  "keep in mind that", "needless to say",
];

const PHRASE: Array<[RegExp, string]> = [
  [/\bin order to\b/gi, "to"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bat this point in time\b/gi, "now"],
  [/\bfor the purpose of\b/gi, "for"],
  [/\bin the event that\b/gi, "if"],
  [/\ba large number of\b/gi, "many"],
  [/\bthe vast majority of\b/gi, "most"],
  [/\bis able to\b/gi, "can"],
  [/\bhas the ability to\b/gi, "can"],
  [/\bmake use of\b/gi, "use"],
  [/\bcarry out\b/gi, "do"],
  [/\bprior to\b/gi, "before"],
  [/\bsubsequent to\b/gi, "after"],
  [/\bwith regard to\b/gi, "re"],
  [/\bas well as\b/gi, "and"],
  [/\bin spite of\b/gi, "despite"],
];

/** Removed at strength >= 0.5. Grammar, not content. */
const DETERMINERS = /\b(the|a|an)\b/gi;
/** Removed at strength >= 0.75. Recoverable from context by any modern model. */
const COPULAS = /\b(is|are|was|were|be|been|being|am)\b/gi;
/** Removed at strength >= 0.9. The most aggressive setting available. */
const AUX = /\b(that|which|of|to|in|on|at|for|with|from)\b/gi;

/**
 * Spans that must survive verbatim: quoted strings, bracketed expressions,
 * URLs, emails, SCREAMING_CASE constants, call sites and numeric literals.
 */
const PROTECT =
  /(`[^`]*`|"[^"]*"|'[^']*'|\{[^}]*\}|\[[^\]]*\]|https?:\/\/\S+|[\w.-]+@[\w.-]+|\b[A-Z][A-Z0-9_]{2,}\b|\b\w+\(\)|\b\d[\d.,]*\b)/g;

const OPEN = String.fromCharCode(1);
const CLOSE = String.fromCharCode(2);

export interface LexicalResult {
  text: string;
  removed: number;
}

export function compact(text: string, strength: number): LexicalResult {
  if (strength <= 0) return { text, removed: 0 };

  // Placeholders are wrapped in control characters so the restore pass can
  // never collide with a numeric literal that was itself just protected.
  const vault: string[] = [];
  let work = text.replace(PROTECT, (m) => {
    vault.push(m);
    return OPEN + (vault.length - 1) + CLOSE;
  });

  for (const [re, to] of PHRASE) work = work.replace(re, to);

  if (strength >= 0.3) {
    for (const f of FILLER) {
      work = work.replace(new RegExp("\\b" + f.replace(/ /g, "\\s+") + "\\b,?\\s*", "gi"), "");
    }
  }
  if (strength >= 0.5) work = work.replace(DETERMINERS, "");
  if (strength >= 0.75) work = work.replace(COPULAS, "");
  if (strength >= 0.9) work = work.replace(AUX, "");

  work = work
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,;:!?])/g, "$1")
    .replace(/^[ \t,;]+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  work = work.replace(
    new RegExp(OPEN + "(\\d+)" + CLOSE, "g"),
    (_, i: string) => vault[Number(i)],
  );

  return { text: work, removed: text.length - work.length };
}
