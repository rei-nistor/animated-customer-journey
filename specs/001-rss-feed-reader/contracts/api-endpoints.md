# API Contracts: Marketing Attribution Reporter MVP

**Feature**: `001-rss-feed-reader` | **Date**: 2026-03-16  
**Base URL**: `http://localhost:5151`

---

## POST /api/conversion-events

**Description**: Ingest a conversion event.

**Request Body**:
```json
{
  "eventId": "conv-001",
  "userSessionId": "user-abc-session-1",
  "conversionValue": 99.99,
  "timestamp": "2026-03-15T14:30:00Z",
  "metadata": "optional free-form string"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 201 Created | Event ingested | `{ "id": 1, "eventId": "conv-001", "userSessionId": "user-abc-session-1", "conversionValue": 99.99, "timestamp": "2026-03-15T14:30:00Z", "metadata": "...", "createdAt": "2026-03-16T10:00:00Z" }` |
| 400 Bad Request | Validation failed | `{ "errors": { "conversionValue": ["Must be greater than 0"] } }` |
| 409 Conflict | Duplicate eventId | `{ "error": "A conversion event with eventId 'conv-001' already exists" }` |

---

## POST /api/touchpoints

**Description**: Ingest a marketing touchpoint.

**Request Body**:
```json
{
  "touchpointId": "tp-001",
  "userSessionId": "user-abc-session-1",
  "channelName": "paid-search",
  "campaignName": "spring-sale-2026",
  "timestamp": "2026-03-14T10:00:00Z",
  "cost": 2.50
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 201 Created | Touchpoint ingested | `{ "id": 1, "touchpointId": "tp-001", "userSessionId": "user-abc-session-1", "channelName": "paid-search", "campaignName": "spring-sale-2026", "timestamp": "2026-03-14T10:00:00Z", "cost": 2.50, "createdAt": "2026-03-16T10:00:00Z" }` |
| 400 Bad Request | Validation failed | `{ "errors": { "channelName": ["Channel name is required"] } }` |
| 409 Conflict | Duplicate touchpointId | `{ "error": "A touchpoint with touchpointId 'tp-001' already exists" }` |

---

## POST /api/attribution/run

**Description**: Run last-touch attribution on all un-attributed conversion events (or re-run on all).

**Request Body**: None (or optional `{ "rerun": true }` to recalculate all)

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 OK | Attribution complete | `{ "processed": 15, "attributed": 12, "unattributed": 3, "model": "last-touch" }` |

---

## GET /api/reports/channel-roi

**Description**: Generate a channel-level ROI summary report.

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| startDate | ISO 8601 | No | Filter conversions from this date |
| endDate | ISO 8601 | No | Filter conversions up to this date |

**Response (200 OK)**:
```json
{
  "generatedAt": "2026-03-16T10:05:00Z",
  "model": "last-touch",
  "channels": [
    {
      "channelName": "paid-search",
      "totalAttributedRevenue": 5000.00,
      "totalCost": 2000.00,
      "conversionCount": 50,
      "roiPercentage": 150.0
    },
    {
      "channelName": "email",
      "totalAttributedRevenue": 3000.00,
      "totalCost": 500.00,
      "conversionCount": 30,
      "roiPercentage": 500.0
    },
    {
      "channelName": "organic",
      "totalAttributedRevenue": 1500.00,
      "totalCost": 0.00,
      "conversionCount": 15,
      "roiPercentage": null
    },
    {
      "channelName": "Unattributed",
      "totalAttributedRevenue": 800.00,
      "totalCost": 0.00,
      "conversionCount": 8,
      "roiPercentage": null
    }
  ],
  "totals": {
    "totalRevenue": 10300.00,
    "totalCost": 2500.00,
    "totalConversions": 103,
    "overallRoi": 312.0
  }
}
```

**Notes**:
- `roiPercentage` is `null` (maps to "N/A") when `totalCost` is 0 to avoid division by zero.
- "Unattributed" is always included if any conversions have no matching touchpoints.
- All monetary values are decimals with 2 decimal places in JSON output.

---

## GET /api/conversion-events

**Description**: List all ingested conversion events (for debugging/verification).

**Response (200 OK)**: Array of conversion event objects.

---

## GET /api/touchpoints

**Description**: List all ingested touchpoints (for debugging/verification).

**Response (200 OK)**: Array of touchpoint objects.
