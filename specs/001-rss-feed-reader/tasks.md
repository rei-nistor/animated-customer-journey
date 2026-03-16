# Tasks: Marketing Attribution Reporter MVP

**Input**: Design documents from `/specs/001-rss-feed-reader/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-endpoints.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the .NET solution structure and configure dependencies

- [ ] T001 Create .NET solution file at `MarketingAttributionReporter/AttributionReporter.sln`
- [ ] T002 Create ASP.NET Core Web API project at `MarketingAttributionReporter/AttributionReporter.API/`
- [ ] T003 [P] Create class library project at `MarketingAttributionReporter/AttributionReporter.Core/`
- [ ] T004 [P] Create class library project at `MarketingAttributionReporter/AttributionReporter.Data/`
- [ ] T005 Add project references: API → Core, API → Data, Data → Core
- [ ] T006 Add NuGet packages: `Microsoft.EntityFrameworkCore.Sqlite` and `Microsoft.EntityFrameworkCore.Design` to Data project, `Swashbuckle.AspNetCore` to API project
- [ ] T007 Configure `Program.cs` in `MarketingAttributionReporter/AttributionReporter.API/Program.cs` with DI, Swagger, and SQLite connection string from appsettings.json
- [ ] T008 Configure `appsettings.json` in `MarketingAttributionReporter/AttributionReporter.API/appsettings.json` with SQLite connection string and Kestrel port 5151

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data layer and shared infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Create `ConversionEvent` entity model in `MarketingAttributionReporter/AttributionReporter.Core/Models/ConversionEvent.cs`
- [ ] T010 [P] Create `Touchpoint` entity model in `MarketingAttributionReporter/AttributionReporter.Core/Models/Touchpoint.cs`
- [ ] T011 [P] Create `AttributionResult` entity model in `MarketingAttributionReporter/AttributionReporter.Core/Models/AttributionResult.cs`
- [ ] T012 Create `AppDbContext` with entity configurations (decimal precision, indexes, unique constraints) in `MarketingAttributionReporter/AttributionReporter.Data/AppDbContext.cs`
- [ ] T013 Create EF Core initial migration in `MarketingAttributionReporter/AttributionReporter.Data/Migrations/`
- [ ] T014 [P] Create `IConversionEventRepository` interface in `MarketingAttributionReporter/AttributionReporter.Core/Interfaces/IConversionEventRepository.cs`
- [ ] T015 [P] Create `ITouchpointRepository` interface in `MarketingAttributionReporter/AttributionReporter.Core/Interfaces/ITouchpointRepository.cs`
- [ ] T016 [P] Create `IAttributionResultRepository` interface in `MarketingAttributionReporter/AttributionReporter.Core/Interfaces/IAttributionResultRepository.cs`
- [ ] T017 [P] Implement `ConversionEventRepository` in `MarketingAttributionReporter/AttributionReporter.Data/Repositories/ConversionEventRepository.cs`
- [ ] T018 [P] Implement `TouchpointRepository` in `MarketingAttributionReporter/AttributionReporter.Data/Repositories/TouchpointRepository.cs`
- [ ] T019 [P] Implement `AttributionResultRepository` in `MarketingAttributionReporter/AttributionReporter.Data/Repositories/AttributionResultRepository.cs`
- [ ] T020 Register all repositories and DbContext in DI container in `MarketingAttributionReporter/AttributionReporter.API/Program.cs`
- [ ] T021 Configure automatic database migration on startup in `MarketingAttributionReporter/AttributionReporter.API/Program.cs`

**Checkpoint**: Foundation ready — database schema exists, repositories work, DI is configured. User story implementation can now begin.

---

## Phase 3: User Story 1 — Ingest Conversion Events (Priority: P1) MVP

**Goal**: Marketing analysts can submit conversion events via POST API with full validation

**Independent Test**: POST a valid conversion event via curl/Swagger → get 201. POST invalid data → get 400. POST duplicate → get 409.

### Implementation for User Story 1

- [ ] T022 [P] [US1] Create `CreateConversionEventRequest` DTO in `MarketingAttributionReporter/AttributionReporter.API/DTOs/CreateConversionEventRequest.cs` with validation attributes (Required, Range > 0)
- [ ] T023 [P] [US1] Create `ConversionEventResponse` DTO in `MarketingAttributionReporter/AttributionReporter.API/DTOs/ConversionEventResponse.cs`
- [ ] T024 [US1] Implement `ConversionEventsController` with POST and GET endpoints in `MarketingAttributionReporter/AttributionReporter.API/Controllers/ConversionEventsController.cs` — validate input, check for duplicate EventId (return 409), persist via repository, return 201 with response DTO
- [ ] T025 [US1] Verify US1 acceptance scenarios via Swagger: valid POST returns 201, missing fields returns 400, negative value returns 400, invalid timestamp returns 400, duplicate EventId returns 409

**Checkpoint**: Conversion event ingestion is fully functional. Analysts can submit and retrieve conversion events.

---

## Phase 4: User Story 2 — Ingest Marketing Touchpoints (Priority: P1) MVP

**Goal**: Marketing analysts can submit touchpoint data via POST API with full validation

**Independent Test**: POST a valid touchpoint via curl/Swagger → get 201. POST invalid data → get 400. POST duplicate → get 409.

### Implementation for User Story 2

- [ ] T026 [P] [US2] Create `CreateTouchpointRequest` DTO in `MarketingAttributionReporter/AttributionReporter.API/DTOs/CreateTouchpointRequest.cs` with validation attributes (Required channel, optional cost >= 0)
- [ ] T027 [P] [US2] Create `TouchpointResponse` DTO in `MarketingAttributionReporter/AttributionReporter.API/DTOs/TouchpointResponse.cs`
- [ ] T028 [US2] Implement `TouchpointsController` with POST and GET endpoints in `MarketingAttributionReporter/AttributionReporter.API/Controllers/TouchpointsController.cs` — validate input, check for duplicate TouchpointId (return 409), persist via repository, return 201 with response DTO
- [ ] T029 [US2] Verify US2 acceptance scenarios via Swagger: valid POST returns 201, missing channel returns 400, negative cost returns 400, duplicate TouchpointId returns 409

**Checkpoint**: Both ingestion endpoints work. Analysts can submit conversion events and touchpoints.

---

## Phase 5: User Story 3 — Last-Touch Attribution (Priority: P2) MVP

**Goal**: System attributes each conversion to the last touchpoint before it, using deterministic last-touch logic

**Independent Test**: Submit known touchpoints + conversion for a user → run attribution → verify the correct (last) touchpoint is credited with 100% of conversion value. Submit a conversion with no touchpoints → verify it's marked unattributed.

### Implementation for User Story 3

- [ ] T030 [P] [US3] Create `IAttributionStrategy` interface in `MarketingAttributionReporter/AttributionReporter.Core/Interfaces/IAttributionStrategy.cs` with method `Task<AttributionResult> Attribute(ConversionEvent conversion, IReadOnlyList<Touchpoint> touchpoints)`
- [ ] T031 [US3] Implement `LastTouchAttributionStrategy` in `MarketingAttributionReporter/AttributionReporter.Core/Services/LastTouchAttributionStrategy.cs` — find the touchpoint with the latest timestamp before conversion timestamp, assign 100% value, return unattributed result if no matching touchpoints
- [ ] T032 [US3] Implement `AttributionService` in `MarketingAttributionReporter/AttributionReporter.Core/Services/AttributionService.cs` — for each conversion, get touchpoints by UserSessionId, filter by timestamp < conversion timestamp, call strategy, persist result
- [ ] T033 [US3] Register `IAttributionStrategy` (as `LastTouchAttributionStrategy`) and `AttributionService` in DI in `MarketingAttributionReporter/AttributionReporter.API/Program.cs`
- [ ] T034 [US3] Implement `AttributionController` with POST `/api/attribution/run` endpoint in `MarketingAttributionReporter/AttributionReporter.API/Controllers/AttributionController.cs` — run attribution, return processed/attributed/unattributed counts
- [ ] T035 [US3] Verify US3 acceptance scenarios: user with 3 touchpoints → last one gets credit; user with no touchpoints → unattributed; same data twice → same results (deterministic)

**Checkpoint**: Full attribution pipeline works. Events in → attribution run → results stored.

---

## Phase 6: User Story 4 — Channel-Level ROI Report (Priority: P3) MVP

**Goal**: Generate a channel-level ROI summary with revenue, cost, conversion count, and ROI percentage per channel

**Independent Test**: Ingest known data, run attribution, then GET `/api/reports/channel-roi` → verify channel totals match expected values, zero-cost channels show null ROI, unattributed conversions appear separately.

### Implementation for User Story 4

- [ ] T036 [P] [US4] Create `ChannelReportResponse` and `ChannelReportEntry` DTOs in `MarketingAttributionReporter/AttributionReporter.API/DTOs/ChannelReportResponse.cs` — channel name, total revenue, total cost, conversion count, ROI percentage (nullable decimal)
- [ ] T037 [US4] Implement `ReportService` in `MarketingAttributionReporter/AttributionReporter.Core/Services/ReportService.cs` — aggregate attribution results by channel, sum revenue and costs, calculate ROI = ((revenue - cost) / cost) * 100 with null for zero-cost channels, include "Unattributed" entry, support optional date range filter
- [ ] T038 [US4] Create `IReportService` interface in `MarketingAttributionReporter/AttributionReporter.Core/Interfaces/IReportService.cs` and register in DI in `MarketingAttributionReporter/AttributionReporter.API/Program.cs`
- [ ] T039 [US4] Implement `ReportsController` with GET `/api/reports/channel-roi` endpoint in `MarketingAttributionReporter/AttributionReporter.API/Controllers/ReportsController.cs` — accept optional startDate/endDate query params, call ReportService, return JSON report
- [ ] T040 [US4] Verify US4 acceptance scenarios: channel with $500 revenue/$200 cost → ROI 150%; zero-cost channel → ROI null; unattributed entry present; empty database → empty report; date range filter works

**Checkpoint**: Complete MVP pipeline works end-to-end: ingest → attribute → report.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 [P] Ensure all API error responses follow consistent format (no stack traces, clear messages) across all controllers
- [ ] T042 [P] Add global exception handler middleware in `MarketingAttributionReporter/AttributionReporter.API/Program.cs` to catch unhandled exceptions and return 500 with safe message
- [ ] T043 Run full end-to-end test following `specs/001-rss-feed-reader/quickstart.md` curl commands — verify complete flow: add touchpoints → add conversion → run attribution → get report
- [ ] T044 Verify data persistence: stop application, restart, confirm all data is still present via GET endpoints

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — can start immediately after Phase 2
- **US2 (Phase 4)**: Depends on Foundational — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Foundational + US1 + US2 (needs events and touchpoints in database)
- **US4 (Phase 6)**: Depends on US3 (needs attribution results to report on)
- **Polish (Phase 7)**: Depends on all user stories being complete

### Within Each User Story

- DTOs before controllers (controllers reference DTOs)
- Services before controllers (controllers call services)
- Implementation before verification

### Parallel Opportunities

- T003 and T004 (Core and Data projects) can be created in parallel
- T009, T010, T011 (entity models) can be created in parallel
- T014, T015, T016 (repository interfaces) can be created in parallel
- T017, T018, T019 (repository implementations) can be created in parallel
- T022 and T023 (US1 DTOs) can be created in parallel
- T026 and T027 (US2 DTOs) can be created in parallel
- US1 and US2 (Phases 3-4) can be implemented in parallel since they're independent ingestion endpoints

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1: Setup (T001–T008)
2. Complete Phase 2: Foundational (T009–T021)
3. Complete Phase 3: US1 — Conversion Event Ingestion (T022–T025)
4. Complete Phase 4: US2 — Touchpoint Ingestion (T026–T029)
5. Complete Phase 5: US3 — Last-Touch Attribution (T030–T035)
6. Complete Phase 6: US4 — Channel ROI Report (T036–T040)
7. Complete Phase 7: Polish (T041–T044)
8. **Validate**: Run full end-to-end flow per quickstart.md

**Tasks**: T001–T044 (44 tasks)  
**Deliverable**: Full MVP — ingest events + touchpoints, run last-touch attribution, generate channel-level ROI report with persistence.

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 → Ingestion works → Can demo data capture
3. Add US3 → Attribution works → Can demo channel attribution
4. Add US4 → Reports work → Full MVP demo
5. Polish → Production-ready MVP

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All monetary values MUST use `decimal` type (Constitution Principle I)
- All API inputs MUST be validated (Constitution Principle II)
- Attribution logic MUST be in Core project via Strategy pattern (Constitution Principle III)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
