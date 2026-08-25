import { Badge } from "../../components/ui/Badge/Badge";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { ColorSwatch } from "../../components/ui/ColorSwatch/ColorSwatch";
import { Field, SelectField } from "../../components/ui/Field/Field";
import "./DesignSystemPage.css";

const palette = [
  {
    color: "#FFFDF9",
    name: "Warm canvas",
    token: "--color-cream-50",
    usage: "Primary page background and breathing space.",
    darkText: true,
  },
  {
    color: "#F6F4EF",
    name: "Soft surface",
    token: "--color-cream-100",
    usage: "Cards, panels, and subtle section separation.",
    darkText: true,
  },
  {
    color: "#9AA67A",
    name: "Community",
    token: "--color-olive-500",
    usage: "Trust signals, positive states, and secondary actions.",
    darkText: true,
  },
  {
    color: "#D6385F",
    name: "Value",
    token: "--color-rose-600",
    usage: "Primary actions, highlights, and fair-value moments.",
  },
];

export function DesignSystemPage() {
  return (
    <main className="design-system">
      <header className="ds-header">
        <div className="page-shell ds-header__inner">
          <a className="wordmark" href="#top" aria-label="GlobalGalli design system home">
            <span>V</span>
            <strong>GlobalGalli</strong>
            <small>working title</small>
            <span>G</span>
            <strong>GlobalGallihttps://github.com/rishabhadhikari17/CreatorDiscoveryMonetization/pull/2/conflict?name=src%252Ffeatures%252Fdesign-system%252FDesignSystemPage.jsx&ancestor_oid=cab06befc9370e2c300f10acd19b6b1d53910f8a&base_oid=883756b688bf8ecfc66d749382bf7b95dbfbf1e4&head_oid=b4315ed24c686f2544677e0ab9f35c98019999c5li</strong>
            <small>creator network</small>
          </a>
          <div className="ds-header__meta">
            <span>Foundation</span>
            <strong>01</strong>
          </div>
        </div>
      </header>

      <section className="ds-hero page-shell" id="top">
        <div className="ds-hero__copy">
          <p className="eyebrow">React foundation · Design system</p>
          <h1>
            Warm enough for creators. <em>Clear enough for brands.</em>
          </h1>
          <p>
            A regional-first interface foundation built around trust, fairness, and
            the richness of local communities. Every future feature will inherit
            these shared tokens and components.
          </p>
          <div className="ds-hero__actions">
            <Button>Primary action <span aria-hidden="true">↗</span></Button>
            <Button variant="outline">Secondary action</Button>
          </div>
        </div>

        <div className="palette-tile" aria-label="Brand palette preview">
          <div style={{ backgroundColor: "#FFFDF9" }} />
          <div style={{ backgroundColor: "#F6F4EF" }} />
          <div style={{ backgroundColor: "#9AA67A" }} />
          <div style={{ backgroundColor: "#D6385F" }} />
          <span>Four colors.<br />One clear voice.</span>
        </div>
      </section>

      <section className="ds-section ds-section--surface">
        <div className="page-shell">
          <div className="ds-section__heading">
            <div>
              <p className="eyebrow">01 · Color</p>
              <h2 className="section-title">A restrained marketplace palette with clear semantic roles.</h2>
            </div>
            <p>
              Warm neutrals keep the product calm, olive communicates community
              trust, and a single rose accent carries value and action.
            </p>
          </div>
          <div className="swatch-grid">
            {palette.map((swatch) => (
              <ColorSwatch key={swatch.color} {...swatch} />
            ))}
          </div>
        </div>
      </section>

      <section className="ds-section page-shell">
        <div className="ds-section__heading">
          <div>
            <p className="eyebrow">02 · Typography</p>
            <h2 className="section-title">Editorial warmth with practical clarity.</h2>
          </div>
          <p>
            One humanist sans family carries both story and product information,
            keeping dense creator and campaign data easy to scan.
          </p>
        </div>

        <div className="type-specimen">
          <div className="type-specimen__display">
            <span>Display · Humanist system sans</span>
            <p>Regional influence should feel visible.</p>
          </div>
          <div className="type-specimen__body">
            <span>Body · System Sans</span>
            <h3>Audience quality, explained in plain language.</h3>
            <p>
              Clear hierarchy supports creator profiles, campaign briefs, audience
              insights, offer comparisons, and deal workflows without visual noise.
            </p>
          </div>
          <div className="type-specimen__data">
            <span>Data · Monospace</span>
            <strong>82 / 100</strong>
            <code>₹12,000–₹18,000</code>
          </div>
        </div>
      </section>

      <section className="ds-section ds-section--surface">
        <div className="page-shell">
          <div className="ds-section__heading">
            <div>
              <p className="eyebrow">03 · Components</p>
              <h2 className="section-title">Reusable building blocks for every feature.</h2>
            </div>
            <p>
              These components establish consistent states, spacing, accessibility,
              and interaction behavior before product screens are introduced.
            </p>
          </div>

          <div className="component-grid">
            <Card className="component-panel" tone="light">
              <div className="component-panel__heading">
                <span>Actions</span>
                <code>Button</code>
              </div>
              <div className="button-row">
                <Button>Send offer</Button>
                <Button variant="secondary">Add to shortlist</Button>
                <Button variant="outline">View profile</Button>
              </div>
            </Card>

            <Card className="component-panel" tone="light">
              <div className="component-panel__heading">
                <span>Status</span>
                <code>Badge</code>
              </div>
              <div className="badge-row">
                <Badge>High trust</Badge>
                <Badge tone="rose">Below fair band</Badge>
                <Badge tone="neutral">Tamil · Food</Badge>
              </div>
            </Card>

            <Card className="component-panel component-panel--fields" tone="light">
              <div className="component-panel__heading">
                <span>Inputs</span>
                <code>Field</code>
              </div>
              <div className="field-grid">
                <Field
                  id="creator-search"
                  label="Creator search"
                  placeholder="Search language, region, or niche"
                  hint="Supports clear, contextual instructions."
                />
                <SelectField id="language" label="Primary language" defaultValue="Tamil">
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Bhojpuri</option>
                  <option>Marathi</option>
                </SelectField>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="ds-section page-shell">
        <div className="ds-section__heading">
          <div>
            <p className="eyebrow">04 · Product patterns</p>
            <h2 className="section-title">The foundation already speaks the product language.</h2>
          </div>
          <p>
            Example cards prove that the visual system can carry audience signals,
            pricing, and transparent marketplace decisions.
          </p>
        </div>

        <div className="pattern-grid">
          <Card className="creator-card" tone="warm">
            <div className="creator-card__top">
              <div className="creator-avatar" aria-hidden="true">ल</div>
              <div>
                <Badge>High confidence</Badge>
                <h3>Lakshmi Devarakonda</h3>
                <p>Warangal · Telugu · Food</p>
              </div>
              <div className="quality-score">
                <strong>82</strong>
                <span>Quality</span>
              </div>
            </div>
            <div className="signal-list">
              <div><span>Audience trust</span><strong>86%</strong></div>
              <div><span>Regional relevance</span><strong>91%</strong></div>
              <div><span>Engagement depth</span><strong>78%</strong></div>
            </div>
          </Card>

          <Card className="rate-card" tone="rose">
            <div>
              <Badge tone="neutral">Fair compensation</Badge>
              <p>Suggested rate band</p>
              <strong>₹12K–₹18K</strong>
              <small>Sponsored reel · 30-day usage</small>
            </div>
            <div className="rate-card__scale" aria-label="Example offer compared with fair rate band">
              <span>Offer ₹9K</span>
              <i><b /></i>
              <span>Fair band begins at ₹12K</span>
            </div>
          </Card>
        </div>
      </section>

      <footer className="ds-footer">
        <div className="page-shell">
          <p>Step 1 complete</p>
          <span>React JavaScript · Shared tokens · Reusable components · Responsive foundation</span>
        </div>
      </footer>
    </main>
  );
}
