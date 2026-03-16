# Implementation Plan: Marketing Attribution Reporter MVP

**Branch**: `001-rss-feed-reader` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-rss-feed-reader/spec.md`

## Summary

Build an API-only Marketing Attribution Reporter that ingests conversion events and marketing touchpoints via REST endpoints, applies last-touch attribution to link conversions to the final marketing interaction, and generates channel-level ROI summary reports. The system uses ASP.NET Core 8.0 Web API with SQLite/EF Core for persistence, a Strategy pattern for attribution models (MVP: last-touch only), and decimal arithmetic throughout for monetary precision.

## Technical Context

**Language/Version**: C# 12 / .NET 8.0  
**Primary Dependencies**: ASP.NET Core 8.0, Entity Framework Core 8.0, Microsoft.EntityFrameworkCore.Sqlite, Swashbuckle (Swagger/OpenAPI)  
**Storage**: SQLite via EF Core (local file-based database)  
**Testing**: Manual testing via Swagger UI and curl; unit tests optional (AttributionReporter.Tests)  
**Target Platform**: Local development (macOS/Windows/Linux), API-only  
**Project Type**: Web API service  
**Performance Goals**: Report generation within 5 seconds for up to 10,000 events; single-event ingestion under 1 second  
**Constraints**: All monetary values use `decimal` type; deterministic attribution; no floating-point for money  
**Scale/Scope**: Single-user, local deployment, up to 10,000 events, 5 marketing channels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Data Accuracy & Determinism | PASS | Decimal types used throughout; attribution is deterministic by design |
| II | Input Validation & Data Integrity | PASS | All API inputs validated; duplicates rejected with 409; timestamps validated as ISO 8601 |
| III | Clean Architecture & Extensibility | PASS | 3-project solution (API, Core, Data); Strategy pattern for attribution models; inward dependency flow |
| IV | Auditability & Traceability | PASS | AttributionResult entity links every conversion to its attributed touchpoint; unattributed tracked explicitly |
| V | MVP-First Delivery | PASS | Last-touch only; API-only (no UI); no streaming; no multi-tenant |

## Project Structure

### Documentation (this feature)

```text
specs/001-rss-feed-reader/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: technology research
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: setup and run instructions
├── contracts/           # Phase 1: API endpoint contracts
│   └── api-endpoints.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
MarketingAttributionReporter/
├── AttributionReporter.sln              # Solution file
├── AttributionReporter.API/             # ASP.NET Core Web API
│   ├── Controllers/
│   │   ├── ConversionEventsController.cs
│   │   ├── TouchpointsController.cs
│   │   └── ReportsController.cs
│   ├── DTOs/                            # Request/Response models
│   │   ├── CreateConversionEventRequest.cs
│   │   ├── CreateTouchpointRequest.cs
│   │   ├── ConversionEventResponse.cs
│   │   ├── TouchpointResponse.cs
│   │   └── ChannelReportResponse.cs
│   ├── Program.cs
│   └── appsettings.json
├── AttributionReporter.Core/            # Domain/business logic
│   ├── Models/
│   │   ├── ConversionEvent.cs
│   │   ├── Touchpoint.cs
│   │   └── AttributionResult.cs
│   ├── Interfaces/
│   │   ├── IConversionEventRepository.cs
│   │   ├── ITouchpointRepository.cs
│   │   ├── IAttributionResultRepository.cs
│   │   └── IAttributionStrategy.cs
│   └── Services/
│       ├── AttributionService.cs
│       ├── LastTouchAttributionStrategy.cs
│       └── ReportService.cs
└── AttributionReporter.Data/            # Data access
    ├── AppDbContext.cs
    ├── Repositories/
    │   ├── ConversionEventRepository.cs
    │   ├── TouchpointRepository.cs
    │   └── AttributionResultRepository.cs
    └── Migrations/                      # EF Core migrations
```

**Structure Decision**: Three-project layered architecture (API → Core ← Data) as required by the constitution. The Core project contains domain models, service interfaces, and attribution logic. The Data project depends on Core for entity types. The API project depends on both for DI wiring. No frontend project needed for MVP.

## Complexity Tracking

No constitution violations to justify. The 3-project structure is the minimum required by Principle III.
