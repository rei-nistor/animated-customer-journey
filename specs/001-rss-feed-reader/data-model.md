# Data Model: Marketing Attribution Reporter MVP

**Feature**: `001-rss-feed-reader` | **Date**: 2026-03-16

## Entities

### ConversionEvent

Represents a completed business goal (purchase, sign-up, download).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| Id | int | PK, auto-increment | Internal database ID |
| EventId | string | Unique, required, max 256 | External ID provided by caller |
| UserSessionId | string | Required, max 256 | Links conversions to touchpoints |
| ConversionValue | decimal | Required, > 0 | Monetary value of the conversion |
| Timestamp | DateTimeOffset | Required, ISO 8601 | When the conversion occurred |
| Metadata | string | Optional, max 1024 | Free-form JSON for additional context |
| CreatedAt | DateTimeOffset | Auto-set | When the record was ingested |

**Indexes**: Unique on `EventId`; Index on `UserSessionId`; Index on `Timestamp`

### Touchpoint

Represents a marketing interaction (ad click, email open, organic visit).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| Id | int | PK, auto-increment | Internal database ID |
| TouchpointId | string | Unique, required, max 256 | External ID provided by caller |
| UserSessionId | string | Required, max 256 | Links touchpoints to conversions |
| ChannelName | string | Required, max 128 | Marketing channel (e.g., "paid-search", "email") |
| CampaignName | string | Optional, max 256 | Campaign identifier |
| Timestamp | DateTimeOffset | Required, ISO 8601 | When the interaction occurred |
| Cost | decimal | Optional, >= 0 | Cost of this touchpoint |
| CreatedAt | DateTimeOffset | Auto-set | When the record was ingested |

**Indexes**: Unique on `TouchpointId`; Index on `UserSessionId`; Index on `Timestamp`; Index on `ChannelName`

### AttributionResult

Links a conversion to its attributed touchpoint. One row per conversion.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| Id | int | PK, auto-increment | Internal database ID |
| ConversionEventId | int | FK → ConversionEvent.Id, required | The conversion being attributed |
| TouchpointId | int | FK → Touchpoint.Id, nullable | Null = unattributed |
| AttributedValue | decimal | Required | Amount credited (= ConversionValue for last-touch) |
| ChannelName | string | Required, max 128 | Denormalized for reporting speed ("Unattributed" if no touchpoint) |
| AttributionModel | string | Required, max 64 | "last-touch" for MVP |
| CalculatedAt | DateTimeOffset | Auto-set | When attribution was computed |

**Indexes**: Unique on `ConversionEventId` (one attribution per conversion); Index on `ChannelName`

## Relationships

```
ConversionEvent (1) ←──── (0..1) AttributionResult (0..1) ────→ (1) Touchpoint
       │                                                              │
       └──── UserSessionId ──────────────────────────────────────────┘
```

- A **ConversionEvent** has zero or one **AttributionResult** (zero before attribution runs, one after).
- An **AttributionResult** links to exactly one **ConversionEvent** and optionally one **Touchpoint** (null if unattributed).
- A **Touchpoint** can be referenced by zero or many **AttributionResults** (same touchpoint could be the last-touch for multiple conversions by the same user).
- **ConversionEvent** and **Touchpoint** are linked logically via `UserSessionId` (not a foreign key — they're independent ingestion streams).

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| ConversionEvent | EventId | Not null/empty, max 256 chars, unique |
| ConversionEvent | UserSessionId | Not null/empty, max 256 chars |
| ConversionEvent | ConversionValue | Must be > 0, decimal type |
| ConversionEvent | Timestamp | Must be valid ISO 8601 DateTimeOffset |
| Touchpoint | TouchpointId | Not null/empty, max 256 chars, unique |
| Touchpoint | UserSessionId | Not null/empty, max 256 chars |
| Touchpoint | ChannelName | Not null/empty, max 128 chars |
| Touchpoint | Cost | If provided, must be >= 0, decimal type |
| Touchpoint | Timestamp | Must be valid ISO 8601 DateTimeOffset |
