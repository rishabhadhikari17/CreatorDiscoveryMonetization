# GlobalGalli — Creator Discovery & Monetization

A polished, frontend-first marketplace for regional creator discovery, campaign collaboration, and monetization.

## Current implementation

Steps 1–13 from `steps.md` are implemented:

- Responsive landing page with Brand and Creator demo entry
- Brand dashboard, creator discovery, audience intelligence, and shortlisting
- Campaign briefs, offer creation, and a shared deal room
- Creator dashboard, offer review, negotiation, and acceptance flows
- Connected two-sided deal state persisted in the browser
- Campaign execution, deliverable status, and payment tracking
- Responsive navigation, reusable UI primitives, empty states, and demo polish

Most screens use realistic mock data and browser storage. Creator discovery can now use the Supabase `search_creators` RPC; it keeps the local creator dataset as a visible fallback when Supabase is not configured or the user has no authenticated session. Live social-platform data, AI integrations, and real payments remain deferred.

## Main routes

- `/` — Landing page and role selection
- `/onboarding` — Creator and Brand profile onboarding
- `/brand` — Brand dashboard
- `/brand/discover` — Creator discovery
- `/brand/shortlist` — Shortlist and campaign brief
- `/brand/campaigns` — Campaign execution
- `/brand/interests` — Creator interest inbox for posted campaigns
- `/brand/deals` — Deal room
- `/creator` — Creator dashboard
- `/creator/opportunities` — Open brand campaigns and interest sharing
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

To use live creator search, copy `.env.example` to `.env.local`, set the Supabase URL and publishable key, apply the migrations, and sign in with a Supabase user. Without that setup, `/brand/discover` remains fully usable with local demo data.

## Validate

```bash
npm run lint
npm run build
```
