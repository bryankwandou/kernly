/**
 * The four documents the deployed demo actually ships, as evaluation fixtures.
 *
 * These were not in the harness. The harness had its own nine synthetic
 * documents and the site had four samples in `src/lib/samples.ts`, and the two
 * sets never met. So the number quoted on the site was measured on documents no
 * visitor ever sees, while the documents every visitor does see were measured on
 * nothing at all.
 *
 * That gap was not academic. The postmortem sample is what the chat page opens
 * with, at a default ratio of 40 per cent, and at 40 per cent it drops the line
 * naming the cause while confidence reports 0.80 and the gate says nothing. The
 * first thing a visitor sees was a silent failure, and no test knew.
 *
 * The text is read out of samples.ts rather than copied, because a copy drifts
 * and a drifted fixture is worse than no fixture: it passes while measuring
 * something the site no longer serves. Parsing a TypeScript file with a regex is
 * ugly, and the alternative — moving the samples into plain JS so both sides can
 * import them — would drag typing off the UI for the sake of the harness. The
 * parse asserts what it expects to find and throws otherwise, so a reformat
 * breaks the harness loudly instead of quietly measuring the wrong thing.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SAMPLES = join(HERE, "..", "src", "lib", "samples.ts");

/**
 * The span that answers each sample's own question.
 *
 * Written by hand and keyed by the sample id. Each one is checked against the
 * parsed text below, so a sample being reworded fails here rather than silently
 * becoming unanswerable.
 */
const ANSWERS = {
  agent:
    "the redis client is constructed lazily, there is a window during boot where it is still undefined",
  rag: "Refunds on annual plans are available within 30 days of the initial charge",
  support:
    "the provider has a hard limit of 8000 ms and our checkout handler was waiting for 12000 ms before giving up",
  postmortem:
    "raised the payment provider client's read timeout from 8 seconds to 90 seconds",
};

const BT = String.fromCharCode(96);

function parse() {
  const src = readFileSync(SAMPLES, "utf8").replace(/\r\n/g, "\n");
  const out = [];

  for (const [id, answerSpan] of Object.entries(ANSWERS)) {
    const at = src.indexOf(`id: "${id}"`);
    if (at < 0) throw new Error(`samples.ts no longer defines a sample with id "${id}"`);

    const rest = src.slice(at);
    const question = /query: "([^"]+)"/.exec(rest)?.[1];
    if (!question) throw new Error(`sample "${id}" has no query`);

    const open = rest.indexOf(`text: ${BT}`);
    const close = rest.indexOf(`${BT},\n  },`, open);
    if (open < 0 || close < 0) throw new Error(`could not read the text of sample "${id}"`);

    // Template literals in the source escape backticks around inline code.
    const text = rest.slice(open + `text: ${BT}`.length, close).split(`\\${BT}`).join(BT);

    if (!text.includes(answerSpan)) {
      throw new Error(
        `sample "${id}" no longer contains its recorded answer span. Either the ` +
          `sample was reworded and the span in demo-fixtures.mjs needs updating, or ` +
          `the parse is picking up the wrong block.`,
      );
    }

    out.push({ id: `demo-${id}`, question, answerSpan, context: text });
  }

  return out;
}

export const DEMO_FIXTURES = parse();
