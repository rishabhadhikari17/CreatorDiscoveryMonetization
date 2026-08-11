import { Bell, ChevronDown, CircleHelp, Sparkles } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Wordmark } from "../../components/navigation/Wordmark/Wordmark";
import { useDealState } from "../deal-state/DealStateContext.js";
import { creatorNavigation } from "./creatorNavigation.js";
import "./CreatorShell.css";

function CreatorNavigationLink({ item, mobile = false }) {
  const Icon = item.icon;
  return (
    <NavLink className={({ isActive }) => `creator-nav__link${isActive ? " is-active" : ""}`} to={item.path} end={item.end}>
      <span className="creator-nav__icon"><Icon size={mobile ? 20 : 18} strokeWidth={2} /></span><span>{item.label}</span>{item.badge && <small>{item.badge}</small>}
    </NavLink>
  );
}

export function CreatorShell() {
  const { pathname } = useLocation();
  const { deals, campaigns } = useDealState();
  const openOfferCount = deals.filter((deal) => deal.creatorId === "priya-kumari" && ["sent", "editing", "countered"].includes(deal.dealStatus)).length;
  const activeCampaignCount = campaigns.filter((campaign) => campaign.creatorId === "priya-kumari" && campaign.status !== "completed").length;
  const navigation = creatorNavigation.map((item) => item.path === "/creator/offers" ? { ...item, badge: openOfferCount ? String(openOfferCount) : null } : item.path === "/creator/collaborations" ? { ...item, badge: activeCampaignCount ? String(activeCampaignCount) : null } : item);
  const current = navigation.find((item) => item.end ? pathname === item.path : pathname.startsWith(item.path));

  return (
    <div className="creator-app">
      <aside className="creator-sidebar">
        <div className="creator-sidebar__brand"><Wordmark inverted to="/creator" /></div>
        <div className="creator-sidebar__profile">
          <div className="creator-shell-avatar" aria-hidden="true"><strong>PK</strong><span>प</span></div>
          <div><span>Creator studio</span><strong>Priya Kumari</strong><small>@priyakirasoi</small></div>
        </div>
        <nav className="creator-nav" aria-label="Creator navigation"><p>My workspace</p>{navigation.map((item) => <CreatorNavigationLink item={item} key={item.path} />)}</nav>
        <div className="creator-sidebar__support">
          <button type="button"><CircleHelp size={18} /> Help & support</button>
          <div className="creator-sidebar__tip"><Sparkles size={18} /><div><strong>Your value, made visible</strong><span>Quality and local trust matter more than follower count.</span></div></div>
        </div>
      </aside>

      <div className="creator-main">
        <header className="creator-topbar">
          <div className="creator-topbar__mobile-brand"><Wordmark to="/creator" /></div>
          <div className="creator-topbar__title"><span>Creator studio</span><h1>{current?.label ?? "Dashboard"}</h1></div>
          <div className="creator-topbar__actions">
            <details className="creator-header-popover creator-notifications">
              <summary aria-label="Open creator notifications"><Bell size={20} /><span aria-hidden="true">2</span></summary>
              <div className="creator-header-popover__panel"><strong>New activity</strong><p>Rooted Foods sent a new campaign offer.</p><p>Your Saffola draft is due in three days.</p><small>2 unread updates</small></div>
            </details>
            <details className="creator-header-popover creator-profile-menu">
              <summary aria-label="Open creator profile"><span className="creator-topbar-avatar">PK</span><span><strong>Priya Kumari</strong><small>Creator account</small></span><ChevronDown size={16} /></summary>
              <div className="creator-header-popover__panel"><strong>Priya Kumari</strong><p>Bhojpuri · Food & Culture</p><small>Profile settings will be connected later.</small></div>
            </details>
          </div>
        </header>
        <div className="creator-content"><Outlet /></div>
      </div>

      <nav className="creator-mobile-nav" aria-label="Creator mobile navigation">{navigation.map((item) => <CreatorNavigationLink item={item} mobile key={item.path} />)}</nav>
    </div>
  );
}
