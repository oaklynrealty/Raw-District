# Raw District Launch Checklist

Use this checklist before the Raw District standalone page goes live.

## 1. Confirm Live Project Facts

Check in `src/project-data.mjs`:

- final permit number
- current starting prices
- latest payment-plan terms
- handover timing
- any confirmed workspace or retail release details

## 2. Replace Temporary Visuals

Replace the abstract SVGs inside `assets/raw-district/` with approved project media:

- hero render
- exterior render
- amenities render
- residence render
- location or masterplan visual

## 3. Confirm URLs

Check in `src/project-data.mjs`:

- source page
- landing page URL
- thank-you page URL
- route path
- alternate thank-you path

## 4. Keep These Parts Consistent

Do not change unless needed:

- form field structure
- phone validation flow
- blacklist check flow
- webhook field names
- thank-you logic
- GTM setup and dataLayer events

## 5. Final Check Before Deploy

Run:

```bash
npm run check
```

Then verify:

- landing page works
- thank-you page works
- blacklist works
- webhook works
- form fields match the Oaklyn standard
- WhatsApp CTA events appear in GTM Preview
