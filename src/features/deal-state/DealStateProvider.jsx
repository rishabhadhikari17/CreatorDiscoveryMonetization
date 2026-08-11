import { useEffect, useMemo, useReducer } from "react";
import { useDemoExperience } from "../../components/demo/DemoExperienceContext.js";
import { DealStateContext } from "./DealStateContext.js";
import { createInitialDealState, DEAL_STATE_VERSION, DEAL_STORAGE_KEY, dealReducer } from "./dealState.js";

function loadStoredState() {
  try {
    const stored = window.localStorage.getItem(DEAL_STORAGE_KEY);
    if (!stored) return createInitialDealState();
    const parsed = JSON.parse(stored);
    if (parsed.version !== DEAL_STATE_VERSION || !Array.isArray(parsed.deals) || !Array.isArray(parsed.campaigns)) return createInitialDealState();
    return parsed;
  } catch {
    return createInitialDealState();
  }
}

export function DealStateProvider({ children }) {
  const { notify } = useDemoExperience();
  const [state, dispatch] = useReducer(dealReducer, undefined, loadStoredState);

  useEffect(() => {
    window.localStorage.setItem(DEAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const syncStoredState = (event) => {
      if (event.key !== DEAL_STORAGE_KEY || !event.newValue) return;
      try {
        const nextState = JSON.parse(event.newValue);
        if (nextState.version === DEAL_STATE_VERSION && Array.isArray(nextState.deals) && Array.isArray(nextState.campaigns)) dispatch({ type: "HYDRATE", state: nextState });
      } catch {
        // Ignore malformed state written by another tab.
      }
    };
    window.addEventListener("storage", syncStoredState);
    return () => window.removeEventListener("storage", syncStoredState);
  }, []);

  const value = useMemo(() => ({
    deals: state.deals,
    campaigns: state.campaigns,
    getDeal: (id) => state.deals.find((deal) => deal.id === id) ?? state.deals[0],
    getBrandDeal: (creatorId) => state.deals.find((deal) => deal.creatorId === creatorId && deal.brand.name === "Rooted Foods") ?? state.deals[0],
    sendOffer: (id, offer, detail, isUpdate = false) => { dispatch({ type: "SEND_OFFER", id, offer, detail, isUpdate }); notify({ title: isUpdate ? "Offer updated" : "Offer sent", message: "Priya’s creator workspace now shows the latest terms." }); },
    startEditing: (id) => dispatch({ type: "START_EDIT", id }),
    withdrawOffer: (id, detail) => { dispatch({ type: "WITHDRAW_OFFER", id, detail }); notify({ title: "Offer withdrawn", message: "The creator can no longer respond to these terms.", tone: "info" }); },
    prepareDraft: (id) => { dispatch({ type: "PREPARE_DRAFT", id }); notify({ title: "New draft ready", message: "Update the offer terms before sending again.", tone: "info" }); },
    creatorAccept: (id, detail) => { dispatch({ type: "CREATOR_ACCEPT", id, detail }); notify({ title: "Offer accepted", message: "A connected campaign workspace has been created." }); },
    creatorCounter: (id, amount, message, detail) => { dispatch({ type: "CREATOR_COUNTER", id, amount, message, detail }); notify({ title: "Counter-offer sent", message: "Rooted Foods can now review your revised amount." }); },
    creatorDecline: (id, reason, detail) => { dispatch({ type: "CREATOR_DECLINE", id, reason, detail }); notify({ title: "Offer declined", message: "The brand has been notified respectfully.", tone: "info" }); },
    brandAcceptCounter: (id, detail) => { dispatch({ type: "BRAND_ACCEPT_COUNTER", id, detail }); notify({ title: "Counter accepted", message: "Both sides now see an active campaign workspace." }); },
    submitContent: (id, content, detail, isRevision = false) => { dispatch({ type: "SUBMIT_CONTENT", id, content, detail, isRevision }); notify({ title: isRevision ? "Revision submitted" : "Draft submitted", message: "Rooted Foods can now review the demo content." }); },
    requestRevision: (id, note) => { dispatch({ type: "REQUEST_REVISION", id, note }); notify({ title: "Revision requested", message: "Priya’s workspace now shows your feedback.", tone: "info" }); },
    approveContent: (id) => { dispatch({ type: "APPROVE_CONTENT", id }); notify({ title: "Content approved", message: "The campaign is ready for delivery confirmation." }); },
    confirmDelivery: (id) => { dispatch({ type: "CONFIRM_DELIVERY", id }); notify({ title: "Delivery confirmed", message: "The simulated payment is ready to release." }); },
    releasePayment: (id, detail) => { dispatch({ type: "RELEASE_PAYMENT", id, detail }); notify({ title: "Demo payment released", message: "Performance results and feedback are now available." }); },
    rateCreator: (id, rating, feedback) => { dispatch({ type: "RATE_CREATOR", id, rating, feedback }); notify({ title: "Feedback saved", message: `${rating}/5 rating is visible in Priya’s collaboration record.` }); },
    resetDeals: () => {
      const initialState = createInitialDealState();
      window.localStorage.setItem(DEAL_STORAGE_KEY, JSON.stringify(initialState));
      dispatch({ type: "HYDRATE", state: initialState });
    },
  }), [state, notify]);

  return <DealStateContext.Provider value={value}>{children}</DealStateContext.Provider>;
}
