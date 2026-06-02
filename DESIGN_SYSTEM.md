# Raw District Standalone Design System

Generated with UI/UX Pro Max guidance and adapted to Oaklyn Realty's premium launch-page direction.

## Creative Direction

This page is designed to feel credible, modern, and investor-friendly without drifting into fake luxury or aggressive sales language.

## Design Principles

- Lead with a single project message and clear CTA.
- Keep project facts visible above the fold.
- Use elegant editorial typography with restrained modern UI text.
- Let imagery carry atmosphere, while the copy carries clarity.
- Keep the enquiry form compliant, direct, and easy to complete.
- Avoid countdown gimmicks, ROI promises, and exaggerated urgency.

## Tokens

```css
:root {
  --oak-ink: #0f1723;
  --oak-panel: rgba(255, 251, 245, 0.84);
  --oak-muted: rgba(15, 23, 35, 0.62);
  --oak-sand: #efe3d0;
  --oak-ivory: #faf6ef;
  --oak-bronze: #b98b4f;
  --oak-bronze-deep: #936631;
  --oak-bronze-soft: rgba(185, 139, 79, 0.16);
}
```

## Typography

- Display headings: `Cormorant Garamond`, serif.
- Body and UI: `Manrope`, sans-serif.
- H1: large editorial scale with tight line-height.
- Eyebrows: uppercase Manrope, wide tracking, bronze/gold tone.

## Component Rules

- Navigation: dark sticky bar with compact uppercase links.
- Hero: cinematic background, oversized heading, two focused CTAs.
- Cards: soft glass panels with warm neutral surfaces.
- Primary CTA: bronze pill button with strong contrast.
- Secondary CTA: dark translucent ghost button.
- Form inputs: bright premium panels with bronze focus state.
- Mobile CTA: fixed bottom bar with Call and WhatsApp actions.

## Landing Structure

1. Hero with CTA and key facts.
2. Project detail strip.
3. Highlights.
4. Unit types.
5. About section.
6. Positioning blocks.
7. Payment plan.
8. Amenities.
9. Visual gallery.
10. Location.
11. Lead form.
12. Trust section.
13. FAQ.
14. Footer.

## Compliance Style

The page should feel confident, not defensive. Legal and compliance guidance belongs in the form, trust section, permit note, and footer. Keep all pricing, payment-plan, and handover wording subject to developer confirmation.

## Key Files

- `src/styles.css`
- `src/project-data.mjs`
- `scripts/build.mjs`
