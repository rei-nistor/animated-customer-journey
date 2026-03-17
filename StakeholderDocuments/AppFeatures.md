# Animated Customer Journey — Application Features

## Overview

The Animated Customer Journey application ingests conversion events and marketing touchpoints via API, attributes conversions using multiple models (last-touch, first-touch, linear), generates channel-level ROI reports, and displays an **interactive animated Sankey flow diagram** that visualizes customer journey patterns. Users can toggle attribution models and watch credit redistribute in real time. Think of it like a "money flow" visualization — you literally see where the credit goes.

## Feature 1: Conversion Event Ingestion

Marketing analysts submit conversion events (purchases, sign-ups, downloads) via a REST API. Each event includes a conversion value, timestamp, and user identifier that links it to marketing touchpoints. The API validates all inputs (positive decimal values, ISO 8601 timestamps, non-empty IDs) and rejects duplicates with 409 Conflict.

## Feature 2: Touchpoint Data Ingestion

Marketing analysts submit touchpoint data (ad clicks, email opens, organic visits) via a REST API. Touchpoints include a channel name, optional campaign name, timestamp, and optional cost. Validation ensures required fields are present and costs are non-negative. Duplicates are rejected.

## Feature 3: Multi-Model Attribution

The system attributes conversions using three models:
- **Last-touch**: 100% credit to the final touchpoint before conversion.
- **First-touch**: 100% credit to the first touchpoint in the journey.
- **Linear**: Equal credit split (1/N) across all touchpoints, with rounding correction on the last.
Conversions with no touchpoints are marked "unattributed." Attribution is deterministic with alphabetical tie-breaking for simultaneous timestamps.

## Feature 4: Channel-Level ROI Report

A report endpoint returns channel-level summary: channel name, total attributed revenue, total cost, conversion count, ROI percentage. ROI = ((revenue - cost) / cost) x 100; "N/A" for zero-cost channels. Filterable by attribution model and optional date range. Unattributed conversions appear separately.

## Feature 5: Animated Sankey Flow Diagram (Centerpiece)

An interactive Sankey / flow diagram animates conversion paths in real time. Each touchpoint path (Social Ad → Blog Post → Email → Purchase) lights up as a flowing "river" of conversions. Thicker streams = more conversions through that path. Links display flowing particle animations. Single-touchpoint journeys, unattributed ("Unknown / Direct"), and long journeys (>20 touchpoints collapsed into summary nodes) are all handled.

## Feature 6: Attribution Model Toggle with Animated Transitions

A segmented control lets users switch between last-touch, first-touch, and linear models. When toggled, the Sankey diagram animates smoothly (within 500ms) to show credit redistributing between channels. ROI summary cards update simultaneously. Rapid toggles interrupt cleanly.

## Feature 7: Channel Drill-Down

Click any node in the Sankey diagram to open a slide-out detail panel showing: channel name, attributed conversions, revenue, cost, ROI, and top 5 conversion paths flowing through that channel. The panel updates when models change or different nodes are selected.

## Feature 8: Data Persistence

All conversion events, touchpoints, and attribution results are stored in PostgreSQL via Drizzle ORM. Data survives application restarts.

## Non-Functional Requirements

- **Data Accuracy**: All monetary values use string-encoded decimals (Drizzle `decimal` type). Attribution is deterministic.
- **Input Validation**: All API inputs validated with Zod schemas.
- **Performance**: Reports within 3s for 10,000 events. Sankey renders within 1s for 5,000 paths. Model toggle animates within 500ms.
- **Error Handling**: Appropriate HTTP status codes and descriptive error messages.
