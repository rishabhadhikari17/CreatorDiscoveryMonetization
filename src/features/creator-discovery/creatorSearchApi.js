import { isSupabaseConfigured, supabase } from "../../lib/supabase.js";
import {
  availabilityOptions,
  fallbackFitWeights,
  fallbackReferenceData,
} from "./data/searchReferenceFallback.js";
import {
  fallbackSearchCreators,
  formatAvailability,
  toSearchPayload,
} from "./creatorSearch.js";

const localNotice = "Using the local demo dataset until Supabase is configured and signed in.";

async function hasSession() {
  if (!supabase) return false;
  const { data, error } = await supabase.auth.getSession();
  if (error) return false;
  return Boolean(data.session);
}

function mapCreator(row) {
  return {
    id: row.slug,
    creatorId: row.creator_id,
    name: row.name,
    handle: row.handle,
    initials: row.initials,
    script: row.script,
    audience: row.audience_size,
    quality: row.quality_score,
    localReach: row.local_reach_pct,
    engagement: Number(row.engagement_rate),
    rateMin: row.rate_min,
    rateMax: row.rate_max,
    availability: formatAvailability(row.availability),
    proof: row.proof,
    bio: row.bio,
    language: row.primary_language,
    state: row.state,
    district: row.district,
    niche: row.niche,
    languages: row.languages ?? [],
    platforms: row.platforms ?? [],
    match: row.fit_score,
    fitFactors: row.fit_factors,
    estimatedCost: row.estimated_cost,
    relaxed: row.relaxed,
  };
}

export async function loadSearchConfiguration() {
  if (!isSupabaseConfigured || !(await hasSession())) {
    return {
      referenceData: fallbackReferenceData,
      availability: availabilityOptions,
      weights: fallbackFitWeights,
      notice: localNotice,
    };
  }

  try {
    const [states, languages, niches, platforms, weights] = await Promise.all([
      supabase.from("states").select("slug, name").order("name"),
      supabase.from("languages").select("slug, name").order("name"),
      supabase.from("niches").select("slug, name").order("name"),
      supabase.from("platforms").select("slug, name").order("name"),
      supabase.from("fit_weights").select("factor, weight"),
    ]);
    const failed = [states, languages, niches, platforms, weights].find(({ error }) => error);
    if (failed) throw failed.error;
    if (!states.data.length || !niches.data.length || !weights.data.length) {
      throw new Error("Reference tables returned no rows for the current session.");
    }
    return {
      referenceData: {
        states: states.data,
        languages: languages.data,
        niches: niches.data,
        platforms: platforms.data,
      },
      availability: availabilityOptions,
      weights: weights.data,
      notice: "",
    };
  } catch (error) {
    return {
      referenceData: fallbackReferenceData,
      availability: availabilityOptions,
      weights: fallbackFitWeights,
      notice: `Reference data is using the local fallback. ${error.message}`,
    };
  }
}

export async function searchCreators(filters) {
  const payload = toSearchPayload(filters);

  if (!isSupabaseConfigured || !(await hasSession())) {
    return {
      creators: fallbackSearchCreators(payload).map(mapCreator),
      notice: localNotice,
    };
  }

  try {
    const { data, error } = await supabase.rpc("search_creators", { filters: payload });
    if (error) throw error;
    return { creators: data.map(mapCreator), notice: "" };
  } catch (error) {
    return {
      creators: fallbackSearchCreators(payload).map(mapCreator),
      notice: `Live search was unavailable; local demo results are shown. ${error.message}`,
    };
  }
}
