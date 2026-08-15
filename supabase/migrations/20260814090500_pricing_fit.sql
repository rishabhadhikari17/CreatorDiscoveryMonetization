-- Pricing and campaign-fit maths, ported from dealPricing.js, counterOfferRules.js,
-- and campaignMatching.js.
--
-- These are the product's transparency promise: brand and creator are shown the same
-- fair band and the same fit score. Two implementations of the same formula will
-- eventually disagree, so this is the authority and the frontend should read from it.

-- Deliverable count multiplier: first deliverable at full weight, each additional at
-- +28%. Zero deliverables is 0 for pricing (nothing to price) but 0.8 for fit scoring
-- (an under-specified brief is penalised, not zeroed) — the two callers differ.
create function deliverable_price_factor(deliverable_count integer)
returns numeric language sql immutable as $$
  select case
    when deliverable_count <= 0 then 0
    else 1 + greatest(0, deliverable_count - 1) * 0.28
  end;
$$;

create function deliverable_fit_factor(deliverable_count integer)
returns numeric language sql immutable as $$
  select case
    when deliverable_count <= 0 then 0.8
    else 1 + greatest(0, deliverable_count - 1) * 0.28
  end;
$$;

-- ============================================================== fair band

create type fair_band_result as (
  band_min           integer,
  band_max           integer,
  multiplier         numeric,
  deliverable_factor numeric,
  rights_factor      numeric,
  exclusivity_factor numeric
);

create function fair_band(
  p_creator_id       uuid,
  p_deliverable_count integer,
  p_usage_rights_id  text,
  p_has_exclusivity  boolean
) returns fair_band_result
language plpgsql stable as $$
declare
  v_rate_min integer;
  v_rate_max integer;
  v_rights   numeric;
  v_deliv    numeric := deliverable_price_factor(p_deliverable_count);
  v_excl     numeric := case when p_has_exclusivity then 1.2 else 1 end;
  v_mult     numeric;
  result     fair_band_result;
begin
  select rate_min, rate_max into strict v_rate_min, v_rate_max
  from creators where id = p_creator_id;

  select multiplier into v_rights from usage_rights where id = p_usage_rights_id;
  -- Unknown rights id falls back to creator-channels-only (multiplier 1), matching
  -- the frontend's `?? usageRights[0]` default rather than erroring mid-negotiation.
  v_rights := coalesce(v_rights, 1);

  v_mult := v_deliv * v_rights * v_excl;

  result.band_min           := round_to_500(v_rate_min * v_mult);
  result.band_max           := round_to_500(v_rate_max * v_mult);
  result.multiplier         := v_mult;
  result.deliverable_factor := v_deliv;
  result.rights_factor      := v_rights;
  result.exclusivity_factor := v_excl;
  return result;
end;
$$;

-- 'below' | 'within' | 'above' — drives the offer badge on both sides of the deal.
create function offer_position(p_amount integer, p_fair_min integer, p_fair_max integer)
returns text language sql immutable as $$
  select case
    when p_amount < p_fair_min then 'below'
    when p_amount > p_fair_max then 'above'
    else 'within'
  end;
$$;

-- The published counter-offer rule: below band anchors at the floor plus a 10% rush
-- premium when turnaround is 10 days or fewer; within band anchors at the midpoint;
-- above band suggests no increase.
create function suggested_counter(p_deal_id uuid)
returns jsonb language plpgsql stable as $$
declare
  d             deals%rowtype;
  v_position    text;
  v_rush        integer;
  v_midpoint    integer;
  v_amount      integer;
begin
  select * into strict d from deals where id = p_deal_id;

  v_position := offer_position(d.amount, d.fair_min, d.fair_max);
  v_rush     := case when coalesce(d.turnaround_days, 999) <= 10
                     then round_to_500(d.fair_min * 0.1) else 0 end;
  v_midpoint := round_to_500((d.fair_min + d.fair_max) / 2.0);

  if v_position = 'below' then
    v_amount := least(d.fair_max, round_to_500(d.fair_min + v_rush));
  elsif v_position = 'within' then
    v_amount := greatest(d.amount, v_midpoint);
    v_rush := 0;
  else
    v_amount := d.amount;
    v_rush := 0;
  end if;

  return jsonb_build_object(
    'amount', v_amount,
    'position', v_position,
    'rush_premium', v_rush,
    'fair_min', d.fair_min,
    'fair_max', d.fair_max,
    'midpoint', v_midpoint
  );
end;
$$;

-- ============================================================== campaign fit

create function availability_score(p_availability creator_availability)
returns integer language sql immutable as $$
  select case p_availability
    when 'this_month'  then 100
    when 'two_weeks'   then 88
    when 'next_month'  then 68
    when 'limited'     then 48
  end;
$$;

create function estimate_creator_cost(p_creator_id uuid, p_deliverable_count integer)
returns integer language sql stable as $$
  select round_to_500(
    ((c.rate_min + c.rate_max) / 2.0) * deliverable_fit_factor(p_deliverable_count)
  )
  from creators c where c.id = p_creator_id;
$$;

-- Returns {score, factors, estimated_cost, allocation}. `p_selected_count` is the
-- shortlist size the budget is being split across; fit therefore moves as the team
-- grows, which is intentional and visible in the UI.
create function campaign_fit(
  p_creator_id     uuid,
  p_campaign_id    uuid,
  p_selected_count integer default 1
) returns jsonb
language plpgsql stable as $$
declare
  c                creators%rowtype;
  b                campaigns%rowtype;
  v_deliv_count    integer;
  v_estimated_cost integer;
  v_allocation     numeric;
  f_quality        integer;
  f_location       integer;
  f_relevance      integer;
  f_availability   integer;
  f_budget         integer;
  v_score          integer;
begin
  select * into strict c from creators where id = p_creator_id;
  select * into strict b from campaigns where id = p_campaign_id;

  select count(*) into v_deliv_count
  from campaign_deliverables where campaign_id = p_campaign_id;

  v_estimated_cost := estimate_creator_cost(p_creator_id, v_deliv_count);
  v_allocation     := b.budget_total::numeric / greatest(p_selected_count, 1);

  f_quality := c.quality_score;

  f_location := case
    when c.state_id = b.target_state_id then 100
    when exists (
      select 1 from creator_languages cl
      where cl.creator_id = c.id and cl.language_id = b.language_id
    ) then 62
    else 34
  end;

  f_relevance := case
    when c.niche_id = b.niche_id then 100
    when exists (
      select 1 from niche_relations nr
      where nr.niche_id = b.niche_id and nr.related_niche_id = c.niche_id
    ) then 70
    else 42
  end;

  f_availability := availability_score(c.availability);

  f_budget := case
    when v_allocation <= 0 then 50
    when v_estimated_cost <= v_allocation then 100
    else greatest(25, round(v_allocation / v_estimated_cost * 100)::integer)
  end;

  select round(sum(
    weight * case factor
      when 'quality'      then f_quality
      when 'location'     then f_location
      when 'relevance'    then f_relevance
      when 'availability' then f_availability
      when 'budget'       then f_budget
    end / 100.0
  ))::integer into v_score
  from fit_weights;

  return jsonb_build_object(
    'score', v_score,
    'factors', jsonb_build_object(
      'quality', f_quality,
      'location', f_location,
      'relevance', f_relevance,
      'availability', f_availability,
      'budget', f_budget
    ),
    'estimated_cost', v_estimated_cost,
    'allocation', round(v_allocation)
  );
end;
$$;
