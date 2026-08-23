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
   * count — except on Flash Lite, which rejects the field outright. It is kept
   * minimal wherever it is accepted, on purpose: a long private chain of thought
   * bills as output and would blur the token comparison this page exists to
   * make.
   *
   * null means the model does not take the parameter at all and it is omitted
   * from the request, which is not the same as asking for zero.
   */
  reasoning: string | number | null;
  /**
   * Prompt tokens this deployment can actually push at the model in one minute,
   * or null where the ceiling is high enough not to matter for a demo.
   *
   * This is a property of the key, not of the model. Groq's on-demand tier meters
   * tokens per minute rather than per request, and the shared key here sits on
   * the free allowance: a 60,000-character article is refused with HTTP 413 and
   * a message naming the number. That refusal is a good demonstration and a bad
   * surprise, so the figure is declared here and the page warns before spending
   * the call rather than after.
   *
   * 8,000 is measured, not assumed — it is the number Groq returned. The Google
   * entries are null because their ceiling is far above anything this page will
   * send, not because it is unlimited.
   */
  ceiling: number | null;
}

export const MODELS: Record<string, ModelSpec> = {
  "openai/gpt-oss-20b": {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    provider: "groq",
    params: "20B",
    reasoning: "low",
    ceiling: 8000,
  },
  "qwen/qwen3.6-27b": {
    id: "qwen/qwen3.6-27b",
    label: "Qwen 3.6 27B",
    provider: "groq",
    params: "27B",
    reasoning: "none",
    ceiling: 8000,
  },
  "openai/gpt-oss-120b": {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    provider: "groq",
    params: "120B",
    reasoning: "low",
    ceiling: 8000,
  },
  "gemini-flash-latest": {
    id: "gemini-flash-latest",
    label: "Gemini Flash",
    provider: "google",
    params: null,
    reasoning: 0,
    ceiling: null,
  },
  // A second Google entry, because the first one is whatever Google is
  // currently promoting and therefore whatever is currently busiest. A visitor
  // who hits capacity needs somewhere to go that is not "come back later".
  //
  // This slot held a pinned version, gemini-2.5-flash, until it started
  // answering 404: "no longer available to new users". Pinning was the wrong
  // instinct. A pinned id is stable right up to the day the provider retires it
  // for new callers, and then it is dead with no warning and no fallback, which
  // is a worse failure than an alias quietly moving under you. The maintained
  // aliases are the ones Google commits to keeping resolvable, so both entries
  // are aliases now and the second is a genuinely smaller model rather than a
  // different label on the same capacity.
  "gemini-flash-lite-latest": {
    id: "gemini-flash-lite-latest",
    label: "Gemini Flash Lite",
    provider: "google",
    params: null,
    // Flash Lite answers 400 INVALID_ARGUMENT if thinkingConfig is present at
    // all, including a budget of zero. It does not think by default, so
    // omitting the field asks for the same behaviour the other Google entry
    // gets by setting it.
    reasoning: null,
    ceiling: null,
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

/**
 * Transient upstream failures, retried rather than shown.
 *
 * A model being momentarily busy is not a fact about this project, but it
 * arrives looking like one: the page says the request failed, next to a column
 * of compression figures, and a reader draws the obvious wrong conclusion.
 * Gemini Flash did exactly this once during testing and answered normally on
 * the next attempt seconds later.
 *
 * Only 503 and 429 are retried, and only those. A 400 means the request was
 * wrong and will be wrong again; a 413 means the context did not fit, which on
 * this site is a result worth showing rather than a fault worth hiding. Both
 * surface immediately.
 *
 * Two retries at 700ms and 1900ms. The budget is bounded by the route's 60s
 * limit and by a visitor watching a spinner: past a couple of seconds, an
 * honest error beats a longer wait.
 */
const RETRY_DELAYS_MS = [700, 1900];

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * A 429 is not one thing, and retrying it depends on which one it is.
 *
 * Groq's is the 8,000-token-per-minute ceiling on the free tier. That window
 * clears in up to sixty seconds, so retrying inside three is guaranteed waste
 * and merely delays an honest error by that much. Google's tends to be a short
 * burst against a much larger quota, where a second is often enough.
 *
 * So 503 is retried for both — it is capacity everywhere — and 429 only for
 * Google. Getting this wrong in the generous direction would have made every
 * Groq ceiling demonstration on this site three seconds slower for nothing,
 * which matters because that demonstration is the point of the page.
 */
function retryable(e: unknown, provider: ModelSpec["provider"]): boolean {
  if (!(e instanceof ProviderError)) return false;
  if (e.status === 503) return true;
  return e.status === 429 && provider === "google";
}

export async function complete(
  model: ModelSpec,
  system: string,
  user: string,
  key: string,
): Promise<Completion> {
  const call = () =>
    model.provider === "groq"
      ? groq(model, system, user, key)
      : google(model, system, user, key);

  let last: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await call();
    } catch (e) {
      last = e;
      if (!retryable(e, model.provider) || attempt === RETRY_DELAYS_MS.length) break;
      await pause(RETRY_DELAYS_MS[attempt]);
    }
  }
  throw last;
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

  const body = JSON.stringify({
    // Google keeps the system prompt in a field of its own rather than as a
    // message with a role, so the two providers cannot share a body.
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 800,
      // Flash thinks by default and bills it. Zero keeps the comparison about
      // the prompt, which is the only part Kernly touches. Models that do not
      // take the field are sent no field, rather than a zero they will reject.
      ...(model.reasoning === null
        ? {}
        : { thinkingConfig: { thinkingBudget: model.reasoning as number } }),
    },
  });

  const send = () =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": key },
      body,
    });

  let res: Response;
  try {
    res = await send();
    // Google answers 503 when the model is busy and says in the message that
    // the spike is usually temporary. One more attempt is worth the second it
    // costs: a visitor comparing two answers has no use for half a comparison,
    // and without the retry the page intermittently looks broken for a reason
    // that has nothing to do with compression. One retry only — past that the
    // outage is real and should be reported as one.
    if (res.status === 503) {
      await new Promise((r) => setTimeout(r, 800));
      res = await send();
    }
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
  // Capacity, not configuration. Saying which keeps a visitor from concluding
  // the compressor broke when the only thing that happened is somebody else's
  // model being busy.
  if (res.status === 503) {
    return new ProviderError(
      `${name} says this model is busy right now. That is upstream capacity and nothing to do ` +
        `with the compression — pick another model, or try again in a moment.`,
      503,
    );
  }
  return new ProviderError(`${name} returned ${res.status}. ${detail.slice(0, 300)}`, 502);
}
