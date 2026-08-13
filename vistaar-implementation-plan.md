# Vistaar — Implementation Plan
### AI-native creator monetization and brand discovery platform for regional (Tier 2/3) India

---

## 1. Product summary

Vistaar is an AI-native marketplace that solves one root problem: brands and regional creators have no shared, trustworthy signal of audience value. Every feature in this plan exists to build, expose, or protect that signal — the **Regional Engagement Score (RES)** — which powers discovery for brands and fair pricing for creators off the same number.

**Core thesis:** discovery and fair compensation are not two features. They are two views of one score.

---

## 2. Scope for this build

- **Market:** Multi-region, multi-language, multi-niche (Bihar/Bhojpuri, Maharashtra/Marathi, Tamil Nadu/Tamil, Punjab/Punjabi as launch cohorts)
- **Users designed in parallel:** Creator (Priya) and Brand (Rohan) personas, both blocked by the same missing trust signal
- **Product form:** Full two-sided marketplace (aggregator), not a single-sided tool
- **AI depth:** Product-level framing — scoring logic, discovery ranking, and calibration are designed as systems with defined inputs/outputs, not as ML architecture specs

---

## 3. System architecture

Four subsystems, one data flow:

```
Creator data ──► Regional calibration layer ──► Engagement Quality Score
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    ▼                                       ▼
                          Discovery ranking (brand)              Fair price band (creator)
                                    │                                       │
                                    └───────────────────┬───────────────────┘
                                                         ▼
                                          Transparent matching & deal
                                                         │
                                                         ▼
                                    Deal outcomes feed back into calibration layer
```

### 3.1 Regional Calibration Layer
Establishes the baseline "normal" for a given region/language/niche cohort, so a creator is never compared against a metro benchmark that doesn't apply to them. Inputs: platform mix per region (Instagram, YouTube, WhatsApp activity, Sharechat/Moj where relevant), language-specific comment behavior norms, historical deal-outcome data as it accumulates.

### 3.2 Engagement Quality Engine
Produces the RES from three weighted signals:
- **Cross-platform reach** — activity across the channels a creator's audience actually uses, not just Instagram
- **Comment authenticity** — vernacular-aware sentiment/bot-detection, tuned per language rather than one global spam model
- **Regional trust index** — repeat engagement, response depth, community-specific signals (tagging, local event mentions)

### 3.3 AI Discovery Search
Brand-facing. Structured filters (region, language, niche, audience size) combined with RES-based ranking, so results surface authentic regional reach first — not raw follower count.

### 3.4 Matching & Fair-Comp Workflow
The RES generates a benchmarked price band for each creator. When a brand makes an offer, both sides see it plotted against that band in real time — removing blind negotiation on either side.

---

## 4. Phased roadmap

### Phase 0 — Problem validation & design (complete)
- Problem narrowing (5 Whys), root-cause identification
- Personas (Priya/creator, Rohan/brand) and JTBD
- Market analysis: sizing, competitive landscape, fraud-rate benchmarking
- Architecture decision: Score-Backbone Marketplace
- Clickable prototype: Brand discovery, Creator profile, Deal room

### Phase 1 — MVP (single-region pilot)
**Goal:** Prove the RES produces rankings and price bands both sides trust, in one region/language cohort (e.g., Bihar/Bhojpuri).
- Manual-assisted scoring pipeline (rules + lightweight NLP, not fully automated ML) to validate signal design before investing in modeling
- Creator onboarding flow (Instagram/YouTube connect + WhatsApp Business where available)
- Brand-facing search with filters + ranked results (no bidding/RFP yet — direct outreach only)
- Deal room v1: static fair-band display, manual deal logging (no in-platform payment yet)
- **Exit criteria:** 50–100 onboarded creators in one cohort, 10+ completed brand deals, creator/brand satisfaction signal on "was this fair" collected directly

### Phase 2 — Multi-region expansion + automation
**Goal:** Generalize the calibration layer across cohorts and reduce manual scoring effort.
- Automate authenticity/fraud detection per language (starting with the 3–4 launch languages)
- Expand calibration layer to 4–5 region/language cohorts
- Add RFP-style campaign posting for brands (structured brief → AI shortlist)
- In-platform escrow/payment integration
- **Exit criteria:** Calibration holds up (no systematic score drift) across cohorts; deal completion rate and repeat-usage rate become primary health metrics

### Phase 3 — Scale & feedback loop maturity
**Goal:** Let completed deal outcomes actively improve the calibration layer, not just accumulate as logs.
- Feed deal outcomes (did the campaign actually convert locally) back into calibration weighting
- Expand niches and audience-characteristic filters beyond the pilot set
- Explore creator-side value-add (media kit auto-generation, negotiation guidance) as retention layers on top of the core score
- **Exit criteria:** Calibration layer measurably improves prediction accuracy quarter over quarter using real outcome data

---

## 5. Tech stack (high-level, product-framed)

| Layer | Approach |
|---|---|
| Data ingestion | Platform APIs (Instagram, YouTube) + WhatsApp Business integration where available; manual fallback for Phase 1 |
| Scoring engine | Rules-based + lightweight NLP for MVP; upgrade path to trained models per-language as data volume grows |
| Discovery search | Structured filtering + ranking service consuming RES output |
| Matching/deal workflow | Workflow engine tracking offer state against benchmarked band |
| Payments | Escrow-style hold-and-release, integrated in Phase 2 |
| Frontend | Brand-facing web dashboard; creator-facing lightweight web/WhatsApp-assisted flow to minimize onboarding friction |

This layer intentionally avoids prescribing specific ML architectures — the plan is designed so the scoring logic can start rules-based and evolve, without changing the product's core interaction model.

---

## 6. Success metrics

**Trust/quality metrics**
- % of creators flagged for low authenticity that brands independently agree with post-deal
- Score stability — how much a creator's RES fluctuates without real behavior change

**Two-sided health metrics**
- Deal completion rate (offers made → deals closed)
- % of deals closed within the suggested fair band (vs. below/above)
- Repeat usage rate, both sides

**Market validation metrics**
- Time-to-first-deal for a newly onboarded creator
- Brand cost-per-authentic-engagement vs. pre-Vistaar baseline (self-reported or estimated)

---

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Cold start — no creators, no brands | Launch single-cohort pilot (Phase 1) with manual-assisted onboarding to build initial liquidity before automating |
| Scoring model bias toward better-documented platforms (Instagram) over harder-to-track ones (WhatsApp) | Explicitly weight cross-platform reach as a first-class signal, not an afterthought; validate against manual local checks in Phase 1 |
| Creators distrust an opaque score | "Why this band" transparency panel (as shown in the deal-room prototype) is non-negotiable — every score must ship with a plain-language explanation |
| Regional calibration drifts as market changes | Feedback loop (Phase 3) ties calibration to real deal outcomes, not static assumptions |

---

## 8. Immediate next steps

1. Finalize the exact signal weights and data sources for the Phase 1 rules-based scoring pipeline
2. Select and confirm the Phase 1 pilot cohort (region + language + niche)
3. Define the manual-assisted onboarding process for the first 50–100 creators
4. Extend the prototype with a brand RFP-posting screen (Phase 2 preview) if needed for capstone presentation completeness
