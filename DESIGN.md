# GlobalGalli Design System

## Visual theme and atmosphere

GlobalGalli is a warm, credible consumer marketplace for regional influence. It should feel human, local, and commercially clear—not like a generic SaaS dashboard. The public site is photography-led; product screens are information-led. Use calm white space around important stories and tighter, repeatable grids where people compare creators, campaigns, or offers.

The foundation adapts the marketplace principles documented in VoltAgent's Airbnb-inspired `DESIGN.md`: modest typography, photo-first cards, one dominant action color, soft corners, layered translucent surfaces, and restrained depth. GlobalGalli keeps its own rose and olive identity and does not copy Airbnb branding.

## Color palette and roles

- Canvas: `#FFFFFF` for the public site and primary cards.
- Warm canvas: `#FFFDF9` for application workspaces.
- Soft surface: `#F6F4EF` for section separation, filters, and secondary panels.
- Ink: `#242321` for headings and primary text. Avoid pure black.
- Body: `#4B4945` for running copy.
- Muted: `#706D67` for metadata and secondary labels.
- Hairline: `#DEDbd4` for standard borders; `#ECE9E3` for quiet internal dividers.
- Rose: `#D6385F` is the single primary action and value accent.
- Olive: `#9AA67A` is semantic: trust, verified quality, community fit, and positive states.

Rose remains the primary action signal. It may blend into violet for luminous
primary actions and selected navigation, while olive remains semantic rather
than becoming a competing CTA color.

## Typography

- Use one humanist system-sans stack for display and body: Inter, Avenir, Segoe UI, Helvetica, Arial, sans-serif.
- Display type uses weights 600–700, tight tracking, and compact line height. Avoid ultra-bold 800–900 marketing headlines.
- Product titles are normally 20–32px. Public hero type may reach 96px on wide screens because it is paired with photography.
- Body text is 14–18px with 1.5–1.7 line height.
- Metadata is 11–13px. Uppercase is reserved for short eyebrows and status labels.
- Use monospace only for technical identifiers, not prices or primary metrics.

## Components

### Buttons

- Primary: rose fill, white label, 8px radius, minimum 48px height.
- Secondary: white fill, ink label, 1px ink border, 8px radius.
- Text action: no container; underline or darken on hover.
- Primary actions may lift by up to 2px and deepen their glow on hover. Do not scale controls.

### Cards

- Standard radius: 14px. Large photographic plates may use 20px.
- Default cards use a translucent warm-white glass fill, light border, and subtle resting shadow.
- Interactive surfaces may deepen the shared shadow and lift by up to 4px on hover.
- Creator discovery cards should lead with photography when available, followed by identity, context, quality proof, and pricing.

### Search and filters

- The public marketplace search is a full pill with clear segments and a circular rose search action.
- Product filters are compact, bordered, and easy to scan. Focus uses a 2px ink outline without glow.

### Badges

- Badges are small pills with sentence-case labels.
- Rose badges communicate pricing/value exceptions; olive badges communicate trust/positive quality.
- Avoid all-caps badge walls.

## Layout principles

- Use a 4px base rhythm, with most component spacing landing on 8px multiples and 2px reserved for optical adjustments.
- Public pages cap near 1280px. Dense detail pages may use narrower reading widths.
- Major section spacing is 64–88px. Marketplace card gaps are 16px.
- Prefer one strong hierarchy per section. Avoid multiple decorative cards competing above the fold.
- Public pages follow “open hero, denser marketplace below.”

## Depth and elevation

The interface uses a modern glass layer over a soft mesh-gradient canvas.
Primary panels combine translucent white surfaces, bright inner borders,
backdrop blur, and restrained colored shadows. Dark glass is reserved for
high-value summary moments and creator identity.

- Resting glass: rgba(255,255,255,.68) with a 22px backdrop blur.
- Strong glass: rgba(255,255,255,.84) for hover and focused surfaces.
- Resting shadow: 0 18px 50px rgba(50,38,72,.10).
- Hover shadow: 0 24px 64px rgba(50,38,72,.16).

Large blurred blob forms may sit behind page content, but must never reduce
text contrast or compete with marketplace information.

## Modern visual effects

- Use three ambient hues: lilac, coral, and mint. They appear in mesh backgrounds and blurred organic blobs, never as dense text backgrounds.
- Glass panels require both transparency and a visible light border; transparency alone is not a complete component treatment.
- Navigation, search, popovers, cards, and key form surfaces may use glass. Long reading sections remain visually quiet.
- Primary actions use a rose-to-violet gradient with a restrained glow.
- Hovered marketplace cards may lift by 4px and increase glass opacity.
- Blob animation must be slow, decorative, pointer-ignored, and disabled under prefers-reduced-motion.

## Interaction

- Transitions last 150–180ms and change color, border, shadow, or small transforms.
- Limit translation to 2px for controls and 4px for cards. Avoid scale effects.
- Touch targets are at least 44px; primary actions target 48px.
- Always provide visible keyboard focus.
- Respect `prefers-reduced-motion`.

## Accessibility and inclusive UX

- Body copy targets 14–16px; dense metadata stays within 11–13px and never carries the only explanation of an action.
- Text and essential icons meet WCAG AA contrast. Glass surfaces must remain readable without backdrop-filter support.
- Keyboard focus uses a 3px violet outline with a 3px offset so it remains visible over rose, olive, light, and dark surfaces.
- Interactive controls provide at least a 44px touch target; primary and form actions use a 48px height.
- Active navigation uses text, icon, and `aria-current`; status never relies on color alone.
- Inputs retain persistent labels, useful error copy, and 16px text on mobile to avoid browser zoom.
- Data-heavy desktop layouts become labeled stacks or scrollable regions before text is allowed to become unreadable.
- High-contrast and reduced-motion preferences preserve content, focus, and state changes.

## Compliance checklist

Before shipping a frontend change, verify:

1. Rose is the only dominant action color; violet only supports the rose gradient and olive remains semantic.
2. The page has one obvious primary action and a clear heading hierarchy.
3. Cards use the 14px standard radius, restrained shared elevation, and no scale animation.
4. Small text, form labels, focus states, disabled states, and touch targets remain usable.
5. Brand and creator flows use the same tokens and interaction rules.
6. Mobile layouts stack or scroll intentionally with no clipped actions or unreadable desktop grids.
7. Decorative blobs are pointer-ignored, stay behind content, and disappear from motion when requested.
8. `npm run lint` and `npm run build` pass after the change.

## Responsive behavior

- Mobile below 744px: navigation simplifies, cards stack, search collapses to one tappable summary, and app navigation moves to the bottom.
- Tablet from 744–1128px: two-column marketplace grids where space permits.
- Desktop above 1128px: full navigation, segmented search, and two-to-four-column comparison grids.
- Never shrink dense desktop tables into illegible layouts; convert them into labeled stacks or horizontally scrollable regions.

## Creator experience patterns

- Creator studio: use one dark navigation rail with a real profile image, quiet supporting copy, and a white active navigation state. The content canvas remains warm and light.
- Dashboard: open with a calm greeting and profile-strength summary, followed by three comparable value cards for quality, rate, and audience. Supporting offers, collaborations, earnings, and improvement panels use glass-bordered surfaces.
- Opportunities: present open campaigns as a two-column marketplace grid with brand identity, match context, scope, dates, and budget visible before the primary action.
- Offers: preserve a three-part review model on desktop—offer inbox, detailed terms, and fair-rate evidence. Collapse it into a single reading flow on smaller screens.
- Collaborations: keep campaign selection, active work, and payment context distinct. Status color supports the text but never replaces it.
- Profile editor: use a readable form canvas with a sticky section navigator and brand-preview rail. Creator photography should appear by default and uploaded photos should replace it without changing the layout.
- Public profile: lead with creator identity and availability, then audience evidence, quality methodology, collaboration history, and the commercial rate card.

## Do

- Use specific locations, languages, rates, campaign stages, and evidence-based copy.
- Let real creator imagery and marketplace data carry visual interest.
- Keep labels conversational and product-specific.
- Preserve clear trust and pricing semantics across both roles.

## Do not

- Do not place high-frequency gradients or blobs directly behind small text.
- Do not use tilted decorative cards or floating stamps.
- Do not use initials as the primary identity treatment when a creator photo exists.
- Do not mix serif display type with a dense product UI.
- Do not overuse rounded pills; reserve them for search, badges, avatars, and compact controls.
- Do not make follower count the loudest metric.
