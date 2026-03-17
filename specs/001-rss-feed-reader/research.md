# Research: Marketing Attribution Reporter MVP

**Feature**: `001-marketing-attribution-reporter` | **Date**: 2026-03-16

## R1: TypeScript Monorepo with Express API

**Decision**: Use a TypeScript monorepo with npm workspaces, Turborepo for build orchestration, and Express.js for the REST API.

**Rationale**: TypeScript across the full stack provides type safety from database schema to frontend components. npm workspaces enable shared packages (`packages/attribution`, `packages/database`, `packages/logger`) consumed by both `apps/api` and `apps/web`. Turborepo handles dependency-ordered builds and caching. Express provides mature, minimal HTTP routing with full ecosystem support for middleware (validation, error handling, logging).

**Alternatives considered**:
- Fastify: Faster benchmarks but smaller ecosystem; Express is more widely understood and documented.
- NestJS: Full-featured framework but heavy for an MVP; adds abstraction layers that slow iteration.
- Hono: Lightweight and fast but less mature for complex middleware chains.
- tRPC: Type-safe API without REST, but the Sankey frontend benefits from cacheable REST endpoints via TanStack Query.

## R2: PostgreSQL with Drizzle ORM

**Decision**: Use PostgreSQL for persistence via Drizzle ORM with code-first schema definitions and generated migrations.

**Rationale**: PostgreSQL provides native `decimal`/`numeric` column types essential for monetary precision (Constitution Principle I). Drizzle ORM offers fully typed queries, schema inference (`InferSelectModel`, `InferInsertModel`), and a lightweight migration system. It mirrors the production patterns used in `LEGO/moe-lexcie` (`packages/database`). Connection management uses `pg` (node-postgres) pool.

**Alternatives considered**:
- SQLite (via better-sqlite3): No server required, but decimal handling is text-based and less predictable; no native UUID type.
- Prisma: Heavier runtime, generates a client that obscures queries; Drizzle is closer to SQL and lighter.
- Knex: Query builder without type-safe schema; requires manual type definitions.
- In-memory store: No persistence across restarts; violates FR-029/FR-030.

## R3: Decimal Handling for Monetary Values

**Decision**: Use Drizzle's `decimal()` column type (maps to PostgreSQL `NUMERIC`) for all monetary fields. Values are stored as exact decimals in the database and represented as strings in TypeScript to avoid floating-point precision loss.

**Rationale**: Constitution Principle I mandates decimal types. JavaScript's `number` type is IEEE 754 double-precision, which causes rounding errors in financial calculations (e.g., `0.1 + 0.2 !== 0.3`). By keeping monetary values as strings in the application layer and `NUMERIC` in PostgreSQL, all arithmetic is performed by the database or by explicit decimal libraries when needed.

**Alternatives considered**:
- Store as integer cents (`bigint`): Requires conversion everywhere; obscures business intent in code.
- `decimal.js` library: Adds a runtime dependency for arbitrary-precision math; viable but overkill when PostgreSQL handles the arithmetic.
- JavaScript `number`: Explicitly prohibited by constitution; introduces rounding errors.

## R4: Strategy Pattern for Attribution Models

**Decision**: Define an `IAttributionStrategy` interface in `packages/attribution` with three implementations: `lastTouchStrategy`, `firstTouchStrategy`, `linearStrategy`. The `AttributionService` accepts the strategy as a parameter and delegates credit allocation.

**Rationale**: Constitution Principle III requires new attribution models to be addable without modifying existing code. The Strategy pattern achieves this: one interface, one file per model. All three are needed for MVP because the animated model toggle (US6) is the core UX feature — you cannot demonstrate credit redistribution with only one model.

**Alternatives considered**:
- Switch/case in service: Violates Open/Closed principle; adding models requires changes to existing code.
- Plugin/registry pattern: Over-engineered for a known, small set of models.
- Single function with mode parameter: Less testable; each model cannot be unit-tested in isolation.

## R5: Attribution Algorithms

**Decision**: Three algorithms, all operating on the same input (conversion + sorted touchpoints for the same user before the conversion timestamp):

| Model | Algorithm | Credit Distribution |
|-------|-----------|-------------------|
| Last-touch | Sort touchpoints by timestamp descending, take first | 100% to the last touchpoint |
| First-touch | Sort touchpoints by timestamp ascending, take first | 100% to the first touchpoint |
| Linear | Divide credit equally among all touchpoints | 1/N to each, rounding correction on last |

All models apply the same tie-breaking rule for simultaneous timestamps: alphabetical by channel name (ascending).

**Rationale**: These three models
