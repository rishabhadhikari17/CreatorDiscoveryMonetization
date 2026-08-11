import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge/Badge";
import { SiteHeader } from "../../components/navigation/SiteHeader/SiteHeader";
import { Wordmark } from "../../components/navigation/Wordmark/Wordmark";
import "./LandingPage.css";

const signals = [
  { label: "Audience quality", value: "88", width: "88%" },
  { label: "Regional relevance", value: "76", width: "76%" },
  { label: "Engagement depth", value: "86", width: "86%" },
];

const principles = [
  { number: "01", title: "Discover locally", copy: "Search by language, region, niche, and the audience a campaign needs to reach." },
  { number: "02", title: "Understand real value", copy: "See meaningful audience and engagement signals—not follower count in isolation." },
  { number: "03", title: "Agree with clarity", copy: "Use transparent rate bands and deal terms so both sides negotiate with context." },
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <SiteHeader />

      <section className="landing-hero page-shell">
        <div className="landing-hero__copy">
          <div className="landing-kicker"><span>भारत</span> Built for regional influence</div>
          <h1>Local voices.<br /><em>Fair value.</em></h1>
          <p>
            A creator marketplace helping brands discover trusted regional voices—and
            helping creators turn community influence into fairly priced opportunities.
          </p>
          <div className="landing-hero__actions" aria-label="Choose a demo experience">
            <Link className="button button--primary" to="/brand">
              Explore as Brand <span aria-hidden="true">→</span>
            </Link>
            <Link className="button button--outline" to="/creator">
              Explore as Creator <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="landing-hero__note"><span aria-hidden="true">●</span> Open demo · No sign-in required</p>
        </div>

        <div className="creator-spotlight" aria-label="Example creator quality preview">
          <div className="creator-spotlight__topline">
            <Badge>Strong local fit</Badge>
            <span>Muzaffarpur, Bihar</span>
          </div>
          <div className="creator-spotlight__identity">
            <div className="creator-spotlight__avatar" aria-hidden="true"><span>प</span></div>
            <div>
              <p>Featured creator</p>
              <h2>Priya Kumari</h2>
              <span>Bhojpuri · Food & Culture</span>
            </div>
          </div>
          <div className="creator-spotlight__score">
            <div>
              <strong>88</strong><span>/100</span>
              <small>Quality score</small>
            </div>
            <p>High trust<br />High confidence</p>
          </div>
          <div className="creator-spotlight__signals">
            {signals.map((signal) => (
              <div className="signal" key={signal.label}>
                <div><span>{signal.label}</span><strong>{signal.value}</strong></div>
                <i><b style={{ width: signal.width }} /></i>
              </div>
            ))}
          </div>
          <div className="creator-spotlight__rate">
            <span>Fair rate for a sponsored reel</span>
            <strong>₹18K–₹26K</strong>
          </div>
          <span className="creator-spotlight__stamp" aria-hidden="true">न्याय</span>
        </div>
      </section>

      <section className="trust-strip" aria-label="Marketplace principles">
        <div className="page-shell">
          <span>Regional-first discovery</span><i aria-hidden="true" />
          <span>Quality beyond followers</span><i aria-hidden="true" />
          <span>Transparent pricing</span><i aria-hidden="true" />
          <span>Two-sided marketplace</span>
        </div>
      </section>

      <section className="role-section page-shell" aria-labelledby="role-heading">
        <div className="role-section__heading">
          <div>
            <p className="eyebrow">Choose your view</p>
            <h2 id="role-heading">One marketplace.<br />Two clear paths.</h2>
          </div>
          <p>Switch roles at any time during the demo. Both experiences connect to the same marketplace story.</p>
        </div>

        <div className="role-grid">
          <article className="role-card role-card--brand" id="brands">
            <div className="role-card__number">01</div>
            <div className="role-card__icon" aria-hidden="true">B</div>
            <p>For brands & agencies</p>
            <h3>Find voices your market already trusts.</h3>
            <ul>
              <li><span>✓</span> Discover by region, language, and niche</li>
              <li><span>✓</span> Compare meaningful audience signals</li>
              <li><span>✓</span> Build deals around fair rate bands</li>
            </ul>
            <Link to="/brand">Enter Brand Experience <span aria-hidden="true">→</span></Link>
          </article>

          <article className="role-card role-card--creator" id="creators">
            <div className="role-card__number">02</div>
            <div className="role-card__icon" aria-hidden="true">C</div>
            <p>For regional creators</p>
            <h3>Make your influence visible and valuable.</h3>
            <ul>
              <li><span>✓</span> Showcase the quality behind your community</li>
              <li><span>✓</span> Understand your transparent fair rate</li>
              <li><span>✓</span> Review and negotiate clear offers</li>
            </ul>
            <Link to="/creator">Enter Creator Experience <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="page-shell">
          <div className="how-section__intro">
            <p className="eyebrow">A fairer path to partnership</p>
            <h2>From overlooked<br />to understood.</h2>
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
          <Wordmark inverted />
          <p>Built to bring regional influence into clear view.</p>
          <span>Guided frontend prototype · Steps 1–13</span>
        </div>
      </footer>
    </main>
  );
}
