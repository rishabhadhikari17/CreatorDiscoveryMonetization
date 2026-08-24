# Vaani backend schema

Postgres schema for the creator discovery and monetization platform, derived from the
data modules under `src/features/**/data`.

## Running it

```bash
supabase init      # creates config.toml; leaves migrations/ and seed.sql alone
supabase start
supabase db reset  # applies every migration in order, then runs seed.sql
```

`supabase db reset` needs Docker. Against a hosted project use `supabase db push`
— but **do not** run `seed.sql` there: it inserts demo accounts into `auth.users`
with a known password.

Demo logins after seeding: `brand@vaani.test` and `priya@vaani.test`, password
`demo-password`.

## Migrations

| File | Contents |
| --- | --- |
| `20260814090000_reference.sql` | Enums, lookup tables, `fit_weights`, shared helpers |
| `20260814090100_identity_creators.sql` | `profiles`, `creators`, language/platform junctions, score components, audience breakdown |
| `20260814090200_brands_campaigns.sql` | `brands`, `campaigns`, deliverables, shortlist |
| `20260814090300_deals.sql` | `deals` and terms, plus the negotiation state machine |
| `20260814090400_execution.sql` | `collaborations`, contracts, submissions, payments, performance, activity timeline |
| `20260814090500_pricing_fit.sql` | `fair_band()`, `suggested_counter()`, `campaign_fit()` |
| `20260814090600_rls.sql` | Row level security across every table |
| `20260814090700_views.sql` | Read models for the discovery grid and both dashboards |

## Decisions worth knowing

**Money is whole rupees in `integer`.** The fair-band and cost-estimate maths round to
the nearest ₹500, which only stays correct if the unit never varies. No `numeric`, no
paise, no mixing.

**Pricing and fit live in Postgres, not the client.** `fair_band()` and
`campaign_fit()` are ports of `dealPricing.js` and `campaignMatching.js`. The product
promises brand and creator see the same number; two implementations of one formula
drift, so the frontend should call these rather than keep its own copy. The JS versions
should be deleted once the app reads from the API.

**Fair bands on a deal are snapshots.** `deals.fair_min` / `fair_max` are stored at
compose time. Recomputing them on read would move the goalposts mid-negotiation.

**State machines are enforced in the database.** `deal_transitions` and
`collaboration_transitions` hold the same graphs the frontend reducer uses, and
triggers reject anything else. PostgREST exposes these tables directly, so the client
cannot be the only guard.

**Column-level write rules are triggers, not policies.** RLS can say who may update a
row but not which columns. `enforce_deal_actor_scope` stops a creator rewriting the
amount or terms while accepting; `enforce_collaboration_actor_scope` keeps each side to
its half of the execution flow. Both no-op for the service role.

**Payments are read-only over the API.** `payments` and `performance_metrics` have
select policies and no write policies at all — escrow and release move through the
service role only.

**Briefs and shortlists are brand-private.** Creators read campaign context from the
denormalised fields on their own deal row. They cannot enumerate the shortlist or see
the campaign's total budget.

**Views are `security_invoker`.** Without it a view runs as its owner and becomes a
hole straight through the policies.

## Not modelled

Notifications, saved searches, and messaging have no frontend surface yet.
`improvementSuggestions` in `creatorDashboardData.js` is presentation copy, not data.
