import { creators } from "../../creator-discovery/data/creators.js";
import { readCreatorProfileEdits } from "../creatorProfileStorage.js";

const regionalMix = {
  Bihar: [["Muzaffarpur", 31], ["Patna", 24], ["Darbhanga", 18], ["Gaya", 11], ["Other Bihar", 16]],
  Maharashtra: [["Pune", 28], ["Nashik", 23], ["Mumbai", 19], ["Nagpur", 13], ["Other Maharashtra", 17]],
  "Tamil Nadu": [["Madurai", 32], ["Chennai", 21], ["Coimbatore", 18], ["Tiruchirappalli", 12], ["Other Tamil Nadu", 17]],
  Punjab: [["Amritsar", 29], ["Ludhiana", 26], ["Jalandhar", 17], ["Patiala", 12], ["Other Punjab", 16]],
};

const cohortSizes = { Bhojpuri: 34, Marathi: 47, Tamil: 51, Punjabi: 39 };

const collaborations = {
  "priya-kumari": [
    { brand: "Aashirvaad", campaign: "Ghar ka Swaad", date: "May 2026", result: "2.4× saves benchmark", status: "Completed" },
    { brand: "Saffola", campaign: "Local Breakfast Stories", date: "February 2026", result: "8.9% engagement", status: "Completed" },
    { brand: "Madhur Sugar", campaign: "Chhath Recipes", date: "November 2025", result: "91% positive sentiment", status: "Completed" },
  ],
  "kavya-raman": [
    { brand: "Prestige", campaign: "Everyday Kitchens", date: "June 2026", result: "3.1× saves benchmark", status: "Completed" },
    { brand: "Urban Company", campaign: "Homes of Madurai", date: "March 2026", result: "9.4% engagement", status: "Completed" },
  ],
  "simran-kaur": [
    { brand: "Mamaearth", campaign: "Punjab Glow", date: "April 2026", result: "1.8× click benchmark", status: "Completed" },
    { brand: "Myntra", campaign: "Festive Fits", date: "October 2025", result: "8.2% engagement", status: "Completed" },
  ],
};

function clamp(value) {
  return Math.max(58, Math.min(97, value));
}

function buildComponents(creator) {
  return [
    {
      key: "authenticity", label: "Audience authenticity", weight: 25, score: clamp(creator.quality + 3),
      description: "How much of the audience behaves like real, consistently interested people.",
      evidence: `${Math.max(1.8, 5.8 - creator.engagement / 2).toFixed(1)}% suspicious activity—lower than the ${creator.language} cohort average.`,
    },
    {
      key: "depth", label: "Engagement depth", weight: 20, score: clamp(Math.round(creator.quality - 2 + creator.engagement / 3)),
      description: "The quality of conversations, saves, shares, and repeat interactions.",
      evidence: `${creator.engagement}% engagement with meaningful replies and saves above the cohort median.`,
    },
    {
      key: "locality", label: "Regional relevance", weight: 25, score: clamp(creator.localReach + 8),
      description: "How strongly the audience is concentrated in the creator’s real local market.",
      evidence: `${creator.localReach}% of active viewers are from ${creator.state}, led by ${creator.district}.`,
    },
    {
      key: "trust", label: "Community trust", weight: 15, score: clamp(creator.quality - 1),
      description: "Signals of repeat attention and confidence in the creator’s recommendations.",
      evidence: `${Math.round(creator.quality * 0.61)}% repeat-viewer rate with frequent product and recommendation questions.`,
    },
    {
      key: "intent", label: "Conversion intent", weight: 15, score: clamp(creator.quality - 5),
      description: "Evidence that attention can translate into consideration or action.",
      evidence: `${Math.max(1.4, creator.engagement / 3.4).toFixed(1)}× cohort-average saves on recommendation-led content.`,
    },
  ];
}

function buildLanguages(creator) {
  if (creator.languages.length === 1) return [[creator.language, 91], ["English", 6], ["Other", 3]];
  return [[creator.language, 72], [creator.languages[1], 23], ["Other", 5]];
}

export function getCreatorProfile(id) {
  const creator = creators.find((item) => item.id === id);
  if (!creator) return null;

  const edits = readCreatorProfileEdits(id);

  const regional = regionalMix[creator.state] ?? [[creator.district, creator.localReach], [`Other ${creator.state}`, 100 - creator.localReach]];
  const history = collaborations[id] ?? [
    { brand: "Rooted Foods", campaign: `${creator.state} Community Stories`, date: "April 2026", result: `${creator.engagement}% engagement`, status: "Completed" },
    { brand: "Local Origins", campaign: "Made Close to Home", date: "December 2025", result: `${creator.localReach}% local reach`, status: "Completed" },
  ];

  const profile = {
    ...creator,
    bio: `${creator.name} creates practical ${creator.niche.toLowerCase()} stories rooted in ${creator.district}. Their community returns for useful, culturally familiar recommendations delivered primarily in ${creator.language}.`,
    regionalAudience: regional,
    languageBreakdown: buildLanguages(creator),
    demographics: {
      gender: [["Women", creator.niche === "Beauty" || creator.niche.includes("Home") ? 73 : 62], ["Men", creator.niche === "Beauty" || creator.niche.includes("Home") ? 25 : 36], ["Other / unknown", 2]],
      age: [["18–24", 22], ["25–34", 46], ["35–44", 23], ["45+", 9]],
    },
    components: buildComponents(creator),
    confidence: creator.audience > 100000 ? 94 : 91,
    cohortSize: cohortSizes[creator.language] ?? 36,
    percentile: Math.min(98, Math.round(creator.quality + 7)),
    lastAnalysed: "8 August 2026",
    collaborations: history,
    profileVisible: true,
    acceptingOffers: true,
    secondaryNiches: [],
  };

  if (!edits) return profile;

  const connectedPlatforms = edits.connectedPlatforms
    ?.filter((platform) => platform.connected)
    .map((platform) => platform.name);
  const languages = edits.language
    ? [edits.language, ...profile.languages.filter((language) => language !== edits.language)]
    : profile.languages;

  return {
    ...profile,
    name: edits.name || profile.name,
    initials: edits.name ? edits.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : profile.initials,
    avatarDataUrl: edits.avatarDataUrl || null,
    handle: edits.handle || profile.handle,
    bio: edits.bio || profile.bio,
    district: edits.district || profile.district,
    state: edits.state || profile.state,
    language: edits.language || profile.language,
    languages,
    niche: edits.niche || profile.niche,
    secondaryNiches: edits.secondaryNiches ?? profile.secondaryNiches,
    availability: edits.availability || profile.availability,
    rateMin: Number(edits.rateMin) || profile.rateMin,
    rateMax: Number(edits.rateMax) || profile.rateMax,
    platforms: connectedPlatforms ?? profile.platforms,
    collaborations: edits.portfolio ? [...edits.portfolio].sort((a, b) => Number(b.featured) - Number(a.featured)) : profile.collaborations,
    profileVisible: edits.profileVisible ?? true,
    acceptingOffers: edits.acceptingOffers ?? true,
  };
}
