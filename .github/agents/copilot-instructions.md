# Animated Customer Journey Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-16

## Active Technologies

- TypeScript 5.9+ / Node.js 20 LTS
- Express.js REST API with Zod validation
- React 19 + Vite, D3.js (d3-sankey), TanStack Query, Zustand
- PostgreSQL via Drizzle ORM
- npm workspaces + Turborepo + Biome
- Vitest for testing

## Project Structure

```text
animated-customer-journey/
├── apps/
│   ├── api/                 # Express REST API
│   └── web/                 # React + Vite frontend (Sankey visualization)
├── packages/
│   ├── attribution/         # Pure TypeScript domain logic (strategy pattern)
│   ├── database/            # Drizzle ORM schema + PostgreSQL
│   └── logger/              # Structured JSON logger
├── package.json             # Root workspace config
├── turbo.json               # Turborepo
└── biome.json               # Linting & formatting
```

## Commands

```bash
npm install                              # Install all dependencies
npx turbo build                          # Build all packages
npm run dev --workspace=apps/api         # Start API dev server (port 5151)
npm run dev --workspace=apps/web         # Start frontend dev server (port 5173)
npx turbo test                           # Run all tests
npx turbo lint                           # Lint all packages
npx drizzle-kit push                     # Push schema to PostgreSQL
```

## Code Style

- TypeScript strict mode, tab indentation, Biome for formatting
- All monetary values as string-encoded decimals (Drizzle `decimal()`)
- Strategy pattern for attribution models in `packages/attribution`
- Zod schemas for all API input validation
- TanStack Query for server state, Zustand for UI state

## Key Architecture

- **Attribution models**: `packages/attribution/src/strategies/` — last-touch, first-touch, linear
- **API routes**: `apps/api/src/routes/` — conversion-events, touchpoints, attribution, reports, journeys
- **Sankey visualization**: `apps/web/src/components/SankeyFlow/` — D3.js animated flow diagram
- **Model toggle**: Zustand store → TanStack Query refetch → D3 transition animation (500ms)

## Recent Changes

- Pivoted from .NET/C#/SQLite to TypeScript monorepo with React + D3.js Sankey visualization
- Three attribution models (last-touch, first-touch, linear) instead of just last-touch
- Added animated Sankey flow diagram as centerpiece feature
- PostgreSQL via Drizzle ORM replaces SQLite/EF Core

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->