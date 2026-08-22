/**
 * Inference providers.
 *
 * Kernly does not contain a model, and this file is where that stops being a
 * claim and becomes visible: everything here is an HTTP client. The compressor
 * decides what a model reads; something else does the reading, and swapping
 * which something is a matter of a request body shape.
 *
 * Two providers are wired up, and having both is not redundancy for its own
 * sake. Groq serves open-weights models a reader can download and run
 * themselves, which is what makes the claim on the site checkable rather than
 * merely stated. Google serves a closed model, which is what most people
 * actually deploy against. A compression layer that only worked in front of
 * models you can inspect would be a much smaller and much less useful thing, so
 * both are here and the interface labels which is which.
 */

export type ProviderId = "groq" | "google";

export interface ModelSpec {
  id: string;
  label: string;
  provider: ProviderId;
  /** Parameter count where the weights are published, null where they are not. */
  params: string | null;
  /**
   * Reasoning budget, in whatever vocabulary the provider uses.
   *
   * It is pinned per model rather than passed through, because the providers do
   * not agree and the wrong word is a hard 400: Groq's GPT-OSS pair takes
   * "low", Groq's Qwen takes only "none" or "default", and Google takes a token
   * count. It is kept minimal throughout on purpose — a long private chain of
   * thought bills as output and would blur the token comparison this page
   * exists to make.
   */
  reasoning: string | number;
}

export const MODELS: Record<string, ModelSpec> = {
  "openai/gpt-oss-20b": {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    provider: "groq",
    params: "20B",
    reasoning: "low",
  },
  "qwen/qwen3.6-27b": {
    id: "qwen/qwen3.6-27b",
    label: "Qwen 3.6 27B",
    provider: "groq",
    params: "27B",
    reasoning: "none",
  },
  "openai/gpt-oss-120b": {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    provider: "groq",
    params: "120B",
    reasoning: "low",
  },
  "gemini-flash-latest": {
    id: "gemini-flash-latest",
    label: "Gemini Flash",
    provider: "google",
    params: null,
    reasoning: 0,
  },
};

export const DEFAULT_MODEL = "openai/gpt-oss-20b";

export interface Completion {
  answer: string;
  /** The provider's own count of what it received. This is what decides the bill. */
  promptTokens: number | null;
  completionTokens: number | null;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Reasoning models still emit their scratchpad inline as a <think> block often
 * enough that stripping it belongs here rather than in the client. The client
 * should not have to know which model has which quirk, and a scratchpad landing
 * in the comparison pane reads as part of the answer.
 */
function clean(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/i, "")
    .trim();
}

export function keyFor(provider: ProviderId): string | undefined {
  return provider === "groq" ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY;
}

export async function complete(
  model: ModelSpec,
  system: string,
  user: string,
  key: string,
): Promise<Completion> {
  return model.provider === "groq"
    ? groq(model, system, user, key)
    : google(model, system, user, key);
}

/* -------------------------------------------------------------------- groq */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function groq(
  model: ModelSpec,
  system: string,
  user: string,
  key: string,
): Promise<Completion> {
  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
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
    throw new ProviderError("Could not reach Groq.", 502);
  }

  if (!res.ok) throw await upstream("Groq", res);

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  return {
    answer: clean(json.choices?.[0]?.message?.content ?? ""),
    promptTokens: json.usage?.prompt_tokens ?? null,
    completionTokens: json.usage?.completion_tokens ?? null,
  };
}

/* ------------------------------------------------------------------ google */

async function google(
  model: ModelSpec,
  system: string,
  user: string,
  key: string,
): Promise<Completion> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.id)}` +
    ":generateContent";

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": key },
      body: JSON.stringify({
        // Google keeps the system prompt in a field of its own rather than as a
        // message with a role, so the two providers cannot share a body.
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          // Flash thinks by default and bills it. Zero keeps the comparison
          // about the prompt, which is the only part Kernly touches.
          thinkingConfig: { thinkingBudget: model.reasoning as number },
        },
      }),
    });
  } catch {
    throw new ProviderError("Could not reach Google.", 502);
  }

  if (!res.ok) throw await upstream("Google", res);

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };

  const parts = json.candidates?.[0]?.content?.parts ?? [];
  return {
    answer: clean(parts.map((p) => p.text ?? "").join("")),
    promptTokens: json.usageMetadata?.promptTokenCount ?? null,
    completionTokens: json.usageMetadata?.candidatesTokenCount ?? null,
  };
}

/* ------------------------------------------------------------------ shared */

async function upstream(name: string, res: Response): Promise<ProviderError> {
  const detail = await res.text().catch(() => "");
  // A rate limit on a shared demo key is the ordinary case rather than an
  // anomaly, and deserves a sentence a visitor can act on instead of a raw
  // upstream dump.
  if (res.status === 429) {
    return new ProviderError(
      `${name} is rate limiting the shared demo key. Try again shortly.`,
      429,
    );
  }
  return new ProviderError(`${name} returned ${res.status}. ${detail.slice(0, 300)}`, 502);
}
