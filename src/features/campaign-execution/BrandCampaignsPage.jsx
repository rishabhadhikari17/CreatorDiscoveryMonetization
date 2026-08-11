import {
  BarChart3, CalendarDays, Check, CheckCircle2, Clock3, FileCheck2, FileText,
  IndianRupee, Info, MessageSquareText, Play, Send, ShieldCheck, Sparkles,
  Star, TrendingUp, Users, WalletCards,
} from "lucide-react";
import { useState } from "react";
import { useDemoExperience } from "../../components/demo/DemoExperienceContext.js";
import { DemoStateMessage } from "../../components/demo/DemoStateMessage.jsx";
import { formatMoney } from "../campaign-brief/campaignMatching.js";
import { useDealState } from "../deal-state/DealStateContext.js";
import "./CampaignExecution.css";

const statusCopy = {
  creating: { label: "Creator producing", step: 1 }, in_review: { label: "Review required", step: 2 },
  revision_requested: { label: "Revision in progress", step: 1 }, approved: { label: "Approved", step: 3 },
  delivered: { label: "Release payment", step: 4 }, completed: { label: "Completed", step: 5 },
};
const steps = ["Contract", "Create", "Review", "Delivery", "Paid"];

function BrandProgress({ status }) {
  const active = statusCopy[status].step;
  return <ol className="campaign-progress">{steps.map((step, index) => <li className={index < active ? "is-complete" : index === active ? "is-active" : ""} key={step}><span>{index < active ? <Check size={12} /> : index + 1}</span><strong>{step}</strong></li>)}</ol>;
}

export function BrandCampaignsPage() {
  const { requestConfirmation } = useDemoExperience();
  const { campaigns, requestRevision, approveContent, confirmDelivery, releasePayment, rateCreator } = useDealState();
  const brandCampaigns = campaigns.filter((campaign) => campaign.brand.name === "Rooted Foods");
  const [selectedId, setSelectedId] = useState(brandCampaigns[0]?.id);
  const campaign = brandCampaigns.find((item) => item.id === selectedId) ?? brandCampaigns[0];
  const [reviewAction, setReviewAction] = useState(null);
  const [revisionNote, setRevisionNote] = useState("Please hold the product pack for two more seconds and add the millet benefit text in the final frame.");
  const [rating, setRating] = useState(campaign?.rating ?? 5);
  const [feedback, setFeedback] = useState(campaign?.feedback || "Priya delivered a culturally fluent story, responded quickly to feedback, and exceeded the engagement benchmark.");

  const selectCampaign = (id) => {
    setSelectedId(id);
    setReviewAction(null);
    const next = brandCampaigns.find((item) => item.id === id);
    setRating(next.rating ?? 5);
    setFeedback(next.feedback || "Strong regional storytelling, reliable communication, and thoughtful execution.");
  };

  const submitRevision = () => {
    requestRevision(campaign.id, revisionNote.trim());
    setReviewAction(null);
  };
  const confirmCampaignDelivery = () => requestConfirmation({ title: "Confirm all deliverables?", message: "This marks the published content as verified and makes the simulated payment ready for release.", confirmLabel: "Confirm delivery", tone: "success", onConfirm: () => confirmDelivery(campaign.id) });
  const confirmPaymentRelease = () => requestConfirmation({ title: `Release ${formatMoney(campaign.amount)} in the demo?`, message: "This is a frontend simulation. It completes the campaign and reveals the performance report; no real money moves.", confirmLabel: "Release demo payment", tone: "success", onConfirm: () => releasePayment(campaign.id, `${formatMoney(campaign.amount)} released to Priya · simulated payment`) });

  if (!campaign) return <DemoStateMessage title="No active campaigns yet." message="Accept a creator offer to create a connected campaign execution workspace." actionLabel="Review deals" actionTo="/brand/deals" />;

  return (
    <main className="campaign-execution-page campaign-execution-page--brand">
      <header className="campaign-execution-hero">
        <div><p className="eyebrow">Campaign operations</p><h2>Track every handoff.<br /><em>Close the loop clearly.</em></h2><p>Review delivery, simulate payment milestones, and capture campaign outcomes in one shared record.</p></div>
        <dl><div><dt>Active campaigns</dt><dd>{brandCampaigns.filter((item) => item.status !== "completed").length}</dd></div><div><dt>Awaiting action</dt><dd>{brandCampaigns.filter((item) => ["in_review", "delivered"].includes(item.status)).length}</dd></div><div><dt>Demo escrow secured</dt><dd>{formatMoney(brandCampaigns.reduce((sum, item) => sum + item.payment.secured - item.payment.released, 0))}</dd></div></dl>
      </header>

      <div className="campaign-execution-layout">
        <aside className="campaign-list-card"><header><div><span>Portfolio</span><h3>Campaigns</h3></div><small>{brandCampaigns.length}</small></header><div>{brandCampaigns.map((item) => <button className={item.id === campaign.id ? "is-selected" : ""} type="button" onClick={() => selectCampaign(item.id)} key={item.id}><span className="campaign-brand-mark creator-mark">PK</span><span><small>{statusCopy[item.status].label}</small><strong>{item.creatorName}</strong><em>{item.campaign.name}</em></span><strong>{formatMoney(item.amount)}</strong></button>)}</div><p className="campaign-demo-note"><Info size={14} /><span><strong>Simulation only</strong>Contracts, escrow, uploads, and payments are frontend demo states.</span></p></aside>

        <div className="campaign-workspace">
          <section className="campaign-title-card"><div className="campaign-brand-mark campaign-brand-mark--large creator-mark">PK</div><div><span>{statusCopy[campaign.status].label}</span><h3>{campaign.campaign.name}</h3><p>{campaign.creatorName} · {campaign.contract.reference}</p></div><div className={`campaign-status-badge campaign-status-badge--${campaign.status}`}><i />{campaign.status === "in_review" ? "Action needed" : campaign.status === "delivered" ? "Payment action" : "Shared state updated"}</div></section>
          <BrandProgress status={campaign.status} />

          <section className="campaign-panel contract-panel"><header><div><span>Signed terms</span><h3>Contract summary</h3></div><FileCheck2 size={20} /></header><p>{campaign.campaign.objective}</p><div className="contract-summary-grid"><div><FileText size={15} /><span>Deliverables<strong>{campaign.contract.scope.join(" + ")}</strong></span></div><div><ShieldCheck size={15} /><span>Usage / exclusivity<strong>{campaign.contract.usageRights} · {campaign.contract.exclusivity}</strong></span></div><div><CalendarDays size={15} /><span>First cut / publish<strong>{campaign.contract.firstCut} · {campaign.contract.publishBy}</strong></span></div><div><IndianRupee size={15} /><span>Contract value<strong>{formatMoney(campaign.amount)}</strong></span></div></div></section>

          {campaign.status === "creating" && <section className="campaign-state-card campaign-state-card--review"><Clock3 size={23} /><div><span>Creator producing</span><h3>Waiting for Priya’s first cut.</h3><p>The content-submission placeholder is open in the creator workspace.</p></div></section>}

          {campaign.status === "in_review" && <section className="campaign-panel brand-review-panel"><header><div><span>Review round {campaign.reviewRound}</span><h3>Review the submitted content.</h3></div><MessageSquareText size={20} /></header><div className="content-preview"><div><Play size={30} /><span>Demo preview</span></div><section><small>{campaign.content.type} · {campaign.content.duration}</small><h4>{campaign.content.filename}</h4><p>{campaign.content.note}</p><dl><div><dt>Submitted</dt><dd>{campaign.content.submittedAt}</dd></div><div><dt>Review round</dt><dd>{campaign.reviewRound}</dd></div></dl></section></div>{reviewAction === "revision" ? <div className="revision-request-form"><label><span>Revision feedback</span><textarea rows="4" minLength="10" value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} /></label><div><button type="button" onClick={() => setReviewAction(null)}>Cancel</button><button type="button" disabled={revisionNote.trim().length < 10} onClick={submitRevision}><Send size={14} />Send revision request</button></div></div> : <footer><button className="button button--outline" type="button" onClick={() => setReviewAction("revision")}><MessageSquareText size={15} />Request revision</button><button className="button button--primary" type="button" onClick={() => approveContent(campaign.id)}><Check size={15} />Approve content</button></footer>}</section>}

          {campaign.status === "revision_requested" && <section className="campaign-state-card campaign-state-card--review"><Clock3 size={23} /><div><span>Revision requested</span><h3>Priya is updating the draft.</h3><p>Feedback sent: “{campaign.revisionNote}”</p></div></section>}
          {campaign.status === "approved" && <section className="campaign-state-card campaign-state-card--approved"><CheckCircle2 size={23} /><div><span>Content approved</span><h3>Confirm delivery after publishing.</h3><p>This records that all contracted deliverables are live and verified.</p></div><button className="button button--primary" type="button" onClick={confirmCampaignDelivery}><FileCheck2 size={15} />Confirm delivery</button></section>}
          {campaign.status === "delivered" && <section className="campaign-state-card campaign-state-card--delivered"><WalletCards size={23} /><div><span>Delivery verified</span><h3>Release the simulated payment.</h3><p>{formatMoney(campaign.amount)} is marked secured. This changes demo state only.</p></div><button className="button button--primary" type="button" onClick={confirmPaymentRelease}><IndianRupee size={15} />Release demo payment</button></section>}
          {campaign.status === "completed" && <section className="campaign-state-card campaign-state-card--completed"><CheckCircle2 size={23} /><div><span>Lifecycle complete</span><h3>Delivery and payment are recorded.</h3><p>{formatMoney(campaign.payment.released)} released in the simulated payment tracker.</p></div></section>}

          {campaign.performance && <section className="campaign-panel performance-panel"><header><div><span>Post-campaign report</span><h3>Performance summary</h3></div><TrendingUp size={20} /></header><div className="performance-grid"><div><span>Views</span><strong>{campaign.performance.views.toLocaleString("en-IN")}</strong></div><div><span>Reach</span><strong>{campaign.performance.reach.toLocaleString("en-IN")}</strong></div><div><span>Engagement</span><strong>{campaign.performance.engagement}%</strong></div><div><span>Saves</span><strong>{campaign.performance.saves.toLocaleString("en-IN")}</strong></div><div><span>Shares</span><strong>{campaign.performance.shares.toLocaleString("en-IN")}</strong></div><div><span>Positive sentiment</span><strong>{campaign.performance.positiveSentiment}%</strong></div></div></section>}

          {campaign.status === "completed" && <section className="campaign-panel creator-rating-panel"><header><div><span>Collaboration feedback</span><h3>Rate the creator experience.</h3></div><Star size={20} /></header><div className="rating-input" aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((value) => <button className={value <= rating ? "is-active" : ""} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} key={value}><Star size={22} fill={value <= rating ? "currentColor" : "none"} /></button>)}</div><label><span>Feedback for Priya</span><textarea rows="4" minLength="10" value={feedback} onChange={(event) => setFeedback(event.target.value)} /></label><footer><small>{campaign.rating ? `Saved rating: ${campaign.rating}/5` : "Feedback will appear in the creator workspace."}</small><button className="button button--primary" type="button" disabled={feedback.trim().length < 10} onClick={() => rateCreator(campaign.id, rating, feedback.trim())}><Send size={15} />{campaign.rating ? "Update feedback" : "Save rating"}</button></footer></section>}

          <section className="campaign-panel campaign-activity-panel"><header><div><span>Shared record</span><h3>Execution timeline</h3></div><Clock3 size={20} /></header><ol>{campaign.activity.map((item, index) => <li key={`${item.title}-${index}`}><span className={`campaign-actor campaign-actor--${item.actor}`}>{item.actor === "creator" ? <Users size={13} /> : item.actor === "brand" ? <MessageSquareText size={13} /> : <Sparkles size={13} />}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time} · {item.actor}</small></div></li>)}</ol></section>
        </div>

        <aside className="campaign-side-stack"><section className="campaign-side-card payment-tracker"><div className="campaign-side-eyebrow"><WalletCards size={15} />Escrow simulation</div><span>Contract value</span><h3>{formatMoney(campaign.amount)}</h3><div className="payment-state"><i className={`payment-state__dot payment-state__dot--${campaign.payment.status}`} /><span><strong>{campaign.payment.status === "released" ? "Released" : campaign.payment.status === "release_pending" ? "Ready to release" : "Demo funds secured"}</strong>{campaign.payment.reference}</span></div><div className="payment-progress"><span style={{ width: campaign.payment.status === "released" ? "100%" : campaign.payment.status === "release_pending" ? "78%" : "50%" }} /></div><dl><div><dt>Secured</dt><dd>{formatMoney(campaign.payment.secured)}</dd></div><div><dt>Released</dt><dd>{formatMoney(campaign.payment.released)}</dd></div></dl><p><Info size={12} />No real payment provider or escrow service is connected.</p></section><section className="campaign-side-card deadline-card"><div className="campaign-side-eyebrow"><CalendarDays size={15} />Delivery dates</div><div><span>First cut</span><strong>{campaign.contract.firstCut}</strong></div><div><span>Publish by</span><strong>{campaign.contract.publishBy}</strong></div></section><section className="campaign-side-card health-card"><div className="campaign-side-eyebrow"><BarChart3 size={15} />Campaign health</div><strong>{campaign.status === "completed" ? "Complete" : ["in_review", "delivered"].includes(campaign.status) ? "Action needed" : "On track"}</strong><p>All actions are reflected in the creator workspace and shared timeline.</p></section></aside>
      </div>
    </main>
  );
}
