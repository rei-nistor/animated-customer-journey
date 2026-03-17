# Animated Customer Journey — Project Goals

## Purpose

Contoso Corporation needs an **Animated Customer Journey Flow** tool that ingests conversion events, attributes them to marketing touchpoints using multiple models, and produces an **interactive Sankey / flow diagram** that animates conversion paths in real time. The marketing team currently has no intuitive way to visualize how customers move through marketing channels before converting — or to understand how different attribution models redistribute credit.

## Scope

The project scope covers the development of an MVP version of the Animated Customer Journey application. The MVP delivers a full-stack application with a TypeScript monorepo: an Express API for data ingestion and attribution, plus a React frontend with an animated D3.js Sankey diagram.

### MVP Scope

- Ingest conversion events and marketing touchpoint data via a REST API.
- Apply three attribution models: **last-touch**, **first-touch**, and **linear** (equal-weight).
- Generate a channel-level ROI summary report (filterable by model and date range).
- Display an **animated Sankey flow diagram** where each touchpoint path (Social Ad → Blog Post → Email → Purchase) lights up as a flowing "river" of conversions.
- **Thicker streams = more conversions** through that path.
- **Click any node** to drill down: "What happened to people who clicked a Facebook ad?"
- **Toggle between attribution models** (first-touch, last-touch, linear) and watch the credit **visually shift** between channels in real time.
- ROI summary cards update alongside the Sankey when the model changes.
- Persist all events, touchpoints, and attribution data in PostgreSQL.

### Out of Scope for MVP

- User authentication and authorization.
- Time-decay or position-based attribution models (future enhancement).
- Real-time streaming ingestion.
- Multi-tenant support.
- Data export to CSV or external BI tools.
- Campaign-level drill-down reports (channel-level only for MVP).
- Bulk import of historical data.
- Mobile-responsive layout (desktop-only for MVP).

## Delivery Approach

The project follows a spec-driven development (SDD) methodology using GitHub Spec Kit. Development is guided by specifications, plans, and tasks generated through the SDD workflow.

## Rollout Plan

### Phase 1: MVP (Current)

Deliver the full-stack animated customer journey application:

- TypeScript monorepo (npm workspaces + Turborepo).
- Express API with Zod validation for conversion events and touchpoints.
- Three attribution models (last-touch, first-touch, linear) via Strategy pattern.
- Channel-level ROI report endpoint with model and date range filters.
- Journey/Sankey data endpoint returning aggregated flow paths.
- React + Vite frontend with animated D3.js Sankey diagram.
- Attribution model toggle with smooth 500ms animated transitions.
- Node drill-down detail panel.
- ROI summary cards.
- PostgreSQL persistence via Drizzle ORM.

### Phase 2: Enhanced Models & Analytics (Future)

- Time-decay attribution model.
- Position-based (U-shaped) attribution model.
- Model comparison side-by-side view.
- Sparkline trends in drill-down panels.
- Seeded demo data generator.

### Phase 3: Advanced Visualization & Integration (Future)

- Animated path replay ("watch a single user's journey").
- Data export (CSV, JSON) for external BI tools.
- Webhook/event stream ingestion.
- Mobile-responsive layout.
- Multi-tenant support.
- Multi-tenant support.

## Quality Goals

- **Data Accuracy**: Attribution calculations MUST be deterministic and auditable. The same input data MUST always produce the same attribution results.
- **Reliability**: The API should handle malformed events gracefully without corrupting existing data.
- **Maintainability**: Code should follow clean architecture principles to support adding new attribution models without modifying existing ones.
- **Performance**: The system should handle ingestion of up to 10,000 events and generate reports within reasonable response times.

## Standards and Guidelines

- Follow C# coding conventions and .NET best practices.
- Use consistent naming conventions throughout the codebase.
- Implement proper error handling and logging.
- All monetary values MUST use decimal types to avoid floating-point precision errors.
- Attribution logic MUST be separated from data access and API concerns.
- Every attribution calculation MUST be traceable back to source events.
