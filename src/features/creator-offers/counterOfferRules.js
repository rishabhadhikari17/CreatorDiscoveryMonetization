function roundToFiveHundred(value) {
  return Math.round(value / 500) * 500;
}

export function getOfferPosition(offer) {
  if (offer.amount < offer.fairMin) return "below";
  if (offer.amount > offer.fairMax) return "above";
  return "within";
}

export function getSuggestedCounter(offer) {
  const position = getOfferPosition(offer);
  const rushPremium = offer.turnaroundDays <= 10 ? roundToFiveHundred(offer.fairMin * 0.1) : 0;
  const midpoint = roundToFiveHundred((offer.fairMin + offer.fairMax) / 2);

  if (position === "below") {
    const amount = Math.min(offer.fairMax, roundToFiveHundred(offer.fairMin + rushPremium));
    return {
      amount,
      position,
      rushPremium,
      steps: [
        { label: "Fair-band floor", value: offer.fairMin },
        ...(rushPremium ? [{ label: "10% rush premium", value: rushPremium }] : []),
        { label: "Suggested counter", value: amount, total: true },
      ],
      explanation: rushPremium
        ? `The offer is below your fair band and the ${offer.turnaroundDays}-day delivery window qualifies for the published 10% rush rule.`
        : "The offer is below your fair band, so the suggestion starts at the fair-band floor.",
    };
  }

  if (position === "within") {
    const amount = Math.max(offer.amount, midpoint);
    return {
      amount,
      position,
      rushPremium: 0,
      steps: [
        { label: "Current offer", value: offer.amount },
        { label: "Fair-band midpoint", value: midpoint },
        { label: "Suggested counter", value: amount, total: true },
      ],
      explanation: "The offer is already fair. If you counter, the band midpoint is a balanced evidence-based anchor.",
    };
  }

  return {
    amount: offer.amount,
    position,
    rushPremium: 0,
    steps: [
      { label: "Current offer", value: offer.amount },
      { label: "Fair-band ceiling", value: offer.fairMax },
      { label: "Suggested response", value: offer.amount, total: true },
    ],
    explanation: "The offer is above your fair band, so no higher counter is suggested.",
  };
}

export function getOfferMarkerPosition(offer) {
  const scaleMin = Math.max(0, offer.fairMin * 0.55);
  const scaleMax = offer.fairMax * 1.35;
  return Math.max(3, Math.min(97, ((offer.amount - scaleMin) / (scaleMax - scaleMin)) * 100));
}
