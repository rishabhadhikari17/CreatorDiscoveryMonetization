-- Execution: the collaboration created on deal acceptance, its contract, content
-- submissions, payment state, results, and the shared activity timeline.

create table collaborations (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  source_deal_id uuid unique references deals (id) on delete set null,
  campaign_id    uuid references campaigns (id) on delete set null,
  brand_id       uuid not null references brands (id) on delete cascade,
  creator_id     uuid not null references creators (id) on delete cascade,
  campaign_name  text not null,
  campaign_objective_text text,
  amount         integer not null check (amount >= 0),
  status         collaboration_status not null default 'creating',
  review_round   integer not null default 0 check (review_round >= 0),
  revision_note  text,
  rating         integer check (rating between 1 and 5),
  feedback       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on column collaborations.source_deal_id is
  'Unique: one accepted deal produces at most one collaboration. Null for seeded '
  'or manually created workspaces with no originating offer.';

create index collaborations_brand_id_idx on collaborations (brand_id);
create index collaborations_creator_id_idx on collaborations (creator_id);
create index collaborations_status_idx on collaborations (status);

create trigger collaborations_set_updated_at
  before update on collaborations
  for each row execute function set_updated_at();

create table contracts (
  collaboration_id uuid primary key references collaborations (id) on delete cascade,
  reference        text not null unique,
  signed_at        timestamptz not null default now(),
  scope            text[] not null default '{}',
  usage_rights_id  text not null references usage_rights (id),
  exclusivity_text text not null default 'None',
  first_cut_date   date,
  publish_by_date  date,
  payment_terms    text not null,
  check (publish_by_date is null or first_cut_date is null or publish_by_date >= first_cut_date)
);

-- ============================================================== content review

create table content_submissions (
  id               uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references collaborations (id) on delete cascade,
  review_round     integer not null check (review_round > 0),
  filename         text not null,
  storage_path     text,
  note             text not null,
  content_type     text,
  duration         text,
  outcome          submission_outcome not null default 'pending',
  submitted_at     timestamptz not null default now(),
  unique (collaboration_id, review_round)
);
comment on column content_submissions.storage_path is
  'Path in the Supabase Storage bucket once real uploads replace the demo placeholder.';

create index content_submissions_collaboration_idx
  on content_submissions (collaboration_id, review_round desc);

-- ============================================================== money and results

create table payments (
  collaboration_id uuid primary key references collaborations (id) on delete cascade,
  status           payment_status not null default 'escrow_funded',
  secured          integer not null default 0 check (secured >= 0),
  released         integer not null default 0 check (released >= 0),
  reference        text not null,
  updated_at       timestamptz not null default now(),
  check (released <= secured)
);

create trigger payments_set_updated_at
  before update on payments
  for each row execute function set_updated_at();

create table performance_metrics (
  collaboration_id      uuid primary key references collaborations (id) on delete cascade,
  views                 integer check (views >= 0),
  reach                 integer check (reach >= 0),
  engagement_rate       numeric(4, 2) check (engagement_rate >= 0),
  saves                 integer check (saves >= 0),
  shares                integer check (shares >= 0),
  positive_sentiment_pct integer check (positive_sentiment_pct between 0 and 100),
  captured_at           timestamptz not null default now()
);

-- ============================================================== shared timeline

-- Deals and collaborations emit the identical {actor, title, detail, time} shape, so
-- one polymorphic table serves both. Timestamps are real; the "Just now" / "8 Aug,
-- 3:15 PM" strings in the frontend are presentation, not storage.
create table activity_events (
  id           uuid primary key default gen_random_uuid(),
  subject_type activity_subject not null,
  subject_id   uuid not null,
  actor        activity_actor not null,
  title        text not null,
  detail       text,
  created_at   timestamptz not null default now()
);
create index activity_events_subject_idx
  on activity_events (subject_type, subject_id, created_at desc);

-- No foreign key is possible across a polymorphic parent, so the reference is
-- checked on write instead of being left unvalidated.
create function assert_activity_subject_exists() returns trigger
language plpgsql as $$
begin
  if new.subject_type = 'deal' then
    if not exists (select 1 from deals where id = new.subject_id) then
      raise exception 'activity_events references missing deal %', new.subject_id;
    end if;
  else
    if not exists (select 1 from collaborations where id = new.subject_id) then
      raise exception 'activity_events references missing collaboration %', new.subject_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger activity_events_subject_check
  before insert or update on activity_events
  for each row execute function assert_activity_subject_exists();

-- ============================================================== state machine

create table collaboration_transitions (
  from_status collaboration_status not null,
  to_status   collaboration_status not null,
  primary key (from_status, to_status)
);

insert into collaboration_transitions (from_status, to_status) values
  ('creating',           'in_review'),
  ('in_review',          'revision_requested'),
  ('in_review',          'approved'),
  ('revision_requested', 'in_review'),
  ('approved',           'delivered'),
  ('delivered',          'completed');

create function enforce_collaboration_transition() returns trigger
language plpgsql as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not exists (
    select 1 from collaboration_transitions
    where from_status = old.status and to_status = new.status
  ) then
    raise exception 'invalid collaboration transition: % -> %', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger collaborations_enforce_transition
  before update of status on collaborations
  for each row execute function enforce_collaboration_transition();

-- Ratings are only meaningful once the work is paid for and closed.
create function enforce_rating_after_completion() returns trigger
language plpgsql as $$
begin
  if new.rating is not null and new.status <> 'completed' then
    raise exception 'a collaboration can only be rated once completed (status is %)', new.status;
  end if;
  return new;
end;
$$;

create trigger collaborations_enforce_rating
  before insert or update of rating on collaborations
  for each row execute function enforce_rating_after_completion();
