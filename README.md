# Raw District by Imtiaz Standalone Landing

This folder contains the standalone landing page build for `Raw District by Imtiaz`.

## Project Snapshot

- Developer: `Imtiaz Developments`
- Location: `Sheikh Zayed Road, Downtown Jebel Ali, Dubai`
- Property type: `Mixed-use - Apartments + Workspaces + Retail`
- Handover: `Q1 2029`
- Starting price: `From AED 649,000`
- Payment plan: `20% downpayment / 30% during construction / 50% on handover`

## What This Build Includes

- premium hero with CTA-focused layout
- highlights, unit cards, and project detail cards
- payment-plan, amenities, gallery, location, trust, FAQ, and contact sections
- Oaklyn form flow with blacklist check before webhook submission
- thank-you page flow and GTM-ready dataLayer events
- GTM tracking for WhatsApp CTAs
- mobile-first responsive styling

## Build

Run:

```bash
npm run check
```

Generated static files are written to `dist/`.

## Main Files

- `src/project-data.mjs` controls project identity, SEO, copy, sections, form labels, dropdowns, and compliance wording.
- `src/styles.css` contains the premium launch design system.
- `src/client.js` controls UTM/click ID capture, phone validation, blacklist check, webhook submission, `dataLayer`, and thank-you redirects.
- `scripts/build.mjs` generates the static landing and thank-you pages.
- `scripts/check.mjs` validates tracking, legal links, JSON-LD, and form fields.

## Manual Items Before Launch

- replace the placeholder SVGs with approved project renders when available
- add the final permit number in `src/project-data.mjs`
- confirm final availability, pricing, and post-handover terms before publishing
- test one internal lead to verify webhook, CRM, thank-you redirect, blacklist handling, and GTM events
