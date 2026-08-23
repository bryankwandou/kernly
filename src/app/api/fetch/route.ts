import { clientKey, take } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Pull a public web page in as reference material.
 *
 * The demo shipped with four sample documents totalling a few thousand
 * characters, and the largest of them is 1,556. That is too small to
 * demonstrate the thing this project claims: at that size the interesting
 * question — which of two hundred blocks survive a budget — never arises,
 * because there are eleven blocks. A visitor could reasonably conclude the
 * compressor had never been tried on anything real, and nothing on the page
 * contradicted them.
 *
 * So the page now takes a URL. Paste a long Wikipedia article or an RFC, watch
 * forty thousand characters go to eight, and ask a question whose answer sits
 * somewhere in the middle. That is a test the samples cannot be arranged to
 * pass in advance.
 */

/** Anything above this and the compressor is being asked to prove a point the slider already made. */
const MAX_BYTES = 2_000_000;
const MAX_CHARS = 60_000;
const TIMEOUT_MS = 12_000;

/**
 * Hosts that must never be reachable through this endpoint.
 *
 * A server-side fetcher that accepts a user-supplied URL is a confused deputy:
 * it runs inside the deployment's network with the deployment's reachability,
 * so `http://169.254.169.254/` asks it to read cloud instance credentials and
 * `http://localhost:3000/api/...` asks it to call back into this app. The
 * request is refused before any connection opens.
 *
 * DNS rebinding is the hole this does not close — a hostname that resolves
 * public on this check and private on the socket. Closing it properly means
 * resolving the name here and pinning the connection to that address, which
 * Node's fetch does not expose. What limits the damage instead is that the
 * response is handed to the caller as text and never interpreted: there is no
 * secret in this deployment that a returned page body could exfiltrate, since
 * the API keys are read from the environment and never rendered.
 */
const BLOCKED = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^::1$/,
  /^\[?::1\]?$/,
  /^fe80:/i,
  /^f[cd][0-9a-f]{2}:/i,
  /\.internal$/i,
  /\.local$/i,
];

function refuse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * HTML to something worth compressing.
 *
 * This is a stripper, not a parser, and the difference is deliberate: a real
 * readability implementation is a dependency with a maintenance surface, and
 * what Kernly needs from a page is prose with the furniture removed. Script,
 * style, nav, header, footer and aside go first — they are the parts that would
 * otherwise dominate the token count and teach the compressor to be impressed
 * with itself for deleting a cookie banner.
 */
function textFrom(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(nav|header|footer|aside|form)\b[\s\S]*?<\/\1>/gi, "")
    // Block-level tags become paragraph breaks, so the segmenter sees the
    // document's real shape instead of one enormous run-on line.
    .replace(/<\/(p|div|section|article|li|tr|h[1-6]|blockquote|pre)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: Request) {
  // Shares the chat's budget on purpose. Fetching is cheaper than inference,
  // but an unmetered fetcher is a free proxy with somebody else's bandwidth.
  const verdict = take(clientKey(req));
  if (!verdict.ok) {
    return Response.json(
      { error: `Too many requests. Try again in ${verdict.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } },
    );
  }

  let raw: string;
  try {
    const body = (await req.json()) as { url?: unknown };
    raw = typeof body.url === "string" ? body.url.trim() : "";
  } catch {
    return refuse("Request body was not valid JSON.");
  }
  if (!raw) return refuse("Give a URL to load.");

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return refuse("That is not a URL this can parse.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return refuse("Only http and https are fetched.");
  }
  if (BLOCKED.some((re) => re.test(url.hostname))) {
    return refuse(
      "That address is on the deployment's own network, so this endpoint will not fetch it. " +
        "Paste the text directly instead.",
    );
  }

  const abort = AbortSignal.timeout(TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      signal: abort,
      redirect: "follow",
      headers: {
        // Named honestly. A fetcher that disguises itself as a browser is
        // asking site operators not to be able to block it, and this one has no
        // business being unblockable.
        "User-Agent": "KernlyBot/1.0 (+https://kernly.vercel.app; context compression demo)",
        Accept: "text/html,text/plain;q=0.9,*/*;q=0.5",
      },
    });
  } catch {
    return refuse(`Could not reach ${url.hostname}. It may be down, slow, or refusing bots.`, 502);
  }

  if (!res.ok) {
    return refuse(`${url.hostname} answered ${res.status}.`, 502);
  }

  const type = res.headers.get("content-type") ?? "";
  if (!/text\/html|text\/plain|application\/(xhtml|json|xml)/i.test(type)) {
    return refuse(
      `That URL serves ${type.split(";")[0] || "an unknown type"}. This reads text pages, not binaries.`,
    );
  }

  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return refuse("That page is larger than 2 MB.");

  let html: string;
  try {
    html = await res.text();
  } catch {
    return refuse("The page could not be read as text.", 502);
  }
  // Checked again after reading, because content-length is optional and a
  // chunked response can arrive at any size regardless of what it promised.
  if (html.length > MAX_BYTES) return refuse("That page is larger than 2 MB.");

  const text = /html|xml/i.test(type) ? textFrom(html) : html.trim();
  if (text.length < 200) {
    return refuse(
      "Almost nothing came back as text. The page is probably rendered by JavaScript, " +
        "which this cannot run. Copy the text in by hand.",
    );
  }

  // Truncation is reported rather than silent: a visitor comparing token counts
  // needs to know the number they are looking at describes part of the page.
  const truncated = text.length > MAX_CHARS;

  const title = /<title[^>]*>([\s\S]{1,300}?)<\/title>/i.exec(html)?.[1]?.trim();

  return Response.json({
    url: url.toString(),
    title: title ? textFrom(title) : url.hostname,
    text: truncated ? text.slice(0, MAX_CHARS) : text,
    chars: Math.min(text.length, MAX_CHARS),
    truncated,
  });
}
