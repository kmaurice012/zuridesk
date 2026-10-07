# ADR 0002: Package and tenant-isolation boundaries

- **Status:** Accepted
- **Date:** 2026-10-05
- **Decision owner:** Founder
- **Phase:** 1 — Foundation; enforced as data features are added

## Context

ZuriDesk uses one MongoDB database with shared collections. MongoDB does not
provide application-level row security, so a missed tenant predicate could
expose or mutate another salon's data. Client-side filtering and UI permission
checks are not security controls.

## Decision

Dependencies flow toward shared contracts and the data layer:

```text
apps/web ─────┐
apps/mobile ──┼──> packages/api-client ──> packages/shared
apps/api ─────┘             │
    │                       └── contracts only
    ├──> application services ──> packages/shared
    └──> packages/db repositories ──> Mongoose
```

Only `packages/db` may import Mongoose models or the `mongoose` package. A lint
rule and an architecture test reject raw model access elsewhere. Routes call
services; services call repositories. Applications do not receive model
objects, Mongoose queries, or database connections.

### Repository contexts

Tenant-owned operations require a `TenantContext` created by trusted
authentication middleware. At minimum it contains the authenticated `userId`
and active `tenantId`; later phases add membership, permissions, and request
metadata. `tenantId` is never accepted from a body, query string, route
parameter, or caller-controlled header as authorization context.

Repositories inject `tenantId` into every tenant-owned operation:

- find, find-one, exists, count, distinct, update, delete, bulk write, and
  transaction helpers;
- aggregation pipelines, including every `$lookup`, nested lookup pipeline,
  `$unionWith`, and `$graphLookup` traversal;
- uniqueness checks and optimistic/concurrency controls.

Repository APIs expose business-specific methods instead of accepting
arbitrary filters or pipelines from application code. Escape hatches require a
separately named platform repository, a documented reason, explicit audit
coverage, and tests. Platform-global collections such as users and plans use
global repositories; they must not be accessed through a tenant repository.

Every tenant-owned document has a required, immutable, indexed ObjectId
`tenantId`. Every index for a tenant-owned collection begins with `tenantId`.
Soft-delete filters are centralized in repository policy. Financial records are
never hard-deleted.

### Enforcement tests

For every tenant-owned collection and every endpoint, tests create tenant A
and tenant B records and prove tenant A cannot read, count, update, delete, or
aggregate tenant B data. Aggregate tests cover joins explicitly. These tests
run against a real replica-set MongoDB environment, not mocked models.

RBAC and tenant scope are independent checks: permission to perform an action
inside one tenant never grants access to another tenant. Row-level rules such
as "stylist may see own bookings" narrow the tenant-scoped query further.

## Consequences

This boundary adds repository boilerplate and prevents convenient direct model
queries. In return, the highest-impact isolation rule is centralized and
testable. Changing this shared-collection tenancy model later would be costly;
exceptions must be treated as security architecture changes.

## Validation

- Imports of Mongoose outside `packages/db` fail lint and architecture tests.
- Repository methods cannot be constructed without the appropriate trusted
  context.
- Cross-tenant tests cover all CRUD and aggregation paths before a collection
  or endpoint is considered complete.
- Index tests assert that each tenant-owned index starts with `tenantId`.
