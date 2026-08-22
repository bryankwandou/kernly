import { compress } from "@kernly/core";
import { clientKey, take, LIMIT } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Models are pinned to an allowlist rather than passed through. The key lives on
 * the server, so an unvalidated model field would let a caller aim our credit at
 * whatever endpoint they liked. Every entry is an open-weights model a reader can
 * download and run themselves, which matters because the claim on the page is
 * that Kernly is the compression layer and the model is someone else's.
 *
 * The reasoning budget is pinned per model too. Groq accepts the setting on all
 * three but does not agree on the vocabulary: the GPT-OSS pair takes "low",
 * while Qwen takes only "none" or "default", and the wrong word is a hard 400.
 * The budget is kept minimal on purpose, since a long private chain of thought
 * is billed as output and would muddy the token comparison this page exists to
 * make.
 */
const MODELS: Record<
  string,
  { id: string; label: string; params: string; reasoning: string }
> = {
  "openai/gpt-oss-20b": {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    params: "20B",
    reasoning: "low",
  },
  "qwen/qwen3.6-27b": {
    id: "qwen/qwen3.6-27b",
    label: "Qwen 3.6 27B",
    params: "27B",
    reasoning: "none",
  },
  "openai/gpt-oss-120b": {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    params: "120B",
    reasoning: "low",
  },
};

const DEFAULT_MODEL = "openai/gpt-oss-20b";

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
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return bad(
      "No GROQ_API_KEY is configured on this deployment, so the hosted chat is off. The compressor itself needs no key — see /playground.",
      503,
    );
  }

  const verdict = take(clientKey(req));
  if (!verdict.ok) {
    return Response.json(
      {
        error: `The hosted demo allows ${LIMIT} questions a minute per visitor so the shared key survives the day. Try again in ${verdict.retryAfter}s, or run the compressor with no key at all on /playground.`,
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

  const modelKey = typeof body.model === "string" && body.model in MODELS ? body.model : DEFAULT_MODEL;
  const model = MODELS[modelKey];

  const rawRatio = typeof body.ratio === "number" ? body.ratio : 0.35;
  const ratio = Math.min(0.9, Math.max(0.05, rawRatio));

  // "full" sends the context untouched; "kernly" sends the compressed version.
  // The page calls both and shows them side by side, which is the only honest
  // way to present a compression claim: the comparison has to be visible, and
  // it has to be possible for the compressed answer to come out worse.
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

  let upstream: Response;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model.id,
        temperature: 0.2,
        max_tokens: 800,
        reasoning_effort: model.reasoning,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    return bad("Could not reach the inference provider.", 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    // Rate limits are the common case on a shared demo key and deserve a
    // message a visitor can act on rather than a raw upstream dump.
    if (upstream.status === 429) {
      return bad("The shared demo key is rate limited right now. Try again shortly.", 429);
    }
    return bad(`Inference provider returned ${upstream.status}. ${detail.slice(0, 300)}`, 502);
  }

  const json = (await upstream.json()) as {
    choices?: { message?: { content?: string; reasoning?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const message = json.choices?.[0]?.message;

  // Some open-weights models still emit their scratchpad inline as a <think>
  // block even with the reasoning budget turned down. Left in, it would land in
  // the comparison pane and read as part of the answer, so it is removed here
  // rather than in the client — the client should not have to know which model
  // has which quirk.
  const answer = (message?.content ?? "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/i, "")
    .trim();

  return Response.json({
    mode,
    model: { key: modelKey, label: model.label, params: model.params },
    answer,
    escalate,
    receipt,
    // promptTokens is the provider's own count for what it actually received.
    // It is the number that decides the bill, so it is more meaningful here
    // than Kernly's internal estimate, and the two are reported separately
    // rather than blended.
    promptTokens: json.usage?.prompt_tokens ?? null,
    completionTokens: json.usage?.completion_tokens ?? null,
    elapsedMs: Date.now() - started,
  });
}
