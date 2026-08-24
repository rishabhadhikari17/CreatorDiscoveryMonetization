import {
  ArrowUpRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Check,
  IndianRupee, MapPin, Search, Send, Sparkles, Users, X,
} from "lucide-react";
import { useState } from "react";
import { formatMoney } from "../campaign-brief/campaignMatching.js";
import { useDealState } from "../deal-state/DealStateContext.js";
import "./CampaignOpportunities.css";

const creatorId = "priya-kumari";
const defaultNote = "I would love to bring this campaign to life for my community with a culturally familiar, practical story in my own voice.";

function OpportunityCard({ opportunity, interest, isComposing, onCompose, onCancel, note, onNoteChange, onShare }) {
  return (
    <article className={`opportunity-card${opportunity.featured ? " opportunity-card--featured" : ""}`}>
      {opportunity.featured && <div className="opportunity-card__ribbon"><Sparkles size={13} /> Best match</div>}
      <header className="opportunity-card__brand">
        <div className="opportunity-brand-mark">{opportunity.brand.initials}</div>
        <div><span>{opportunity.brand.category}</span><strong>{opportunity.brand.name} <BadgeCheck size={15} aria-label="Verified brand" /></strong><small>Posted {opportunity.postedAt}</small></div>
        <div className="opportunity-match"><strong>{opportunity.match}%</strong><span>match</span></div>
      </header>

      <div className="opportunity-card__body">
        <h3>{opportunity.title}</h3>
        <p>{opportunity.description}</p>
        <div className="opportunity-tags">
          {opportunity.languages.slice(0, 3).map((language) => <span key={language}>{language}</span>)}
          {opportunity.niches.slice(0, 2).map((niche) => <span key={niche}>{niche}</span>)}
        </div>
        <dl className="opportunity-facts">
          <div><dt><IndianRupee size={14} /> Budget</dt><dd>{formatMoney(opportunity.budgetMin)}–{formatMoney(opportunity.budgetMax)}</dd></div>
          <div><dt><BriefcaseBusiness size={14} /> Deliverables</dt><dd>{opportunity.deliverables.join(" + ")}</dd></div>
          <div><dt><MapPin size={14} /> Looking for</dt><dd>{opportunity.regions.join(", ")}</dd></div>
          <div><dt><CalendarDays size={14} /> Publish by</dt><dd>{opportunity.publishBy}</dd></div>
        </dl>
      </div>

      {interest ? (
        <div className="opportunity-interest-shared"><span><Check size={14} /></span><div><strong>Interest shared</strong><p>The brand can now review your profile and note.</p></div><small>{interest.sharedAt}</small></div>
      ) : isComposing ? (
        <form className="interest-composer" onSubmit={onShare}>
          <div className="interest-composer__heading"><div><span>Your note to {opportunity.brand.name}</span><strong>Why are you a good fit?</strong></div><button type="button" onClick={onCancel} aria-label="Close interest form"><X size={17} /></button></div>
          <textarea aria-label="Interest note" rows="3" minLength="20" maxLength="280" value={note} onChange={(event) => onNoteChange(event.target.value)} />
          <footer><small>{note.length}/280 · Your full profile is shared automatically</small><button className="button button--primary" type="submit" disabled={note.trim().length < 20}><Send size={15} /> Share interest</button></footer>
        </form>
      ) : (
        <footer className="opportunity-card__footer">
          <span><CalendarDays size={14} /> Closes {opportunity.closesOn} · {opportunity.slots} creator slots</span>
          <button className="button button--primary" type="button" onClick={onCompose}>I'm interested <ArrowUpRight size={15} /></button>
        </footer>
      )}
    </article>
  );
}

export function CreatorOpportunitiesPage() {
  const { opportunities, interests, shareInterest } = useDealState();
  const [view, setView] = useState("for-you");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [composingId, setComposingId] = useState(null);
  const [note, setNote] = useState(defaultNote);

  const creatorInterests = interests.filter((interest) => interest.creatorId === creatorId);
  const interestByOpportunity = new Map(creatorInterests.map((interest) => [interest.opportunityId, interest]));
  const categories = ["All categories", ...new Set(opportunities.map((opportunity) => opportunity.brand.category))];
  const results = opportunities
    .filter((opportunity) => opportunity.status === "open")
    .filter((opportunity) => view === "for-you" || interestByOpportunity.has(opportunity.id))
    .filter((opportunity) => category === "All categories" || opportunity.brand.category === category)
    .filter((opportunity) => !query.trim() || [opportunity.title, opportunity.brand.name, opportunity.description, ...opportunity.languages, ...opportunity.regions, ...opportunity.niches].join(" ").toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => b.match - a.match);

  const openComposer = (id) => {
    setComposingId(id);
    setNote(defaultNote);
  };
  const submitInterest = (event, opportunityId) => {
    event.preventDefault();
    if (note.trim().length < 20) return;
    shareInterest(opportunityId, creatorId, note.trim());
    setComposingId(null);
  };

  return (
    <main className="opportunities-page">
      <header className="opportunities-hero">
        <div><p className="eyebrow">Campaign marketplace</p><h2>Find work that fits<br /><em>your voice and community.</em></h2><p>Explore open brand campaigns, understand the scope and fair budget, then share interest without committing to a deal.</p></div>
        <dl><div><dt>Open campaigns</dt><dd>{opportunities.filter((item) => item.status === "open").length}</dd></div><div><dt>Strong matches</dt><dd>{opportunities.filter((item) => item.match >= 85).length}</dd></div><div><dt>Interest shared</dt><dd>{creatorInterests.length}</dd></div></dl>
      </header>

      <section className="opportunity-toolbar" aria-label="Campaign filters">
        <div className="opportunity-view-tabs"><button className={view === "for-you" ? "is-active" : ""} type="button" onClick={() => setView("for-you")}>For you <span>{opportunities.length}</span></button><button className={view === "interested" ? "is-active" : ""} type="button" onClick={() => setView("interested")}>My interest <span>{creatorInterests.length}</span></button></div>
        <label className="opportunity-search"><Search size={17} /><span className="visually-hidden">Search campaigns</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by brand, brief, language..." /></label>
        <label className="opportunity-category"><span className="visually-hidden">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </section>

      <div className="opportunity-results-heading"><div><span>{view === "interested" ? "Your submissions" : "Recommended for Priya"}</span><h3>{results.length} campaign{results.length === 1 ? "" : "s"}</h3></div><p><Users size={15} /> Brands receive your full verified profile with every interest.</p></div>

      {results.length ? <section className="opportunity-grid" aria-live="polite">{results.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} interest={interestByOpportunity.get(opportunity.id)} isComposing={composingId === opportunity.id} onCompose={() => openComposer(opportunity.id)} onCancel={() => setComposingId(null)} note={note} onNoteChange={setNote} onShare={(event) => submitInterest(event, opportunity.id)} />)}</section> : <section className="opportunity-empty"><Search size={24} /><h3>No campaigns match these filters.</h3><p>Try another search or return to all opportunities.</p><button type="button" onClick={() => { setQuery(""); setCategory("All categories"); setView("for-you"); }}>Clear filters</button></section>}
    </main>
  );
}
