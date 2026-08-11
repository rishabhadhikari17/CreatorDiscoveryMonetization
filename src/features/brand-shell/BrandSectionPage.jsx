import {
  BriefcaseBusiness,
  Handshake,
  Search,
  Star,
} from "lucide-react";
import "./BrandSectionPage.css";

const sectionContent = {
  discover: {
    icon: Search,
    eyebrow: "Creator discovery",
    title: "Find the right regional voice.",
    copy: "Search and filters for language, location, niche, audience characteristics, quality, and budget will be built in Step 5.",
    panelTitle: "Discovery workspace",
    panelCopy: "This route is connected and ready for creator search, filtering, and ranked results.",
    points: ["Region and district filters", "Language and niche matching", "Audience-quality signals"],
  },
  shortlist: {
    icon: Star,
    eyebrow: "Saved creators",
    title: "Shape a campaign-ready shortlist.",
    copy: "Saved regional creators and their campaign fit will appear here once discovery and campaign planning are connected.",
    panelTitle: "Shortlist workspace",
    panelCopy: "Keep promising creators organized before turning your selection into an actionable brief.",
    points: ["Compare creator fit", "Review estimated rates", "Add creators to a brief"],
  },
  campaigns: {
    icon: BriefcaseBusiness,
    eyebrow: "Campaign planning",
    title: "Turn a local brief into action.",
    copy: "Campaign objectives, target regions, languages, deliverables, timelines, and budgets will be managed from this space.",
    panelTitle: "Campaign workspace",
    panelCopy: "The structure is prepared for both draft briefs and campaigns already in motion.",
    points: ["Draft campaign briefs", "Track active campaigns", "Review delivery progress"],
  },
  deals: {
    icon: Handshake,
    eyebrow: "Offers and deals",
    title: "Keep every agreement transparent.",
    copy: "Offers, negotiations, usage rights, deliverables, and deal stages will be visible here for the brand team.",
    panelTitle: "Deal workspace",
    panelCopy: "This route will connect brand offers with creator responses in the two-sided marketplace flow.",
    points: ["Review offer status", "Compare against fair rates", "Follow negotiation activity"],
  },
};

export function BrandSectionPage({ section }) {
  const content = sectionContent[section];
  const Icon = content.icon;

  return (
    <main className="brand-section">
      <div className="brand-section__intro">
        <p className="eyebrow">{content.eyebrow}</p>
        <h2>{content.title}</h2>
        <p>{content.copy}</p>
      </div>

      <section className="brand-section__stage" aria-label={`${section} workspace preview`}>
        <div className="brand-section__stage-icon"><Icon size={27} /></div>
        <div>
          <span>Workspace foundation</span>
          <h3>{content.panelTitle}</h3>
          <p>{content.panelCopy}</p>
        </div>
        <ul>
          {content.points.map((point) => <li key={point}><span>✓</span>{point}</li>)}
        </ul>
      </section>

    </main>
  );
}
