export const creatorOffers = [
  {
    id: "rooted-foods-bihar",
    creatorId: "priya-kumari",
    brand: {
      name: "Rooted Foods",
      initials: "RF",
      category: "Packaged foods",
      contact: "Ananya Mehta, Brand Partnerships",
      verified: true,
    },
    campaign: {
      name: "Bihar Breakfast Stories",
      objective: "Build consideration for a new millet breakfast range through a familiar, locally rooted recipe story.",
      audience: "Women 25-34 in Bihar",
    },
    amount: 15000,
    fairMin: 23000,
    fairMax: 33500,
    sentAt: "11 Aug, 10:42",
    respondBy: "13 August, 6:00 PM",
    turnaroundDays: 9,
    status: "new",
    deliverables: [
      { title: "1 Instagram Reel", detail: "45-60 sec recipe-led vertical video" },
      { title: "3 Story frames", detail: "Teaser, product context, and swipe-through reminder" },
    ],
    dates: [
      { label: "Concept approval", value: "15 August" },
      { label: "First cut", value: "18 August" },
      { label: "Publish", value: "20 August" },
    ],
    usageRights: "Creator channels only, organic usage",
    exclusivity: "None",
    paymentTerms: "50% on agreement, 50% within 15 days of publishing",
    note: "Priya, your Bhojpuri recipe storytelling and strong Bihar audience are a close fit for this launch. We would love a warm, everyday breakfast story in your usual voice.",
    rateEvidence: [
      "88/100 audience quality",
      "76% audience concentration in Bihar",
      "8.6% meaningful engagement",
      "Benchmarked against 34 Bhojpuri creators",
    ],
    history: [
      { actor: "brand", title: "Rooted Foods sent an offer", detail: "₹15,000 for 1 Reel + 3 Story frames", time: "Today, 10:42" },
      { actor: "system", title: "You were shortlisted", detail: "96% campaign fit for Bihar Breakfast Stories", time: "Today, 10:34" },
    ],
  },
  {
    id: "aashirvaad-ghar-ka-swaad",
    creatorId: "priya-kumari",
    brand: {
      name: "Aashirvaad",
      initials: "AA",
      category: "Staples & pantry",
      contact: "Kavita Rao, Creator Marketing",
      verified: true,
    },
    campaign: {
      name: "Ghar ka Swaad",
      objective: "Celebrate regional home-cooking rituals through trusted creator-led stories.",
      audience: "Family food shoppers in Bihar and Jharkhand",
    },
    amount: 24000,
    fairMin: 20000,
    fairMax: 28000,
    sentAt: "10 Aug, 4:20 PM",
    respondBy: "14 August, 12:00 PM",
    turnaroundDays: 16,
    status: "reviewing",
    deliverables: [
      { title: "1 Instagram Reel", detail: "60 sec family recipe story" },
      { title: "1 Photo carousel", detail: "5 edited campaign images" },
    ],
    dates: [
      { label: "Concept approval", value: "18 August" },
      { label: "First cut", value: "23 August" },
      { label: "Publish", value: "27 August" },
    ],
    usageRights: "Brand organic reposting for 3 months",
    exclusivity: "14 days in packaged atta",
    paymentTerms: "100% within 15 days of publishing",
    note: "We enjoyed your recent litti-chokha series and would like to build a family recipe story around the same warmth and cultural detail.",
    rateEvidence: [
      "Two primary content formats",
      "3-month brand organic rights",
      "14-day category exclusivity",
      "Strong regional campaign relevance",
    ],
    history: [
      { actor: "brand", title: "Aashirvaad clarified usage rights", detail: "Organic brand reposting is limited to 3 months", time: "Yesterday, 5:12 PM" },
      { actor: "brand", title: "Aashirvaad sent an offer", detail: "₹24,000 for 1 Reel + 1 Photo carousel", time: "Yesterday, 4:20 PM" },
      { actor: "system", title: "Offer matched to your rate profile", detail: "The amount is within your fair-rate band", time: "Yesterday, 4:20 PM" },
    ],
  },
];

export function getCreatorOffer(id) {
  return creatorOffers.find((offer) => offer.id === id) ?? creatorOffers[0];
}
