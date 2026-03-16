# Contoso Marketing Attribution Reporter - Technology Stack

## Overview

This document outlines the technology choices and architectural rationale for the Marketing Attribution Reporter. The stack is chosen to align with Contoso's existing .NET ecosystem and to provide a solid foundation for a data pipeline application.

## Backend

### Framework: ASP.NET Core 8.0 Web API

- **Rationale**: ASP.NET Core provides a mature, high-performance framework for building RESTful APIs. It integrates well with the .NET ecosystem and supports dependency injection, middleware pipelines, and Entity Framework out of the box.
- **API Style**: RESTful API with JSON request/response payloads.
- **Endpoints**: The API exposes endpoints for ingesting conversion events, ingesting touchpoints, running attribution, and generating reports.

### Database: SQLite with Entity Framework Core

- **Rationale**: SQLite provides a lightweight, file-based database that requires no separate server process. It's ideal for an MVP application that stores data locally and supports SQL queries for report generation.
- **ORM**: Entity Framework Core is used for data access, providing type-safe queries, migrations, and change tracking.
- **Data Storage**: Conversion events, touchpoints, and attribution results are stored in a local SQLite database file.
- **Decimal Precision**: All monetary values MUST be stored as decimal types to avoid floating-point precision errors.

### Attribution Engine

- **Approach**: A dedicated attribution service in the Core project implements the attribution logic. The service is designed with the Strategy pattern so new attribution models (first-touch, linear, time-decay) can be added without modifying existing code.
- **Rationale**: Separating attribution logic from data access and API layers enables independent testing and future extensibility.

## Frontend

### Approach: API-Only (No Frontend for MVP)

- **Rationale**: The MVP focuses on the data pipeline and reporting via API endpoints. Reports are returned as JSON from the API. A dashboard UI with charts is planned for Phase 3 but is out of scope for MVP.
- **Testing**: API endpoints can be tested using tools like curl, Postman, or the built-in Swagger/OpenAPI documentation.

## Architecture

### Solution Structure

The solution follows a clean, layered architecture:

```
MarketingAttributionReporter/
├── AttributionReporter.API/         # ASP.NET Core Web API project
│   ├── Controllers/                 # API controllers (Events, Touchpoints, Reports)
│   ├── Program.cs                   # Application entry point and configuration
│   └── appsettings.json             # Configuration settings
├── AttributionReporter.Core/        # Core/domain library
│   ├── Models/                      # Domain models (ConversionEvent, Touchpoint, AttributionResult, ChannelReport)
│   ├── Interfaces/                  # Repository and service interfaces
│   └── Services/                    # Attribution engine, report generation service
├── AttributionReporter.Data/        # Data access library
│   ├── DbContext/                   # Entity Framework DbContext
│   ├── Repositories/                # Repository implementations
│   └── Migrations/                  # EF Core migrations
└── AttributionReporter.Tests/       # Unit tests (optional but recommended)
    └── Services/                    # Attribution logic tests
```

### Communication

- API-only application. All interaction is via REST API endpoints.
- API responses use standard HTTP status codes and JSON payloads.
- Swagger/OpenAPI documentation is auto-generated for easy testing.

### Key Design Decisions

1. **Separation of Concerns**: The solution is split into multiple projects to enforce boundaries between API, business logic, and data access.
2. **Strategy Pattern for Attribution**: Attribution models are implemented as interchangeable strategies, making it trivial to add new models later.
3. **Dependency Injection**: All services and repositories are registered in the DI container for loose coupling and testability.
4. **Repository Pattern**: Data access is abstracted behind repository interfaces.
5. **Decimal Arithmetic**: All monetary values use `decimal` type throughout the entire stack — from API input to database storage to report output.
6. **Configuration**: Application settings (database connection string, ports) are managed through `appsettings.json` and environment variables.

## Development Environment

- **IDE**: Visual Studio Code with C# Dev Kit extension.
- **SDK**: .NET 8.0 SDK.
- **Source Control**: Git with GitHub.
- **Package Manager**: NuGet for .NET packages.
- **API Testing**: Swagger UI (included) or curl/Postman.
