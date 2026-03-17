# Implementation Plan: Marketing Attribution Reporter MVP

**Branch**: `001-marketing-attribution-reporter` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-marketing-attribution-reporter/spec.md`

## Summary

Build a Marketing Attribution Reporter with an interactive frontend that ingests conversion events and marketing touchpoints via a REST API, applies attribution models (MVP: last-touch, first-touch, linear) to link conversions to marketing interactions, and generates channel-level ROI summary reports. The centerpiece is an **animated Sankey/flow diagram** that visualizes customer journeys as flowing rivers of conversions through marketing channels. Users can toggle attribution models and watch credit **visually redistribute in real time**. The system uses a TypeScript monorepo with Express for the API, React + D3.js for the frontend, Drizzle ORM with PostgreSQL for persistence, and a Strategy pattern for pluggable attribution models.

## Technical Context

**Language/Version**: TypeScript 5.9+ / Node.js 20 LTS  
**Monorepo Tooling**: npm workspaces, Turborepo, Biome  
**Backend**: Express.js REST API with Zod input validation  
**Frontend**: React 19 + Vite, D3.js (d3-sankey) for flow visualizations, TanStack Query for data fetching, Zustand for attribution model state  
**Storage**: PostgreSQL via Drizzle ORM  
**Testing**: Vitest for all packages and apps  
**Target Platform**: Local development (macOS/Windows/Linux)  
**Performance Goals**: Report generation within 3 seconds for up to 10,000 events; Sankey diagram renders within 1 second for up to 5,000 journey paths; attribution model toggle animates within 500ms  
**Constraints**: All monetary values use string-encoded decimals (Drizzle `decimal` type) — no floating-point for money; deterministic attribution with documented tie-breaking rules  
**Scale/Scope**: Single-user, local deployment, up to 10,000 events, 10 marketing channels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Data Accuracy & Determinism | PASS | Decimal types used throughout via Drizzle `decimal()`; attribution is deterministic with alphabetical tie-breaking |
| II | Input Validation & Data Integrity | PASS | All API inputs validated with Zod schemas; duplicates rejected with 409; timestamps validated as ISO 8601 |
| III | Clean Architecture & Extensibility | PASS | Monorepo with separation: `apps/api` (HTTP layer), `packages/attribution` (domain logic), `packages/database` (data access); Strategy pattern for attribution models; inward dependency flow |
| IV | Auditability & Traceability | PASS | `attribution_results` table links every conversion to its attributed touchpoint(s) with model name and weight; unattributed conversions tracked explicitly |
| V | MVP-First Delivery | PASS | Three attribution models (last-touch, first-touch, linear); Sankey flow + model toggle for frontend; no streaming; no multi-tenant; no auth |
| VI | Code Quality & Consistency | PASS | Biome for linting/formatting; TypeScript strict mode; Vitest for testing; tab indentation |
| VII | Structured Logging | PASS | Shared `@mar/logger` package outputting JSON lines; configurable log levels |

## Project Structure

### Documentation (this feature)

```text
specs/001-marketing-attribution-reporter/
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
├── package.json                         # Root workspace config
├── turbo.json                           # Turborepo task orchestration
├── biome.json                           # Linting & formatting
├── apps/
│   ├── api/                             # Express REST API
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── main.ts                  # Express app entrypoint
│   │       ├── routes/
│   │       │   ├── conversion-events.ts # POST/GET conversion events
│   │       │   ├── touchpoints.ts       # POST/GET touchpoints
│   │       │   ├── attribution.ts       # POST run attribution, GET results
│   │       │   ├── reports.ts           # GET channel ROI reports
│   │       │   └── journeys.ts          # GET journey paths for Sankey
│   │       ├── middleware/
│   │       │   ├── error-handler.ts
│   │       │   └── request-logger.ts
│   │       └── validation/
│   │           ├── conversion-event.schema.ts  # Zod schemas
│   │           ├── touchpoint.schema.ts
│   │           └── report-query.schema.ts
│   └── web/                             # React + Vite frontend
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx                 # React app entrypoint
│           ├── App.tsx
│           ├── components/
│           │   ├── SankeyFlow/
│           │   │   ├── SankeyFlow.tsx           # Main animated Sankey diagram
│           │   │   ├── SankeyNode.tsx           # Individual channel/touchpoint node
│           │   │   ├── SankeyLink.tsx           # Animated flow link between nodes
│           │   │   ├── SankeyTooltip.tsx        # Hover tooltip with details
│           │   │   └── useSankeyData.ts         # Hook: transforms API data → D3 sankey layout
│           │   ├── AttributionToggle/
│           │   │   └── AttributionToggle.tsx    # Model selector (last/first/linear)
│           │   ├── ChannelDetail/
│           │   │   ├── ChannelDetailPanel.tsx   # Slide-out panel on node click
│           │   │   └── ChannelMetricsTable.tsx  # Metrics table for selected channel
│           │   ├── ReportSummary/
│           │   │   ├── ReportSummary.tsx        # Channel ROI summary cards
│           │   │   └── ChannelCard.tsx          # Individual channel card
│           │   └── common/
│           │       ├── LoadingState.tsx
│           │       ├── ErrorState.tsx
│           │       └── EmptyState.tsx
│           ├── hooks/
│           │   ├── useAttribution.ts            # TanStack Query: run & fetch attribution
│           │   ├── useJourneys.ts               # TanStack Query: fetch journey paths
│           │   ├── useChannelReport.ts          # TanStack Query: fetch ROI report
│           │   └── useConversionEvents.ts       # TanStack Query: fetch events
│           ├── stores/
│           │   └── attribution-model.store.ts   # Zustand: selected model state
│           ├── types/
│           │   └── index.ts                     # Shared frontend types
│           └── lib/
│               ├── api-client.ts                # Fetch wrapper for API calls
│               └── sankey-transforms.ts         # Data transforms for D3 sankey layout
├── packages/
│   ├── attribution/                     # Domain logic (pure TypeScript)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── models/
│   │       │   ├── conversion-event.ts
│   │       │   ├── touchpoint.ts
│   │       │   └── attribution-result.ts
│   │       ├── strategies/
│   │       │   ├── attribution-strategy.ts      # Interface
│   │       │   ├── last-touch.strategy.ts
│   │       │   ├── first-touch.strategy.ts
│   │       │   └── linear.strategy.ts
│   │       ├── services/
│   │       │   ├── attribution.service.ts       # Orchestrates strategy execution
│   │       │   ├── journey.service.ts           # Builds journey paths from touchpoints
│   │       │   └── report.service.ts            # Aggregates channel-level ROI
���   │       └── __tests__/
│   │           ├── last-touch.test.ts
│   │           ├── first-touch.test.ts
│   │           ├── linear.test.ts
│   │           └── journey.service.test.ts
│   ├── database/                        # Drizzle ORM + PostgreSQL
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   ├── drizzle/                     # Generated migration files
│   │   └── src/
│   │       ├── index.ts
│   │       ├── db.ts                    # Connection pool (pg + Drizzle)
│   │       └── schema/
│   │           ├── index.ts
│   │           ├── conversion-events.ts
│   │           ├── touchpoints.ts
│   │           ├── attribution-results.ts
│   │           └── channels.ts
│   └── logger/                          # Structured JSON logger
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
```

**Structure Decision**: Monorepo with clear separation of concerns mirroring the `LEGO/moe-lexcie` architecture. The `packages/attribution` package is the domain core — it contains pure TypeScript business logic with no framework dependencies, making attribution strategies independently testable. The `packages/database` package owns the Drizzle schema and connection management. The `apps/api` Express app wires everything together. The `apps/web` React app consumes the API and renders the interactive Sankey visualization. All packages communicate through typed interfaces and shared types.

## Data Model Summary

### Core Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| ConversionEvent | `conversion_events` | A completed conversion (purchase, signup, etc.) with revenue and timestamp |
| Touchpoint | `touchpoints` | A marketing interaction (ad click, email open, etc.) linked to a user journey |
| AttributionResult | `attribution_results` | Links a conversion to its attributed touchpoint(s), recording the model used and credit weight |
| Channel | `channels` | Marketing channel reference data (Social, Email, Paid Search, etc.) |

### Derived Data (computed by services, returned via API)

| Concept | Purpose |
|---------|---------|
| JourneyPath | Ordered sequence of touchpoints for a single user leading to a conversion |
| JourneyNode | Aggregated channel node in the Sankey diagram with total flow volume |
| JourneyLink | Connection between two sequential channel nodes with flow weight |
| ChannelReport | Aggregated channel-level metrics: attributed conversions, revenue, spend, ROI |

*Full entity definitions in [data-model.md](data-model.md).*

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/conversion-events` | Ingest a conversion event |
| `GET` | `/api/conversion-events` | List conversion events (with pagination & filters) |
| `POST` | `/api/touchpoints` | Ingest a marketing touchpoint |
| `GET` | `/api/touchpoints` | List touchpoints (with pagination & filters) |
| `POST` | `/api/attribution/run` | Execute attribution for all unattributed conversions |
| `GET` | `/api/attribution/results` | Get attribution results (filterable by model) |
| `GET` | `/api/reports/channel-roi` | Get channel-level ROI summary report |
| `GET` | `/api/reports/channel-roi?model=last-touch` | Get report filtered by attribution model |
| `GET` | `/api/journeys/sankey` | Get aggregated journey data formatted for Sankey rendering |
| `GET` | `/api/journeys/sankey?model=last-touch` | Get Sankey data with credit weights for a specific model |
| `GET` | `/api/journeys/paths/:userId` | Get the raw journey path for a specific user |
| `GET` | `/api/channels/:id/detail` | Get detailed metrics for a single channel |

*Full endpoint contracts in [contracts/api-endpoints.md](contracts/api-endpoints.md).*

## Frontend Architecture

### Sankey Flow Visualization

The centerpiece of the application is an animated Sankey diagram powered by D3.js (`d3-sankey` layout). The diagram visualizes aggregated customer journeys:

- **Nodes** represent marketing channels (e.g., Social, Email, Paid Search, Organic, Direct)
- **Links** represent the flow of conversions between sequential touchpoints
- **Link thickness** is proportional to the number of conversions flowing through that path
- **Node color** indicates channel type; **link color** inherits from the source node
- **Animations**: Links render with a flowing particle animation (SVG `animateMotion`) to convey directionality. When the attribution model changes, link thicknesses animate smoothly via D3 transitions (500ms ease-in-out)

### Attribution Model Toggle

A segmented control (radio button group) allows the user to switch between:
- **Last Touch** — 100% credit to the final touchpoint before conversion
- **First Touch** — 100% credit to the first touchpoint in the journey
- **Linear** — Equal credit split across all touchpoints in the journey

When the user toggles the model:
1. The frontend sets the model in Zustand store
2. TanStack Query refetches `/api/journeys/sankey?model=<selected>`
3. D3 transitions animate link thicknesses and node sizes to their new values
4. The ROI summary cards update simultaneously

### Node Drill-Down

Clicking any node in the Sankey diagram opens a slide-out detail panel showing:
- Channel name and total attributed conversions
- Revenue attributed under the current model
- Top 5 conversion paths flowing through this channel
- Sparkline trend of attributed conversions over time

### State Management

| Store | Library | Purpose |
|-------|---------|---------|
| Attribution model selection | Zustand | Global state for selected model (last-touch / first-touch / linear) |
| API data cache | TanStack Query | Server state: conversion events, touchpoints, attribution results, reports, journeys |
| UI state (selected node, panel open) | React useState | Component-local state for drill-down panel |

## Attribution Strategy Pattern

```text
IAttributionStrategy (interface)
├── lastTouchStrategy    — assigns 100% credit to the last touchpoint before conversion
├── firstTouchStrategy   — assigns 100% credit to the first touchpoint in the journey
└── linearStrategy       — splits credit equally across all touchpoints (1/N each)
```

Each strategy implements:
```
attribute(conversion: ConversionEvent, touchpoints: Touchpoint[]): AttributionResult[]
```

The `AttributionService` orchestrates:
1. For each unattributed conversion, find all touchpoints for that user before the conversion timestamp
2. Sort touchpoints by timestamp (ascending), apply deterministic tie-breaking (alphabetical channel name)
3. Delegate to the selected strategy
4. Persist `AttributionResult` records with model name, weight (0.0–1.0), and attributed revenue

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| D3.js (d3-sankey) over Recharts | Sankey diagrams require custom layout algorithms; D3 provides `d3-sankey` with full control over node/link rendering and animations |
| Zustand over Redux | Minimal global state (just the selected model); Zustand is lighter and TypeScript-native |
| TanStack Query for server state | Automatic caching, refetching on model change, loading/error states out of the box |
| Attribution logic in `packages/attribution` | Pure TypeScript with zero framework deps; independently testable; reusable across apps |
| Three attribution models in MVP | Last-touch alone doesn't showcase the "animated credit redistribution" — the toggle between models is the core UX feature |
| PostgreSQL over SQLite | Decimal type support is native; matches production patterns from moe-lexcie; Drizzle ORM provides typed queries |
| `userId` as a string field (not auth) | No authentication in MVP; `userId` is a simple string identifier passed in event payloads to group touchpoints into journeys |

## Implementation Phases

### Phase 0: Research
- Validate D3 sankey layout capabilities and animation approach
- Confirm Drizzle decimal handling for monetary values
- Evaluate d3-sankey-circular for potential cyclic paths

### Phase 1: Foundation
- Initialize monorepo (npm workspaces, Turborepo, Biome, TypeScript)
- Scaffold all packages and apps
- Set up `packages/logger` and `packages/database` with Drizzle schema
- Set up `packages/attribution` with strategy interface and last-touch implementation

### Phase 2: API
- Implement Express routes for conversion events and touchpoints (CRUD)
- Implement attribution execution endpoint
- Implement channel ROI report endpoint
- Implement journey/sankey data endpoint

### Phase 3: Attribution Logic
- Implement first-touch and linear strategies
- Implement journey path builder
- Add comprehensive Vitest tests for all strategies and edge cases

### Phase 4: Frontend — Sankey Flow
- Scaffold React + Vite app
- Implement Sankey diagram with D3 (static render)
- Add flowing link animations
- Connect to API via TanStack Query

### Phase 5: Frontend — Interactivity
- Implement attribution model toggle with Zustand
- Animate Sankey transitions on model change (D3 transitions)
- Implement node click → drill-down detail panel
- Implement ROI summary cards

### Phase 6: Polish & Testing
- Handle edge cases (unattributed conversions, empty states, long paths)
- Add loading and error states
- Seed data script for demo
- End-to-end manual testing against all acceptance scenarios

## Complexity Tracking

| Item | Justification |
|------|--------------|
| Three attribution models (vs. one) | Required to demonstrate the core UX feature: animated credit redistribution on model toggle. One model alone cannot showcase this. |
| D3 Sankey (vs. simple table) | The animated journey flow is the primary differentiator and the centerpiece user story (US4). A table-only UI would not meet spec requirements. |
| Zustand + TanStack Query (vs. prop drilling) | Attribution model state must be shared across Sankey, report cards, and detail panel. Global state is the clean solution at this scale. |

*No constitution violations to justify. The monorepo structure with separated packages is the minimum required by Principle III.*