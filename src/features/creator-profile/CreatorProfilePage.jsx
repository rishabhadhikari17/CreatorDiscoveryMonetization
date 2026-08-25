import {
  ArrowLeft, BadgeCheck, BarChart3, Check, ChevronRight, CircleCheck,
  IndianRupee, Info, Languages, MapPin, ShieldCheck, Sparkles, Star, Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import creatorHero from "../../assets/regional-creator-hero.jpg";
import { formatAudience, formatRate } from "../creator-discovery/creatorSearch.js";
import { getCreatorProfile } from "./data/creatorProfiles.js";
import "./CreatorProfilePage.css";

function BreakdownBars({ items, className = "" }) {
  return (
    <div className={`breakdown-bars ${className}`}>
      {items.map(([label, value], index) => (
        <div className="breakdown-bar" key={label}>
          <div><span><i style={{ "--bar-index": index }} />{label}</span><strong>{value}%</strong></div>
          <div className="breakdown-bar__track"><span style={{ width: `${value}%`, "--bar-index": index }} /></div>
        </div>
      ))}
    </div>
  );
}

function ScoreComponent({ component }) {
  return (
    <article className="score-component">
      <div className="score-component__top">
        <div className={`component-icon component-icon--${component.key}`}><Check size={16} /></div>
        <div><h4>{component.label}</h4><span>{component.weight}% of score</span></div>
        <strong>{component.score}</strong>
      </div>
      <div className="score-component__track"><span style={{ width: `${component.score}%` }} /></div>
      <p>{component.description}</p>
      <div className="component-evidence"><CircleCheck size={14} /><span><strong>Evidence</strong>{component.evidence}</span></div>
    </article>
  );
}

export function CreatorProfilePage() {
  const { creatorId } = useParams();
  const creator = getCreatorProfile(creatorId);
  const [saved, setSaved] = useState(creatorId === "priya-kumari");

  if (!creator || creator.profileVisible === false) {
    return (
      <main className="profile-not-found">
        <span>Creator unavailable</span><h2>We couldn’t find this profile.</h2>
        <Link className="button button--primary" to="/brand/discover"><ArrowLeft size={16} /> Back to discovery</Link>
      </main>
    );
  }

  const creatorImage = creator.avatarDataUrl || (creator.id === "priya-kumari" ? creatorHero : null);

  return (
    <main className="creator-profile">
      <nav className="profile-breadcrumb" aria-label="Breadcrumb">
        <Link to="/brand/discover"><ArrowLeft size={15} /> Discover creators</Link><ChevronRight size={14} /><span>{creator.name}</span>
      </nav>

      <section className="creator-profile-hero">
        <div className="creator-profile-hero__identity">
          <div className="profile-avatar" aria-hidden="true">{creatorImage ? <img src={creatorImage} alt="" /> : <strong>{creator.initials}</strong>}<span>{creator.script}</span></div>
          <div>
            <p>{creator.language} creator · {creator.niche}</p>
            <h2>{creator.name} <BadgeCheck size={22} aria-label="Verified creator" /></h2>
            <span>{creator.handle}</span>
            {creator.secondaryNiches.length > 0 && <div className="public-profile-niches"><span>{creator.niche}</span>{creator.secondaryNiches.map((niche) => <span key={niche}>{niche}</span>)}</div>}
            <div className="profile-meta"><span><MapPin size={14} />{creator.district}, {creator.state}</span><span><Languages size={14} />{creator.languages.join(" + ")}</span><span className="profile-available"><i />{creator.availability}</span></div>
          </div>
        </div>
        <div className="creator-profile-hero__actions">
          <button className={`button profile-save${saved ? " is-saved" : ""}`} type="button" onClick={() => setSaved((current) => !current)} aria-pressed={saved}><Star size={17} fill={saved ? "currentColor" : "none"} />{saved ? "Saved to shortlist" : "Save to shortlist"}</button>
          {creator.acceptingOffers ? <Link className="button button--primary" to={`/brand/deals?creator=${creator.id}`}>Start a fair offer</Link> : <button className="button button--primary" type="button" disabled>Not accepting offers</button>}
        </div>
      </section>

      <nav className="profile-section-nav" aria-label="Creator profile sections">
        <a href="#overview">Overview</a><a href="#audience">Audience</a><a href="#quality">Quality score</a><a href="#collaborations">Collaborations</a>
      </nav>

      <div className="creator-profile-layout">
        <div className="creator-profile-main">
          <section className="profile-panel profile-overview" id="overview">
            <div className="profile-section-heading"><div><span>Creator overview</span><h3>Local voice, measurable attention.</h3></div></div>
            <p>{creator.bio}</p>
            <dl className="profile-key-metrics">
              <div><dt>Cross-platform audience</dt><dd>{formatAudience(creator.audience)}</dd><span>{creator.platforms.join(" + ")}</span></div>
              <div><dt>Average engagement</dt><dd>{creator.engagement}%</dd><span>Top {100 - creator.percentile}% in cohort</span></div>
              <div><dt>Audience in {creator.state}</dt><dd>{creator.localReach}%</dd><span>Strong regional density</span></div>
            </dl>
          </section>

          <section className="profile-panel audience-intelligence" id="audience">
            <div className="profile-section-heading">
              <div><span>Audience intelligence</span><h3>Where this community lives and speaks.</h3></div>
              <div className="data-note"><BarChart3 size={14} /> Last 90 days</div>
            </div>
            <div className="audience-grid">
              <article className="audience-breakdown audience-breakdown--regional">
                <header><MapPin size={17} /><div><h4>Regional distribution</h4><p>Active audience by district</p></div></header>
                <BreakdownBars items={creator.regionalAudience} />
              </article>
              <article className="audience-breakdown">
                <header><Languages size={17} /><div><h4>Language mix</h4><p>Content and comment language</p></div></header>
                <BreakdownBars items={creator.languageBreakdown} />
              </article>
              <article className="audience-breakdown">
                <header><Users size={17} /><div><h4>Audience age</h4><p>Estimated active viewers</p></div></header>
                <BreakdownBars items={creator.demographics.age} />
              </article>
              <article className="audience-breakdown demographic-card">
                <header><Users size={17} /><div><h4>Gender mix</h4><p>Self-reported and inferred</p></div></header>
                <div className="gender-visual">
                  <div className="gender-donut" style={{ "--primary-gender": `${creator.demographics.gender[0][1] * 3.6}deg` }}><span><strong>{creator.demographics.gender[0][1]}%</strong>{creator.demographics.gender[0][0]}</span></div>
                  <ul>{creator.demographics.gender.map(([label, value], index) => <li key={label}><i style={{ "--bar-index": index }} /><span>{label}</span><strong>{value}%</strong></li>)}</ul>
                </div>
              </article>
            </div>
          </section>

          <section className="profile-panel quality-intelligence" id="quality">
            <div className="quality-intelligence__header">
              <div className="quality-score-ring" style={{ "--score-angle": `${creator.quality * 3.6}deg` }}><span><strong>{creator.quality}</strong><small>/ 100</small></span></div>
              <div><span>Engagement quality score</span><h3>Trusted attention, explained.</h3><p>A transparent view of the five signals behind the score—each calibrated against comparable {creator.language} creators.</p></div>
            </div>
            <div className="score-confidence">
              <ShieldCheck size={18} /><div><strong>{creator.confidence}% score confidence</strong><span>Based on stable signals across Instagram and YouTube</span></div>
              <div><strong>{creator.cohortSize}</strong><span>comparable creators</span></div>
              <div><strong>Top {100 - creator.percentile}%</strong><span>in cohort</span></div>
            </div>
            <div className="score-components">{creator.components.map((component) => <ScoreComponent component={component} key={component.key} />)}</div>
            <div className="score-method-note"><Info size={15} /><span><strong>How to read this score</strong>It compares this creator with people in the same language, niche, region, and audience band—not with metro or celebrity benchmarks. Last analysed {creator.lastAnalysed}.</span></div>
          </section>

          <section className="profile-panel collaboration-history" id="collaborations">
            <div className="profile-section-heading"><div><span>Previous partnerships</span><h3>Collaboration history</h3></div><small>{creator.collaborations.length} verified campaigns</small></div>
            <div className="collaboration-table">
              {creator.collaborations.map((item) => (
                <article key={`${item.brand}-${item.campaign}`}>
                  <div className="collaboration-brand">{item.brand.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
                  <div><span>{item.brand}</span><h4>{item.campaign}</h4><small>{item.date}</small></div>
                  <div><span>Campaign result</span><strong>{item.result}</strong></div>
                  <div className="collaboration-status"><CircleCheck size={14} />{item.status}</div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="profile-commercial-card">
          <div className="commercial-card__eyebrow"><Sparkles size={14} /> Fair compensation</div>
          <span>Recommended campaign rate</span>
          <h3>{formatRate(creator.rateMin)}–{formatRate(creator.rateMax)}</h3>
          <p>Benchmarked for one primary branded deliverable with standard digital usage.</p>
          <div className="rate-band-visual">
            <div className="rate-band-labels"><span>{formatRate(Math.round(creator.rateMin * 0.72))}</span><span>{formatRate(Math.round(creator.rateMax * 1.25))}</span></div>
            <div className="rate-band-track"><span /></div>
            <strong>Fair band</strong>
          </div>
          <ul className="rate-reasons">
            <li><ShieldCheck size={15} /><span><strong>{creator.quality}/100 quality</strong>Quality-adjusted audience value</span></li>
            <li><MapPin size={15} /><span><strong>{creator.localReach}% local audience</strong>Calibrated for {creator.state}</span></li>
            <li><Users size={15} /><span><strong>{formatAudience(creator.audience)} community</strong>Across {creator.platforms.length} active platforms</span></li>
          </ul>
          <div className="commercial-benchmark"><IndianRupee size={17} /><span><strong>Based on {creator.cohortSize} comparable creators</strong>Similar language, niche, location, and reach</span></div>
          {creator.acceptingOffers ? <Link className="button button--primary" to={`/brand/deals?creator=${creator.id}`}>Start a fair offer</Link> : <button className="button button--primary" type="button" disabled>Not accepting offers</button>}
          <small>Pricing excludes paid-media usage and exclusivity.</small>
        </aside>
      </div>
    </main>
  );
}
