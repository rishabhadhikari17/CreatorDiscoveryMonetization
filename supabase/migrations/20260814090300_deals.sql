-- Deals: the offer, its terms, and the negotiation state machine.

create table deals (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  campaign_id      uuid references campaigns (id) on delete set null,
  brand_id         uuid not null references brands (id) on delete cascade,
  creator_id       uuid not null references creators (id) on delete cascade,

  -- Campaign context carried on the offer itself, so a deal stays readable even if
  -- the parent brief is edited afterwards.
  campaign_name    text not null,
  campaign_objective_text text,
  campaign_audience_text  text,

  amount           integer not null check (amount >= 0),
  fair_min         integer not null check (fair_min >= 0),
  fair_max         integer not null check (fair_max >= 0),

  usage_rights_id  text not null references usage_rights (id),
  exclusivity_text text not null default 'None',
  has_exclusivity  boolean not null default false,
  payment_terms    text not null,
  turnaround_days  integer check (turnaround_days > 0),
  note             text,

  status           deal_status not null default 'draft',
  sent_at          timestamptz,
  respond_by       timestamptz,

  counter_amount   integer check (counter_amount >= 0),
  counter_message  text,
  decline_reason   text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  check (fair_max >= fair_min)
);
comment on column deals.fair_min is
  'Snapshot of the fair band at the time the offer was composed. Recomputing it later '
  'would move the goalposts mid-negotiation, so it is stored, not derived on read.';

create index deals_brand_id_idx on deals (brand_id);
create index deals_creator_id_idx on deals (creator_id);
create index deals_campaign_id_idx on deals (campaign_id);
create index deals_status_idx on deals (status);

create trigger deals_set_updated_at
  before update on deals
  for each row execute function set_updated_at();

create table deal_deliverables (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references deals (id) on delete cascade,
  type        deliverable_type not null references deliverable_catalog (type),
  title       text not null,
  detail      text,
  sort_order  integer not null default 0
);
create index deal_deliverables_deal_id_idx on deal_deliverables (deal_id);

create table deal_milestones (
  deal_id    uuid not null references deals (id) on delete cascade,
  label      milestone_label not null,
  value_date date,
  value_text text,
  sort_order integer not null default 0,
  primary key (deal_id, label)
);
comment on column deal_milestones.value_text is
  'Free-text fallback for milestones not yet pinned to a date ("To be agreed").';

create table deal_rate_evidence (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references deals (id) on delete cascade,
  line       text not null,
  sort_order integer not null default 0
);
create index deal_rate_evidence_deal_id_idx on deal_rate_evidence (deal_id);

-- ============================================================== state machine

-- The allowed transitions the frontend already refuses to break. Enforced here too:
-- the client is one of several possible callers, and PostgREST exposes deals directly.
create table deal_transitions (
  from_status deal_status not null,
  to_status   deal_status not null,
  primary key (from_status, to_status)
);

insert into deal_transitions (from_status, to_status) values
  ('draft',     'sent'),
  ('sent',      'editing'),
  ('sent',      'accepted'),
  ('sent',      'countered'),
  ('sent',      'declined'),
  ('sent',      'withdrawn'),
  ('editing',   'sent'),
  ('editing',   'withdrawn'),
  ('countered', 'editing'),
  ('countered', 'accepted'),
  ('countered', 'withdrawn'),
  ('declined',  'draft'),
  ('withdrawn', 'draft');

create function enforce_deal_transition() returns trigger
language plpgsql as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not exists (
    select 1 from deal_transitions
    where from_status = old.status and to_status = new.status
  ) then
    raise exception 'invalid deal transition: % -> %', old.status, new.status;
  end if;

  -- Accepted is terminal; the collaboration record takes over from here.
  if old.status = 'accepted' then
    raise exception 'deal % is accepted and can no longer change status', old.id;
  end if;

  -- A fresh draft clears the previous round's negotiation residue.
  if new.status = 'draft' then
    new.counter_amount  := null;
    new.counter_message := null;
    new.decline_reason  := null;
  end if;

  if new.status = 'sent' and new.sent_at is null then
    new.sent_at := now();
  end if;

  return new;
end;
$$;

create trigger deals_enforce_transition
  before update of status on deals
  for each row execute function enforce_deal_transition();
