# Contoso RSS Feed Reader - Technology Stack

## Overview

This document outlines the technology choices and architectural rationale for the RSS Feed Reader application. The stack is chosen to align with Contoso's existing .NET ecosystem and development expertise.

## Backend

### Framework: ASP.NET Core 8.0 Web API

- **Rationale**: ASP.NET Core provides a mature, high-performance framework for building RESTful APIs. It integrates well with the .NET ecosystem and supports dependency injection, middleware pipelines, and Entity Framework out of the box.
- **API Style**: RESTful API with JSON responses.
- **Endpoints**: The API exposes endpoints for managing feed subscriptions and retrieving feed items.

### Database: SQLite with Entity Framework Core

- **Rationale**: SQLite provides a lightweight, file-based database that requires no separate server process. It's ideal for an MVP application that stores data locally.
- **ORM**: Entity Framework Core is used for data access, providing type-safe queries, migrations, and change tracking.
- **Data Storage**: Feed subscriptions and related metadata are stored in a local SQLite database file.

### Feed Parsing

- **Approach**: Use the `System.ServiceModel.Syndication` namespace (via the `System.ServiceModel.Syndication` NuGet package) for parsing RSS 2.0 and Atom feed formats.
- **Rationale**: This is a well-maintained, Microsoft-supported library that handles the complexities of feed format parsing.

## Frontend

### Framework: Blazor WebAssembly (WASM)

- **Rationale**: Blazor WebAssembly enables building interactive web UIs using C# instead of JavaScript. This keeps the entire stack in .NET/C#, reducing context switching for developers and simplifying the codebase.
- **Hosting**: The Blazor WASM app runs entirely in the browser and communicates with the backend API via HTTP.
- **Component Model**: Razor components are used to build the UI, following a component-based architecture.

### UI Approach

- Clean, minimal UI suitable for an MVP.
- No external CSS frameworks required for MVP (default Blazor template styling is acceptable).
- Responsive layout for desktop browsers.

## Architecture

### Solution Structure

The solution follows a clean, layered architecture:

```
RSSFeedReader/
├── RSSFeedReader.API/          # ASP.NET Core Web API project
│   ├── Controllers/            # API controllers
│   ├── Program.cs              # Application entry point and configuration
│   └── appsettings.json        # Configuration settings
├── RSSFeedReader.Core/         # Core/domain library
│   ├── Models/                 # Domain models/entities
│   ├── Interfaces/             # Repository and service interfaces
│   └── Services/               # Business logic services
├── RSSFeedReader.Data/         # Data access library
│   ├── DbContext/              # Entity Framework DbContext
│   ├── Repositories/           # Repository implementations
│   └── Migrations/             # EF Core migrations
└── RSSFeedReader.UI/           # Blazor WebAssembly project
    ├── Pages/                  # Razor page components
    ├── Services/               # HTTP client services
    └── Program.cs              # Client-side entry point
```

### Communication

- The Blazor WASM frontend communicates with the ASP.NET Core backend via HTTP REST API calls.
- API responses use standard HTTP status codes and JSON payloads.
- CORS is configured to allow the frontend to communicate with the backend during development.

### Key Design Decisions

1. **Separation of Concerns**: The solution is split into multiple projects to enforce boundaries between API, business logic, data access, and UI layers.
2. **Dependency Injection**: All services and repositories are registered in the DI container for loose coupling and testability.
3. **Repository Pattern**: Data access is abstracted behind repository interfaces, making it easy to swap implementations or add caching in the future.
4. **Configuration**: Application settings (database connection string, API URLs) are managed through standard .NET configuration (appsettings.json, environment variables).

## Development Environment

- **IDE**: Visual Studio Code with C# Dev Kit extension.
- **SDK**: .NET 8.0 SDK.
- **Source Control**: Git with GitHub.
- **Package Manager**: NuGet for .NET packages.
