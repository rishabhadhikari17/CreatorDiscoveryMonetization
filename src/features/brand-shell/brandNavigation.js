import {
  BriefcaseBusiness,
  Handshake,
  Inbox,
  LayoutDashboard,
  Search,
  Star,
} from "lucide-react";

export const brandNavigation = [
  { label: "Dashboard", mobileLabel: "Home", path: "/brand", icon: LayoutDashboard, end: true },
  { label: "Discover", mobileLabel: "Explore", path: "/brand/discover", icon: Search, relatedPrefix: "/brand/creators/" },
  { label: "Shortlist", mobileLabel: "Saved", path: "/brand/shortlist", icon: Star, badge: "3" },
  { label: "Campaigns", mobileLabel: "Work", path: "/brand/campaigns", icon: BriefcaseBusiness },
  { label: "Interest", path: "/brand/interests", icon: Inbox },
  { label: "Deals", path: "/brand/deals", icon: Handshake, badge: "2" },
];
