import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { project } from "../src/project-data.mjs";
import { GTM_CONTAINER_ID } from "../shared/gtm.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requiredFiles = [
  "index.html",
  "raw-district/index.html",
  "variant-b/index.html",
  "thank-you/index.html",
  "styles.css",
  "client.js",
  "assets/raw-district/photos/raw-district-exterior-evening.webp",
  "assets/raw-district/photos/raw-district-interior-suite.webp",
  "assets/raw-district/advisor/raw-district-advisor.webp",
  "assets/raw-district/permit/raw-district-permit-qr.jpeg"
];

for (const file of requiredFiles) {
  await stat(path.join(distDir, file));
}

const landingHtml = await readFile(path.join(distDir, "index.html"), "utf8");
const variantHtml = await readFile(path.join(distDir, "variant-b/index.html"), "utf8");
const thankYouHtml = await readFile(path.join(distDir, "thank-you/index.html"), "utf8");
const css = await readFile(path.join(distDir, "styles.css"), "utf8");
const client = await readFile(path.join(distDir, "client.js"), "utf8");

const requiredTerms = [
  project.name,
  project.cta,
  project.webhookUrl,
  GTM_CONTAINER_ID,
  "Step <span data-current-step>1</span> of 3",
  "What type of property are you looking for?",
  "When are you planning to purchase?",
  "Full name",
  "Mobile or WhatsApp number",
  "data-country-code-picker",
  "Search country or code",
  "No country found.",
  "icon-whatsapp",
  "maps.google.com/maps?hl=en",
  "Raw%20District%20by%20IMTIAZ",
  "permit-qr-badge",
  "raw-district-permit-qr.jpeg",
  "Email address",
  "Please enter a valid email address.",
  "Preferred contact method",
  project.form.consent,
  project.brand.privacyUrl,
  "Your Request Has Been Received",
  "data-open-lead-modal",
  "btn-floor-plan",
  "data-success-summary",
  "landing_page_view",
  "form_start",
  "form_step_1_complete",
  "form_step_2_complete",
  "generate_lead",
  "lead_success",
  "event_id",
  "events_id",
  "portal_lead_id",
  "campaign_search_term",
  "search_term",
  "language",
  "property_link",
  "general_whatsapp_link",
  "country",
  "comment_text",
  "URLSearchParams",
  "lead_title",
  "TITLE",
  "PHONE_WORK",
  "EMAIL_WORK",
  "SOURCE_ID",
  "Full Name",
  "Mobile or WhatsApp number",
  "Campaign search term",
  "Portal Lead ID",
  "Property Link",
  "General Whatsapp Link",
  "GCLID",
  "FBCLID",
  "UTM Source",
  "Comment text",
  "phone_number",
  "Offplan Buyer",
  "webhook_status",
  "form_submission_confirmed",
  "conversion_type",
  "conversion_action",
  "form_submission",
  "click_call",
  "click_whatsapp",
  "book_viewing",
  "https://maps.app.goo.gl/KKVy9kvr2MNMFQcD6",
  "Google Maps preview",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "utm_id",
  "gclsrc",
  "gad_source",
  "campaignid",
  "adgroupid",
  "creative",
  "keyword",
  "matchtype",
  "device",
  "network",
  "fbp",
  "fbc",
  "campaign_id",
  "adset_id",
  "ad_id",
  "placement",
  "site_source_name",
  "ad_platform",
  "Google Ads",
  "Meta Ads",
  "url_query_string",
  "all_url_params_json",
  "landing_page_variant",
  "timestamp",
  "crm_lead_stage",
  "qualified_lead_status",
  "converted_lead_status"
];

for (const term of requiredTerms) {
  assert(
    landingHtml.includes(term) || variantHtml.includes(term) || thankYouHtml.includes(term) || client.includes(term),
    `Missing required term: ${term}`,
  );
}

const forbiddenFields = [
  'name="passport"',
  'name="emirates_id"',
  'name="date_of_birth"',
  'name="salary"',
  'name="income"',
  'name="nationality"',
  'name="religion"',
  'name="health"'
];

for (const field of forbiddenFields) {
  assert(!landingHtml.toLowerCase().includes(field), `Sensitive field should not exist: ${field}`);
}

assert(!landingHtml.includes(">Submit<"), "Visible Submit CTA should not exist.");
assert(!landingHtml.includes(">Send<"), "Visible Send CTA should not exist.");
assert(!landingHtml.includes(">Learn More<"), "Visible Learn More CTA should not exist.");
assert(css.includes("@media (max-width: 700px)"), "Missing mobile breakpoint.");
assert(css.includes("prefers-reduced-motion"), "Missing reduced-motion support.");
assert(css.includes("aspect-ratio"), "Images need reserved aspect ratios.");
assert(css.includes("column-gap: 18px"), "Phone country selector needs clear separation from phone number.");
assert(landingHtml.includes('type="image/webp"'), "Landing page should use WebP picture sources.");
assert(variantHtml.includes("variant-b"), "Variant B page should render variant class.");
assert(!landingHtml.includes('class="permit-qr-link" href='), "Permit QR badge should not be clickable.");
assert(!landingHtml.includes("Email address <span>Optional</span>"), "Email field should be required, not optional.");
assert(!variantHtml.includes("Email address <span>Optional</span>"), "Variant email field should be required, not optional.");
assert(!landingHtml.includes("https://hooks.zapier.com/hooks/catch/27424919/uvzwm7a/"), "Raw District English should use its dedicated webhook.");

const jsonLdBlocks = [...landingHtml.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
assert(jsonLdBlocks.length >= 3, "Expected Organization, WebPage and RealEstateListing JSON-LD.");
for (const [, block] of jsonLdBlocks) {
  JSON.parse(block);
}

console.log(`All checks passed for ${project.name} ads campaign.`);
