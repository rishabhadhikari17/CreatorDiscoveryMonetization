import "./Card.css";

export function Card({ children, className = "", tone = "light" }) {
  return <article className={`card card--${tone} ${className}`.trim()}>{children}</article>;
}
