<!--
Sync Impact Report
- Version change: 2.0.0 → 3.0.0 (pivot to Animated Customer Journey with TypeScript monorepo)
- Modified principles: All principles rewritten for new tech stack and frontend-focused architecture
- Added sections: Core Principles (7), Technical Standards, Development Workflow, Governance
- Removed sections: All .NET/C#/SQLite content
- Templates checked:
  - .specify/templates/plan-template.md ✅ aligned
  - .specify/templates/spec-template.md ✅ aligned
  - .specify/templates/tasks-template.md ✅ aligned
- Follow-up TODOs: None
-->

# Animated Customer Journey Constitution

## Core Principles

### I. Data Accuracy & Determinism

All attribution calculations MUST be deterministic: the same input data and model MUST always produce the same attribution results. All monetary values MUST use string-encoded decimals (Drizzle `decimal()` → PostgreSQL `NUMERIC`) throughout the entire stack — from API input to database storage to report output and Sankey visualization. JavaScript `number` type MUST NOT be used for monetary calculations. Division-by-zero scenarios (e.g., ROI for channels with zero cost) MUST be handled explicitly and consistently.

### II. Input Validation & Data Integrity

All API endpoints MUST validate inputs using Zod schemas before processing. Required fields, data types, value ranges, and format constraints MUST be enforced at the API boundary. Duplicate event/touchpoint IDs MUST be rejected cleanly with 409 Conflict without corrupting existing data. Timestamps MUST be validated as ISO 8601 format. Monetary values MUST be validated as positive (conversions) or non-negative (costs) decimals. The system MUST NOT allow invalid data to enter the database under any circumstances.

### III. Clean Architecture & Extensibility

The monorepo MUST maintain strict separation: `packages/attribution` (pure domain logic, zero framework deps), `packages/database` (Drizzle schema + connection), `apps/api` (Express HTTP layer), `apps/web` (React frontend). Attribution models MUST be implemented using the Strategy pattern so new models can be added without modifying existing code. Cross-layer dependencies MUST flow inward: apps depend on packages; packages MUST NOT depend on apps. The `packages/attribution` package MUST NOT import any framework or database code.

### IV. Auditability & Traceability

Every attribution result MUST be traceable back to its source conversion event, the attributed touchpoint(s), the model used, and the credit weight assigned. Unattributed conversions MUST be explicitly tracked and reported as "Unattributed" / "Unknown / Direct" in both the API and the Sankey visualization. The system MUST store sufficient data to explain why any conversion was attributed to a particular channel under any model.

### V. MVP-First Delivery

Development MUST deliver a working MVP (data ingestion → three-model attribution → ROI report → animated Sankey visualization) before adding enhanced models or features. Each implementation phase MUST produce a runnable application. Features outside the defined MVP scope (time-decay model, mobile layout, streaming ingestion, multi-tenant) MUST NOT be implemented until explicitly requested. YAGNI principles apply.

### VI. Code Quality & Consistency

Biome MUST be used for linting and formatting across the entire monorepo. TypeScript strict mode MUST be enabled in all packages and apps. Vitest MUST be used for testing. Tab indentation is the standard. All exported functions and types MUST have TypeScript type annotations.

### VII. Visual Fidelity & Performance

The Sankey diagram MUST render within 1 second for up to 5,000 journey paths. Attribution model toggle MUST animate within 500ms (smooth D3 transitions). The visualization MUST handle edge cases gracefully: empty state messages, collapsed long journeys, unattributed flow nodes. Rapid model toggles MUST interrupt cleanly without visual glitches.

## Technical Standards

- **Language**: TypeScript 5.9+ / Node.js 20 LTS.
- **Monorepo**: npm workspaces, Turborepo for build orchestration, Biome for linting/formatting.
- **Backend**: Express.js REST API with Zod input validation.
- **Frontend**: React 19 + Vite, D3.js (d3-sankey), TanStack Query, Zustand.
- **Database**: PostgreSQL via Drizzle ORM. All schema changes MUST use Drizzle migrations.
- **Decimal Types**: All monetary values MUST use Drizzle `decimal()` (PostgreSQL `NUMERIC`) and be represented as strings in TypeScript.
- **API Style**: RESTful endpoints with JSON payloads and standard HTTP status codes.
- **Attribution Models**: Implemented via Strategy pattern in `packages/attribution`. MVP implements last-touch, first-touch, and linear.
- **Configuration**: All environment-specific settings MUST be managed through environment variables or `.env` files — never hardcoded.

## Development Workflow

- **Source Control**: Git with GitHub. All changes MUST be committed with descriptive messages.
- **Spec-Driven Development**: All features MUST be specified in spec.md, planned in plan.md, and broken into tasks in tasks.md before implementation begins.
- **Testing**: Attribution strategies MUST have Vitest unit tests. API endpoints MUST be manually testable via curl or Swagger. Frontend components MUST be testable in isolation.
- **Dependency Injection**: Services are wired in the Express app via constructor injection or factory functions.

## Governance

This constitution governs all development activities for the Animated Customer Journey project. All implementation decisions, code reviews, and feature additions MUST comply with the principles defined above.