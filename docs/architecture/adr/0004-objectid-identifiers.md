# ADR 0004: MongoDB ObjectId identifiers

- **Status:** Accepted
- **Date:** 2026-10-05
- **Decision owner:** Founder
- **Phase:** 1 — Foundation

## Context

The identifier choice affects every collection, index, URL, API schema, mobile
cache, and integration contract. Changing it after business data exists would
require broad migrations.

## Decision

Use MongoDB ObjectIds for `_id` and document references, including `tenantId`,
`userId`, and membership references.

- Mongoose schemas store identifiers as `Schema.Types.ObjectId`.
- API and event boundaries serialize ObjectIds as lowercase 24-character
  hexadecimal strings and validate them before conversion.
- Shared domain DTOs use a branded string type rather than exposing Mongoose
  types to applications or clients.
- Equality and map keys use canonical string representations at application
  boundaries.
- ObjectId validity is never treated as authorization or evidence that a
  record exists.
- Clients may send resource IDs for requested resources, but the server always
  combines them with authenticated tenant scope and permission checks.

ObjectIds expose an approximate creation time and are not unguessable secrets.
No security decision relies on obscurity. If a future public marketplace needs
non-sequential public handles, add a separate slug or public identifier rather
than replacing internal primary keys.

## Alternatives considered

1. **UUIDv7:** portable and time-ordered, but adds conversion and storage/index
   overhead without a current cross-database requirement.
2. **String UUIDs:** easy at JSON boundaries, but larger indexes and weaker
   native MongoDB ergonomics.
3. **Per-domain mixed identifiers:** flexible but increases schema and client
   complexity.

## Consequences

ObjectIds provide native MongoDB tooling and compact references. The decision
couples internal identifiers to MongoDB and requires explicit string
serialization at API boundaries. Separate public identifiers can be added
later without changing internal relations.

## Validation

- Shared schemas reject malformed IDs.
- JSON responses never leak Mongoose objects.
- Repository tests prove that a valid foreign ObjectId cannot bypass tenant or
  RBAC checks.
