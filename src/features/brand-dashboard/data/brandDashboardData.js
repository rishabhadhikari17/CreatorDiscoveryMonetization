export const dashboardMetrics = [
  { id: "campaigns", label: "Active campaigns", value: "1", detail: "Creator production", tone: "rose", path: "/brand/campaigns" },
  { id: "shortlist", label: "Shortlisted creators", value: "3", detail: "Campaign-ready", tone: "olive", path: "/brand/shortlist" },
  { id: "offers", label: "Pending offers", value: "1", detail: "Priya reviewing", tone: "cream", path: "/brand/deals" },
  { id: "deals", label: "Demo escrow", value: "₹25K", detail: "Simulated secured value", tone: "dark", path: "/brand/campaigns" },
];

export const activeCampaigns = [
  {
    id: "monsoon-millet-mornings",
    name: "Monsoon Millet Mornings",
    market: "Muzaffarpur & North Bihar",
    language: "Bhojpuri",
    status: "Creator production",
    creators: "Priya · 1 of 1 creating",
    budget: "₹25K",
    progress: 28,
    due: "18 Aug",
  },
];

export const recommendedCreators = [
  {
    id: "priya-kumari",
    initials: "PK",
    script: "प",
    name: "Priya Kumari",
    location: "Muzaffarpur, Bihar",
    language: "Bhojpuri",
    niche: "Food & Culture",
    quality: 88,
    engagement: "8.4%",
    audience: "45.2K",
    rate: "₹18K–₹26K",
    relevance: 96,
  },
  {
    id: "kavya-raman",
    initials: "KR",
    script: "க",
    name: "Kavya Raman",
    location: "Madurai, Tamil Nadu",
    language: "Tamil",
    niche: "Home & Living",
    quality: 91,
    engagement: "9.2%",
    audience: "38.2K",
    rate: "₹20K–₹30K",
    relevance: 89,
  },
  {
    id: "simran-kaur",
    initials: "SK",
    script: "ਸ",
    name: "Simran Kaur",
    location: "Amritsar, Punjab",
    language: "Punjabi",
    niche: "Beauty",
    quality: 89,
    engagement: "8.1%",
    audience: "52.2K",
    rate: "₹23K–₹32K",
    relevance: 84,
  },
];

export const recentActivity = [
  { id: 1, type: "campaign", title: "Priya joined the active campaign", context: "Monsoon Millet Mornings · ₹25,000", time: "8 Aug" },
  { id: 2, type: "offer", title: "Bihar Breakfast Stories offer sent", context: "₹15,000 · Below fair band", time: "Yesterday" },
  { id: 3, type: "shortlist", title: "Priya added to campaign brief", context: "96% fit · Muzaffarpur", time: "Yesterday" },
  { id: 4, type: "deal", title: "Contract summary confirmed", context: "Creator-channel usage · No exclusivity", time: "8 Aug" },
];
