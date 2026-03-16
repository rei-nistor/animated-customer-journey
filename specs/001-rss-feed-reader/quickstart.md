# Quickstart: Marketing Attribution Reporter MVP

**Feature**: `001-rss-feed-reader` | **Date**: 2026-03-16

## Prerequisites

- .NET 8.0 SDK (`dotnet --version` should show 8.x)
- On macOS with Homebrew: `export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"` and add to PATH

## Build & Run

```bash
# From the repository root
cd MarketingAttributionReporter

# Restore packages and build
dotnet build

# Apply EF Core migrations (creates the SQLite database)
dotnet ef database update --project AttributionReporter.Data --startup-project AttributionReporter.API

# Run the API
dotnet run --project AttributionReporter.API
```

The API will start on `http://localhost:5151`. Open `http://localhost:5151/swagger` for interactive API docs.

## Quick Test: End-to-End Attribution Flow

### 1. Add touchpoints

```bash
# Touchpoint 1: User clicks a paid search ad
curl -X POST http://localhost:5151/api/touchpoints \
  -H "Content-Type: application/json" \
  -d '{
    "touchpointId": "tp-001",
    "userSessionId": "user-1",
    "channelName": "paid-search",
    "campaignName": "spring-2026",
    "timestamp": "2026-03-10T09:00:00Z",
    "cost": 1.50
  }'

# Touchpoint 2: Same user clicks an email link (later)
curl -X POST http://localhost:5151/api/touchpoints \
  -H "Content-Type: application/json" \
  -d '{
    "touchpointId": "tp-002",
    "userSessionId": "user-1",
    "channelName": "email",
    "campaignName": "newsletter-march",
    "timestamp": "2026-03-12T14:00:00Z",
    "cost": 0.25
  }'

# Touchpoint 3: Same user visits via organic search (latest before conversion)
curl -X POST http://localhost:5151/api/touchpoints \
  -H "Content-Type: application/json" \
  -d '{
    "touchpointId": "tp-003",
    "userSessionId": "user-1",
    "channelName": "organic",
    "timestamp": "2026-03-14T11:00:00Z",
    "cost": 0
  }'
```

### 2. Add a conversion event

```bash
curl -X POST http://localhost:5151/api/conversion-events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "conv-001",
    "userSessionId": "user-1",
    "conversionValue": 150.00,
    "timestamp": "2026-03-15T10:00:00Z"
  }'
```

### 3. Run attribution

```bash
curl -X POST http://localhost:5151/api/attribution/run
```

Expected: `{ "processed": 1, "attributed": 1, "unattributed": 0, "model": "last-touch" }`

The conversion should be attributed to "organic" (the last touchpoint at March 14, before the conversion on March 15).

### 4. Generate ROI report

```bash
curl http://localhost:5151/api/reports/channel-roi
```

Expected: One channel entry for "organic" with $150 attributed revenue, $0 cost, ROI = N/A (zero cost).

## Project Structure

```
MarketingAttributionReporter/
├── AttributionReporter.API/      # REST API (controllers, DTOs, Program.cs)
├── AttributionReporter.Core/     # Domain models, interfaces, services
└── AttributionReporter.Data/     # EF Core DbContext, repositories, migrations
```

## Common Tasks

| Task | Command |
|------|---------|
| Build | `dotnet build` |
| Run API | `dotnet run --project AttributionReporter.API` |
| Add migration | `dotnet ef migrations add <Name> --project AttributionReporter.Data --startup-project AttributionReporter.API` |
| Apply migrations | `dotnet ef database update --project AttributionReporter.Data --startup-project AttributionReporter.API` |
| Reset database | Delete `attribution.db` and re-run migrations |
