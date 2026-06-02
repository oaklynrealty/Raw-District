import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { project } from "../src/project-data.mjs";
import { GTM_CONTAINER_ID } from "../shared/gtm.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const trimSlashes = (value = "") => String(value).replace(/^\/+|\/+$/g, "");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requiredFiles = ["index.html", "thank-you/index.html", "styles.css", "client.js"];

const routePath = trimSlashes(project.routePath);
if (routePath) requiredFiles.push(`${routePath}/index.html`);

const alternateThankYouPath = trimSlashes(project.alternateThankYouPath);
if (alternateThankYouPath && alternateThankYouPath !== "thank-you") {
  requiredFiles.push(`${alternateThankYouPath}/index.html`);
}

for (const file of requiredFiles) {
  await stat(path.join(distDir, file));
}

const landingFiles = ["index.html"];
if (routePath) landingFiles.push(`${routePath}/index.html`);

const thankYouFiles = ["thank-you/index.html"];
if (alternateThankYouPath && alternateThankYouPath !== "thank-you") {
  thankYouFiles.push(`${alternateThankYouPath}/index.html`);
}

const clientJs = await readFile(path.join(distDir, "client.js"), "utf8");

const requiredVisibleFields = [
  'name="phone"',
  'name="phone_country_code"',
  'name="email"',
  'name="preferred_project"',
  'name="property_type"',
];

const forbiddenSensitiveFields = [
  'name="passport"',
  'name="emirates_id"',
  'name="salary"',
  'name="dob"',
  'name="date_of_birth"',
  'name="nationality"',
  'name="religion"',
  'name="health"',
];

const sharedTrackingTerms = [
  "project_name",
  "project_slug",
  "source_page",
  "landing_page_url",
  "thank_you_page_url",
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "lead_success",
  "dataLayer",
  "preferred_unit",
  "inquiry_type",
];

const whatsappTrackingTerms = [
  "whatsapp_cta_click",
  "whatsapp_cta_conversion",
  "whatsapp_cta_blocked",
  "whatsapp_cta_blacklist_error",
  "checkBlacklistStatusWithSimilarPhone",
  "whatsapp_webhook_url",
];

const validateJsonLd = (html, file) => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
  assert(blocks.length >= 3, `${file}: expected Organization, WebPage, and RealEstateListing JSON-LD blocks`);
  for (const [, block] of blocks) JSON.parse(block);
};

for (const file of landingFiles) {
  const html = await readFile(path.join(distDir, file), "utf8");
  assert(html.includes(project.name), `${file}: missing project name`);
  assert(html.includes(project.webhookUrl), `${file}: missing webhook URL`);
  assert(html.includes(GTM_CONTAINER_ID), `${file}: missing GTM container`);
  if (project.compliance?.permit?.value) {
    assert(html.includes(project.compliance.permit.value), `${file}: missing permit placeholder/value`);
  }

  const requiredNameFields = project.form.splitName
    ? ['name="first_name"', 'name="last_name"']
    : ['name="full_name"'];

  for (const field of [...requiredNameFields, ...requiredVisibleFields]) {
    assert(html.includes(field), `${file}: missing compliant form field ${field}`);
  }

  for (const field of forbiddenSensitiveFields) {
    assert(!html.toLowerCase().includes(field), `${file}: sensitive field should not exist ${field}`);
  }

  for (const link of [project.brand.privacyUrl, project.brand.termsUrl, project.brand.contactUrl]) {
    assert(html.includes(link), `${file}: missing legal link ${link}`);
  }

  for (const term of sharedTrackingTerms) {
    assert(html.includes(term) || clientJs.includes(term), `${file}: missing tracking term ${term}`);
  }

  assert(html.includes('data-whatsapp-cta'), `${file}: missing WhatsApp CTA entry point`);
  assert(html.includes('data-whatsapp-modal'), `${file}: missing WhatsApp modal`);
  assert(html.includes(project.brand.whatsappHref.replace(/[^\d]/g, "")), `${file}: missing WhatsApp number`);

  for (const term of whatsappTrackingTerms) {
    assert(clientJs.includes(term) || html.includes(term), `${file}: missing WhatsApp tracking term ${term}`);
  }

  validateJsonLd(html, file);
}

for (const file of thankYouFiles) {
  const html = await readFile(path.join(distDir, file), "utf8");
  assert(html.includes(project.name), `${file}: missing project name`);
  assert(html.includes(GTM_CONTAINER_ID), `${file}: missing GTM container`);
  assert(html.includes("lead_thank_you_page_view"), `${file}: missing thank-you dataLayer tracking event`);
  assert(html.includes("lead_conversion_thank_you"), `${file}: missing thank-you conversion dataLayer event`);
  assert(html.includes("event_id"), `${file}: missing thank-you event_id for conversion deduplication`);
  assert(html.includes("lead_id"), `${file}: missing thank-you lead_id`);
  validateJsonLd(html, file);
}

console.log(`All checks passed for ${project.name}.`);
