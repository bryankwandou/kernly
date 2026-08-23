/**
 * A small fixed-window limiter for the hosted chat route.
 *
 * The demo key is shared and the endpoint is public, so without this a single
 * script can drain the credit in minutes. The counter lives in module scope,
 * which means each serverless instance keeps its own tally and the real ceiling
 * is the limit multiplied by however many instances are warm. That is a weaker
 * guarantee than a shared store like Redis or Vercel KV would give, and it is
 * recorded here rather than glossed over: the purpose is to stop casual abuse
 * cheaply, not to survive a determined attacker.
 */

const WINDOW_MS = 60_000;
// Each question in the chat costs two calls, one per column, so this is really
// ten questions a minute rather than twenty. Eight was too tight for anyone
// actually trying the thing: four questions and a demo stops mid-sentence.
const MAX_PER_WINDOW = 20;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Trims expired entries so an instance that stays warm for days cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 512) return;
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
}

export function clientKey(req: Request): string {
  // Vercel sets x-forwarded-for; the left-most entry is the original client.
  // Anything further right was appended by a proxy and is not trustworthy.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export type RateVerdict = { ok: true } | { ok: false; retryAfter: number };

export function take(key: string): RateVerdict {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (existing.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

export const LIMIT = MAX_PER_WINDOW;
