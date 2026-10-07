# ADR 0003: BullMQ with managed Redis for background jobs

- **Status:** Accepted direction; runtime deferred
- **Date:** 2026-10-05
- **Decision owner:** Founder
- **Earliest implementation:** First phase that requires a background job

## Context

ZuriDesk will need delayed booking reminders, notification retries, low-stock
alerts, and subscription lifecycle jobs. Those jobs require retry semantics,
delays, observability, and safe horizontal processing. Phase 1 itself has no
background workload.

## Decision

Use BullMQ backed by managed Redis and run workers separately from the API.
Keep queue operations behind a small application-owned `JobQueue` interface so
business services do not depend directly on BullMQ types.

The direction is approved now, but Phase 1 will not provision Redis, add BullMQ,
or deploy a worker. `apps/worker` and the runtime dependency are introduced in
the first approved phase that contains a real job.

When introduced, every job must have:

- a versioned, Zod-validated payload containing the minimum necessary data;
- an idempotency key and a handler that is safe to retry;
- bounded exponential backoff, a retry limit, and a dead-letter/failure path;
- tenant context loaded server-side from identifiers, never trusted from an
  unverified producer;
- structured logs and metrics that redact personal data and credentials;
- an explicit retention policy for completed and failed job data;
- shutdown handling that stops intake and allows active work to finish safely.

The source of truth remains MongoDB. Redis holds delivery state, not canonical
booking, stock, subscription, or payment records. Time-based jobs store UTC
instants and calculate salon-facing times with an IANA timezone, initially
`Africa/Nairobi`.

## Alternatives considered

1. **Atlas-backed polling/scheduled jobs:** one fewer provider, but weaker
   delayed-job ergonomics, more application polling, and less mature retry and
   queue observability.
2. **Cloud-provider queues:** robust, but would lock the worker contract to an
   unselected hosting provider.
3. **Run schedules inside the API process:** rejected because deploys and
   horizontal scaling can duplicate or drop work.

## Consequences

Managed Redis adds cost and an operational dependency when jobs begin. The
separate worker can scale and deploy independently. The application-owned
interface preserves a migration path if future scale or hosting needs justify
a different queue.

## Follow-up gate

Before provisioning Redis, approve the provider, region, cost ceiling,
networking, encryption, persistence expectations, and recovery behavior. This
is a YELLOW production/infrastructure decision.
