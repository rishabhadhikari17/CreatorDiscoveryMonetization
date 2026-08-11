import { Link } from "react-router-dom";
import { Wordmark } from "../../components/navigation/Wordmark/Wordmark";
import "./DemoRolePage.css";

const content = {
  brand: {
    eyebrow: "Brand experience",
    title: "Find influence that feels close to home.",
    copy: "Discover credible regional creators, understand their audience quality, and build partnerships around transparent value.",
    accent: "ब्रांड",
    stats: [["12", "Regional markets"], ["8", "Vernacular languages"], ["Fair", "Rate guidance"]],
    next: "Creator discovery and campaign tools will live inside this workspace.",
  },
  creator: {
    eyebrow: "Creator experience",
    title: "Let the value of your community be seen.",
    copy: "Show brands what makes your audience meaningful, receive clearer opportunities, and negotiate with a fair-rate reference.",
    accent: "सृजन",
    stats: [["88", "Quality score"], ["₹12K–₹18K", "Fair rate band"], ["Clear", "Offer terms"]],
    next: "Audience insights, offers, and earnings will live inside this workspace.",
  },
};

export function DemoRolePage({ role }) {
  const view = content[role];

  return (
    <main className={`demo-role demo-role--${role}`}>
      <header className="demo-role__header page-shell">
        <Wordmark />
        <Link to="/">Back to home</Link>
      </header>
      <section className="demo-role__content page-shell">
        <div className="demo-role__copy">
          <p className="eyebrow">{view.eyebrow}</p>
          <h1>{view.title}</h1>
          <p>{view.copy}</p>
          <div className="demo-role__status">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>You entered without signing in</strong>
              <small>This is a frontend-only demonstration workspace.</small>
            </div>
          </div>
        </div>
        <aside className="demo-role__panel">
          <span className="demo-role__accent" aria-hidden="true">{view.accent}</span>
          <p>Your {role} workspace</p>
          <div className="demo-role__stats">
            {view.stats.map(([value, label]) => (
              <div key={label}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>
          <p className="demo-role__next">{view.next}</p>
        </aside>
      </section>
      <footer className="demo-role__footer page-shell">
        <span>Use the role switcher below to change perspective.</span>
        <strong>Step 2 · Demo entry ready</strong>
      </footer>
    </main>
  );
}
