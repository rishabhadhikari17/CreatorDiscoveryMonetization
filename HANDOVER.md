# Vaani Creator Platform — Engineering Handover

A creator discovery and monetization marketplace for Indian regional creators.

The React prototype is complete and runs on hard-coded fixtures. The Postgres
backend is deployed and seeded. **They are not connected to each other yet** —
connecting them is the work.

| | |
|---|---|
| Tables | 31 |
| Migrations | 8 |
| Seeded rows | 973 |
| RLS policies | 49 |
| Views | 5 |
| Postgres | 17 (Supabase, ap-south-1) |

**Coverage:** 21 creators across 13 states, 16 languages and 11 platforms. 10 deals
spanning all 7 deal statuses; 12 collaborations spanning all 6 collaboration statuses.

---

## 1. Where it stands

| Piece | State | Notes |
|---|---|---|
| React frontend | Complete | All screens built for both roles. Data from JS fixtures; deal state persists to LocalStorage. |
| Postgres schema | Deployed | 31 tables live, all 8 migrations applied and recorded. |
| Seed data | Loaded | Every table has rows. All six collaboration statuses represented. |
| RLS | Verified | 36 assertions run against the live database, all passing. |
| Frontend → API | **Not started** | No Supabase client installed. No component reads from the database. |
| Auth | **Not started** | Demo accounts exist in `auth.users`; the app has a role switcher, not a login. |

> **Nothing is committed to git.** The entire `supabase/` directory is untracked.
> Agree on branching before committing, and check `git status` before assuming a
> file is shared.

---

## 2. Get it running

**Frontend** — works standalone with zero backend. Fastest way to see the product.

```bash
npm install
npm run dev          # Vite, default port 5173
```

**Supabase CLI** — no global install needed.

```bash
npx supabase --version   # 2.114.0 known good
```

**A local database** (optional, needs Docker). Preferred for schema work: throwaway
database, seed runs automatically. `db reset` is local-only — never point it at cloud.

```bash
npx supabase start
npx supabase db reset
```

**Or the shared cloud project.** Generate your own token at Account → Access Tokens;
don't reuse anyone else's, they're account-wide. `db push` does *not* run the seed.

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
npx supabase link --project-ref msgtkufrqoijuezterkt
npx supabase db push
```

---

## 3. Repo map

| Path | Contents |
|---|---|
| `src/features/` | One folder per screen. Each owns its JSX, CSS, and a `data/` folder of fixtures. |
| `src/features/deal-state/` | Negotiation reducer + LocalStorage persistence. Closest thing to app state. |
| `src/components/ui/` | Button, Card, Badge, Field, ColorSwatch. Small and unopinionated. |
| `src/styles/tokens.css` | The design system. Colors, type, spacing, radii. Use these, don't hard-code. |
| `supabase/migrations/` | 8 files, applied in filename order. Never edit an applied one — add a new file. |
| `supabase/seed.sql` | 1,236 lines. Reference data, 21 creators, 9 brands, 6 campaigns, 10 deals, 12 collaborations. Idempotent where it matters — the generated blocks use `not exists` guards. |
| `supabase/README.md` | Schema decisions in more depth. |

---

## 4. What the database enforces

More than you'd expect. The client is not the only guard, because PostgREST exposes
these tables directly.

- **State machines.** `deal_transitions` and `collaboration_transitions` hold the legal
  moves; triggers reject anything else. `accepted` is terminal for a deal.
- **Column-level write rules.** RLS says *who* may update a row but not *which columns*,
  so triggers cover the rest: a creator may accept, counter or decline an offer but
  cannot rewrite its amount or terms; only a brand may rate; the agreed amount is fixed
  once signed.
- **Payments are read-only over the API.** Select policies, no write policies at all.
  Escrow and release move through the service role only.
- **Weights must total 100.** Deferred constraint triggers on `fit_weights` and
  `creator_score_components` — insert a full set in one statement.
- **Briefs and shortlists are brand-private.** A creator reads campaign context from
  denormalised fields on their own deal row; they cannot enumerate the shortlist or see
  the total budget.

---

## 5. Traps

### The pricing formula exists twice

Fair-rate bands and campaign fit are implemented in **both** JavaScript
(`dealPricing.js`, `campaignMatching.js`, `counterOfferRules.js`) and Postgres
(`fair_band()`, `campaign_fit()`, `suggested_counter()`). They currently agree exactly —
that was verified value by value.

They will not stay in agreement. The product's core promise is that brand and creator
see the same number, so **Postgres is the authority** and the JS copies should be deleted
as each screen moves to the API. Don't add a third implementation.

### Money is whole rupees in `integer`

Not paise, not `numeric`, never float. The fair-band maths rounds to the nearest ₹500 and
only stays correct if the unit never varies.

### Shortlist scores are snapshots and can go stale

`campaign_shortlist` stores `fit_score`, `fit_factors` and `estimated_cost` as of when the
creator was shortlisted — deliberately, so a brand's committed budget doesn't move on its
own. But nothing tells you when a snapshot and live `campaign_fit()` have diverged, and
reference-data edits cause exactly that. Detection query:

```sql
with team as (select campaign_id, count(*) n from campaign_shortlist group by campaign_id)
select cs.campaign_id, cs.creator_id, cs.fit_score,
       (campaign_fit(cs.creator_id, cs.campaign_id, t.n::int)->>'score')::int as live
from campaign_shortlist cs join team t on t.campaign_id = cs.campaign_id
where cs.fit_score <> (campaign_fit(cs.creator_id, cs.campaign_id, t.n::int)->>'score')::int;
```

### The database and the JS fixtures disagree about audience region

`creatorProfiles.js` builds each creator's region chart from a **state-keyed template**,
so every creator in a state gets an identical mix. That produces a visible contradiction:
Neha Jha's district is Patna, but the JS chart leads with Muzaffarpur while her score
evidence reads "led by Patna". Vivek Yadav, Ananya Deshmukh, Divya Joshi, Gurpreet Singh
and Meera Selvam have the same problem.

**The database no longer does this.** `creator_audience_breakdown` is now generated from
each creator's own district, so all 21 charts agree with their locality evidence. Until
the profile screen reads from the API, the app will still show the old contradiction
locally — the divergence is temporary and in the right direction, but it means the UI and
the data genuinely differ while you're testing.

Gender is still keyed by niche and age is identical for everyone. Those are templated but
not self-contradictory, so they were left alone.

### The Supabase dashboard bypasses RLS

The Table Editor connects as a privileged role and shows every row. That is *not* evidence
your policies work. To see what a real user sees:

```sql
select set_config('request.jwt.claims',
  '{"sub":"<profile-uuid>","role":"authenticated"}', true),
  set_config('role','authenticated', true);
select * from deals;   -- now filtered by RLS
```

---

## 6. Data model

Four domains. The flow runs left to right: a brand discovers creators, shortlists them
into a brief, sends an offer, and an accepted offer becomes a collaboration that gets
delivered and paid.

**Legend:** `PK` primary key · `FK` foreign key · *italic type* = nullable ·
money is whole rupees in `integer`.

### 6.1 Reference and configuration

Lookup values the frontend used to hard-code. Two of these are not really data: changing
`usage_rights.multiplier` or `fit_weights.weight` changes every price and fit score the
platform computes.

#### `languages` — 16 rows
The regional languages creators publish in, plus the cohort each is benchmarked against. 14 of the 16 are somebody's primary language; Hindi and English appear only as secondary.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `slug` | text | Stable machine name, e.g. `bhojpuri`. Lets the seed join without knowing UUIDs. |
| `name` | text | Display name shown in filters and profiles. |
| `script_char` | text | A single glyph in the language's script, used as a decorative mark on avatars. |
| `cohort_size` | integer | Benchmarked creators in this cohort; powers "benchmarked against 34 Bhojpuri creators". |

#### `states` — 13 rows
Every market the platform operates in. All 13 now have at least one creator.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `slug` | text | Machine name, e.g. `tamil-nadu`. |
| `name` | text | Display name. |

#### `districts` — 53 rows
Districts within each state — the granularity at which local audience concentration is measured.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `state_id` `FK` | uuid → states | Parent state. |
| `slug` | text | Machine name, e.g. `muzaffarpur`. |
| `name` | text | Display name. Unique per state. |

#### `niches` — 7 rows
Content categories: Food & Culture, Home & Living, Beauty, Lifestyle, Travel, Agriculture, Fitness.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `slug` | text | Machine name, e.g. `food-culture`. |
| `name` | text | Display name. |

#### `niche_relations` — 20 rows
Which creator niches a campaign in a given niche will still accept. Drives the relevance
factor: exact match 100, related niche 70, anything else 42.

| Column | Type | Stores |
|---|---|---|
| `niche_id` `PK` `FK` | uuid → niches | The **campaign's** niche — the side doing the accepting. |
| `related_niche_id` `PK` `FK` | uuid → niches | The **creator's** niche accepted as adjacent. |

> **Directional and deliberately asymmetric.** Three edges exist one way only: Travel
> accepts Food creators, Agriculture accepts Home & Living, and Food accepts Lifestyle —
> none of the reverses hold. Adding a reciprocal row changes shortlist rankings.

#### `platforms` — 11 rows
Social platforms creators publish on: Instagram, YouTube, Moj, Facebook.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `slug` | text | Machine name. |
| `name` | text | Display name. |

#### `usage_rights` — 4 rows
How widely a brand may reuse the content, and what that scope multiplies the rate by.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | text | Natural key: `creator`, `brand-organic`, `paid-3`, `paid-12`. |
| `label` | text | Display name, e.g. "Paid media · 3 months". |
| `note` | text | One-line explanation shown next to the option. |
| `multiplier` | numeric(4,2) | Rate multiplier, 1.00–1.80. **Editing this reprices every deal composed afterwards.** |
| `sort_order` | integer | Display order, cheapest first. |

#### `deliverable_catalog` — 5 rows
The content formats that can be commissioned. FK target keeping campaign and deal
deliverables to a known set.

| Column | Type | Stores |
|---|---|---|
| `type` `PK` | deliverable_type | The enum value, e.g. `instagram_reel`. |
| `label` | text | Display name. |
| `note` | text | Default spec, e.g. "30–60 sec vertical video". |
| `sort_order` | integer | Display order. |

#### `fit_weights` — 5 rows
The published campaign-fit formula, held as data because it's shown to users as a
transparency promise. A deferred constraint forces the five weights to total exactly 100.

| Column | Type | Stores |
|---|---|---|
| `factor` `PK` | fit_factor | quality, location, relevance, availability, budget. |
| `weight` | integer | Percentage contribution. Currently 30 / 25 / 20 / 10 / 15. |

### 6.2 Identity and creator

Creator rows are readable by any signed-in user — discovery is the product — but writable
only by the creator who owns them.

#### `profiles` — 10 rows
Application-level user record, one per `auth.users` row. Says which side of the
marketplace someone is on.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` `FK` | uuid → auth.users | Same UUID as the auth user. Cascades on delete. |
| `role` | user_role | `creator` or `brand`. Determines which shell the app renders. |
| `display_name` | text | Person's name. |
| `avatar_initials` | *text* | Two-letter monogram. |
| `created_at` | timestamptz | Row creation time. |
| `updated_at` | timestamptz | Maintained by trigger. |

#### `creators` — 21 rows
The core discovery record: who the creator is, where their audience is, how good it is,
and what they charge.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `profile_id` `FK` | *uuid → profiles* | The login that owns this creator. Null for directory-only creators — currently 20 of 21. |
| `slug` | text | Public identifier used in URLs. |
| `name` | text | Display name. |
| `handle` | text | Social handle including the @, unique. |
| `initials` | text | Two-letter monogram. |
| `script` | text | Glyph in the creator's language script, shown behind the avatar. |
| `primary_language_id` `FK` | uuid → languages | Main publishing language. Mirrored by the `is_primary` row in `creator_languages`. |
| `state_id` `FK` | uuid → states | Home state — matched against a campaign's target state. |
| `district_id` `FK` | uuid → districts | Home district, the finest location grain. |
| `niche_id` `FK` | uuid → niches | Primary content category. |
| `audience_size` | integer | Follower count. Range here: 24,800–189,000. |
| `quality_score` | integer | Headline audience-quality score 0–100. Biggest fit factor at 30%. |
| `local_reach_pct` | integer | Percentage of active viewers inside the creator's own state. |
| `engagement_rate` | numeric(4,2) | Meaningful engagement as a percentage, e.g. 8.40. |
| `rate_min` | integer | Floor of the single-deliverable base rate. |
| `rate_max` | integer | Ceiling. Checked ≥ `rate_min`. |
| `availability` | creator_availability | Booking window. Scores 100 / 88 / 68 / 48. |
| `proof` | *text* | One-line evidence sentence on the discovery card. |
| `bio` | *text* | Longer profile description. |
| `confidence` | *integer* | Confidence in the score, 0–100. |
| `percentile` | *integer* | Rank against their language cohort. |
| `last_analysed_at` | *timestamptz* | When intelligence was last recomputed. |
| `created_at` | timestamptz | Row creation time. |
| `updated_at` | timestamptz | Maintained by trigger. |

#### `creator_languages` — 41 rows
Every language a creator publishes in. Campaign language matching checks this table, not
just the primary language.

| Column | Type | Stores |
|---|---|---|
| `creator_id` `PK` `FK` | uuid → creators | The creator. |
| `language_id` `PK` `FK` | uuid → languages | A language they publish in. |
| `is_primary` | boolean | Marks the main language. Partial unique index allows one true row per creator. |

#### `creator_platforms` — 71 rows
Which platforms a creator is active on.

| Column | Type | Stores |
|---|---|---|
| `creator_id` `PK` `FK` | uuid → creators | The creator. |
| `platform_id` `PK` `FK` | uuid → platforms | The platform. |
| `handle_url` | *text* | Direct link to the profile. Unpopulated in seed data. |

#### `creator_score_components` — 105 rows
The five weighted pillars behind the audience-quality score, stored with the evidence
sentence each was justified by. Five rows per creator, weights constrained to total 100.

| Column | Type | Stores |
|---|---|---|
| `creator_id` `PK` `FK` | uuid → creators | The creator scored. |
| `key` `PK` | score_component_key | authenticity, depth, locality, trust, intent. |
| `weight` | integer | This pillar's share — 25 / 20 / 25 / 15 / 15. |
| `score` | integer | The pillar's own score, clamped 58–97. |
| `label` | text | Display name, e.g. "Audience authenticity". |
| `description` | text | What the pillar measures, in plain language. |
| `evidence` | text | The specific finding, e.g. "76% of active viewers are from Bihar, led by Muzaffarpur." |
| `computed_at` | timestamptz | When last calculated. |

#### `creator_audience_breakdown` — 315 rows
Every audience split the profile page charts — region, language, gender, age — in one
table rather than four. Each creator-and-dimension group sums to 100.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `creator_id` `FK` | uuid → creators | The creator. |
| `dimension` | audience_dimension | region, language, gender, age. |
| `bucket_label` | text | Slice name, e.g. "Muzaffarpur", "25–34", "Women". |
| `percent` | integer | That slice's share, 0–100. |
| `sort_order` | integer | Chart display order. |

> **Seeded values are templates, not real per-creator data.** Region is keyed by state and
> gender by niche, so all three Bihar creators share a region mix — which is why Neha Jha's
> chart leads with Muzaffarpur despite her district being Patna.

### 6.3 Brand and campaign brief

#### `brands` — 9 rows
A company running campaigns, and the person who manages it.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `owner_profile_id` `FK` | uuid → profiles | The account controlling this brand. All RLS on campaigns and deals resolves through it. |
| `slug` | text | Machine name, e.g. `rooted-foods`. |
| `name` | text | Brand name shown to creators. |
| `initials` | text | Two-letter monogram. |
| `category` | *text* | Sector, e.g. "Packaged foods". |
| `contact_name` | *text* | Named contact shown on offers. |
| `contact_title` | *text* | Their role. |
| `verified` | boolean | Whether verification passed — drives the badge creators see. |
| `created_at` | timestamptz | Row creation time. |
| `updated_at` | timestamptz | Maintained by trigger. |

#### `campaigns` — 6 rows
A campaign brief: what the brand is taking to market, to whom, and for how much.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `brand_id` `FK` | uuid → brands | Owning brand. |
| `name` | text | Campaign name. |
| `objective` | campaign_objective | What success means. |
| `target_state_id` `FK` | *uuid → states* | Target market. Exact match scores 100 on location. |
| `language_id` `FK` | *uuid → languages* | Campaign language. Speaker living elsewhere scores 62. |
| `niche_id` `FK` | *uuid → niches* | Category sought; drives relevance via `niche_relations`. |
| `budget_total` | integer | Total creator budget. Divided by shortlist size for per-creator allocation. |
| `start_date` | *date* | When content should start going live. |
| `end_date` | *date* | Campaign end. Checked ≥ start. |
| `status` | campaign_status | `draft`, `active`, `completed`. |
| `created_at` | timestamptz | Row creation time. |
| `updated_at` | timestamptz | Maintained by trigger. |

#### `campaign_deliverables` — 14 rows
The content formats a campaign is commissioning. The **count** of these rows sets the rate
multiplier, so adding one reprices every creator on the brief.

| Column | Type | Stores |
|---|---|---|
| `campaign_id` `PK` `FK` | uuid → campaigns | The brief. |
| `type` `PK` `FK` | deliverable_type → deliverable_catalog | Which format. One row per format per campaign, so max 5. |
| `note` | *text* | Campaign-specific spec. |

#### `campaign_shortlist` — 15 rows
Creators picked for a brief, with fit captured as a snapshot at shortlisting time.

| Column | Type | Stores |
|---|---|---|
| `campaign_id` `PK` `FK` | uuid → campaigns | The brief. |
| `creator_id` `PK` `FK` | uuid → creators | The shortlisted creator. |
| `fit_score` | *integer* | Overall fit 0–100 from `campaign_fit()`. Currently 82–97. |
| `fit_factors` | *jsonb* | The five factor scores, so the UI shows the breakdown without recomputing. |
| `estimated_cost` | *integer* | Projected cost at the brief's deliverable count, rounded to ₹500. |
| `added_at` | timestamptz | When shortlisted. |

### 6.4 Deal and negotiation

#### `deals` — 10 rows
A concrete offer from a brand to a creator: the money, the terms, and where the
negotiation stands.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `slug` | text | Readable identifier. |
| `campaign_id` `FK` | *uuid → campaigns* | Originating brief, if any. Nulled rather than cascading. |
| `brand_id` `FK` | uuid → brands | Who is offering. |
| `creator_id` `FK` | uuid → creators | Who is being offered. |
| `campaign_name` | text | Copied onto the deal so it stays readable if the brief changes. |
| `campaign_objective_text` | *text* | The objective as prose, written for the creator. |
| `campaign_audience_text` | *text* | Target audience in words, e.g. "Women 25-34 in Bihar". |
| `amount` | integer | The offered fee. |
| `fair_min` | integer | Fair-band floor at compose time. Stored, not recomputed, so goalposts can't move mid-negotiation. |
| `fair_max` | integer | Band ceiling. Checked ≥ `fair_min`. |
| `usage_rights_id` `FK` | text → usage_rights | Reuse scope being bought. |
| `exclusivity_text` | text | Exclusivity in words. Defaults to "None". |
| `has_exclusivity` | boolean | Machine-readable flag; true adds a 1.2× band multiplier. |
| `payment_terms` | text | When money changes hands. |
| `turnaround_days` | *integer* | Production window. ≤10 days qualifies for the published 10% rush premium. |
| `note` | *text* | Personal message from brand to creator. |
| `status` | deal_status | Where the negotiation stands. `accepted` is terminal. |
| `sent_at` | *timestamptz* | When it reached the creator. Auto-stamped on the move to `sent`. |
| `respond_by` | *timestamptz* | Response deadline. |
| `counter_amount` | *integer* | The creator's counter-offer. Cleared when a new draft starts. |
| `counter_message` | *text* | Their justification. |
| `decline_reason` | *text* | Why they declined, if they did. |
| `created_at` | timestamptz | Row creation time. |
| `updated_at` | timestamptz | Maintained by trigger. |

#### `deal_deliverables` — 23 rows
The exact scope commissioned in this deal, in the brand's own words.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. Unlike campaign deliverables, a deal may repeat a format. |
| `deal_id` `FK` | uuid → deals | Parent deal. |
| `type` `FK` | deliverable_type → deliverable_catalog | Which format. |
| `title` | text | As written on the offer, e.g. "1 Instagram Reel". |
| `detail` | *text* | The spec. |
| `sort_order` | integer | Display order. |

#### `deal_milestones` — 30 rows
The three production dates an offer commits to.

| Column | Type | Stores |
|---|---|---|
| `deal_id` `PK` `FK` | uuid → deals | Parent deal. |
| `label` `PK` | milestone_label | concept_approval, first_cut, publish. |
| `value_date` | *date* | The agreed date, once there is one. |
| `value_text` | *text* | Free-text fallback, e.g. "To be agreed". |
| `sort_order` | integer | Timeline order. |

#### `deal_rate_evidence` — 40 rows
The bullet points justifying the offered rate — the transparency the product is built around.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `deal_id` `FK` | uuid → deals | Parent deal. |
| `line` | text | One justification, e.g. "76% audience concentration in Bihar". |
| `sort_order` | integer | Display order. |

### 6.5 Execution

#### `collaborations` — 12 rows
A live piece of work. Created when a deal is accepted, carries it through production to payment.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `slug` | text | Readable identifier. |
| `source_deal_id` `FK` | *uuid → deals* | The accepted offer. Unique, so one deal yields at most one collaboration. Only 3 of 12 are linked; the rest were seeded without an originating offer. |
| `campaign_id` `FK` | *uuid → campaigns* | Originating brief, if known. |
| `brand_id` `FK` | uuid → brands | The brand. |
| `creator_id` `FK` | uuid → creators | The creator. |
| `campaign_name` | text | Copied on so the workspace reads correctly standalone. |
| `campaign_objective_text` | *text* | Objective as prose. |
| `amount` | integer | Agreed fee. A trigger blocks any change after signing. |
| `status` | collaboration_status | Production stage, `creating` → `completed`. |
| `review_round` | integer | How many times content has been submitted. |
| `revision_note` | *text* | The brand's current change request. |
| `rating` | *integer* | Brand's 1–5 rating. Trigger rejects it unless status is `completed`. |
| `feedback` | *text* | Written feedback with the rating. |
| `created_at` | timestamptz | Row creation time. |
| `updated_at` | timestamptz | Maintained by trigger. |

#### `contracts` — 12 rows
The agreed terms, frozen at signing. One row per collaboration.

| Column | Type | Stores |
|---|---|---|
| `collaboration_id` `PK` `FK` | uuid → collaborations | The collaboration. Also the PK, enforcing one contract each. |
| `reference` | text | Human-quotable contract number, e.g. `VAA-RF-0826-014`. Unique. |
| `signed_at` | timestamptz | When terms were agreed. |
| `scope` | text[] | Deliverables as an array of strings. |
| `usage_rights_id` `FK` | text → usage_rights | Reuse scope granted. |
| `exclusivity_text` | text | Exclusivity terms in words. |
| `first_cut_date` | *date* | When the first draft is due. |
| `publish_by_date` | *date* | Publication deadline. Checked ≥ first cut. |
| `payment_terms` | text | Payment schedule as agreed. |

#### `content_submissions` — 11 rows
Each draft the creator submits for review, one row per round.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `collaboration_id` `FK` | uuid → collaborations | The work this belongs to. |
| `review_round` | integer | Which round. Unique per collaboration. |
| `filename` | text | Name of the submitted file. |
| `storage_path` | *text* | Path in Supabase Storage once real uploads land. Unpopulated today. |
| `note` | text | The creator's message to the brand with this draft. |
| `content_type` | *text* | Format description, e.g. "Video, MP4". |
| `duration` | *text* | Runtime as displayed, e.g. "00:48". |
| `outcome` | submission_outcome | pending, approved, revision_requested. |
| `submitted_at` | timestamptz | Submission time. |

#### `payments` — 12 rows
Escrow and release state. Read-only over the API — select policies, no write policies.

| Column | Type | Stores |
|---|---|---|
| `collaboration_id` `PK` `FK` | uuid → collaborations | The work being paid for. |
| `status` | payment_status | `escrow_funded`, `release_pending`, `released`. |
| `secured` | integer | Amount held in escrow. |
| `released` | integer | Amount paid out. Constrained never to exceed `secured`. |
| `reference` | text | Escrow reference. |
| `updated_at` | timestamptz | Last state change. **This is the date monthly earnings are attributed to**, not the campaign date. |

#### `performance_metrics` — 7 rows
How the published content actually performed. Only exists for completed collaborations.

| Column | Type | Stores |
|---|---|---|
| `collaboration_id` `PK` `FK` | uuid → collaborations | The work measured. |
| `views` | *integer* | Total views. |
| `reach` | *integer* | Unique accounts reached. |
| `engagement_rate` | *numeric(4,2)* | Engagement as a percentage of reach. |
| `saves` | *integer* | Saves — the strongest intent signal in the model. |
| `shares` | *integer* | Shares. |
| `positive_sentiment_pct` | *integer* | Share of comments read as positive. |
| `captured_at` | timestamptz | When measured. |

#### `activity_events` — 56 rows
The shared timeline both sides see. One table serves deals and collaborations, since both
emit the same shape.

| Column | Type | Stores |
|---|---|---|
| `id` `PK` | uuid | Surrogate key. |
| `subject_type` | activity_subject | Whether this belongs to a `deal` or a `collaboration`. |
| `subject_id` | uuid | The parent row. **No FK is possible across a polymorphic parent**, so a trigger validates existence on write. |
| `actor` | activity_actor | brand, creator, or system. |
| `title` | text | Headline, e.g. "Rooted Foods sent an offer". |
| `detail` | *text* | Supporting line. |
| `created_at` | timestamptz | Real timestamp. The "Just now" strings in the UI are presentation, not storage. |

### 6.6 State machine tables

The legal status moves, held as data so the rules are inspectable and enforced in one
place. Triggers reject anything not listed.

#### `deal_transitions` — 13 rows
`accepted` appears only as a destination, which is what makes it terminal.

| Column | Type | Stores |
|---|---|---|
| `from_status` `PK` | deal_status | Current status. |
| `to_status` `PK` | deal_status | A status it may legally move to. |

#### `collaboration_transitions` — 6 rows
The production pipeline as a graph. Strictly linear apart from the revision loop back to
`in_review`.

| Column | Type | Stores |
|---|---|---|
| `from_status` `PK` | collaboration_status | Current stage. |
| `to_status` `PK` | collaboration_status | A stage it may legally move to. |

---

## 7. Enumerated types

Adding a value is a migration, not a data change — worth knowing before planning work that
needs a new status.

| Type | Values, in order |
|---|---|
| `user_role` | creator, brand |
| `creator_availability` | this_month, two_weeks, next_month, limited |
| `score_component_key` | authenticity, depth, locality, trust, intent |
| `audience_dimension` | region, language, gender, age |
| `fit_factor` | quality, location, relevance, availability, budget |
| `campaign_objective` | product_consideration, brand_awareness, local_launch, community_engagement, sales_conversion |
| `campaign_status` | draft, active, completed |
| `deliverable_type` | instagram_reel, story_set, youtube_integration, photo_post, photo_carousel |
| `milestone_label` | concept_approval, first_cut, publish |
| `deal_status` | draft, sent, editing, countered, accepted, declined, withdrawn |
| `collaboration_status` | creating, in_review, revision_requested, approved, delivered, completed |
| `submission_outcome` | pending, approved, revision_requested |
| `payment_status` | escrow_funded, release_pending, released |
| `activity_subject` | deal, collaboration |
| `activity_actor` | brand, creator, system |

---

## 8. Views

Five read models replace the dashboard fixtures. All are `security_invoker`, so RLS
applies to the caller — usually query these rather than the base tables.

| View | Returns |
|---|---|
| `creator_directory` | Discovery rows with languages, platforms, state, district and niche flattened. |
| `brand_dashboard_metrics` | Per brand: active collaborations, shortlisted creators, pending offers, escrow outstanding. |
| `creator_dashboard_metrics` | Per creator: open offers, active and completed collaborations, total earned. |
| `creator_monthly_earnings` | Released payments grouped by creator and month. |
| `deal_summary` | Offer rows for both inboxes with the fair-band verdict already resolved. |

---

## 9. Start here

Roughly in order of usefulness. Confirm before picking one up — the wiring task in
particular sets patterns everyone else will follow.

1. **Wire the first screen to the API.** Install `@supabase/supabase-js` and move creator
   discovery off `creators.js` onto the `creator_directory` view. Most self-contained
   screen; establishes the client, query and loading-state patterns.
2. **Build the auth flow.** Demo accounts already exist; the app has a role switcher
   instead of a login. Roles come from `profiles.role`.
3. **Give the new-market creators commercial activity.** The 11 creators outside the four
   original states appear in discovery but sit in no shortlist, deal or collaboration.
   Discovery demos well; filtering to Kerala and then opening a profile shows an empty
   history.
4. **Delete a JS formula.** As each screen moves over, remove its JavaScript pricing twin.
   Much easier as you go than as a cleanup later.
5. **Preserve the test harness.** The 36 RLS and state-machine assertions live in a
   gitignored scratch directory and will be lost. Moving them into a tracked
   `supabase/tests/` would make them real regression coverage.

---

## 10. Access

You'll need a Supabase account added to the **Creator** project, then your own personal
access token. Project ref `msgtkufrqoijuezterkt`, region ap-south-1.

Demo logins are defined at the bottom of `seed.sql` — one creator (Priya) and nine brand
owners, all sharing the password `demo-password` on `.test` email addresses. These are
deliberately weak and local-only.

> Treat this project as a scratch environment. Don't put anything real in it, and assume
> anyone with the repo can sign in as anyone.

---

*Columns, types, keys and enum values were read from the deployed database. Row counts are
a snapshot and will drift. `supabase/README.md` carries schema rationale in more depth.*
