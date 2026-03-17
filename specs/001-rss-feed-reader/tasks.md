# Tasks: Animated Customer Journey MVP

**Input**: Design documents from `/specs/001-rss-feed-reader/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-endpoints.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1–US7)
- Include exact file paths in descriptions

---

## Phase 1: Monorepo Setup

**Purpose**: Initialize the TypeScript monorepo with npm workspaces, Turborepo, Biome, and scaffold all packages/apps

- [ ] T001 Create root `animated-customer-journey/package.json` with npm workspaces config (apps/\*, packages/\*)
- [ ] T002 Create `animated-customer-journey/turbo.json` with build/dev/test/lint task pipelines
- [ ] T003 Create `animated-customer-journey/biome.json` with TypeScript linting, tab indentation, formatting rules
- [ ] T004 Create root `animated-customer-journey/tsconfig.base.json` with strict mode, ES2022 target, shared compiler options
- [ ] T005 [P] Scaffold `packages/logger/` — package.json, tsconfig.json, `src/index.ts` (structured JSON logger with configurable levels)
- [ ] T006 [P] Scaffold `packages/database/` — package.json, tsconfig.json, `drizzle.config.ts`, `src/db.ts` (pg pool + Drizzle), `src/schema/index.ts`
- [ ] T007 [P] Scaffold `packages/attribution/` — package.json, tsconfig.json, `vitest.config.ts`, `src/index.ts`
- [ ] T008 [P] Scaffold `apps/api/` — package.json, tsconfig.json, `vitest.config.ts`, `src/main.ts` (Express entrypoint with CORS, JSON parsing)
- [ ] T009 [P] Scaffold `apps/web/` — package.json, tsconfig.json, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`
- [ ] T010 Install all dependencies: express, zod, drizzle-orm, pg, d3, d3-sankey, react, @tanstack/react-query, zustand, vitest, etc.
- [ ] T011 Verify `npm install` and `npx turbo build` succeed from monorepo root

**Checkpoint**: Monorepo scaffolded, all packages resolve, Turborepo builds.

---

## Phase 2: Database Schema & Domain Models

**Purpose**: Define Drizzle schema, domain types, and strategy interfaces

- [ ] T012 [P] Create `packages/database/src/schema/conversion-events.ts` — conversion_events table (id, eventId, userId, conversionValue decimal, timestamp, metadata, createdAt)
- [ ] T013 [P] Create `packages/database/src/schema/touchpoints.ts` — touchpoints table (id, touchpointId, userId, channelName, campaignName, timestamp, cost decimal, createdAt)
- [ ] T014 [P] Create `packages/database/src/schema/attribution-results.ts` — attribution_results table (id, conversionEventId FK, touchpointId FK nullable, attributionModel, creditWeight decimal, attributedValue decimal, channelName, calculatedAt)
- [ ] T015 Create `packages/database/src/schema/index.ts` — re-export all schemas
- [ ] T016 Create `packages/database/src/db.ts` — pg connection pool + Drizzle instance from DATABASE_URL env var
- [ ] T017 Generate initial Drizzle migration via `npx drizzle-kit generate`
- [ ] T018 [P] Create `packages/attribution/src/models/conversion-event.ts` — TypeScript domain type
- [ ] T019 [P] Create `packages/attribution/src/models/touchpoint.ts` — TypeScript domain type
- [ ] T020 [P] Create `packages/attribution/src/models/attribution-result.ts` — TypeScript domain type with creditWeight (0.0–1.0)
- [ ] T021 Create `packages/attribution/src/strategies/attribution-strategy.ts` — `IAttributionStrategy` interface: `attribute(conversion, touchpoints): AttributionResult[]`

**Checkpoint**: Database schema defined, domain types exist, strategy interface ready.

---

## Phase 3: Attribution Strategies (US3)

**Purpose**: Implement all three attribution models with unit tests

- [ ] T022 [US3] Implement `packages/attribution/src/strategies/last-touch.strategy.ts` — 100% credit to last touchpoint before conversion; alphabetical tie-breaking
- [ ] T023 [US3] Implement `packages/attribution/src/strategies/first-touch.strategy.ts` — 100% credit to first touchpoint; alphabetical tie-breaking
- [ ] T024 [US3] Implement `packages/attribution/src/strategies/linear.strategy.ts` — equal 1/N split, rounding correction on last; alphabetical tie-breaking
- [ ] T025 [US3] Create `packages/attribution/src/services/attribution.service.ts` — orchestrates: fetch touchpoints for user, filter by timestamp < conversion, sort, delegate to strategy, return results
- [ ] T026 [P] [US3] Write Vitest tests `packages/attribution/src/__tests__/last-touch.test.ts` — happy path, no touchpoints (unattributed), tie-breaking, single touchpoint
- [ ] T027 [P] [US3] Write Vitest tests `packages/attribution/src/__tests__/first-touch.test.ts` — same scenarios
- [ ] T028 [P] [US3] Write Vitest tests `packages/attribution/src/__tests__/linear.test.ts` — equal split, rounding, single touchpoint, no touchpoints
- [ ] T029 Verify all tests pass: `npx turbo test --filter=@acj/attribution`

**Checkpoint**: All three attribution models implemented and tested.

---

## Phase 4: API Routes (US1, US2, US3, US4)

**Purpose**: Implement Express REST API with Zod validation

- [ ] T030 [P] [US1] Create `apps/api/src/validation/conversion-event.schema.ts` — Zod schema for POST body
- [ ] T031 [P] [US2] Create `apps/api/src/validation/touchpoint.schema.ts` — Zod schema for POST body
- [ ] T032 [P] Create `apps/api/src/validation/report-query.schema.ts` — Zod schema for report query params (model, startDate, endDate)
- [ ] T033 Create `apps/api/src/middleware/error-handler.ts` — global error handler (Zod errors → 400, duplicates → 409, unhandled → 500)
- [ ] T034 Create `apps/api/src/middleware/request-logger.ts` — log method, path, status, duration
- [ ] T035 [US1] Create `apps/api/src/routes/conversion-events.ts` — POST (validate, check duplicate, insert, return 201) + GET (list all)
- [ ] T036 [US2] Create `apps/api/src/routes/touchpoints.ts` — POST (validate, check duplicate, insert, return 201) + GET (list all)
- [ ] T037 [US3] Create `apps/api/src/routes/attribution.ts` — POST /run (execute attribution with model param), GET /results (filterable by model)
- [ ] T038 [US4] Create `apps/api/src/routes/reports.ts` — GET /channel-roi (accept model, startDate, endDate params)
- [ ] T039 [US5] Create `apps/api/src/routes/journeys.ts` — GET /sankey (aggregated journey data for Sankey: nodes, links, volumes, per-model)
- [ ] T040 [US5] Create journey service `packages/attribution/src/services/journey.service.ts` — build ordered journey paths from touchpoints, aggregate into Sankey nodes/links
- [ ] T041 [US4] Create report service `packages/attribution/src/services/report.service.ts` — aggregate by channel, ROI calculation, date range filter
- [ ] T042 Wire all routes in `apps/api/src/main.ts` — mount routers, middleware, CORS, Swagger/OpenAPI docs
- [ ] T043 Verify API starts and all endpoints respond: `npm run dev --workspace=apps/api`

**Checkpoint**: Full API functional — all CRUD + attribution + report + Sankey endpoints working.

---

## Phase 5: Frontend — Sankey Flow (US5)

**Purpose**: Build the animated Sankey diagram with D3.js

- [ ] T044 [US5] Create `apps/web/src/lib/api-client.ts` — typed fetch wrapper for all API endpoints
- [ ] T045 [US5] Create `apps/web/src/types/index.ts` — shared frontend types (SankeyNode, SankeyLink, ChannelReport, etc.)
- [ ] T046 [US5] Create `apps/web/src/stores/attribution-model.store.ts` — Zustand store for selected model (last-touch | first-touch | linear)
- [ ] T047 [P] [US5] Create `apps/web/src/hooks/useJourneys.ts` — TanStack Query hook: fetch /api/journeys/sankey?model=<selected>
- [ ] T048 [P] [US5] Create `apps/web/src/hooks/useChannelReport.ts` — TanStack Query hook: fetch /api/reports/channel-roi?model=<selected>
- [ ] T049 [P] [US5] Create `apps/web/src/hooks/useAttribution.ts` — TanStack Query hook: run + fetch attribution
- [ ] T050 [US5] Create `apps/web/src/lib/sankey-transforms.ts` — transform API journey data → D3 sankey layout (nodes, links, positions)
- [ ] T051 [US5] Create `apps/web/src/components/SankeyFlow/SankeyFlow.tsx` — main Sankey diagram: D3 layout, SVG rendering, nodes + links
- [ ] T052 [US5] Create `apps/web/src/components/SankeyFlow/SankeyNode.tsx` — individual channel node component
- [ ] T053 [US5] Create `apps/web/src/components/SankeyFlow/SankeyLink.tsx` — animated flow link component with particle/gradient animation
- [ ] T054 [US5] Create `apps/web/src/components/SankeyFlow/SankeyTooltip.tsx` — hover tooltip with flow details
- [ ] T055 [US5] Create `apps/web/src/components/SankeyFlow/useSankeyData.ts` — hook: transforms API data → D3 sankey layout, manages layout state
- [ ] T056 Wire Sankey into `apps/web/src/App.tsx` — render SankeyFlow with data from useJourneys hook
- [ ] T057 Verify Sankey renders with mock/seed data in browser

**Checkpoint**: Animated Sankey diagram renders and flows.

---

## Phase 6: Frontend — Interactivity (US6, US7)

**Purpose**: Attribution model toggle, animated transitions, drill-down, summary cards

- [ ] T058 [US6] Create `apps/web/src/components/AttributionToggle/AttributionToggle.tsx` — segmented control for model selection, updates Zustand store
- [ ] T059 [US6] Implement D3 transition animations in SankeyFlow — when model changes, animate link thicknesses and node sizes smoothly (500ms ease-in-out)
- [ ] T060 [US6] Handle rapid toggles — interrupt current animation, transition to new target state
- [ ] T061 [US4] Create `apps/web/src/components/ReportSummary/ReportSummary.tsx` — ROI summary cards (total revenue, cost, conversions, ROI per channel)
- [ ] T062 [US4] Create `apps/web/src/components/ReportSummary/ChannelCard.tsx` — individual channel card component
- [ ] T063 [US7] Create `apps/web/src/components/ChannelDetail/ChannelDetailPanel.tsx` — slide-out panel on node click: channel metrics, top 5 paths
- [ ] T064 [US7] Create `apps/web/src/components/ChannelDetail/ChannelMetricsTable.tsx` — metrics table for selected channel
- [ ] T065 [P] Create `apps/web/src/components/common/LoadingState.tsx` — loading spinner/skeleton
- [ ] T066 [P] Create `apps/web/src/components/common/ErrorState.tsx` — error display
- [ ] T067 [P] Create `apps/web/src/components/common/EmptyState.tsx` — "No data yet" message
- [ ] T068 Wire all components in `apps/web/src/App.tsx` — layout with Sankey, toggle, summary cards, detail panel

**Checkpoint**: Full interactive frontend — model toggle animates Sankey, drill-down works, summary cards update.

---

## Phase 7: Polish & Testing

**Purpose**: Edge cases, demo data, end-to-end verification

- [ ] T069 Handle edge cases in Sankey: unattributed → "Unknown / Direct" node, long journeys (>20 touchpoints) → collapsed summary nodes, empty state
- [ ] T070 Create seed data script `apps/api/src/seed.ts` — populate database with sample touchpoints, conversions across multiple channels/users for demo
- [ ] T071 Verify model toggle: switch between all three models, confirm link thicknesses change, summary cards update, animation completes within 500ms
- [ ] T072 Verify drill-down: click channel node, panel opens with correct metrics, change model → panel updates
- [ ] T073 Run full E2E test: seed data → open frontend → view Sankey → toggle models → drill down → verify report numbers match API
- [ ] T074 Verify data persistence: stop all services, restart, confirm all data available

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Schema)**: Depends on Phase 1
- **Phase 3 (Attribution)**: Depends on Phase 2 (domain types + strategy interface)
- **Phase 4 (API)**: Depends on Phase 2 + Phase 3
- **Phase 5 (Sankey)**: Depends on Phase 4 (needs API endpoints to fetch data)
- **Phase 6 (Interactivity)**: Depends on Phase 5 (builds on Sankey)
- **Phase 7 (Polish)**: Depends on all previous phases

### Parallel Opportunities

- T005, T006, T007, T008, T009 (package scaffolding) can all run in parallel
- T012, T013, T014 (schema tables) can run in parallel
- T018, T019, T020 (domain types) can run in parallel
- T026, T027, T028 (strategy tests) can run in parallel
- T030, T031, T032 (Zod schemas) can run in parallel
- T047, T048, T049 (TanStack Query hooks) can run in parallel
- T065, T066, T067 (common UI components) can run in parallel