/**
 * Deterministic sha256 over (normalized input, output, canonical config).
 *
 * The digest is the only thing Kernly ever writes on-chain. It is what turns a
 * savings claim from marketing copy into something a third party can check:
 * re-run the pipeline with the published config, hash the result, compare.
 *
 * Implemented against WebCrypto so the same code path runs in the browser, in
 * an edge function and in Node 18+, with no native module and no polyfill.
 */

export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return "{" + entries.map(([k, v]) => JSON.stringify(k) + ":" + canonical(v)).join(",") + "}";
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(digest);
}

export async function receiptDigest(
  normalizedInput: string,
  output: string,
  config: unknown,
): Promise<string> {
  // Length prefixes stop a crafted input from impersonating a config boundary.
  const payload = [
    "kernly/v1",
    normalizedInput.length,
    await sha256(normalizedInput),
    output.length,
    await sha256(output),
    await sha256(canonical(config)),
  ].join("|");
  return sha256(payload);
}
