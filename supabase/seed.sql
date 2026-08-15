-- Seed data: the reference tables the app cannot run without, plus the ten demo
-- creators and the Rooted Foods narrative currently hard-coded in src/features/**/data.
--
-- Runs as the service role, so RLS is bypassed. Each multi-row insert is a single
-- statement, which matters for the deferred weight-total constraints.

-- ============================================================== reference data

-- cohort_size is the size of the benchmarking panel for that language, not a count of
-- creators on the platform — Hindi and English have panels but no primary-language
-- creators. Languages below the first block are indexed markets with no signed
-- creators yet; they widen the discovery filters without changing any existing score.
insert into languages (slug, name, script_char, cohort_size) values
  ('bhojpuri', 'Bhojpuri', 'प', 34),
  ('marathi',  'Marathi',  'अ', 47),
  ('tamil',    'Tamil',    'க', 51),
  ('punjabi',  'Punjabi',  'ਗ', 39),
  ('hindi',    'Hindi',    'ह', 36),
  ('english',  'English',  'E', 36),
  -- indexed markets, no creators signed yet
  ('telugu',     'Telugu',     'త', 58),
  ('bengali',    'Bengali',    'ব', 49),
  ('kannada',    'Kannada',    'ಕ', 44),
  ('malayalam',  'Malayalam',  'മ', 41),
  ('gujarati',   'Gujarati',   'ગ', 37),
  ('urdu',       'Urdu',       'ا', 31),
  ('odia',       'Odia',       'ଓ', 26),
  ('rajasthani', 'Rajasthani', 'र', 24),
  ('assamese',   'Assamese',   'অ', 22),
  ('maithili',   'Maithili',   'म', 19);

-- The first four are the launch markets, where every creator currently lives. The rest
-- pair with the indexed languages above so a brief in those markets can at least be
-- composed; they have no creators yet.
insert into states (slug, name) values
  ('bihar', 'Bihar'),
  ('maharashtra', 'Maharashtra'),
  ('tamil-nadu', 'Tamil Nadu'),
  ('punjab', 'Punjab'),
  ('andhra-pradesh', 'Andhra Pradesh'),
  ('telangana', 'Telangana'),
  ('west-bengal', 'West Bengal'),
  ('karnataka', 'Karnataka'),
  ('kerala', 'Kerala'),
  ('gujarat', 'Gujarat'),
  ('odisha', 'Odisha'),
  ('rajasthan', 'Rajasthan'),
  ('assam', 'Assam');

insert into districts (state_id, slug, name)
select s.id, v.slug, v.name
from (values
  ('bihar', 'muzaffarpur', 'Muzaffarpur'),
  ('bihar', 'patna', 'Patna'),
  ('bihar', 'gaya', 'Gaya'),
  ('bihar', 'darbhanga', 'Darbhanga'),
  ('maharashtra', 'nashik', 'Nashik'),
  ('maharashtra', 'pune', 'Pune'),
  ('maharashtra', 'nagpur', 'Nagpur'),
  ('maharashtra', 'mumbai', 'Mumbai'),
  ('tamil-nadu', 'madurai', 'Madurai'),
  ('tamil-nadu', 'coimbatore', 'Coimbatore'),
  ('tamil-nadu', 'chennai', 'Chennai'),
  ('tamil-nadu', 'tiruchirappalli', 'Tiruchirappalli'),
  ('punjab', 'ludhiana', 'Ludhiana'),
  ('punjab', 'amritsar', 'Amritsar'),
  ('punjab', 'jalandhar', 'Jalandhar'),
  ('punjab', 'patiala', 'Patiala'),
  -- Madhubani joins the launch markets as the Maithili-speaking district of north Bihar.
  ('bihar', 'madhubani', 'Madhubani'),
  ('andhra-pradesh', 'visakhapatnam', 'Visakhapatnam'),
  ('andhra-pradesh', 'vijayawada', 'Vijayawada'),
  ('andhra-pradesh', 'guntur', 'Guntur'),
  ('andhra-pradesh', 'tirupati', 'Tirupati'),
  ('telangana', 'hyderabad', 'Hyderabad'),
  ('telangana', 'warangal', 'Warangal'),
  ('telangana', 'karimnagar', 'Karimnagar'),
  ('telangana', 'nizamabad', 'Nizamabad'),
  ('west-bengal', 'kolkata', 'Kolkata'),
  ('west-bengal', 'howrah', 'Howrah'),
  ('west-bengal', 'siliguri', 'Siliguri'),
  ('west-bengal', 'durgapur', 'Durgapur'),
  ('karnataka', 'bengaluru', 'Bengaluru'),
  ('karnataka', 'mysuru', 'Mysuru'),
  ('karnataka', 'hubballi', 'Hubballi'),
  ('karnataka', 'mangaluru', 'Mangaluru'),
  ('kerala', 'kochi', 'Kochi'),
  ('kerala', 'thiruvananthapuram', 'Thiruvananthapuram'),
  ('kerala', 'kozhikode', 'Kozhikode'),
  ('kerala', 'thrissur', 'Thrissur'),
  ('gujarat', 'ahmedabad', 'Ahmedabad'),
  ('gujarat', 'surat', 'Surat'),
  ('gujarat', 'vadodara', 'Vadodara'),
  ('gujarat', 'rajkot', 'Rajkot'),
  ('odisha', 'bhubaneswar', 'Bhubaneswar'),
  ('odisha', 'cuttack', 'Cuttack'),
  ('odisha', 'rourkela', 'Rourkela'),
  ('odisha', 'puri', 'Puri'),
  ('rajasthan', 'jaipur', 'Jaipur'),
  ('rajasthan', 'jodhpur', 'Jodhpur'),
  ('rajasthan', 'udaipur', 'Udaipur'),
  ('rajasthan', 'kota', 'Kota'),
  ('assam', 'guwahati', 'Guwahati'),
  ('assam', 'dibrugarh', 'Dibrugarh'),
  ('assam', 'silchar', 'Silchar'),
  ('assam', 'jorhat', 'Jorhat')
) as v(state_slug, slug, name)
join states s on s.slug = v.state_slug;

insert into niches (slug, name) values
  ('food-culture', 'Food & Culture'),
  ('home-living', 'Home & Living'),
  ('beauty', 'Beauty'),
  ('lifestyle', 'Lifestyle'),
  ('travel', 'Travel'),
  ('agriculture', 'Agriculture'),
  ('fitness', 'Fitness');

insert into niche_relations (niche_id, related_niche_id)
select a.id, b.id
from (values
  ('food-culture', 'home-living'), ('food-culture', 'agriculture'), ('food-culture', 'lifestyle'),
  ('home-living', 'food-culture'), ('home-living', 'lifestyle'), ('home-living', 'beauty'),
  ('beauty', 'lifestyle'), ('beauty', 'home-living'), ('beauty', 'fitness'),
  -- 'lifestyle' -> 'food-culture' is NOT in the original relatedNiches map, while
  -- 'food-culture' -> 'lifestyle' is. Added as the reciprocal: Lifestyle already
  -- accepts Travel, Fitness, Beauty and Home & Living, so excluding Food & Culture
  -- read as an oversight rather than a judgement. The other two one-way edges
  -- (Travel -> Food, Agriculture -> Home) are deliberate and left alone.
  ('lifestyle', 'beauty'), ('lifestyle', 'travel'), ('lifestyle', 'fitness'),
  ('lifestyle', 'home-living'), ('lifestyle', 'food-culture'),
  ('travel', 'lifestyle'), ('travel', 'food-culture'),
  ('agriculture', 'food-culture'), ('agriculture', 'home-living'),
  ('fitness', 'lifestyle'), ('fitness', 'beauty')
) as v(a_slug, b_slug)
join niches a on a.slug = v.a_slug
join niches b on b.slug = v.b_slug;

-- Platforms weighted toward where regional-language creators actually publish:
-- ShareChat and Josh matter far more in these markets than they do globally.
insert into platforms (slug, name) values
  ('instagram', 'Instagram'),
  ('youtube', 'YouTube'),
  ('moj', 'Moj'),
  ('facebook', 'Facebook'),
  ('sharechat', 'ShareChat'),
  ('josh', 'Josh'),
  ('snapchat', 'Snapchat'),
  ('x', 'X'),
  ('threads', 'Threads'),
  ('pinterest', 'Pinterest'),
  ('whatsapp-channels', 'WhatsApp Channels');

insert into usage_rights (id, label, note, multiplier, sort_order) values
  ('creator',      'Creator channels only',    'Organic post stays on the creator''s channels', 1.00, 1),
  ('brand-organic','Brand organic · 3 months', 'Brand may repost on owned social channels',     1.25, 2),
  ('paid-3',       'Paid media · 3 months',    'Includes whitelisting and paid social usage',   1.50, 3),
  ('paid-12',      'Paid media · 12 months',   'Extended paid usage across digital channels',   1.80, 4);

insert into deliverable_catalog (type, label, note, sort_order) values
  ('instagram_reel',      'Instagram Reel',      '30–60 sec vertical video',      1),
  ('story_set',           'Story set',           '3–5 story frames',              2),
  ('youtube_integration', 'YouTube integration', '60–90 sec in-video feature',    3),
  ('photo_post',          'Photo post',          'Single image or carousel',      4),
  ('photo_carousel',      'Photo carousel',      '5 edited campaign images',      5);

insert into fit_weights (factor, weight) values
  ('quality', 30), ('location', 25), ('relevance', 20), ('availability', 10), ('budget', 15);

-- ============================================================== creators

insert into creators (
  slug, name, handle, initials, script,
  primary_language_id, state_id, district_id, niche_id,
  audience_size, quality_score, local_reach_pct, engagement_rate,
  rate_min, rate_max, availability, proof, confidence, percentile, last_analysed_at
)
select
  v.slug, v.name, v.handle, v.initials, v.script,
  l.id, s.id, d.id, n.id,
  v.audience, v.quality, v.local_reach, v.engagement,
  v.rate_min, v.rate_max, v.availability::creator_availability, v.proof,
  case when v.audience > 100000 then 94 else 91 end,
  least(98, v.quality + 7),
  timestamptz '2026-08-08 12:00:00+05:30'
from (values
  ('priya-kumari','Priya Kumari','@priyakirasoi','PK','प','bhojpuri','bihar','muzaffarpur','food-culture',
    45200,88,76,8.4,18000,26000,'this_month',
    'Strong repeat engagement from women aged 24–34 across North Bihar.'),
  ('ananya-deshmukh','Ananya Deshmukh','@ananyagharcha','AD','अ','marathi','maharashtra','nashik','food-culture',
    63800,85,71,7.1,24000,34000,'two_weeks',
    'High-intent recipe saves and dependable reach across Nashik district.'),
  ('kavya-raman','Kavya Raman','@kavyavillagehome','KR','க','tamil','tamil-nadu','madurai','home-living',
    38200,91,82,9.2,20000,30000,'this_month',
    'Exceptional comment depth and a concentrated household audience in Madurai.'),
  ('gurpreet-singh','Gurpreet Singh','@pinddiyanbaatan','GS','ਗ','punjabi','punjab','ludhiana','lifestyle',
    118000,78,68,5.9,36000,48000,'limited',
    'Broad Punjab reach with strong response to local lifestyle recommendations.'),
  ('neha-jha','Neha Jha','@nehasajawat','NJ','न','bhojpuri','bihar','patna','home-living',
    28400,83,72,8.8,14000,21000,'this_month',
    'Trusted by young homemakers; regional-language comments are consistently specific.'),
  ('meera-selvam','Meera Selvam','@meeramanvasanai','MS','ம','tamil','tamil-nadu','coimbatore','beauty',
    74600,86,77,7.6,28000,39000,'two_weeks',
    'Strong product-question intent and above-cohort trust among Tamil audiences.'),
  ('rohan-patil','Rohan Patil','@rohanontheroad','RP','र','marathi','maharashtra','pune','travel',
    156000,80,66,6.2,42000,58000,'next_month',
    'Useful itinerary content drives saves and repeat discovery across Maharashtra.'),
  ('simran-kaur','Simran Kaur','@simranstylespunjab','SK','ਸ','punjabi','punjab','amritsar','beauty',
    52200,89,80,8.1,23000,32000,'this_month',
    'Authentic product conversations and a highly concentrated Amritsar audience.'),
  ('vivek-yadav','Vivek Yadav','@vivekkheti','VY','व','bhojpuri','bihar','gaya','agriculture',
    86500,84,85,7.9,26000,37000,'this_month',
    'Deep, practical comment threads with farming communities across South Bihar.'),
  ('divya-joshi','Divya Joshi','@divyafitlocal','DJ','द','marathi','maharashtra','nagpur','fitness',
    33400,82,69,8.6,16000,24000,'two_weeks',
    'Consistent challenge participation and strong repeat-viewer behaviour in Vidarbha.')
) as v(slug, name, handle, initials, script, lang_slug, state_slug, district_slug, niche_slug,
       audience, quality, local_reach, engagement, rate_min, rate_max, availability, proof)
join languages l on l.slug = v.lang_slug
join states    s on s.slug = v.state_slug
join districts d on d.slug = v.district_slug
join niches    n on n.slug = v.niche_slug;

-- Primary language link, derived so it can never drift from creators.primary_language_id.
insert into creator_languages (creator_id, language_id, is_primary)
select id, primary_language_id, true from creators;

insert into creator_languages (creator_id, language_id, is_primary)
select c.id, l.id, false
from (values
  ('priya-kumari', 'hindi'), ('ananya-deshmukh', 'hindi'), ('kavya-raman', 'english'),
  ('gurpreet-singh', 'hindi'), ('neha-jha', 'hindi'), ('rohan-patil', 'hindi'),
  ('simran-kaur', 'hindi'), ('vivek-yadav', 'hindi'), ('divya-joshi', 'hindi')
) as v(creator_slug, lang_slug)
join creators  c on c.slug = v.creator_slug
join languages l on l.slug = v.lang_slug;

insert into creator_platforms (creator_id, platform_id)
select c.id, p.id
from (values
  ('priya-kumari','instagram'), ('priya-kumari','youtube'),
  ('ananya-deshmukh','instagram'), ('ananya-deshmukh','youtube'),
  ('kavya-raman','instagram'), ('kavya-raman','youtube'),
  ('gurpreet-singh','instagram'), ('gurpreet-singh','youtube'),
  ('neha-jha','instagram'), ('neha-jha','moj'),
  ('meera-selvam','instagram'), ('meera-selvam','youtube'),
  ('rohan-patil','instagram'), ('rohan-patil','youtube'),
  ('simran-kaur','instagram'), ('simran-kaur','youtube'),
  ('vivek-yadav','youtube'), ('vivek-yadav','facebook'),
  ('divya-joshi','instagram'), ('divya-joshi','youtube')
) as v(creator_slug, platform_slug)
join creators  c on c.slug = v.creator_slug
join platforms p on p.slug = v.platform_slug;

-- ============================================================== score components
-- Same clamp and same arithmetic as buildComponents() in creatorProfiles.js, so the
-- seeded scores match what the prototype displayed.

insert into creator_score_components (creator_id, key, weight, score, label, description, evidence)
select c.id, k.key, k.weight,
  greatest(58, least(97, k.raw))::integer,
  k.label, k.description, k.evidence
from creators c
join states s on s.id = c.state_id
join districts d on d.id = c.district_id
join languages l on l.id = c.primary_language_id
cross join lateral (values
  ('authenticity'::score_component_key, 25, c.quality_score + 3,
   'Audience authenticity',
   'How much of the audience behaves like real, consistently interested people.',
   format('%s%% suspicious activity—lower than the %s cohort average.',
          to_char(greatest(1.8, 5.8 - c.engagement_rate / 2), 'FM90.9'), l.name)),
  ('depth', 20, round(c.quality_score - 2 + c.engagement_rate / 3)::integer,
   'Engagement depth',
   'The quality of conversations, saves, shares, and repeat interactions.',
   format('%s%% engagement with meaningful replies and saves above the cohort median.',
          to_char(c.engagement_rate, 'FM90.9'))),
  ('locality', 25, c.local_reach_pct + 8,
   'Regional relevance',
   'How strongly the audience is concentrated in the creator''s real local market.',
   format('%s%% of active viewers are from %s, led by %s.', c.local_reach_pct, s.name, d.name)),
  ('trust', 15, c.quality_score - 1,
   'Community trust',
   'Signals of repeat attention and confidence in the creator''s recommendations.',
   format('%s%% repeat-viewer rate with frequent product and recommendation questions.',
          round(c.quality_score * 0.61)::integer)),
  ('intent', 15, c.quality_score - 5,
   'Conversion intent',
   'Evidence that attention can translate into consideration or action.',
   format('%s× cohort-average saves on recommendation-led content.',
          to_char(greatest(1.4, c.engagement_rate / 3.4), 'FM90.9')))
) as k(key, weight, raw, label, description, evidence);

-- ============================================================== audience breakdown

-- Region mix, generated from each creator's OWN district. The original fixture in
-- creatorProfiles.js keyed this by state, which meant every creator in a state got an
-- identical chart — so Neha Jha (Patna) led with Muzaffarpur while her locality
-- evidence read "led by Patna". Leading with the home district makes the chart and the
-- evidence sentence agree. The guarded copy at the end of this file fills in any
-- creators inserted after this point.
insert into creator_audience_breakdown (creator_id, dimension, bucket_label, percent, sort_order)
select c.id, 'region', b.bucket, b.percent, b.ord
from creators c
join districts home on home.id = c.district_id
join states s on s.id = c.state_id
cross join lateral (
  select home.name as bucket, 31 as percent, 1 as ord
  union all
  select other.name, w.pct, w.ord
  from (
    select d2.name, row_number() over (order by d2.name) as rn
    from districts d2 where d2.state_id = c.state_id and d2.id <> c.district_id
  ) other
  join (values (1, 24, 2), (2, 18, 3), (3, 11, 4)) as w(rn, pct, ord) on w.rn = other.rn
  union all
  select 'Other ' || s.name, 16, 5
) b
where not exists (
  select 1 from creator_audience_breakdown ab
  where ab.creator_id = c.id and ab.dimension = 'region'
);

-- Two-language creators split 72/23/5; single-language creators 91/6/3.
insert into creator_audience_breakdown (creator_id, dimension, bucket_label, percent, sort_order)
select c.id, 'language', b.bucket, b.percent, b.sort_order
from creators c
join languages pl on pl.id = c.primary_language_id
cross join lateral (
  select count(*) as lang_count from creator_languages cl where cl.creator_id = c.id
) lc
left join lateral (
  select l.name from creator_languages cl
  join languages l on l.id = cl.language_id
  where cl.creator_id = c.id and not cl.is_primary
  limit 1
) sec on true
cross join lateral (values
  (pl.name, case when lc.lang_count = 1 then 91 else 72 end, 1),
  (coalesce(sec.name, 'English'), case when lc.lang_count = 1 then 6 else 23 end, 2),
  ('Other', case when lc.lang_count = 1 then 3 else 5 end, 3)
) as b(bucket, percent, sort_order);

insert into creator_audience_breakdown (creator_id, dimension, bucket_label, percent, sort_order)
select c.id, 'gender', b.bucket, b.percent, b.sort_order
from creators c
join niches n on n.id = c.niche_id
cross join lateral (values
  ('Women', case when n.slug in ('beauty', 'home-living') then 73 else 62 end, 1),
  ('Men',   case when n.slug in ('beauty', 'home-living') then 25 else 36 end, 2),
  ('Other / unknown', 2, 3)
) as b(bucket, percent, sort_order);

insert into creator_audience_breakdown (creator_id, dimension, bucket_label, percent, sort_order)
select c.id, 'age', b.bucket, b.percent, b.sort_order
from creators c
cross join (values ('18–24', 22, 1), ('25–34', 46, 2), ('35–44', 23, 3), ('45+', 9, 4))
  as b(bucket, percent, sort_order);

-- ============================================================== demo accounts
-- Two confirmed email/password users so the prototype has both sides of the
-- marketplace. Local development only — never run this seed against production.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'brand@vaani.test',
   extensions.crypt('demo-password', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'priya@vaani.test',
   extensions.crypt('demo-password', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select u.id, u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email in ('brand@vaani.test', 'priya@vaani.test');

insert into profiles (id, role, display_name, avatar_initials) values
  ('11111111-1111-1111-1111-111111111111', 'brand',   'Ananya Mehta', 'AM'),
  ('22222222-2222-2222-2222-222222222222', 'creator', 'Priya Kumari', 'PK');

update creators set profile_id = '22222222-2222-2222-2222-222222222222' where slug = 'priya-kumari';

insert into brands (id, owner_profile_id, slug, name, initials, category, contact_name, contact_title, verified)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'rooted-foods', 'Rooted Foods', 'RF', 'Packaged foods',
  'Ananya Mehta', 'Brand Partnerships', true
);

-- --- additional brand accounts ---
-- One login per brand. Each brand's contact person from creatorOffers.js /
-- creatorProfiles.js becomes a real account, so owns_brand() isolation is exercised
-- by genuinely distinct owners rather than one profile holding the whole portfolio.
-- All use the same demo password; local development only.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
)
select '00000000-0000-0000-0000-000000000000', v.id::uuid, 'authenticated', 'authenticated',
  v.email, extensions.crypt('demo-password', extensions.gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
from (values
  ('b1000000-0000-0000-0000-000000000001', 'kavita@aashirvaad.test'),
  ('b1000000-0000-0000-0000-000000000002', 'rahul@saffola.test'),
  ('b1000000-0000-0000-0000-000000000003', 'sneha@madhursugar.test'),
  ('b1000000-0000-0000-0000-000000000004', 'vikram@prestige.test'),
  ('b1000000-0000-0000-0000-000000000005', 'divya@urbancompany.test'),
  ('b1000000-0000-0000-0000-000000000006', 'aditi@mamaearth.test'),
  ('b1000000-0000-0000-0000-000000000007', 'karan@myntra.test'),
  ('b1000000-0000-0000-0000-000000000008', 'meghna@localorigins.test')
) as v(id, email);

insert into auth.identities (id, user_id, provider_id, identity_data, provider,
                             last_sign_in_at, created_at, updated_at)
select u.id, u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where not exists (select 1 from auth.identities i where i.user_id = u.id);

insert into profiles (id, role, display_name, avatar_initials)
values
  ('b1000000-0000-0000-0000-000000000001', 'brand', 'Kavita Rao', 'KR'),
  ('b1000000-0000-0000-0000-000000000002', 'brand', 'Rahul Menon', 'RM'),
  ('b1000000-0000-0000-0000-000000000003', 'brand', 'Sneha Agarwal', 'SA'),
  ('b1000000-0000-0000-0000-000000000004', 'brand', 'Vikram Shetty', 'VS'),
  ('b1000000-0000-0000-0000-000000000005', 'brand', 'Divya Nair', 'DN'),
  ('b1000000-0000-0000-0000-000000000006', 'brand', 'Aditi Sharma', 'AS'),
  ('b1000000-0000-0000-0000-000000000007', 'brand', 'Karan Malhotra', 'KM'),
  ('b1000000-0000-0000-0000-000000000008', 'brand', 'Meghna Iyer', 'MI');

-- --- additional brands ---
-- Every brand the prototype already names somewhere: the Aashirvaad offer in
-- creatorOffers.js, and the collaboration histories in creatorProfiles.js.
insert into brands (owner_profile_id, slug, name, initials, category, contact_name, contact_title, verified)
values
  ('b1000000-0000-0000-0000-000000000001', 'aashirvaad', 'Aashirvaad', 'AA',
   'Staples & pantry', 'Kavita Rao', 'Creator Marketing', true),
  ('b1000000-0000-0000-0000-000000000002', 'saffola', 'Saffola', 'SF',
   'Edible oils & health foods', 'Rahul Menon', 'Brand Partnerships', true),
  ('b1000000-0000-0000-0000-000000000003', 'madhur-sugar', 'Madhur Sugar', 'MD',
   'Staples & pantry', 'Sneha Agarwal', 'Regional Marketing', false),
  ('b1000000-0000-0000-0000-000000000004', 'prestige', 'Prestige', 'PR',
   'Kitchen appliances', 'Vikram Shetty', 'Digital Partnerships', true),
  ('b1000000-0000-0000-0000-000000000005', 'urban-company', 'Urban Company', 'UC',
   'Home services', 'Divya Nair', 'Creator Marketing', true),
  ('b1000000-0000-0000-0000-000000000006', 'mamaearth', 'Mamaearth', 'ME',
   'Beauty & personal care', 'Aditi Sharma', 'Influencer Marketing', true),
  ('b1000000-0000-0000-0000-000000000007', 'myntra', 'Myntra', 'MY',
   'Fashion & lifestyle', 'Karan Malhotra', 'Creator Partnerships', true),
  ('b1000000-0000-0000-0000-000000000008', 'local-origins', 'Local Origins', 'LO',
   'Regional foods', 'Meghna Iyer', 'Founder', false);

-- ============================================================== demo brief

insert into campaigns (id, brand_id, name, objective, target_state_id, language_id, niche_id,
                       budget_total, start_date, end_date, status)
select '44444444-4444-4444-4444-444444444444',
       '33333333-3333-3333-3333-333333333333',
       'Bihar Breakfast Stories', 'product_consideration',
       s.id, l.id, n.id, 120000, date '2026-08-24', date '2026-09-14', 'active'
from states s, languages l, niches n
where s.slug = 'bihar' and l.slug = 'bhojpuri' and n.slug = 'food-culture';

insert into campaign_deliverables (campaign_id, type) values
  ('44444444-4444-4444-4444-444444444444', 'instagram_reel'),
  ('44444444-4444-4444-4444-444444444444', 'story_set');

insert into campaign_shortlist (campaign_id, creator_id, fit_score, fit_factors, estimated_cost)
select '44444444-4444-4444-4444-444444444444', c.id,
       (f.result ->> 'score')::integer,
       f.result -> 'factors',
       (f.result ->> 'estimated_cost')::integer
from creators c
cross join lateral (
  select campaign_fit(c.id, '44444444-4444-4444-4444-444444444444', 3) as result
) f
where c.slug in ('priya-kumari', 'neha-jha', 'vivek-yadav');

-- --- additional campaigns ---
-- Briefs for the other demo brands, named after the campaigns already referenced in
-- the collaboration histories in creatorProfiles.js. Kept separate from Bihar
-- Breakfast Stories on purpose: deliverable count drives the rate multiplier, so
-- padding that campaign would move its shortlist estimates and fit scores.
insert into campaigns (id, brand_id, name, objective, target_state_id, language_id,
                       niche_id, budget_total, start_date, end_date, status)
select v.id::uuid, b.id, v.name, v.objective::campaign_objective, s.id, l.id, n.id,
       v.budget, v.start_date::date, v.end_date::date, v.status::campaign_status
from (values
  ('c1000000-0000-0000-0000-000000000001', 'aashirvaad', 'Ghar ka Swaad',
   'product_consideration', 'bihar', 'bhojpuri', 'food-culture', 200000,
   '2026-09-01', '2026-09-30', 'active'),
  ('c1000000-0000-0000-0000-000000000002', 'mamaearth', 'Punjab Glow',
   'brand_awareness', 'punjab', 'punjabi', 'beauty', 150000,
   '2026-09-07', '2026-10-05', 'active'),
  ('c1000000-0000-0000-0000-000000000003', 'prestige', 'Everyday Kitchens',
   'product_consideration', 'tamil-nadu', 'tamil', 'home-living', 180000,
   '2026-09-14', '2026-10-12', 'draft'),
  ('c1000000-0000-0000-0000-000000000004', 'urban-company', 'Homes of Madurai',
   'local_launch', 'tamil-nadu', 'tamil', 'home-living', 90000,
   '2026-08-25', '2026-09-15', 'active'),
  ('c1000000-0000-0000-0000-000000000005', 'myntra', 'Festive Fits',
   'brand_awareness', 'maharashtra', 'marathi', 'lifestyle', 250000,
   '2026-10-05', '2026-11-02', 'draft')
) as v(id, brand_slug, name, objective, state_slug, lang_slug, niche_slug,
       budget, start_date, end_date, status)
join brands    b on b.slug = v.brand_slug
join states    s on s.slug = v.state_slug
join languages l on l.slug = v.lang_slug
join niches    n on n.slug = v.niche_slug;

insert into campaign_deliverables (campaign_id, type, note) values
  ('c1000000-0000-0000-0000-000000000001', 'instagram_reel',      '60 sec family recipe story'),
  ('c1000000-0000-0000-0000-000000000001', 'photo_carousel',      '5 edited campaign images'),
  ('c1000000-0000-0000-0000-000000000002', 'instagram_reel',      '30-45 sec routine-led vertical video'),
  ('c1000000-0000-0000-0000-000000000002', 'story_set',           'Teaser, product context, swipe-through'),
  ('c1000000-0000-0000-0000-000000000002', 'photo_post',          'Single before/after image'),
  ('c1000000-0000-0000-0000-000000000003', 'instagram_reel',      '45-60 sec kitchen demonstration'),
  ('c1000000-0000-0000-0000-000000000003', 'youtube_integration', '60-90 sec in-video feature'),
  ('c1000000-0000-0000-0000-000000000004', 'story_set',           '3 frames from a real service visit'),
  ('c1000000-0000-0000-0000-000000000004', 'photo_post',          'Single image or carousel'),
  ('c1000000-0000-0000-0000-000000000005', 'instagram_reel',      '30-60 sec festive styling video'),
  ('c1000000-0000-0000-0000-000000000005', 'story_set',           '5 story frames with product tags'),
  ('c1000000-0000-0000-0000-000000000005', 'photo_carousel',      '5 edited lookbook images');

-- --- additional shortlists ---
-- Scores come from campaign_fit() rather than being hand-written, so the snapshots
-- agree with live computation. The third column is the shortlist size the campaign
-- budget is divided across, and must match the number of rows for that campaign —
-- budget fit depends on the per-creator allocation.
insert into campaign_shortlist (campaign_id, creator_id, fit_score, fit_factors, estimated_cost)
select v.campaign_id::uuid, c.id,
       (f.r ->> 'score')::integer,
       f.r -> 'factors',
       (f.r ->> 'estimated_cost')::integer
from (values
  -- Ghar ka Swaad · Bihar · Bhojpuri · Food & Culture
  ('c1000000-0000-0000-0000-000000000001', 'priya-kumari',    3),
  ('c1000000-0000-0000-0000-000000000001', 'neha-jha',        3),
  ('c1000000-0000-0000-0000-000000000001', 'vivek-yadav',     3),
  -- Punjab Glow · Punjab · Punjabi · Beauty
  ('c1000000-0000-0000-0000-000000000002', 'simran-kaur',     2),
  ('c1000000-0000-0000-0000-000000000002', 'gurpreet-singh',  2),
  -- Everyday Kitchens · Tamil Nadu · Tamil · Home & Living
  ('c1000000-0000-0000-0000-000000000003', 'kavya-raman',     2),
  ('c1000000-0000-0000-0000-000000000003', 'meera-selvam',    2),
  -- Homes of Madurai · Tamil Nadu · Tamil · Home & Living
  ('c1000000-0000-0000-0000-000000000004', 'kavya-raman',     2),
  ('c1000000-0000-0000-0000-000000000004', 'meera-selvam',    2),
  -- Festive Fits · Maharashtra · Marathi · Lifestyle
  ('c1000000-0000-0000-0000-000000000005', 'rohan-patil',     3),
  ('c1000000-0000-0000-0000-000000000005', 'ananya-deshmukh', 3),
  ('c1000000-0000-0000-0000-000000000005', 'divya-joshi',     3)
) as v(campaign_id, creator_slug, team_size)
join creators c on c.slug = v.creator_slug
cross join lateral (
  select campaign_fit(c.id, v.campaign_id::uuid, v.team_size) as r
) f;

-- ============================================================== demo offer

insert into deals (
  id, slug, campaign_id, brand_id, creator_id,
  campaign_name, campaign_objective_text, campaign_audience_text,
  amount, fair_min, fair_max, usage_rights_id, exclusivity_text, has_exclusivity,
  payment_terms, turnaround_days, note, status, sent_at, respond_by
)
select '55555555-5555-5555-5555-555555555555', 'rooted-foods-bihar',
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333', c.id,
  'Bihar Breakfast Stories',
  'Build consideration for a new millet breakfast range through a familiar, locally rooted recipe story.',
  'Women 25-34 in Bihar',
  15000, 23000, 33500, 'creator', 'None', false,
  '50% on agreement, 50% within 15 days of publishing', 9,
  'Priya, your Bhojpuri recipe storytelling and strong Bihar audience are a close fit for this launch. We would love a warm, everyday breakfast story in your usual voice.',
  'sent', timestamptz '2026-08-11 10:42:00+05:30', timestamptz '2026-08-13 18:00:00+05:30'
from creators c where c.slug = 'priya-kumari';

insert into deal_deliverables (deal_id, type, title, detail, sort_order) values
  ('55555555-5555-5555-5555-555555555555', 'instagram_reel', '1 Instagram Reel',
   '45-60 sec recipe-led vertical video', 1),
  ('55555555-5555-5555-5555-555555555555', 'story_set', '3 Story frames',
   'Teaser, product context, and swipe-through reminder', 2);

insert into deal_milestones (deal_id, label, value_date, sort_order) values
  ('55555555-5555-5555-5555-555555555555', 'concept_approval', date '2026-08-15', 1),
  ('55555555-5555-5555-5555-555555555555', 'first_cut', date '2026-08-18', 2),
  ('55555555-5555-5555-5555-555555555555', 'publish', date '2026-08-20', 3);

insert into deal_rate_evidence (deal_id, line, sort_order) values
  ('55555555-5555-5555-5555-555555555555', '88/100 audience quality', 1),
  ('55555555-5555-5555-5555-555555555555', '76% audience concentration in Bihar', 2),
  ('55555555-5555-5555-5555-555555555555', '8.6% meaningful engagement', 3),
  ('55555555-5555-5555-5555-555555555555', 'Benchmarked against 34 Bhojpuri creators', 4);

insert into activity_events (subject_type, subject_id, actor, title, detail, created_at) values
  ('deal', '55555555-5555-5555-5555-555555555555', 'system', 'You were shortlisted',
   '96% campaign fit for Bihar Breakfast Stories', timestamptz '2026-08-11 10:34:00+05:30'),
  ('deal', '55555555-5555-5555-5555-555555555555', 'brand', 'Rooted Foods sent an offer',
   '₹15,000 for 1 Reel + 3 Story frames', timestamptz '2026-08-11 10:42:00+05:30');

-- ============================================================== demo collaboration

insert into collaborations (id, slug, source_deal_id, campaign_id, brand_id, creator_id,
                            campaign_name, campaign_objective_text, amount, status)
select '66666666-6666-6666-6666-666666666666', 'rooted-foods-monsoon-millet',
  null, '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333', c.id,
  'Monsoon Millet Mornings',
  'Show how a quick millet breakfast can still feel familiar, regional, and family-led.',
  25000, 'creating'
from creators c where c.slug = 'priya-kumari';

insert into contracts (collaboration_id, reference, signed_at, scope, usage_rights_id,
                       exclusivity_text, first_cut_date, publish_by_date, payment_terms)
values (
  '66666666-6666-6666-6666-666666666666', 'VAA-RF-0826-014',
  timestamptz '2026-08-08 15:12:00+05:30',
  array['1 Instagram Reel', '3 Story frames'], 'brand-organic', 'None',
  date '2026-08-14', date '2026-08-18',
  '50% secured at signing · 50% secured on approval'
);

insert into payments (collaboration_id, status, secured, released, reference) values
  ('66666666-6666-6666-6666-666666666666', 'escrow_funded', 25000, 0, 'DEMO-ESC-1842');

insert into activity_events (subject_type, subject_id, actor, title, detail, created_at) values
  ('collaboration', '66666666-6666-6666-6666-666666666666', 'creator', 'Priya joined the campaign',
   'Content production is now in progress', timestamptz '2026-08-08 15:10:00+05:30'),
  ('collaboration', '66666666-6666-6666-6666-666666666666', 'brand', 'Contract summary confirmed',
   'Scope, usage rights, timeline, and payment terms agreed', timestamptz '2026-08-08 15:12:00+05:30'),
  ('collaboration', '66666666-6666-6666-6666-666666666666', 'system', 'Demo escrow funded',
   '₹25,000 secured for this prototype campaign', timestamptz '2026-08-08 15:15:00+05:30');

-- --- additional collaborations ---
-- The collaboration histories from creatorProfiles.js turned into real rows, plus
-- in-flight work at every remaining status. Covers all six collaboration_status
-- values, and gives the released payments that creator_monthly_earnings needs —
-- with only the escrow-funded demo campaign, that view returns nothing.
insert into collaborations (
  id, slug, campaign_id, brand_id, creator_id, campaign_name, campaign_objective_text,
  amount, status, review_round, revision_note, rating, feedback, created_at
)
select v.id::uuid, v.slug, nullif(v.campaign_id, '')::uuid, b.id, c.id,
       v.campaign_name, v.objective, v.amount, v.status::collaboration_status,
       v.review_round, nullif(v.revision_note, ''), nullif(v.rating, 0),
       nullif(v.feedback, ''), v.created_at::timestamptz
from (values
  -- completed history
  ('c0110000-0000-0000-0000-000000000001', 'aashirvaad-ghar-ka-swaad-priya',
   'c1000000-0000-0000-0000-000000000001', 'aashirvaad', 'priya-kumari', 'Ghar ka Swaad',
   'Celebrate regional home-cooking rituals through trusted creator-led stories.',
   24000, 'completed', 1, '', 5, 'Warm, authentic storytelling that landed exactly as briefed.',
   '2026-05-04'),
  ('c0110000-0000-0000-0000-000000000002', 'saffola-local-breakfast-priya',
   '', 'saffola', 'priya-kumari', 'Local Breakfast Stories',
   'Position a daily breakfast staple inside familiar regional routines.',
   25000, 'completed', 1, '', 5, 'Delivered ahead of schedule with excellent regional detail.',
   '2026-02-03'),
  ('c0110000-0000-0000-0000-000000000003', 'madhur-chhath-recipes-priya',
   '', 'madhur-sugar', 'priya-kumari', 'Chhath Recipes',
   'Reach Bihar households during the Chhath festival with recipe-led content.',
   18000, 'completed', 2, '', 4, 'Strong festive content; minor delay on the first cut.',
   '2025-11-05'),
  ('c0110000-0000-0000-0000-000000000004', 'prestige-everyday-kitchens-kavya',
   'c1000000-0000-0000-0000-000000000003', 'prestige', 'kavya-raman', 'Everyday Kitchens',
   'Show a cookware range inside ordinary South Indian kitchens.',
   32000, 'completed', 1, '', 5, 'Exceptional kitchen demonstration and audience response.',
   '2026-06-02'),
  ('c0110000-0000-0000-0000-000000000005', 'urban-homes-madurai-kavya',
   'c1000000-0000-0000-0000-000000000004', 'urban-company', 'kavya-raman', 'Homes of Madurai',
   'Introduce home services to first-time users in a tier-two market.',
   28000, 'completed', 1, '', 4, 'Reliable delivery and good local texture.',
   '2026-03-09'),
  ('c0110000-0000-0000-0000-000000000006', 'mamaearth-punjab-glow-simran',
   'c1000000-0000-0000-0000-000000000002', 'mamaearth', 'simran-kaur', 'Punjab Glow',
   'Build awareness for a skincare range through regional beauty routines.',
   30000, 'completed', 1, '', 5, 'Best-performing creator in the Punjab Glow cohort.',
   '2026-04-06'),
  ('c0110000-0000-0000-0000-000000000007', 'myntra-festive-fits-simran',
   'c1000000-0000-0000-0000-000000000005', 'myntra', 'simran-kaur', 'Festive Fits',
   'Drive festive-season consideration through regional styling content.',
   26000, 'completed', 2, '', 4, 'Good festive styling; usage rights needed clarification.',
   '2025-10-07'),
  -- in flight
  ('c0110000-0000-0000-0000-000000000008', 'prestige-everyday-kitchens-meera',
   'c1000000-0000-0000-0000-000000000003', 'prestige', 'meera-selvam', 'Everyday Kitchens',
   'Show a cookware range inside ordinary South Indian kitchens.',
   43000, 'in_review', 1, '', 0, '', '2026-08-03'),
  ('c0110000-0000-0000-0000-000000000009', 'urban-homes-madurai-meera',
   'c1000000-0000-0000-0000-000000000004', 'urban-company', 'meera-selvam', 'Homes of Madurai',
   'Introduce home services to first-time users in a tier-two market.',
   40000, 'revision_requested', 1,
   'Please reshoot the closing frame so the service booking flow is legible on mobile.',
   0, '', '2026-08-05'),
  ('c0110000-0000-0000-0000-000000000010', 'myntra-festive-fits-divya',
   'c1000000-0000-0000-0000-000000000005', 'myntra', 'divya-joshi', 'Festive Fits',
   'Drive festive-season consideration through regional styling content.',
   31000, 'approved', 2, '', 0, '', '2026-07-28'),
  ('c0110000-0000-0000-0000-000000000011', 'myntra-festive-fits-rohan',
   'c1000000-0000-0000-0000-000000000005', 'myntra', 'rohan-patil', 'Festive Fits',
   'Drive festive-season consideration through regional styling content.',
   78000, 'delivered', 1, '', 0, '', '2026-07-20')
) as v(id, slug, campaign_id, brand_slug, creator_slug, campaign_name, objective,
       amount, status, review_round, revision_note, rating, feedback, created_at)
join brands   b on b.slug = v.brand_slug
join creators c on c.slug = v.creator_slug;

insert into contracts (collaboration_id, reference, signed_at, scope, usage_rights_id,
                       exclusivity_text, first_cut_date, publish_by_date, payment_terms)
select co.id,
  'VAA-' || b.initials || '-' || to_char(co.created_at, 'MMYY') || '-' ||
    lpad((row_number() over (order by co.created_at))::text, 3, '0'),
  co.created_at,
  case when co.amount >= 40000 then array['1 Instagram Reel', '1 YouTube integration']
       else array['1 Instagram Reel', '3 Story frames'] end,
  case when co.amount >= 30000 then 'brand-organic' else 'creator' end,
  'None',
  (co.created_at + interval '6 days')::date,
  (co.created_at + interval '12 days')::date,
  '50% secured at signing, 50% secured on approval'
from collaborations co
join brands b on b.id = co.brand_id
where co.slug <> 'rooted-foods-monsoon-millet';

insert into payments (collaboration_id, status, secured, released, reference, updated_at)
select co.id,
  case co.status when 'completed' then 'released'
                 when 'delivered' then 'release_pending'
                 else 'escrow_funded' end::payment_status,
  co.amount,
  case when co.status = 'completed' then co.amount else 0 end,
  'DEMO-ESC-' || upper(right(co.id::text, 4)),
  case when co.status = 'completed' then co.created_at + interval '24 days' else now() end
from collaborations co
where co.slug <> 'rooted-foods-monsoon-millet';

insert into content_submissions (collaboration_id, review_round, filename, note,
                                 content_type, duration, outcome, submitted_at)
select co.id, co.review_round,
  replace(lower(co.campaign_name), ' ', '-') || '-cut' || co.review_round || '.mp4',
  'Draft submitted for review. Regional voiceover included as briefed.',
  'Video, MP4', '00:48',
  case co.status when 'in_review' then 'pending'
                 when 'revision_requested' then 'revision_requested'
                 else 'approved' end::submission_outcome,
  co.created_at + interval '7 days'
from collaborations co
where co.slug <> 'rooted-foods-monsoon-millet';

insert into performance_metrics (collaboration_id, views, reach, engagement_rate,
                                 saves, shares, positive_sentiment_pct, captured_at)
select co.id,
  (co.amount * 7.4)::integer, (co.amount * 5.9)::integer,
  round(c.engagement_rate + 1.0, 2),
  (co.amount * 0.26)::integer, (co.amount * 0.11)::integer,
  least(97, 84 + (c.quality_score - 78)), co.created_at + interval '26 days'
from collaborations co
join creators c on c.id = co.creator_id
where co.status = 'completed';

insert into activity_events (subject_type, subject_id, actor, title, detail, created_at)
select 'collaboration'::activity_subject, co.id, 'system'::activity_actor, 'Campaign workspace created',
  'Accepted deal converted into an active collaboration', co.created_at
from collaborations co where co.slug <> 'rooted-foods-monsoon-millet'
union all
select 'collaboration'::activity_subject, co.id, 'creator'::activity_actor, 'Content submitted for review',
  'Review round ' || co.review_round, co.created_at + interval '7 days'
from collaborations co where co.slug <> 'rooted-foods-monsoon-millet'
union all
select 'collaboration'::activity_subject, co.id, 'system'::activity_actor, 'Demo payment released',
  to_char(co.amount, 'FM999,999') || ' rupees released to the creator',
  co.created_at + interval '24 days'
from collaborations co where co.status = 'completed';

-- --- additional deals ---
-- Offers behind the collaborations that already exist, plus live negotiations at
-- every remaining deal_status. Fair bands are computed by fair_band() rather than
-- hand-written, and the offered amount is placed deliberately below, within, or
-- above the band so deal_summary.band_position has all three values.
insert into deals (
  id, slug, campaign_id, brand_id, creator_id, campaign_name, campaign_objective_text,
  campaign_audience_text, amount, fair_min, fair_max, usage_rights_id, exclusivity_text,
  has_exclusivity, payment_terms, turnaround_days, note, status, sent_at, respond_by,
  counter_amount, counter_message, decline_reason, created_at
)
select
  v.id::uuid, v.slug, nullif(v.campaign_id, '')::uuid, b.id, c.id,
  v.campaign_name, v.objective, v.audience,
  case v.position
    when 'below'  then round_to_500((f.fb).band_min * 0.78)
    when 'above'  then round_to_500((f.fb).band_max * 1.08)
    else               round_to_500(((f.fb).band_min + (f.fb).band_max) / 2.0)
  end,
  (f.fb).band_min, (f.fb).band_max,
  v.rights, v.exclusivity_text, v.has_exclusivity,
  v.payment_terms, v.turnaround, v.note, v.status::deal_status,
  case when v.status = 'draft' then null else v.created_at::timestamptz end,
  case when v.status in ('draft', 'accepted', 'declined', 'withdrawn') then null
       else (v.created_at::timestamptz + interval '4 days') end,
  nullif(v.counter_amount, 0), nullif(v.counter_message, ''), nullif(v.decline_reason, ''),
  v.created_at::timestamptz
from (values
  -- offers behind existing completed work
  ('d0a10000-0000-0000-0000-000000000001', 'aashirvaad-ghar-ka-swaad-priya-offer',
   'c1000000-0000-0000-0000-000000000001', 'aashirvaad', 'priya-kumari', 2,
   'Ghar ka Swaad', 'Celebrate regional home-cooking rituals through trusted creator-led stories.',
   'Family food shoppers in Bihar and Jharkhand', 'within',
   'brand-organic', '14 days in packaged atta', true,
   '100% within 15 days of publishing', 16,
   'We enjoyed your recent litti-chokha series and would like to build a family recipe story around the same warmth.',
   'accepted', 0, '', '', '2026-04-28'),
  ('d0a10000-0000-0000-0000-000000000002', 'mamaearth-punjab-glow-simran-offer',
   'c1000000-0000-0000-0000-000000000002', 'mamaearth', 'simran-kaur', 3,
   'Punjab Glow', 'Build awareness for a skincare range through regional beauty routines.',
   'Women 18-34 across Punjab', 'within',
   'brand-organic', 'None', false,
   '50% on agreement, 50% within 15 days of publishing', 21,
   'Your product conversations feel genuinely useful rather than promotional, which is exactly the tone this launch needs.',
   'accepted', 0, '', '', '2026-03-30'),
  ('d0a10000-0000-0000-0000-000000000003', 'prestige-everyday-kitchens-kavya-offer',
   'c1000000-0000-0000-0000-000000000003', 'prestige', 'kavya-raman', 2,
   'Everyday Kitchens', 'Show a cookware range inside ordinary South Indian kitchens.',
   'Household decision-makers in Tamil Nadu', 'within',
   'creator', 'None', false,
   '50% on agreement, 50% within 15 days of publishing', 18,
   'The comment depth on your kitchen content is unusual, and that is what we want for a demonstration-led brief.',
   'accepted', 0, '', '', '2026-05-26'),
  -- live negotiations
  ('d0a10000-0000-0000-0000-000000000004', 'prestige-everyday-kitchens-meera-offer',
   'c1000000-0000-0000-0000-000000000003', 'prestige', 'meera-selvam', 2,
   'Everyday Kitchens', 'Show a cookware range inside ordinary South Indian kitchens.',
   'Household decision-makers in Tamil Nadu', 'below',
   'brand-organic', 'None', false,
   '50% on agreement, 50% within 15 days of publishing', 9,
   'A second creator for the same brief, focused on the Coimbatore market.',
   'sent', 0, '', '', '2026-08-11'),
  ('d0a10000-0000-0000-0000-000000000005', 'urban-homes-madurai-kavya-offer',
   'c1000000-0000-0000-0000-000000000004', 'urban-company', 'kavya-raman', 2,
   'Homes of Madurai', 'Introduce home services to first-time users in a tier-two market.',
   'First-time service users in Madurai', 'below',
   'creator', 'None', false,
   '100% within 30 days of publishing', 12,
   'A short, practical walkthrough of a real service visit in your own home.',
   'countered', 0, '', '', '2026-08-09'),
  ('d0a10000-0000-0000-0000-000000000006', 'myntra-festive-fits-rohan-offer',
   'c1000000-0000-0000-0000-000000000005', 'myntra', 'rohan-patil', 3,
   'Festive Fits', 'Drive festive-season consideration through regional styling content.',
   'Festive shoppers across Maharashtra', 'above',
   'paid-3', '30 days in fashion retail', true,
   '50% on agreement, 50% within 15 days of publishing', 25,
   'Revising the paid-usage window before we resend; the scope itself is unchanged.',
   'editing', 0, '', '', '2026-08-07'),
  ('d0a10000-0000-0000-0000-000000000007', 'myntra-festive-fits-ananya-offer',
   'c1000000-0000-0000-0000-000000000005', 'myntra', 'ananya-deshmukh', 3,
   'Festive Fits', 'Drive festive-season consideration through regional styling content.',
   'Festive shoppers across Maharashtra', 'below',
   'paid-3', 'None', false,
   '100% within 30 days of publishing', 8,
   'A styling-led take on festive dressing for the Nashik audience.',
   'declined', 0, '', '', '2026-08-02'),
  ('d0a10000-0000-0000-0000-000000000008', 'saffola-local-breakfast-neha-offer',
   '', 'saffola', 'neha-jha', 2,
   'Local Breakfast Stories', 'Position a daily breakfast staple inside familiar regional routines.',
   'Young homemakers in Bihar', 'within',
   'creator', 'None', false,
   '50% on agreement, 50% within 15 days of publishing', 14,
   'Drafting a follow-up to the Priya collaboration with a Patna-led perspective.',
   'draft', 0, '', '', '2026-08-13'),
  ('d0a10000-0000-0000-0000-000000000009', 'madhur-chhath-recipes-vivek-offer',
   '', 'madhur-sugar', 'vivek-yadav', 2,
   'Chhath Recipes', 'Reach Bihar households during the Chhath festival with recipe-led content.',
   'Farming households across South Bihar', 'above',
   'creator', 'None', false,
   '100% within 30 days of publishing', 20,
   'Withdrawn while the festive calendar is reworked. We would like to revisit this closer to the season.',
   'withdrawn', 0, '', '', '2026-07-15')
) as v(id, slug, campaign_id, brand_slug, creator_slug, deliverable_count,
       campaign_name, objective, audience, position, rights, exclusivity_text,
       has_exclusivity, payment_terms, turnaround, note, status,
       counter_amount, counter_message, decline_reason, created_at)
join brands   b on b.slug = v.brand_slug
join creators c on c.slug = v.creator_slug
cross join lateral (
  select fair_band(c.id, v.deliverable_count, v.rights, v.has_exclusivity) as fb
) f;

-- The countered and declined deals carry the creator's response.
update deals set
  counter_amount = round_to_500((fair_min + fair_max) / 2.0),
  counter_message = 'The scope is a good fit, but the 12-day window and travel to a live service visit put this above my standard single-reel rate. Meeting at the band midpoint works for me.'
where slug = 'urban-homes-madurai-kavya-offer';

update deals set
  decline_reason = 'The eight-day turnaround does not leave enough time for a styling shoot alongside my current commitments.'
where slug = 'myntra-festive-fits-ananya-offer';

-- --- deal deliverables ---
insert into deal_deliverables (deal_id, type, title, detail, sort_order)
select v.deal_id::uuid, v.type::deliverable_type, v.title, v.detail, v.sort_order
from (values
  ('d0a10000-0000-0000-0000-000000000001', 'instagram_reel', '1 Instagram Reel', '60 sec family recipe story', 1),
  ('d0a10000-0000-0000-0000-000000000001', 'photo_carousel', '1 Photo carousel', '5 edited campaign images', 2),

  ('d0a10000-0000-0000-0000-000000000002', 'instagram_reel', '1 Instagram Reel', '30-45 sec routine-led vertical video', 1),
  ('d0a10000-0000-0000-0000-000000000002', 'story_set', '3 Story frames', 'Teaser, product context, and swipe-through reminder', 2),
  ('d0a10000-0000-0000-0000-000000000002', 'photo_post', '1 Photo post', 'Single before and after image', 3),

  ('d0a10000-0000-0000-0000-000000000003', 'instagram_reel', '1 Instagram Reel', '45-60 sec kitchen demonstration', 1),
  ('d0a10000-0000-0000-0000-000000000003', 'youtube_integration', '1 YouTube integration', '60-90 sec in-video feature', 2),

  ('d0a10000-0000-0000-0000-000000000004', 'instagram_reel', '1 Instagram Reel', '45-60 sec kitchen demonstration', 1),
  ('d0a10000-0000-0000-0000-000000000004', 'youtube_integration', '1 YouTube integration', '60-90 sec in-video feature', 2),

  ('d0a10000-0000-0000-0000-000000000005', 'story_set', '3 Story frames', 'Booking, service visit, and result', 1),
  ('d0a10000-0000-0000-0000-000000000005', 'photo_post', '1 Photo post', 'Single image or carousel', 2),

  ('d0a10000-0000-0000-0000-000000000006', 'instagram_reel', '1 Instagram Reel', '30-60 sec festive styling video', 1),
  ('d0a10000-0000-0000-0000-000000000006', 'story_set', '5 Story frames', 'Story frames with product tags', 2),
  ('d0a10000-0000-0000-0000-000000000006', 'photo_carousel', '1 Photo carousel', '5 edited lookbook images', 3),

  ('d0a10000-0000-0000-0000-000000000007', 'instagram_reel', '1 Instagram Reel', '30-60 sec festive styling video', 1),
  ('d0a10000-0000-0000-0000-000000000007', 'story_set', '5 Story frames', 'Story frames with product tags', 2),
  ('d0a10000-0000-0000-0000-000000000007', 'photo_carousel', '1 Photo carousel', '5 edited lookbook images', 3),

  ('d0a10000-0000-0000-0000-000000000008', 'instagram_reel', '1 Instagram Reel', '45-60 sec breakfast routine', 1),
  ('d0a10000-0000-0000-0000-000000000008', 'story_set', '3 Story frames', 'Morning routine, product, and reminder', 2),

  ('d0a10000-0000-0000-0000-000000000009', 'instagram_reel', '1 Instagram Reel', '60 sec festive recipe story', 1),
  ('d0a10000-0000-0000-0000-000000000009', 'story_set', '3 Story frames', 'Preparation, ritual, and result', 2)
) as v(deal_id, type, title, detail, sort_order);

-- Milestones and rate evidence, generated so every deal has a complete offer rather
-- than only the original demo one.
insert into deal_milestones (deal_id, label, value_date, value_text, sort_order)
select d.id, m.label::milestone_label,
  case when d.status = 'draft' then null else (d.created_at + m.offset_days)::date end,
  case when d.status = 'draft' then 'To be agreed' else null end,
  m.sort_order
from deals d
cross join (values
  ('concept_approval', interval '5 days', 1),
  ('first_cut', interval '9 days', 2),
  ('publish', interval '14 days', 3)
) as m(label, offset_days, sort_order)
where d.slug <> 'rooted-foods-bihar';

insert into deal_rate_evidence (deal_id, line, sort_order)
select d.id, e.line, e.sort_order
from deals d
join creators c on c.id = d.creator_id
join states s on s.id = c.state_id
join languages l on l.id = c.primary_language_id
cross join lateral (values
  (c.quality_score || '/100 audience quality', 1),
  (c.local_reach_pct || '% audience concentration in ' || s.name, 2),
  (c.engagement_rate || '% meaningful engagement', 3),
  ('Benchmarked against ' || l.cohort_size || ' ' || l.name || ' creators', 4)
) as e(line, sort_order)
where d.slug <> 'rooted-foods-bihar';

insert into activity_events (subject_type, subject_id, actor, title, detail, created_at)
select 'deal'::activity_subject, d.id, 'system'::activity_actor, 'Creator shortlisted',
  c.quality_score || '/100 audience quality', d.created_at - interval '8 minutes'
from deals d join creators c on c.id = d.creator_id
where d.slug <> 'rooted-foods-bihar'
union all
select 'deal'::activity_subject, d.id, 'brand'::activity_actor,
  b.name || ' sent an offer',
  to_char(d.amount, 'FM999,999') || ' rupees for ' ||
    (select count(*) from deal_deliverables dd where dd.deal_id = d.id) || ' deliverables',
  d.created_at
from deals d join brands b on b.id = d.brand_id
where d.slug <> 'rooted-foods-bihar' and d.status <> 'draft'
union all
select 'deal'::activity_subject, d.id, 'creator'::activity_actor,
  case d.status when 'accepted' then 'Offer accepted'
                when 'countered' then 'Counter-offer sent'
                else 'Offer declined' end,
  case d.status when 'countered' then to_char(d.counter_amount, 'FM999,999') || ' rupees proposed'
                else coalesce(d.decline_reason, 'Terms agreed as offered') end,
  d.created_at + interval '1 day'
from deals d
where d.slug <> 'rooted-foods-bihar' and d.status in ('accepted', 'countered', 'declined');

-- Link the three accepted offers to the collaborations they produced, so the
-- deal-to-execution chain is traceable instead of every collaboration orphaned.
update collaborations co set source_deal_id = d.id
from deals d
where d.slug = 'aashirvaad-ghar-ka-swaad-priya-offer' and co.slug = 'aashirvaad-ghar-ka-swaad-priya';

update collaborations co set source_deal_id = d.id
from deals d
where d.slug = 'mamaearth-punjab-glow-simran-offer' and co.slug = 'mamaearth-punjab-glow-simran';

update collaborations co set source_deal_id = d.id
from deals d
where d.slug = 'prestige-everyday-kitchens-kavya-offer' and co.slug = 'prestige-everyday-kitchens-kavya';

-- --- creators for the expanded markets ---
-- One creator per newly indexed language, covering all nine new states. Urdu has no
-- paired state, so its creator sits in Hyderabad where the language is concentrated.
insert into creators (
  slug, name, handle, initials, script,
  primary_language_id, state_id, district_id, niche_id,
  audience_size, quality_score, local_reach_pct, engagement_rate,
  rate_min, rate_max, availability, proof, confidence, percentile, last_analysed_at
)
select
  v.slug, v.name, v.handle, v.initials, v.script,
  l.id, s.id, d.id, n.id,
  v.audience, v.quality, v.local_reach, v.engagement,
  v.rate_min, v.rate_max, v.availability::creator_availability, v.proof,
  case when v.audience > 100000 then 94 else 91 end,
  least(98, v.quality + 7),
  timestamptz '2026-08-14 12:00:00+05:30'
from (values
  ('sravani-reddy','Sravani Reddy','@sravanivantillu','SR','త','telugu','andhra-pradesh','visakhapatnam','food-culture',
    68400,87,74,8.2,26000,36000,'this_month',
    'Recipe saves cluster tightly around coastal Andhra households.'),
  ('harika-rao','Harika Rao','@harikaglow','HR','త','telugu','telangana','hyderabad','beauty',
    94200,84,69,7.4,32000,44000,'two_weeks',
    'High product-question intent from women across Hyderabad and Warangal.'),
  ('rupsa-ghosh','Rupsa Ghosh','@rupsarannaghor','RG','ব','bengali','west-bengal','kolkata','food-culture',
    112000,86,71,7.8,34000,46000,'this_month',
    'Festival cooking content drives repeat viewing across greater Kolkata.'),
  ('deepa-gowda','Deepa Gowda','@deepamanemane','DG','ಕ','kannada','karnataka','mysuru','home-living',
    41800,90,81,9.0,21000,31000,'this_month',
    'Deep comment threads on practical home organisation in Mysuru.'),
  ('anjali-pillai','Anjali Pillai','@anjalinaadan','AP','മ','malayalam','kerala','kochi','lifestyle',
    76500,85,73,7.2,29000,40000,'two_weeks',
    'Trusted recommendations with strong follow-through across Kerala.'),
  ('krishna-patel','Krishna Patel','@krishnafitgujarat','KP','ગ','gujarati','gujarat','surat','fitness',
    58300,81,67,8.3,22000,32000,'this_month',
    'Consistent challenge participation among working adults in south Gujarat.'),
  ('sanjay-behera','Sanjay Behera','@sanjaychasa','SB','ଓ','odia','odisha','bhubaneswar','agriculture',
    47900,83,84,7.7,19000,28000,'this_month',
    'Practical farming threads with growers across coastal Odisha.'),
  ('vikram-rathore','Vikram Rathore','@vikrammarudesh','VR','र','rajasthani','rajasthan','jodhpur','travel',
    138000,79,64,6.0,38000,52000,'next_month',
    'Desert-circuit itineraries drive saves and repeat discovery.'),
  ('bhaskar-das','Bhaskar Das','@bhaskarrandhoni','BD','অ','assamese','assam','guwahati','food-culture',
    33600,82,79,8.5,15000,23000,'two_weeks',
    'Regional cuisine content with unusually specific local comments.'),
  ('sunita-mishra','Sunita Mishra','@sunitamithila','SM','म','maithili','bihar','madhubani','home-living',
    24800,84,83,9.1,13000,20000,'this_month',
    'Mithila craft and home content trusted across Madhubani and Darbhanga.'),
  ('zoya-fatima','Zoya Fatima','@zoyadeccan','ZF','ا','urdu','telangana','hyderabad','lifestyle',
    189000,77,61,5.6,44000,60000,'limited',
    'Broad Deccan reach with strong response to local recommendations.')
) as v(slug, name, handle, initials, script, lang_slug, state_slug, district_slug, niche_slug,
       audience, quality, local_reach, engagement, rate_min, rate_max, availability, proof)
join languages l on l.slug = v.lang_slug
join states    s on s.slug = v.state_slug
join districts d on d.slug = v.district_slug
join niches    n on n.slug = v.niche_slug;

-- Primary language link, derived so it cannot drift from creators.primary_language_id.
insert into creator_languages (creator_id, language_id, is_primary)
select c.id, c.primary_language_id, true from creators c
where not exists (select 1 from creator_languages cl where cl.creator_id = c.id and cl.is_primary);

insert into creator_languages (creator_id, language_id, is_primary)
select c.id, l.id, false
from (values
  ('sravani-reddy','english'), ('harika-rao','hindi'), ('rupsa-ghosh','hindi'),
  ('deepa-gowda','english'), ('anjali-pillai','english'), ('krishna-patel','hindi'),
  ('sanjay-behera','hindi'), ('vikram-rathore','hindi'), ('bhaskar-das','hindi'),
  ('sunita-mishra','hindi'), ('zoya-fatima','hindi')
) as v(creator_slug, lang_slug)
join creators  c on c.slug = v.creator_slug
join languages l on l.slug = v.lang_slug;

insert into creator_platforms (creator_id, platform_id)
select c.id, p.id
from (values
  ('sravani-reddy','instagram'), ('sravani-reddy','youtube'),
  ('harika-rao','instagram'), ('harika-rao','youtube'),
  ('rupsa-ghosh','instagram'), ('rupsa-ghosh','facebook'),
  ('deepa-gowda','instagram'), ('deepa-gowda','youtube'),
  ('anjali-pillai','instagram'), ('anjali-pillai','youtube'),
  ('krishna-patel','instagram'), ('krishna-patel','moj'),
  ('sanjay-behera','youtube'), ('sanjay-behera','facebook'),
  ('vikram-rathore','instagram'), ('vikram-rathore','youtube'),
  ('bhaskar-das','youtube'), ('bhaskar-das','facebook'),
  ('sunita-mishra','instagram'), ('sunita-mishra','moj'),
  ('zoya-fatima','instagram'), ('zoya-fatima','youtube')
) as v(creator_slug, platform_slug)
join creators  c on c.slug = v.creator_slug
join platforms p on p.slug = v.platform_slug;

-- Score components, using the same arithmetic as the original ten.
insert into creator_score_components (creator_id, key, weight, score, label, description, evidence)
select c.id, k.key, k.weight,
  greatest(58, least(97, k.raw))::integer,
  k.label, k.description, k.evidence
from creators c
join states s on s.id = c.state_id
join districts d on d.id = c.district_id
join languages l on l.id = c.primary_language_id
cross join lateral (values
  ('authenticity'::score_component_key, 25, c.quality_score + 3,
   'Audience authenticity',
   'How much of the audience behaves like real, consistently interested people.',
   format('%s%% suspicious activity—lower than the %s cohort average.',
          to_char(greatest(1.8, 5.8 - c.engagement_rate / 2), 'FM90.9'), l.name)),
  ('depth', 20, round(c.quality_score - 2 + c.engagement_rate / 3)::integer,
   'Engagement depth',
   'The quality of conversations, saves, shares, and repeat interactions.',
   format('%s%% engagement with meaningful replies and saves above the cohort median.',
          to_char(c.engagement_rate, 'FM90.9'))),
  ('locality', 25, c.local_reach_pct + 8,
   'Regional relevance',
   'How strongly the audience is concentrated in the creator''s real local market.',
   format('%s%% of active viewers are from %s, led by %s.', c.local_reach_pct, s.name, d.name)),
  ('trust', 15, c.quality_score - 1,
   'Community trust',
   'Signals of repeat attention and confidence in the creator''s recommendations.',
   format('%s%% repeat-viewer rate with frequent product and recommendation questions.',
          round(c.quality_score * 0.61)::integer)),
  ('intent', 15, c.quality_score - 5,
   'Conversion intent',
   'Evidence that attention can translate into consideration or action.',
   format('%s× cohort-average saves on recommendation-led content.',
          to_char(greatest(1.4, c.engagement_rate / 3.4), 'FM90.9')))
) as k(key, weight, raw, label, description, evidence)
where not exists (select 1 from creator_score_components sc where sc.creator_id = c.id);

-- Region mix, generated from each creator's OWN district rather than a per-state
-- template. The creator's home district always leads, so the chart agrees with the
-- locality evidence sentence ("led by <district>") instead of contradicting it.
insert into creator_audience_breakdown (creator_id, dimension, bucket_label, percent, sort_order)
select c.id, 'region', b.bucket, b.percent, b.ord
from creators c
join districts home on home.id = c.district_id
join states s on s.id = c.state_id
cross join lateral (
  select home.name as bucket, 31 as percent, 1 as ord
  union all
  select other.name, w.pct, w.ord
  from (
    select d2.name, row_number() over (order by d2.name) as rn
    from districts d2 where d2.state_id = c.state_id and d2.id <> c.district_id
  ) other
  join (values (1, 24, 2), (2, 18, 3), (3, 11, 4)) as w(rn, pct, ord) on w.rn = other.rn
  union all
  select 'Other ' || s.name, 16, 5
) b
where not exists (
  select 1 from creator_audience_breakdown ab
  where ab.creator_id = c.id and ab.dimension = 'region'
);

insert into creator_audience_breakdown (creator_id, dimension, bucket_label, percent, sort_order)
select c.id, 'language', b.bucket, b.percent, b.ord
from creators c
join languages pl on pl.id = c.primary_language_id
join lateral (
  select l.name from creator_languages cl
  join languages l on l.id = cl.language_id
  where cl.creator_id = c.id and not cl.is_primary limit 1
) sec on true
cross join lateral (values
  (pl.name, 72, 1), (sec.name, 23, 2), ('Other', 5, 3)
) as b(bucket, percent, ord)
where not exists (
  select 1 from creator_audience_breakdown ab
  where ab.creator_id = c.id and ab.dimension = 'language'
);

insert into creator_audience_breakdown (creator_id, dimension, bucket_label, percent, sort_order)
select c.id, 'gender', b.bucket, b.percent, b.ord
from creators c
join niches n on n.id = c.niche_id
cross join lateral (values
  ('Women', case when n.slug in ('beauty', 'home-living') then 73 else 62 end, 1),
  ('Men',   case when n.slug in ('beauty', 'home-living') then 25 else 36 end, 2),
  ('Other / unknown', 2, 3)
) as b(bucket, percent, ord)
where not exists (
  select 1 from creator_audience_breakdown ab
  where ab.creator_id = c.id and ab.dimension = 'gender'
);

insert into creator_audience_breakdown (creator_id, dimension, bucket_label, percent, sort_order)
select c.id, 'age', b.bucket, b.percent, b.ord
from creators c
cross join (values ('18–24', 22, 1), ('25–34', 46, 2), ('35–44', 23, 3), ('45+', 9, 4))
  as b(bucket, percent, ord)
where not exists (
  select 1 from creator_audience_breakdown ab
  where ab.creator_id = c.id and ab.dimension = 'age'
);

-- --- secondary platform presence ---
-- Beyond each creator's two primary platforms. Assigned by where the audience for that
-- niche and language actually is: ShareChat for regional-language creators, Josh for
-- short-form fitness and beauty, Pinterest for home and food, X for travel commentary.
insert into creator_platforms (creator_id, platform_id)
select c.id, p.id
from (values
  -- ShareChat: regional-language first audiences
  ('priya-kumari','sharechat'), ('neha-jha','sharechat'), ('vivek-yadav','sharechat'),
  ('sunita-mishra','sharechat'), ('sanjay-behera','sharechat'), ('bhaskar-das','sharechat'),
  ('rupsa-ghosh','sharechat'),
  -- Josh: short-form fitness and beauty
  ('divya-joshi','josh'), ('krishna-patel','josh'), ('harika-rao','josh'), ('simran-kaur','josh'),
  -- Snapchat: younger beauty and lifestyle audiences
  ('simran-kaur','snapchat'), ('meera-selvam','snapchat'), ('harika-rao','snapchat'),
  ('anjali-pillai','snapchat'),
  -- Pinterest: home, living and recipe discovery
  ('kavya-raman','pinterest'), ('deepa-gowda','pinterest'), ('sravani-reddy','pinterest'),
  ('ananya-deshmukh','pinterest'),
  -- X: travel and lifestyle commentary
  ('rohan-patil','x'), ('vikram-rathore','x'), ('gurpreet-singh','x'), ('zoya-fatima','x'),
  -- Threads
  ('anjali-pillai','threads'), ('rupsa-ghosh','threads'), ('zoya-fatima','threads'),
  -- WhatsApp Channels: high-trust creators with direct community broadcast
  ('priya-kumari','whatsapp-channels'), ('kavya-raman','whatsapp-channels'),
  ('sunita-mishra','whatsapp-channels')
) as v(creator_slug, platform_slug)
join creators  c on c.slug = v.creator_slug
join platforms p on p.slug = v.platform_slug
where not exists (
  select 1 from creator_platforms cp
  where cp.creator_id = c.id and cp.platform_id = p.id
);
