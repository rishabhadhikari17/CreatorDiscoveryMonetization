import { ArrowRight, Inbox, RotateCcw, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function DemoStateMessage({ tone = "empty", title, message, actionLabel, actionTo, onAction }) {
  const Icon = tone === "error" ? TriangleAlert : Inbox;
  return <section className={`demo-state-message demo-state-message--${tone}`}><span><Icon size={25} /></span><small>{tone === "error" ? "Something needs attention" : "Nothing here yet"}</small><h2>{title}</h2><p>{message}</p>{actionTo ? <Link className="button button--primary" to={actionTo}>{actionLabel}<ArrowRight size={15} /></Link> : onAction ? <button className="button button--primary" type="button" onClick={onAction}><RotateCcw size={15} />{actionLabel}</button> : null}</section>;
}
