import {
  ArrowRight, BadgeCheck, ChevronDown, CircleSlash2, MapPin, Search,
  SlidersHorizontal, Sparkles, Star, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { filterLabels, filterOptions, suggestions } from "./data/creators.js";
import { emptyFilters, formatAudience, formatRate, getResults, parseCampaignQuery } from "./creatorSearch.js";
import "./CreatorDiscoveryPage.css";

function FilterControl({ filterKey, value, onChange, chip = false }) {
  const select = (
    <select aria-label={filterLabels[filterKey]} value={value} onChange={(event) => onChange(filterKey, event.target.value)}>
      {!chip && <option value="">All {filterLabels[filterKey].toLowerCase()}</option>}
      {filterOptions[filterKey].map((option) => <option value={option} key={option}>{option}</option>)}
    </select>
  );

  if (chip) {
    return (
      <span className="active-filter-chip">
        <strong>{filterLabels[filterKey]}</strong>{select}
        <button type="button" onClick={() => onChange(filterKey, "")} aria-label={`Remove ${filterLabels[filterKey]} filter`}><X size={13} /></button>
      </span>
    );
  }

  return <label className="discovery-filter"><span>{filterLabels[filterKey]}</span><div>{select}<ChevronDown size={14} /></div></label>;
}

function CreatorCard({ creator, saved, onSave }) {
  return (
    <article className="discovery-creator-card">
      <div className="discovery-creator-card__accent" aria-hidden="true" />
      <header className="discovery-creator-card__header">
        <div className="discovery-creator-card__avatar" aria-hidden="true"><strong>{creator.initials}</strong><span>{creator.script}</span></div>
        <div className="discovery-creator-card__identity">
          <span>{creator.language} · {creator.niche}</span>
          <h3>{creator.name} <BadgeCheck size={15} aria-label="Verified creator" /></h3>
          <p>{creator.handle}</p>
        </div>
        <div className="match-stamp"><strong>{creator.match}%</strong><span>match</span></div>
      </header>

      <div className="creator-location-row">
        <span><MapPin size={13} /> {creator.district}, {creator.state}</span>
        <span className="availability-dot"><i />{creator.availability}</span>
      </div>

      <div className="quality-proof">
        <div className="quality-proof__score"><strong>{creator.quality}</strong><span>Quality<br />score</span></div>
        <p>{creator.proof}</p>
      </div>

      <dl className="creator-stat-grid">
        <div><dt><Users size={13} /> Audience</dt><dd>{formatAudience(creator.audience)}</dd></div>
        <div><dt>Local reach</dt><dd>{creator.localReach}%</dd></div>
        <div><dt>Engagement</dt><dd>{creator.engagement}%</dd></div>
      </dl>

      <div className="creator-platforms">{creator.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div>

      <footer className="discovery-creator-card__footer">
        <div><span>Fair rate band</span><strong>{formatRate(creator.rateMin)}–{formatRate(creator.rateMax)}</strong><small>per campaign</small></div>
        <div>
          <button className={`save-creator${saved ? " is-saved" : ""}`} type="button" onClick={() => onSave(creator.id)} aria-pressed={saved}>
            <Star size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
          <Link className="view-creator" to={`/brand/creators/${creator.id}`}>View profile <ArrowRight size={15} /></Link>
        </div>
      </footer>
    </article>
  );
}

function LoadingCards() {
  return <div className="discovery-results-grid" aria-label="Loading creators">{[1, 2, 3, 4].map((item) => <div className="creator-card-skeleton" key={item}><span /><span /><span /><span /></div>)}</div>;
}

export function CreatorDiscoveryPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [sort, setSort] = useState("match");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(["priya-kumari"]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const initialRender = useRef(true);

  const activeFilters = Object.entries(filters).filter(([, value]) => value);
  const results = useMemo(() => getResults(filters, appliedQuery, sort), [filters, appliedQuery, sort]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return undefined;
    }
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 360);
    return () => window.clearTimeout(timer);
  }, [filters, appliedQuery, sort]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const runSearch = (value = query) => {
    const parsed = parseCampaignQuery(value);
    setQuery(value);
    setAppliedQuery(value);
    if (Object.keys(parsed).length) setFilters((current) => ({ ...current, ...parsed }));
  };
  const clearAll = () => { setFilters(emptyFilters); setQuery(""); setAppliedQuery(""); };
  const toggleSaved = (id) => setSaved((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);

  return (
    <main className="creator-discovery">
      <header className="creator-discovery__hero">
        <div>
          <p className="eyebrow">Creator discovery</p>
          <h2>Find local influence that<br /><em>actually moves people.</em></h2>
          <p>Search a campaign need or build precise filters. Results are ranked by regional fit and audience quality—not follower count.</p>
        </div>
        <div className="discovery-trust-note"><Sparkles size={18} /><span><strong>Quality-first ranking</strong>Every match is calibrated within its own regional cohort.</span></div>
      </header>

      <section className="campaign-search" aria-label="Search creators">
        <form onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
          <Search size={21} />
          <label className="visually-hidden" htmlFor="campaign-search">Search by creator or campaign need</label>
          <input id="campaign-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘Bhojpuri food creators in Bihar under ₹30K’" />
          {query && <button className="search-clear" type="button" onClick={() => { setQuery(""); setAppliedQuery(""); }} aria-label="Clear search"><X size={16} /></button>}
          <button className="button button--primary" type="submit">Find creators</button>
        </form>
        <div className="search-suggestions"><span>Try a search</span>{suggestions.map((suggestion) => <button type="button" onClick={() => runSearch(suggestion)} key={suggestion}>{suggestion}</button>)}</div>
      </section>

      <div className="discovery-workspace">
        <aside className={`discovery-filters${mobileFiltersOpen ? " is-open" : ""}`}>
          <div className="discovery-filters__heading">
            <div><SlidersHorizontal size={17} /><h3>Refine creators</h3></div>
            {activeFilters.length > 0 && <button type="button" onClick={clearAll}>Clear all</button>}
            <button className="filter-close" type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X size={19} /></button>
          </div>
          <p>Build a precise audience brief.</p>
          <div className="discovery-filter-list">
            {Object.keys(filterOptions).map((key) => <FilterControl filterKey={key} value={filters[key]} onChange={updateFilter} key={key} />)}
          </div>
          <div className="disabled-sort-note"><CircleSlash2 size={15} /><p><strong>Price-to-quality sorting is disabled.</strong>Price should not override regional trust.</p></div>
          <button className="button button--primary mobile-apply-filters" type="button" onClick={() => setMobileFiltersOpen(false)}>Show {results.length} creators</button>
        </aside>

        <section className="discovery-results" aria-live="polite">
          <div className="discovery-results__toolbar">
            <div>
              <button className="mobile-filter-button" type="button" onClick={() => setMobileFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters {activeFilters.length > 0 && <span>{activeFilters.length}</span>}</button>
              <p><strong>{results.length}</strong> creators matched</p><span>Ranked by campaign fit</span>
            </div>
            <label className="result-sort">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="match">Best match</option><option value="quality">Highest quality</option><option value="audience">Largest audience</option><option disabled>Price-to-quality · unavailable</option></select><ChevronDown size={14} /></label>
          </div>

          {activeFilters.length > 0 && (
            <div className="active-filters" aria-label="Active filters">
              <span>Active</span>
              {activeFilters.map(([key, value]) => <FilterControl chip filterKey={key} value={value} onChange={updateFilter} key={key} />)}
              <button type="button" onClick={clearAll}>Reset</button>
            </div>
          )}

          {appliedQuery && !loading && <div className="parsed-query-note"><Sparkles size={14} /><span>Showing deterministic matches for <strong>“{appliedQuery}”</strong></span></div>}

          {loading ? <LoadingCards /> : results.length ? (
            <div className="discovery-results-grid">{results.map((creator) => <CreatorCard creator={creator} saved={saved.includes(creator.id)} onSave={toggleSaved} key={creator.id} />)}</div>
          ) : (
            <div className="discovery-empty-state">
              <div><Search size={26} /></div><span>No exact match</span><h3>Your brief is wonderfully specific.</h3>
              <p>Try widening the budget, audience size, or quality threshold to see more regional creators.</p>
              <button className="button button--primary" type="button" onClick={clearAll}>Clear filters</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
