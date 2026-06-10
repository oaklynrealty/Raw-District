import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { project, arabicProject } from "../src/project-data.mjs";
import { GTM_CONTAINER_ID } from "../shared/gtm.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const trimSlashes = (value = "") => String(value).replace(/^\/+|\/+$/g, "");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const publicRoutePath = trimSlashes(project.publicRoutePath || project.routePath);
const publicThankYouPath = trimSlashes(project.publicThankYouPath || "thank-you");
const englishInternalRoutePath = trimSlashes(project.routePath);
const englishInternalThankYouPath = trimSlashes(project.alternateThankYouPath);
const arabicInternalRoutePath = trimSlashes(arabicProject.routePath);
const arabicInternalThankYouPath = trimSlashes(arabicProject.alternateThankYouPath);
const linkHubRoutePath = trimSlashes(project.linkHub?.routePath);

const requiredFiles = [
  "index.html",
  "index-en.html",
  "index-ar.html",
  "styles.css",
  "client.js",
  `${publicRoutePath}/index.html`,
  `${publicThankYouPath}/index.html`,
  `${englishInternalRoutePath}/index.html`,
  `${englishInternalThankYouPath}/index.html`,
  `${arabicInternalRoutePath}/index.html`,
  `${arabicInternalThankYouPath}/index.html`,
];

if (linkHubRoutePath) {
  requiredFiles.push(`${linkHubRoutePath}/index.html`);
}

for (const file of requiredFiles) {
  await stat(path.join(distDir, file));
}

for (const file of ["index.html", "index-en.html", "index-ar.html"]) {
  await stat(path.join(rootDir, file));
}

const clientJs = await readFile(path.join(distDir, "client.js"), "utf8");
const stylesCss = await readFile(path.join(distDir, "styles.css"), "utf8");
const genericConversionPushes = clientJs.match(/event:\s*"conversion"/g) || [];
assert(genericConversionPushes.length === 2, "client.js: generic conversion must only fire for clean form and clean WhatsApp paths");
assert(!clientJs.includes('window.dataLayer.push({ event: "conversion" })'), "client.js: bare conversion push should not exist");
assert(clientJs.includes('event: "phone_call_click"'), "client.js: call clicks should be tracked separately from conversions");
assert(!clientJs.includes("whatsappModalStatus"), "client.js: WhatsApp modal progress state should not exist");
assert(!clientJs.includes("startWhatsAppProgressState"), "client.js: WhatsApp should use full-screen verification instead of modal progress");
assert(!clientJs.includes("whatsapp_progress"), "client.js: WhatsApp modal progress config should not be used");
assert(clientJs.includes("closeWhatsAppModal();\n\n    showVerification(async function ()"), "client.js: WhatsApp blacklist check should run inside full-screen verification");

const validateJsonLd = (html, file, minimumBlocks = 3) => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
  assert(blocks.length >= minimumBlocks, `${file}: expected at least ${minimumBlocks} JSON-LD block(s)`);
  for (const [, block] of blocks) JSON.parse(block);
};

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
  "lead_blocked",
  "lead_blacklist_error",
  "dataLayer",
  "preferred_unit",
  "inquiry_type",
  "current_language",
];

const whatsappTrackingTerms = [
  "whatsapp_cta_click",
  "whatsapp_cta_conversion",
  "whatsapp_cta_unverified",
  "whatsapp_cta_blocked",
  "whatsapp_cta_blacklist_error",
  "checkBlacklistStatusWithSimilarPhone",
  "whatsapp_webhook_url",
];

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

const standaloneRootHtml = await readFile(path.join(distDir, "index.html"), "utf8");
assert(standaloneRootHtml.includes("window.OAKLYN_LANDING_CONFIG"), "index.html: missing landing config");
assert(standaloneRootHtml.includes('lang="en"'), "index.html: root page should be English");
assert(standaloneRootHtml.includes('dir="ltr"'), "index.html: root page should be LTR");
assert(standaloneRootHtml.includes('"language_prompt_enabled": false'), "index.html: public page should not use language popup");
assert(standaloneRootHtml.includes('"language_switcher_enabled": false'), "index.html: language switcher should be disabled");
assert(standaloneRootHtml.includes('"language_routes"'), "index.html: missing language route config");
assert(standaloneRootHtml.includes('"/index.html"'), "index.html: missing standalone English route");
assert(standaloneRootHtml.includes('"/index-ar.html"'), "index.html: missing standalone Arabic route");
assert(standaloneRootHtml.includes(GTM_CONTAINER_ID), "index.html: missing GTM container");
assert(!standaloneRootHtml.includes("data-language-choice-overlay"), "index.html: public page should not render language popup");

const standaloneEnglishHtml = await readFile(path.join(distDir, "index-en.html"), "utf8");
assert(standaloneEnglishHtml.includes('lang="en"'), "index-en.html: missing lang=en");
assert(standaloneEnglishHtml.includes(project.name), "index-en.html: missing English project name");

for (const file of [`${publicRoutePath}/index.html`]) {
  const html = await readFile(path.join(distDir, file), "utf8");
  assert(html.includes("window.OAKLYN_LANDING_CONFIG"), `${file}: missing landing config`);
  assert(html.includes('"language_prompt_enabled": false'), `${file}: public page should not use language popup`);
  assert(html.includes('"language_switcher_enabled": false'), `${file}: language switcher should be disabled`);
  assert(html.includes('"language_routes"'), `${file}: missing language route config`);
  assert(html.includes(`/${englishInternalRoutePath}/`), `${file}: missing English internal route`);
  assert(html.includes(`/${arabicInternalRoutePath}/`), `${file}: missing Arabic internal route`);
  assert(html.includes(GTM_CONTAINER_ID), `${file}: missing GTM container`);
  assert(!html.includes("data-language-choice-overlay"), `${file}: public page should not render language popup`);
}

for (const file of [`${publicThankYouPath}/index.html`]) {
  const html = await readFile(path.join(distDir, file), "utf8");
  assert(html.includes(GTM_CONTAINER_ID), `${file}: missing public thank-you GTM container`);
  assert(html.includes("lead_thank_you_page_view"), `${file}: missing public thank-you pageview event`);
  assert(html.includes("lead_conversion_thank_you"), `${file}: missing public thank-you conversion event`);
}

const landingFiles = [
  "index.html",
  "index-ar.html",
  `${publicRoutePath}/index.html`,
  `${englishInternalRoutePath}/index.html`,
  `${arabicInternalRoutePath}/index.html`,
];

for (const file of landingFiles) {
  const html = await readFile(path.join(distDir, file), "utf8");
  assert(html.includes(project.webhookUrl), `${file}: missing form webhook URL`);
  assert(html.includes(project.whatsappWebhookUrl), `${file}: missing WhatsApp webhook URL`);
  assert(html.includes("wa.me/971505886769"), `${file}: missing correct WhatsApp number`);
  assert(!html.includes("wa.me/971585835230"), `${file}: WhatsApp should not use call number`);
  assert(!html.includes("whatsapp-modal-status"), `${file}: should not render WhatsApp modal progress section`);
  assert(!html.includes("whatsapp_progress"), `${file}: should not include unused WhatsApp progress config`);
  assert(html.includes(GTM_CONTAINER_ID), `${file}: missing GTM container`);
  assert(html.includes('name="full_name"'), `${file}: missing full name field`);

  for (const field of requiredVisibleFields) {
    assert(html.includes(field), `${file}: missing compliant form field ${field}`);
  }

  for (const field of forbiddenSensitiveFields) {
    assert(!html.toLowerCase().includes(field), `${file}: sensitive field should not exist ${field}`);
  }

  for (const term of sharedTrackingTerms) {
    assert(html.includes(term) || clientJs.includes(term), `${file}: missing tracking term ${term}`);
  }

  for (const term of whatsappTrackingTerms) {
    assert(html.includes(term) || clientJs.includes(term), `${file}: missing WhatsApp term ${term}`);
  }

  assert(html.includes('data-whatsapp-cta'), `${file}: missing WhatsApp CTA`);
  assert(html.includes('data-whatsapp-modal'), `${file}: missing WhatsApp modal`);
  assert(html.includes('data-country-picker="whatsapp"'), `${file}: missing WhatsApp country-code picker`);
  assert(html.includes('id="whatsapp_modal_country_search"'), `${file}: missing WhatsApp country-code search`);
  assert(html.includes('id="whatsappModalCountryCode" type="hidden"'), `${file}: missing WhatsApp hidden country-code input`);
  assert(html.includes('"language_switcher_enabled": false'), `${file}: language switcher should be disabled`);
  validateJsonLd(html, file);
}

const englishLandingHtml = await readFile(path.join(distDir, `${englishInternalRoutePath}/index.html`), "utf8");
assert(englishLandingHtml.includes(project.name), "English internal route: missing project name");
assert(englishLandingHtml.includes(`lang="en"`), "English internal route: missing lang=en");
assert(englishLandingHtml.includes(project.landingPageUrl), "English internal route: missing public landing URL");

const arabicLandingHtml = await readFile(path.join(distDir, `${arabicInternalRoutePath}/index.html`), "utf8");
assert(arabicLandingHtml.includes(arabicProject.name), "Arabic internal route: missing Arabic project name");
assert(arabicLandingHtml.includes('lang="ar"'), "Arabic internal route: missing lang=ar");
assert(arabicLandingHtml.includes('dir="rtl"'), "Arabic internal route: missing dir=rtl");
assert(!arabicLandingHtml.includes("راو ديستريكت"), "Arabic internal route: project name should stay English");
assert(!arabicLandingHtml.includes("أوكلِن ريالتي"), "Arabic internal route: should not include Arabic Oaklyn name");

const standaloneArabicHtml = await readFile(path.join(distDir, "index-ar.html"), "utf8");
assert(standaloneArabicHtml.includes('lang="ar"'), "Standalone Arabic file: missing lang=ar");
assert(standaloneArabicHtml.includes('dir="rtl"'), "Standalone Arabic file: missing dir=rtl");
assert(stylesCss.includes("Cairo"), "Stylesheet: missing Cairo font");
assert(standaloneArabicHtml.includes("Raw District by IMTIAZ"), "Standalone Arabic file: missing English project title");
assert(!standaloneArabicHtml.includes("Imtiaz"), "Standalone Arabic file: IMTIAZ should be uppercase");
assert(!standaloneArabicHtml.includes("راو ديستريكت"), "Standalone Arabic file: project name should stay English");
assert(standaloneArabicHtml.includes("تواصل عبر واتساب"), "Standalone Arabic file: missing Arabic WhatsApp CTA");
assert(standaloneArabicHtml.includes("جاري التحقق من معلوماتك"), "Standalone Arabic file: missing Arabic verification copy");

for (const file of [`${publicThankYouPath}/index.html`, `${englishInternalThankYouPath}/index.html`, `${arabicInternalThankYouPath}/index.html`]) {
  const html = await readFile(path.join(distDir, file), "utf8");
  assert(html.includes(GTM_CONTAINER_ID), `${file}: missing GTM container`);
  assert(html.includes("lead_thank_you_page_view"), `${file}: missing thank-you pageview event`);
  assert(html.includes("lead_conversion_thank_you"), `${file}: missing thank-you conversion event`);
  assert(html.includes("event_id"), `${file}: missing event_id`);
  assert(html.includes("lead_id"), `${file}: missing lead_id`);
  validateJsonLd(html, file);
}

const arabicThankYouHtml = await readFile(path.join(distDir, `${arabicInternalThankYouPath}/index.html`), "utf8");
assert(arabicThankYouHtml.includes('lang="ar"'), "Arabic internal thank-you: missing lang=ar");
assert(arabicThankYouHtml.includes('dir="rtl"'), "Arabic internal thank-you: missing dir=rtl");
assert(!arabicThankYouHtml.includes("راو ديستريكت"), "Arabic internal thank-you: project name should stay English");

if (linkHubRoutePath) {
  const html = await readFile(path.join(distDir, `${linkHubRoutePath}/index.html`), "utf8");
  assert(html.includes(project.linkHub.seo.title), "Link hub: missing SEO title");
  assert(html.includes(project.linkHub.profile.title), "Link hub: missing heading");
  assert(html.includes("link-hub-card"), "Link hub: missing cards");
  validateJsonLd(html, `${linkHubRoutePath}/index.html`, 2);
}

console.log(`All checks passed for ${project.name} one-url bilingual build.`);
