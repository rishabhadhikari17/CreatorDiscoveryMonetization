-- Run after `npx supabase db reset`.

-- Regression: must return zero rows.
with team as (
  select campaign_id, count(*) n
  from campaign_shortlist
  group by campaign_id
)
select
  cs.campaign_id,
  cs.creator_id,
  cs.fit_score,
  (campaign_fit(cs.creator_id, cs.campaign_id, team.n::integer)->>'score')::integer as live
from campaign_shortlist cs
join team on team.campaign_id = cs.campaign_id
where cs.fit_score <>
  (campaign_fit(cs.creator_id, cs.campaign_id, team.n::integer)->>'score')::integer;

-- Smoke test: rows must be in descending fit_score order with five factors.
select name, district, fit_score, fit_factors, estimated_cost, relaxed
from search_creators('{
  "state": "bihar",
  "niche": "food-culture",
  "budget_per_deliverable": 12000
}'::jsonb);
