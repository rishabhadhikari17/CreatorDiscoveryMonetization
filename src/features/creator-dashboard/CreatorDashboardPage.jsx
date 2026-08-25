import {
  ArrowRight, CalendarDays, Check, ChevronRight, CircleAlert, CircleCheck,
  IndianRupee, Lightbulb, MapPin, Sparkles, TrendingUp, Users, WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import creatorHero from "../../assets/regional-creator-hero.jpg";
import { formatAudience, formatRate } from "../creator-discovery/creatorSearch.js";
import { getCreatorProfile } from "../creator-profile/data/creatorProfiles.js";
import { CREATOR_PROFILE_UPDATED_EVENT, getProfileCompletion, readCreatorProfileEdits } from "../creator-profile/creatorProfileStorage.js";
import { formatMoney } from "../campaign-brief/campaignMatching.js";
import { useDealState } from "../deal-state/DealStateContext.js";
import { getOfferPosition } from "../creator-offers/counterOfferRules.js";
import { earningsMonths, improvementSuggestions } from "./data/creatorDashboardData.js";
import "./CreatorDashboardPage.css";

const maxEarnings = Math.max(...earningsMonths.map((item) => item.amount));

function PanelHeading({ eyebrow, title, link, linkLabel }) {
  return <div className="creator-panel-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div>{link && <Link to={link}>{linkLabel}<ArrowRight size={14} /></Link>}</div>;
}

export function CreatorDashboardPage() {
  const [creator, setCreator] = useState(() => getCreatorProfile("priya-kumari"));
  const [profileCompletion, setProfileCompletion] = useState(() => {
    const savedProfile = readCreatorProfileEdits("priya-kumari");
    return savedProfile ? getProfileCompletion(savedProfile) : 94;
  });
  const { deals, campaigns } = useDealState();
  const currentOffers = deals.filter((deal) => deal.creatorId === "priya-kumari" && ["sent", "editing", "countered"].includes(deal.dealStatus)).map((deal) => ({
    ...deal,
    brandName: deal.brand.name,
    campaignName: deal.campaign.name,
    tone: getOfferPosition(deal),
    statusLabel: deal.dealStatus === "countered" ? "Counter sent" : deal.dealStatus === "editing" ? "Brand revising" : "Awaiting response",
  }));
  const activeCollaborations = campaigns.filter((campaign) => campaign.creatorId === "priya-kumari" && campaign.status !== "completed").map((campaign) => ({
    id: campaign.id,
    brand: campaign.brand.name,
    campaign: campaign.campaign.name,
    deliverable: campaign.contract.scope.join(" + "),
    due: campaign.contract.publishBy,
    progress: { creating: 28, in_review: 52, revision_requested: 46, approved: 72, delivered: 88 }[campaign.status] ?? 100,
    stage: { creating: "Creating", in_review: "In review", revision_requested: "Revising", approved: "Approved", delivered: "Delivered" }[campaign.status] ?? "Complete",
    value: formatMoney(campaign.amount),
    brandInitials: campaign.brand.initials,
    nextTitle: campaign.status === "creating" ? "First cut is due next" : campaign.status === "in_review" ? "Brand review in progress" : campaign.status === "revision_requested" ? "Revision feedback received" : campaign.status === "approved" ? "Ready for delivery confirmation" : "Payment release pending",
    nextCopy: campaign.status === "creating" ? "Open the collaboration to submit a demo draft." : "Open the shared campaign record for the latest action.",
  }));
  const [completedTips, setCompletedTips] = useState([]);
  const completeness = Math.min(100, profileCompletion + completedTips.length * 2);
  const toggleTip = (id) => setCompletedTips((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  useEffect(() => {
    const refreshProfile = (event) => {
      setCreator(getCreatorProfile("priya-kumari"));
      if (event.detail?.profile) setProfileCompletion(getProfileCompletion(event.detail.profile));
    };
    window.addEventListener(CREATOR_PROFILE_UPDATED_EVENT, refreshProfile);
    return () => window.removeEventListener(CREATOR_PROFILE_UPDATED_EVENT, refreshProfile);
  }, []);

  return (
    <main className="creator-dashboard">
      <header className="creator-dashboard__welcome">
        <div><p className="eyebrow">Tuesday · 11 August</p><h2>Namaste, Priya.</h2><p>Your community value, opportunities, and earnings—all in one place.</p></div>
        <Link className="profile-completeness" to="/creator/profile"><img className="profile-completeness__photo" src={creator.avatarDataUrl || creatorHero} alt="" /><div className="profile-completeness__ring" style={{ "--completion-angle": `${completeness * 3.6}deg` }}><span>{completeness}%</span></div><div><span>Profile strength</span><strong>{completeness === 100 ? "Complete" : "Nearly there"}</strong><small>{100 - completeness}% left to complete</small></div><ChevronRight size={16} /></Link>
      </header>

      <section className="creator-value-grid" aria-label="Creator value summary">
        <article className="creator-value-card quality-value-card">
          <div className="value-card__eyebrow"><Sparkles size={14} /> Engagement quality</div>
          <div className="creator-quality-hero"><div className="creator-quality-ring" style={{ "--quality-angle": `${creator.quality * 3.6}deg` }}><span><strong>{creator.quality}</strong><small>/100</small></span></div><div><span>Top {100 - creator.percentile}%</span><h3>Trusted attention.</h3><p>{creator.confidence}% confidence across {creator.cohortSize} comparable creators.</p></div></div>
          <div className="creator-score-mini">{creator.components.map((component) => <div key={component.key}><span>{component.label}</span><i><span style={{ width: `${component.score}%` }} /></i><strong>{component.score}</strong></div>)}</div>
          <Link to="/creator/profile">Understand your score <ArrowRight size={14} /></Link>
        </article>

        <article className="creator-value-card rate-value-card">
          <div className="value-card__eyebrow"><IndianRupee size={14} /> Fair campaign rate</div>
          <span>Your recommended band</span><h3>{formatRate(creator.rateMin)}–{formatRate(creator.rateMax)}</h3><p>For one primary branded deliverable with standard creator-channel usage.</p>
          <div className="creator-rate-track"><div><span>{formatRate(Math.round(creator.rateMin * 0.7))}</span><span>{formatRate(Math.round(creator.rateMax * 1.3))}</span></div><i><span /></i><strong>Fair value zone</strong></div>
          <ul><li><Check size={14} />{creator.quality}/100 audience quality</li><li><Check size={14} />{creator.localReach}% audience in {creator.state}</li><li><Check size={14} />{creator.engagement}% meaningful engagement</li></ul>
          <Link to="/creator/offers">Compare current offers <ArrowRight size={14} /></Link>
        </article>

        <article className="creator-value-card audience-value-card">
          <div className="value-card__eyebrow"><Users size={14} /> Audience snapshot</div>
          <div className="audience-community"><strong>{formatAudience(creator.audience)}</strong><span>cross-platform community</span></div>
          <div className="audience-insight-list"><div><MapPin size={15} /><span><strong>{creator.regionalAudience[0][1]}% in {creator.regionalAudience[0][0]}</strong>{creator.localReach}% across {creator.state}</span></div><div><Users size={15} /><span><strong>{creator.demographics.age[1][1]}% aged {creator.demographics.age[1][0]}</strong>{creator.demographics.gender[0][1]}% women audience</span></div><div><TrendingUp size={15} /><span><strong>{creator.engagement}% engagement</strong>Above the Bhojpuri cohort median</span></div></div>
          <div className="audience-language"><span>Primary language</span><strong>{creator.language}</strong><small>{creator.languageBreakdown[0][1]}% of active conversations</small></div>
          <Link to="/creator/profile">View audience intelligence <ArrowRight size={14} /></Link>
        </article>
      </section>

      <div className="creator-dashboard-layout">
        <section className="creator-dashboard-panel creator-offers-panel">
          <PanelHeading eyebrow="Opportunities" title="Current offers" link="/creator/offers" linkLabel="View all" />
          <div className="creator-offer-list">{currentOffers.map((offer) => <article key={offer.id}><div className="offer-brand-mark">{offer.brand.initials}</div><div><span>{offer.statusLabel}</span><h4>{offer.brandName}</h4><p>{offer.campaignName}</p><small>Respond by {offer.respondBy}</small></div><div className={`creator-offer-value creator-offer-value--${offer.tone}`}><span>{offer.dealStatus === "countered" ? "Your counter" : "Offer"}</span><strong>{formatMoney(offer.dealStatus === "countered" ? offer.counterAmount : offer.amount)}</strong><small>{offer.tone === "below" ? `${formatMoney(offer.fairMin - offer.amount)} below band` : "Within your fair band"}</small></div><Link to="/creator/offers" aria-label={`Review ${offer.brandName} offer`}><ChevronRight size={16} /></Link></article>)}</div>
        </section>

        <section className="creator-dashboard-panel creator-collaboration-panel">
          <PanelHeading eyebrow="In progress" title="Active collaboration" link="/creator/collaborations" linkLabel="Open work" />
          {activeCollaborations.map((item) => <article className="active-collaboration" key={item.id}><header><div className="collab-brand-mark">{item.brandInitials}</div><div><span>{item.stage}</span><h4>{item.brand}</h4><p>{item.campaign}</p></div><strong>{item.value}</strong></header><div className="collaboration-progress"><div><span>Campaign progress</span><strong>{item.progress}%</strong></div><i><span style={{ width: `${item.progress}%` }} /></i></div><dl><div><dt>Deliverables</dt><dd>{item.deliverable}</dd></div><div><dt>Next deadline</dt><dd>{item.due}</dd></div></dl><div className="collab-next-step"><CalendarDays size={15} /><span><strong>{item.nextTitle}</strong>{item.nextCopy}</span><Link to="/creator/collaborations">Continue <ArrowRight size={14} /></Link></div></article>)}
        </section>
      </div>

      <div className="creator-dashboard-bottom">
        <section className="creator-dashboard-panel earnings-panel">
          <PanelHeading eyebrow="Money" title="Earnings & payments" />
          <div className="earnings-summary"><div><WalletCards size={17} /><span>Available balance<strong>₹40,500</strong><small>Ready for payout</small></span></div><div><Clock3Icon /><span>Pending payments<strong>₹22,000</strong><small>1 campaign payment</small></span></div><div><TrendingUp size={17} /><span>Earned this quarter<strong>₹1,37,000</strong><small>+24% vs last quarter</small></span></div></div>
          <div className="earnings-chart"><div className="earnings-chart__scale"><span>₹40K</span><span>₹20K</span><span>₹0</span></div><div className="earnings-bars">{earningsMonths.map((item) => <div key={item.month}><span title={formatMoney(item.amount)} style={{ height: `${item.amount / maxEarnings * 100}%` }}><i>{formatMoney(item.amount)}</i></span><small>{item.month}</small></div>)}</div></div>
          <div className="payment-note"><CircleCheck size={15} /><span><strong>Next payout: 18 August</strong>₹22,000 from Ghar ka Swaad</span></div>
        </section>

        <section className="creator-dashboard-panel improvement-panel">
          <PanelHeading eyebrow="Grow your value" title="Recommended next steps" />
          <div className="improvement-intro"><Lightbulb size={17} /><p>Small profile updates help brands understand your value faster.</p></div>
          <div className="improvement-list">{improvementSuggestions.map((tip) => { const done = completedTips.includes(tip.id); return <article className={done ? "is-complete" : ""} key={tip.id}><span>{done ? <Check size={15} /> : <Sparkles size={15} />}</span><div><strong>{tip.title}</strong><p>{tip.copy}</p><small>{done ? "Marked complete" : tip.impact}</small></div><button type="button" onClick={() => toggleTip(tip.id)}>{done ? "Undo" : tip.action}</button></article>; })}</div>
        </section>
      </div>
    </main>
  );
}

function Clock3Icon() {
  return <CircleAlert size={17} />;
}
