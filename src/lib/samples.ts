/**
 * Sample contexts for the playground.
 *
 * These are shaped like the things people actually paste into an agent: a long
 * coding-agent transcript with repeated tool output, a retrieval bundle with
 * three overlapping documents, and a support thread. Each one exercises a
 * different stage of the pipeline, which makes the stage breakdown in the
 * receipt legible rather than abstract.
 */

export interface Sample {
  id: string;
  label: string;
  hint: string;
  query: string;
  text: string;
}

export const SAMPLES: Sample[] = [
  {
    id: "agent",
    label: "Coding agent transcript",
    hint: "Redundancy-heavy. Watch the dedup stage do most of the work.",
    query: "why does the session lookup return undefined",
    text: `# Task
Refactor the authentication module so it uses the new session store instead of the legacy cookie jar.

It is worth noting that the current implementation is basically using the old cookie jar, and in order to migrate we will need to make use of the SessionStore class that lives in \`src/auth/session.ts\`. The vast majority of the callers are actually in the API layer.

\`\`\`ts
export class SessionStore {
  constructor(private redis: RedisClient) {}
  async get(id: string): Promise<Session | null> {
    const raw = await this.redis.get("sess:" + id);
    return raw ? JSON.parse(raw) : null;
  }
}
\`\`\`

Reading file src/auth/legacy.ts
Reading file src/auth/legacy.ts
Reading file src/auth/legacy.ts
Reading file src/auth/session.ts
Reading file src/auth/legacy.ts

ERROR: TypeError: cannot read property 'get' of undefined
    at getSession (src/auth/legacy.ts:42:18)
    at Object.handler (src/api/me.ts:11:24)

Running tests
Running tests
Running tests

The test suite is quite large and it takes a fairly long time to run, so please keep in mind that we generally only run the auth subset during development, which can be done with the command \`npm test -- auth\`.

Some background about the offsite in Lisbon last quarter, which was very nice and had a large number of attendees, but which has nothing whatsoever to do with sessions or authentication in any way.

Due to the fact that the redis client is constructed lazily, there is a window during boot where it is still undefined. That is almost certainly the actual cause of the error above.`,
  },
  {
    id: "rag",
    label: "Retrieval bundle",
    hint: "Three overlapping documents. Watch salience pick the one that answers the question.",
    query: "what is the refund window for annual plans",
    text: `## Document 1 — Billing overview
Customers may be billed monthly or annually. Annual plans are discounted by roughly seventeen percent relative to paying month to month. Invoices are issued at the start of each billing period and payment is collected automatically from the card on file.

## Document 2 — Billing overview
Customers can be billed either monthly or annually. Annual plans carry a discount of about seventeen percent compared with paying month by month. Invoices go out at the beginning of every billing period and payment is taken automatically from the stored card.

## Document 3 — Refunds
Refunds on annual plans are available within 30 days of the initial charge. After 30 days the plan converts to non-refundable for the remainder of the term, though the customer may cancel to prevent renewal. Monthly plans are not refundable but can be cancelled at any time, with access continuing until the end of the paid period.

## Document 4 — Company history
The company was founded in 2019 above a bakery in Utrecht. The first product was a scheduling tool that has since been sunset. The team grew to eleven people by 2022 and now works fully remotely across six countries.

## Document 5 — Seat management
Administrators can add and remove seats at any time. Adding a seat mid-term produces a prorated charge. Removing a seat produces a credit applied to the next invoice rather than a refund to the card.`,
  },
  {
    id: "support",
    label: "Support thread",
    hint: "Conversational filler. Watch the lexical layer strip grammar without touching the error codes.",
    query: "root cause of the 502 on checkout",
    text: `Hi there, thanks so much for reaching out to us, and I am really sorry to hear that you have been running into trouble with the checkout flow. I would be more than happy to help you get to the bottom of this.

Just to make sure that I fully understand the situation, it sounds like you are seeing an error when you try to complete a purchase. Is that correct?

Yes that is correct. When I click the pay button the page just spins for a while and then I get an error that says \`ERR_GATEWAY_502\`. It happens every single time and I have tried it on three different browsers.

Thank you so much for confirming that, and I really do appreciate your patience here. I have gone ahead and taken a look at the logs on our side for your account.

It looks like the requests from your account are actually timing out against our payment provider. Basically, the provider has a hard limit of 8000 ms and our checkout handler was waiting for 12000 ms before giving up, so the connection was being dropped upstream before our own timeout ever fired.

We have deployed a fix that lowers the handler timeout to 6000 ms and adds a retry. Could you please try again and let me know how it goes?`,
  },
];
