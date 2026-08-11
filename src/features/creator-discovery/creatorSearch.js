import { creators, filterOptions } from "./data/creators.js";

const normalize = (value) => value.toLowerCase().replaceAll("&", "and");

const aliases = {
  language: { Bhojpuri: ["bhojpuri"], Marathi: ["marathi"], Tamil: ["tamil"], Punjabi: ["punjabi"], Hindi: ["hindi"] },
  state: { Bihar: ["bihar"], Maharashtra: ["maharashtra"], "Tamil Nadu": ["tamil nadu"], Punjab: ["punjab", "punjabi"] },
  district: Object.fromEntries(filterOptions.district.map((value) => [value, [value.toLowerCase()]])),
  niche: {
    "Food & Culture": ["food", "recipe", "cooking", "culture"],
    "Home & Living": ["home", "living", "decor", "household"],
    Beauty: ["beauty", "skincare", "makeup"], Lifestyle: ["lifestyle"], Travel: ["travel", "tourism"],
    Agriculture: ["agriculture", "farming", "kheti"], Fitness: ["fitness", "wellness", "workout"],
  },
};

export const emptyFilters = Object.fromEntries(Object.keys(filterOptions).map((key) => [key, ""]));

export function parseCampaignQuery(value) {
  const query = normalize(value);
  const parsed = {};

  Object.entries(aliases).forEach(([key, choices]) => {
    const match = Object.entries(choices).find(([, terms]) => terms.some((term) => query.includes(term)));
    if (match) parsed[key] = match[0];
  });

  if (/under\s*(?:₹|rs\.?|inr)?\s*20\s*k|budget.{0,8}20\s*k/.test(query)) parsed.budget = "Up to ₹20K";
  else if (/under\s*(?:₹|rs\.?|inr)?\s*30\s*k|budget.{0,8}30\s*k/.test(query)) parsed.budget = "Up to ₹30K";
  else if (/under\s*(?:₹|rs\.?|inr)?\s*40\s*k|budget.{0,8}40\s*k/.test(query)) parsed.budget = "Up to ₹40K";
  else if (/40\s*k\s*\+|above\s*(?:₹|rs\.?|inr)?\s*40\s*k/.test(query)) parsed.budget = "₹40K+";

  if (/under\s*50\s*k|less than\s*50\s*k/.test(query)) parsed.audience = "Under 50K";
  else if (/50\s*k\s*(?:-|–|to)\s*100\s*k|between\s*50\s*k/.test(query)) parsed.audience = "50K–100K";
  else if (/100\s*k\s*\+|above\s*100\s*k/.test(query)) parsed.audience = "100K+";

  if (/90\s*\+|quality.{0,8}90/.test(query)) parsed.quality = "90+ quality";
  else if (/85\s*\+|high quality|quality.{0,8}85/.test(query)) parsed.quality = "85+ quality";
  else if (/80\s*\+|quality.{0,8}80/.test(query)) parsed.quality = "80+ quality";
  return parsed;
}

function fits(creator, key, value) {
  if (!value) return true;
  if (key === "language") return creator.languages.includes(value);
  if (["state", "district", "niche"].includes(key)) return creator[key] === value;
  if (key === "audience") {
    if (value === "Under 50K") return creator.audience < 50000;
    if (value === "50K–100K") return creator.audience >= 50000 && creator.audience <= 100000;
    return creator.audience > 100000;
  }
  if (key === "quality") return creator.quality >= Number(value.match(/\d+/)?.[0] ?? 0);
  if (key === "budget") {
    if (value === "₹40K+") return creator.rateMax > 40000;
    return creator.rateMin <= Number(value.match(/\d+/)?.[0] ?? 0) * 1000;
  }
  return true;
}

function textScore(creator, query) {
  if (!query.trim()) return 0;
  const haystack = normalize([creator.name, creator.handle, ...creator.languages, creator.state, creator.district, creator.niche, creator.proof].join(" "));
  const stopWords = ["creator", "creators", "campaign", "with", "under", "for", "the"];
  return normalize(query).split(/\s+/).filter((word) => word.length > 2 && !stopWords.includes(word))
    .reduce((score, word) => score + (haystack.includes(word) ? 4 : 0), 0);
}

export function getResults(filters, query, sort = "match") {
  const active = Object.entries(filters).filter(([, value]) => value);
  const isStructuredQuery = Object.keys(parseCampaignQuery(query)).length > 0;

  return creators
    .filter((creator) => active.every(([key, value]) => fits(creator, key, value)))
    .filter((creator) => !query.trim() || isStructuredQuery || textScore(creator, query) > 0)
    .map((creator) => {
      const filterFit = active.length ? active.filter(([key, value]) => fits(creator, key, value)).length / active.length : 0.72;
      const queryFit = Math.min(textScore(creator, query) / 16, 1);
      const match = Math.min(99, Math.round(42 + filterFit * 32 + creator.quality * 0.16 + creator.localReach * 0.08 + queryFit * 6));
      return { ...creator, match };
    })
    .sort((a, b) => sort === "quality" ? b.quality - a.quality : sort === "audience" ? b.audience - a.audience : b.match - a.match);
}

export const formatAudience = (value) => value >= 100000 ? `${(value / 100000).toFixed(1)}L` : `${Math.round(value / 1000)}K`;
export const formatRate = (value) => `₹${Math.round(value / 1000)}K`;
