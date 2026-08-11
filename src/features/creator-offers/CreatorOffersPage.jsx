import {
  ArrowRight, BadgeCheck, CalendarDays, Check, CheckCircle2, ChevronRight,
  CircleAlert, Clock3, FileText, IndianRupee, Info, MessageSquareText,
  Send, ShieldCheck, Sparkles, TimerReset, Users, X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../campaign-brief/campaignMatching.js";
import { useDealState } from "../deal-state/DealStateContext.js";
import { getOfferMarkerPosition, getOfferPosition, getSuggestedCounter } from "./counterOfferRules.js";
import "./CreatorOffersPage.css";

const positionCopy = {
  below: { label: "Below fair band", detail: "₹{difference} below your minimum", icon: CircleAlert },
  within: { label: "Within fair band", detail: "Aligned with your current value", icon: CheckCircle2 },
  above: { label: "Above fair band", detail: "Higher than the benchmark ceiling", icon: Sparkles },
};

const responseCopy = {
  accepted: { title: "Offer accepted", detail: "The brand can now prepare the agreement.", icon: CheckCircle2 },
  countered: { title: "Counter-offer sent", detail: "The brand has your revised amount and message.", icon: Send },
  declined: { title: "Offer declined", detail: "The brand has been notified respectfully.", icon: X },
};

const dealStatusLabel = {
  sent: "Awaiting your response",
  editing: "Brand revising",
  countered: "Counter sent",
  accepted: "Accepted",
  declined: "Declined",
};

function defaultCounterMessage(offer) {
  const suggestion = getSuggestedCounter(offer);
  return `Thank you for considering me. Based on the deliverables, usage rights, and my current fair-rate band, I would be comfortable moving forward at ${formatMoney(suggestion.amount)}.`;
}

export function CreatorOffersPage() {
  const { deals, creatorAccept, creatorCounter, creatorDecline } = useDealState();
  const visibleOffers = deals.filter((deal) => deal.creatorId === "priya-kumari" && !["draft", "withdrawn"].includes(deal.dealStatus));
  const [selectedId, setSelectedId] = useState(visibleOffers[0]?.id);
  const [action, setAction] = useState(null);
  const initialOffer = visibleOffers.find((item) => item.id === selectedId) ?? visibleOffers[0];
  const [counterAmount, setCounterAmount] = useState(getSuggestedCounter(initialOffer).amount);
  const [counterMessage, setCounterMessage] = useState(defaultCounterMessage(initialOffer));
  const [declineReason, setDeclineReason] = useState("");

  const offer = visibleOffers.find((item) => item.id === selectedId) ?? visibleOffers[0];
  const suggestion = getSuggestedCounter(offer);
  const position = getOfferPosition(offer);
  const PositionIcon = positionCopy[position].icon;
  const response = ["accepted", "countered", "declined"].includes(offer.dealStatus) ? offer.dealStatus : null;
  const markerPosition = getOfferMarkerPosition(offer);
  const difference = Math.max(0, offer.fairMin - offer.amount);

  const selectOffer = (id) => {
    const nextOffer = visibleOffers.find((item) => item.id === id);
    setSelectedId(id);
    setAction(null);
    setCounterAmount(getSuggestedCounter(nextOffer).amount);
    setCounterMessage(defaultCounterMessage(nextOffer));
    setDeclineReason("");
  };

  const acceptOffer = () => {
    creatorAccept(offer.id, `${formatMoney(offer.amount)} · Agreement requested`);
    setAction(null);
  };

  const sendCounter = (event) => {
    event.preventDefault();
    creatorCounter(offer.id, Number(counterAmount), counterMessage.trim(), `${formatMoney(Number(counterAmount))} · “${counterMessage.trim()}”`);
    setAction(null);
  };

  const declineOffer = () => {
    creatorDecline(offer.id, declineReason.trim(), declineReason.trim() || "Not the right fit at this time");
    setAction(null);
  };

  return (
    <main className="creator-offers-page">
      <header className="creator-offers-hero">
        <div><p className="eyebrow">Offer workflow</p><h2>Know the scope.<br /><em>Negotiate your value.</em></h2><p>Review every term, compare it with your fair rate, and respond with evidence.</p></div>
        <dl><div><dt>Visible offers</dt><dd>{visibleOffers.length}</dd></div><div><dt>Awaiting response</dt><dd>{visibleOffers.filter((item) => item.dealStatus === "sent").length}</dd></div><div><dt>Connected updates</dt><dd>{visibleOffers.filter((item) => item.activity[0]?.time === "Just now").length}</dd></div></dl>
      </header>

      <div className="creator-offers-layout">
        <aside className="offer-inbox" aria-label="Incoming offers">
          <header><div><span>Inbox</span><h3>Incoming offers</h3></div><small>{visibleOffers.length} visible</small></header>
          <div className="offer-inbox__list">
            {visibleOffers.map((item) => {
              const itemPosition = getOfferPosition(item);
              return <button className={selectedId === item.id ? "is-selected" : ""} type="button" onClick={() => selectOffer(item.id)} key={item.id}>
                <span className="offer-inbox__brand">{item.brand.initials}</span>
                <span className="offer-inbox__copy"><small>{dealStatusLabel[item.dealStatus]}</small><strong>{item.brand.name}</strong><span>{item.campaign.name}</span><em><Clock3 size={11} />{item.respondBy.split(",")[0]}</em></span>
                <span className={`offer-inbox__amount offer-inbox__amount--${itemPosition}`}><strong>{formatMoney(item.amount)}</strong><small>{itemPosition === "below" ? `${formatMoney(item.fairMin - item.amount)} low` : "Fair"}</small></span>
                <ChevronRight size={15} />
              </button>;
            })}
          </div>
          <div className="offer-inbox__tip"><ShieldCheck size={17} /><p><strong>Your rate data stays yours.</strong>Brands see a fair band, not your private negotiation choices.</p></div>
        </aside>

        <div className="offer-review">
          <section className="offer-brand-card">
            <div className="offer-brand-card__mark">{offer.brand.initials}</div>
            <div><span>{offer.brand.category}</span><h3>{offer.brand.name} {offer.brand.verified && <BadgeCheck size={16} />}</h3><p>{offer.brand.contact}</p></div>
            <div className="offer-deadline"><Clock3 size={15} /><span>Respond by<strong>{offer.respondBy}</strong></span></div>
          </section>

          {response && (() => { const ResponseIcon = responseCopy[response].icon; return <section className={`offer-response-banner offer-response-banner--${response}`}><ResponseIcon size={21} /><div><strong>{responseCopy[response].title}</strong><p>{responseCopy[response].detail}</p></div>{response === "accepted" ? <Link to="/creator/collaborations">Open campaign</Link> : <button type="button" onClick={() => document.querySelector("#negotiation-history")?.scrollIntoView({ behavior: "smooth" })}>View history</button>}</section>; })()}
          {offer.dealStatus === "editing" && <section className="offer-response-banner offer-response-banner--editing"><Clock3 size={21} /><div><strong>Brand is revising this offer</strong><p>Your existing terms remain visible. Response actions will return when the updated offer is sent.</p></div><button type="button" onClick={() => document.querySelector("#negotiation-history")?.scrollIntoView({ behavior: "smooth" })}>View history</button></section>}

          <section className="offer-detail-panel campaign-overview">
            <header><span>Campaign</span><small>Sent {offer.sentAt}</small></header>
            <h3>{offer.campaign.name}</h3><p>{offer.campaign.objective}</p>
            <dl><div><dt><Users size={14} />Target audience</dt><dd>{offer.campaign.audience}</dd></div><div><dt><IndianRupee size={14} />Brand offer</dt><dd>{formatMoney(offer.amount)}</dd></div></dl>
            <blockquote>“{offer.note}”</blockquote>
          </section>

          <section className="offer-detail-panel offer-terms-panel">
            <header><span>Scope & terms</span><small>Read before responding</small></header>
            <div className="offer-terms-grid">
              <div><h4><FileText size={15} />Deliverables</h4>{offer.deliverables.map((item) => <article key={item.title}><Check size={13} /><span><strong>{item.title}</strong><small>{item.detail}</small></span></article>)}</div>
              <div><h4><CalendarDays size={15} />Key dates</h4>{offer.dates.map((item) => <article key={item.label}><span className="date-dot" /><span><strong>{item.label}</strong><small>{item.value}</small></span></article>)}</div>
            </div>
            <dl className="offer-rights-list"><div><dt>Usage rights</dt><dd>{offer.usageRights}</dd></div><div><dt>Exclusivity</dt><dd>{offer.exclusivity}</dd></div><div><dt>Payment terms</dt><dd>{offer.paymentTerms}</dd></div></dl>
          </section>

          {offer.dealStatus === "sent" && !action && <section className="offer-action-bar"><div><span>Your response</span><strong>Choose what works for you.</strong></div><div><button className="offer-decline-button" type="button" onClick={() => setAction("decline")}><X size={15} />Decline</button><button className="button button--outline" type="button" onClick={() => setAction("counter")}><MessageSquareText size={15} />Counter</button><button className="button button--primary" type="button" onClick={acceptOffer}><Check size={15} />Accept {formatMoney(offer.amount)}</button></div></section>}

          {action === "counter" && <form className="offer-response-form" onSubmit={sendCounter}>
            <header><div><span>Counter-offer</span><h3>Propose terms that reflect the work.</h3></div><button type="button" onClick={() => setAction(null)} aria-label="Close counter form"><X size={17} /></button></header>
            <div className="suggestion-callout"><Sparkles size={17} /><div><span>Rule-based suggestion</span><strong>{formatMoney(suggestion.amount)}</strong><p>{suggestion.explanation}</p></div><button type="button" onClick={() => setCounterAmount(suggestion.amount)}>Use suggestion</button></div>
            <div className="counter-form-grid"><label><span>Counter amount</span><div><IndianRupee size={18} /><input type="number" min="1000" step="500" value={counterAmount} onChange={(event) => setCounterAmount(event.target.value)} /></div></label><label><span>Message to {offer.brand.name}</span><textarea rows="5" minLength="10" required value={counterMessage} onChange={(event) => setCounterMessage(event.target.value)} /></label></div>
            <footer><small><Info size={13} />You can edit both the suggested amount and message.</small><button className="button button--primary" type="submit" disabled={Number(counterAmount) < 1000 || counterMessage.trim().length < 10}><Send size={15} />Send counter-offer</button></footer>
          </form>}

          {action === "decline" && <section className="offer-decline-confirm"><CircleAlert size={21} /><div><span>Decline offer</span><h3>Close this opportunity?</h3><p>The brand will be notified. Adding a short reason can help preserve the relationship.</p><textarea rows="3" placeholder="Optional note to the brand" value={declineReason} onChange={(event) => setDeclineReason(event.target.value)} /><div><button type="button" onClick={() => setAction(null)}>Keep reviewing</button><button type="button" onClick={declineOffer}>Decline offer</button></div></div></section>}

          <section className="offer-detail-panel negotiation-history" id="negotiation-history">
            <header><span>Shared negotiation history</span><small>{offer.activity.length} updates</small></header>
            <ol>{offer.activity.map((item, index) => <li key={`${item.title}-${index}`}><span className={`history-icon history-icon--${item.actor}`}>{item.actor === "creator" ? <MessageSquareText size={13} /> : item.actor === "brand" ? <Send size={13} /> : <Sparkles size={13} />}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div></li>)}</ol>
          </section>
        </div>

        <aside className={`creator-fair-rate creator-fair-rate--${position}`}>
          <div className="creator-fair-rate__eyebrow"><ShieldCheck size={15} />Fair-rate evidence</div>
          <span>Your scope-adjusted band</span><h3>{formatMoney(offer.fairMin)}–{formatMoney(offer.fairMax)}</h3><p>Based on the campaign scope, rights, regional relevance, and your verified audience quality.</p>
          <div className="creator-offer-chart"><div><span>Lower</span><span>Higher</span></div><i><span className="creator-fair-zone" /><em style={{ left: `${markerPosition}%` }}><strong>{formatMoney(offer.amount)}</strong></em></i><small>Fair value zone</small></div>
          <div className="creator-rate-status"><PositionIcon size={19} /><div><strong>{positionCopy[position].label}</strong><span>{positionCopy[position].detail.replace("₹{difference}", formatMoney(difference))}</span></div></div>
          <div className="creator-rate-evidence"><h4>Why this band</h4>{offer.rateEvidence.map((item) => <p key={item}><CheckCircle2 size={13} />{item}</p>)}</div>
          <div className="counter-rule-card"><div><TimerReset size={15} /><span>Suggested counter<strong>{formatMoney(suggestion.amount)}</strong></span></div><p>{suggestion.explanation}</p><dl>{suggestion.steps.map((step) => <div className={step.total ? "is-total" : ""} key={step.label}><dt>{step.label}</dt><dd>{formatMoney(step.value)}</dd></div>)}</dl><button type="button" disabled={offer.dealStatus !== "sent"} onClick={() => { setCounterAmount(suggestion.amount); setAction("counter"); }}>{offer.dealStatus === "sent" ? <>Counter with evidence <ArrowRight size={14} /></> : <>Response recorded <Check size={14} /></>}</button></div>
          <small className="creator-rate-note"><Info size={12} />Suggestion rule: fair floor + 10% only for delivery in 10 days or less, rounded to ₹500 and capped at the band ceiling.</small>
        </aside>
      </div>
    </main>
  );
}
