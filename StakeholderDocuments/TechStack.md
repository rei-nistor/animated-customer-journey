# Animated Customer Journey — Technology Stack

## Overview

This document outlines the technology choices for the Animated Customer Journey application. The stack is a TypeScript monorepo with a React frontend featuring D3.js Sankey visualizations and an Express API backend.

## Backend

### Framework: Express.js (Node.js 20 LTS)

- **Rationale**: Lightweight, mature HTTP framework. Enables fast iteration with middleware for validation, error handling, and logging.
- **Validation**: Zod schemas for type-safe input validation on all API endpoints.
- **API Style**: RESTful endpoints with JSON request/response payloads.

### Database: PostgreSQL with Drizzle ORM

- **Rationale**: PostgreSQL provides native `decimal`/`numeric` column types for monetary precision. Drizzle ORM offers fully typed queries, schema inference, and lightweight migrations.
- **Decimal Precision**: All monetary values stored as `NUMERIC` and represented as strings in TypeScript to avoid floating-point errors.
- **Connection**: `pg` (node-postgres) connection pool managed by Drizzle.

### Attribution Engine

- **Approach**: A `packages/attribution` package containing pure TypeScript domain logic.
- **Strategy Pattern**: `IAttributionStrategy` interface with three implementations: `lastTouchStrategy`, `firstTouchStrategy`, `linearStrategy`.
- **Services**: `AttributionService` (orchestrates strategy execution), `JourneyService` (builds journey paths), `ReportService` (aggregates channel ROI).

## Frontend

### Framework: React 19 + Vite

- **Rationale**: React 19 for component-based UI. Vite for fast dev server and build.
- **State Management**: Zustand for attribution model selection (global state). TanStack Query for server state (data fetching, caching, refetching).
- **Visualization**: D3.js with `d3-sankey` layout for the animated flow diagram.

### Animated Sankey Flow Diagram

- **Library**: D3.js (`d3-sankey`) for layout calculation; custom React components for rendering.
- **Animations**: SVG `animateMotion` for flowing particle effects on links. D3 transitions (500ms ease-in-out) for smooth model toggle animations.
- **Interactivity**: Click nodes to drill down. Hover for tooltips. Toggle attribution models.

## Architecture

### Monorepo Structure

The project uses npm workspaces with Turborepo for build orchestration and Biome for linting/formatting.

```
animated-customer-journey/
├── apps/
│   ├── api/                 # Express REST API
│   └── web/                 # React + Vite frontend
├── packages/
│   ├── attribution/         # Pure TypeScript domain logic (strategies, services)
│   ├── database/            # Drizzle ORM schema + PostgreSQL connection
│   └── logger/              # Structured JSON logger
├── package.json             # Root workspace config
├── turbo.json               # Turborepo task orchestration
└── biome.json               # Linting & formatting
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| D3.js (d3-sankey) | Sankey diagrams require custom layout; D3 provides full control over rendering and animations |
| Zustand over Redux | Minimal global state (just selected model); Zustand is lightweight and TypeScript-native |
| TanStack Query | Automatic caching, refetching on model change, loading/error states out of the box |
| PostgreSQL over SQLite | Native decimal type; matches production patterns; Drizzle ORM provides typed queries |
| Three attribution models in MVP | Required to demonstrate the animated credit redistribution — the core UX feature |
| TypeScript monorepo | Full-stack type safety from database schema to frontend components |

### Communication

- Frontend (`apps/web`) fetches data from API (`apps/api`) via REST endpoints.
- API uses `packages/attribution` for domain logic and `packages/database` for persistence.
- All packages communicate through typed interfaces and shared types.
