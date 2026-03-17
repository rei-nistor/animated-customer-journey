# Feature Specification: Marketing Attribution Reporter MVP

**Feature Branch**: `001-marketing-attribution-reporter`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "Marketing Attribution Reporter: A tool that ingests conversion events and attributes them to marketing touchpoints, producing channel-level ROI reports with an interactive animated Sankey flow diagram that visualizes customer journeys. Users can toggle between attribution models and watch credit redistribute in real time. MVP scope: Ingest events via API, apply three attribution models (last-touch, first-touch, linear), generate channel-level ROI summary, and display an animated customer journey flow visualization with drill-down."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ingest Conversion Events (Priority: P1)

As a marketing analyst, I want to submit conversion events (purchases, sign-ups) via API so that the system has the raw data needed for attribution analysis.

**Why this priority**: Without conversion data, nothing else works. This is the foundational data input that everything depends on.

**Independent Test**: Can be fully tested by POSTing a conversion event and verifying it returns a 201 with the persisted event. Delivers value by establishing the data ingestion pipeline.

**Acceptance Scenarios**:

1. **Given** the API is running, **When** I POST a valid conversion event (event ID, user ID, conversion value, timestamp), **Then** the system returns 201 Created with the event details
2. **Given** I submit a conversion event missing required fields (e.g., no user ID), **When** the API processes it, **Then** the system returns 400 Bad Request with details about which fields are missing
3. **Given** I submit a conversion event with a negative conversion value, **When** the API validates it, **Then** the system returns 400 indicating the value must be positive
4. **Given** I submit a conversion event with an invalid timestamp format, **When** the API validates it, **Then** the system returns 400 indicating the timestamp must be ISO 8601
5. **Given** a conversion event with a specific event ID already exists, **When** I submit another event with the same ID, **Then** the system returns 409 Conflict indicating the duplicate
6. **Given** I have submitted multiple conversion events, **When** the application restarts, **Then** all previously submitted events are still available

---

### User Story 2 — Ingest Marketing Touchpoints (Priority: P1)

As a marketing analyst, I want to submit marketing touchpoint data (ad clicks, email opens, organic visits) via API so that the system knows which marketing interactions users had before converting.

**Why this priority**: Touchpoints are the other half of the attribution equation. Without them, conversions cannot be attributed to any channel.

**Independent Test**: Can be tested by POSTing touchpoint data and verifying persistence. Delivers the second data input required for attribution.

**Acceptance Scenarios**:

1. **Given** the API is running, **When** I POST a valid touchpoint (touchpoint ID, user ID, channel name, timestamp), **Then** the system returns 201 Created with the touchpoint details
2. **Given** I submit a touchpoint with optional fields (campaign name, cost), **When** the API processes it, **Then** the optional fields are stored correctly
3. **Given** I submit a touchpoint missing the channel name, **When** the API validates it, **Then** the system returns 400 indicating channel is required
4. **Given** I submit a touchpoint with a negative cost value, **When** the API validates it, **Then** the system returns 400 indicating cost must be non-negative
5. **Given** a touchpoint with a specific ID already exists, **When** I submit another with the same ID, **Then** the system returns 409 Conflict
6. **Given** I submit touchpoints out of chronological order, **When** attribution runs, **Then** the system uses timestamps (not submission order) for ordering

---

### User Story 3 — Run Attribution with Multiple Models (Priority: P2)

As a marketing analyst, I want the system to attribute each conversion using a selected attribution model (last-touch, first-touch, or linear) so that I can compare how different models allocate credit to channels.

**Why this priority**: Attribution is the core business logic that transforms raw data into actionable insights. It depends on both event types being ingested first. Supporting three models is required because the animated model toggle (US5) is the centerpiece UX feature.

**Independent Test**: Can be tested by submitting a known sequence of touchpoints and a conversion, running attribution with each model, and verifying the credit allocation matches the expected distribution.

**Acceptance Scenarios**:

1. **Given** user "U1" has touchpoints [email at T1, paid-search at T2, social at T3] and converts at T4, **When** last-touch attribution runs, **Then** 100% of the conversion value is attributed to "social" (the last touchpoint before conversion)
2. **Given** the same data for user "U1", **When** first-touch attribution runs, **Then** 100% of the conversion value is attributed to "email" (the first touchpoint in the journey)
3. **Given** the same data for user "U1", **When** linear attribution runs, **Then** the conversion value is split equally: 33.33% to email, 33.33% to paid-search, 33.34% to social (rounding applied to the last touchpoint to ensure sum equals 100%)
4. **Given** user "U2" converts but has no touchpoints, **When** attribution runs (any model), **Then** the conversion is marked as "unattributed"
5. **Given** user "U3" has touchpoints after the conversion timestamp, **When** attribution runs, **Then** only touchpoints before the conversion are considered
6. **Given** the same input data, **When** attribution runs multiple times with the same model, **Then** the results are identical every time (deterministic)
7. **Given** new touchpoint data is added for a user who already has attributed conversions, **When** attribution is recalculated, **Then** the results reflect the updated touchpoint data
8. **Given** two touchpoints for the same user have the exact same timestamp, **When** attribution runs, **Then** the system applies deterministic tie-breaking (alphabetical by channel name)

---

### User Story 4 — View Channel-Level ROI Report (Priority: P2)

As a marketing analyst, I want to generate a channel-level ROI report so that I can see which marketing channels deliver the best return on investment under any attribution model.

**Why this priority**: The report is the tabular deliverable that stakeholders care about. It depends on attribution being complete and feeds data to the visualization.

**Independent Test**: Can be tested by ingesting known events/touchpoints, running attribution, then requesting the report and verifying the channel-level numbers match expected calculations.

**Acceptance Scenarios**:

1. **Given** attributed conversions exist across multiple channels, **When** I request the ROI report, **Then** the response contains one entry per channel with: channel name, total attributed revenue, total cost, number of conversions, and ROI percentage
2. **Given** a channel has $500 in attributed revenue and $200 in costs, **When** the report calculates ROI, **Then** ROI = ((500 - 200) / 200) × 100 = 150%
3. **Given** a channel has attributed revenue but zero costs, **When** the report calculates ROI, **Then** ROI is shown as "N/A" (not infinity or error)
4. **Given** some conversions are unattributed, **When** the report is generated, **Then** unattributed conversions appear as a separate "Unattributed" entry
5. **Given** no data has been ingested yet, **When** I request the report, **Then** the system returns an empty report (not an error)
6. **Given** I specify a date range filter, **When** the report is generated, **Then** only conversions within that date range are included
7. **Given** I request the report with a specific attribution model, **When** the report is generated, **Then** it reflects the credit distribution of that model only

---

### User Story 5 — Visualize Customer Journeys as Animated Flow Diagram (Priority: P2)

As a marketing analyst, I want to see an animated Sankey flow diagram showing how conversions flow through marketing channels so that I can visually understand common customer journey patterns at a glance.

**Why this priority**: The Sankey visualization is the centerpiece feature that transforms abstract attribution data into an intuitive, visual experience. It depends on attribution results and journey path data.

**Independent Test**: Can be tested by ingesting a known dataset, running attribution, loading the frontend, and verifying the Sankey diagram renders with correct nodes (channels), links (flows), and proportional link thicknesses.

**Acceptance Scenarios**:

1. **Given** attributed conversions exist with journey paths, **When** I open the frontend application, **Then** a Sankey flow diagram is displayed with nodes representing marketing channels and links representing the flow of conversions between sequential touchpoints
2. **Given** the Sankey diagram is rendered, **When** I observe the link thicknesses, **Then** thicker links represent paths with more conversions flowing through them (proportional to volume)
3. **Given** the Sankey diagram is rendered, **When** I observe the links, **Then** they display a flowing animation (particle or gradient motion) indicating the direction of conversion flow
4. **Given** conversions exist with single-touchpoint journeys, **When** the Sankey renders, **Then** single-touchpoint paths are displayed as a direct link from that channel node to a "Conversion" node with 100% credit
5. **Given** some conversions are unattributed (no touchpoints), **When** the Sankey renders, **Then** an "Unknown / Direct" node appears with unattributed conversion flow
6. **Given** a user journey has more than 20 touchpoints, **When** the Sankey renders, **Then** intermediate touchpoints are collapsed into a summary node (e.g., "12 more interactions") with an expand-on-click option
7. **Given** no data has been ingested, **When** I open the frontend, **Then** an empty state message is displayed (e.g., "No attribution data yet — ingest events to see the flow")

---

### User Story 6 — Toggle Attribution Models and See Credit Redistribute (Priority: P2)

As a marketing analyst, I want to switch between attribution models (last-touch, first-touch, linear) and watch the Sankey diagram animate to show how credit redistributes so that I can compare model impact visually.

**Why this priority**: This is the "wow" interaction that makes the tool memorable and useful. It turns a static report into a dynamic analysis tool. It depends on the Sankey visualization (US5) and multiple attribution models (US3).

**Independent Test**: Can be tested by loading the frontend with attributed data, toggling from last-touch to first-touch, and verifying that link thicknesses animate smoothly to reflect the new credit distribution within the specified time constraint.

**Acceptance Scenarios**:

1. **Given** the Sankey diagram is displayed with last-touch attribution, **When** I select "First Touch" from the attribution model selector, **Then** the diagram animates: link thicknesses smoothly transition to reflect first-touch credit distribution
2. **Given** the Sankey diagram is displayed with last-touch attribution, **When** I select "Linear" from the model selector, **Then** the diagram animates: credit is visually spread more evenly across channels, with link thicknesses adjusting proportionally
3. **Given** I toggle from one model to another, **When** the animation completes, **Then** the transition takes no longer than 500 milliseconds (smooth, not jarring)
4. **Given** I toggle attribution models, **When** the Sankey diagram updates, **Then** the ROI summary cards below the diagram also update to reflect the selected model's numbers
5. **Given** I rapidly toggle between models (e.g., click last-touch, then immediately click linear), **When** the second toggle fires, **Then** the animation interrupts cleanly and transitions to the new target state (no visual glitches or stale data)
6. **Given** the API is loading new attribution data, **When** I toggle the model, **Then** the UI shows a loading indicator and prevents partial renders until data is ready

---

### User Story 7 — Drill Down into Channel Detail (Priority: P3)

As a marketing analyst, I want to click on any channel node in the Sankey diagram to see detailed metrics for that channel so that I can investigate individual channel performance.

**Why this priority**: Drill-down adds depth to the visualization. It is valuable but not blocking for the core flow (view → toggle → compare). Can be delivered as a polish item.

**Independent Test**: Can be tested by clicking a channel node and verifying the detail panel opens with correct metrics matching the API data for that channel under the selected model.

**Acceptance Scenarios**:

1. **Given** the Sankey diagram is displayed, **When** I click on a channel node (e.g., "Social"), **Then** a detail panel slides in from the right showing metrics for that channel
2. **Given** the detail panel is open for "Social", **When** I read the content, **Then** I see: channel name, total attributed conversions, attributed revenue, total cost, ROI percentage, and the top 5 conversion paths that flow through this channel
3. **Given** the detail panel is open, **When** I click a different channel node, **Then** the panel updates to show the new channel's details
4. **Given** the detail panel is open, **When** I click a close button or click outside the panel, **Then** the panel closes
5. **Given** the detail panel is open and I toggle the attribution model, **When** the model changes, **Then** the detail panel updates to reflect the new model's metrics for the same channel

---

### Edge Cases

1. **Simultaneous timestamps**: When two touchpoints for the same user have the exact same timestamp, the system applies deterministic tie-breaking by alphabetical channel name (e.g., "Email" wins over "Social").
2. **Extreme conversion values**: Conversion values up to 999,999,999.99 are accepted as long as they are within decimal precision limits; values exceeding precision are rejected with 400.
3. **Many touchpoints per user**: When hundreds of touchpoints exist for a single user, the system correctly identifies the relevant touchpoint(s) based on the selected attribution model.
4. **Special characters in channel names**: Channel names containing special characters, unicode, or emoji are accepted, stored as-is, and aggregated correctly in reports and the Sankey diagram.
5. **Long journey paths (>20 touchpoints)**: Journeys with more than 20 touchpoints are collapsed into summary nodes in the Sankey diagram, with an expand option on click.
6. **Model toggle during data load**: If the user toggles attribution models while the API is still returning data, the UI displays a loading state and prevents partial Sankey renders.
7. **Database unavailable on startup**: If the database is unreachable, the API returns 503 Service Unavailable on all endpoints with a clear error message; the frontend shows a connection error state.

## Requirements *(mandatory)*

### Functional Requirements — Data Ingestion

- **FR-001**: System MUST accept conversion events via POST API with: event ID, user ID, conversion value (decimal), and timestamp (ISO 8601)
- **FR-002**: System MUST validate all required fields on conversion events and return 400 with field-level error details for invalid input
- **FR-003**: System MUST reject duplicate conversion event IDs with 409 Conflict
- **FR-004**: System MUST validate that conversion values are positive decimal numbers
- **FR-005**: System MUST accept touchpoints via POST API with: touchpoint ID, user ID, channel name, timestamp, and optional campaign name and cost
- **FR-006**: System MUST validate all required fields on touchpoints and return 400 with field-level error details for invalid input
- **FR-007**: System MUST reject duplicate touchpoint IDs with 409 Conflict
- **FR-008**: System MUST validate that touchpoint cost (if provided) is a non-negative decimal number

### Functional Requirements — Attribution

- **FR-009**: System MUST implement last-touch attribution: for each conversion, assign 100% credit to the most recent touchpoint (by timestamp) for the same user before the conversion timestamp
- **FR-010**: System MUST implement first-touch attribution: for each conversion, assign 100% credit to the earliest touchpoint (by timestamp) for the same user before the conversion timestamp
- **FR-011**: System MUST implement linear attribution: for each conversion, split credit equally across all touchpoints for the same user before the conversion timestamp, with rounding correction applied to the last touchpoint
- **FR-012**: System MUST mark conversions with no matching touchpoints as "unattributed"
- **FR-013**: Attribution MUST be deterministic — same inputs and model always produce same results
- **FR-014**: System MUST apply deterministic tie-breaking for simultaneous touchpoints: alphabetical by channel name

### Functional Requirements — Reporting

- **FR-015**: System MUST provide a report endpoint returning channel-level summary: channel name, total attributed revenue, total cost, conversion count, and ROI percentage
- **FR-016**: ROI calculation MUST use the formula: ((revenue − cost) / cost) × 100, with "N/A" for zero-cost channels
- **FR-017**: Report MUST include an "Unattributed" entry for conversions with no matching touchpoints
- **FR-018**: Report MUST accept an attribution model parameter to filter results by model
- **FR-019**: Report MUST accept an optional date range filter

### Functional Requirements — Journey Visualization

- **FR-020**: System MUST provide a journey/sankey endpoint returning aggregated journey data: nodes (channels), links (flows between sequential channels), and flow volumes
- **FR-021**: Journey data MUST accept an attribution model parameter so credit weights reflect the selected model
- **FR-022**: Frontend MUST render a Sankey flow diagram with nodes representing channels and links representing conversion flows, with link thickness proportional to volume
- **FR-023**: Sankey links MUST display a flowing animation (particle or gradient motion) indicating conversion flow direction
- **FR-024**: Frontend MUST provide a model selector (last-touch, first-touch, linear) that refetches data and animates the Sankey diagram to the new distribution within 500ms
- **FR-025**: Frontend MUST display ROI summary cards alongside the Sankey diagram that update when the model changes
- **FR-026**: Frontend MUST support drill-down: clicking a channel node opens a detail panel with channel metrics and top conversion paths
- **FR-027**: Frontend MUST display an "Unknown / Direct" node for unattributed conversions
- **FR-028**: Frontend MUST collapse journeys with more than 20 touchpoints into summary nodes with expand-on-click

### Functional Requirements — System

- **FR-029**: System MUST persist all events, touchpoints, and attribution data in a database
- **FR-030**: System MUST load all previously stored data on application startup
- **FR-031**: All monetary calculations MUST use decimal types (not floating-point)
- **FR-032**: System MUST NOT expose internal error details or stack traces in API responses

### Key Entities

- **ConversionEvent**: A completed business goal. Key attributes: event ID (unique), user ID, conversion value (decimal), timestamp, optional metadata.
- **Touchpoint**: A marketing interaction before conversion. Key attributes: touchpoint ID (unique), user ID, channel name, campaign name (optional), timestamp, cost (decimal, optional).
- **AttributionResult**: The link between a conversion and its attributed touchpoint(s). Key attributes: conversion event ID, attributed touchpoint ID (nullable for unattributed), attribution model name, credit weight (0.0–1.0), attributed value (decimal).
- **ChannelReport**: An aggregated view for reporting. Key attributes: channel name, total attributed revenue, total cost, conversion count, ROI percentage.
- **JourneyPath**: An ordered sequence of touchpoints for a single user leading to a conversion. Key attributes: user ID, conversion event ID, ordered list of touchpoint IDs.
- **JourneyNode**: An aggregated channel node in the Sankey diagram. Key attributes: channel name, total flow volume, total attributed conversions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Analysts can ingest a conversion event via API in under 1 second (single event POST response time)
- **SC-002**: Analysts can ingest a touchpoint via API in under 1 second (single touchpoint POST response time)
- **SC-003**: All three attribution models (last-touch, first-touch, linear) produce correct results for a test dataset of 100 conversions with 500 touchpoints across 5 channels
- **SC-004**: Channel ROI report is generated within 3 seconds for up to 10,000 events
- **SC-005**: Attribution is deterministic — running attribution twice with the same data and model produces identical output
- **SC-006**: All validation error scenarios (missing fields, invalid types, negative values, duplicates) return appropriate HTTP error codes and messages
- **SC-007**: Sankey diagram renders within 1 second for up to 5,000 journey paths
- **SC-008**: Attribution model toggle animates the Sankey diagram to the new distribution within 500 milliseconds

### Assumptions

- Data is ingested via API calls (not file uploads or streaming)
- The application is used by a single team at a time (multi-tenant is out of scope)
- Touchpoints and conversions are linked by user ID provided by the caller
- All timestamps are provided by the caller (the system does not generate them)
- The system runs locally; cloud deployment is out of scope for MVP
- Users have a modern browser supporting SVG animations (Chrome, Firefox, Safari, Edge — latest versions)

### Out of Scope

- User authentication and authorization
- Time-decay or position-based attribution models (future enhancement)
- Real-time streaming ingestion
- Multi-tenant support
- Data export to CSV or external BI tools
- Campaign-level drill-down reports (channel-level only for MVP)
- Bulk import of historical data
- Removing or editing existing events/touchpoints (append-only for MVP)
- Mobile-responsive layout (desktop-only for MVP)
- Automated test suite (manual testing via browser and curl for MVP; unit tests for attribution logic only)