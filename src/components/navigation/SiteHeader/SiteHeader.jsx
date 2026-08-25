import { Link } from "react-router-dom";
import { Wordmark } from "../Wordmark/Wordmark";
import "./SiteHeader.css";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-shell site-header__inner">
        <Wordmark />
        <nav className="site-header__links" aria-label="Primary navigation">
          <a href="#brands">For brands</a>
          <a href="#creators">For creators</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="site-header__actions">
          <Link className="site-header__demo" to="/brand">
            Open demo <span aria-hidden="true">→</span>
          </Link>
          <Link className="site-header__join" to="/onboarding">
            Join GlobalGalli
          </Link>
        </div>
      </div>
    </header>
  );
}
