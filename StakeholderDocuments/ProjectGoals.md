# Contoso Marketing Attribution Reporter - Project Goals

## Purpose

Contoso Corporation needs a Marketing Attribution Reporter tool that ingests conversion events, attributes them to marketing touchpoints, and produces channel-level ROI reports. The marketing team currently has no systematic way to determine which channels are driving conversions and what their return on investment is.

## Scope

The project scope covers the development of an initial MVP (Minimum Viable Product) version of the Marketing Attribution Reporter. The MVP focuses on the core data pipeline: ingest conversion events via API, apply last-touch attribution, and generate a channel-level ROI summary.

### MVP Scope

- Ingest conversion events via a REST API (each event includes a conversion value, timestamp, and associated marketing touchpoints).
- Ingest marketing touchpoint data (channel, campaign, timestamp, user/session identifier).
- Apply last-touch attribution model to assign conversion credit to the final touchpoint before conversion.
- Generate a channel-level ROI summary report showing total spend, total attributed revenue, and ROI per channel.
- Persist all events and attribution data locally.

### Out of Scope for MVP

- User authentication and authorization.
- First-touch and linear attribution models (future phases).
- Real-time streaming ingestion (batch API only for MVP).
- Dashboard UI with charts and visualizations.
- Multi-tenant support.
- Data export to external BI tools.
- Campaign-level drill-down reports.

## Delivery Approach

The project follows a spec-driven development (SDD) methodology using GitHub Spec Kit. Development is guided by specifications, plans, and tasks generated through the SDD workflow.

## Rollout Plan

### Phase 1: MVP (Current)

Deliver the core event ingestion, last-touch attribution, and channel-level ROI reporting. The MVP includes:

- Conversion event ingestion API.
- Touchpoint data ingestion API.
- Last-touch attribution engine.
- Channel-level ROI summary report endpoint.
- Local data persistence (SQLite).
- Basic input validation and error handling.

### Phase 2: Enhanced Attribution Models (Future)

After MVP sign-off, additional attribution models will be added:

- First-touch attribution model.
- Linear (equal-weight) attribution model.
- Time-decay attribution model.
- Model comparison reports.

### Phase 3: Advanced Reporting & Integration (Future)

- Campaign-level drill-down reports.
- Dashboard UI with charts and visualizations.
- Data export (CSV, JSON) for external BI tools.
- Webhook/event stream ingestion.
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
