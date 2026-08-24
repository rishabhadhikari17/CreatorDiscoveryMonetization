-- Identity and the creator domain: the discovery row, its junctions, and the
-- audience-intelligence tables behind the creator profile page.

-- ============================================================== identity

create table profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  role           user_role not null,
  display_name   text not null,
  avatar_initials text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ============================================================== creators

create table creators (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid unique references profiles (id) on delete set null,
  slug                text not null unique,
  name                text not null,
  handle              text not null unique,
  initials            text not null,
  script              text not null,
  primary_language_id uuid not null references languages (id),
  state_id            uuid not null references states (id),
  district_id         uuid not null references districts (id),
  niche_id            uuid not null references niches (id),
  audience_size       integer not null check (audience_size >= 0),
  quality_score       integer not null check (quality_score between 0 and 100),
  local_reach_pct     integer not null check (local_reach_pct between 0 and 100),
  engagement_rate     numeric(4, 2) not null check (engagement_rate >= 0),
  rate_min            integer not null check (rate_min >= 0),
  rate_max            integer not null check (rate_max >= 0),
  availability        creator_availability not null,
  proof               text,
  bio                 text,
  confidence          integer check (confidence between 0 and 100),
  percentile          integer check (percentile between 0 and 100),
  last_analysed_at    timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (rate_max >= rate_min)
);
comment on column creators.slug is
  'Stable public identifier used in URLs (/brand/creators/:slug).';
comment on column creators.rate_min is 'Whole rupees. Floor of the creator''s single-deliverable base rate.';

create index creators_state_id_idx on creators (state_id);
create index creators_district_id_idx on creators (district_id);
create index creators_niche_id_idx on creators (niche_id);
create index creators_primary_language_id_idx on creators (primary_language_id);
-- Discovery sorts by quality and audience, and filters on rate floor.
create index creators_quality_score_idx on creators (quality_score desc);
create index creators_audience_size_idx on creators (audience_size desc);
create index creators_rate_min_idx on creators (rate_min);

create trigger creators_set_updated_at
  before update on creators
  for each row execute function set_updated_at();

create table creator_languages (
  creator_id  uuid not null references creators (id) on delete cascade,
  language_id uuid not null references languages (id) on delete restrict,
  is_primary  boolean not null default false,
  primary key (creator_id, language_id)
);
create index creator_languages_language_id_idx on creator_languages (language_id);
-- A creator has exactly one primary language, and it must agree with creators.primary_language_id.
create unique index creator_languages_one_primary_idx
  on creator_languages (creator_id) where is_primary;

create table creator_platforms (
  creator_id  uuid not null references creators (id) on delete cascade,
  platform_id uuid not null references platforms (id) on delete restrict,
  handle_url  text,
  primary key (creator_id, platform_id)
);

-- ============================================================== audience intelligence

-- The five weighted pillars behind the audience-quality score. Currently derived in
-- the frontend from quality/engagement/localReach; here they are stored so the
-- evidence copy shown to brands is the same text the score was computed against.
create table creator_score_components (
  creator_id  uuid not null references creators (id) on delete cascade,
  key         score_component_key not null,
  weight      integer not null check (weight between 0 and 100),
  score       integer not null check (score between 0 and 100),
  label       text not null,
  description text not null,
  evidence    text not null,
  computed_at timestamptz not null default now(),
  primary key (creator_id, key)
);

create function assert_score_component_weights() returns trigger
language plpgsql as $$
declare
  target uuid;
  total  integer;
begin
  -- NEW is unassigned on DELETE; touching it there raises "record new is not
  -- assigned yet" rather than falling through to OLD.
  if tg_op = 'DELETE' then
    target := old.creator_id;
  else
    target := new.creator_id;
  end if;

  select coalesce(sum(weight), 0) into total
  from creator_score_components where creator_id = target;

  -- Zero rows is a creator with no score breakdown yet, which is legitimate.
  if total not in (0, 100) then
    raise exception 'creator_score_components for % must total 100, got %', target, total;
  end if;
  return null;
end;
$$;

create constraint trigger creator_score_components_total_check
  after insert or update or delete on creator_score_components
  deferrable initially deferred
  for each row execute function assert_score_component_weights();

-- One table for every audience split the profile page renders: regional mix,
-- language mix, gender, and age. Each (creator, dimension) group should total ~100.
create table creator_audience_breakdown (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid not null references creators (id) on delete cascade,
  dimension    audience_dimension not null,
  bucket_label text not null,
  percent      integer not null check (percent between 0 and 100),
  sort_order   integer not null default 0,
  unique (creator_id, dimension, bucket_label)
);
create index creator_audience_breakdown_creator_idx
  on creator_audience_breakdown (creator_id, dimension);
