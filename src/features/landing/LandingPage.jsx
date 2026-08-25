import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  HeartHandshake,
  Languages,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../../components/navigation/SiteHeader/SiteHeader";
import { Wordmark } from "../../components/navigation/Wordmark/Wordmark";
import creatorHero from "../../assets/regional-creator-hero.jpg";
import "./LandingPage.css";

const marketplaceSignals = [
  { value: "10+", label: "regional languages" },
  { value: "82%", label: "average local reach" },
  { value: "100%", label: "transparent rate bands" },
];

const roles = [
  {
    id: "brands",
    eyebrow: "For brands & agencies",
    title: "Find creators your market already listens to.",
    copy: "Search by language, district, niche, and audience quality. Build a shortlist with evidence—not vanity metrics.",
    action: "Explore as a brand",
    to: "/brand",
    icon: <BriefcaseBusiness className="role-card__icon" size={26} aria-hidden="true" />,
  },
  {
    id: "creators",
    eyebrow: "For regional creators",
    title: "Turn community trust into fair opportunity.",
    copy: "Show the depth behind your audience, understand your rate band, and manage every offer with clarity.",
    action: "Explore as a creator",
    to: "/creator",
    icon: <Users className="role-card__icon" size={26} aria-hidden="true" />,
  },
];

const principles = [
  { number: "01", title: "Context over count", copy: "Audience quality is compared within a creator’s own language, region, and category." },
  { number: "02", title: "Pricing in the open", copy: "Both sides see the same rate band before a conversation becomes a negotiation." },
  { number: "03", title: "Partnership, end to end", copy: "Discovery, offers, deliverables, approvals, and payment stay in one shared workflow." },
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <SiteHeader />

      <section className="landing-hero page-shell">
        <div className="landing-hero__copy">
          <p className="landing-kicker"><span>भारत</span> Regional creator marketplace</p>
          <h1>Find the voices your market <em>already trusts.</em></h1>
          <p className="landing-hero__intro">
            GlobalGalli helps brands discover credible regional creators—and helps
            creators turn genuine community influence into fairly priced work.
          </p>
          <div className="landing-hero__actions" aria-label="Choose a demo experience">
            <Link className="button button--primary" to="/brand">
              Discover creators <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button--outline" to="/creator">
              View creator experience
            </Link>
          </div>
          <div className="landing-hero__proof">
            <span><BadgeCheck size={17} /> Quality-led matching</span>
            <span><HeartHandshake size={17} /> Fair-rate guidance</span>
          </div>
        </div>

        <figure className="creator-story">
          <div className="creator-story__photo">
            <img
              src={creatorHero}
              alt="A regional food creator filming a recipe in her home kitchen"
            />
            <span className="creator-story__badge"><BadgeCheck size={15} /> Strong local fit</span>
            <div className="creator-story__score"><strong>88</strong><span>quality<br />score</span></div>
          </div>
          <figcaption>
            <div>
              <span>Featured creator</span>
              <h2>Priya Kumari</h2>
              <p><MapPin size={13} /> Muzaffarpur · Bhojpuri · Food & Culture</p>
            </div>
            <div className="creator-story__rate">
              <span>Fair reel rate</span>
              <strong>₹18K–₹26K</strong>
            </div>
          </figcaption>
        </figure>
      </section>

      <section className="marketplace-search page-shell" aria-label="Creator search preview">
        <div className="marketplace-search__segment">
          <Languages size={18} aria-hidden="true" />
          <span><strong>Language</strong>Bhojpuri</span>
        </div>
        <div className="marketplace-search__segment">
          <MapPin size={18} aria-hidden="true" />
          <span><strong>Market</strong>Bihar</span>
        </div>
        <div className="marketplace-search__segment">
          <Sparkles size={18} aria-hidden="true" />
          <span><strong>What you need</strong>Food & culture creators</span>
        </div>
        <Link className="marketplace-search__action" to="/brand/discover" aria-label="Search the creator marketplace">
          <Search size={21} aria-hidden="true" />
        </Link>
      </section>

      <section className="marketplace-proof" aria-label="Marketplace highlights">
        <div className="page-shell">
          <p>Built for India’s real influence map.</p>
          <dl>
            {marketplaceSignals.map((signal) => (
              <div key={signal.label}><dt>{signal.value}</dt><dd>{signal.label}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="role-section page-shell" aria-labelledby="role-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">One connected marketplace</p>
            <h2 id="role-heading">Built for both sides<br />of the partnership.</h2>
          </div>
          <p>Every demo action connects to the same campaign story, so you can see the experience from either side.</p>
        </div>

        <div className="role-grid">
          {roles.map(({ id, eyebrow, title, copy, action, to, icon }) => (
            <article className="role-card" id={id} key={id}>
              {icon}
              <p>{eyebrow}</p>
              <h3>{title}</h3>
              <span>{copy}</span>
              <Link to={to}>{action} <ArrowRight size={17} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="page-shell">
          <div className="how-section__intro">
            <p className="eyebrow">How GlobalGalli works</p>
            <h2>Trust should be<br />easy to understand.</h2>
            <BarChart3 size={44} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="principle-list">
            {principles.map((principle) => (
              <article key={principle.number}>
                <span>{principle.number}</span>
                <h3>{principle.title}</h3>
                <p>{principle.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="page-shell">
          <Wordmark />
          <p>Regional voices. Clear value. Better partnerships.</p>
          <Link to="/onboarding">Join the marketplace <ArrowRight size={15} /></Link>
        </div>
      </footer>
    </main>
  );
}
