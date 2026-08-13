# Frontend Build Steps

Vaani and Vistaar refer to the same product in this plan. The final product name will be decided later.

The current phase focuses on building a polished, frontend-first React application with realistic mock data and connected user flows. Sign-in and sign-up, backend services, AI integrations, live creator-platform data, and real payments are outside the current scope.

## 1. React foundation and design system

- Set up the application with React and Vite.
- Add React Router for page navigation.
- Establish shared colors, typography, spacing, breakpoints, and design tokens.
- Create reusable buttons, cards, badges, filters, form controls, modals, and empty states.
- Establish responsive desktop and mobile layouts.
- Create a central mock-data and service layer that can later be replaced by APIs.

**Demo result:** A polished visual foundation with reusable components.

## 2. Landing page and demo role selection

- Present the product positioning and primary value proposition.
- Add “Explore as Brand” and “Explore as Creator” actions.
- Allow users to enter either dashboard directly without authentication.
- Add a persistent role switcher for demonstrations.
- Do not create sign-in or sign-up screens in this phase.

**Demo result:** Anyone can immediately explore both sides of the marketplace.

## 3. Brand application shell

- Create the brand sidebar and top navigation.
- Add navigation for Dashboard, Discover, Shortlist, Campaigns, and Deals.
- Add brand-profile and notification placeholders.
- Create a responsive mobile-navigation experience.

**Demo result:** A complete brand-side product structure.

## 4. Brand overview dashboard

- Show active campaign summaries.
- Show the number of shortlisted creators.
- Surface pending offers and active deals.
- Recommend relevant regional creators.
- Display recent campaign activity.
- Add a quick action for discovering creators.

**Demo result:** Brands can understand their marketplace activity at a glance.

## 5. Creator discovery

- Search by creator name or campaign requirement.
- Filter by language, state, district, niche, audience size, quality score, and budget.
- Show editable and removable filter chips.
- Rank results by match quality.
- Display creator result cards with essential audience and pricing information.
- Support loading, empty, and filtered-result states.
- Explicitly disable price-to-quality sorting.
- Use deterministic frontend parsing for natural-language-style searches instead of AI.

**Demo result:** A brand can find relevant regional creators without relying on follower count.

## 6. Creator profile and audience intelligence

- Show the creator overview, location, language, and content niche.
- Display regional audience distribution.
- Display language and demographic breakdowns.
- Show the engagement-quality score.
- Explain the score through a five-component breakdown.
- Provide supporting evidence for each component.
- Display score confidence and the number of comparable creators.
- Show the creator’s fair-rate band.
- Show previous collaboration history.
- Add an action to save the creator to a shortlist.

**Demo result:** Brands can understand why a creator is valuable and trustworthy.

## 7. Shortlist and campaign brief

- Create a campaign brief with objective, target region, language, niche, and budget.
- Allow brands to select deliverables and a campaign timeline.
- Add and remove shortlisted creators.
- Show each creator’s fit with the campaign.
- Display a campaign budget summary.
- Calculate matching with a transparent frontend formula using quality, location, relevance, availability, and budget fit.

**Demo result:** Brands can convert discovery results into an actionable campaign shortlist.

## 8. Offer creation and deal room

- Select campaign deliverables and usage rights.
- Allow the brand to enter an offer amount.
- Compare the offer with the creator’s fair-rate band.
- Show below-band, within-band, and above-band indicators.
- Explain the pricing comparison and offer rationale.
- Allow brands to send, edit, or withdraw an offer.
- Display the current stage of the deal.

**Demo result:** The platform makes compensation transparent before an offer is submitted.

## 9. Creator application shell and dashboard

- Create the creator-side navigation.
- Display the creator’s quality score and fair-rate band.
- Surface key audience insights.
- Show current offers and active collaborations.
- Display an earnings and payment summary.
- Show practical suggestions for improving profile completeness and creator value.

**Demo result:** Creators can clearly see their audience value and commercial activity.

## 10. Creator offer workflow

- Show incoming offer details.
- Display brand and campaign information.
- Present deliverables, deadlines, and usage rights.
- Compare the offer with the creator’s fair-rate band.
- Allow the creator to accept, counter, or decline.
- Add a counter-offer amount and message.
- Show the negotiation history.
- Use transparent rules for suggested counter amounts instead of AI.

**Demo result:** Creators can negotiate with evidence instead of guesswork.

## 11. Connected two-sided deal state

Actions completed by one role must appear for the other role:

```text
Brand sends offer
        ↓
Creator receives offer
        ↓
Creator accepts or counters
        ↓
Brand reviews response
        ↓
Both see the updated deal
```

- Maintain shared application state across the brand and creator experiences.
- Persist demo state in LocalStorage.
- Implement valid deal-status transitions.
- Maintain a shared activity timeline.
- Add an option to reset the application to its original demo state.

**Demo result:** The prototype feels like one connected marketplace rather than separate mock screens.

## 12. Campaign execution and payment tracking

- Show a contract summary.
- Add a content-submission placeholder.
- Track review and revision status.
- Allow delivery confirmation.
- Simulate escrow and payment states.
- Show a post-campaign performance summary.
- Add creator rating and feedback UI.
- Do not integrate real payments or contract services in this phase.

**Demo result:** The complete lifecycle can be demonstrated from discovery through payment.

## 13. Final demo polish

- Complete the responsive-design pass.
- Add skeleton loaders.
- Add toast notifications and confirmation dialogs.
- Complete error and empty states.
- Add restrained micro-interactions.
- Ensure sample content is realistic and consistent.
- Prepare a guided demo dataset.
- Provide a one-click reset to the original demo state.

## Recommended demo flow

```text
Landing page
→ Explore as Brand
→ Discover creators
→ Open creator profile
→ Add creator to a campaign
→ Send a below-band offer
→ Switch to Creator
→ Review and counter the offer
→ Switch to Brand
→ Accept the counter
→ Track campaign delivery and payment
```

## Deferred from the current phase

- Sign-in, sign-up, OTP, and OAuth
- Backend and database integration
- AI and LLM integration
- Live Instagram, YouTube, or other social-platform connections
- Automated vernacular-language analysis
- Real payment or escrow integration
- Legally binding contract generation
- Production notifications and messaging
