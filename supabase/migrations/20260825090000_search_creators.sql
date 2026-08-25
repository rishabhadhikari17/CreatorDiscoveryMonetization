-- Ad-hoc creator discovery ranking, adapted from 0009_search_creators.sql.
-- Keeps campaign and browse ranking on one weighted-score implementation.

begin;

create or replace function fit_weighted_score(
  f_quality      integer,
  f_location     integer,
  f_relevance    integer,
  f_availability integer,
  f_budget       integer
) returns integer
language sql
stable
as $$
  select round(sum(
    weight * case factor
      when 'quality'      then f_quality
      when 'location'     then f_location
      when 'relevance'    then f_relevance
      when 'availability' then f_availability
      when 'budget'       then f_budget
    end / 100.0
  ))::integer
  from fit_weights;
$$;

comment on function fit_weighted_score(integer, integer, integer, integer, integer) is
  'The published campaign-fit formula shared by campaign_fit() and search_creators().';

-- Preserve the existing default so two-argument campaign_fit() callers remain valid.
create or replace function campaign_fit(
  p_creator_id     uuid,
  p_campaign_id    uuid,
  p_selected_count integer default 1
) returns jsonb
language plpgsql
stable
as $$
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
  v_allocation := b.budget_total::numeric / greatest(p_selected_count, 1);
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

  v_score := fit_weighted_score(
    f_quality, f_location, f_relevance, f_availability, f_budget
  );

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

create or replace function search_creators(filters jsonb)
returns table (
  creator_id       uuid,
  slug             text,
  name             text,
  handle           text,
  initials         text,
  script           text,
  audience_size    integer,
  quality_score    integer,
  local_reach_pct  integer,
  engagement_rate  numeric,
  rate_min         integer,
  rate_max         integer,
  availability     text,
  proof            text,
  bio              text,
  primary_language text,
  state            text,
  district         text,
  niche            text,
  languages        text[],
  platforms        text[],
  fit_score        integer,
  fit_factors      jsonb,
  estimated_cost   integer,
  relaxed          boolean
)
language plpgsql
stable
as $$
declare
  v_state_id uuid;
  v_niche_id uuid;
  v_budget   integer;
  v_lang_ids uuid[];
  v_plat_ids uuid[];
  v_aud_min  integer;
  v_aud_max  integer;
  v_avail    text[];
  v_limit    integer;
  v_relax    boolean;
  v_slug     text;
begin
  if filters is null or jsonb_typeof(filters) <> 'object' then
    raise exception 'search_creators: filters must be a JSON object';
  end if;

  v_slug := nullif(trim(filters->>'state'), '');
  if v_slug is null then
    raise exception 'search_creators: "state" is required';
  end if;
  select states_lookup.id into v_state_id
  from states states_lookup
  where states_lookup.slug = v_slug;
  if v_state_id is null then
    raise exception 'search_creators: unknown state slug "%"', v_slug;
  end if;

  v_slug := nullif(trim(filters->>'niche'), '');
  if v_slug is null then
    raise exception 'search_creators: "niche" is required';
  end if;
  select niches_lookup.id into v_niche_id
  from niches niches_lookup
  where niches_lookup.slug = v_slug;
  if v_niche_id is null then
    raise exception 'search_creators: unknown niche slug "%"', v_slug;
  end if;

  if coalesce(filters->>'budget_per_deliverable', '') !~ '^\d+$' then
    raise exception 'search_creators: budget_per_deliverable must be whole rupees';
  end if;
  v_budget := (filters->>'budget_per_deliverable')::integer;
  if v_budget <= 0 then
    raise exception 'search_creators: budget_per_deliverable must be positive';
  end if;

  if filters ? 'languages' then
    if jsonb_typeof(filters->'languages') <> 'array' then
      raise exception 'search_creators: languages must be an array';
    end if;
    if exists (
      select 1
      from jsonb_array_elements_text(filters->'languages') requested(slug)
      where not exists (select 1 from languages l where l.slug = requested.slug)
    ) then
      raise exception 'search_creators: unknown language slug in %', filters->'languages';
    end if;
    select array_agg(l.id) into v_lang_ids
    from jsonb_array_elements_text(filters->'languages') requested(slug)
    join languages l on l.slug = requested.slug;
  end if;

  if filters ? 'platforms' then
    if jsonb_typeof(filters->'platforms') <> 'array' then
      raise exception 'search_creators: platforms must be an array';
    end if;
    if exists (
      select 1
      from jsonb_array_elements_text(filters->'platforms') requested(slug)
      where not exists (select 1 from platforms p where p.slug = requested.slug)
    ) then
      raise exception 'search_creators: unknown platform slug in %', filters->'platforms';
    end if;
    select array_agg(p.id) into v_plat_ids
    from jsonb_array_elements_text(filters->'platforms') requested(slug)
    join platforms p on p.slug = requested.slug;
  end if;

  if filters ? 'availability' then
    if jsonb_typeof(filters->'availability') <> 'array' then
      raise exception 'search_creators: availability must be an array';
    end if;
    if exists (
      select 1 from jsonb_array_elements_text(filters->'availability') requested(value)
      where requested.value not in ('this_month', 'two_weeks', 'next_month', 'limited')
    ) then
      raise exception 'search_creators: unknown availability value in %', filters->'availability';
    end if;
    select array_agg(value) into v_avail
    from jsonb_array_elements_text(filters->'availability');
  end if;

  if filters->>'audience_min' is not null then
    if (filters->>'audience_min') !~ '^\d+$' then
      raise exception 'search_creators: audience_min must be a non-negative integer';
    end if;
    v_aud_min := (filters->>'audience_min')::integer;
  end if;
  if filters->>'audience_max' is not null then
    if (filters->>'audience_max') !~ '^\d+$' then
      raise exception 'search_creators: audience_max must be a non-negative integer';
    end if;
    v_aud_max := (filters->>'audience_max')::integer;
  end if;
  if v_aud_min is not null and v_aud_max is not null and v_aud_min > v_aud_max then
    raise exception 'search_creators: audience_min cannot exceed audience_max';
  end if;

  if filters->>'limit' is not null and (filters->>'limit') !~ '^\d+$' then
    raise exception 'search_creators: limit must be a positive integer';
  end if;
  v_limit := least(greatest(coalesce((filters->>'limit')::integer, 20), 1), 50);

  if filters ? 'relax' and jsonb_typeof(filters->'relax') <> 'boolean' then
    raise exception 'search_creators: relax must be boolean';
  end if;
  v_relax := coalesce((filters->>'relax')::boolean, true);

  return query
  with scored as (
    select
      c.id,
      c.quality_score as q,
      case
        when c.state_id = v_state_id then 100
        when v_lang_ids is not null and exists (
          select 1 from creator_languages cl
          where cl.creator_id = c.id and cl.language_id = any(v_lang_ids)
        ) then 62
        else 34
      end as loc,
      case
        when c.niche_id = v_niche_id then 100
        when exists (
          select 1 from niche_relations nr
          where nr.niche_id = v_niche_id and nr.related_niche_id = c.niche_id
        ) then 70
        else 42
      end as rel,
      availability_score(c.availability) as av,
      estimate_creator_cost(c.id, 1) as est
    from creators c
    where c.state_id = v_state_id
      and (v_aud_min is null or c.audience_size >= v_aud_min)
      and (v_aud_max is null or c.audience_size <= v_aud_max)
      and (v_lang_ids is null or exists (
        select 1 from creator_languages cl
        where cl.creator_id = c.id and cl.language_id = any(v_lang_ids)
      ))
      and (v_plat_ids is null or exists (
        select 1 from creator_platforms cp
        where cp.creator_id = c.id and cp.platform_id = any(v_plat_ids)
      ))
      and (v_avail is null or c.availability::text = any(v_avail))
  ),
  strict_rows as (
    select
      scored.*,
      case
        when scored.est <= v_budget then 100
        else greatest(25, round(v_budget::numeric / scored.est * 100)::integer)
      end as bud,
      false as was_relaxed
    from scored
    where scored.est <= v_budget * 1.5
  ),
  relaxed_rows as (
    select
      c.id,
      c.quality_score as q,
      100 as loc,
      case
        when c.niche_id = v_niche_id then 100
        when exists (
          select 1 from niche_relations nr
          where nr.niche_id = v_niche_id and nr.related_niche_id = c.niche_id
        ) then 70
        else 42
      end as rel,
      availability_score(c.availability) as av,
      estimate_creator_cost(c.id, 1) as est,
      case
        when estimate_creator_cost(c.id, 1) <= v_budget then 100
        else greatest(25, round(
          v_budget::numeric / estimate_creator_cost(c.id, 1) * 100
        )::integer)
      end as bud,
      true as was_relaxed
    from creators c
    where c.state_id = v_state_id
      and estimate_creator_cost(c.id, 1) <= v_budget * 1.5
  ),
  final as (
    select * from strict_rows
    union all
    select * from relaxed_rows
    where v_relax and not exists (select 1 from strict_rows)
  )
  select
    d.id,
    d.slug,
    d.name,
    d.handle,
    d.initials,
    d.script,
    d.audience_size,
    d.quality_score,
    d.local_reach_pct,
    d.engagement_rate,
    d.rate_min,
    d.rate_max,
    d.availability::text,
    d.proof,
    d.bio,
    d.primary_language,
    d.state,
    d.district,
    d.niche,
    d.languages,
    d.platforms,
    fit_weighted_score(final.q, final.loc, final.rel, final.av, final.bud),
    jsonb_build_object(
      'quality', final.q,
      'location', final.loc,
      'relevance', final.rel,
      'availability', final.av,
      'budget', final.bud
    ),
    final.est,
    final.was_relaxed
  from final
  join creator_directory d on d.id = final.id
  order by fit_weighted_score(final.q, final.loc, final.rel, final.av, final.bud) desc,
    d.quality_score desc,
    d.name asc
  limit v_limit;
end;
$$;

comment on function search_creators(jsonb) is
  'Ad-hoc creator discovery using the same factor shape and weights as campaign_fit().';

revoke execute on function fit_weighted_score(integer, integer, integer, integer, integer) from public;
revoke execute on function search_creators(jsonb) from public;
grant execute on function fit_weighted_score(integer, integer, integer, integer, integer) to authenticated;
grant execute on function search_creators(jsonb) to authenticated;

commit;
