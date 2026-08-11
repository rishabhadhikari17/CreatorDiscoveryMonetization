export const usageRights = [
  { id: "creator", label: "Creator channels only", note: "Organic post stays on the creator’s channels", multiplier: 1 },
  { id: "brand-organic", label: "Brand organic · 3 months", note: "Brand may repost on owned social channels", multiplier: 1.25 },
  { id: "paid-3", label: "Paid media · 3 months", note: "Includes whitelisting and paid social usage", multiplier: 1.5 },
  { id: "paid-12", label: "Paid media · 12 months", note: "Extended paid usage across digital channels", multiplier: 1.8 },
];

export function calculateFairBand(creator, deliverables, rightsId, exclusivity) {
  const deliverableFactor = deliverables.length ? 1 + Math.max(0, deliverables.length - 1) * 0.28 : 0;
  const rights = usageRights.find((item) => item.id === rightsId) ?? usageRights[0];
  const exclusivityFactor = exclusivity ? 1.2 : 1;
  const multiplier = deliverableFactor * rights.multiplier * exclusivityFactor;
  const round = (value) => Math.round(value / 500) * 500;

  return {
    min: round(creator.rateMin * multiplier),
    max: round(creator.rateMax * multiplier),
    multiplier,
    deliverableFactor,
    rightsFactor: rights.multiplier,
    exclusivityFactor,
    rights,
  };
}

export function compareOffer(amount, band) {
  const value = Number(amount || 0);
  if (value < band.min) return { status: "below", label: "Below fair band", difference: band.min - value };
  if (value > band.max) return { status: "above", label: "Above fair band", difference: value - band.max };
  return { status: "within", label: "Within fair band", difference: Math.min(value - band.min, band.max - value) };
}

export function offerMarkerPosition(amount, band) {
  const scaleMin = Math.max(0, band.min * 0.45);
  const scaleMax = band.max * 1.55;
  return Math.max(2, Math.min(98, ((Number(amount || 0) - scaleMin) / (scaleMax - scaleMin)) * 100));
}
