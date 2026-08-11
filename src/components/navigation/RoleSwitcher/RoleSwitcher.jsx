import { RotateCcw } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDemoExperience } from "../../demo/DemoExperienceContext.js";
import { useDealState } from "../../../features/deal-state/DealStateContext.js";
import "./RoleSwitcher.css";

export function RoleSwitcher() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { resetDeals } = useDealState();
  const { requestConfirmation, notify } = useDemoExperience();
  const isRolePage = pathname === "/brand" || pathname === "/creator";
  const isWorkspace = pathname.startsWith("/brand") || pathname.startsWith("/creator");

  return (
    <nav
      className={`role-switcher${isRolePage ? " role-switcher--prominent" : ""}${isWorkspace ? " role-switcher--workspace" : ""}`}
      aria-label="Switch demo role"
    >
      <span className="role-switcher__label">Demo as</span>
      <div className="role-switcher__options">
        <NavLink className={({ isActive }) => isActive ? "is-active" : ""} to="/brand">
          Brand
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? "is-active" : ""} to="/creator">
          Creator
        </NavLink>
      </div>
      {isWorkspace && <button className="role-switcher__reset" type="button" onClick={() => requestConfirmation({ title: "Reset the guided demo?", message: "This restores Priya, Rooted Foods, both offers, and the active campaign to their original states.", confirmLabel: "Reset everything", tone: "default", onConfirm: () => { resetDeals(); navigate("/brand"); notify({ title: "Demo restored", message: "The original guided dataset is ready from the brand dashboard." }); } })} title="Reset connected deal demo"><RotateCcw size={14} /><span>Reset demo</span></button>}
    </nav>
  );
}
