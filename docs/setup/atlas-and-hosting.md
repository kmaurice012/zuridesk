# Atlas and hosting runbook

## Current decisions

- MongoDB Atlas is required for development, staging, and production data.
- Production uses a dedicated Atlas replica-set tier with continuous backups.
- Application hosting provider, Atlas cloud provider, and regions are
  **UNKNOWN** as of 2026-10-05. Do not provision production infrastructure
  until the founder approves them.
- The deployment architecture remains provider-neutral: independently
  deployable web, API, and, when needed, worker workloads.

Choose application and Atlas regions together. Measure latency from the target
Nairobi user base, verify product availability and data-location requirements,
then place compute and database as close as practical. Do not infer legal
compliance from a region choice; obtain qualified advice for compliance claims.

## Environment separation

Use separate Atlas projects or, at minimum, separate clusters and credentials
for development, staging, and production. Never share production credentials
with CI, local development, preview deployments, or analytics tools.

| Environment | Data                    | Atlas user           | Network access                                       | Backups                     |
| ----------- | ----------------------- | -------------------- | ---------------------------------------------------- | --------------------------- |
| Development | Synthetic only          | Development app role | Named developer IPs or secure private path           | Optional                    |
| Test/CI     | Synthetic and ephemeral | Dedicated test role  | CI-scoped access; prefer local ephemeral replica set | Ephemeral                   |
| Staging     | Synthetic/anonymized    | Staging app role     | Staging workloads only                               | Restore policy tested       |
| Production  | Real tenant data        | Production app role  | Production workloads only                            | Continuous backups required |

Do not copy production personal data into development or ordinary staging.

## Atlas provisioning checklist

1. Create the environment-specific project/cluster and confirm it is a replica
   set that supports multi-document transactions.
2. Create distinct least-privilege database users for the application,
   migrations, and operational diagnostics. The application user must not have
   Atlas administrative privileges.
3. Configure an IP access list or private networking. Production must never
   contain `0.0.0.0/0`, even temporarily.
4. Store connection credentials in the hosting platform's encrypted secret
   store. Never place a URI in Git, documentation, logs, tickets, screenshots,
   shell history examples, or client-exposed environment variables.
5. Require TLS and verify the driver's certificate defaults remain enabled.
6. Configure continuous backups and retention for production. Perform a
   documented restore drill before launch; a successful backup job alone is not
   proof of recoverability.
7. Configure alerts for availability, connections, storage, replication lag,
   query targeting, and resource saturation. Route alerts to an approved
   operational channel.
8. Review Performance Advisor and slow-query evidence before launch. Add or
   change indexes through versioned migrations, not directly in production.
9. Enable Atlas Search only when marketplace search is implemented. Define its
   search indexes as versioned infrastructure artifacts at that time.

Development may start on an eligible free/shared Atlas tier, but capability
and quota availability must be confirmed in Atlas at provisioning time.
Production moves to a dedicated tier before real customer workloads.

## Application-hosting requirements

The selected provider must support:

- a long-running Node.js Fastify service with graceful shutdown;
- private or tightly allowlisted egress to Atlas without `0.0.0.0/0`;
- encrypted secrets, separate environments, immutable deploys, and rollback;
- health checks against `/health/live` and `/health/ready`;
- centralized redacted logs and basic metrics;
- deployment in a region compatible with the chosen Atlas region;
- a separately scalable worker and outbound managed Redis connection later;
- preview deployments that cannot access production data or secrets.

Serverless hosting is acceptable only if it preserves Fastify behavior,
transaction timeouts, webhook reliability, connection pooling, and future
worker separation. Record the final provider and topology in a new ADR before
production provisioning.

## Deployment order

1. Apply reviewed, versioned migrations using the migration identity.
2. Deploy API and verify liveness, readiness, safe error behavior, and Atlas
   connectivity.
3. Deploy web with only public configuration and the API base URL.
4. Run smoke tests with a synthetic tenant.
5. Promote mobile builds only after the compatible API is available.
6. Watch errors, latency, connections, and Atlas metrics through the rollback
   window.

## Incident controls

- Revoke or rotate a suspected credential before investigating with it.
- Preserve audit evidence without copying secrets or unnecessary personal data.
- Roll back application code independently of database changes; migrations must
  document backward compatibility and recovery steps.
- A restore, failover, or production data mutation requires explicit human
  authorization under the workspace approval gates.
