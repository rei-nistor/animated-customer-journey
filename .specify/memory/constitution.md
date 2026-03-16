<!--
Sync Impact Report
- Version change: N/A → 1.0.0 (initial constitution)
- Added sections: Core Principles (5), Technical Standards, Development Workflow, Governance
- Removed sections: None
- Templates checked:
  - .specify/templates/plan-template.md ✅ aligned
  - .specify/templates/spec-template.md ✅ aligned
  - .specify/templates/tasks-template.md ✅ aligned
- Follow-up TODOs: None
-->

# Contoso RSS Feed Reader Constitution

## Core Principles

### I. Input Validation & Security

All API endpoints and UI forms MUST validate inputs before processing. URL inputs MUST be checked for proper URI format, length limits (max 2048 characters), and null/empty values. The system MUST NOT pass unvalidated user input to external HTTP requests or database queries. All external feed URLs MUST be fetched server-side only; the frontend MUST NOT make direct requests to arbitrary external URLs.

### II. Clean Architecture & Separation of Concerns

The solution MUST maintain strict separation between API, business logic, data access, and UI layers through distinct projects (RSSFeedReader.API, RSSFeedReader.Core, RSSFeedReader.Data, RSSFeedReader.UI). Cross-layer dependencies MUST flow inward: UI → API → Core ← Data. The Core project MUST NOT reference Data or API projects. All inter-layer communication MUST use dependency injection and interface abstractions.

### III. Maintainability & Code Quality

All code MUST follow C# coding conventions and .NET best practices. Classes and methods MUST have single, clear responsibilities. Business logic MUST reside in service classes within the Core project, not in controllers or UI components. All services and repositories MUST be registered in the DI container. Magic strings and hardcoded values MUST be replaced with constants or configuration entries.

### IV. Graceful Error Handling

The application MUST handle all expected error scenarios without crashing: network failures during feed fetching, malformed or invalid feed XML, unreachable feed URLs, and invalid user input. All API endpoints MUST return appropriate HTTP status codes (400 for bad input, 404 for not found, 500 for server errors). Error messages displayed to users MUST be clear and actionable without exposing internal implementation details or stack traces.

### V. MVP-First Delivery

Development MUST prioritize delivering a working MVP (feed subscription management with persistence) before adding enhanced features. Each implementation phase MUST produce a runnable application. Features outside the defined MVP scope (authentication, categorization, search, social features, mobile optimization, cloud deployment) MUST NOT be implemented until explicitly requested. YAGNI (You Aren't Gonna Need It) principles apply: do not build abstractions or infrastructure for hypothetical future requirements.

## Technical Standards

- **Framework**: ASP.NET Core 8.0 Web API for the backend; Blazor WebAssembly for the frontend.
- **Database**: SQLite with Entity Framework Core for local data persistence. All schema changes MUST use EF Core migrations.
- **Feed Parsing**: `System.ServiceModel.Syndication` NuGet package for RSS 2.0 and Atom format parsing.
- **API Style**: RESTful endpoints with JSON request/response payloads and standard HTTP status codes.
- **CORS**: MUST be configured to allow the Blazor WASM frontend to communicate with the backend API during development.
- **Configuration**: All environment-specific settings (connection strings, API URLs, ports) MUST be managed through `appsettings.json` and environment variables — never hardcoded.
- **NuGet Packages**: Only well-maintained, Microsoft-supported or widely-adopted packages are permitted. Each new package addition MUST be justified.

## Development Workflow

- **Source Control**: Git with GitHub. All changes MUST be committed with descriptive messages.
- **Branching**: Feature work SHOULD be done on feature branches and merged via pull requests.
- **Spec-Driven Development**: All features MUST be specified in spec.md, planned in plan.md, and broken into tasks in tasks.md before implementation begins.
- **Testing**: All API endpoints MUST be manually testable. Acceptance scenarios from the specification MUST be verified before marking a feature complete.
- **Code Review**: All production code changes SHOULD be reviewed for adherence to this constitution's principles before merging.
- **Dependency Injection**: All service registrations MUST be centralized in `Program.cs`. Constructor injection is the only permitted DI pattern.

## Governance

This constitution governs all development activities for the Contoso RSS Feed Reader project. All implementation decisions, code reviews, and feature additions MUST comply with the principles defined above.

- **Amendment Process**: Any change to this constitution MUST be documented with a version bump, rationale, and updated date. MAJOR changes (removing or redefining principles) require stakeholder review. MINOR changes (adding principles or expanding guidance) require team review. PATCH changes (clarifications, typo fixes) can be made directly.
- **Compliance**: Every pull request and code review MUST verify adherence to these principles. Non-compliant code MUST be revised before merging.
- **Conflict Resolution**: If principles conflict, prioritize in this order: Security > Correctness > Maintainability > Performance > Simplicity.

**Version**: 1.0.0 | **Ratified**: 2026-03-16 | **Last Amended**: 2026-03-16
