-- Read models for the pages that currently render hand-written fixtures
-- (brandDashboardData.js, creatorDashboardData.js, and the discovery grid).
--
-- Every view is security_invoker, so the caller's RLS applies. Without it a view
-- runs as its owner and quietly becomes a hole straight through the policies above.

-- Discovery rows with lookups flattened, so the grid is one select rather than
-- five joins on the client.
create view creator_directory
with (security_invoker = on) as
select
  c.id,
  c.slug,
  c.name,
  c.handle,
  c.initials,
  c.script,
  c.audience_size,
  c.quality_score,
  c.local_reach_pct,
  c.engagement_rate,
  c.rate_min,
  c.rate_max,
  c.availability,
  c.proof,
  c.bio,
  l.name  as primary_language,
  s.name  as state,
  d.name  as district,
  n.name  as niche,
  coalesce(
    (select array_agg(l2.name order by l2.name)
     from creator_languages cl
     join languages l2 on l2.id = cl.language_id
     where cl.creator_id = c.id),
    '{}'
  ) as languages,
  coalesce(
    (select array_agg(p.name order by p.name)
     from creator_platforms cp
     join platforms p on p.id = cp.platform_id
     where cp.creator_id = c.id),
    '{}'
  ) as platforms
from creators c
join languages l on l.id = c.primary_language_id
join states    s on s.id = c.state_id
join districts d on d.id = c.district_id
join niches    n on n.id = c.niche_id;

-- Brand dashboard tiles: active campaigns, shortlist size, pending offers, escrow.
create view brand_dashboard_metrics
with (security_invoker = on) as
select
  b.id as brand_id,
  (select count(*) from collaborations co
    where co.brand_id = b.id and co.status <> 'completed')          as active_collaborations,
  (select count(*) from campaign_shortlist cs
     join campaigns ca on ca.id = cs.campaign_id
    where ca.brand_id = b.id)                                        as shortlisted_creators,
  (select count(*) from deals d
    where d.brand_id = b.id and d.status in ('sent', 'countered'))   as pending_offers,
  (select coalesce(sum(p.secured - p.released), 0) from payments p
     join collaborations co on co.id = p.collaboration_id
    where co.brand_id = b.id)                                        as escrow_outstanding
from brands b;

-- Creator dashboard tiles, mirroring the brand side.
create view creator_dashboard_metrics
with (security_invoker = on) as
select
  c.id as creator_id,
  (select count(*) from deals d
    where d.creator_id = c.id and d.status in ('sent', 'countered'))  as open_offers,
  (select count(*) from collaborations co
    where co.creator_id = c.id and co.status <> 'completed')          as active_collaborations,
  (select count(*) from collaborations co
    where co.creator_id = c.id and co.status = 'completed')           as completed_collaborations,
  (select coalesce(sum(p.released), 0) from payments p
     join collaborations co on co.id = p.collaboration_id
    where co.creator_id = c.id)                                       as total_earned
from creators c;

-- The earnings bar chart. Attributed to the month the payment was released, not the
-- month the campaign ran — that is what the creator actually banked.
create view creator_monthly_earnings
with (security_invoker = on) as
select
  co.creator_id,
  date_trunc('month', p.updated_at)::date as month,
  sum(p.released)                          as amount
from payments p
join collaborations co on co.id = p.collaboration_id
where p.status = 'released' and p.released > 0
group by co.creator_id, date_trunc('month', p.updated_at);

-- Offer list rows for both inboxes, with the fair-band verdict already resolved.
create view deal_summary
with (security_invoker = on) as
select
  d.id,
  d.slug,
  d.brand_id,
  d.creator_id,
  b.name        as brand_name,
  b.initials    as brand_initials,
  cr.name       as creator_name,
  d.campaign_name,
  d.amount,
  d.fair_min,
  d.fair_max,
  d.status,
  d.sent_at,
  d.respond_by,
  d.counter_amount,
  offer_position(d.amount, d.fair_min, d.fair_max) as band_position,
  (select count(*) from deal_deliverables dd where dd.deal_id = d.id) as deliverable_count
from deals d
join brands   b  on b.id = d.brand_id
join creators cr on cr.id = d.creator_id;
