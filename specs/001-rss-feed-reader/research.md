# Research: Marketing Attribution Reporter MVP

**Feature**: `001-rss-feed-reader` | **Date**: 2026-03-16

## R1: ASP.NET Core 8 Web API for Data Pipeline

**Decision**: Use ASP.NET Core 8.0 minimal hosting with controller-based routing.

**Rationale**: Controllers provide clear separation per resource (ConversionEvents, Touchpoints, Reports). ASP.NET Core 8 includes built-in model validation, dependency injection, and Swagger support via Swashbuckle. It's the standard choice for .NET REST APIs.

**Alternatives considered**:
- Minimal APIs (lambda-style endpoints): Simpler for small projects, but controllers scale better with multiple endpoints per resource and are easier to organize.
- gRPC: Overkill for an API tested via Swagger/curl; JSON REST is more accessible.

## R2: SQLite with Entity Framework Core for Persistence

**Decision**: Use SQLite via `Microsoft.EntityFrameworkCore.Sqlite` with code-first migrations.

**Rationale**: SQLite is file-based (no server process), ideal for local MVP. EF Core provides type-safe queries, automatic schema migrations, and supports `decimal` column mapping. The database file is portable and easy to reset during development.

**Alternatives considered**:
- PostgreSQL: Production-ready but requires a running server; overkill for local MVP.
- In-memory store: No persistence across restarts; violates FR-015/FR-016.
- Dapper: Lightweight but no migration support; manual schema management is error-prone.

## R3: Decimal Handling for Monetary Values

**Decision**: Use C# `decimal` type for all monetary fields. EF Core maps `decimal` to SQLite's `TEXT` affinity with full precision.

**Rationale**: Constitution Principle I mandates decimal types. IEEE 754 floating-point (double/float) causes rounding errors in financial calculations (e.g., 0.1 + 0.2 ≠ 0.3). The `decimal` type provides 28-29 significant digits, sufficient for marketing spend and revenue.

**Alternatives considered**:
- Store as integer cents (long): Requires conversion everywhere; obscures intent.
- double/float: Explicitly prohibited by constitution.

## R4: Strategy Pattern for Attribution Models

**Decision**: Define `IAttributionStrategy` interface with a `LastTouchAttributionStrategy` implementation. Register via DI; `AttributionService` delegates to the injected strategy.

**Rationale**: Constitution Principle III requires new attribution models to be addable without modifying existing code. The Strategy pattern achieves this with one interface and one class per model. For MVP, only `LastTouchAttributionStrategy` is implemented.

**Alternatives considered**:
- Switch/case in AttributionService: Violates Open/Closed principle; adding models requires code changes.
- Plugin architecture: Over-engineered for the known set of future models.

## R5: Last-Touch Attribution Algorithm

**Decision**: For each conversion event, query all touchpoints with the same user/session ID where `touchpoint.Timestamp < conversion.Timestamp`, order by timestamp descending, take the first one. Assign 100% of conversion value to that touchpoint's channel.

**Rationale**: Last-touch is the simplest and most common attribution model. It answers "what closed the deal?" by crediting the final interaction. The algorithm is O(n log n) per user's touchpoints (sorting), which is efficient for the expected scale.

**Alternatives considered**:
- First-touch: Answers "what started the journey?" — planned for Phase 2.
- Linear: Equal credit to all touchpoints — planned for Phase 2.
- Time-decay: Weighted by recency — planned for Phase 2.

## R6: ROI Calculation

**Decision**: ROI% = ((Total Attributed Revenue - Total Cost) / Total Cost) * 100. For channels with zero cost, display "N/A" instead of infinity/error.

**Rationale**: This is the standard ROI formula used in marketing. Division-by-zero is handled explicitly per Constitution Principle I. Unattributed conversions are grouped under a synthetic "Unattributed" channel with cost = 0.

**Alternatives considered**:
- ROAS (Return on Ad Spend = Revenue / Cost): Simpler but less informative; doesn't show net gain.
- Skip zero-cost channels: Hides data; constitution requires explicit tracking.

## R7: API Documentation

**Decision**: Use Swashbuckle.AspNetCore for automatic Swagger/OpenAPI documentation at `/swagger`.

**Rationale**: Provides interactive API testing UI out of the box, no separate tool needed. Standard approach for ASP.NET Core APIs.

**Alternatives considered**:
- NSwag: Similar capability, but Swashbuckle is more commonly used.
- Manual Postman collections: Not self-updating; falls out of sync.
