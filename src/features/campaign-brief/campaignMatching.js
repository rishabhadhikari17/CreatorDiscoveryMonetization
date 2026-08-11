export const FIT_WEIGHTS = {
  quality: 30,
  location: 25,
  relevance: 20,
  availability: 10,
  budget: 15,
};

const relatedNiches = {
  "Food & Culture": ["Home & Living", "Agriculture", "Lifestyle"],
  "Home & Living": ["Food & Culture", "Lifestyle", "Beauty"],
  Beauty: ["Lifestyle", "Home & Living", "Fitness"],
  Lifestyle: ["Beauty", "Travel", "Fitness", "Home & Living"],
  Travel: ["Lifestyle", "Food & Culture"],
  Agriculture: ["Food & Culture", "Home & Living"],
  Fitness: ["Lifestyle", "Beauty"],
};

export function deliverableMultiplier(deliverables) {
  if (!deliverables.length) return 0.8;
  return 1 + Math.max(0, deliverables.length - 1) * 0.28;
}

export function estimateCreatorCost(creator, deliverables) {
  const midpoint = (creator.rateMin + creator.rateMax) / 2;
  return Math.round(midpoint * deliverableMultiplier(deliverables) / 500) * 500;
}

function availabilityScore(availability) {
  if (availability.includes("this month")) return 100;
  if (availability.includes("2 weeks")) return 88;
  if (availability.includes("next month")) return 68;
  return 48;
}

export function calculateCampaignFit(creator, brief, selectedCount = 1) {
  const estimatedCost = estimateCreatorCost(creator, brief.deliverables);
  const allocation = Number(brief.budget || 0) / Math.max(selectedCount, 1);
  const quality = creator.quality;
  const location = creator.state === brief.state ? 100 : creator.languages.includes(brief.language) ? 62 : 34;
  const relevance = creator.niche === brief.niche ? 100 : relatedNiches[brief.niche]?.includes(creator.niche) ? 70 : 42;
  const availability = availabilityScore(creator.availability);
  const budget = allocation <= 0 ? 50 : estimatedCost <= allocation ? 100 : Math.max(25, Math.round((allocation / estimatedCost) * 100));
  const factors = { quality, location, relevance, availability, budget };
  const score = Math.round(Object.entries(FIT_WEIGHTS).reduce((sum, [key, weight]) => sum + factors[key] * weight / 100, 0));

  return { score, factors, estimatedCost, allocation };
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
