import { creators } from "./data/creators.js";
import {
  availabilityOptions,
  fallbackFitWeights,
  fallbackReferenceData,
} from "./data/searchReferenceFallback.js";

export const emptySearchFilters = {
  state: "",
  niche: "",
  budget_per_deliverable: "",
  languages: [],
  platforms: [],
  audience_min: "",
  audience_max: "",
  availability: [],
  limit: 20,
  relax: true,
};

const normalize = (value) => value.toLowerCase().replaceAll("&", "and");

const nicheAliases = {
  "food-culture": ["food", "recipe", "cooking", "culture"],
  "home-living": ["home", "living", "decor", "household"],
  beauty: ["beauty", "skincare", "makeup"],
  lifestyle: ["lifestyle"],
  travel: ["travel", "tourism"],
  agriculture: ["agriculture", "farming", "kheti"],
  fitness: ["fitness", "wellness", "workout"],
};

const relatedNiches = {
  "food-culture": ["home-living", "agriculture", "lifestyle"],
  "home-living": ["food-culture", "lifestyle", "beauty"],
  beauty: ["lifestyle", "home-living", "fitness"],
  lifestyle: ["beauty", "travel", "fitness", "home-living", "food-culture"],
  travel: ["lifestyle", "food-culture"],
  agriculture: ["food-culture", "home-living"],
  fitness: ["lifestyle", "beauty"],
};

const languageStateDefaults = { bhojpuri: "bihar", marathi: "maharashtra", tamil: "tamil-nadu", punjabi: "punjab" };
const availabilityByName = Object.fromEntries(availabilityOptions.map(({ slug, name }) => [name, slug]));
const availabilityScores = { this_month: 100, two_weeks: 88, next_month: 68, limited: 48 };

function findMention(query, options) {
  return [...options]
    .sort((a, b) => b.name.length - a.name.length)
    .find(({ slug, name }) => query.includes(normalize(name)) || query.includes(slug));
}

export function parseCampaignQuery(value, referenceData = fallbackReferenceData) {
  const query = normalize(value);
  const parsed = {};
  const state = findMention(query, referenceData.states);
  const language = findMention(query, referenceData.languages);
  const niche = Object.entries(nicheAliases).find(([, terms]) => terms.some((term) => query.includes(term)));

  if (state) parsed.state = state.slug;
  if (language) {
    parsed.languages = [language.slug];
    if (!state && languageStateDefaults[language.slug]) parsed.state = languageStateDefaults[language.slug];
  }
  if (niche) parsed.niche = niche[0];

  const budgetMatch = query.match(/(?:under|below|up to|max(?:imum)?|budget(?: of)?|₹|rs\.?|inr)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k/);
  if (budgetMatch) parsed.budget_per_deliverable = Math.round(Number(budgetMatch[1]) * 1000);

  const audienceRange = query.match(/(\d+)\s*k\s*(?:-|–|to)\s*(\d+)\s*k/);
  if (audienceRange) {
    parsed.audience_min = Number(audienceRange[1]) * 1000;
    parsed.audience_max = Number(audienceRange[2]) * 1000;
  } else {
    const audienceMinimum = query.match(/(?:above|over|at least)\s*(\d+)\s*k(?:\s*(?:followers|audience))?/);
    const audienceMaximum = query.match(/(?:under|below|up to)\s*(\d+)\s*k\s*(?:followers|audience)/);
    if (audienceMinimum) parsed.audience_min = Number(audienceMinimum[1]) * 1000;
    if (audienceMaximum) parsed.audience_max = Number(audienceMaximum[1]) * 1000;
  }

  return parsed;
}

export function validateSearchFilters(filters) {
  if (!filters.state || !filters.niche || filters.budget_per_deliverable === "") {
    return "Choose a state, niche, and maximum rate before searching.";
  }
  const budget = Number(filters.budget_per_deliverable);
  if (!Number.isInteger(budget) || budget <= 0) return "Maximum rate must be a positive whole number of rupees.";

  const minimum = filters.audience_min === "" ? null : Number(filters.audience_min);
  const maximum = filters.audience_max === "" ? null : Number(filters.audience_max);
  if ([minimum, maximum].some((number) => number !== null && (!Number.isInteger(number) || number < 0))) {
    return "Follower limits must be non-negative whole numbers.";
  }
  if (minimum !== null && maximum !== null && minimum > maximum) {
    return "Minimum followers cannot exceed maximum followers.";
  }
  return "";
}

export function toSearchPayload(filters) {
  const payload = {
    state: filters.state,
    niche: filters.niche,
    budget_per_deliverable: Number(filters.budget_per_deliverable),
    limit: Math.min(Math.max(Number(filters.limit) || 20, 1), 50),
    relax: filters.relax !== false,
  };
  ["languages", "platforms", "availability"].forEach((key) => {
    if (filters[key]?.length) payload[key] = filters[key];
  });
  ["audience_min", "audience_max"].forEach((key) => {
    if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
      payload[key] = Number(filters[key]);
    }
  });
  return payload;
}

function slugForName(options, name) {
  return options.find((option) => option.name === name)?.slug ?? normalize(name).replaceAll(" ", "-");
}

const roundToFiveHundred = (value) => Math.round(value / 500) * 500;

function fitScore(factors) {
  return Math.round(fallbackFitWeights.reduce(
    (score, { factor, weight }) => score + factors[factor] * weight / 100,
    0,
  ));
}

function makeFallbackRow(creator, filters) {
  const stateSlug = slugForName(fallbackReferenceData.states, creator.state);
  const nicheSlug = slugForName(fallbackReferenceData.niches, creator.niche);
  const languageSlugs = creator.languages.map((name) => slugForName(fallbackReferenceData.languages, name));
  const platformSlugs = creator.platforms.map((name) => slugForName(fallbackReferenceData.platforms, name));
  const availability = availabilityByName[creator.availability];
  const estimatedCost = roundToFiveHundred((creator.rateMin + creator.rateMax) / 2);
  const factors = {
    quality: creator.quality,
    location: 100,
    relevance: nicheSlug === filters.niche ? 100 : relatedNiches[filters.niche]?.includes(nicheSlug) ? 70 : 42,
    availability: availabilityScores[availability],
    budget: estimatedCost <= filters.budget_per_deliverable
      ? 100
      : Math.max(25, Math.round(filters.budget_per_deliverable / estimatedCost * 100)),
  };
  const strictMatch = stateSlug === filters.state
    && (!filters.languages?.length || filters.languages.some((slug) => languageSlugs.includes(slug)))
    && (!filters.platforms?.length || filters.platforms.some((slug) => platformSlugs.includes(slug)))
    && (!filters.availability?.length || filters.availability.includes(availability))
    && (filters.audience_min === undefined || creator.audience >= filters.audience_min)
    && (filters.audience_max === undefined || creator.audience <= filters.audience_max)
    && estimatedCost <= filters.budget_per_deliverable * 1.5;

  return {
    creator_id: creator.id,
    slug: creator.id,
    name: creator.name,
    handle: creator.handle,
    initials: creator.initials,
    script: creator.script,
    audience_size: creator.audience,
    quality_score: creator.quality,
    local_reach_pct: creator.localReach,
    engagement_rate: creator.engagement,
    rate_min: creator.rateMin,
    rate_max: creator.rateMax,
    availability,
    proof: creator.proof,
    bio: null,
    primary_language: creator.language,
    state: creator.state,
    district: creator.district,
    niche: creator.niche,
    languages: creator.languages,
    platforms: creator.platforms,
    fit_score: fitScore(factors),
    fit_factors: factors,
    estimated_cost: estimatedCost,
    strictMatch,
  };
}

export function fallbackSearchCreators(filters) {
  const stateName = fallbackReferenceData.states.find(({ slug }) => slug === filters.state)?.name;
  const ranked = creators
    .map((creator) => makeFallbackRow(creator, filters))
    .filter((creator) => creator.state === stateName)
    .sort((a, b) => b.fit_score - a.fit_score || b.quality_score - a.quality_score || a.name.localeCompare(b.name));
  const strictRows = ranked.filter(({ strictMatch }) => strictMatch);
  const relaxed = strictRows.length === 0 && filters.relax;
  const selected = relaxed ? ranked.filter((creator) => creator.estimated_cost <= filters.budget_per_deliverable * 1.5) : strictRows;

  return selected.slice(0, filters.limit).map((creator) => ({
    ...Object.fromEntries(Object.entries(creator).filter(([key]) => key !== "strictMatch")),
    relaxed,
  }));
}

export const formatAudience = (value) => value >= 100000 ? `${(value / 100000).toFixed(1)}L` : `${Math.round(value / 1000)}K`;
export const formatRate = (value) => `₹${Math.round(value / 1000)}K`;
export const formatAvailability = (slug) => availabilityOptions.find((option) => option.slug === slug)?.name ?? slug;
