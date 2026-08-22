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
  {
    id: "postmortem",
    label: "Incident postmortem",
    hint: "Long and mostly irrelevant to the question. The realistic case.",
    query: "what actually caused the checkout outage",
    text: `# Incident 2024-0417 — checkout unavailable for 71 minutes

## Summary

Between 09:14 and 10:25 UTC on 17 April, roughly 38 percent of checkout attempts failed with a gateway error. Card authorisation was never affected. No payment was taken without an order being created, and no order was created without a payment being taken, which we confirmed by reconciling both ledgers before closing the incident.

## Timeline

**09:02** — A routine deploy of the orders service goes out. The change is a two-line adjustment to a log format. It passes CI, passes canary, and is promoted to the full fleet at 09:06. Nothing in this deploy is related to what follows, but it is in the timeline because it was the first thing three separate people suspected.

**09:14** — The first alert fires: checkout p99 latency crosses 4 seconds. On-call acknowledges within 90 seconds.

**09:17** — Error rate on \`POST /checkout\` reaches 12 percent. On-call declares an incident and opens a channel.

**09:19** — The orders deploy is rolled back on suspicion. Rollback completes at 09:23. Error rate does not improve. In hindsight this cost us four minutes and, more expensively, it anchored the investigation on the wrong service for the next twenty.

**09:26** — A second responder joins and starts working the database angle. Connection counts on the primary look normal. Replica lag is under 200 ms. Slow query log shows nothing above 40 ms.

**09:31** — Someone notices that the payment provider's status page is green, and that our own synthetic checks against the provider are passing. Both observations were true and both were misleading, because the synthetic checks run from a different network path than production traffic.

**09:38** — Error rate peaks at 41 percent. Customer support reports a rising volume of complaints. The incident is escalated to sev-1.

**09:44** — A responder pulls the connection pool metrics for the payments service and finds the pool saturated: 200 of 200 connections in use, with a wait queue that has been growing steadily since roughly 09:10. This is the first real signal.

**09:52** — The pool is confirmed to be saturated with connections in a \`waiting for server\` state, not with connections actively serving requests. Something is holding connections open without using them.

**10:03** — The cause is identified. A configuration change merged the previous afternoon and released at 09:08 raised the payment provider client's read timeout from 8 seconds to 90 seconds. The change was made to accommodate a slow reporting endpoint used by the finance team once a night. It was applied to the shared client rather than to a dedicated one, so it also applied to checkout. When the provider began responding slowly to a subset of requests — which it does routinely, and which the 8 second timeout had always absorbed invisibly — those requests now occupied a pool connection for up to 90 seconds instead of failing fast and freeing it. The pool drained within four minutes of the change taking effect.

**10:07** — A revert of the timeout change is prepared.

**10:14** — The revert is deployed. Pool utilisation begins falling immediately.

**10:25** — Error rate returns to baseline. Incident closed at 10:41 after a monitoring period.

## Things that were ruled out

The orders deploy at 09:02, which was rolled back at 09:19 with no effect and re-applied cleanly two days later.

Database load. The primary was at 31 percent CPU throughout. No lock contention, no long transactions, no unusual query plans.

Provider degradation. The provider's own metrics, which they shared with us afterwards, show their p99 for our account rose from 340 ms to 1.9 seconds during the window — elevated, but nowhere near enough to cause this on its own, and well inside what the original 8 second timeout handled without incident.

DNS, which is always suspected and was fine.

A CDN configuration change in a different team's repository that happened to land at 09:11 and which cost a responder eleven minutes.

## Contributing factors

The timeout configuration lived in a shared client used by every consumer of the payment provider. There was no mechanism to scope a timeout to one call path, and no test that would have caught a change to it affecting checkout.

The change was reviewed by one person and approved in under three minutes. The reviewer has said, reasonably, that a timeout adjustment from 8 to 90 seconds did not read as risky in isolation and that nothing in the diff indicated which call paths it touched.

Connection pool saturation was not alerted on. The metric was collected and was visible on a dashboard nobody had open. An alert on pool wait time would have pointed at the payments service within two minutes rather than thirty.

The synthetic checks against the provider used a separate client with its own configuration, so they were unaffected by the change and reported healthy throughout. This is the second incident in eighteen months where synthetics stayed green through a real outage.

## Actions

Split the payment provider client so that the reporting path has its own instance and its own timeout. Owner: payments. Due: 24 April.

Alert on connection pool wait time above 500 ms for 60 seconds, for every pooled client, not only payments. Owner: platform. Due: 1 May.

Require a second reviewer for any change to a timeout, retry, or pool size. Owner: platform. Due: immediate, already in effect.

Rewrite the provider synthetics to use the production client configuration. Owner: payments. Due: 8 May.

Add a runbook entry for pool saturation with the exact dashboard link and the query that shows connection states. Owner: on-call rota. Due: 24 April.

## What went well

The reconciliation between the payment ledger and the order ledger was completed within 20 minutes of the incident closing and found no discrepancies. That work was possible because both ledgers write idempotency keys, a decision made two years ago that nobody has had cause to thank until now.

Communication was good. Support had accurate customer-facing wording within nine minutes of the sev-1 declaration and updated it twice.

Nobody was blamed for the rollback of the orders deploy, which was a reasonable move on the information available at 09:19 even though it was wrong.`,
  },
];
