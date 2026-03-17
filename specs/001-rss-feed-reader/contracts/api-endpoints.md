# API Contracts: Animated Customer Journey MVP

**Feature**: `001-animated-customer-journey` | **Date**: 2026-03-16
**Base URL**: `http://localhost:5151`

---

## POST /api/conversion-events

**Description**: Ingest a conversion event.

**Request Body**:
```json
{
  "eventId": "conv-001",
  "userId": "user-abc",
  "conversionValue": "99.99",
  "timestamp": "2026-03-15T14:30:00Z",
  "metadata": "optional free-form string"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 201 Created | Event ingested | `{ "id": 1, "eventId": "conv-001", "userId": "user-abc", "conversionValue": "99.99", "timestamp": "2026-03-15T14:30:00Z", "metadata": "...", "createdAt": "2026-03-16T10:00:00Z" }` |
| 400 Bad Request | Validation failed | `{ "errors": [{ "path": "conversionValue", "message": "Must be a positive number" }] }` |
| 409 Conflict | Duplicate eventId | `{ "error": "A conversion event with eventId 'conv-001' already exists" }` |

---

## GET /api/conversion-events

**Description**: List all ingested conversion events.

**Response (200 OK)**: Array of conversion event objects.

---

## POST /api/touchpoints

**Description**: Ingest a marketing touchpoint.

**Request Body**:
```json
{
  "touchpointId": "tp-001",
  "userId": "user-abc",
  "channelName": "Paid Search",
  "campaignName": "spring-sale-2026",
  "timestamp": "2026-03-14T10:00:00Z",
  "cost": "2.50"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 201 Created | Touchpoint ingested | `{ "id": 1, "touchpointId": "tp-001", "userId": "user-abc", "channelName": "Paid Search", "campaignName": "spring-sale-2026", "timestamp": "2026-03-14T10:00:00Z", "cost": "2.50", "createdAt": "2026-03-16T10:00:00Z" }` |
| 400 Bad Request | Validation failed | `{ "errors": [{ "path": "channelName", "message": "Channel name is required" }] }` |
| 409 Conflict | Duplicate touchpointId | `{ "error": "A touchpoint with touchpointId 'tp-001' already exists" }` |

---

## GET /api/touchpoints

**Description**: List all ingested touchpoints.

**Response (200 OK)**: Array of touchpoint objects.

---

## POST /api/attribution/run

**Description**: Run attribution using the specified model. Creates attribution results for all conversion events.

**Request Body**:
```json
{
  "model": "last-touch",
  "rerun": false
}
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | Yes | One of: "last-touch", "first-touch", "linear" |
| rerun | boolean | No | If true, recalculate all (default: false, skip already-attributed) |

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 OK | Attribution complete | `{ "processed": 15, "attributed": 12, "unattributed": 3, "model": "last-touch" }` |
| 400 Bad Request | Invalid model | `{ "error": "Invalid model. Must be one of: last-touch, first-touch, linear" }` |

---

## GET /api/attribution/results

**Description**: Get attribution results, optionally filtered by model.

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | No | Filter by attribution model |

**Response (200 OK)**: Array of attribution result objects with conversion and touchpoint details.

---

## GET /api/reports/channel-roi

**Description**: Generate a channel-level ROI summary report.

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | No | Attribution model to use (default: "last-touch") |
| startDate | ISO 8601 | No | Filter conversions from this date |
| endDate | ISO 8601 | No | Filter conversions up to this date |

**Response (200 OK)**:
```json
{
  "generatedAt": "2026-03-16T10:05:00Z",
  "model": "last-touch",
  "channels": [
    {
      "channelName": "Paid Search",
      "totalAttributedRevenue": "5000.00",
      "totalCost": "2000.00",
      "conversionCount": 50,
      "roiPercentage": 150.0
    },
    {
      "channelName": "Email",
      "totalAttributedRevenue": "3000.00",
      "totalCost": "500.00",
      "conversionCount": 30,
      "roiPercentage": 500.0
    },
    {
      "channelName": "Unattributed",
      "totalAttributedRevenue": "800.00",
      "totalCost": "0.00",
      "conversionCount": 8,
      "roiPercentage": null
    }
  ],
  "totals": {
    "totalRevenue": "8800.00",
    "totalCost": "2500.00",
    "totalConversions": 88,
    "overallRoi": 252.0
  }
}
```

**Notes**:
- `roiPercentage` is `null` when `totalCost` is 0 (maps to "N/A" in UI).
- All monetary values are string-encoded decimals.
- "Unattributed" entry included if any conversions have no matching touchpoints.

---

## GET /api/journeys/sankey

**Description**: Get aggregated journey data formatted for Sankey diagram rendering.

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | No | Attribution model for credit weights (default: "last-touch") |

**Response (200 OK)**:
```json
{
  "model": "last-touch",
  "nodes": [
    { "id": "Social", "type": "channel", "totalFlow": 1500.0 },
    { "id": "Organic", "type": "channel", "totalFlow": 800.0 },
    { "id": "Email", "type": "channel", "totalFlow": 2200.0 },
    { "id": "Paid Search", "type": "channel", "totalFlow": 3000.0 },
    { "id": "Unknown / Direct", "type": "unattributed", "totalFlow": 400.0 },
    { "id": "Conversion", "type": "outcome", "totalFlow": 7900.0 }
  ],
  "links": [
    { "source": "Social", "target": "Organic", "value": 500.0 },
    { "source": "Social", "target": "Email", "value": 300.0 },
    { "source": "Organic", "target": "Email", "value": 600.0 },
    { "source": "Email", "target": "Conversion", "value": 2200.0 },
    { "source": "Paid Search", "target": "Conversion", "value": 3000.0 },
    { "source": "Unknown / Direct", "target": "Conversion", "value": 400.0 }
  ]
}
```

**Notes**:
- Nodes represent marketing channels plus a "Conversion" outcome node and optional "Unknown / Direct" for unattributed.
- Links represent aggregated flows between sequential touchpoints in user journeys.
- `value` on links represents total attributed revenue flowing through that edge (weighted by the selected model).
- Link thickness in the Sankey diagram is proportional to `value`.

---

## GET /api/journeys/paths/:userId

**Description**: Get the raw journey path for a specific user.

**Response (200 OK)**:
```json
{
  "userId": "user-abc",
  "journeys": [
    {
      "conversionEventId": 1,
      "conversionValue": "150.00",
      "conversionTimestamp": "2026-03-15T10:00:00Z",
      "touchpoints": [
        { "channelName": "Social", "timestamp": "2026-03-10T09:00:00Z" },
        { "channelName": "Organic", "timestamp": "2026-03-12T14:00:00Z" },
        { "channelName": "Email", "timestamp": "2026-03-14T11:00:00Z" }
      ]
    }
  ]
}
```

---

## GET /api/channels/:channelName/detail

**Description**: Get detailed metrics for a single channel under the selected attribution model.

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | No | Attribution model (default: "last-touch") |

**Response (200 OK)**:
```json
{
  "channelName": "Email",
  "model": "last-touch",
  "attributedConversions": 30,
  "attributedRevenue": "3000.00",
  "totalCost": "500.00",
  "roiPercentage": 500.0,
  "topPaths": [
    { "path": ["Social", "Organic", "Email"], "conversions": 12, "revenue": "1200.00" },
    { "path": ["Paid Search", "Email"], "conversions": 8, "revenue": "800.00" },
    { "path": ["Email"], "conversions": 5, "revenue": "500.00" }
  ]
}
```