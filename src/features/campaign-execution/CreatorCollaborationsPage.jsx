import {
  ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, FileCheck2,
  FileText, IndianRupee, Info, MessageSquareText, Send, ShieldCheck,
  Sparkles, TrendingUp, UploadCloud, Users, WalletCards,
} from "lucide-react";
import { useState } from "react";
import { DemoStateMessage } from "../../components/demo/DemoStateMessage.jsx";
import { formatMoney } from "../campaign-brief/campaignMatching.js";
import { useDealState } from "../deal-state/DealStateContext.js";
import "./CampaignExecution.css";

const statusCopy = {
  creating: { label: "Creating", detail: "Draft content is due next", step: 1 },
  in_review: { label: "Brand review", detail: "Rooted Foods is reviewing your draft", step: 2 },
  revision_requested: { label: "Revision requested", detail: "Review feedback and resubmit", step: 1 },
  approved: { label: "Approved", detail: "Waiting for brand delivery confirmation", step: 3 },
  delivered: { label: "Delivered", detail: "Payment release is pending", step: 4 },
  completed: { label: "Paid", detail: "Campaign lifecycle complete", step: 5 },
};

const workflowSteps = ["Contract", "Create", "Review", "Delivery", "Paid"];

function CampaignProgress({ status }) {
  const active = statusCopy[status].step;
  return <ol className="campaign-progress">{workflowSteps.map((step, index) => <li className={index < active ? "is-complete" : index === active ? "is-active" : ""} key={step}><span>{index < active ? <Check size={12} /> : index + 1}</span><strong>{step}</strong></li>)}</ol>;
}

function PerformanceSummary({ performance }) {
  if (!performance) return null;
  const metrics = [
    ["Views", performance.views.toLocaleString("en-IN")], ["Reach", performance.reach.toLocaleString("en-IN")],
    ["Engagement", `${performance.engagement}%`], ["Saves", performance.saves.toLocaleString("en-IN")],
    ["Shares", performance.shares.toLocaleString("en-IN")], ["Positive sentiment", `${performance.positiveSentiment}%`],
  ];
  return <section className="campaign-panel performance-panel"><header><div><span>Post-campaign report</span><h3>Performance snapshot</h3></div><TrendingUp size={20} /></header><div className="performance-grid">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><p><Sparkles size={14} />Demo results show strong regional relevance and save-led consideration.</p></section>;
}

export function CreatorCollaborationsPage() {
  const { campaigns, submitContent } = useDealState();
  const creatorCampaigns = campaigns.filter((campaign) => campaign.creatorId === "priya-kumari");
  const [selectedId, setSelectedId] = useState(creatorCampaigns[0]?.id);
  const campaign = creatorCampaigns.find((item) => item.id === selectedId) ?? creatorCampaigns[0];
  const [draftTitle, setDraftTitle] = useState("monsoon-millet-mornings-v1.mp4");
  const [submissionNote, setSubmissionNote] = useState("First cut with Bhojpuri voiceover, recipe close-ups, and the product reveal at 00:21.");

  const selectCampaign = (id) => {
    setSelectedId(id);
    const next = creatorCampaigns.find((item) => item.id === id);
    setDraftTitle(`${next.campaign.name.toLowerCase().replaceAll(" ", "-")}-v${next.reviewRound + 1}.mp4`);
    setSubmissionNote(next.revisionNote ? `Updated draft addressing the brand feedback: ${next.revisionNote}` : "First cut ready for brand review with final voiceover and product placement.");
  };

  const submitDraft = (event) => {
    event.preventDefault();
    const isRevision = campaign.status === "revision_requested";
    submitContent(campaign.id, { filename: draftTitle.trim(), note: submissionNote.trim(), submittedAt: "Just now", type: "Video · MP4", duration: "00:48" }, `${draftTitle.trim()} · Review round ${campaign.reviewRound + 1}`, isRevision);
  };

  if (!campaign) return <DemoStateMessage title="No collaborations yet." message="Accepted offers will appear here with contract, delivery, and simulated payment tracking." actionLabel="Review offers" actionTo="/creator/offers" />;

  return (
    <main className="campaign-execution-page">
      <header className="campaign-execution-hero">
        <div><p className="eyebrow">Campaign execution</p><h2>From signed scope<br /><em>to paid collaboration.</em></h2><p>Submit work, follow review decisions, and see every simulated payment milestone.</p></div>
        <dl><div><dt>Active collaborations</dt><dd>{creatorCampaigns.filter((item) => item.status !== "completed").length}</dd></div><div><dt>Secured in demo escrow</dt><dd>{formatMoney(creatorCampaigns.reduce((sum, item) => sum + item.payment.secured - item.payment.released, 0))}</dd></div><div><dt>Completed</dt><dd>{creatorCampaigns.filter((item) => item.status === "completed").length}</dd></div></dl>
      </header>

      <div className="campaign-execution-layout">
        <aside className="campaign-list-card">
          <header><div><span>My work</span><h3>Collaborations</h3></div><small>{creatorCampaigns.length}</small></header>
          <div>{creatorCampaigns.map((item) => <button className={item.id === campaign.id ? "is-selected" : ""} type="button" onClick={() => selectCampaign(item.id)} key={item.id}><span className="campaign-brand-mark">{item.brand.initials}</span><span><small>{statusCopy[item.status].label}</small><strong>{item.brand.name}</strong><em>{item.campaign.name}</em></span><strong>{formatMoney(item.amount)}</strong></button>)}</div>
          <p className="campaign-demo-note"><Info size={14} /><span><strong>Prototype workflow</strong>No real contract, upload, escrow, or payment is created.</span></p>
        </aside>

        <div className="campaign-workspace">
          <section className="campaign-title-card"><div className="campaign-brand-mark campaign-brand-mark--large">{campaign.brand.initials}</div><div><span>{statusCopy[campaign.status].label}</span><h3>{campaign.campaign.name}</h3><p>{campaign.brand.name} · {campaign.contract.reference}</p></div><div className={`campaign-status-badge campaign-status-badge--${campaign.status}`}><i />{statusCopy[campaign.status].detail}</div></section>
          <CampaignProgress status={campaign.status} />

          <section className="campaign-panel contract-panel">
            <header><div><span>Agreement</span><h3>Contract summary</h3></div><FileCheck2 size={20} /></header>
            <p>{campaign.campaign.objective}</p>
            <div className="contract-summary-grid"><div><FileText size={15} /><span>Deliverables<strong>{campaign.contract.scope.join(" + ")}</strong></span></div><div><ShieldCheck size={15} /><span>Usage rights<strong>{campaign.contract.usageRights}</strong></span></div><div><CalendarDays size={15} /><span>First cut / publish<strong>{campaign.contract.firstCut} · {campaign.contract.publishBy}</strong></span></div><div><IndianRupee size={15} /><span>Agreed compensation<strong>{formatMoney(campaign.amount)}</strong></span></div></div>
          </section>

          {(campaign.status === "creating" || campaign.status === "revision_requested") && <form className="campaign-panel content-submission-panel" onSubmit={submitDraft}>
            <header><div><span>{campaign.status === "revision_requested" ? "Revision round" : "Content submission"}</span><h3>{campaign.status === "revision_requested" ? "Address the feedback and resubmit." : "Share a demo draft for review."}</h3></div><UploadCloud size={21} /></header>
            {campaign.status === "revision_requested" && <div className="revision-feedback"><MessageSquareText size={17} /><div><strong>Brand feedback</strong><p>{campaign.revisionNote}</p></div></div>}
            <div className="demo-upload-zone"><UploadCloud size={25} /><div><strong>Demo content placeholder</strong><p>Enter a filename to simulate attaching a draft. No file leaves your device.</p></div><span>MP4 · MOV · link</span></div>
            <div className="submission-fields"><label><span>Draft filename</span><input required value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} /></label><label><span>Note for the brand</span><textarea rows="4" required minLength="10" value={submissionNote} onChange={(event) => setSubmissionNote(event.target.value)} /></label></div>
            <footer><small><ShieldCheck size={13} />Submission is stored only in this LocalStorage demo.</small><button className="button button--primary" type="submit" disabled={!draftTitle.trim() || submissionNote.trim().length < 10}><Send size={15} />{campaign.status === "revision_requested" ? "Submit revised draft" : "Submit for review"}</button></footer>
          </form>}

          {campaign.status === "in_review" && <section className="campaign-state-card campaign-state-card--review"><Clock3 size={23} /><div><span>Brand review</span><h3>Your draft is with Rooted Foods.</h3><p>{campaign.content.filename} · Review round {campaign.reviewRound}. You’ll see approval or revision feedback here.</p></div></section>}
          {campaign.status === "approved" && <section className="campaign-state-card campaign-state-card--approved"><CheckCircle2 size={23} /><div><span>Content approved</span><h3>Your creative is cleared.</h3><p>Rooted Foods will confirm delivery after the campaign content is published.</p></div></section>}
          {campaign.status === "delivered" && <section className="campaign-state-card campaign-state-card--delivered"><WalletCards size={23} /><div><span>Delivery confirmed</span><h3>Demo payment release is pending.</h3><p>The brand has verified delivery. No real funds move in this prototype.</p></div></section>}
          {campaign.status === "completed" && <section className="campaign-state-card campaign-state-card--completed"><CheckCircle2 size={23} /><div><span>Campaign paid</span><h3>{formatMoney(campaign.payment.released)} released in the demo.</h3><p>The complete collaboration record and results are now available.</p></div></section>}

          <PerformanceSummary performance={campaign.performance} />

          <section className="campaign-panel campaign-activity-panel"><header><div><span>Shared record</span><h3>Execution timeline</h3></div><Clock3 size={20} /></header><ol>{campaign.activity.map((item, index) => <li key={`${item.title}-${index}`}><span className={`campaign-actor campaign-actor--${item.actor}`}>{item.actor === "creator" ? <Users size={13} /> : item.actor === "brand" ? <MessageSquareText size={13} /> : <Sparkles size={13} />}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time} · {item.actor}</small></div></li>)}</ol></section>
        </div>

        <aside className="campaign-side-stack">
          <section className="campaign-side-card payment-tracker"><div className="campaign-side-eyebrow"><WalletCards size={15} />Payment tracking</div><span>Campaign value</span><h3>{formatMoney(campaign.amount)}</h3><div className="payment-state"><i className={`payment-state__dot payment-state__dot--${campaign.payment.status}`} /><span><strong>{campaign.payment.status === "released" ? "Demo payment released" : campaign.payment.status === "release_pending" ? "Release pending" : "Secured in demo escrow"}</strong>{campaign.payment.reference}</span></div><div className="payment-progress"><span style={{ width: campaign.payment.status === "released" ? "100%" : campaign.payment.status === "release_pending" ? "78%" : "50%" }} /></div><dl><div><dt>Secured</dt><dd>{formatMoney(campaign.payment.secured)}</dd></div><div><dt>Released</dt><dd>{formatMoney(campaign.payment.released)}</dd></div></dl><p><Info size={12} />Simulated state only. No payment provider is connected.</p></section>
          <section className="campaign-side-card deadline-card"><div className="campaign-side-eyebrow"><CalendarDays size={15} />Timeline</div><div><span>First cut</span><strong>{campaign.contract.firstCut}</strong></div><ArrowRight size={14} /><div><span>Publish by</span><strong>{campaign.contract.publishBy}</strong></div></section>
          {campaign.rating && <section className="campaign-side-card creator-feedback-card"><div className="campaign-side-eyebrow"><Sparkles size={15} />Brand feedback</div><div className="rating-stars">{"★★★★★".slice(0, campaign.rating)}<span>{"★★★★★".slice(campaign.rating)}</span></div><blockquote>“{campaign.feedback}”</blockquote></section>}
        </aside>
      </div>
    </main>
  );
}
