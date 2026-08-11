import { Component } from "react";
import { TriangleAlert } from "lucide-react";
import { DEAL_STORAGE_KEY } from "../../features/deal-state/dealState.js";

export class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  resetDemo = () => {
    window.localStorage.removeItem(DEAL_STORAGE_KEY);
    window.location.assign("/brand");
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="demo-error-page"><span><TriangleAlert size={30} /></span><p className="eyebrow">Demo recovery</p><h1>The workspace hit an unexpected state.</h1><p>Your prototype data may be out of date. Reset the guided dataset to continue safely.</p><div><button className="button button--primary" type="button" onClick={this.resetDemo}>Reset demo data</button><button className="button button--outline" type="button" onClick={() => window.location.reload()}>Try again</button></div></main>;
  }
}
