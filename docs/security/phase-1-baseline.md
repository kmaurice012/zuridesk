# Phase 1 security baseline

## Scope and status

This is the minimum engineering baseline for the foundation phase. It is a
control specification and verification checklist, not a claim that ZuriDesk is
legally compliant, externally audited, or production-ready. Authentication,
RBAC, billing, customer data-rights workflows, and domain audit events arrive
in later approved phases.

## Trust boundaries

- Web and mobile clients are untrusted.
- Headers, route parameters, query strings, and bodies are untrusted.
- `tenantId` is derived only from a verified server-side session/membership
  context; it is never trusted from client input.
- The API is the authorization and feature-gating boundary.
- Only `packages/db` may access Mongoose models.
- Atlas, future Redis, payment, messaging, and push providers are external
  dependencies with separate least-privilege credentials.

## Required Phase 1 controls

### Configuration and secrets

- Validate environment variables with Zod at process startup and fail closed.
- Separate server secrets, web-public settings, and Expo-public settings.
- Commit only placeholder values in `.env.example`; ignore all populated
  `.env*` files.
- Keep Atlas URIs and provider credentials in encrypted environment-specific
  secret stores. Redact passwords, authorization headers, cookies, tokens,
  connection strings, and OTP-like values from logs.
- CI performs secret scanning and does not expose deployment secrets to
  untrusted fork workflows.

### HTTP and process baseline

- Assign or safely propagate a request ID and include it in structured logs and
  safe error responses.
- Set defensive HTTP headers, explicit body-size limits, and an allowlist-based
  CORS policy. A wildcard origin is not allowed with authenticated requests.
- Normalize errors. Production responses omit stack traces, dependency errors,
  queries, and filesystem paths.
- Use timeouts and graceful shutdown for HTTP and database connections.
- Liveness is independent of dependencies; readiness fails closed when a
  required dependency is unavailable.
- Dependencies are lockfile-pinned and reviewed by automated vulnerability
  tooling. Critical findings block release unless explicitly risk-accepted.

### Database baseline

- Require TLS, pooled connections, and a transaction-capable replica set.
- Use separate, least-privilege identities by environment and purpose.
- Production Atlas access never allows `0.0.0.0/0`.
- Lint and architecture tests prohibit raw Mongoose/model imports outside
  `packages/db`.
- No business collection is introduced without schema validation, supporting
  indexes, a versioned migration, and tenant-isolation tests where applicable.

### Logging and privacy

- Collect only operational metadata necessary to diagnose the service.
- Do not log request bodies by default, customer notes, phone numbers, message
  contents, payment payloads, access/refresh tokens, OTPs, or credentials.
- Use synthetic fixtures in tests and demonstrations.
- Store timestamps in UTC; presentation timezone is `Africa/Nairobi`.
- Data Protection Act-related product controls require a later reviewed design
  covering consent, minimization, access/export, correction, deletion, and
  retention. Implementation must not be described as legal compliance without
  evidence and qualified counsel.

## Deferred controls with explicit phase owners

| Control                                                                | Intended phase            |
| ---------------------------------------------------------------------- | ------------------------- |
| Password hashing, OTP lifecycle, token rotation, secure mobile storage | Auth + tenancy + RBAC     |
| Auth/OTP endpoint rate limits and account-abuse controls               | Auth + tenancy + RBAC     |
| Central permission map, row-level rules, and per-cell RBAC tests       | Auth + tenancy + RBAC     |
| Booking locking and concurrency proof                                  | Bookings                  |
| Atomic non-negative stock and sale transaction                         | Stock and POS             |
| Payment callback verification and idempotency                          | Subscriptions and billing |
| Notification consent, templates, retries, and provider controls        | Notifications             |
| Production backup restore drill and monitoring review                  | Hardening, before launch  |

Deferral does not permit insecure placeholders. An endpoint depending on a
deferred control must not be exposed until that control exists.

## Phase 1 release evidence

The phase is complete only when CI or a local verification record shows:

- clean install, lint, typecheck, unit tests, integration tests, and builds;
- transaction commit and rollback against a real replica set;
- rejected unlisted CORS origin;
- sanitized production error response and redacted logs;
- readiness failure does not disclose connection details;
- architecture test rejects Mongoose imports outside `packages/db`;
- repository and generated artifacts contain no detected secrets.

Any failed item is recorded as incomplete, not waived silently.
