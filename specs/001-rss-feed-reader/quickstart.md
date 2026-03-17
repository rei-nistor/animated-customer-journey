# Quickstart: Animated Customer Journey MVP

**Feature**: `001-animated-customer-journey` | **Date**: 2026-03-16

## Prerequisites

- Node.js 20 LTS (`node --version` should show 20.x)
- npm 10+ (`npm --version`)
- PostgreSQL 16+ running locally (or via Docker)
- A database created: `createdb animated_customer_journey`

## Setup

```bash
# From the repository root
cd animated-customer-journey

# Install all dependencies
npm install

# Create .env file for the API
cat > apps/api/.env << 'EOF'
DATABASE_URL=postgresql://localhost:5432/animated_customer_journey
PORT=5151
EOF

# Run Drizzle migrations
npx drizzle-kit push --config=packages/database/drizzle.config.ts

# Build all packages
npx turbo build
```

## Run

```bash
# Start the API (dev mode with hot reload)
npm run dev --workspace=apps/api

# In a separate terminal, start the frontend (dev mode)
npm run dev --workspace=apps/web
```

- API: `http://localhost:5151`
- Frontend: `http://localhost:5173`

## Quick Test: End-to-End Attribution Flow

### 1. Add touchpoints

```bash
# Touchpoint 1: User clicks a social ad
curl -X POST http://localhost:5151/api/touchpoints \
  -H "Content-Type: application/json" \
  -d '{
    "touchpointId": "tp-001",
    "userId": "user-1",
    "channelName": "Social",
    "campaignName": "spring-campaign",
    "timestamp": "2026-03-10T09:00:00Z",
    "cost": "1.50"
  }'

# Touchpoint 2: Same user reads a blog post
curl -X POST http://localhost:5151/api/touchpoints \
  -H "Content-Type: application/json" \
  -d '{
    "touchpointId": "tp-002",
    "userId": "user-1",
    "channelName": "Organic",
    "campaignName": "blog-seo",
    "timestamp": "2026-03-12T14:00:00Z",
    "cost": "0"
  }'

# Touchpoint 3: Same user clicks an email link (latest before conversion)
curl -X POST http://localhost:5151/api/touchpoints \
  -H "Content-Type: application/json" \
  -d '{
    "touchpointId": "tp-003",
    "userId": "user-1",
    "channelName": "Email",
    "campaignName": "newsletter-march",
    "timestamp": "2026-03-14T11:00:00Z",
    "cost": "0.25"
  }'
```

### 2. Add a conversion event

```bash
curl -X POST http://localhost:5151/api/conversion-events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "conv-001",
    "userId": "user-1",
    "conversionValue": "150.00",
    "timestamp": "2026-03-15T10:00:00Z"
  }'
```

### 3. Run attribution (all three models)

```bash
# Last-touch: 100% to Email
curl -X POST http://localhost:5151/api/attribution/run \
  -H "Content-Type: application/json" \
  -d '{"model": "last-touch"}'

# First-touch: 100% to Social
curl -X POST http://localhost:5151/api/attribution/run \
  -H "Content-Type: application/json" \
  -d '{"model": "first-touch"}'

# Linear: 33.33% each to Social, Organic, Email
curl -X POST http://localhost:5151/api/attribution/run \
  -H "Content-Type: application/json" \
  -d '{"model": "linear"}'
```

### 4. View ROI report (by model)

```bash
# Last-touch report
curl http://localhost:5151/api/reports/channel-roi?model=last-touch

# Linear report — credit spread across channels
curl http://localhost:5151/api/reports/channel-roi?model=linear
```

### 5. Get Sankey data (for visualization)

```bash
curl http://localhost:5151/api/journeys/sankey?model=last-touch
```

### 6. Open the frontend

Open `http://localhost:5173` in a browser. You should see:
- An animated Sankey flow diagram showing the journey: Social → Organic → Email → Conversion
- A model selector (Last Touch / First Touch / Linear)
- ROI summary cards
- Click any channel node to drill down

Toggle between models and watch the credit flow animate!

## Project Structure

```
animated-customer-journey/
├── apps/
│   ├── api/                 # Express REST API (routes, validation, middleware)
│   └── web/                 # React + Vite frontend (Sankey, toggle, drill-down)
├── packages/
│   ├── attribution/         # Pure TypeScript domain logic (strategies, services)
│   ├── database/            # Drizzle ORM schema + PostgreSQL connection
│   └── logger/              # Structured JSON logger
├── package.json             # Root workspace config
├── turbo.json               # Turborepo task orchestration
└── biome.json               # Linting & formatting
```

## Common Tasks

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Build all | `npx turbo build` |
| Dev API | `npm run dev --workspace=apps/api` |
| Dev Frontend | `npm run dev --workspace=apps/web` |
| Test all | `npx turbo test` |
| Lint/format | `npx turbo lint` |
| Push migrations | `npx drizzle-kit push --config=packages/database/drizzle.config.ts` |
| Reset database | `dropdb animated_customer_journey && createdb animated_customer_journey && npx drizzle-kit push` |