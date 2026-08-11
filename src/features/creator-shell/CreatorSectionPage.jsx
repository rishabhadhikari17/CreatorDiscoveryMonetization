import { ArrowLeft, Handshake, PanelsTopLeft, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import "./CreatorSectionPage.css";

const sections = {
  offers: { icon: Handshake, eyebrow: "Offer workflow", title: "Negotiate with evidence, not guesswork.", copy: "Incoming offer details, fair-band comparison, and accept, counter, or decline actions will be built in Step 10." },
  collaborations: { icon: PanelsTopLeft, eyebrow: "Active work", title: "Keep every collaboration on track.", copy: "Deliverables, review stages, deadlines, and campaign execution will be connected in Step 12." },
  profile: { icon: UserRound, eyebrow: "Creator profile", title: "Present the full value of your community.", copy: "Profile details, connected platforms, portfolio proof, and completeness controls will live here." },
};

export function CreatorSectionPage({ section }) {
  const content = sections[section];
  const Icon = content.icon;
  return <main className="creator-section-page"><div><p className="eyebrow">{content.eyebrow}</p><h2>{content.title}</h2><p>{content.copy}</p></div><section><div><Icon size={25} /></div><span>Workspace connected</span><h3>{content.eyebrow} is ready for its next build step.</h3><p>The creator shell, routing, and responsive navigation are already in place.</p><Link className="button button--outline" to="/creator"><ArrowLeft size={15} /> Back to dashboard</Link></section></main>;
}
