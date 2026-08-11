import { Bell, ChevronDown, CircleHelp, Sparkles } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Wordmark } from "../../components/navigation/Wordmark/Wordmark";
import { useDealState } from "../deal-state/DealStateContext.js";
import { brandNavigation } from "./brandNavigation";
import "./BrandShell.css";

function NavigationLink({ item, mobile = false }) {
  const Icon = item.icon;
  const { pathname } = useLocation();
  const relatedActive = item.relatedPrefix && pathname.startsWith(item.relatedPrefix);

  return (
    <NavLink
      className={({ isActive }) => `brand-nav__link${isActive || relatedActive ? " is-active" : ""}`}
      to={item.path}
      end={item.end}
    >
      <span className="brand-nav__icon"><Icon size={mobile ? 20 : 18} strokeWidth={2} /></span>
      <span>{item.label}</span>
      {item.badge && <small>{item.badge}</small>}
    </NavLink>
  );
}

export function BrandShell() {
  const { pathname } = useLocation();
  const { deals, campaigns } = useDealState();
  const primaryDeal = deals.find((deal) => deal.id === "rooted-foods-bihar");
  const activeDealCount = deals.filter((deal) => deal.brand.name === "Rooted Foods" && !["draft", "withdrawn", "declined"].includes(deal.dealStatus)).length;
  const activeCampaignCount = campaigns.filter((campaign) => campaign.brand.name === "Rooted Foods" && campaign.status !== "completed").length;
  const navigation = brandNavigation.map((item) => item.path === "/brand/deals" ? { ...item, badge: activeDealCount ? String(activeDealCount) : null } : item.path === "/brand/campaigns" ? { ...item, badge: activeCampaignCount ? String(activeCampaignCount) : null } : item);
  const current = navigation.find((item) => item.end ? pathname === item.path : pathname.startsWith(item.path) || (item.relatedPrefix && pathname.startsWith(item.relatedPrefix)));

  return (
    <div className="brand-app">
      <aside className="brand-sidebar">
        <div className="brand-sidebar__brand"><Wordmark to="/brand" /></div>
        <div className="brand-sidebar__workspace">
          <span>Brand workspace</span>
          <strong>Rooted Foods India</strong>
        </div>
        <nav className="brand-nav" aria-label="Brand navigation">
          <p>Workspace</p>
          {navigation.map((item) => <NavigationLink item={item} key={item.path} />)}
        </nav>
        <div className="brand-sidebar__support">
          <button type="button"><CircleHelp size={18} /> Help & support</button>
          <div className="brand-sidebar__tip">
            <Sparkles size={18} />
            <div><strong>Regional-first</strong><span>Find influence beyond the metros.</span></div>
          </div>
        </div>
      </aside>

      <div className="brand-main">
        <header className="brand-topbar">
          <div className="brand-topbar__mobile-brand">
            <Wordmark to="/brand" />
          </div>
          <div className="brand-topbar__title">
            <span>Brand workspace</span>
            <h1>{current?.label ?? "Dashboard"}</h1>
          </div>
          <div className="brand-topbar__actions">
            <details className="header-popover notification-popover">
              <summary aria-label="Open notifications">
                <Bell size={20} />
                <span aria-hidden="true">2</span>
              </summary>
              <div className="header-popover__panel">
                <strong>Notifications</strong>
                <p>{primaryDeal.dealStatus === "countered" ? `Priya countered at ₹${primaryDeal.counterAmount.toLocaleString("en-IN")}.` : primaryDeal.dealStatus === "accepted" ? "Priya accepted the connected campaign offer." : primaryDeal.dealStatus === "declined" ? "Priya declined the campaign offer." : "Your campaign and deal updates appear here."}</p>
                <small>Connected deal state · saved locally</small>
              </div>
            </details>
            <details className="header-popover profile-popover">
              <summary aria-label="Open brand profile">
                <span className="brand-avatar">RF</span>
                <span className="profile-popover__name"><strong>Rooted Foods</strong><small>Brand account</small></span>
                <ChevronDown size={16} />
              </summary>
              <div className="header-popover__panel">
                <strong>Rooted Foods India</strong>
                <p>Meera Kapoor · Campaign Manager</p>
                <small>Profile settings will be connected later.</small>
              </div>
            </details>
          </div>
        </header>

        <div className="brand-content"><Outlet /></div>
      </div>

      <nav className="brand-mobile-nav" aria-label="Brand mobile navigation">
        {navigation.map((item) => <NavigationLink item={item} mobile key={item.path} />)}
      </nav>
    </div>
  );
}
