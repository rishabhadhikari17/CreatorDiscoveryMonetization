import { Handshake, LayoutDashboard, PanelsTopLeft, UserRound } from "lucide-react";

export const creatorNavigation = [
  { label: "Dashboard", path: "/creator", icon: LayoutDashboard, end: true },
  { label: "Offers", path: "/creator/offers", icon: Handshake, badge: "2" },
  { label: "Collaborations", path: "/creator/collaborations", icon: PanelsTopLeft, badge: "1" },
  { label: "Profile", path: "/creator/profile", icon: UserRound },
];
