# Animated Customer Journey

An interactive **Sankey / flow diagram** that animates conversion paths in real time, showing how customers move through marketing channels before converting.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)
![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green)
![React](https://img.shields.io/badge/React-19-61dafb)
![D3.js](https://img.shields.io/badge/D3.js-Sankey-orange)

## What It Does

- Each touchpoint path (Social Ad → Blog Post → Email → Purchase) **lights up as a flowing "river"** of conversions
- **Thicker streams** = more conversions through that path
- **Click any node** to drill down: *"What happened to people who clicked a Facebook ad?"*
- **Toggle between attribution models** (first-touch, last-touch, linear) and watch the credit **visually shift** between channels in real time
- Think of it like a **"money flow" visualization** — you literally see where the credit goes

## Why It's Fun

People can see how changing the attribution model redistributes credit. It makes an abstract concept tangible.

## Architecture

TypeScript monorepo with full-stack type safety:

```
animated-customer-journey/
├── apps/
│   ├── api/                 # Express REST API (port 5151)
│   └── web/                 # React + Vite frontend (port 5173)
├── packages/
│   ├── attribution/         # Pure domain logic (strategy pattern)
│   ├── database/            # Drizzle ORM + PostgreSQL
│   └── logger/              # Structured JSON logger
```

| Layer | Tech |
|-------|------|
| **Frontend** | React 19, Vite, D3.js (d3-sankey), TanStack Query, Zustand |
| **API** | Express.js, Zod validation |
| **Database** | PostgreSQL, Drizzle ORM |
| **Tooling** | Turborepo, Biome, Vitest |

## Attribution Models

| Model | How It Works |
|-------|-------------|
| **Last Touch** | 100% credit to the final touchpoint before conversion |
| **First Touch** | 100% credit to the first touchpoint in the journey |
| **Linear** | Equal credit split across all touchpoints (1/N each) |

Toggle between them and watch the Sankey diagram animate — link thicknesses and node sizes smoothly transition to show the new credit distribution.

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

### Setup

```bash
cd animated-customer-journey
npm install

# Create database
createdb animated_customer_journey

# Configure
echo 'DATABASE_URL=postgresql://localhost:5432/animated_customer_journey' > apps/api/.env

# Push schema
npx drizzle-kit push --config=packages/database/drizzle.config.ts

# Start API + frontend
npm run dev --workspace=apps/api   # Terminal 1
npm run dev --workspace=apps/web   # Terminal 2
```

### Test the Pipeline

```bash
# Add touchpoints
curl -X POST http://localhost:5151/api/touchpoints \
  -H "Content-Type: application/json" \
  -d '{"touchpointId":"tp-1","userId":"user-1","channelName":"Social","timestamp":"2026-03-10T09:00:00Z","cost":"1.50"}'

curl -X POST http://localhost:5151/api/touchpoints \
  -H "Content-Type: application/json" \
  -d '{"touchpointId":"tp-2","userId":"user-1","channelName":"Email","timestamp":"2026-03-12T14:00:00Z","cost":"0.25"}'

# Add conversion
curl -X POST http://localhost:5151/api/conversion-events \
  -H "Content-Type: application/json" \
  -d '{"eventId":"conv-1","userId":"user-1","conversionValue":"150.00","timestamp":"2026-03-15T10:00:00Z"}'

# Run attribution
curl -X POST http://localhost:5151/api/attribution/run \
  -H "Content-Type: application/json" -d '{"model":"last-touch"}'

# View report
curl http://localhost:5151/api/reports/channel-roi?model=last-touch
```

Open `http://localhost:5173` to see the animated Sankey diagram.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/conversion-events` | Ingest a conversion event |
| GET | `/api/conversion-events` | List conversion events |
| POST | `/api/touchpoints` | Ingest a marketing touchpoint |
| GET | `/api/touchpoints` | List touchpoints |
| POST | `/api/attribution/run` | Run attribution (model: last-touch, first-touch, linear) |
| GET | `/api/reports/channel-roi` | Channel-level ROI report |
| GET | `/api/journeys/sankey` | Sankey diagram data |
| GET | `/api/channels/:name/detail` | Channel drill-down metrics |

## Development

```bash
npx turbo build      # Build all packages
npx turbo test       # Run all tests
npx turbo lint       # Lint everything
```

## Spec-Driven Development

This project uses [GitHub Spec Kit](https://github.com/github/spec-kit) for specification-driven development. All design artifacts live in `specs/`:

- **spec.md** — Feature specification with user stories and acceptance scenarios
- **plan.md** — Technical implementation plan
- **tasks.md** — Actionable task breakdown (74 tasks across 7 phases)
- **data-model.md** — Database schema definitions
- **contracts/** — API endpoint contracts
- **research.md** — Technology decisions

## License

Private project.
