# Data Model: Animated Customer Journey MVP

**Feature**: `001-animated-customer-journey` | **Date**: 2026-03-16

## Database Tables (Drizzle ORM → PostgreSQL)

### conversion_events

Represents a completed business goal (purchase, sign-up, download).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PK, auto-increment | Internal database ID |
| event_id | varchar(256) | Unique, NOT NULL | External ID provided by caller |
| user_id | varchar(256) | NOT NULL | Links conversions to touchpoints |
| conversion_value | decimal(12,2) | NOT NULL, > 0 | Monetary value of the conversion |
| timestamp | timestamp with time zone | NOT NULL | When the conversion occurred (ISO 8601) |
| metadata | text | NULL | Free-form JSON for additional context |
| created_at | timestamp with time zone | NOT NULL, DEFAULT now() | When ingested |

**Indexes**: Unique on `event_id`; Index on `user_id`; Index on `timestamp`

### touchpoints

Represents a marketing interaction (ad click, email open, organic visit).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PK, auto-increment | Internal database ID |
| touchpoint_id | varchar(256) | Unique, NOT NULL | External ID provided by caller |
| user_id | varchar(256) | NOT NULL | Links touchpoints to conversions |
| channel_name | varchar(128) | NOT NULL | Marketing channel (e.g., "Social", "Email", "Paid Search") |
| campaign_name | varchar(256) | NULL | Campaign identifier |
| timestamp | timestamp with time zone | NOT NULL | When the interaction occurred |
| cost | decimal(12,2) | NULL, >= 0 | Cost of this touchpoint |
| created_at | timestamp with time zone | NOT NULL, DEFAULT now() | When ingested |

**Indexes**: Unique on `touchpoint_id`; Index on `user_id`; Index on `timestamp`; Index on `channel_name`

### attribution_results

Links a conversion to its attributed touchpoint(s). Multiple rows per conversion for linear attribution (one per touchpoint with fractional credit weight).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PK, auto-increment | Internal database ID |
| conversion_event_id | integer | FK → conversion_events.id, NOT NULL | The conversion being attributed |
| touchpoint_id | integer | FK → touchpoints.id, NULL | NULL = unattributed |
| attribution_model | varchar(64) | NOT NULL | "last-touch", "first-touch", or "linear" |
| credit_weight | decimal(5,4) | NOT NULL | 0.0000–1.0000 (fraction of credit for this touchpoint) |
| attributed_value | decimal(12,2) | NOT NULL | conversion_value × credit_weight |
| channel_name | varchar(128) | NOT NULL | Denormalized for report/Sankey speed |
| calculated_at | timestamp with time zone | NOT NULL, DEFAULT now() | When attribution was computed |

**Indexes**: Index on `(conversion_event_id, attribution_model)` (composite); Index on `attribution_model`; Index on `channel_name`

## Relationships

```
ConversionEvent (1) ←──── (0..*) AttributionResult (0..1) ────→ (1) Touchpoint
       │                                                              │
       └──── user_id ────────────────────────────────────────────────┘
```

- A **ConversionEvent** has zero or many **AttributionResults** (zero before attribution runs; one for last-touch/first-touch; N for linear where N = number of touchpoints).
- An **AttributionResult** links to exactly one **ConversionEvent** and optionally one **Touchpoint** (null if unattributed).
- A **Touchpoint** can be referenced by many **AttributionResults** (same touchpoint may be the credited touchpoint for multiple conversions).
- **ConversionEvent** and **Touchpoint** are linked logically via `user_id` (not a foreign key — they're independent ingestion streams).

## Derived Data (computed by services, returned via API)

| Concept | Purpose |
|---------|---------|
| JourneyPath | Ordered sequence of touchpoints for a single user leading to a conversion |
| JourneyNode | Aggregated channel node in the Sankey diagram with total flow volume |
| JourneyLink | Connection between two sequential channel nodes with flow weight |
| ChannelReport | Aggregated channel-level metrics: attributed conversions, revenue, spend, ROI |

## Key Differences from Previous Data Model

| Aspect | Old (.NET/SQLite) | New (TypeScript/PostgreSQL) |
|--------|-------------------|---------------------------|
| Cardinality | One AttributionResult per conversion | Multiple per conversion (for linear model: one per credited touchpoint) |
| Credit field | `AttributedValue` only | `credit_weight` (0.0–1.0) + `attributed_value` (computed) |
| Model column | Single "last-touch" | "last-touch", "first-touch", or "linear" |
| Decimal handling | C# `decimal` with TEXT column (SQLite) | PostgreSQL `NUMERIC(12,2)` with string representation in TypeScript |
| Index strategy | Unique on conversion_event_id | Composite index on (conversion_event_id, attribution_model) — allows results for multiple models to coexist |

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| ConversionEvent | event_id | Not null/empty, max 256 chars, unique |
| ConversionEvent | user_id | Not null/empty, max 256 chars |
| ConversionEvent | conversion_value | Must be > 0, decimal type |
| ConversionEvent | timestamp | Must be valid ISO 8601 |
| Touchpoint | touchpoint_id | Not null/empty, max 256 chars, unique |
| Touchpoint | user_id | Not null/empty, max 256 chars |
| Touchpoint | channel_name | Not null/empty, max 128 chars |
| Touchpoint | cost | If provided, must be >= 0, decimal type |
| Touchpoint | timestamp | Must be valid ISO 8601 |
| AttributionResult | credit_weight | Must be > 0 and <= 1.0 |
| AttributionResult | attribution_model | Must be one of: "last-touch", "first-touch", "linear" |