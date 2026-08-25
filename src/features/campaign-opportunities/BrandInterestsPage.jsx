import {
  ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, ChevronRight,
  Clock3, IndianRupee, Languages, MapPin, MessageSquareText, Sparkles, Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../campaign-brief/campaignMatching.js";
import { creators } from "../creator-discovery/data/creators.js";
import { formatAudience, formatRate } from "../creator-discovery/creatorSearch.js";
import { useDealState } from "../deal-state/DealStateContext.js";
import "./CampaignOpportunities.css";

function InterestCard({ interest, opportunity, creator }) {
  if (!creator || !opportunity) return null;
  return (
    <article className="brand-interest-card">
      <header>
        <div className="interest-creator-avatar" aria-hidden="true"><strong>{creator.initials}</strong><span>{creator.script}</span></div>
        <div className="interest-creator-name"><span>{creator.language} · {creator.niche}</span><h3>{creator.name} <BadgeCheck size={16} /></h3><p>{creator.handle}</p></div>
        <div className="interest-match"><Sparkles size={13} /><strong>{interest.match}%</strong><span>campaign fit</span></div>
      </header>
      <div className="interest-campaign-link"><BriefcaseBusiness size={14} /><span>Interested in</span><strong>{opportunity.title}</strong><small>{interest.sharedAt}</small></div>
      <blockquote><MessageSquareText size={16} /><p>“{interest.message}”</p></blockquote>
      <dl className="interest-creator-stats">
        <div><dt>Audience</dt><dd>{formatAudience(creator.audience)}</dd></div>
        <div><dt>Quality</dt><dd>{creator.quality}/100</dd></div>
        <div><dt>Engagement</dt><dd>{creator.engagement}%</dd></div>
        <div><dt>Fair rate</dt><dd>{formatRate(creator.rateMin)}–{formatRate(creator.rateMax)}</dd></div>
      </dl>
      <div className="interest-creator-meta"><span><MapPin size={13} />{creator.district}, {creator.state}</span><span><Languages size={13} />{creator.languages.join(" + ")}</span><span><i />{creator.availability}</span></div>
      <footer><Link className="button button--outline" to={`/brand/creators/${creator.id}`}>View full profile <ChevronRight size={15} /></Link><Link className="button button--primary" to={`/brand/deals?creator=${creator.id}`}>Start a fair offer <ArrowRight size={15} /></Link></footer>
    </article>
  );
}

export function BrandInterestsPage() {
  const { opportunities, interests } = useDealState();
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("all");
  const brandOpportunities = opportunities.filter((opportunity) => opportunity.brand.name === "Rooted Foods");
  const brandOpportunityIds = new Set(brandOpportunities.map((opportunity) => opportunity.id));
  const brandInterests = interests.filter((interest) => brandOpportunityIds.has(interest.opportunityId));
  const visibleInterests = selectedOpportunityId === "all" ? brandInterests : brandInterests.filter((interest) => interest.opportunityId === selectedOpportunityId);
  const selectedOpportunity = brandOpportunities.find((opportunity) => opportunity.id === selectedOpportunityId);

  const countFor = (opportunityId) => brandInterests.filter((interest) => interest.opportunityId === opportunityId).length;

  return (
    <main className="brand-interests-page">
      <header className="brand-interests-hero">
        <div><p className="eyebrow">Inbound creator interest</p><h2>See who raised their hand.<br /><em>Start with the right fit.</em></h2><p>Review verified creator profiles that expressed interest in your open campaign posts, then move the strongest fit into the existing fair-offer flow.</p></div>
        <dl><div><dt>Total interest</dt><dd>{brandInterests.length}</dd></div><div><dt>New profiles</dt><dd>{brandInterests.filter((item) => item.status === "new").length}</dd></div><div><dt>Campaign posts</dt><dd>{brandOpportunities.length}</dd></div></dl>
      </header>

      <div className="brand-interest-layout">
        <aside className="brand-posted-campaigns">
          <header><div><span>Your open posts</span><h3>Campaigns</h3></div><BriefcaseBusiness size={19} /></header>
          <div className="posted-campaign-list">
            <button className={selectedOpportunityId === "all" ? "is-active" : ""} type="button" onClick={() => setSelectedOpportunityId("all")}><span className="posted-campaign-icon"><Users size={16} /></span><span><strong>All creator interest</strong><small>Across {brandOpportunities.length} open posts</small></span><em>{brandInterests.length}</em></button>
            {brandOpportunities.map((opportunity) => <button className={selectedOpportunityId === opportunity.id ? "is-active" : ""} type="button" onClick={() => setSelectedOpportunityId(opportunity.id)} key={opportunity.id}><span className="posted-campaign-icon">{opportunity.brand.initials}</span><span><strong>{opportunity.title}</strong><small>Closes {opportunity.closesOn}</small></span><em>{countFor(opportunity.id)}</em></button>)}
          </div>
          <section className="posted-campaign-summary"><span><IndianRupee size={14} /> Opportunity budget</span><strong>{selectedOpportunity ? `${formatMoney(selectedOpportunity.budgetMin)}–${formatMoney(selectedOpportunity.budgetMax)}` : "Multiple bands"}</strong><p>{selectedOpportunity ? selectedOpportunity.deliverables.join(" + ") : "Select a campaign to focus the creator list."}</p></section>
        </aside>

        <section className="brand-interest-results">
          <header className="brand-interest-results__heading"><div><span>{selectedOpportunity ? "Campaign interest" : "All submissions"}</span><h3>{selectedOpportunity?.title ?? "Interested creators"}</h3><p>{visibleInterests.length} verified profile{visibleInterests.length === 1 ? "" : "s"} ready to review</p></div><div><Clock3 size={14} /> Newest first</div></header>
          {visibleInterests.length ? <div className="brand-interest-grid">{visibleInterests.map((interest) => <InterestCard key={interest.id} interest={interest} opportunity={opportunities.find((item) => item.id === interest.opportunityId)} creator={creators.find((item) => item.id === interest.creatorId)} />)}</div> : <div className="brand-interest-empty"><Users size={25} /><h3>No interest shared yet.</h3><p>Creator profiles will appear here as soon as someone responds to this campaign post.</p></div>}
        </section>
      </div>

      <section className="interest-flow-note"><Sparkles size={18} /><div><strong>Interest is not an agreement.</strong><p>Opening a profile or starting an offer uses the existing discovery and deal-room flows. No campaign or payment workspace is created until terms are accepted.</p></div><CalendarDays size={18} /></section>
    </main>
  );
}
