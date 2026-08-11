import {
  ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, ChevronRight,
  CircleAlert, CircleCheck, Clock3, Edit3, FileText, IndianRupee, Info,
  MapPin, MessageSquareText, RotateCcw, Send, ShieldCheck, Sparkles, Trash2, Users, X,
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatAudience } from "../creator-discovery/creatorSearch.js";
import { getCreatorProfile } from "../creator-profile/data/creatorProfiles.js";
import { formatMoney } from "../campaign-brief/campaignMatching.js";
import { useDealState } from "../deal-state/DealStateContext.js";
import { calculateFairBand, compareOffer, offerMarkerPosition, usageRights } from "./dealPricing.js";
import "./DealRoomPage.css";

const deliverableOptions = [
  { id: "Instagram Reel", note: "30–60 sec vertical video" },
  { id: "Story set", note: "3–5 supporting story frames" },
  { id: "YouTube integration", note: "60–90 sec in-video feature" },
  { id: "Photo carousel", note: "4–6 campaign images" },
];

const statusCopy = {
  below: { title: "This offer is below the fair band.", copy: "The amount may not reflect the selected scope and creator’s calibrated audience value." },
  within: { title: "This offer sits within the fair band.", copy: "It aligns with comparable regional creators, selected deliverables, and usage rights." },
  above: { title: "This offer is above the fair band.", copy: "That can be intentional for urgency, exclusivity, category fit, or priority access." },
};

function DealStages({ status }) {
  const activeIndex = status === "accepted" ? 3 : ["sent", "countered", "declined"].includes(status) ? 2 : 1;
  const stages = ["Brief ready", "Offer draft", "Creator review", "Agreement"];
  return (
    <ol className={`deal-stages${status === "withdrawn" ? " is-withdrawn" : ""}`}>
      {stages.map((stage, index) => <li className={index < activeIndex ? "is-complete" : index === activeIndex ? "is-active" : ""} key={stage}><span>{index < activeIndex ? <Check size={13} /> : index + 1}</span><div><strong>{stage}</strong><small>{index === activeIndex ? status === "sent" ? "Waiting for creator" : status === "countered" ? "Counter received" : status === "accepted" ? "Terms agreed" : "Current stage" : index < activeIndex ? "Complete" : "Upcoming"}</small></div></li>)}
    </ol>
  );
}

function ScopeOption({ active, title, note, onClick }) {
  return <button className={`deal-scope-option${active ? " is-selected" : ""}`} type="button" onClick={onClick} aria-pressed={active}><span><Check size={13} /></span><div><strong>{title}</strong><small>{note}</small></div></button>;
}

export function DealRoomPage() {
  const { getBrandDeal, sendOffer: saveOffer, startEditing, withdrawOffer: saveWithdrawal, prepareDraft, brandAcceptCounter } = useDealState();
  const [searchParams] = useSearchParams();
  const requestedCreator = getCreatorProfile(searchParams.get("creator"));
  const creator = requestedCreator ?? getCreatorProfile("priya-kumari");
  const deal = getBrandDeal(creator.id);
  const [deliverables, setDeliverables] = useState(deal.deliverableIds);
  const [rightsId, setRightsId] = useState(deal.rightsId);
  const [exclusivity, setExclusivity] = useState(deal.editorExclusivity);
  const [amount, setAmount] = useState(deal.amount);
  const [rationale, setRationale] = useState(deal.note);
  const [withdrawConfirm, setWithdrawConfirm] = useState(false);
  const dealStatus = deal.dealStatus;
  const activity = deal.activity;

  const band = calculateFairBand(creator, deliverables, rightsId, exclusivity);
  const comparison = compareOffer(amount, band);
  const markerPosition = offerMarkerPosition(amount, band);
  const isEditing = dealStatus === "draft" || dealStatus === "editing";
  const canSend = deliverables.length > 0 && Number(amount) > 0 && rationale.trim().length >= 20;

  const toggleDeliverable = (id) => setDeliverables((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const sendOffer = () => {
    const scope = deliverables.map((id) => ({ title: id === "Story set" ? "3 Story frames" : id === "Photo carousel" ? "1 Photo carousel" : id === "YouTube integration" ? "1 YouTube integration" : "1 Instagram Reel", detail: deliverableOptions.find((option) => option.id === id)?.note ?? id }));
    saveOffer(deal.id, {
      amount: Number(amount),
      fairMin: band.min,
      fairMax: band.max,
      deliverables: scope,
      deliverableIds: deliverables,
      rightsId,
      usageRights: band.rights.label,
      editorExclusivity: exclusivity,
      exclusivity: exclusivity ? "30-day category exclusivity" : "None",
      note: rationale,
      sentAt: "Just now",
    }, `${formatMoney(Number(amount))} · ${comparison.label}`, dealStatus === "editing");
  };
  const withdrawOffer = () => {
    saveWithdrawal(deal.id, `${formatMoney(deal.amount)} offer closed by brand`);
    setWithdrawConfirm(false);
  };
  const prepareAgain = () => prepareDraft(deal.id);
  const acceptCounter = () => {
    setAmount(deal.counterAmount);
    brandAcceptCounter(deal.id, `${formatMoney(deal.counterAmount)} accepted · Agreement requested`);
  };

  return (
    <main className="deal-room-page">
      <nav className="deal-breadcrumb" aria-label="Breadcrumb"><Link to="/brand/shortlist"><ArrowLeft size={15} /> Campaign brief</Link><ChevronRight size={14} /><span>Offer for {creator.name}</span></nav>

      <header className="deal-room-header">
        <div><p className="eyebrow">Offer creation & deal room</p><h2>Make the value clear<br /><em>before you make the offer.</em></h2><p>Set the scope, compare compensation with a transparent fair band, and keep every stage visible.</p></div>
        <div className={`deal-status-chip deal-status-chip--${dealStatus}`}><span><i />{dealStatus === "draft" ? "Draft offer" : dealStatus === "editing" ? "Editing offer" : dealStatus === "sent" ? "Awaiting creator" : dealStatus === "countered" ? "Counter received" : dealStatus === "accepted" ? "Terms accepted" : dealStatus === "declined" ? "Creator declined" : "Offer withdrawn"}</span><small>{deal.campaign.name}</small></div>
      </header>

      <section className="deal-overview-card">
        <div className="deal-creator">
          <div className="deal-creator-avatar" aria-hidden="true"><strong>{creator.initials}</strong><span>{creator.script}</span></div>
          <div><span>{creator.language} · {creator.niche}</span><h3>{creator.name} <BadgeCheck size={16} /></h3><p><MapPin size={13} />{creator.district}, {creator.state} · {formatAudience(creator.audience)} audience</p></div>
        </div>
        <dl><div><dt>Quality score</dt><dd>{creator.quality}/100</dd></div><div><dt>Base fair rate</dt><dd>{formatMoney(creator.rateMin)}–{formatMoney(creator.rateMax)}</dd></div><div><dt>Campaign fit</dt><dd>96%</dd></div></dl>
        <Link to={`/brand/creators/${creator.id}`}>View intelligence <ArrowRight size={14} /></Link>
      </section>

      <DealStages status={dealStatus} />

      <div className="deal-room-layout">
        <div className="deal-room-main">
          <fieldset className="deal-panel deal-scope-panel" disabled={!isEditing}>
            <div className="deal-panel__heading"><div><span>01 · Scope</span><h3>What will {creator.name.split(" ")[0]} create?</h3></div><small>{deliverables.length} selected</small></div>
            <div className="deal-scope-grid">{deliverableOptions.map((option) => <ScopeOption active={deliverables.includes(option.id)} title={option.id} note={option.note} onClick={() => toggleDeliverable(option.id)} key={option.id} />)}</div>
          </fieldset>

          <fieldset className="deal-panel usage-rights-panel" disabled={!isEditing}>
            <div className="deal-panel__heading"><div><span>02 · Rights</span><h3>How can the content be used?</h3></div><small>Usage changes the fair band</small></div>
            <div className="usage-rights-list">{usageRights.map((rights) => <label className={`usage-right-option${rightsId === rights.id ? " is-selected" : ""}`} key={rights.id}><input type="radio" name="usage-rights" value={rights.id} checked={rightsId === rights.id} onChange={() => setRightsId(rights.id)} /><span><i /></span><div><strong>{rights.label}</strong><small>{rights.note}</small></div><em>×{rights.multiplier.toFixed(2)}</em></label>)}</div>
            <label className={`exclusivity-option${exclusivity ? " is-selected" : ""}`}><input type="checkbox" checked={exclusivity} onChange={(event) => setExclusivity(event.target.checked)} /><span><Check size={13} /></span><div><strong>30-day category exclusivity</strong><small>Creator won’t work with direct category competitors · adds 20%</small></div><em>×1.20</em></label>
          </fieldset>

          <fieldset className="deal-panel offer-details-panel" disabled={!isEditing}>
            <div className="deal-panel__heading"><div><span>03 · Offer</span><h3>Set compensation and rationale.</h3></div><small>Editable before sending</small></div>
            <div className="offer-amount-field"><label htmlFor="offer-amount">Offer amount</label><div><IndianRupee size={20} /><input id="offer-amount" type="number" min="1000" step="500" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></div></div>
            <input className="offer-range" type="range" min="5000" max={Math.max(80000, band.max * 1.4)} step="500" value={Math.min(amount, Math.max(80000, band.max * 1.4))} onChange={(event) => setAmount(Number(event.target.value))} aria-label="Offer amount slider" />
            <div className="offer-presets"><span>Quick preview</span><button type="button" onClick={() => setAmount(Math.max(1000, band.min - 5000))}>Below band</button><button type="button" onClick={() => setAmount(Math.round((band.min + band.max) / 1000) * 500)}>Within band</button><button type="button" onClick={() => setAmount(band.max + 5000)}>Above band</button></div>
            <label className="offer-rationale"><span>Offer rationale</span><textarea rows="4" value={rationale} maxLength="320" onChange={(event) => setRationale(event.target.value)} /><small>{rationale.length}/320 · Explain scope, timing, and why this amount is appropriate.</small></label>
          </fieldset>

          {dealStatus === "sent" && (
            <section className="sent-offer-summary">
              <CircleCheck size={22} /><div><span>Offer sent</span><h3>{formatMoney(deal.amount)} is with {creator.name}.</h3><p>They can accept, counter, or decline. This deal room updates when they respond.</p></div>
              <div><button className="button button--outline" type="button" onClick={() => startEditing(deal.id)}><Edit3 size={15} /> Edit offer</button><button className="withdraw-button" type="button" onClick={() => setWithdrawConfirm(true)}><Trash2 size={14} /> Withdraw</button></div>
            </section>
          )}

          {dealStatus === "countered" && <section className="creator-response-card creator-response-card--counter"><MessageSquareText size={22} /><div><span>Creator counter received</span><h3>{creator.name} proposed {formatMoney(deal.counterAmount)}.</h3><p>“{deal.counterMessage}”</p></div><div><button className="button button--outline" type="button" onClick={() => startEditing(deal.id)}><Edit3 size={15} /> Revise offer</button><button className="button button--primary" type="button" onClick={acceptCounter}><Check size={15} /> Accept counter</button></div></section>}

          {dealStatus === "accepted" && <section className="creator-response-card creator-response-card--accepted"><CircleCheck size={22} /><div><span>Terms agreed</span><h3>{formatMoney(deal.amount)} accepted by both sides.</h3><p>This connected deal now has an active campaign execution workspace.</p></div><Link className="button button--outline" to="/brand/campaigns">Track campaign <ArrowRight size={15} /></Link></section>}

          {dealStatus === "declined" && <section className="creator-response-card creator-response-card--declined"><X size={22} /><div><span>Creator declined</span><h3>This offer was not accepted.</h3><p>{deal.declineReason || "The creator did not add a reason."}</p></div><button className="button button--outline" type="button" onClick={prepareAgain}><RotateCcw size={15} /> Prepare new offer</button></section>}

          {withdrawConfirm && <section className="withdraw-confirm"><CircleAlert size={20} /><div><strong>Withdraw this offer?</strong><p>{creator.name} will see that the offer is no longer active. You can prepare a new offer later.</p></div><div><button type="button" onClick={() => setWithdrawConfirm(false)}>Keep offer</button><button type="button" onClick={withdrawOffer}>Withdraw offer</button></div></section>}

          {dealStatus === "withdrawn" && <section className="withdrawn-state"><X size={20} /><div><strong>Offer withdrawn</strong><p>No active offer is currently visible to the creator.</p></div><button className="button button--outline" type="button" onClick={prepareAgain}><RotateCcw size={15} /> Prepare new offer</button></section>}

          <section className="deal-panel deal-activity-panel">
            <div className="deal-panel__heading"><div><span>Deal record</span><h3>Activity timeline</h3></div></div>
            <ol>{activity.map((item, index) => <li key={`${item.title}-${index}`}><span>{item.actor === "creator" ? <MessageSquareText size={14} /> : index === 0 ? <Sparkles size={14} /> : <Check size={13} />}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time} · {item.actor === "creator" ? "Creator" : item.actor === "brand" ? "Brand" : "Platform"}</small></div></li>)}</ol>
          </section>
        </div>

        <aside className={`fair-offer-card fair-offer-card--${comparison.status}`}>
          <div className="fair-offer-card__eyebrow"><ShieldCheck size={15} /> Live fair-band check</div>
          <span>Selected-scope fair band</span><h3>{formatMoney(band.min)}–{formatMoney(band.max)}</h3><p>Adjusted from {creator.name}’s base rate using only the scope and rights selected here.</p>

          <div className="offer-comparison-chart">
            <div className="offer-chart-labels"><span>Lower</span><span>Higher</span></div>
            <div className="offer-chart-track"><span className="fair-band-zone" /><i style={{ left: `${markerPosition}%` }}><strong>{formatMoney(Number(amount || 0))}</strong></i></div>
            <div className="fair-band-caption"><span>Fair band</span></div>
          </div>

          <div className="comparison-status"><span>{comparison.status === "within" ? <CircleCheck size={18} /> : <CircleAlert size={18} />}</span><div><strong>{comparison.label}</strong><p>{statusCopy[comparison.status].title}</p></div></div>
          <p className="comparison-explanation">{statusCopy[comparison.status].copy}</p>
          <div className="comparison-difference">{comparison.status === "below" ? `${formatMoney(comparison.difference)} below minimum` : comparison.status === "above" ? `${formatMoney(comparison.difference)} above maximum` : `${formatMoney(comparison.difference)} to nearest band edge`}</div>

          <div className="pricing-reasons">
            <h4>Why this band</h4>
            <div><FileText size={14} /><span><strong>{deliverables.length || 0} deliverable{deliverables.length === 1 ? "" : "s"}</strong>Scope factor ×{band.deliverableFactor.toFixed(2)}</span></div>
            <div><Users size={14} /><span><strong>{band.rights.label}</strong>Usage factor ×{band.rightsFactor.toFixed(2)}</span></div>
            <div><Clock3 size={14} /><span><strong>{exclusivity ? "30-day exclusivity" : "No exclusivity"}</strong>Exclusivity factor ×{band.exclusivityFactor.toFixed(2)}</span></div>
            <div><ShieldCheck size={14} /><span><strong>{creator.quality}/100 audience quality</strong>Benchmarked against {creator.cohortSize} comparable creators</span></div>
          </div>

          {isEditing && <button className="button button--primary" type="button" disabled={!canSend} onClick={sendOffer}><Send size={16} />{dealStatus === "editing" ? "Update and resend" : "Send offer"}</button>}
          {!canSend && isEditing && <small>Select a deliverable and add a clear rationale to continue.</small>}
          {dealStatus === "sent" && <div className="offer-locked-note"><Clock3 size={14} /> Sent offer is locked until edited.</div>}
          {dealStatus === "countered" && <div className="offer-locked-note"><MessageSquareText size={14} /> Review the creator's counter before continuing.</div>}
          {dealStatus === "accepted" && <div className="offer-locked-note"><CircleCheck size={14} /> Both sides have accepted these terms.</div>}
          {dealStatus === "declined" && <div className="offer-locked-note"><X size={14} /> Creator declined this offer.</div>}
          {dealStatus === "withdrawn" && <div className="offer-locked-note"><X size={14} /> This offer is no longer active.</div>}
          <div className="pricing-note"><Info size={14} />No payment is processed in this frontend demo.</div>
        </aside>
      </div>
    </main>
  );
}
