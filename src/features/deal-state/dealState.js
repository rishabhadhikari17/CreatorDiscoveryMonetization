import { creatorOffers } from "../creator-offers/data/creatorOffers.js";
import { creators } from "../creator-discovery/data/creators.js";
import { createCampaignFromDeal, createInitialCampaigns, demoPerformance } from "../campaign-execution/campaignData.js";
import { createInitialInterests, createInitialOpportunities } from "../campaign-opportunities/data/campaignOpportunities.js";

const PREVIOUS_BRAND_PREFIX = ["global", "gali"].join("");

export const DEAL_STORAGE_KEY = "globalgalli-connected-marketplace-v3";
export const LEGACY_DEAL_STORAGE_KEYS = [
  `${PREVIOUS_BRAND_PREFIX}-connected-marketplace-v3`,
  `${PREVIOUS_BRAND_PREFIX}-connected-marketplace-v2`,
  "vaani-connected-marketplace-v2",
];
export const DEAL_STATE_VERSION = 3;

export const VALID_DEAL_TRANSITIONS = {
  draft: ["sent"],
  sent: ["editing", "accepted", "countered", "declined", "withdrawn"],
  editing: ["sent", "withdrawn"],
  countered: ["editing", "accepted", "withdrawn"],
  accepted: [],
  declined: ["draft"],
  withdrawn: ["draft"],
};

export const VALID_CAMPAIGN_TRANSITIONS = {
  creating: ["in_review"],
  in_review: ["revision_requested", "approved"],
  revision_requested: ["in_review"],
  approved: ["delivered"],
  delivered: ["completed"],
  completed: [],
};

function editorFields(offer) {
  const deliverableIds = offer.deliverables.map((item) => {
    if (item.title.includes("Story")) return "Story set";
    if (item.title.includes("YouTube")) return "YouTube integration";
    if (item.title.includes("carousel")) return "Photo carousel";
    return "Instagram Reel";
  });

  return {
    deliverableIds,
    rightsId: offer.usageRights.includes("Brand organic") ? "brand-organic" : "creator",
    editorExclusivity: offer.exclusivity !== "None",
  };
}

export function createInitialDealState() {
  const creatorDeals = creatorOffers.map((offer) => ({
    ...offer,
    ...editorFields(offer),
    dealStatus: "sent",
    counterAmount: null,
    counterMessage: "",
    declineReason: "",
    activity: offer.history.map((item) => ({ ...item })),
  }));
  const brandDrafts = creators.filter((creator) => creator.id !== "priya-kumari").map((creator) => ({
    id: `rooted-foods-${creator.id}`,
    creatorId: creator.id,
    brand: { name: "Rooted Foods", initials: "RF", category: "Packaged foods", contact: "Ananya Mehta, Brand Partnerships", verified: true },
    campaign: { name: `${creator.state} Breakfast Stories`, objective: `Build regional consideration through a locally rooted ${creator.niche.toLowerCase()} story.`, audience: `${creator.language}-speaking audiences in ${creator.state}` },
    amount: Math.round(((creator.rateMin + creator.rateMax) / 2) / 500) * 500,
    fairMin: creator.rateMin,
    fairMax: creator.rateMax,
    sentAt: "Not sent",
    respondBy: "Set when sent",
    turnaroundDays: 14,
    deliverables: [{ title: "1 Instagram Reel", detail: "30-60 sec vertical video" }],
    deliverableIds: ["Instagram Reel"],
    dates: [{ label: "Concept approval", value: "To be agreed" }, { label: "First cut", value: "To be agreed" }, { label: "Publish", value: "To be agreed" }],
    rightsId: "creator",
    usageRights: "Creator channels only",
    editorExclusivity: false,
    exclusivity: "None",
    paymentTerms: "50% on agreement, 50% within 15 days of publishing",
    note: `We're proposing one regional story for ${creator.state} Breakfast Stories, with creator-channel organic usage and a 14-day production window.`,
    rateEvidence: [`${creator.quality}/100 audience quality`, `${creator.localReach}% local reach in ${creator.state}`, `${creator.engagement}% meaningful engagement`, `${creator.language} campaign relevance`],
    dealStatus: "draft",
    counterAmount: null,
    counterMessage: "",
    declineReason: "",
    activity: [
      { actor: "system", title: "Campaign brief prepared", detail: `${creator.state} Breakfast Stories · Product consideration`, time: "Today, 10:20" },
      { actor: "brand", title: `${creator.name} shortlisted`, detail: `${creator.quality}/100 audience quality · ${creator.district}`, time: "Today, 10:34" },
    ],
  }));

  return {
    version: DEAL_STATE_VERSION,
    deals: [...creatorDeals, ...brandDrafts],
    campaigns: createInitialCampaigns(),
    opportunities: createInitialOpportunities(),
    interests: createInitialInterests(),
  };
}

export function canTransition(from, to) {
  return VALID_DEAL_TRANSITIONS[from]?.includes(to) ?? false;
}

function updateDeal(state, id, nextStatus, updater, activity) {
  const current = state.deals.find((deal) => deal.id === id);
  if (!current || !canTransition(current.dealStatus, nextStatus)) return state;

  return {
    ...state,
    deals: state.deals.map((deal) => {
      if (deal.id !== id) return deal;
      const updated = updater ? updater(deal) : deal;
      return {
        ...updated,
        dealStatus: nextStatus,
        activity: activity ? [activity, ...deal.activity] : deal.activity,
      };
    }),
  };
}

function ensureCampaignForDeal(state, dealId) {
  if (state.campaigns.some((campaign) => campaign.sourceDealId === dealId)) return state;
  const deal = state.deals.find((item) => item.id === dealId);
  if (!deal) return state;
  return { ...state, campaigns: [createCampaignFromDeal(deal), ...state.campaigns] };
}

function updateCampaign(state, id, nextStatus, updater, activity) {
  const current = state.campaigns.find((campaign) => campaign.id === id);
  if (!current || !VALID_CAMPAIGN_TRANSITIONS[current.status]?.includes(nextStatus)) return state;
  return {
    ...state,
    campaigns: state.campaigns.map((campaign) => {
      if (campaign.id !== id) return campaign;
      const updated = updater ? updater(campaign) : campaign;
      return { ...updated, status: nextStatus, activity: activity ? [activity, ...campaign.activity] : campaign.activity };
    }),
  };
}

export function dealReducer(state, action) {
  switch (action.type) {
    case "SEND_OFFER":
      return updateDeal(
        state,
        action.id,
        "sent",
        (deal) => ({ ...deal, ...action.offer, counterAmount: null, counterMessage: "", declineReason: "" }),
        { actor: "brand", title: action.isUpdate ? "Rooted Foods revised and resent the offer" : "Rooted Foods sent the offer", detail: action.detail, time: "Just now" },
      );
    case "START_EDIT":
      return updateDeal(
        state,
        action.id,
        "editing",
        null,
        { actor: "brand", title: "Rooted Foods is revising the offer", detail: "The current terms stay visible until an update is sent", time: "Just now" },
      );
    case "WITHDRAW_OFFER":
      return updateDeal(
        state,
        action.id,
        "withdrawn",
        null,
        { actor: "brand", title: "Rooted Foods withdrew the offer", detail: action.detail, time: "Just now" },
      );
    case "PREPARE_DRAFT":
      return updateDeal(
        state,
        action.id,
        "draft",
        (deal) => ({ ...deal, counterAmount: null, counterMessage: "", declineReason: "" }),
        { actor: "brand", title: "Rooted Foods started a new offer draft", detail: "A new response will be requested when the offer is sent", time: "Just now" },
      );
    case "CREATOR_ACCEPT": {
      const nextState = updateDeal(
        state,
        action.id,
        "accepted",
        null,
        { actor: "creator", title: "Priya accepted the offer", detail: action.detail, time: "Just now" },
      );
      return nextState === state ? state : ensureCampaignForDeal(nextState, action.id);
    }
    case "CREATOR_COUNTER":
      return updateDeal(
        state,
        action.id,
        "countered",
        (deal) => ({ ...deal, counterAmount: action.amount, counterMessage: action.message }),
        { actor: "creator", title: "Priya sent a counter-offer", detail: action.detail, time: "Just now" },
      );
    case "CREATOR_DECLINE":
      return updateDeal(
        state,
        action.id,
        "declined",
        (deal) => ({ ...deal, declineReason: action.reason }),
        { actor: "creator", title: "Priya declined the offer", detail: action.detail, time: "Just now" },
      );
    case "BRAND_ACCEPT_COUNTER": {
      const nextState = updateDeal(
        state,
        action.id,
        "accepted",
        (deal) => ({ ...deal, amount: deal.counterAmount ?? deal.amount }),
        { actor: "brand", title: "Rooted Foods accepted Priya's counter", detail: action.detail, time: "Just now" },
      );
      return nextState === state ? state : ensureCampaignForDeal(nextState, action.id);
    }
    case "SUBMIT_CONTENT":
      return updateCampaign(
        state,
        action.id,
        "in_review",
        (campaign) => ({ ...campaign, content: action.content, revisionNote: "", reviewRound: campaign.reviewRound + 1 }),
        { actor: "creator", title: action.isRevision ? "Priya submitted a revised draft" : "Priya submitted content for review", detail: action.detail, time: "Just now" },
      );
    case "REQUEST_REVISION":
      return updateCampaign(
        state,
        action.id,
        "revision_requested",
        (campaign) => ({ ...campaign, revisionNote: action.note }),
        { actor: "brand", title: "Rooted Foods requested a revision", detail: action.note, time: "Just now" },
      );
    case "APPROVE_CONTENT":
      return updateCampaign(
        state,
        action.id,
        "approved",
        null,
        { actor: "brand", title: "Rooted Foods approved the content", detail: "Final content is cleared for delivery and publishing", time: "Just now" },
      );
    case "CONFIRM_DELIVERY":
      return updateCampaign(
        state,
        action.id,
        "delivered",
        (campaign) => ({ ...campaign, payment: { ...campaign.payment, status: "release_pending" } }),
        { actor: "brand", title: "Rooted Foods confirmed delivery", detail: "Published deliverables verified · payment release is ready", time: "Just now" },
      );
    case "RELEASE_PAYMENT":
      return updateCampaign(
        state,
        action.id,
        "completed",
        (campaign) => ({ ...campaign, payment: { ...campaign.payment, status: "released", released: campaign.amount }, performance: { ...demoPerformance } }),
        { actor: "system", title: "Demo payment released", detail: action.detail, time: "Just now" },
      );
    case "RATE_CREATOR": {
      const campaign = state.campaigns.find((item) => item.id === action.id);
      if (!campaign || campaign.status !== "completed" || action.rating < 1 || action.rating > 5) return state;
      return {
        ...state,
        campaigns: state.campaigns.map((item) => item.id === action.id ? { ...item, rating: action.rating, feedback: action.feedback, activity: [{ actor: "brand", title: "Rooted Foods rated the collaboration", detail: `${action.rating}/5 · ${action.feedback}`, time: "Just now" }, ...item.activity] } : item),
      };
    }
    case "SHARE_INTEREST": {
      const opportunity = state.opportunities.find((item) => item.id === action.opportunityId);
      const alreadyShared = state.interests.some((item) => item.opportunityId === action.opportunityId && item.creatorId === action.creatorId);
      if (!opportunity || opportunity.status !== "open" || alreadyShared) return state;
      return {
        ...state,
        interests: [{
          id: `interest-${action.opportunityId}-${action.creatorId}`,
          opportunityId: action.opportunityId,
          creatorId: action.creatorId,
          message: action.message,
          sharedAt: "Just now",
          status: "new",
          match: opportunity.match,
        }, ...state.interests],
      };
    }
    case "HYDRATE":
      return action.state;
    case "RESET_ALL":
      return createInitialDealState();
    default:
      return state;
  }
}
