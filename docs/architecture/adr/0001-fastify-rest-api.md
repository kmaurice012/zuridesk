# ADR 0001: Standalone Fastify REST API

- **Status:** Accepted
- **Date:** 2026-10-05
- **Decision owner:** Founder
- **Phase:** 1 — Foundation

## Context

ZuriDesk needs one server-side security boundary and one typed API for the web
dashboard, Expo mobile app, payment callbacks, notification integrations, and
future marketplace clients. Tenant isolation, role checks, plan enforcement,
rate limits, and audit hooks must not be duplicated across clients.

Next.js route handlers would reduce the number of deployable applications, but
would couple the mobile API and integration callbacks to the web application's
release lifecycle. The product also needs explicit server lifecycle control and
integration tests that can run without the web application.

## Decision

Build a standalone Fastify application in `apps/api` and expose a versioned
JSON REST API under `/v1`.

- Every request and response contract is defined with Zod in shared packages.
- Fastify performs transport validation, authentication middleware dispatch,
  request IDs, structured logging, error normalization, and response
  serialization.
- OpenAPI is generated from the same registered route schemas. The committed
  specification is used to generate a TypeScript client for web and mobile.
- CI fails when the API contract and generated client drift.
- Business rules live in services, not route handlers. Database access goes
  through `packages/db` repositories as defined in ADR 0002.
- The initial health surface is unversioned: `/health/live` reports process
  liveness and `/health/ready` reports whether required dependencies are ready.
- API errors use a stable envelope with a machine-readable code, safe message,
  request ID, and optional field errors. Stack traces and internal dependency
  details are never returned in production.

The wire format represents MongoDB ObjectIds as validated 24-character
hexadecimal strings. Clients never send an authoritative `tenantId`; the API
derives it from the authenticated membership context.

## Consequences

The API can be deployed independently from the web application and supports
mobile without importing Next.js internals. It adds one deployable service and
requires CORS configuration, contract generation, and coordinated API/client
versioning. Backward-compatible additions are preferred within `/v1`; breaking
changes require a new version or a migration window.

## Alternatives considered

1. **Next.js route handlers:** fewer deployments, but couples the mobile and
   integration API to the web application and its runtime constraints.
2. **GraphQL:** flexible clients, but adds authorization and caching complexity
   without a current product requirement.
3. **tRPC:** excellent TypeScript ergonomics, but less suitable as the durable
   public contract for mobile, webhooks, and possible non-TypeScript consumers.

## Validation

- API boots independently of `apps/web`.
- Health endpoints have integration tests.
- Invalid request payloads are rejected before service code runs.
- Generated OpenAPI and client artifacts are reproducible and checked in CI.
- Production-mode errors and logs contain no secrets, stack traces, or database
  connection details.
