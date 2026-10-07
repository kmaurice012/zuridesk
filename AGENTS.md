# ZuriDesk engineering instructions

These rules apply to the entire repository.

## Architecture boundaries

- `apps/web` and `apps/mobile` consume the public API through `@zuridesk/api-client`.
- `apps/api` is the only public business API. Next.js route handlers are not a second API.
- Only `packages/db` may import Mongoose or expose database connection and repository abstractions.
- Routes and services must never import raw models. When tenant-owned models arrive, all access goes through tenant-scoped repositories.
- `tenantId` will come only from verified server-side membership context, never client-controlled input.
- `packages/shared` must stay safe to bundle in browsers and React Native; it cannot import Node-only modules or secrets.

## Data and security

- MongoDB Atlas is required for persistent development, staging, and production data.
- Every tenant-owned collection must require and index `tenantId`; every compound index begins with `tenantId`.
- Use MongoDB ObjectIds for persisted entity identifiers and validate them at API boundaries.
- Store money as integer KES minor units, timestamps in UTC, and phone numbers in E.164 format.
- Validate every API request and response with Zod and every persisted document with Mongoose.
- Never log or commit secrets, credentials, tokens, OTPs, customer notes, phone numbers, or payment payloads.
- Never hard-delete financial records. Business soft deletion uses `deletedAt` once domain models are introduced.

## Required verification

Before handing off a change, run the relevant root commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

Schema changes require a versioned migration, supporting indexes, tests, and rollback/compatibility guidance. Tenant-owned collections and endpoints require isolation tests proving tenant A cannot access tenant B.
