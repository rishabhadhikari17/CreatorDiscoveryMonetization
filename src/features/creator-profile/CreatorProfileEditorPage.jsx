import {
  ArrowRight, BadgeCheck, BarChart3, Camera, Check, ChevronRight, CircleCheck, CircleX,
  Eye, Globe2, IndianRupee, Languages, Link2, Link2Off, MapPin, Plus,
  RefreshCw, Save, ShieldCheck, Sparkles, Star, Trash2, Upload, Users, Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import creatorHero from "../../assets/regional-creator-hero.jpg";
import { formatAudience, formatRate } from "../creator-discovery/creatorSearch.js";
import { INDIAN_STATES } from "../onboarding/onboardingData.js";
import { ONBOARDING_PROFILE_KEY } from "../onboarding/onboardingStorage.js";
import { getCreatorProfile } from "./data/creatorProfiles.js";
import {
  getProfileCompletion,
  readCreatorProfileEdits,
  saveCreatorProfileEdits,
} from "./creatorProfileStorage.js";
import "./CreatorProfileEditorPage.css";

const creatorId = "priya-kumari";

const platformIcons = { Instagram: Camera, YouTube: Video, Moj: Globe2 };

function defaultEditorProfile() {
  const creator = getCreatorProfile(creatorId);
  const saved = readCreatorProfileEdits(creatorId);
  if (saved) return saved;

  let onboarding = null;
  try {
    const candidate = JSON.parse(window.localStorage.getItem(ONBOARDING_PROFILE_KEY));
    if (candidate?.role === "creator") onboarding = candidate;
  } catch {
    // The demo profile remains the fallback when onboarding storage is unavailable.
  }

  return {
    name: onboarding?.displayName || creator.name,
    handle: onboarding?.handle ? `@${onboarding.handle.replace(/^@/, "")}` : creator.handle,
    bio: creator.bio,
    district: onboarding?.city || creator.district,
    state: onboarding?.state || creator.state,
    language: onboarding?.language || creator.language,
    languages: onboarding?.language ? [onboarding.language, ...creator.languages.filter((item) => item !== onboarding.language)] : creator.languages,
    niche: onboarding?.niche || creator.niche,
    secondaryNiches: [],
    availability: creator.availability,
    collaborationEmail: "hello@priyakirasoi.in",
    rateMin: creator.rateMin,
    rateMax: creator.rateMax,
    profileVisible: true,
    acceptingOffers: true,
    connectedPlatforms: [
      { name: "Instagram", handle: "@priyakirasoi", audience: 31800, connected: true, status: "Synced today" },
      { name: "YouTube", handle: "Priya Ki Rasoi", audience: 13400, connected: true, status: "Synced 2 days ago" },
      { name: "Moj", handle: "@priyakirasoi", audience: 0, connected: false, status: "Not connected" },
    ],
    portfolio: creator.collaborations.map((item, index) => ({
      ...item,
      id: `${item.brand.toLowerCase().replace(/\s+/g, "-")}-${index}`,
      featured: index < 2,
    })),
  };
}

function Field({ label, hint, children }) {
  return <label className="creator-profile-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function PlatformCard({ platform, onConnect, onDelete, onDisconnect, onRefresh }) {
  const Icon = platformIcons[platform.name] ?? Globe2;
  return (
    <article className={`profile-platform${platform.connected ? " is-connected" : ""}`}>
      <div className="profile-platform__icon"><Icon size={21} /></div>
      <div className="profile-platform__identity">
        <div><h4>{platform.name}</h4>{platform.connected && <span><CircleCheck size={12} /> Connected</span>}</div>
        <p>{platform.handle}</p>
      </div>
      <div className="profile-platform__audience">
        <strong>{platform.connected ? formatAudience(platform.audience) : "—"}</strong>
        <span>{platform.connected ? "audience" : "No data yet"}</span>
      </div>
      <div className="profile-platform__action">
        <small>{platform.status}</small>
        <div className="profile-platform__buttons">
          {platform.connected ? <>
            <button type="button" onClick={() => onRefresh(platform.name)}><RefreshCw size={13} /> Refresh</button>
            <button className="profile-platform__disconnect" type="button" onClick={() => onDisconnect(platform.name)}><Link2Off size={13} /> Disconnect</button>
          </> : <button type="button" onClick={() => onConnect(platform.name)}><Link2 size={13} /> Connect</button>}
          <button className="profile-platform__delete" type="button" onClick={() => onDelete(platform.name)} aria-label={`Delete ${platform.name}`}><Trash2 size={13} /> Delete</button>
        </div>
      </div>
    </article>
  );
}

function PortfolioCard({ item, onFeature, onDelete }) {
  return (
    <article className={`profile-portfolio-card${item.featured ? " is-featured" : ""}`}>
      <div className="portfolio-proof-mark">{item.brand.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
      <div className="portfolio-proof-copy">
        <span>{item.brand} · {item.date}</span>
        <h4>{item.campaign}</h4>
        <p>{item.result}</p>
      </div>
      <div className="portfolio-proof-actions">
        <button className={item.featured ? "is-active" : ""} type="button" onClick={() => onFeature(item.id)} aria-pressed={item.featured}><Star size={14} fill={item.featured ? "currentColor" : "none"} />{item.featured ? "Featured" : "Feature"}</button>
        <button type="button" onClick={() => onDelete(item.id)} aria-label={`Remove ${item.campaign}`}><Trash2 size={14} /></button>
      </div>
    </article>
  );
}

export function CreatorProfileEditorPage() {
  const creator = getCreatorProfile(creatorId);
  const [profile, setProfile] = useState(defaultEditorProfile);
  const [savedProfile, setSavedProfile] = useState(profile);
  const [saveState, setSaveState] = useState("idle");
  const [secondaryNicheInput, setSecondaryNicheInput] = useState("");
  const [secondaryNicheError, setSecondaryNicheError] = useState("");
  const [addingPlatform, setAddingPlatform] = useState(false);
  const [newPlatform, setNewPlatform] = useState({ name: "", handle: "" });
  const [platformError, setPlatformError] = useState("");
  const [addingProof, setAddingProof] = useState(false);
  const [proof, setProof] = useState({ brand: "", campaign: "", result: "", date: "August 2026" });
  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const isDirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);
  const secondaryNiches = profile.secondaryNiches ?? [];

  const update = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaveState("idle");
  };

  const addSecondaryNiche = () => {
    const niche = secondaryNicheInput.trim();
    if (!niche) return;
    const alreadyExists = [profile.niche, ...secondaryNiches].some((item) => item?.toLowerCase() === niche.toLowerCase());
    if (alreadyExists) {
      setSecondaryNicheError("This niche is already part of your profile.");
      return;
    }
    if (secondaryNiches.length >= 5) {
      setSecondaryNicheError("You can add up to five secondary niches.");
      return;
    }

    update("secondaryNiches", [...secondaryNiches, niche]);
    setSecondaryNicheInput("");
    setSecondaryNicheError("");
  };

  const removeSecondaryNiche = (niche) => {
    update("secondaryNiches", secondaryNiches.filter((item) => item !== niche));
    setSecondaryNicheError("");
  };

  const connectPlatform = (name) => {
    setProfile((current) => ({
      ...current,
      connectedPlatforms: current.connectedPlatforms.map((platform) => platform.name === name
        ? { ...platform, connected: true, audience: platform.audience || 6200, status: "Synced just now" }
        : platform),
    }));
    setSaveState("idle");
  };

  const disconnectPlatform = (name) => {
    setProfile((current) => ({
      ...current,
      connectedPlatforms: current.connectedPlatforms.map((platform) => platform.name === name
        ? { ...platform, connected: false, status: "Will disconnect when saved" }
        : platform),
    }));
    setSaveState("idle");
  };

  const addPlatform = (event) => {
    event.preventDefault();
    const name = newPlatform.name.trim();
    const handle = newPlatform.handle.trim();
    if (!name || !handle) return;
    if (profile.connectedPlatforms.some((platform) => platform.name.toLowerCase() === name.toLowerCase())) {
      setPlatformError(`${name} is already in your platform list.`);
      return;
    }

    setProfile((current) => ({
      ...current,
      connectedPlatforms: [...current.connectedPlatforms, {
        name,
        handle: handle.startsWith("@") ? handle : `@${handle}`,
        audience: 6200,
        connected: true,
        status: "Added just now",
      }],
    }));
    setNewPlatform({ name: "", handle: "" });
    setPlatformError("");
    setAddingPlatform(false);
    setSaveState("idle");
  };

  const deletePlatform = (name) => {
    setProfile((current) => ({
      ...current,
      connectedPlatforms: current.connectedPlatforms.filter((platform) => platform.name !== name),
    }));
    setPlatformError("");
    setSaveState("idle");
  };

  const toggleFeatured = (id) => update("portfolio", profile.portfolio.map((item) => item.id === id ? { ...item, featured: !item.featured } : item));
  const deleteProof = (id) => update("portfolio", profile.portfolio.filter((item) => item.id !== id));

  const addProof = (event) => {
    event.preventDefault();
    if (!proof.brand.trim() || !proof.campaign.trim() || !proof.result.trim()) return;
    update("portfolio", [{ ...proof, id: `proof-${Date.now()}`, featured: true, status: "Completed" }, ...profile.portfolio]);
    setProof({ brand: "", campaign: "", result: "", date: "August 2026" });
    setAddingProof(false);
  };

  const updatePhoto = (event) => {
    const [file] = event.target.files;
    if (!file || file.size > 1024 * 1024 || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => update("avatarDataUrl", reader.result));
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    if (Number(profile.rateMin) <= 0 || Number(profile.rateMax) < Number(profile.rateMin)) {
      setSaveState("error");
      return;
    }
    const normalized = {
      ...profile,
      handle: profile.handle.startsWith("@") ? profile.handle : `@${profile.handle}`,
      rateMin: Number(profile.rateMin),
      rateMax: Number(profile.rateMax),
      secondaryNiches: secondaryNiches.map((niche) => niche.trim()).filter(Boolean),
      connectedPlatforms: profile.connectedPlatforms.map((platform) => ({
        ...platform,
        status: platform.connected ? platform.status : "Not connected",
      })),
    };
    if (!saveCreatorProfileEdits(creatorId, normalized)) {
      setSaveState("error");
      return;
    }
    setProfile(normalized);
    setSavedProfile(normalized);
    setSaveState("saved");
  };

  return (
    <main className="creator-profile-editor">
      <header className="profile-editor-header">
        <div><p className="eyebrow">Creator profile</p><h2>Make your value easy to see.</h2><p>Keep the public story brands see accurate, evidence-led, and unmistakably yours.</p></div>
        <div className="profile-editor-header__actions">
          <Link className="button button--outline" to={`/brand/creators/${creatorId}`}><Eye size={16} /> Preview public profile</Link>
          <button className="button button--primary" type="button" onClick={saveProfile} disabled={!isDirty && saveState !== "saved"}><Save size={16} />{saveState === "saved" ? "Changes saved" : "Save changes"}</button>
        </div>
      </header>

      {saveState === "saved" && <div className="profile-save-confirmation" role="status"><CircleCheck size={17} /><span><strong>Your profile is up to date.</strong> Brands will now see these changes on your public profile.</span></div>}
      {saveState === "error" && <div className="profile-save-confirmation is-error" role="alert"><ShieldCheck size={17} /><span><strong>We could not save these changes.</strong> Check that your rate band is valid and your profile photo is under 1 MB, then try again.</span></div>}

      <section className="profile-strength-banner">
        <div className="profile-strength-ring" style={{ "--profile-strength": `${completion * 3.6}deg` }}><span><strong>{completion}%</strong><small>strength</small></span></div>
        <div><span>Profile strength</span><h3>{completion === 100 ? "You are ready to stand out." : "A few details can make your proof stronger."}</h3><p>Complete profiles give brands the context they need to shortlist with confidence.</p></div>
        <div className="profile-strength-actions">
          <div className={profile.portfolio.some((item) => item.featured) ? "is-complete" : ""}><Check size={13} /><span>Feature campaign proof</span></div>
          <div className={profile.connectedPlatforms.length >= 3 && profile.connectedPlatforms.every((item) => item.connected) ? "is-complete" : ""}><Check size={13} /><span>Connect another platform</span></div>
          <div className={profile.bio.length >= 80 ? "is-complete" : ""}><Check size={13} /><span>Tell your community story</span></div>
        </div>
      </section>

      <nav className="profile-editor-nav" aria-label="Profile editor sections">
        <a href="#public-details">Public details</a><a href="#platforms">Platforms</a><a href="#portfolio">Portfolio</a><a href="#insights">Audience & value</a>
      </nav>

      <div className="profile-editor-layout">
        <div className="profile-editor-main">
          <section className="profile-editor-panel" id="public-details">
            <div className="profile-editor-panel__heading"><div><span>01 · Public details</span><h3>Your creator story</h3><p>This is the first context a brand sees when deciding whether your community fits.</p></div><div className="profile-section-status"><CircleCheck size={14} /> Public</div></div>

            <div className="profile-identity-editor">
              <div className="profile-photo-control"><div><img src={profile.avatarDataUrl || creatorHero} alt="Creator profile" /><span>प</span></div><label><Camera size={15} /> Change photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={updatePhoto} /></label><small>JPG, PNG or WebP · max 1 MB</small></div>
              <div className="profile-form-grid">
                <Field label="Display name"><input value={profile.name} onChange={(event) => update("name", event.target.value)} /></Field>
                <Field label="Creator handle"><input value={profile.handle} onChange={(event) => update("handle", event.target.value.replace(/\s/g, ""))} /></Field>
                <Field label="Creator bio" hint={`${profile.bio.length}/280 characters`}><textarea rows="5" maxLength="280" value={profile.bio} onChange={(event) => update("bio", event.target.value)} /></Field>
              </div>
            </div>

            <div className="profile-form-grid profile-form-grid--two">
              <Field label="City or district"><input value={profile.district} onChange={(event) => update("district", event.target.value)} /></Field>
              <Field label="State"><select value={profile.state} onChange={(event) => update("state", event.target.value)}>{INDIAN_STATES.map((state) => <option key={state}>{state}</option>)}</select></Field>
              <Field label="Primary language"><input value={profile.language} onChange={(event) => update("language", event.target.value)} /></Field>
              <Field label="Creator niche"><input value={profile.niche} onChange={(event) => update("niche", event.target.value)} /></Field>
              <div className="secondary-niches-field">
                <div><span>Secondary niches</span><small>Optional · add up to five</small></div>
                <div className="secondary-niche-input"><input value={secondaryNicheInput} onChange={(event) => { setSecondaryNicheInput(event.target.value); setSecondaryNicheError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addSecondaryNiche(); } }} placeholder="Type a niche, e.g. Home cooking" aria-label="Add a secondary niche" /><button type="button" onClick={addSecondaryNiche} disabled={!secondaryNicheInput.trim()}><Plus size={14} /> Add</button></div>
                {secondaryNiches.length > 0 && <div className="secondary-niche-chips" aria-label="Secondary niches">{secondaryNiches.map((niche) => <span key={niche}>{niche}<button type="button" onClick={() => removeSecondaryNiche(niche)} aria-label={`Remove ${niche}`}><CircleX size={13} /></button></span>)}</div>}
                {secondaryNicheError && <p role="alert">{secondaryNicheError}</p>}
              </div>
              <Field label="Collaboration email" hint="Private · shared only after a deal is accepted"><input type="email" value={profile.collaborationEmail} onChange={(event) => update("collaborationEmail", event.target.value)} /></Field>
              <Field label="Availability"><select value={profile.availability} onChange={(event) => update("availability", event.target.value)}><option>Available this month</option><option>Available in 2 weeks</option><option>Available next month</option><option>Limited availability</option><option>Not accepting work</option></select></Field>
            </div>
          </section>

          <section className="profile-editor-panel" id="platforms">
            <div className="profile-editor-panel__heading"><div><span>02 · Connected platforms</span><h3>Bring your audience proof together</h3><p>Connections keep reach and quality signals current. GlobalGalli never publishes on your behalf.</p></div><div className="profile-platform-heading-actions"><ShieldCheck size={22} /><button className="button button--outline" type="button" onClick={() => { setAddingPlatform((current) => !current); setPlatformError(""); }}><Plus size={15} /> Add platform</button></div></div>
            {addingPlatform && <form className="add-platform-form" onSubmit={addPlatform}>
              <Field label="Platform"><input list="creator-platform-options" required placeholder="e.g. Facebook" value={newPlatform.name} onChange={(event) => { setNewPlatform((current) => ({ ...current, name: event.target.value })); setPlatformError(""); }} /><datalist id="creator-platform-options"><option value="Facebook" /><option value="ShareChat" /><option value="Josh" /><option value="LinkedIn" /><option value="X" /></datalist></Field>
              <Field label="Profile handle or channel"><input required placeholder="@yourhandle" value={newPlatform.handle} onChange={(event) => setNewPlatform((current) => ({ ...current, handle: event.target.value }))} /></Field>
              <button className="button button--primary" type="submit"><Link2 size={15} /> Add & connect</button>
              {platformError && <p role="alert">{platformError}</p>}
            </form>}
            {profile.connectedPlatforms.length ? <div className="profile-platform-list">{profile.connectedPlatforms.map((platform) => <PlatformCard platform={platform} onConnect={connectPlatform} onDelete={deletePlatform} onDisconnect={disconnectPlatform} onRefresh={connectPlatform} key={platform.name} />)}</div> : <div className="profile-platform-empty"><Globe2 size={22} /><div><strong>No platforms added yet.</strong><p>Add a platform to start building verified audience proof.</p></div><button type="button" onClick={() => setAddingPlatform(true)}>Add your first platform <ChevronRight size={14} /></button></div>}
            <div className="profile-data-note"><ShieldCheck size={15} /><span><strong>Your data stays yours.</strong> Read-only analytics are used to verify audience quality, regional relevance, and fair rates.</span></div>
          </section>

          <section className="profile-editor-panel" id="portfolio">
            <div className="profile-editor-panel__heading"><div><span>03 · Portfolio proof</span><h3>Show what your work achieved</h3><p>Feature the partnerships that best demonstrate trust, craft, and campaign outcomes.</p></div><button className="button button--outline" type="button" onClick={() => setAddingProof((current) => !current)}><Plus size={15} /> Add proof</button></div>
            {addingProof && <form className="add-proof-form" onSubmit={addProof}><Field label="Brand"><input required value={proof.brand} onChange={(event) => setProof((current) => ({ ...current, brand: event.target.value }))} /></Field><Field label="Campaign"><input required value={proof.campaign} onChange={(event) => setProof((current) => ({ ...current, campaign: event.target.value }))} /></Field><Field label="Result"><input required placeholder="e.g. 2.4× saves benchmark" value={proof.result} onChange={(event) => setProof((current) => ({ ...current, result: event.target.value }))} /></Field><button className="button button--primary" type="submit"><Upload size={15} /> Add to portfolio</button></form>}
            <div className="profile-portfolio-list">{profile.portfolio.map((item) => <PortfolioCard item={item} onFeature={toggleFeatured} onDelete={deleteProof} key={item.id} />)}</div>
          </section>

          <section className="profile-editor-panel profile-insights" id="insights">
            <div className="profile-editor-panel__heading"><div><span>04 · Audience & value</span><h3>The intelligence brands see</h3><p>These verified signals are read-only and refresh when your connected platforms sync.</p></div><div className="profile-section-status"><BarChart3 size={14} /> Last 90 days</div></div>
            <div className="profile-insight-grid">
              <article><Users size={18} /><span>Cross-platform audience</span><strong>{formatAudience(creator.audience)}</strong><small>{creator.platforms.join(" + ")}</small></article>
              <article><Sparkles size={18} /><span>Quality score</span><strong>{creator.quality}<small>/100</small></strong><small>Top {100 - creator.percentile}% in cohort</small></article>
              <article><MapPin size={18} /><span>Audience in {profile.state}</span><strong>{creator.localReach}%</strong><small>Strong regional density</small></article>
              <article><Languages size={18} /><span>Meaningful engagement</span><strong>{creator.engagement}%</strong><small>{creator.confidence}% score confidence</small></article>
            </div>
            <div className="profile-rate-editor"><div><IndianRupee size={18} /><span><strong>Your recommended campaign band</strong><small>For one primary deliverable with standard creator-channel usage.</small></span></div><div><Field label="Minimum rate (₹)"><input type="number" min="1000" step="500" value={profile.rateMin} onChange={(event) => update("rateMin", event.target.value)} /></Field><span>to</span><Field label="Maximum rate (₹)"><input type="number" min="1000" step="500" value={profile.rateMax} onChange={(event) => update("rateMax", event.target.value)} /></Field></div><p>Current public band: <strong>{formatRate(Number(profile.rateMin) || 0)}–{formatRate(Number(profile.rateMax) || 0)}</strong>. GlobalGalli compares offers with this band but never negotiates without you.</p></div>
          </section>
        </div>

        <aside className="profile-editor-sidebar">
          <section className="profile-preview-card">
            <div className="profile-preview-card__top"><span>Brand preview</span><BadgeCheck size={18} /></div>
            <div className="profile-preview-identity"><div><img src={profile.avatarDataUrl || creatorHero} alt="" /><span>प</span></div><h3>{profile.name || "Your name"}</h3><p>{profile.handle || "@yourhandle"}</p></div>
            <div className="profile-preview-meta"><span><MapPin size={13} /> {profile.district}, {profile.state}</span><span><Languages size={13} /> {profile.language}</span></div>
            {secondaryNiches.length > 0 && <div className="profile-preview-niches"><span>{profile.niche}</span>{secondaryNiches.map((niche) => <span key={niche}>{niche}</span>)}</div>}
            <p>{profile.bio}</p>
            <dl><div><dt>Audience</dt><dd>{formatAudience(creator.audience)}</dd></div><div><dt>Quality</dt><dd>{creator.quality}</dd></div><div><dt>Fair band</dt><dd>{formatRate(Number(profile.rateMin) || 0)}–{formatRate(Number(profile.rateMax) || 0)}</dd></div></dl>
            <Link to={`/brand/creators/${creatorId}`}>Open full preview <ArrowRight size={14} /></Link>
          </section>

          <section className="profile-visibility-card"><h3>Profile visibility</h3><label><span><strong>Public profile</strong><small>Brands can discover and shortlist you.</small></span><input type="checkbox" checked={profile.profileVisible} onChange={(event) => update("profileVisible", event.target.checked)} /></label><label><span><strong>Accepting offers</strong><small>Let brands start a fair offer.</small></span><input type="checkbox" checked={profile.acceptingOffers} onChange={(event) => update("acceptingOffers", event.target.checked)} /></label></section>

          {isDirty && <section className="profile-unsaved-card"><Sparkles size={17} /><div><strong>You have unsaved changes</strong><p>Save to update the profile brands see.</p></div><button type="button" onClick={() => { setProfile(savedProfile); setSaveState("idle"); }}>Discard</button></section>}
        </aside>
      </div>

      <div className={`profile-mobile-save${isDirty ? " is-visible" : ""}`}><span>{completion}% complete</span><button className="button button--primary" type="button" onClick={saveProfile}><Save size={15} /> Save changes</button></div>
    </main>
  );
}
