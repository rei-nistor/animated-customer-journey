# Feature Specification: Marketing Attribution Reporter MVP

**Feature Branch**: `001-rss-feed-reader`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Marketing Attribution Reporter: A tool that ingests conversion events and attributes them to marketing touchpoints, producing channel-level ROI reports. MVP scope: Ingest conversion events via API, apply last-touch attribution, generate a channel-level ROI summary."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ingest Conversion Events (Priority: P1)

As a marketing analyst, I want to submit conversion events (purchases, sign-ups) via API so that the system has the raw data needed for attribution analysis.

**Why this priority**: Without conversion data, nothing else works. This is the foundational data input that everything depends on.

**Independent Test**: Can be fully tested by POSTing a conversion event via curl/Swagger and verifying it returns a 201 with the persisted event. Delivers value by establishing the data ingestion pipeline.

**Acceptance Scenarios**:

1. **Given** the API is running, **When** I POST a valid conversion event (event ID, user/session ID, conversion value, timestamp), **Then** the system returns 201 Created with the event details
2. **Given** I submit a conversion event missing required fields (e.g., no user ID), **When** the API processes it, **Then** the system returns 400 Bad Request with details about which fields are missing
3. **Given** I submit a conversion event with a negative conversion value, **When** the API validates it, **Then** the system returns 400 indicating the value must be positive
4. **Given** I submit a conversion event with an invalid timestamp format, **When** the API validates it, **Then** the system returns 400 indicating the timestamp must be ISO 8601
5. **Given** a conversion event with a specific event ID already exists, **When** I submit another event with the same ID, **Then** the system returns 409 Conflict indicating the duplicate
6. **Given** I have submitted multiple conversion events, **When** the application restarts, **Then** all previously submitted events are still available

---

### User Story 2 - Ingest Marketing Touchpoints (Priority: P1)

As a marketing analyst, I want to submit marketing touchpoint data (ad clicks, email opens, organic visits) via API so that the system knows which marketing interactions users had before converting.

**Why this priority**: Touchpoints are the other half of the attribution equation. Without them, conversions can't be attributed to any channel.

**Independent Test**: Can be tested by POSTing touchpoint data and verifying persistence. Delivers the second data input required for attribution.

**Acceptance Scenarios**:

1. **Given** the API is running, **When** I POST a valid touchpoint (touchpoint ID, user/session ID, channel name, timestamp), **Then** the system returns 201 Created with the touchpoint details
2. **Given** I submit a touchpoint with optional fields (campaign name, cost), **When** the API processes it, **Then** the optional fields are stored correctly
3. **Given** I submit a touchpoint missing the channel name, **When** the API validates it, **Then** the system returns 400 indicating channel is required
4. **Given** I submit a touchpoint with a negative cost value, **When** the API validates it, **Then** the system returns 400 indicating cost must be non-negative
5. **Given** a touchpoint with a specific ID already exists, **When** I submit another with the same ID, **Then** the system returns 409 Conflict
6. **Given** I submit touchpoints out of chronological order, **When** attribution runs, **Then** the system uses timestamps (not submission order) for ordering

---

### User Story 3 - Last-Touch Attribution (Priority: P2)

As a marketing analyst, I want the system to attribute each conversion to the last marketing touchpoint before that conversion so that I can understand which channel closed the deal.

**Why this priority**: Attribution is the core business logic that transforms raw data into actionable insights. It depends on both event types being ingested first.

**Independent Test**: Can be tested by submitting a known sequence of touchpoints and a conversion, then verifying the attribution assigns 100% credit to the correct last touchpoint.

**Acceptance Scenarios**:

1. **Given** user "U1" has touchpoints [email at T1, paid-search at T2, social at T3] and converts at T4, **When** last-touch attribution runs, **Then** 100% of the conversion value is attributed to "social" (the last touchpoint before conversion)
2. **Given** user "U2" converts but has no touchpoints, **When** attribution runs, **Then** the conversion is marked as "unattributed"
3. **Given** user "U3" has touchpoints after the conversion timestamp, **When** attribution runs, **Then** only touchpoints before the conversion are considered
4. **Given** the same input data, **When** attribution runs multiple times, **Then** the results are identical every time (deterministic)
5. **Given** new touchpoint data is added for a user who already has attributed conversions, **When** attribution is recalculated, **Then** the results reflect the updated touchpoint data

---

### User Story 4 - Channel-Level ROI Report (Priority: P3)

As a marketing analyst, I want to generate a channel-level ROI report so that I can see which marketing channels deliver the best return on investment.

**Why this priority**: The report is the deliverable that stakeholders care about. It depends on attribution being complete but is the ultimate value output.

**Independent Test**: Can be tested by ingesting known events/touchpoints, running attribution, then calling the report endpoint and verifying the channel-level numbers match expected calculations.

**Acceptance Scenarios**:

1. **Given** attributed conversions exist across multiple channels, **When** I request the ROI report, **Then** the response contains one entry per channel with: channel name, total attributed revenue, total cost, number of conversions, and ROI percentage
2. **Given** a channel has $500 in attributed revenue and $200 in costs, **When** the report calculates ROI, **Then** ROI = ((500 - 200) / 200) * 100 = 150%
3. **Given** a channel has attributed revenue but zero costs, **When** the report calculates ROI, **Then** ROI is shown as "N/A" (not infinity or error)
4. **Given** some conversions are unattributed, **When** the report is generated, **Then** unattributed conversions appear as a separate "Unattributed" entry
5. **Given** no data has been ingested yet, **When** I request the report, **Then** the system returns an empty report (not an error)
6. **Given** I specify a date range filter, **When** the report is generated, **Then** only conversions within that date range are included

---

### Edge Cases

- What happens when two touchpoints for the same user have the exact same timestamp? The system should use the touchpoint with the higher ID (or the one submitted last) as a tiebreaker.
- What happens when a conversion value is extremely large (e.g., 999999999.99)? The system should accept it as long as it's within decimal precision limits.
- What happens when hundreds of touchpoints exist for a single user? The system should still correctly identify the last one before each conversion.
- What happens when a channel name contains special characters or unicode? The system should accept and store it as-is, aggregating correctly in reports.
- What happens when the database file is deleted? The system should recreate it on startup with an empty schema (EF migrations).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept conversion events via POST API with: event ID, user/session ID, conversion value (decimal), and timestamp (ISO 8601)
- **FR-002**: System MUST validate all required fields on conversion events and return 400 with details for invalid input
- **FR-003**: System MUST reject duplicate conversion event IDs with 409 Conflict
- **FR-004**: System MUST validate that conversion values are positive decimal numbers
- **FR-005**: System MUST accept touchpoints via POST API with: touchpoint ID, user/session ID, channel name, timestamp, and optional campaign name and cost
- **FR-006**: System MUST validate all required fields on touchpoints and return 400 with details for invalid input
- **FR-007**: System MUST reject duplicate touchpoint IDs with 409 Conflict
- **FR-008**: System MUST validate that touchpoint cost (if provided) is a non-negative decimal number
- **FR-009**: System MUST implement last-touch attribution: for each conversion, assign 100% credit to the most recent touchpoint (by timestamp) for the same user/session before the conversion timestamp
- **FR-010**: System MUST mark conversions with no matching touchpoints as "unattributed"
- **FR-011**: Attribution MUST be deterministic — same inputs always produce same results
- **FR-012**: System MUST provide a report endpoint returning channel-level summary: channel name, total attributed revenue, total cost, conversion count, and ROI percentage
- **FR-013**: ROI calculation MUST use the formula: ((revenue - cost) / cost) * 100, with "N/A" for zero-cost channels
- **FR-014**: Report MUST include an "Unattributed" entry for conversions with no matching touchpoints
- **FR-015**: System MUST persist all events, touchpoints, and attribution data in a local database
- **FR-016**: System MUST load all previously stored data on application startup
- **FR-017**: All monetary calculations MUST use decimal types (not floating-point)
- **FR-018**: System MUST NOT expose internal error details or stack traces in API responses

### Key Entities

- **ConversionEvent**: A completed business goal. Key attributes: event ID (unique), user/session ID, conversion value (decimal), timestamp, optional metadata.
- **Touchpoint**: A marketing interaction before conversion. Key attributes: touchpoint ID (unique), user/session ID, channel name, campaign name (optional), timestamp, cost (decimal, optional).
- **AttributionResult**: The link between a conversion and its attributed touchpoint. Key attributes: conversion event ID, attributed touchpoint ID (nullable for unattributed), attributed value (decimal), attribution model used.
- **ChannelReport**: An aggregated view for reporting. Key attributes: channel name, total attributed revenue, total cost, conversion count, ROI percentage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Analysts can ingest a conversion event via API in under 1 second (single event POST)
- **SC-002**: Analysts can ingest a touchpoint via API in under 1 second (single touchpoint POST)
- **SC-003**: Last-touch attribution produces correct results for a test dataset of 100 conversions with 500 touchpoints across 5 channels
- **SC-004**: Channel ROI report is generated within 5 seconds for up to 10,000 events
- **SC-005**: Attribution is deterministic — running the same report twice with no data changes produces identical output
- **SC-006**: All four validation error scenarios (missing fields, invalid types, negative values, duplicates) return appropriate HTTP error codes and messages

### Assumptions

- Data is ingested via API calls (not file uploads or streaming)
- The application is used by a single team at a time (multi-tenant is out of scope)
- Touchpoints and conversions are linked by user/session ID provided by the caller
- All timestamps are provided by the caller (the system does not generate them)
- The system runs locally; cloud deployment is out of scope for MVP

### Out of Scope

- User authentication and authorization
- First-touch, linear, or time-decay attribution models (Phase 2)
- Dashboard UI with charts and visualizations (Phase 3)
- Real-time streaming ingestion
- Multi-tenant support
- Data export to CSV or external BI tools
- Campaign-level drill-down reports
- Bulk import of historical data
- Removing or editing existing events/touchpoints (future enhancement)
