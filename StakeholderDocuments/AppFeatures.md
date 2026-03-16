# Contoso Marketing Attribution Reporter - Application Features

## Overview

The Marketing Attribution Reporter ingests conversion events and marketing touchpoints via API, attributes conversions to the appropriate marketing channels using configurable attribution models, and produces channel-level ROI reports. The following features describe the user-facing capabilities required for the application.

## Feature 1: Conversion Event Ingestion

### Description

Marketing analysts can submit conversion events to the system via a REST API. Each conversion event represents a completed business goal (e.g., a purchase, sign-up, or download) and includes the conversion value, timestamp, and a user/session identifier that links it to marketing touchpoints.

### User Stories

#### US1: Submit Conversion Events

As a marketing analyst, I want to submit conversion events via API so that the system can track which conversions occurred and their monetary value.

**Acceptance Criteria:**

- The API accepts a conversion event with: event ID, user/session ID, conversion value (decimal), conversion timestamp, and optional metadata.
- The system validates that the conversion value is a positive decimal number.
- The system validates that the timestamp is a valid ISO 8601 date-time.
- The system validates that user/session ID is not empty.
- When a valid event is submitted, it is persisted and a confirmation response is returned.
- If required fields are missing or invalid, the system returns a 400 error with details about which fields failed validation.
- Duplicate event IDs are rejected with an appropriate error message.

## Feature 2: Touchpoint Data Ingestion

### Description

Marketing analysts can submit marketing touchpoint data via a REST API. Touchpoints represent user interactions with marketing channels (e.g., clicking an ad, opening an email, visiting from organic search) that occurred before a conversion.

### User Stories

#### US2: Submit Marketing Touchpoints

As a marketing analyst, I want to submit touchpoint data so that the system knows which marketing interactions a user had before converting.

**Acceptance Criteria:**

- The API accepts a touchpoint with: touchpoint ID, user/session ID, channel name (e.g., "paid-search", "email", "organic", "social"), campaign name (optional), touchpoint timestamp, and cost (decimal, optional).
- The system validates that channel name is not empty.
- The system validates that the timestamp is a valid ISO 8601 date-time.
- The system validates that cost, if provided, is a non-negative decimal number.
- When a valid touchpoint is submitted, it is persisted and a confirmation response is returned.
- Duplicate touchpoint IDs are rejected with an appropriate error message.
- Touchpoints can be submitted in any order; the system uses timestamps for ordering.

## Feature 3: Last-Touch Attribution

### Description

The system applies last-touch attribution to assign full conversion credit to the final marketing touchpoint that occurred before each conversion event.

### User Stories

#### US3: Attribute Conversions Using Last-Touch Model

As a marketing analyst, I want the system to attribute each conversion to the last marketing touchpoint before that conversion so that I can understand which channel closed the deal.

**Acceptance Criteria:**

- For each conversion event, the system identifies all touchpoints for the same user/session ID with timestamps before the conversion timestamp.
- The system assigns 100% of the conversion value to the last (most recent) touchpoint before the conversion.
- If a conversion has no associated touchpoints, it is marked as "unattributed."
- Attribution results are deterministic: the same input data always produces the same output.
- Attribution can be recalculated when new touchpoint data is added.

## Feature 4: Channel-Level ROI Report

### Description

The system generates a summary report showing ROI by marketing channel, based on attributed conversions and touchpoint costs.

### User Stories

#### US4: Generate Channel ROI Summary Report

As a marketing analyst, I want to generate a channel-level ROI report so that I can see which marketing channels are delivering the best return on investment.

**Acceptance Criteria:**

- The report endpoint returns a JSON summary with one entry per channel.
- Each channel entry includes: channel name, total attributed revenue, total cost (sum of touchpoint costs for that channel), number of attributed conversions, and ROI percentage ((revenue - cost) / cost * 100).
- Channels with zero cost show ROI as "N/A" (avoid division by zero).
- Unattributed conversions are listed as a separate "Unattributed" entry.
- The report reflects the latest data including any recently ingested events and touchpoints.
- The report can be filtered by date range (start date, end date) — optional for MVP.

## Feature 5: Data Persistence

### Description

All conversion events, touchpoints, and attribution results are persisted locally so that data survives application restarts and reports can be regenerated.

### User Stories

#### US5: Persistent Data Storage

As a marketing analyst, I want all submitted data to be saved so that I can generate reports at any time without re-submitting events.

**Acceptance Criteria:**

- All conversion events are stored in a local database.
- All touchpoints are stored in a local database.
- Attribution results are stored or can be recalculated from stored data.
- When the application restarts, all previously submitted data is available.

## Non-Functional Requirements

- **Data Accuracy**: All monetary calculations MUST use decimal precision (no floating-point). Attribution calculations MUST be deterministic and auditable.
- **Input Validation**: All API inputs MUST be validated before processing. Required fields, data types, and value ranges MUST be enforced.
- **Error Handling**: The API MUST return appropriate HTTP status codes and descriptive error messages for all failure scenarios.
- **Idempotency**: Duplicate event/touchpoint submissions (same ID) MUST be rejected cleanly, not cause data corruption.
- **Performance**: The system must handle up to 10,000 events and generate reports within 5 seconds.
