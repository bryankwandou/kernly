/**
 * Evaluation fixtures for the answer-span retention harness.
 *
 * Each fixture is a long context, a question somebody would realistically ask of
 * it, and the span that contains the answer. The contexts are written to be
 * hostile to a naive selector: every one of them contains distractor paragraphs
 * that share vocabulary with the question but do not answer it, and several
 * bury the answer in the middle where a positional prior is least helpful.
 *
 * Documents are synthetic on purpose. Real corpora carry licence questions and
 * cannot be shipped in an MIT repo, and a fixture whose answer span is defined
 * by hand is more honest than one where the label came from a model.
 */

export const FIXTURES = [
  {
    id: "incident-postmortem",
    question: "what caused the outage and how long did it last",
    answerSpan:
      "The root cause was a connection pool exhausted by a migration script that opened a session per row. The outage lasted 47 minutes.",
    context: `# Incident 2026-03-11: checkout unavailable

## Summary
Checkout returned 503 for a subset of European traffic on the morning of 11 March. Paging fired at 09:14 UTC and the service was declared healthy again at 10:01 UTC.

## Timeline
09:14 First alert from the synthetic checkout probe. On-call acknowledged within two minutes.
09:20 Dashboards showed database latency climbing but CPU flat, which ruled out the usual query regression.
09:31 A second engineer joined and began reviewing recent deploys. The 08:50 deploy contained only a copy change.
09:44 Attention moved to the batch tier after somebody noticed the nightly migration had not finished.

## Root cause
The root cause was a connection pool exhausted by a migration script that opened a session per row. The outage lasted 47 minutes.

## What did not cause it
The CDN configuration change from the previous evening was investigated and cleared. The payment provider reported no degradation during the window and their status page stayed green throughout. A suspected memory leak in the session service turned out to be normal growth under retry load.

## Follow-up
The migration runner now takes a pool size limit as a required argument rather than inheriting the application default. A separate pool has been provisioned for batch work so that a runaway job cannot starve request traffic. Alerting on pool saturation was added; previously the only signal was downstream latency, which is why diagnosis took as long as it did.

## Attendees
Platform on-call, database team lead, payments liaison, incident commander.`,
  },
  {
    id: "api-reference",
    question: "what is the rate limit for the search endpoint",
    answerSpan:
      "The search endpoint permits 60 requests per minute per API key. Exceeding it returns 429 with a Retry-After header in seconds.",
    context: `# Public API reference

## Authentication
Every request carries a bearer token in the Authorization header. Tokens are issued per workspace and can be scoped to read or write. A token with only read scope may call every GET endpoint documented here and will receive 403 on anything else.

## Pagination
List endpoints return at most 100 items per page. Pass a cursor from the previous response to continue. Cursors expire after one hour.

## Rate limits
Limits are applied per API key rather than per IP address, so distributing traffic across machines does not raise the ceiling. The search endpoint permits 60 requests per minute per API key. Exceeding it returns 429 with a Retry-After header in seconds. The bulk export endpoint is limited separately to two concurrent jobs, and the events stream is limited by connection count rather than request rate.

## Errors
All errors return a JSON body with a machine-readable code, a human-readable message, and a request identifier to quote in support tickets. A 5xx response should be retried with exponential backoff and jitter. A 4xx response should not be retried without changing the request.

## Versioning
The version is pinned by a header. Absent that header, requests resolve against the oldest supported version, which is a deliberate choice so that an integration written years ago keeps working until somebody opts into a change.

## Deprecation policy
Endpoints are announced as deprecated at least six months before removal, and the deprecation is visible both in the changelog and as a response header.`,
  },
  {
    id: "contract-terms",
    question: "what is the notice period for termination",
    answerSpan:
      "Either party may terminate for convenience by giving ninety days written notice to the other party.",
    context: `# Master services agreement, summary of key terms

## Scope
The supplier provides hosting, monitoring and incident response for the customer's production environment as described in the attached statement of work. Any work outside that description requires a signed change order.

## Fees and payment
Fees are invoiced monthly in arrears and are payable within thirty days of the invoice date. Late payment accrues interest at the statutory rate. Fees may be adjusted annually by no more than the published inflation index for the preceding twelve months.

## Service levels
The supplier commits to 99.9 percent monthly availability measured at the load balancer. Failure to meet the commitment entitles the customer to service credits on a sliding scale, capped at fifteen percent of the monthly fee. Service credits are the sole remedy for availability failures.

## Term and termination
The initial term is twenty-four months and renews automatically for successive twelve month periods. Either party may terminate for convenience by giving ninety days written notice to the other party. Termination for material breach requires written notice and a thirty day cure period, except where the breach is a failure to pay, in which case the cure period is ten days.

## Data
The customer retains ownership of all customer data. On termination the supplier will return the data in a documented format within thirty days and delete remaining copies within sixty days, excluding backups which expire on their normal schedule.

## Liability
Aggregate liability is capped at the fees paid in the preceding twelve months, excluding liability that cannot be limited by law.`,
  },
  {
    id: "config-reference",
    question: "which setting controls how long idle workers stay alive",
    answerSpan:
      "worker_idle_timeout_seconds determines how long an idle worker stays alive before it is reclaimed. The default is 300.",
    context: `# Runtime configuration

Settings are read from environment variables first, then from the config file, then from built-in defaults. A value set in more than one place resolves to the highest priority source, and the effective configuration is printed at startup so that surprises are visible in the logs rather than discovered later.

## Concurrency
max_workers sets the upper bound on concurrently running workers. Setting it above the core count is usually counterproductive for CPU-bound tasks and helpful for IO-bound ones.

min_workers keeps a floor of warm workers so that a burst of traffic does not pay cold start cost. Setting it equal to max_workers disables scaling entirely.

worker_idle_timeout_seconds determines how long an idle worker stays alive before it is reclaimed. The default is 300.

worker_max_lifetime_seconds forces a worker to retire after a fixed age regardless of activity, which is a blunt but effective guard against slow leaks in third-party libraries.

## Queueing
queue_depth_limit caps the number of tasks waiting for a worker. When the cap is reached, new submissions are rejected rather than queued, on the reasoning that a caller who gets a fast rejection can make a better decision than one that waits indefinitely.

queue_priority_levels enables banded scheduling. Higher bands are drained first, and starvation is prevented by ageing tasks upward the longer they wait.

## Observability
metrics_interval_seconds controls how often runtime counters are flushed. log_level accepts the usual five values and can be changed at runtime by signal without a restart.`,
  },
  {
    id: "meeting-notes",
    question: "what did the team decide about the migration date",
    answerSpan:
      "The team agreed to move the migration to the second week of June, after the pricing launch, to avoid two large changes landing in the same fortnight.",
    context: `# Weekly planning, notes

## Attendance
Full team present except the design lead, who sent written comments in advance and asked to be consulted before anything about the onboarding flow is finalised.

## Pricing launch
Engineering reported the pricing changes are behind a flag and functionally complete. Marketing wants a firm date so that the announcement can be scheduled; the current target is the last week of May. Support asked for a written summary of what changes for existing customers, and that summary is now assigned.

## Database migration
Discussion took most of the hour. The original plan put the migration in the last week of May, which several people pointed out is the same week as the pricing launch. The infrastructure lead argued that the migration is low risk and rehearsed. The support lead argued that risk is not the issue, attention is, and that if anything goes wrong during a launch week nobody will have capacity to handle it. The team agreed to move the migration to the second week of June, after the pricing launch, to avoid two large changes landing in the same fortnight.

## Hiring
Two candidates are at final stage. Scheduling is the bottleneck rather than the pipeline.

## Onboarding flow
Deferred to next week pending the design lead's return. The written comments raised concerns about the number of steps before a user sees value, which several people agreed with.

## Actions
Write the customer-facing pricing summary. Reschedule the migration runbook review. Book final-stage interviews.`,
  },
  {
    id: "research-summary",
    question: "what accuracy did the smaller model reach compared to the baseline",
    answerSpan:
      "The distilled model reached 91.4 percent of baseline accuracy while using roughly one fifth of the parameters.",
    context: `# Literature notes: efficiency in language models

## Motivation
The gap between what a large model can do and what an organisation can afford to run has widened rather than narrowed. Several lines of work attack that gap from different directions, and the notes below group them by mechanism rather than by publication date.

## Sparse routing
Mixture-of-experts architectures activate a small subset of parameters per token. Total parameter count grows while per-token compute stays roughly flat. The engineering cost is real: routing introduces load imbalance, and imbalance turns into latency variance that is hard to explain to a downstream team.

## Attention compression
Reducing the memory footprint of the key-value cache attacks the dominant cost at long context lengths. Latent attention projects keys and values into a lower dimensional space and reconstructs them, trading a small amount of quality for a large reduction in cache size.

## Distillation
A smaller student is trained against the outputs of a larger teacher. The distilled model reached 91.4 percent of baseline accuracy while using roughly one fifth of the parameters. Results vary considerably by task family; reasoning-heavy evaluations degrade faster than retrieval-heavy ones.

## Quantisation
Reducing numeric precision after training is the cheapest intervention available and often the first one tried. Below four bits the degradation stops being graceful.

## Context reduction
The line most relevant here: rather than shrinking the model, shrink what is fed to it. The advantage is that it composes with every technique above, since it operates outside the model entirely and requires no retraining.`,
  },
  {
    id: "support-thread",
    question: "how was the customer's login problem resolved",
    answerSpan:
      "The account had two identities with the same email address after the SSO migration. Merging them into the older identity restored access immediately.",
    context: `# Support ticket 88214

**Customer:** reports being unable to log in since Tuesday. Password reset emails arrive and the reset succeeds, but the subsequent login fails with a generic error.

**First response:** asked the customer to clear cookies and try an incognito window. No change. Asked whether other members of the same workspace are affected; they are not.

**Escalation:** passed to tier two. Confirmed the account exists and is not suspended. Authentication logs show the reset succeeding and the login attempt reaching the identity service before returning an error that the client renders generically, which is a separate usability problem now filed on its own.

**Investigation:** the identity service returned a conflict rather than a failure. Conflicts occur when a lookup by email matches more than one record. The account had two identities with the same email address after the SSO migration. Merging them into the older identity restored access immediately.

**Things ruled out:** browser extensions, which were disabled during testing. Network policy, since the customer reached the login page and other services normally. Password manager autofill, which was checked by typing the credentials manually. A regional outage, since no other tickets were open from that region during the window.

**Follow-up:** a sweep found eleven other accounts with duplicate identities from the same migration batch. All were merged proactively before the customers noticed. The generic client error has been replaced with a message that distinguishes a conflict from a credential failure.`,
  },
  {
    id: "changelog",
    question: "which release removed the legacy export format",
    answerSpan:
      "Version 4.2.0 removed the legacy CSV export format, which had been deprecated since 3.8.0.",
    context: `# Changelog

## 4.4.1
Fixed a regression where scheduled reports ran in the server timezone rather than the workspace timezone. Fixed a crash when a filter referenced a deleted field.

## 4.4.0
Added saved views with sharing. Added keyboard navigation to the results table. Improved cold start time on the dashboard by deferring chart hydration until the container is visible.

## 4.3.2
Security fix in the dependency used for archive extraction. No user-facing change. Operators running self-hosted deployments should upgrade.

## 4.3.0
Added webhooks for record creation and update. Reworked the permissions model so that field-level restrictions are evaluated once per query rather than once per row, which made large exports noticeably faster.

## 4.2.0
Version 4.2.0 removed the legacy CSV export format, which had been deprecated since 3.8.0. Added the replacement export pipeline with streaming output and resumable downloads.

## 4.1.0
Added bulk edit. Added an audit log for administrative actions.

## 4.0.0
Major release. New storage engine, new query planner, and a migration that runs online. Upgrading from 3.x requires reading the migration guide; several defaults changed and a small number of queries that relied on implicit ordering will need an explicit sort.

## 3.9.0
Final release in the 3.x line to receive features. Subsequent 3.x releases carried security fixes only, through to end of support.`,
  },
  /**
   * Line-oriented material, which the other eight fixtures do not contain.
   *
   * Every other context here is written in paragraphs separated by blank lines,
   * so the harness never exercised the shape agent transcripts and log tails
   * actually arrive in: one line per event, no blank lines anywhere. That gap
   * hid a segmentation defect for the whole life of the harness — the entire
   * run came through as a single atomic block and the allocator could only take
   * it or leave it.
   *
   * The defect is fixed, and this fixture is still a miss at tight ratios. It
   * is kept for that reason. The question is phrased in the vocabulary of the
   * symptom ("checkout outage") and the answer is written in the vocabulary of
   * the mechanism ("read timeout", "pool exhausts"), sharing no content word
   * with the question at all. Two lines that merely restate the symptom
   * outscore it, which is what lexical retrieval does and what no amount of
   * tuning short of embeddings will change. The gate escalates on it, which is
   * the honest outcome rather than a hidden one.
   */
  {
    question: "what actually caused the checkout outage",
    answerSpan:
      "The read timeout on the shared HTTP client was raised from 8 seconds to 90 seconds in v412. Every downstream call in the pool now holds a connection for up to ninety seconds instead of failing fast, and the pool exhausts.",
    context: `# Incident postmortem — checkout outage

14:02 Deploy of payments-api v412 begins. Rollout is canary, ten percent.
14:04 An alert fires on the search cluster. Unrelated, a known flapping probe.
14:06 The on-call notes elevated latency on the recommendations service. It is
      not in the checkout path but it shares a node pool, so it looked relevant.
14:09 A config change lands on the CDN edge rules. Reviewed, unrelated.
14:11 Checkout error rate crosses two percent. Paging escalates.
14:13 The read timeout on the shared HTTP client was raised from 8 seconds to 90
      seconds in v412. Every downstream call in the pool now holds a connection
      for up to ninety seconds instead of failing fast, and the pool exhausts.
14:15 Someone restarts the recommendations service. No effect, as expected.
14:17 v412 is rolled back. Error rate returns to baseline within forty seconds.

Follow-ups: the database team scheduled a vacuum for Thursday. The frontend team
is migrating to the new checkout form in Q4. Neither is related to this incident.`,
  },
];
