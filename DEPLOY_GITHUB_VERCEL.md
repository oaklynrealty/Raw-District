# Raw District GitHub + Vercel Deployment Notes

## Upload To GitHub

Upload these project files and folders:

- `assets/`
- `scripts/`
- `src/`
- `package.json`
- `README.md`
- `TEMPLATE_SETUP.md`
- `TRACKING_SETUP.md`
- `vercel.json`
- `DESIGN_SYSTEM.md`
- `DEPLOY_GITHUB_VERCEL.md`

Do not upload `dist/` unless you intentionally want to store generated files. Vercel will create `dist/` during deployment.

## Vercel Import Settings

- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Routes

Confirm these routes in `src/project-data.mjs` before deploy:

- landing URL: `https://raw-district.oaklynrealty.ae/`
- thank-you URL: `https://raw-district.oaklynrealty.ae/thank-you/`
- backup landing alias: `/raw-district`
- hidden English page: `/__oaklyn-lang/en`
- hidden Arabic page: `/__oaklyn-lang/ar`
- hidden English thank-you page: `/__oaklyn-lang/en-thank-you`
- hidden Arabic thank-you page: `/__oaklyn-lang/ar-thank-you`

Use only the root landing URL in ads and public links. The root page is the real tracked landing page with a fixed EN/AR language switcher. The hidden language routes are loader targets only.

## Required Manual Check

After deployment, submit one internal test lead and verify:

- Zapier receives the form payload.
- CRM receives the lead.
- Thank-you redirect opens `/thank-you`.
- The language switcher appears on the landing page, and sends users to the correct English or Arabic content without exposing the hidden routes as public ad URLs.
- GTM receives `lead_success` on form submit.
- Thank-you page pushes `lead_thank_you_page_view`.
- Thank-you page pushes `lead_conversion_thank_you`.

## Before You Deploy

Make sure you already replaced:

- placeholder visuals with approved project media
- project permit number
- any outdated pricing or payment-plan details
- any route or domain values that changed after staging
