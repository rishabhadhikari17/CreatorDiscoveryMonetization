import {
  BriefcaseBusiness,
  Handshake,
  LayoutDashboard,
  Search,
  Star,
} from "lucide-react";

export const brandNavigation = [
  { label: "Dashboard", path: "/brand", icon: LayoutDashboard, end: true },
  { label: "Discover", path: "/brand/discover", icon: Search, relatedPrefix: "/brand/creators/" },
  { label: "Shortlist", path: "/brand/shortlist", icon: Star, badge: "3" },
  { label: "Campaigns", path: "/brand/campaigns", icon: BriefcaseBusiness },
  { label: "Deals", path: "/brand/deals", icon: Handshake, badge: "2" },
];
