import { Link } from "react-router-dom";
import "./Wordmark.css";

export function Wordmark({ inverted = false, to = "/" }) {
  return (
    <Link
      className={`brand-wordmark${inverted ? " brand-wordmark--inverted" : ""}`}
      to={to}
      aria-label="GlobalGalli home"
    >
      <span className="brand-wordmark__mark" aria-hidden="true">V</span>
      <span className="brand-wordmark__name">GlobalGalli</span>
      <span className="brand-wordmark__note">working name</span>
    </Link>
  );
}
