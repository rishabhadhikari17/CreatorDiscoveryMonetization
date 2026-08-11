export const demoCampaign = {
  id: "rooted-foods-monsoon-millet",
  sourceDealId: null,
  creatorId: "priya-kumari",
  creatorName: "Priya Kumari",
  brand: { name: "Rooted Foods", initials: "RF" },
  campaign: { name: "Monsoon Millet Mornings", objective: "Show how a quick millet breakfast can still feel familiar, regional, and family-led." },
  amount: 25000,
  status: "creating",
  contract: {
    reference: "VAA-RF-0826-014",
    signedAt: "8 August 2026",
    scope: ["1 Instagram Reel", "3 Story frames"],
    usageRights: "Brand organic reposting for 3 months",
    exclusivity: "None",
    firstCut: "14 August 2026",
    publishBy: "18 August 2026",
    paymentTerms: "50% secured at signing · 50% secured on approval",
  },
  content: null,
  revisionNote: "",
  reviewRound: 0,
  payment: { status: "escrow_funded", secured: 25000, released: 0, reference: "DEMO-ESC-1842" },
  performance: null,
  rating: null,
  feedback: "",
  activity: [
    { actor: "system", title: "Demo escrow funded", detail: "₹25,000 secured for this prototype campaign", time: "8 Aug, 3:15 PM" },
    { actor: "brand", title: "Contract summary confirmed", detail: "Scope, usage rights, timeline, and payment terms agreed", time: "8 Aug, 3:12 PM" },
    { actor: "creator", title: "Priya joined the campaign", detail: "Content production is now in progress", time: "8 Aug, 3:10 PM" },
  ],
};

export function createInitialCampaigns() {
  return [{ ...demoCampaign, contract: { ...demoCampaign.contract, scope: [...demoCampaign.contract.scope] }, payment: { ...demoCampaign.payment }, activity: demoCampaign.activity.map((item) => ({ ...item })) }];
}

export function createCampaignFromDeal(deal) {
  return {
    id: `campaign-${deal.id}`,
    sourceDealId: deal.id,
    creatorId: deal.creatorId,
    creatorName: deal.creatorId === "priya-kumari" ? "Priya Kumari" : "Creator",
    brand: { name: deal.brand.name, initials: deal.brand.initials },
    campaign: { ...deal.campaign },
    amount: deal.amount,
    status: "creating",
    contract: {
      reference: `VAA-${deal.brand.initials}-${deal.id.slice(-6).toUpperCase()}`,
      signedAt: "Just now",
      scope: deal.deliverables.map((item) => item.title),
      usageRights: deal.usageRights,
      exclusivity: deal.exclusivity,
      firstCut: deal.dates[1]?.value ?? "To be agreed",
      publishBy: deal.dates[2]?.value ?? "To be agreed",
      paymentTerms: deal.paymentTerms,
    },
    content: null,
    revisionNote: "",
    reviewRound: 0,
    payment: { status: "escrow_funded", secured: deal.amount, released: 0, reference: `DEMO-ESC-${deal.id.slice(-4).toUpperCase()}` },
    performance: null,
    rating: null,
    feedback: "",
    activity: [
      { actor: "system", title: "Demo escrow funded", detail: `₹${deal.amount.toLocaleString("en-IN")} secured for this prototype campaign`, time: "Just now" },
      { actor: "system", title: "Campaign workspace created", detail: "Accepted deal converted into an active collaboration", time: "Just now" },
    ],
  };
}

export const demoPerformance = {
  views: 184200,
  reach: 146800,
  engagement: 9.4,
  saves: 6300,
  shares: 2800,
  positiveSentiment: 93,
};
