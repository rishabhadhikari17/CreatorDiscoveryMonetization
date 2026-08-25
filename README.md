# Creator Discovery & Monetization

A polished, frontend-first marketplace for regional creator discovery, campaign collaboration, and monetization. GlobalGalli and Vistaar are working names for the same product.

## Current implementation

Steps 1–13 from `steps.md` are implemented:

- Responsive landing page with Brand and Creator demo entry
- Brand dashboard, creator discovery, audience intelligence, and shortlisting
- Campaign briefs, offer creation, and a shared deal room
- Creator dashboard, offer review, negotiation, and acceptance flows
- Connected two-sided deal state persisted in the browser
- Campaign execution, deliverable status, and payment tracking
- Responsive navigation, reusable UI primitives, empty states, and demo polish

This phase uses realistic mock data and browser storage. Authentication, backend services, live social-platform data, AI integrations, and real payments are intentionally deferred.

## Main routes

- `/` — Landing page and role selection
- `/brand` — Brand dashboard
- `/brand/discover` — Creator discovery
- `/brand/shortlist` — Shortlist and campaign brief
- `/brand/campaigns` — Campaign execution
- `/brand/deals` — Deal room
- `/creator` — Creator dashboard
- `/creator/offers` — Creator offer workflow
- `/creator/collaborations` — Deliverables and payment tracking
- `/design-system` — Shared UI foundation

## Source structure

```text
src/
  app/                       Application routing and providers
  components/                Shared UI, navigation, and demo components
  features/                  Product features grouped by workflow
  styles/                    Design tokens, reset, and global styles
  main.jsx                   React browser entry point
```

## Run locally

```bash
npm install
npm run dev
```

## Validate

```bash
npm run lint
npm run build
```
