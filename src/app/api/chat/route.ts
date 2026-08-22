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
};

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

  const system = [
    "Answer using only the reference material provided.",
    "If the material does not contain the answer, say so plainly instead of guessing.",
    "Be brief and concrete.",
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
