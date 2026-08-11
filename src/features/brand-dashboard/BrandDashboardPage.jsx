import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Handshake,
  IndianRupee,
  MapPin,
  Search,
  Send,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatMoney } from "../campaign-brief/campaignMatching.js";
import { useDealState } from "../deal-state/DealStateContext.js";
import {
  dashboardMetrics as metricTemplates,
  recentActivity,
  recommendedCreators,
} from "./data/brandDashboardData";
import "./BrandDashboardPage.css";

const activityIcons = {
  deal: CheckCircle2,
  offer: Send,
  campaign: BriefcaseBusiness,
  shortlist: Star,
};

export function BrandDashboardPage() {
  const { deals, campaigns } = useDealState();
  const rootedDeals = deals.filter((deal) => deal.brand.name === "Rooted Foods");
  const rootedCampaigns = campaigns.filter((campaign) => campaign.brand.name === "Rooted Foods");
  const securedValue = rootedCampaigns.reduce((sum, campaign) => sum + campaign.payment.secured - campaign.payment.released, 0);
  const dashboardMetrics = metricTemplates.map((metric) => metric.id === "campaigns" ? { ...metric, value: String(rootedCampaigns.filter((campaign) => campaign.status !== "completed").length), detail: rootedCampaigns.some((campaign) => campaign.status === "in_review") ? "Content needs review" : "Shared workflow active" } : metric.id === "offers" ? { ...metric, value: String(rootedDeals.filter((deal) => ["sent", "editing", "countered"].includes(deal.dealStatus)).length), detail: rootedDeals.some((deal) => deal.dealStatus === "countered") ? "Counter needs review" : "Creator response pending" } : metric.id === "deals" ? { ...metric, value: formatMoney(securedValue), detail: "Simulated secured value" } : metric);
  const activeCampaigns = rootedCampaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.campaign.name,
    market: "Muzaffarpur & North Bihar",
    language: "Bhojpuri",
    status: { creating: "Creator production", in_review: "Review required", revision_requested: "Creator revision", approved: "Approved", delivered: "Payment action", completed: "Completed" }[campaign.status],
    creators: `${campaign.creatorName} · 1 creator`,
    budget: formatMoney(campaign.amount),
    progress: { creating: 28, in_review: 52, revision_requested: 46, approved: 72, delivered: 88, completed: 100 }[campaign.status],
    due: campaign.contract.publishBy.replace(" 2026", ""),
  }));
  return (
    <main className="brand-dashboard">
      <header className="brand-dashboard__welcome">
        <div>
          <p className="eyebrow">Wednesday · 12 August</p>
          <h2>Welcome back, Meera.</h2>
          <p>Here’s what is moving across your regional creator campaigns.</p>
        </div>
        <Link className="button button--primary" to="/brand/discover">
          <Search size={17} /> Discover creators
        </Link>
      </header>

      <section className="dashboard-metrics" aria-label="Marketplace summary">
        {dashboardMetrics.map((metric) => (
          <Link className={`metric-card metric-card--${metric.tone}`} to={metric.path} key={metric.id}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ))}
      </section>

      <div className="dashboard-layout">
        <section className="dashboard-panel campaign-panel" aria-labelledby="campaigns-heading">
          <div className="dashboard-panel__heading">
            <div>
              <span>In motion</span>
              <h3 id="campaigns-heading">Active campaigns</h3>
            </div>
            <Link to="/brand/campaigns">View campaigns <ArrowRight size={15} /></Link>
          </div>

          <div className="campaign-list">
            {activeCampaigns.map((campaign) => (
              <article className="campaign-summary" key={campaign.id}>
                <div className="campaign-summary__top">
                  <div>
                    <span>{campaign.language}</span>
                    <h4>{campaign.name}</h4>
                    <p><MapPin size={13} /> {campaign.market}</p>
                  </div>
                  <small>{campaign.status}</small>
                </div>
                <div className="campaign-summary__facts">
                  <span><Users size={14} /> {campaign.creators}</span>
                  <span><IndianRupee size={14} /> Budget {campaign.budget}</span>
                  <span><Clock3 size={14} /> Due {campaign.due}</span>
                </div>
                <div className="campaign-summary__progress">
                  <div><span>Campaign progress</span><strong>{campaign.progress}%</strong></div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-label={`${campaign.name} progress`}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={campaign.progress}
                  >
                    <span style={{ width: `${campaign.progress}%` }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="dashboard-panel activity-panel" aria-labelledby="activity-heading">
          <div className="dashboard-panel__heading">
            <div>
              <span>Latest updates</span>
              <h3 id="activity-heading">Recent activity</h3>
            </div>
          </div>
          <ol className="activity-list">
            {recentActivity.map((activity) => {
              const ActivityIcon = activityIcons[activity.type];
              return (
                <li key={activity.id}>
                  <span className={`activity-list__icon activity-list__icon--${activity.type}`}>
                    <ActivityIcon size={16} />
                  </span>
                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.context}</p>
                    <small>{activity.time}</small>
                  </div>
                </li>
              );
            })}
          </ol>
          <Link className="activity-panel__link" to="/brand/deals">
            Review pending activity <ArrowRight size={15} />
          </Link>
        </aside>
      </div>

      <section className="recommendation-section" aria-labelledby="recommendations-heading">
        <div className="recommendation-section__heading">
          <div>
            <span><Sparkles size={14} /> Relevant to your active briefs</span>
            <h3 id="recommendations-heading">Regional creators to watch</h3>
            <p>Selected from your current language, location, and category preferences.</p>
          </div>
          <Link to="/brand/discover">Explore all creators <ArrowRight size={15} /></Link>
        </div>

        <div className="creator-recommendation-grid">
          {recommendedCreators.map((creator) => (
            <article className="recommended-creator" key={creator.id}>
              <div className="recommended-creator__top">
                <div className="recommended-creator__avatar" aria-label={`${creator.name} initials`}>
                  <strong>{creator.initials}</strong><span aria-hidden="true">{creator.script}</span>
                </div>
                <div className="recommended-creator__identity">
                  <span>{creator.language} · {creator.niche}</span>
                  <h4>{creator.name}</h4>
                  <p><MapPin size={13} /> {creator.location}</p>
                </div>
                <div className="recommended-creator__quality">
                  <strong>{creator.quality}</strong><span>Quality</span>
                </div>
              </div>
              <div className="recommended-creator__signals">
                <div><span>Audience</span><strong>{creator.audience}</strong></div>
                <div><span>Engagement</span><strong>{creator.engagement}</strong></div>
                <div><span>Brief relevance</span><strong>{creator.relevance}%</strong></div>
              </div>
              <div className="recommended-creator__footer">
                <div><span>Fair rate band</span><strong>{creator.rate}</strong></div>
                <Link to={`/brand/creators/${creator.id}`} aria-label={`View ${creator.name} profile`}>
                  View creator <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-discovery-cta">
        <div className="dashboard-discovery-cta__icon"><Handshake size={25} /></div>
        <div>
          <span>Build your next regional partnership</span>
          <h3>Find creators by language, market, and audience quality.</h3>
        </div>
        <Link className="button button--primary" to="/brand/discover">
          Start discovering <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
