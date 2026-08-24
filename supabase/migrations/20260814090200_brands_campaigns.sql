-- Brands, campaign briefs, and the shortlist that turns discovery into a team.

create table brands (
  id               uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references profiles (id) on delete cascade,
  slug             text not null unique,
  name             text not null,
  initials         text not null,
  category         text,
  contact_name     text,
  contact_title    text,
  verified         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index brands_owner_profile_id_idx on brands (owner_profile_id);

create trigger brands_set_updated_at
  before update on brands
  for each row execute function set_updated_at();

-- ============================================================== campaign brief

create table campaigns (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid not null references brands (id) on delete cascade,
  name            text not null,
  objective       campaign_objective not null,
  target_state_id uuid references states (id),
  language_id     uuid references languages (id),
  niche_id        uuid references niches (id),
  budget_total    integer not null check (budget_total >= 0),
  start_date      date,
  end_date        date,
  status          campaign_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index campaigns_brand_id_idx on campaigns (brand_id);
create index campaigns_status_idx on campaigns (status);

create trigger campaigns_set_updated_at
  before update on campaigns
  for each row execute function set_updated_at();

create table campaign_deliverables (
  campaign_id uuid not null references campaigns (id) on delete cascade,
  type        deliverable_type not null references deliverable_catalog (type),
  note        text,
  primary key (campaign_id, type)
);

-- ============================================================== shortlist

-- fit_score / fit_factors / estimated_cost are a snapshot taken when the creator was
-- shortlisted. campaign_fit() recomputes live values for display; the snapshot is what
-- the brand actually committed budget against, so both are kept.
create table campaign_shortlist (
  campaign_id    uuid not null references campaigns (id) on delete cascade,
  creator_id     uuid not null references creators (id) on delete cascade,
  fit_score      integer check (fit_score between 0 and 100),
  fit_factors    jsonb,
  estimated_cost integer check (estimated_cost >= 0),
  added_at       timestamptz not null default now(),
  primary key (campaign_id, creator_id)
);
create index campaign_shortlist_creator_id_idx on campaign_shortlist (creator_id);
