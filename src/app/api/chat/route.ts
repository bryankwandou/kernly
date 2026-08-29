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
  // Matches what /api/fetch will hand back. The two caps have to move together:
  // a fetcher that returns 400,000 characters into a chat route that refuses
  // above 60,000 is a loader that silently produces unusable input.
  //
  // Sending this much uncompressed will be refused by every provider here, and
  // that is not a reason to reject it locally. Watching the full column bounce
  // while the compressed one answers is the comparison this page exists to
  // show, and pre-empting it with our own error would replace the provider's
  // verdict with our opinion of it.
  if (context.length > 400_000) return bad("Context is capped at 400000 characters.");

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
  // Whether any material was supplied at all changes what the rules should say.
  //
  // With a document loaded, the marker earns its place: it is how a reader tells
  // an answer the compression carried from one the model already knew, which is
  // the difference the two columns exist to show. With the box empty there is no
  // reference material for an answer to be outside of, and demanding the model
  // announce that its knowledge is "not in the reference material" is both
  // meaningless and the thing that makes this read like a support bot rather
  // than somewhere you can simply ask a question.
  const grounded = context.trim().length > 0;

  const system = [
    "Answer the question directly and concretely.",
    ...(grounded
      ? [
          "Reference material has been supplied. When it answers the question, use it and prefer it over what you already know.",
          "When it does not, open with the exact sentence [Not in the reference material.] and then still answer the question from your own knowledge.",
          "That marker is a prefix, never the whole reply.",
          // "When it does not answer the question" was read by some models as
          // "when it does not answer the question completely", and Gemini Flash
          // Lite then marked two replies in three that had plainly come out of
          // the material. That error flatters this page — a false marker on the
          // uncompressed column makes the compressed one look like the only
          // side that worked — which is exactly the kind of error to be least
          // willing to leave in place.
          "The marker is about origin, not completeness. Use it only when the material contributed nothing at all to your answer. If any part of what you write came from the material, do not use the marker, even where the material was thin, partial, or left most of the question to you.",
        ]
      : [
          "No reference material was supplied, so answer from your own knowledge as you normally would, with no marker and no preamble about material.",
        ]),
    // The escape hatch this used to offer — "if you genuinely do not know, say
    // what you do not know and why" — was written for honesty and read as
    // permission. GPT-OSS ignored it and answered; Qwen took it every time,
    // declining to estimate an average income it plainly has some knowledge of,
    // with material supplied and equally with none supplied at all. A model
    // being cautious is not a fault, but a prompt that hands out a way to say
    // nothing will be taken up by whichever model is most cautious, and the
    // page then reads as though that model were incapable.
    "Do not decline because the reference material is about something else. Material that has nothing to do with the question is the same as no material: ignore it and answer.",
    // Ordered ahead of the permission to estimate, because the two pull against
    // each other and a 20B model resolves whichever it read last. With the
    // estimate rule first, one run in three still produced an invented career
    // for a name it did not know.
    "Names first. If you do not recognise a specific person, company, product or place, say plainly that you do not know of them, and stop there.",
    // Naming the shape of the failure, because the abstract rule alone did not
    // catch it. The invented biographies were built entirely from category
    // words — "a professional in information technology", "known for his work on
    // distributed systems" — with no fact in them that anyone could check. That
    // is what fabrication looks like from the inside, and a model can be asked
    // to notice it.
    "The test: can you state one checkable fact about them — a dated role, a named work, a place? If not, you do not know them. A description assembled only from plausible categories, with nothing in it anyone could verify, is fabrication however fluent it reads, and no caveat rescues it.",
    "Never assemble a biography, history or description for a name you do not recognise.",
    // The counterweight, added because the rule above overshot. Written only as
    // a prohibition it made the model timid about people it plainly knows —
    // asked what a well-known Indonesian YouTuber was worth, it declined
    // outright rather than giving the range it clearly had. Not knowing a name
    // is the narrow exception here, not the default posture.
    "When you do recognise the name, answer properly and at length: who they are, what they are known for, dates and figures where you have them. Caution belongs to names you do not know, and applying it to names you do know withholds an answer you actually have.",
    "For a name you partly recognise, give what you are confident of and mark the rest as uncertain — that is different from refusing.",
    "An approximate answer is wanted for anything general — a statistic, a date, a quantity, how something works. A rough figure, a range or a typical case beats a refusal; give the estimate and say how firm it is.",
    "Only say you cannot answer when you have nothing at all on the subject. Being unsure is not the same as having nothing.",
    // The line above, without the two below, produced invented biographies.
    //
    // Asked about a named individual it did not recognise, the model returned a
    // fluent paragraph making him a Kenyan philanthropist who founded a
    // foundation — and the other column, same model, same question, made him a
    // distributed-systems engineer who speaks at conferences. Both were whole
    // cloth. That is a far worse failure than the refusal it replaced, and it is
    // the failure this page is least able to survive, because a compression demo
    // that invents its answers is measuring nothing.
    //
    // The distinction is between estimating and fabricating, and it is not
    // subtle. A national income figure is interpolated from real knowledge of a
    // real country and is honest when marked as approximate. A stranger's
    // employment history is not an estimate of anything — there is nothing to
    // interpolate from, so every specific in it is invented. "Approximately"
    // cannot be attached to a fact that was never known.
    "Never invent details and attribute them to the material, and never present a guess as a fact — say it is an estimate.",
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
    ...(grounded
      ? ["Write the [Not in the reference material.] marker in English exactly as given, whatever language the rest of the answer is in."]
      : []),
  ].join(" ");

  const user = sent
    ? `Reference material:\n\n${sent}\n\n---\n\nQuestion: ${question}`
    : question;

  const started = Date.now();

  // When the chosen model has nothing left, ask its declared substitute.
  //
  // Gemini Flash's free daily allowance runs out and then returns 429 for the
  // rest of the day — six of six on one measurement, retries included, because
  // retrying a spent daily quota only fails more slowly. Leaving that as an
  // error means a model in the picker that simply cannot answer until tomorrow,
  // which reads as the project being broken rather than the key being small.
  //
  // Only quota errors fall back. A 400 is a bad request and would be equally bad
  // at the substitute; a 413 is the context not fitting, which on this site is
  // the result being demonstrated rather than a fault to route around.
  let out;
  let served = model;
  let fellBackFrom: string | null = null;

  try {
    out = await complete(model, system, user, key);
  } catch (e) {
    const quota = e instanceof ProviderError && (e.status === 429 || e.status === 503);
    const alt = quota && model.fallback ? MODELS[model.fallback] : undefined;
    const altKey = alt ? keyFor(alt.provider) : null;

    if (!alt || !altKey) {
      if (e instanceof ProviderError) return bad(e.message, e.status);
      return bad("The inference request failed.", 502);
    }

    try {
      out = await complete(alt, system, user, altKey);
      served = alt;
      fellBackFrom = model.label;
    } catch (e2) {
      // The substitute failed too. Report the original failure, since that is
      // the model the caller asked for and the one they need to know about.
      if (e instanceof ProviderError) return bad(e.message, e.status);
      return bad("The inference request failed.", 502);
    }
  }

  return Response.json({
    mode,
    model: {
      key: served.id,
      label: served.label,
      params: served.params,
      provider: served.provider,
    },
    // Names the model that was asked for when it is not the one that answered.
    // The page renders this above the reply, because a comparison silently run
    // against a different model is not the comparison the reader set up.
    fellBackFrom,
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
