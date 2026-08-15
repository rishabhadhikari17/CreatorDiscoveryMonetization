-- Row level security.
--
-- Every table here is reachable over PostgREST the moment it exists, so RLS is
-- enabled on all of them — including the lookup tables, where the policy is simply
-- "authenticated users may read". Writes to reference data, payments, and
-- performance metrics are left with no policy at all: they belong to the service
-- role, which bypasses RLS.

-- ============================================================== helpers
-- security definer + a pinned search_path: these are called from inside policies,
-- so they must not re-enter RLS (infinite recursion) or resolve to a shadowed table.

create function current_profile_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create function my_creator_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from creators where profile_id = auth.uid();
$$;

create function owns_brand(p_brand_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from brands
    where id = p_brand_id and owner_profile_id = auth.uid()
  );
$$;

create function owns_creator(p_creator_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from creators
    where id = p_creator_id and profile_id = auth.uid()
  );
$$;

-- A creator must not see an offer that is still being drafted or revised in private.
create function can_read_deal(p_deal_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from deals d
    where d.id = p_deal_id
      and (
        owns_brand(d.brand_id)
        or (owns_creator(d.creator_id) and d.status <> 'draft')
      )
  );
$$;

create function can_read_collaboration(p_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from collaborations c
    where c.id = p_id and (owns_brand(c.brand_id) or owns_creator(c.creator_id))
  );
$$;

-- ============================================================== reference data

alter table languages           enable row level security;
alter table states              enable row level security;
alter table districts           enable row level security;
alter table niches              enable row level security;
alter table niche_relations     enable row level security;
alter table platforms           enable row level security;
alter table usage_rights        enable row level security;
alter table deliverable_catalog enable row level security;
alter table fit_weights         enable row level security;
alter table deal_transitions    enable row level security;
alter table collaboration_transitions enable row level security;

create policy read_languages on languages for select to authenticated using (true);
create policy read_states on states for select to authenticated using (true);
create policy read_districts on districts for select to authenticated using (true);
create policy read_niches on niches for select to authenticated using (true);
create policy read_niche_relations on niche_relations for select to authenticated using (true);
create policy read_platforms on platforms for select to authenticated using (true);
create policy read_usage_rights on usage_rights for select to authenticated using (true);
create policy read_deliverable_catalog on deliverable_catalog for select to authenticated using (true);
create policy read_fit_weights on fit_weights for select to authenticated using (true);
create policy read_deal_transitions on deal_transitions for select to authenticated using (true);
create policy read_collaboration_transitions on collaboration_transitions for select to authenticated using (true);

-- ============================================================== profiles

alter table profiles enable row level security;

create policy read_own_profile on profiles
  for select to authenticated using (id = auth.uid());

create policy insert_own_profile on profiles
  for insert to authenticated with check (id = auth.uid());

create policy update_own_profile on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================== creator directory
-- Discovery is the product: any authenticated user reads creator intelligence.
-- Only the creator themself writes it.

alter table creators                  enable row level security;
alter table creator_languages         enable row level security;
alter table creator_platforms         enable row level security;
alter table creator_score_components  enable row level security;
alter table creator_audience_breakdown enable row level security;

create policy read_creators on creators for select to authenticated using (true);
create policy insert_own_creator on creators
  for insert to authenticated with check (profile_id = auth.uid());
create policy update_own_creator on creators
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy read_creator_languages on creator_languages for select to authenticated using (true);
create policy write_own_creator_languages on creator_languages
  for all to authenticated using (owns_creator(creator_id)) with check (owns_creator(creator_id));

create policy read_creator_platforms on creator_platforms for select to authenticated using (true);
create policy write_own_creator_platforms on creator_platforms
  for all to authenticated using (owns_creator(creator_id)) with check (owns_creator(creator_id));

-- Scores are computed by the platform, not self-reported: read-only to everyone,
-- written by the service role.
create policy read_creator_score_components on creator_score_components
  for select to authenticated using (true);
create policy read_creator_audience_breakdown on creator_audience_breakdown
  for select to authenticated using (true);

-- ============================================================== brands and campaigns

alter table brands               enable row level security;
alter table campaigns            enable row level security;
alter table campaign_deliverables enable row level security;
alter table campaign_shortlist   enable row level security;

-- Brand identity appears on every offer a creator receives, so it is readable;
-- only the owner writes it.
create policy read_brands on brands for select to authenticated using (true);
create policy insert_own_brand on brands
  for insert to authenticated with check (owner_profile_id = auth.uid());
create policy update_own_brand on brands
  for update to authenticated using (owner_profile_id = auth.uid())
  with check (owner_profile_id = auth.uid());

-- Briefs, scope, and the shortlist stay private to the brand. A creator sees the
-- campaign context denormalised onto their own deal row instead — they must not be
-- able to enumerate who else was shortlisted or what the total budget is.
create policy manage_own_campaigns on campaigns
  for all to authenticated using (owns_brand(brand_id)) with check (owns_brand(brand_id));

create policy manage_own_campaign_deliverables on campaign_deliverables
  for all to authenticated
  using (exists (select 1 from campaigns c where c.id = campaign_id and owns_brand(c.brand_id)))
  with check (exists (select 1 from campaigns c where c.id = campaign_id and owns_brand(c.brand_id)));

create policy manage_own_shortlist on campaign_shortlist
  for all to authenticated
  using (exists (select 1 from campaigns c where c.id = campaign_id and owns_brand(c.brand_id)))
  with check (exists (select 1 from campaigns c where c.id = campaign_id and owns_brand(c.brand_id)));

-- ============================================================== deals

alter table deals              enable row level security;
alter table deal_deliverables  enable row level security;
alter table deal_milestones    enable row level security;
alter table deal_rate_evidence enable row level security;

create policy read_deals on deals
  for select to authenticated
  using (owns_brand(brand_id) or (owns_creator(creator_id) and status <> 'draft'));

create policy insert_deals on deals
  for insert to authenticated with check (owns_brand(brand_id));

-- Both sides may update; which columns and which statuses each side may touch is
-- enforced by the trigger below, because a policy cannot express column-level rules.
create policy update_deals on deals
  for update to authenticated
  using (owns_brand(brand_id) or (owns_creator(creator_id) and status <> 'draft'))
  with check (owns_brand(brand_id) or owns_creator(creator_id));

create policy delete_draft_deals on deals
  for delete to authenticated using (owns_brand(brand_id) and status = 'draft');

create policy read_deal_deliverables on deal_deliverables
  for select to authenticated using (can_read_deal(deal_id));
create policy write_deal_deliverables on deal_deliverables
  for all to authenticated
  using (exists (select 1 from deals d where d.id = deal_id and owns_brand(d.brand_id)))
  with check (exists (select 1 from deals d where d.id = deal_id and owns_brand(d.brand_id)));

create policy read_deal_milestones on deal_milestones
  for select to authenticated using (can_read_deal(deal_id));
create policy write_deal_milestones on deal_milestones
  for all to authenticated
  using (exists (select 1 from deals d where d.id = deal_id and owns_brand(d.brand_id)))
  with check (exists (select 1 from deals d where d.id = deal_id and owns_brand(d.brand_id)));

create policy read_deal_rate_evidence on deal_rate_evidence
  for select to authenticated using (can_read_deal(deal_id));
create policy write_deal_rate_evidence on deal_rate_evidence
  for all to authenticated
  using (exists (select 1 from deals d where d.id = deal_id and owns_brand(d.brand_id)))
  with check (exists (select 1 from deals d where d.id = deal_id and owns_brand(d.brand_id)));

-- A creator may only respond to an offer: accept, counter, or decline. They must not
-- be able to rewrite the amount, terms, or scope while doing so.
create function enforce_deal_actor_scope() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_brand   boolean := owns_brand(new.brand_id);
  is_creator boolean := owns_creator(new.creator_id);
begin
  -- Service role and other privileged callers own neither side; leave them alone.
  if is_brand or not is_creator then
    return new;
  end if;

  if new.status is distinct from old.status
     and new.status not in ('accepted', 'countered', 'declined') then
    raise exception 'a creator may only accept, counter, or decline an offer';
  end if;

  if (new.amount, new.fair_min, new.fair_max, new.usage_rights_id, new.exclusivity_text,
      new.has_exclusivity, new.payment_terms, new.turnaround_days, new.note,
      new.campaign_id, new.respond_by)
     is distinct from
     (old.amount, old.fair_min, old.fair_max, old.usage_rights_id, old.exclusivity_text,
      old.has_exclusivity, old.payment_terms, old.turnaround_days, old.note,
      old.campaign_id, old.respond_by) then
    raise exception 'a creator may not modify the offer terms';
  end if;

  return new;
end;
$$;

create trigger deals_enforce_actor_scope
  before update on deals
  for each row execute function enforce_deal_actor_scope();

-- ============================================================== execution

alter table collaborations      enable row level security;
alter table contracts           enable row level security;
alter table content_submissions enable row level security;
alter table payments            enable row level security;
alter table performance_metrics enable row level security;
alter table activity_events     enable row level security;

create policy read_collaborations on collaborations
  for select to authenticated using (owns_brand(brand_id) or owns_creator(creator_id));
create policy update_collaborations on collaborations
  for update to authenticated
  using (owns_brand(brand_id) or owns_creator(creator_id))
  with check (owns_brand(brand_id) or owns_creator(creator_id));

create policy read_contracts on contracts
  for select to authenticated using (can_read_collaboration(collaboration_id));

create policy read_content_submissions on content_submissions
  for select to authenticated using (can_read_collaboration(collaboration_id));

create policy insert_content_submissions on content_submissions
  for insert to authenticated
  with check (exists (
    select 1 from collaborations c
    where c.id = collaboration_id and owns_creator(c.creator_id)
  ));

-- Only the brand records a review outcome.
create policy update_content_submissions on content_submissions
  for update to authenticated
  using (exists (select 1 from collaborations c where c.id = collaboration_id and owns_brand(c.brand_id)))
  with check (exists (select 1 from collaborations c where c.id = collaboration_id and owns_brand(c.brand_id)));

-- Money is readable by both parties and writable by neither. Escrow and release move
-- through the service role only.
create policy read_payments on payments
  for select to authenticated using (can_read_collaboration(collaboration_id));

create policy read_performance_metrics on performance_metrics
  for select to authenticated using (can_read_collaboration(collaboration_id));

create policy read_activity_events on activity_events
  for select to authenticated
  using (case subject_type
    when 'deal' then can_read_deal(subject_id)
    else can_read_collaboration(subject_id)
  end);

create policy insert_activity_events on activity_events
  for insert to authenticated
  with check (case subject_type
    when 'deal' then can_read_deal(subject_id)
    else can_read_collaboration(subject_id)
  end);

-- Each side drives its own half of the execution flow: the creator submits work,
-- the brand reviews, confirms delivery, and rates.
create function enforce_collaboration_actor_scope() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_brand   boolean := owns_brand(new.brand_id);
  is_creator boolean := owns_creator(new.creator_id);
begin
  -- Neither side owns this row: the service role or another privileged caller is
  -- correcting data, and these party-scoped rules do not apply to it.
  if not is_brand and not is_creator then
    return new;
  end if;

  if new.status is distinct from old.status then
    if is_creator and not is_brand and new.status <> 'in_review' then
      raise exception 'a creator may only submit content for review';
    end if;
    if is_brand and new.status = 'in_review' then
      raise exception 'only the creator may submit content for review';
    end if;
  end if;

  if new.rating is distinct from old.rating and is_creator and not is_brand then
    raise exception 'only the brand may rate a collaboration';
  end if;

  if new.amount is distinct from old.amount then
    raise exception 'the agreed amount is fixed at contract signing';
  end if;

  return new;
end;
$$;

create trigger collaborations_enforce_actor_scope
  before update on collaborations
  for each row execute function enforce_collaboration_actor_scope();
