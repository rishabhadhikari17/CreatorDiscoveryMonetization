import { Handshake, LayoutDashboard, Megaphone, PanelsTopLeft, UserRound } from "lucide-react";

export const creatorNavigation = [
  { label: "Dashboard", mobileLabel: "Home", path: "/creator", icon: LayoutDashboard, end: true },
  { label: "Opportunities", mobileLabel: "Explore", path: "/creator/opportunities", icon: Megaphone },
  { label: "Offers", path: "/creator/offers", icon: Handshake, badge: "2" },
  { label: "Collaborations", mobileLabel: "Work", path: "/creator/collaborations", icon: PanelsTopLeft, badge: "1" },
  { label: "Profile", path: "/creator/profile", icon: UserRound },
];
