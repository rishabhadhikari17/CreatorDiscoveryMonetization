-- GlobalGalli creator platform — enums, lookup tables, and scoring config.
--
-- Money convention: every money column is whole Indian rupees stored as `integer`.
-- Never paise, never float. The fair-band and estimate maths round to the nearest
-- 500 rupees, which only holds if the unit stays consistent everywhere.

-- ============================================================== enums

create type user_role as enum ('creator', 'brand');

-- Was a free-text string ("Available this month") parsed by substring match in the
-- frontend. Promoted to an enum so availability scoring cannot silently fall through.
create type creator_availability as enum ('this_month', 'two_weeks', 'next_month', 'limited');

create type score_component_key as enum ('authenticity', 'depth', 'locality', 'trust', 'intent');

create type audience_dimension as enum ('region', 'language', 'gender', 'age');

create type campaign_objective as enum (
  'product_consideration', 'brand_awareness', 'local_launch',
  'community_engagement', 'sales_conversion'
);

create type campaign_status as enum ('draft', 'active', 'completed');

create type deliverable_type as enum (
  'instagram_reel', 'story_set', 'youtube_integration', 'photo_post', 'photo_carousel'
);

create type deal_status as enum (
  'draft', 'sent', 'editing', 'countered', 'accepted', 'declined', 'withdrawn'
);

create type collaboration_status as enum (
  'creating', 'in_review', 'revision_requested', 'approved', 'delivered', 'completed'
);

create type payment_status as enum ('escrow_funded', 'release_pending', 'released');

create type submission_outcome as enum ('pending', 'approved', 'revision_requested');

create type activity_actor as enum ('brand', 'creator', 'system');

create type activity_subject as enum ('deal', 'collaboration');

create type milestone_label as enum ('concept_approval', 'first_cut', 'publish');

create type fit_factor as enum ('quality', 'location', 'relevance', 'availability', 'budget');

-- ============================================================== shared helpers

create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Rounds to the nearest 500 rupees. Mirrors roundToFiveHundred() / the `round`
-- closure used by dealPricing.js and campaignMatching.js.
create function round_to_500(value numeric) returns integer
language sql immutable as $$
  select (round(value / 500.0) * 500)::integer;
$$;

-- ============================================================== lookup tables

create table languages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null unique,
  script_char text not null,
  cohort_size integer not null default 0 check (cohort_size >= 0)
);
comment on column languages.cohort_size is
  'Benchmarked creators in this language cohort; powers "benchmarked against 34 Bhojpuri creators".';

create table states (
  id   uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique
);

create table districts (
  id       uuid primary key default gen_random_uuid(),
  state_id uuid not null references states (id) on delete cascade,
  slug     text not null unique,
  name     text not null,
  unique (state_id, name)
);
create index districts_state_id_idx on districts (state_id);

create table niches (
  id   uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique
);

-- Adjacency used by campaign-fit relevance scoring: an exact niche match scores 100,
-- a related niche 70, anything else 42. Modelled as a junction rather than an array
-- column so the references stay foreign-key enforced.
create table niche_relations (
  niche_id         uuid not null references niches (id) on delete cascade,
  related_niche_id uuid not null references niches (id) on delete cascade,
  primary key (niche_id, related_niche_id),
  check (niche_id <> related_niche_id)
);

create table platforms (
  id   uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique
);

create table usage_rights (
  id         text primary key,
  label      text not null,
  note       text not null,
  multiplier numeric(4, 2) not null check (multiplier > 0),
  sort_order integer not null default 0
);
comment on table usage_rights is
  'Rate multipliers for content usage scope. Changing a multiplier changes every '
  'fair band computed from that point on, so treat edits as a pricing change.';

create table deliverable_catalog (
  type       deliverable_type primary key,
  label      text not null,
  note       text not null,
  sort_order integer not null default 0
);

-- ============================================================== scoring config

-- The published campaign-fit formula: quality 30 + location 25 + relevance 20 +
-- availability 10 + budget 15. Surfaced to users as a transparency promise, so the
-- weights live in one place and the total is enforced.
create table fit_weights (
  factor fit_factor primary key,
  weight integer not null check (weight between 0 and 100)
);

create function assert_fit_weights_total() returns trigger
language plpgsql as $$
declare
  total integer;
begin
  select coalesce(sum(weight), 0) into total from fit_weights;
  if total <> 100 then
    raise exception 'fit_weights must total 100, got %', total;
  end if;
  return null;
end;
$$;

create constraint trigger fit_weights_total_check
  after insert or update or delete on fit_weights
  deferrable initially deferred
  for each row execute function assert_fit_weights_total();
