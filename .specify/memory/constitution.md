<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0 (project pivot from RSS Feed Reader to Marketing Attribution Reporter)
- Modified principles: All 5 principles rewritten for new domain
- Added sections: Core Principles (5), Technical Standards, Development Workflow, Governance
- Removed sections: All RSS Feed Reader specific content
- Templates checked:
  - .specify/templates/plan-template.md ✅ aligned
  - .specify/templates/spec-template.md ✅ aligned
  - .specify/templates/tasks-template.md ✅ aligned
- Follow-up TODOs: None
-->

# Contoso Marketing Attribution Reporter Constitution

## Core Principles

### I. Data Accuracy & Determinism

All attribution calculations MUST be deterministic: the same input data MUST always produce the same attribution results. All monetary values (conversion values, costs, revenue, ROI) MUST use decimal types throughout the entire stack — from API input to database storage to report output. Floating-point types (float, double) MUST NOT be used for monetary calculations. Division-by-zero scenarios (e.g., ROI for channels with zero cost) MUST be handled explicitly and consistently.

### II. Input Validation & Data Integrity

All API endpoints MUST validate inputs before processing. Required fields, data types, value ranges, and format constraints MUST be enforced at the API boundary. Duplicate event/touchpoint IDs MUST be rejected cleanly without corrupting existing data. Timestamps MUST be validated as ISO 8601 format. Monetary values MUST be validated as positive (conversions) or non-negative (costs) decimals. The system MUST NOT allow invalid data to enter the database under any circumstances.

### III. Clean Architecture & Extensibility

The solution MUST maintain strict separation between API, business logic, and data access layers through distinct projects (AttributionReporter.API, AttributionReporter.Core, AttributionReporter.Data). Attribution models MUST be implemented using the Strategy pattern so new models (first-touch, linear, time-decay) can be added without modifying existing attribution code. Cross-layer dependencies MUST flow inward: API → Core ← Data. The Core project MUST NOT reference API or Data projects.

### IV. Auditability & Traceability

Every attribution result MUST be traceable back to its source conversion event and the touchpoint it was attributed to. The system MUST store sufficient data to explain why any conversion was attributed to a particular channel. Unattributed conversions (those with no matching touchpoints) MUST be explicitly tracked and reported separately, never silently dropped.

### V. MVP-First Delivery

Development MUST prioritize delivering a working MVP (event ingestion → last-touch attribution → channel ROI report) before adding additional attribution models or UI features. Each implementation phase MUST produce a runnable application. Features outside the defined MVP scope (first-touch/linear models, dashboard UI, streaming ingestion, multi-tenant) MUST NOT be implemented until explicitly requested. YAGNI principles apply.

## Technical Standards

- **Framework**: ASP.NET Core 8.0 Web API (API-only, no frontend for MVP).
- **Database**: SQLite with Entity Framework Core for local data persistence. All schema changes MUST use EF Core migrations.
- **Decimal Types**: All monetary values MUST use `decimal` type in C# and appropriate decimal column types in the database.
- **API Style**: RESTful endpoints with JSON request/response payloads and standard HTTP status codes.
- **API Documentation**: Swagger/OpenAPI MUST be enabled for all endpoints.
- **Attribution Models**: Implemented via Strategy pattern in the Core project. MVP implements last-touch only.
- **Configuration**: All environment-specific settings (connection strings, ports) MUST be managed through `appsettings.json` and environment variables — never hardcoded.
- **NuGet Packages**: Only well-maintained, Microsoft-supported or widely-adopted packages are permitted.

## Development Workflow

- **Source Control**: Git with GitHub. All changes MUST be committed with descriptive messages.
- **Branching**: Feature work SHOULD be done on feature branches and merged via pull requests.
- **Spec-Driven Development**: All features MUST be specified in spec.md, planned in plan.md, and broken into tasks in tasks.md before implementation begins.
- **Testing**: All API endpoints MUST be manually testable via Swagger UI or curl. Attribution calculation correctness MUST be verified with known test data.
- **Code Review**: All production code changes SHOULD be reviewed for adherence to this constitution's principles before merging.
- **Dependency Injection**: All service registrations MUST be centralized in `Program.cs`. Constructor injection is the only permitted DI pattern.

## Governance

This constitution governs all development activities for the Contoso Marketing Attribution Reporter project. All implementation decisions, code reviews, and feature additions MUST comply with the principles defined above.

- **Amendment Process**: Any change to this constitution MUST be documented with a version bump, rationale, and updated date. MAJOR changes (removing or redefining principles) require stakeholder review. MINOR changes (adding principles or expanding guidance) require team review. PATCH changes (clarifications, typo fixes) can be made directly.
- **Compliance**: Every pull request and code review MUST verify adherence to these principles. Non-compliant code MUST be revised before merging.
- **Conflict Resolution**: If principles conflict, prioritize in this order: Data Accuracy > Security > Correctness > Maintainability > Performance > Simplicity.

**Version**: 2.0.0 | **Ratified**: 2026-03-16 | **Last Amended**: 2026-03-16
