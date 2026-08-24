import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CircleUserRound,
  Eye,
  EyeOff,
  KeyRound,
  LocateFixed,
  MapPin,
  Mic2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Wordmark } from "../../components/navigation/Wordmark/Wordmark";
import { useDemoExperience } from "../../components/demo/DemoExperienceContext.js";
import {
  BRAND_BUDGETS,
  BRAND_CATEGORIES,
  CREATOR_LANGUAGES,
  CREATOR_NICHES,
  CREATOR_PLATFORMS,
  INDIAN_STATES,
  PINCODE_LOCATIONS,
} from "./onboardingData";
import {
  LEGACY_ONBOARDING_DRAFT_KEY as LEGACY_DRAFT_KEY,
  LEGACY_ONBOARDING_PROFILE_KEY as LEGACY_PROFILE_KEY,
  ONBOARDING_DRAFT_KEY as DRAFT_KEY,
  ONBOARDING_PROFILE_KEY as PROFILE_KEY,
  PREVIOUS_ONBOARDING_DRAFT_KEY as PREVIOUS_DRAFT_KEY,
  PREVIOUS_ONBOARDING_PROFILE_KEY as PREVIOUS_PROFILE_KEY,
} from "./onboardingStorage.js";
import "./OnboardingPage.css";

const emptyForm = {
  displayName: "",
  email: "",
  phone: "",
  pincode: "",
  city: "",
  state: "",
  primaryPlatform: "",
  handle: "",
  language: "",
  niche: "",
  followers: "",
  platforms: [],
  website: "",
  category: "",
  budget: "",
  gst: "",
};

const steps = [
  { number: 1, label: "Account access", copy: "Register securely or return to your workspace." },
  { number: 2, label: "Complete profile", copy: "Add your region and the signals that shape a match." },
];

function readDraft() {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(DRAFT_KEY)
      ?? window.localStorage.getItem(PREVIOUS_DRAFT_KEY)
      ?? window.localStorage.getItem(LEGACY_DRAFT_KEY),
    );
    if (!saved) return null;
    return {
      role: saved.role === "brand" ? "brand" : "creator",
      step: Math.min(Math.max(Number(saved.step) || 1, 1), 2),
      accountComplete: Boolean(saved.accountComplete || Number(saved.step) > 1),
      form: { ...emptyForm, ...saved.form },
    };
  } catch {
    return null;
  }
}

function ChoiceChips({ label, hint, options, selected, onToggle }) {
  return (
    <fieldset className="onboarding-field onboarding-field--chips">
      <legend>{label}</legend>
      {hint && <p>{hint}</p>}
      <div className="onboarding-chips">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              className={isSelected ? "is-selected" : ""}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option)}
              key={option}
            >
              {isSelected && <Check size={14} />}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TextField({ id, label, hint, required, ...props }) {
  return (
    <label className="onboarding-field" htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input id={id} required={required} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function SelectField({ id, label, children, required, ...props }) {
  return (
    <label className="onboarding-field" htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <span className="onboarding-select">
        <select id={id} required={required} {...props}>{children}</select>
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </label>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useDemoExperience();
  const [draftSeed] = useState(readDraft);
  const requestedRole = searchParams.get("role");
  const [role, setRole] = useState(
    requestedRole === "brand" || requestedRole === "creator"
      ? requestedRole
      : draftSeed?.role ?? "creator",
  );
  const [authMode, setAuthMode] = useState("register");
  const [step, setStep] = useState(draftSeed?.step ?? 1);
  const [accountComplete, setAccountComplete] = useState(draftSeed?.accountComplete ?? false);
  const [form, setForm] = useState(draftSeed?.form ?? emptyForm);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const roleLabel = role === "creator" ? "Creator" : "Brand";
  const pinMatch = form.pincode.length === 6 ? PINCODE_LOCATIONS[form.pincode] : null;
  const profileSignal = role === "creator"
    ? form.niche || form.primaryPlatform || "Your creative niche"
    : form.category || "Your industry";

  const progress = useMemo(() => {
    const accountRequirements = [
      form.displayName.trim().length > 0,
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
      accountComplete || password.length >= 8,
    ];
    const locationRequirements = [
      form.pincode.length === 6,
      form.city.trim().length > 0,
      form.state.length > 0,
    ];
    const roleRequirements = role === "creator"
      ? [
          form.primaryPlatform.length > 0,
          form.handle.trim().length > 0,
          form.followers !== "",
          form.language.length > 0,
          form.niche.length > 0,
        ]
      : [form.category.length > 0];
    const requirements = [...accountRequirements, ...locationRequirements, ...roleRequirements];
    return Math.round((requirements.filter(Boolean).length / requirements.length) * 100);
  }, [accountComplete, form, password, role]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ role, step, accountComplete, form }));
      window.localStorage.removeItem(PREVIOUS_DRAFT_KEY);
      window.localStorage.removeItem(LEGACY_DRAFT_KEY);
    } catch {
      // The flow remains usable when browser storage is unavailable.
    }
  }, [accountComplete, form, role, step]);

  useEffect(() => {
    try {
      const legacyProfile = window.localStorage.getItem(PREVIOUS_PROFILE_KEY)
        ?? window.localStorage.getItem(LEGACY_PROFILE_KEY);
      if (!window.localStorage.getItem(PROFILE_KEY) && legacyProfile) {
        window.localStorage.setItem(PROFILE_KEY, legacyProfile);
      }
      window.localStorage.removeItem(PREVIOUS_PROFILE_KEY);
      window.localStorage.removeItem(LEGACY_PROFILE_KEY);
    } catch {
      // Existing local profiles remain optional enhancement data.
    }
  }, []);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function updateRole(nextRole) {
    setRole(nextRole);
    setStep(1);
    setError("");
    setSearchParams({ role: nextRole }, { replace: true });
  }

  function updateAuthMode(nextMode) {
    setAuthMode(nextMode);
    setStep(1);
    setError("");
  }

  function handlePincode(value) {
    const pincode = value.replace(/\D/g, "").slice(0, 6);
    const location = PINCODE_LOCATIONS[pincode];
    setForm((current) => ({
      ...current,
      pincode,
      city: location?.city ?? (pincode.length === 6 ? current.city : ""),
      state: location?.state ?? (pincode.length === 6 ? current.state : ""),
    }));
    setError("");
  }

  function updatePrimaryPlatform(value) {
    setForm((current) => ({
      ...current,
      primaryPlatform: value,
      handle: "",
      followers: "",
      platforms: current.platforms.filter((platform) => platform !== value),
    }));
    setError("");
  }

  function togglePlatform(value) {
    setForm((current) => ({
      ...current,
      platforms: current.platforms.includes(value)
        ? current.platforms.filter((platform) => platform !== value)
        : [...current.platforms, value],
    }));
    setError("");
  }

  function continueFromAccount(event) {
    event.preventDefault();
    if (form.phone && form.phone.length !== 10) {
      setError("Enter a 10-digit mobile number or leave the field blank.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setAccountComplete(true);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function signIn(event) {
    event.preventDefault();
    notify({
      title: `Welcome back, ${roleLabel}`,
      message: "Demo access is ready. No credentials were sent or stored.",
    });
    navigate(role === "brand" ? "/brand" : "/creator");
  }

  function finishOnboarding(event) {
    event.preventDefault();
    const platforms = role === "creator"
      ? [form.primaryPlatform, ...form.platforms.filter((platform) => platform !== form.primaryPlatform)]
      : form.platforms;
    const profile = { ...form, platforms, role, completedAt: new Date().toISOString() };

    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      window.localStorage.removeItem(DRAFT_KEY);
      window.localStorage.removeItem(PREVIOUS_DRAFT_KEY);
      window.localStorage.removeItem(PREVIOUS_PROFILE_KEY);
      window.localStorage.removeItem(LEGACY_DRAFT_KEY);
      window.localStorage.removeItem(LEGACY_PROFILE_KEY);
    } catch {
      // Completion still routes into the demo when storage is unavailable.
    }

    notify({
      title: `${roleLabel} profile ready`,
      message: `Welcome, ${form.displayName}. Your profile is saved locally; the guided workspace is ready.`,
    });
    navigate(role === "brand" ? "/brand" : "/creator");
  }

  const otherPlatforms = CREATOR_PLATFORMS.filter((platform) => platform !== form.primaryPlatform);
  const isLogin = authMode === "login";

  return (
    <main className={`onboarding-page onboarding-page--${role}`}>
      <header className="onboarding-topbar page-shell">
        <Wordmark />
        <Link to="/">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </header>

      <section className="onboarding-shell page-shell" aria-labelledby="onboarding-title">
        <aside className="onboarding-story">
          <div>
            <p className="onboarding-story__eyebrow"><Sparkles size={14} /> Build your GlobalGalli presence</p>
            <h1 id="onboarding-title">Your local influence deserves the right context.</h1>
            <p>Set up your account, then add the regional and professional signals that lead to more relevant partnerships.</p>
          </div>

          <ol className="onboarding-steps" aria-label="Registration progress">
            {steps.map((item) => (
              <li className={`${step === item.number ? "is-current" : ""}${step > item.number ? " is-complete" : ""}`} key={item.number}>
                <span>{step > item.number ? <Check size={15} /> : item.number}</span>
                <div><strong>{item.label}</strong><small>{item.copy}</small></div>
              </li>
            ))}
          </ol>

          <article className="onboarding-preview" aria-label="Profile preview">
            <div className="onboarding-preview__mark">{form.displayName.trim().charAt(0).toUpperCase() || (role === "creator" ? "C" : "B")}</div>
            <div>
              <small>Live profile preview</small>
              <strong>{form.displayName || `Your ${roleLabel} profile`}</strong>
              <span>{profileSignal} · {form.city || "Your region"}</span>
            </div>
            <BadgeCheck size={19} aria-label="Profile setup in progress" />
          </article>
        </aside>

        <div className="onboarding-panel">
          <div className="onboarding-panel__topline">
            <span>{isLogin ? "Workspace access" : `Step ${step} of ${steps.length}`}</span>
            <strong>{isLogin ? "Demo sign in" : `${progress}% complete`}</strong>
          </div>
          <div className="onboarding-progress" aria-hidden="true"><span style={{ width: isLogin ? "100%" : `${progress}%` }} /></div>

          <div className="onboarding-role-toggle" aria-label="Choose profile type">
            <button type="button" className={role === "creator" ? "is-active" : ""} aria-pressed={role === "creator"} onClick={() => updateRole("creator")}>
              <Mic2 size={19} /><span><strong>Creator</strong><small>Get discovered, land deals</small></span>
            </button>
            <button type="button" className={role === "brand" ? "is-active" : ""} aria-pressed={role === "brand"} onClick={() => updateRole("brand")}>
              <Building2 size={19} /><span><strong>Brand</strong><small>Find and book creators</small></span>
            </button>
          </div>

          <div className="onboarding-auth-tabs" role="tablist" aria-label="Account action">
            <button type="button" role="tab" aria-selected={!isLogin} className={!isLogin ? "is-active" : ""} onClick={() => updateAuthMode("register")}>Register</button>
            <button type="button" role="tab" aria-selected={isLogin} className={isLogin ? "is-active" : ""} onClick={() => updateAuthMode("login")}>Log in</button>
          </div>

          {step === 1 && (
            <form className="onboarding-form" onSubmit={isLogin ? signIn : continueFromAccount}>
              <div className="onboarding-form__heading">
                <span>{isLogin ? <KeyRound size={18} /> : <CircleUserRound size={18} />}</span>
                <div>
                  <p>{isLogin ? "Welcome back" : "Create your account"}</p>
                  <h2>{isLogin ? `Enter the ${roleLabel.toLowerCase()} workspace.` : `Join as a ${roleLabel.toLowerCase()}.`}</h2>
                </div>
              </div>

              {!isLogin && <TextField id="onboarding-name" label={role === "creator" ? "Full name" : "Brand or company name"} placeholder={role === "creator" ? "Kavya Reddy" : "Rooted Foods"} value={form.displayName} onChange={(event) => updateField("displayName", event.target.value)} autoComplete="name" required />}
              <TextField id="onboarding-email" label="Email" placeholder="you@example.com" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} autoComplete="email" required />

              {!isLogin && (
                <div className="onboarding-field">
                  <label htmlFor="onboarding-phone">Mobile number <small>Optional</small></label>
                  <div className="onboarding-phone"><span>+91</span><input id="onboarding-phone" type="tel" inputMode="numeric" placeholder="98765 43210" value={form.phone} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} autoComplete="tel-national" /></div>
                  <small>Used only for collaboration updates in the demo profile.</small>
                </div>
              )}

              <div className="onboarding-field">
                <label htmlFor="onboarding-password">Password</label>
                <div className="onboarding-password">
                  <input id="onboarding-password" type={showPassword ? "text" : "password"} placeholder={isLogin ? "Your password" : "At least 8 characters"} value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} autoComplete={isLogin ? "current-password" : "new-password"} minLength={isLogin ? undefined : 8} required />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                {isLogin && <button className="onboarding-forgot" type="button" onClick={() => notify({ title: "Password reset preview", message: "A production account would receive a secure reset link by email." })}>Forgot password?</button>}
              </div>

              <div className="onboarding-note"><ShieldCheck size={17} /><p><strong>Frontend prototype</strong>Your credentials are not sent or stored. Registration details stay on this device until you complete the profile.</p></div>
              {error && <p className="onboarding-error" role="alert">{error}</p>}
              <div className="onboarding-actions onboarding-actions--end">
                <button className="onboarding-primary" type="submit">
                  {isLogin ? `Sign in as ${roleLabel}` : "Continue to profile"} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {step === 2 && !isLogin && (
            <form className="onboarding-form onboarding-form--profile" onSubmit={finishOnboarding}>
              <div className="onboarding-form__heading">
                <span>{role === "creator" ? <Mic2 size={18} /> : <Building2 size={18} />}</span>
                <div><p>{roleLabel} profile</p><h2>Add the details that shape a good match.</h2></div>
              </div>

              <div className="onboarding-form__section">
                <div className="onboarding-section-label"><MapPin size={15} /> Location</div>
                <TextField id="onboarding-pincode" label="6-digit pincode" hint="Enter 758001 to preview location assist." placeholder="758001" inputMode="numeric" value={form.pincode} onChange={(event) => handlePincode(event.target.value)} minLength={6} maxLength={6} required />
                {form.pincode.length === 6 && (
                  <div className={`onboarding-location-status ${pinMatch ? "is-found" : ""}`} role="status">
                    <LocateFixed size={16} />
                    <span>{pinMatch ? `${pinMatch.district}, ${pinMatch.state} found` : "We do not have this PIN locally yet—add the city and state manually."}</span>
                  </div>
                )}
                <div className="onboarding-grid onboarding-grid--two">
                  <TextField id="onboarding-city" label="City or district" placeholder="Keonjhar" value={form.city} onChange={(event) => updateField("city", event.target.value)} required />
                  <SelectField id="onboarding-state" label="State" value={form.state} onChange={(event) => updateField("state", event.target.value)} required>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((stateName) => <option value={stateName} key={stateName}>{stateName}</option>)}
                  </SelectField>
                </div>
              </div>

              {role === "creator" && (
                <div className="onboarding-form__section">
                  <div className="onboarding-section-label"><Mic2 size={15} /> Creator details</div>
                  <SelectField id="onboarding-primary-platform" label="Primary platform" value={form.primaryPlatform} onChange={(event) => updatePrimaryPlatform(event.target.value)} required>
                    <option value="">Select your main platform</option>
                    {CREATOR_PLATFORMS.map((platform) => <option value={platform} key={platform}>{platform}</option>)}
                  </SelectField>
                  {form.primaryPlatform && (
                    <TextField id="onboarding-handle" label={`${form.primaryPlatform} handle`} hint="You can connect and verify this platform later from your dashboard." placeholder={form.primaryPlatform === "YouTube" ? "ChannelName" : "yourhandle"} value={form.handle} onChange={(event) => updateField("handle", event.target.value.replace(/^@/, "").replace(/\s/g, ""))} required />
                  )}
                  <TextField id="onboarding-followers" label={`${form.primaryPlatform === "YouTube" ? "Subscribers" : "Followers"} on ${form.primaryPlatform || "primary platform"}`} hint="An estimate is fine for this prototype." placeholder="109000" type="number" min="0" value={form.followers} onChange={(event) => updateField("followers", event.target.value)} required />
                  <div className="onboarding-grid onboarding-grid--two">
                    <SelectField id="onboarding-language" label="Primary content language" value={form.language} onChange={(event) => updateField("language", event.target.value)} required><option value="">Select language</option>{CREATOR_LANGUAGES.map((language) => <option value={language} key={language}>{language}</option>)}</SelectField>
                    <SelectField id="onboarding-niche" label="Primary niche" value={form.niche} onChange={(event) => updateField("niche", event.target.value)} required><option value="">Select niche</option>{CREATOR_NICHES.map((niche) => <option value={niche} key={niche}>{niche}</option>)}</SelectField>
                  </div>
                  <ChoiceChips label="Other active platforms" hint="Add any other places where you publish consistently." options={otherPlatforms} selected={form.platforms} onToggle={togglePlatform} />
                </div>
              )}

              {role === "brand" && (
                <div className="onboarding-form__section">
                  <div className="onboarding-section-label"><Building2 size={15} /> Brand details</div>
                  <SelectField id="onboarding-category" label="Industry or category" value={form.category} onChange={(event) => updateField("category", event.target.value)} required><option value="">Select category</option>{BRAND_CATEGORIES.map((category) => <option value={category} key={category}>{category}</option>)}</SelectField>
                  <TextField id="onboarding-website" label="Website or brand URL" hint="Optional for this frontend prototype." placeholder="https://yourbrand.com" type="url" value={form.website} onChange={(event) => updateField("website", event.target.value)} />
                  <div className="onboarding-grid onboarding-grid--two">
                    <SelectField id="onboarding-budget" label="Campaign budget range" value={form.budget} onChange={(event) => updateField("budget", event.target.value)}><option value="">Select range</option>{BRAND_BUDGETS.map((budget) => <option value={budget} key={budget}>{budget}</option>)}</SelectField>
                    <TextField id="onboarding-gst" label="GST number" hint="Optional" placeholder="22AAAAA0000A1Z5" value={form.gst} onChange={(event) => updateField("gst", event.target.value.toUpperCase().replace(/\s/g, "").slice(0, 15))} />
                  </div>
                </div>
              )}

              {error && <p className="onboarding-error" role="alert">{error}</p>}
              <div className="onboarding-actions">
                <button className="onboarding-secondary" type="button" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
                <button className="onboarding-primary" type="submit">Create {roleLabel.toLowerCase()} account <Check size={16} /></button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
