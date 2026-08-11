import "./Badge.css";

export function Badge({ children, tone = "olive" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
