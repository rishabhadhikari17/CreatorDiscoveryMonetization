import {
  ArrowRight, BadgeCheck, Check, ChevronDown, CircleSlash2, Info, MapPin, Search,
  SlidersHorizontal, Sparkles, Star, Users, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import creatorHero from "../../assets/regional-creator-hero.jpg";
import { suggestions } from "./data/creators.js";
import {
  availabilityOptions,
  fallbackFitWeights,
  fallbackReferenceData,
} from "./data/searchReferenceFallback.js";
import {
  emptySearchFilters,
  formatAudience,
  formatRate,
  parseCampaignQuery,
  validateSearchFilters,
} from "./creatorSearch.js";
import { loadSearchConfiguration, searchCreators } from "./creatorSearchApi.js";
import "./CreatorDiscoveryPage.css";

const initialFilters = {
  ...emptySearchFilters,
  state: "bihar",
  niche: "food-culture",
  budget_per_deliverable: 30000,
};

const factorOrder = ["quality", "location", "relevance", "availability", "budget"];
const factorLabels = {
  quality: "Quality",
  location: "Location",
  relevance: "Relevance",
  availability: "Availability",
  budget: "Budget",
};

function SelectField({ label, value, options, onChange, required = false }) {
  return (
    <label className="search-contract-field">
      <span>{label}{required && <i>Required</i>}</span>
      <div>
        <select value={value} onChange={(event) => onChange(event.target.value)} required={required}>
          <option value="">Choose {label.toLowerCase()}</option>
          {options.map((option) => <option value={option.slug} key={option.slug}>{option.name}</option>)}
        </select>
        <ChevronDown size={14} />
      </div>
    </label>
  );
}

function MultiSelectField({ label, options, values, onChange }) {
  const toggle = (slug) => onChange(
    values.includes(slug) ? values.filter((value) => value !== slug) : [...values, slug],
  );
  return (
    <fieldset className="discovery-multi-filter">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label key={option.slug}>
            <input type="checkbox" checked={values.includes(option.slug)} onChange={() => toggle(option.slug)} />
            <span><Check size={11} />{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ScoreBreakdown({ factors, weights }) {
  const weightByFactor = Object.fromEntries(weights.map(({ factor, weight }) => [factor, weight]));
  return (
    <div className="score-breakdown" aria-label="Fit score breakdown">
      <div className="score-breakdown__heading"><span>Why this match</span><Info size={13} /></div>
      <div className="score-breakdown__grid">
        {factorOrder.map((factor) => {
          const score = factors?.[factor] ?? 0;
          return (
            <div key={factor}>
              <span>{factorLabels[factor]} <small>{weightByFactor[factor]}%</small></span>
              <strong>{score}</strong>
              <i><b style={{ width: `${score}%` }} /></i>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreatorCard({ creator, saved, onSave, weights }) {
  return (
    <article className="discovery-creator-card">
      {creator.id === "priya-kumari" && (
        <img
          className="discovery-creator-card__photo"
          src={creatorHero}
          alt="Priya filming a regional recipe in her home kitchen"
        />
      )}
      <header className="discovery-creator-card__header">
        <div className="discovery-creator-card__avatar" aria-hidden="true"><strong>{creator.initials}</strong><span>{creator.script}</span></div>
        <div className="discovery-creator-card__identity">
          <span>{creator.language} · {creator.niche}</span>
          <h3>{creator.name} <BadgeCheck size={15} aria-label="Verified creator" /></h3>
          <p>{creator.handle}</p>
        </div>
        <div className="match-stamp"><strong>{creator.match}</strong><span>fit score</span></div>
      </header>

      <div className="creator-location-row">
        <span><MapPin size={13} /> {creator.district}, {creator.state}</span>
        <span className="availability-dot"><i />{creator.availability}</span>
      </div>

      <div className="quality-proof">
        <div className="quality-proof__score"><strong>{creator.quality}</strong><span>Quality<br />score</span></div>
        <p>{creator.proof}</p>
      </div>

      <ScoreBreakdown factors={creator.fitFactors} weights={weights} />

      <dl className="creator-stat-grid">
        <div><dt><Users size={13} /> Audience</dt><dd>{formatAudience(creator.audience)}</dd></div>
        <div><dt>Local reach</dt><dd>{creator.localReach}%</dd></div>
        <div><dt>Engagement</dt><dd>{creator.engagement}%</dd></div>
      </dl>

      <div className="creator-platforms">{creator.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div>

      <footer className="discovery-creator-card__footer">
        <div>
          <span>Estimated / deliverable</span>
          <strong>{formatRate(creator.estimatedCost)}</strong>
          <small>Fair band {formatRate(creator.rateMin)}–{formatRate(creator.rateMax)}</small>
        </div>
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
  const [filters, setFilters] = useState(initialFilters);
  const [referenceData, setReferenceData] = useState(fallbackReferenceData);
  const [availability, setAvailability] = useState(availabilityOptions);
  const [weights, setWeights] = useState(fallbackFitWeights);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(["priya-kumari"]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const validationMessage = validateSearchFilters(filters);
  const optionalCount = filters.languages.length + filters.platforms.length + filters.availability.length
    + Number(filters.audience_min !== "") + Number(filters.audience_max !== "");
  const selectedState = referenceData.states.find(({ slug }) => slug === filters.state)?.name ?? "this state";
  const relaxed = results[0]?.relaxed === true;

  const runSearch = useCallback(async (nextFilters, brief = "") => {
    const validation = validateSearchFilters(nextFilters);
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await searchCreators(nextFilters);
      setResults(response.creators);
      setNotice(response.notice);
      setAppliedQuery(brief);
    } catch (searchError) {
      setError(searchError.message || "Creator search could not be completed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([loadSearchConfiguration(), searchCreators(initialFilters)])
      .then(([configuration, search]) => {
        if (!active) return;
        setReferenceData(configuration.referenceData);
        setAvailability(configuration.availability);
        setWeights(configuration.weights);
        setResults(search.creators);
        setNotice(search.notice || configuration.notice);
        setLoading(false);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Creator search could not be initialized.");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const submitSearch = (event) => {
    event.preventDefault();
    runSearch(filters, query);
  };
  const runQuickSearch = (value = query) => {
    const parsed = parseCampaignQuery(value, referenceData);
    const nextFilters = { ...filters, ...parsed };
    setQuery(value);
    setFilters(nextFilters);
    runSearch(nextFilters, value);
  };
  const clearOptionalFilters = () => {
    const nextFilters = {
      ...filters,
      languages: [],
      platforms: [],
      availability: [],
      audience_min: "",
      audience_max: "",
    };
    setFilters(nextFilters);
    runSearch(nextFilters, appliedQuery);
  };
  const toggleSaved = (id) => setSaved((current) => current.includes(id)
    ? current.filter((savedId) => savedId !== id)
    : [...current, id]);

  const formula = useMemo(() => {
    const weightByFactor = Object.fromEntries(weights.map(({ factor, weight }) => [factor, weight]));
    return factorOrder.map((factor) => `${factorLabels[factor]} ${weightByFactor[factor]}%`).join(" + ");
  }, [weights]);

  return (
    <main className="creator-discovery">
      <header className="creator-discovery__hero">
        <div>
          <p className="eyebrow">Creator discovery</p>
          <h2>Find local influence that<br /><em>actually moves people.</em></h2>
          <p>Build a precise brief. Results are ranked by regional fit, relevance, availability, budget, and audience quality—not follower count alone.</p>
        </div>
        <div className="discovery-trust-note"><Sparkles size={18} /><span><strong>Explainable ranking</strong>{formula}. Weights are read from the scoring table.</span></div>
      </header>

      <section className="campaign-search" aria-label="Quick-fill creator search">
        <form onSubmit={(event) => { event.preventDefault(); runQuickSearch(); }}>
          <Search size={21} />
          <label className="visually-hidden" htmlFor="campaign-search">Quick-fill campaign criteria</label>
          <input id="campaign-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘Bhojpuri food creators in Bihar under ₹30K’" />
          {query && <button className="search-clear" type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}
          <button className="button button--primary" type="submit">Fill & search</button>
        </form>
        <div className="search-suggestions"><span>Try a search</span>{suggestions.map((suggestion) => <button type="button" onClick={() => runQuickSearch(suggestion)} key={suggestion}>{suggestion}</button>)}</div>
      </section>

      <form className="search-contract" onSubmit={submitSearch} aria-label="Creator search criteria">
        <div className="search-contract__heading">
          <div><Sparkles size={16} /><span><strong>Campaign fit</strong>Required ranking inputs</span></div>
          <small>Database slugs · whole rupees</small>
        </div>
        <div className="search-contract__fields">
          <SelectField label="State" value={filters.state} options={referenceData.states} onChange={(value) => updateFilter("state", value)} required />
          <SelectField label="Niche" value={filters.niche} options={referenceData.niches} onChange={(value) => updateFilter("niche", value)} required />
          <label className="search-contract-field">
            <span>Max rate / deliverable<i>Required</i></span>
            <div className="money-input"><b>₹</b><input type="number" min="1" step="1" value={filters.budget_per_deliverable} onChange={(event) => updateFilter("budget_per_deliverable", event.target.value)} placeholder="30000" required /></div>
          </label>
          <button className="button button--primary" type="submit" disabled={Boolean(validationMessage) || loading}>{loading ? "Ranking…" : "Find creators"}<ArrowRight size={16} /></button>
        </div>
        {validationMessage && <p className="search-validation"><Info size={13} />{validationMessage}</p>}
      </form>

      {(notice || error) && <div className={`search-status${error ? " is-error" : ""}`} role={error ? "alert" : "status"}><Info size={15} /><span>{error || notice}</span></div>}

      <div className="discovery-workspace">
        <aside className={`discovery-filters${mobileFiltersOpen ? " is-open" : ""}`}>
          <div className="discovery-filters__heading">
            <div><SlidersHorizontal size={17} /><h3>Optional filters</h3></div>
            {optionalCount > 0 && <button type="button" onClick={clearOptionalFilters}>Clear</button>}
            <button className="filter-close" type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X size={19} /></button>
          </div>
          <p>These narrow the pool without changing the scoring formula.</p>
          <div className="discovery-filter-list">
            <MultiSelectField label="Languages" options={referenceData.languages} values={filters.languages} onChange={(value) => updateFilter("languages", value)} />
            <MultiSelectField label="Platforms" options={referenceData.platforms} values={filters.platforms} onChange={(value) => updateFilter("platforms", value)} />
            <div className="audience-filter">
              <span>Followers</span>
              <div>
                <input type="number" min="0" step="1" value={filters.audience_min} onChange={(event) => updateFilter("audience_min", event.target.value)} placeholder="Minimum" aria-label="Minimum followers" />
                <input type="number" min="0" step="1" value={filters.audience_max} onChange={(event) => updateFilter("audience_max", event.target.value)} placeholder="Maximum" aria-label="Maximum followers" />
              </div>
            </div>
            <MultiSelectField label="Availability" options={availability} values={filters.availability} onChange={(value) => updateFilter("availability", value)} />
          </div>
          <div className="disabled-sort-note"><CircleSlash2 size={15} /><p><strong>Client-side sorting is disabled.</strong>The RPC returns the authoritative fit order.</p></div>
          <button className="button button--primary mobile-apply-filters" type="button" disabled={Boolean(validationMessage) || loading} onClick={() => { runSearch(filters, query); setMobileFiltersOpen(false); }}>Apply filters</button>
        </aside>

        <section className="discovery-results" aria-live="polite" aria-busy={loading}>
          <div className="discovery-results__toolbar">
            <div>
              <button className="mobile-filter-button" type="button" onClick={() => setMobileFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters {optionalCount > 0 && <span>{optionalCount}</span>}</button>
              <p><strong>{results.length}</strong> creators matched</p><span>Ranked by campaign fit</span>
            </div>
            <div className="result-sort"><Sparkles size={13} />Authoritative order</div>
          </div>

          {relaxed && !loading && <div className="relaxed-results-note"><Info size={16} /><span><strong>No exact matches.</strong> Showing nearest creators in {selectedState}.</span></div>}
          {appliedQuery && !loading && <div className="parsed-query-note"><Sparkles size={14} /><span>Criteria filled from <strong>“{appliedQuery}”</strong></span></div>}

          {loading ? <LoadingCards /> : results.length ? (
            <div className="discovery-results-grid">{results.map((creator) => <CreatorCard creator={creator} saved={saved.includes(creator.id)} onSave={toggleSaved} weights={weights} key={creator.id} />)}</div>
          ) : (
            <div className="discovery-empty-state">
              <div><Search size={26} /></div><span>No match found</span><h3>Your brief is wonderfully specific.</h3>
              <p>Try a higher per-deliverable budget, a broader follower range, or fewer optional filters.</p>
              {optionalCount > 0 && <button className="button button--primary" type="button" onClick={clearOptionalFilters}>Clear optional filters</button>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
