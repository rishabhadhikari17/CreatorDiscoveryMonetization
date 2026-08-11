import {
  ArrowRight, CalendarDays, Check, ChevronDown, CircleCheck, FileText,
  IndianRupee, Info, MapPin, Plus, Sparkles, Trash2, Users, X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { creators, filterOptions } from "../creator-discovery/data/creators.js";
import { formatAudience } from "../creator-discovery/creatorSearch.js";
import { calculateCampaignFit, FIT_WEIGHTS, formatMoney } from "./campaignMatching.js";
import "./CampaignBriefPage.css";

const deliverableOptions = [
  { id: "Instagram Reel", note: "30–60 sec vertical video" },
  { id: "Story set", note: "3–5 story frames" },
  { id: "YouTube integration", note: "60–90 sec in-video feature" },
  { id: "Photo post", note: "Single image or carousel" },
];

const factorLabels = { quality: "Quality", location: "Location", relevance: "Relevance", availability: "Availability", budget: "Budget" };

const initialBrief = {
  name: "Bihar Breakfast Stories",
  objective: "Product consideration",
  state: "Bihar",
  language: "Bhojpuri",
  niche: "Food & Culture",
  budget: 120000,
  startDate: "2026-08-24",
  endDate: "2026-09-14",
  deliverables: ["Instagram Reel", "Story set"],
};

function BriefField({ label, children }) {
  return <label className="brief-field"><span>{label}</span><div>{children}</div></label>;
}

function FitBreakdown({ factors }) {
  return (
    <div className="fit-breakdown">
      {Object.entries(FIT_WEIGHTS).map(([key, weight]) => (
        <div key={key} title={`${factorLabels[key]} contributes ${weight}% to campaign fit`}>
          <span>{factorLabels[key]} <small>{weight}%</small></span><strong>{factors[key]}</strong>
          <i><span style={{ width: `${factors[key]}%` }} /></i>
        </div>
      ))}
    </div>
  );
}

function ShortlistedCreator({ creator, fit, onRemove }) {
  return (
    <article className="brief-creator-card">
      <div className="brief-creator-card__top">
        <div className="brief-creator-avatar" aria-hidden="true"><strong>{creator.initials}</strong><span>{creator.script}</span></div>
        <div className="brief-creator-identity">
          <span>{creator.language} · {creator.niche}</span><h4>{creator.name}</h4>
          <p><MapPin size={12} />{creator.district}, {creator.state} · {formatAudience(creator.audience)} audience</p>
        </div>
        <div className={`campaign-fit-score${fit.score >= 85 ? " is-strong" : ""}`}><strong>{fit.score}%</strong><span>campaign fit</span></div>
        <button className="remove-shortlist" type="button" onClick={() => onRemove(creator.id)} aria-label={`Remove ${creator.name} from shortlist`}><Trash2 size={15} /></button>
      </div>
      <FitBreakdown factors={fit.factors} />
      <footer className="brief-creator-card__footer">
        <div><span>Estimated campaign rate</span><strong>{formatMoney(fit.estimatedCost)}</strong></div>
        <div><span>{creator.quality}/100 quality</span><span className="availability-pill"><i />{creator.availability}</span></div>
        <Link to={`/brand/creators/${creator.id}`}>View intelligence <ArrowRight size={14} /></Link>
      </footer>
    </article>
  );
}

export function CampaignBriefPage() {
  const [brief, setBrief] = useState(initialBrief);
  const [selectedIds, setSelectedIds] = useState(["priya-kumari", "neha-jha", "vivek-yadav"]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [created, setCreated] = useState(false);

  const selectedCreators = creators.filter((creator) => selectedIds.includes(creator.id));
  const availableCreators = creators.filter((creator) => !selectedIds.includes(creator.id));
  const creatorFits = useMemo(() => Object.fromEntries(creators.map((creator) => [creator.id, calculateCampaignFit(creator, brief, selectedIds.length)])), [brief, selectedIds.length]);
  const totalEstimate = selectedCreators.reduce((sum, creator) => sum + creatorFits[creator.id].estimatedCost, 0);
  const remaining = Number(brief.budget || 0) - totalEstimate;
  const budgetPercent = Number(brief.budget) > 0 ? Math.min(100, Math.round(totalEstimate / Number(brief.budget) * 100)) : 100;
  const averageFit = selectedCreators.length ? Math.round(selectedCreators.reduce((sum, creator) => sum + creatorFits[creator.id].score, 0) / selectedCreators.length) : 0;

  const updateBrief = (key, value) => { setCreated(false); setBrief((current) => ({ ...current, [key]: value })); };
  const toggleDeliverable = (id) => updateBrief("deliverables", brief.deliverables.includes(id) ? brief.deliverables.filter((item) => item !== id) : [...brief.deliverables, id]);
  const removeCreator = (id) => { setCreated(false); setSelectedIds((current) => current.filter((creatorId) => creatorId !== id)); };
  const addCreator = (id) => { setCreated(false); setSelectedIds((current) => [...current, id]); };

  return (
    <main className="campaign-brief-page">
      {created && <div className="brief-success" role="status"><CircleCheck size={18} /><span><strong>Campaign brief ready.</strong>Your shortlist and budget plan have been saved as a frontend draft.</span><Link to="/brand/deals">Open deal room <ArrowRight size={14} /></Link><button type="button" onClick={() => setCreated(false)} aria-label="Dismiss"><X size={15} /></button></div>}

      <header className="campaign-brief-header">
        <div><p className="eyebrow">Shortlist & campaign brief</p><h2>Turn promising creators into<br /><em>a campaign-ready team.</em></h2><p>Define the campaign once. Every creator’s fit and budget impact updates transparently.</p></div>
        <div className="brief-readiness"><Sparkles size={18} /><span><strong>{averageFit}% average fit</strong>{selectedCreators.length} creators · {brief.deliverables.length} deliverables selected</span></div>
      </header>

      <div className="campaign-brief-layout">
        <div className="campaign-brief-main">
          <section className="brief-panel campaign-details-panel">
            <div className="brief-panel__heading"><div><span>01 · The brief</span><h3>What are you taking to market?</h3></div><small>All fields are editable</small></div>
            <div className="brief-form-grid">
              <BriefField label="Campaign name"><input value={brief.name} onChange={(event) => updateBrief("name", event.target.value)} /></BriefField>
              <BriefField label="Primary objective"><select value={brief.objective} onChange={(event) => updateBrief("objective", event.target.value)}><option>Product consideration</option><option>Brand awareness</option><option>Local launch</option><option>Community engagement</option><option>Sales conversion</option></select><ChevronDown size={14} /></BriefField>
              <BriefField label="Target state"><select value={brief.state} onChange={(event) => updateBrief("state", event.target.value)}>{filterOptions.state.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={14} /></BriefField>
              <BriefField label="Campaign language"><select value={brief.language} onChange={(event) => updateBrief("language", event.target.value)}>{filterOptions.language.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={14} /></BriefField>
              <BriefField label="Content niche"><select value={brief.niche} onChange={(event) => updateBrief("niche", event.target.value)}>{filterOptions.niche.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={14} /></BriefField>
              <BriefField label="Total creator budget"><IndianRupee size={15} /><input type="number" min="10000" step="5000" value={brief.budget} onChange={(event) => updateBrief("budget", Number(event.target.value))} /></BriefField>
            </div>
          </section>

          <section className="brief-panel deliverables-panel">
            <div className="brief-panel__heading"><div><span>02 · Scope</span><h3>Choose campaign deliverables.</h3></div><small>Select one or more</small></div>
            <div className="deliverable-grid">
              {deliverableOptions.map((option) => {
                const active = brief.deliverables.includes(option.id);
                return <button className={`deliverable-option${active ? " is-selected" : ""}`} type="button" onClick={() => toggleDeliverable(option.id)} aria-pressed={active} key={option.id}><span><Check size={14} /></span><div><strong>{option.id}</strong><small>{option.note}</small></div></button>;
              })}
            </div>
            <div className="timeline-row">
              <div className="timeline-intro"><CalendarDays size={18} /><span><strong>Campaign timeline</strong>When should content go live?</span></div>
              <BriefField label="Start date"><input type="date" value={brief.startDate} onChange={(event) => updateBrief("startDate", event.target.value)} /></BriefField>
              <BriefField label="End date"><input type="date" min={brief.startDate} value={brief.endDate} onChange={(event) => updateBrief("endDate", event.target.value)} /></BriefField>
            </div>
          </section>

          <section className="brief-panel shortlist-panel">
            <div className="brief-panel__heading shortlist-heading">
              <div><span>03 · Your team</span><h3>Campaign shortlist</h3><p>Fit recalculates as the brief, budget, or team changes.</p></div>
              <button className="button button--outline" type="button" onClick={() => setPickerOpen((current) => !current)}><Plus size={16} /> Add creators</button>
            </div>

            {pickerOpen && (
              <div className="creator-picker">
                <header><div><strong>Add from discovery</strong><span>{availableCreators.length} creators available</span></div><button type="button" onClick={() => setPickerOpen(false)} aria-label="Close creator picker"><X size={17} /></button></header>
                <div>{availableCreators.map((creator) => <article key={creator.id}><div className="picker-avatar">{creator.initials}</div><div><strong>{creator.name}</strong><span>{creator.language} · {creator.niche} · {creator.district}</span></div><div><strong>{creatorFits[creator.id].score}%</strong><span>fit</span></div><button type="button" onClick={() => addCreator(creator.id)}><Plus size={14} /> Add</button></article>)}</div>
              </div>
            )}

            <div className="fit-formula-note"><Info size={15} /><span><strong>Transparent campaign-fit formula</strong>Quality 30% + location 25% + niche relevance 20% + availability 10% + budget fit 15%. No hidden AI ranking.</span></div>

            {selectedCreators.length ? <div className="shortlisted-creators">{selectedCreators.map((creator) => <ShortlistedCreator creator={creator} fit={creatorFits[creator.id]} onRemove={removeCreator} key={creator.id} />)}</div> : (
              <div className="shortlist-empty"><Users size={25} /><h4>No creators shortlisted</h4><p>Add creators to see their campaign fit and budget impact.</p><button className="button button--primary" type="button" onClick={() => setPickerOpen(true)}><Plus size={15} /> Add creators</button></div>
            )}
          </section>
        </div>

        <aside className="campaign-budget-card">
          <div className="budget-card__heading"><FileText size={18} /><div><span>Live plan</span><h3>Budget summary</h3></div></div>
          <div className="budget-total"><span>Total campaign budget</span><strong>{formatMoney(Number(brief.budget || 0))}</strong></div>
          <div className={`budget-progress${remaining < 0 ? " is-over" : ""}`}><div><span>Estimated creator spend</span><strong>{formatMoney(totalEstimate)}</strong></div><div className="budget-progress__track"><span style={{ width: `${budgetPercent}%` }} /></div><p>{budgetPercent}% allocated</p></div>
          <div className={`budget-remaining${remaining < 0 ? " is-over" : ""}`}><span>{remaining < 0 ? "Over budget" : "Remaining"}</span><strong>{formatMoney(Math.abs(remaining))}</strong><small>{remaining < 0 ? "Remove a deliverable or increase budget" : "Available for usage rights and contingency"}</small></div>

          <div className="budget-line-items">
            <div className="budget-line-items__header"><span>Creator allocation</span><strong>{selectedCreators.length}</strong></div>
            {selectedCreators.map((creator) => <div key={creator.id}><span>{creator.name}<small>{creatorFits[creator.id].score}% fit</small></span><strong>{formatMoney(creatorFits[creator.id].estimatedCost)}</strong></div>)}
          </div>

          <div className="brief-summary-list">
            <div><MapPin size={14} /><span><strong>{brief.state} · {brief.language}</strong>{brief.niche}</span></div>
            <div><CalendarDays size={14} /><span><strong>{brief.startDate || "Start TBD"}</strong>to {brief.endDate || "end TBD"}</span></div>
            <div><Check size={14} /><span><strong>{brief.deliverables.length} deliverables</strong>{brief.deliverables.join(" + ") || "None selected"}</span></div>
          </div>

          {created ? <Link className="button button--primary" to="/brand/deals">Open deal room <ArrowRight size={16} /></Link> : <button className="button button--primary" type="button" disabled={!selectedCreators.length || !brief.deliverables.length || remaining < 0} onClick={() => setCreated(true)}>Create campaign draft <ArrowRight size={16} /></button>}
          {remaining < 0 && <small className="budget-warning">Resolve the budget overage to continue.</small>}
          {!remaining && remaining !== 0 ? null : <small>Offers and deal terms are added in the next step.</small>}
        </aside>
      </div>
    </main>
  );
}
