import { Check, CheckCircle2, ChevronRight, CircleHelp, Info, LoaderCircle, Map, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDealState } from "../../features/deal-state/DealStateContext.js";
import { useDemoExperience } from "./DemoExperienceContext.js";
import "./DemoExperience.css";

const guideSteps = [
  { label: "Open brand workspace", copy: "Review the regional-first dashboard.", path: "/brand", match: (path) => path === "/brand" },
  { label: "Discover regional creators", copy: "Try the guided Bhojpuri search.", path: "/brand/discover", match: (path) => path === "/brand/discover" },
  { label: "Inspect Priya’s audience", copy: "Open transparent quality evidence.", path: "/brand/creators/priya-kumari", match: (path) => path.includes("/brand/creators/") },
  { label: "Build the campaign brief", copy: "Review fit and budget logic.", path: "/brand/shortlist", match: (path) => path === "/brand/shortlist" },
  { label: "Send a below-band offer", copy: "Use the connected deal room.", path: "/brand/deals", match: (path) => path === "/brand/deals" },
  { label: "Counter as Priya", copy: "Switch roles and negotiate with evidence.", path: "/creator/offers", match: (path) => path === "/creator/offers" },
  { label: "Accept the counter", copy: "Return to the brand deal room.", path: "/brand/deals", match: () => false },
  { label: "Track campaign delivery", copy: "Review content and payment states.", path: "/brand/campaigns", match: (path) => path === "/brand/campaigns" },
  { label: "View the creator record", copy: "See the same campaign from Priya’s side.", path: "/creator/collaborations", match: (path) => path === "/creator/collaborations" },
];

function routeRank(pathname, primaryDeal) {
  if (pathname === "/creator/collaborations") return 8;
  if (pathname === "/brand/campaigns") return 7;
  if (pathname === "/brand/deals" && ["countered", "accepted"].includes(primaryDeal?.dealStatus)) return 6;
  if (pathname === "/creator/offers") return 5;
  if (pathname === "/brand/deals") return 4;
  if (pathname === "/brand/shortlist") return 3;
  if (pathname.includes("/brand/creators/")) return 2;
  if (pathname === "/brand/discover") return 1;
  return 0;
}

function RouteSkeleton() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 260);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return <div className="route-skeleton" aria-label="Loading workspace" role="status"><div className="route-skeleton__bar" /><div className="route-skeleton__content"><span /><span /><div><i /><i /><i /></div></div></div>;
}

export function DemoExperienceChrome() {
  const { pathname } = useLocation();
  const { deals } = useDealState();
  const { toasts, confirmation, dismissToast, closeConfirmation, confirmAction } = useDemoExperience();
  const [guideOpen, setGuideOpen] = useState(false);
  const isWorkspace = pathname.startsWith("/brand") || pathname.startsWith("/creator");
  const primaryDeal = deals.find((deal) => deal.id === "rooted-foods-bihar");
  const activeRank = routeRank(pathname, primaryDeal);

  return <>
    <RouteSkeleton key={pathname} />
    {isWorkspace && <button className="demo-guide-trigger" type="button" onClick={() => setGuideOpen(true)}><Map size={15} /><span>Demo guide</span><small>{activeRank + 1}/9</small></button>}
    {guideOpen && <div className="demo-guide-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGuideOpen(false); }}><aside className="demo-guide" role="dialog" aria-modal="true" aria-labelledby="demo-guide-title"><header><div><span>Guided dataset</span><h2 id="demo-guide-title">Vistaar demo flow</h2><p>Follow one connected story from discovery to payment.</p></div><button type="button" onClick={() => setGuideOpen(false)} aria-label="Close demo guide"><X size={18} /></button></header><div className="demo-guide__progress"><span style={{ width: `${((activeRank + 1) / guideSteps.length) * 100}%` }} /></div><ol>{guideSteps.map((step, index) => { const current = step.match(pathname) || index === activeRank; const complete = index < activeRank; return <li className={`${current ? "is-current" : ""}${complete ? " is-complete" : ""}`} key={`${step.label}-${index}`}><span>{complete ? <Check size={13} /> : index + 1}</span><div><strong>{step.label}</strong><p>{step.copy}</p></div><Link to={step.path} onClick={() => setGuideOpen(false)} aria-label={`Go to ${step.label}`}><ChevronRight size={15} /></Link></li>; })}</ol><footer><Info size={14} /><p>Use <strong>Reset demo</strong> at any time to restore Priya, Rooted Foods, the two offers, and the active campaign.</p></footer></aside></div>}
    <div className="toast-region" role="status" aria-live="polite">{toasts.map((toast) => <article className={`demo-toast demo-toast--${toast.tone}`} key={toast.id}><span>{toast.tone === "success" ? <CheckCircle2 size={18} /> : <CircleHelp size={18} />}</span><div><strong>{toast.title}</strong><p>{toast.message}</p></div><button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification"><X size={15} /></button></article>)}</div>
    {confirmation && <div className="demo-confirm-backdrop" role="presentation"><section className={`demo-confirm demo-confirm--${confirmation.tone ?? "default"}`} role="alertdialog" aria-modal="true" aria-labelledby="demo-confirm-title"><span><LoaderCircle size={22} /></span><div><small>Confirm action</small><h2 id="demo-confirm-title">{confirmation.title}</h2><p>{confirmation.message}</p></div><footer><button type="button" onClick={closeConfirmation}>{confirmation.cancelLabel ?? "Cancel"}</button><button type="button" onClick={confirmAction}>{confirmation.confirmLabel ?? "Confirm"}</button></footer></section></div>}
  </>;
}
