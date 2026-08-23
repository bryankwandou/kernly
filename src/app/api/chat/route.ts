import { compress } from "@kernly/core";
import { clientKey, take, LIMIT } from "@/lib/ratelimit";
import { MODELS, DEFAULT_MODEL, complete, keyFor, ProviderError } from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * One question, one model, one of two treatments of the reference material.
 *
 * The page calls this twice for every question — once with the document intact
 * and once with the compressed version — and shows both replies. That is the
 * only honest way to present a compression claim: the comparison has to be
 * visible, and it has to be possible for the compressed answer to come out
 * worse. It sometimes does, and the receipt says so before you read it.
 *
 * The model is validated against an allowlist rather than passed through. The
 * keys live on the server, so an unvalidated model field would let a caller aim
 * our credit wherever they liked.
 */

type Body = {
  question?: unknown;
  context?: unknown;
  model?: unknown;
  ratio?: unknown;
  mode?: unknown;
  locale?: unknown;
};

/**
 * Endonyms, so the instruction names the language the way the language names
 * itself. "Reply in Bahasa Indonesia" is followed more reliably than "reply in
 * Indonesian", and the difference is larger on the smaller models here.
 */
const LANGUAGES: Record<string, string> = {
  en: "English",
  id: "Bahasa Indonesia",
  es: "español",
  pt: "português",
  fr: "français",
  de: "Deutsch",
  it: "italiano",
  nl: "Nederlands",
  pl: "polski",
  ru: "русский",
  uk: "українська",
  tr: "Türkçe",
  vi: "tiếng Việt",
  th: "ภาษาไทย",
  hi: "हिन्दी",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
};

function languageRule(locale: string | null): string {
  // Falling back to the question's own language rather than to English. A
  // visitor who never touched the language picker but typed in Thai has told
  // you what they read, and defaulting to English would ignore it.
  return locale && LANGUAGES[locale]
    ? `Reply in ${LANGUAGES[locale]}, regardless of what language the reference material is written in.`
    : "Reply in the same language the question was asked in, regardless of what language the reference material is written in.";
}

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const verdict = take(clientKey(req));
  if (!verdict.ok) {
    return Response.json(
      {
        error:
          `The hosted demo allows ${LIMIT} questions a minute per visitor so the shared key ` +
          `survives the day. Try again in ${verdict.retryAfter}s, or run the compressor with ` +
          `no key at all on /playground.`,
      },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("Request body was not valid JSON.");
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const context = typeof body.context === "string" ? body.context : "";
  if (!question) return bad("Ask a question.");
  if (question.length > 2000) return bad("Question is capped at 2000 characters.");
  if (context.length > 60000) return bad("Context is capped at 60000 characters.");

  const modelKey =
    typeof body.model === "string" && body.model in MODELS ? body.model : DEFAULT_MODEL;
  const model = MODELS[modelKey];

  const key = keyFor(model.provider);
  if (!key) {
    return bad(
      `No key for ${model.provider} is configured on this deployment, so ${model.label} is off. ` +
        `Pick another model, or run the compressor with no key at all on /playground.`,
      503,
    );
  }

  const locale =
    typeof body.locale === "string" && body.locale in LANGUAGES ? body.locale : null;

  const rawRatio = typeof body.ratio === "number" ? body.ratio : 0.4;
  const ratio = Math.min(0.9, Math.max(0.05, rawRatio));

  // "full" sends the context untouched; "kernly" sends the compressed version.
  const mode = body.mode === "full" ? "full" : "kernly";

  let sent = context;
  let receipt = null;
  let escalate = false;

  if (mode === "kernly" && context) {
    const result = await compress(context, { ratio, query: question });
    sent = result.output;
    escalate = result.receipt.escalate;
    receipt = {
      tokensIn: result.receipt.tokensIn,
      tokensOut: result.receipt.tokensOut,
      digest: result.receipt.digest,
      confidence: result.receipt.confidence,
      queryCoverage: result.receipt.queryCoverage,
      escalate: result.receipt.escalate,
    };
  }

  // The model is not fenced into the reference material, and the first version
  // of this prompt was.
  //
  // "Answer using only the reference material" is the reflex instruction for a
  // RAG demo and it was the wrong one here. Asked anything the four sample
  // documents did not cover, both columns refused in unison, which tells a
  // visitor nothing about compression and everything about a guardrail. Worse,
  // it made the page look like the model had been lobotomised to hide something
  // — the exact suspicion a tool built on "check it yourself" cannot afford.
  //
  // The comparison does not need the fence. Both columns get this identical
  // prompt and the same question; the only variable is whether the material was
  // compressed. What the fence bought was a guarantee that a correct answer
  // proves retrieval worked, and that is bought more honestly by asking the
  // model to say where its answer came from. A visitor can then see for
  // themselves when the compressed column has fallen back on prior knowledge,
  // which is a compression failure worth seeing rather than one worth hiding.
  const system = [
    "Answer the question directly and concretely.",
    "Reference material may be supplied. When it answers the question, use it and prefer it over what you already know.",
    "When it does not, open with the exact sentence [Not in the reference material.] and then still answer the question from your own knowledge.",
    "That marker is a prefix, never the whole reply. If you genuinely do not know, say what you do not know and why, in a sentence of your own after it.",
    "Never invent details and attribute them to the material.",
    "Keep it short unless the question needs length.",
    // The interface speaks nineteen languages and the model was answering all
    // of them in English. Asked "siapa itu vinbryyt" through an Indonesian UI,
    // both columns replied "I do not know who vinbryyt is" — which is a correct
    // answer delivered as though the question had been an inconvenience.
    //
    // The reference material is frequently in a different language from the
    // question, and that is the case this has to get right: an English
    // Wikipedia article read by an Indonesian speaker should still produce an
    // Indonesian answer. The material's language is not the reader's.
    languageRule(locale),
    // The marker stays English in every language, because the client matches on
    // it to decide whether to show the badge, and a translated marker would be
    // silently unrecognised. The badge the reader actually sees is drawn from
    // the interface dictionary, so nobody reads the English.
    "Write the [Not in the reference material.] marker in English exactly as given, whatever language the rest of the answer is in.",
  ].join(" ");

  const user = sent
    ? `Reference material:\n\n${sent}\n\n---\n\nQuestion: ${question}`
    : question;

  const started = Date.now();

  let out;
  try {
    out = await complete(model, system, user, key);
  } catch (e) {
    if (e instanceof ProviderError) return bad(e.message, e.status);
    return bad("The inference request failed.", 502);
  }

  return Response.json({
    mode,
    model: {
      key: modelKey,
      label: model.label,
      params: model.params,
      provider: model.provider,
    },
    answer: out.answer,
    escalate,
    receipt,
    // promptTokens is the provider's own count for what it actually received.
    // It is the number that decides the bill, so it carries more weight here
    // than Kernly's internal estimate, and the two are reported separately
    // rather than blended into one figure.
    promptTokens: out.promptTokens,
    completionTokens: out.completionTokens,
    elapsedMs: Date.now() - started,
  });
}
