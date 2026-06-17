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
assert(genericConversionPushes.length === 0, "client.js: generic conversion event should not be used for ad-platform conversions");
assert(!clientJs.includes('window.dataLayer.push({ event: "conversion" })'), "client.js: bare conversion push should not exist");
assert(clientJs.includes('event: "phone_call_click"'), "client.js: call clicks should be tracked separately from conversions");
assert(!clientJs.includes("whatsappModalStatus"), "client.js: WhatsApp modal progress state should not exist");
assert(!clientJs.includes("startWhatsAppProgressState"), "client.js: WhatsApp should use full-screen verification instead of modal progress");
assert(!clientJs.includes("whatsapp_progress"), "client.js: WhatsApp modal progress config should not be used");
assert(clientJs.includes('event: "whatsapp_cta_conversion"'), "client.js: WhatsApp should push direct CTA conversion event");
assert(!clientJs.includes("openWhatsAppModal(target);"), "client.js: WhatsApp clicks should not open a modal");

const validateJsonLd = (html, file, minimumBlocks = 3) => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
  assert(blocks.length >= minimumBlocks, `${file}: expected at least ${minimumBlocks} JSON-LD block(s)`);
  for (const [, block] of blocks) JSON.parse(block);
};

const assertSeoMetadata = (html, file) => {
  assert(html.includes('property="og:title"'), `${file}: missing Open Graph title`);
  assert(html.includes('property="og:description"'), `${file}: missing Open Graph description`);
  assert(html.includes('property="og:image"'), `${file}: missing Open Graph image`);
  assert(html.includes('name="twitter:card" content="summary_large_image"'), `${file}: missing Twitter summary card`);
  assert(html.includes('"@type": "FAQPage"'), `${file}: missing FAQPage structured data`);
  assert(html.includes('"@type": "BreadcrumbList"'), `${file}: missing BreadcrumbList structured data`);
  assert(html.includes('"@type": "RealEstateListing"'), `${file}: missing RealEstateListing structured data`);
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
  "destination_url",
  "cta_location",
];

const requiredVisibleFields = [
  'name="phone"',
  'name="phone_country_code"',
  'name="email"',
  'name="message"',
  'name="preferred_project"',
  'name="property_type"',
];

const requiredPopupFields = [
  'data-lead-popup',
  'id="leadPopupForm"',
  'id="lead_popup_full_name" name="full_name"',
  'id="lead_popup_phone_country" name="phone_country_code"',
  'id="lead_popup_phone" name="phone"',
  'id="lead_popup_email" name="email"',
  'id="lead_popup_message" name="message"',
  'data-popup-lead-form',
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
assert(standaloneRootHtml.includes(project.seo.title), "index.html: missing English SEO title");
assert(standaloneRootHtml.includes(project.seo.description), "index.html: missing English SEO description");
assert(standaloneRootHtml.includes('property="og:locale" content="en_AE"'), "index.html: missing English Open Graph locale");
assert(standaloneRootHtml.includes('"language_prompt_enabled": false'), "index.html: public page should not use language popup");
assert(standaloneRootHtml.includes('"language_switcher_enabled": false'), "index.html: language switcher should be disabled");
assert(standaloneRootHtml.includes('"language_routes"'), "index.html: missing language route config");
assert(standaloneRootHtml.includes('"/index.html"'), "index.html: missing standalone Arabic route");
assert(standaloneRootHtml.includes(GTM_CONTAINER_ID), "index.html: missing GTM container");
assert(!standaloneRootHtml.includes("data-language-choice-overlay"), "index.html: public page should not render language popup");

const standaloneEnglishHtml = await readFile(path.join(distDir, "index-en.html"), "utf8");
assert(standaloneEnglishHtml.includes('lang="en"'), "index-en.html: missing lang=en");
assert(standaloneEnglishHtml.includes(project.name), "index-en.html: missing English project name");
assert(standaloneEnglishHtml.includes(project.seo.title), "index-en.html: missing English SEO title");
assert(standaloneEnglishHtml.includes(project.seo.description), "index-en.html: missing English SEO description");
assert(standaloneEnglishHtml.includes('property="og:locale" content="en_AE"'), "index-en.html: missing English Open Graph locale");
assert(standaloneEnglishHtml.includes("template-raw-ar"), "index-en.html: English page should use Raw District visual template");
assert(standaloneEnglishHtml.includes("raw-hero-grid"), "index-en.html: missing Raw District hero conversion grid");
assert(!standaloneEnglishHtml.includes("hero-lead-panel"), "index-en.html: header hero form should be removed");
assert(standaloneEnglishHtml.includes("raw-hero-highlights"), "index-en.html: missing first-section highlights bar");
assert(standaloneEnglishHtml.includes('</section>\n    <section class="raw-hero-highlights"'), "index-en.html: highlights bar should render outside the hero section");
assert(standaloneEnglishHtml.includes("raw-template-contact"), "index-en.html: missing lower contact form section");
assert(standaloneEnglishHtml.indexOf('id="contact"') > standaloneEnglishHtml.indexOf("raw-template-location"), "index-en.html: contact form should sit below the location section, not in the header");
assert(standaloneEnglishHtml.includes('data-country-picker-label>+971</span>'), "index-en.html: missing light +971 country-code placeholder");
assert(!standaloneEnglishHtml.includes('data-cta-location="hero_whatsapp"'), "index-en.html: hero WhatsApp CTA should be removed");
assert(standaloneEnglishHtml.includes('data-cta-location="floating_icon"'), "index-en.html: missing floating WhatsApp icon link");
assert(standaloneEnglishHtml.includes("template-exterior-master-aerial.png"), "index-en.html: missing updated template hero image");
assert(standaloneEnglishHtml.includes("raw-location-map"), "index-en.html: missing embedded Google map location block");
assert(standaloneEnglishHtml.includes("https://maps.app.goo.gl/6sCPZCeR6Sp5XHSj6"), "index-en.html: missing direct Google Maps link");
assert(standaloneEnglishHtml.includes("https://www.google.com/maps?q=24.9770521,55.0917547"), "index-en.html: missing Google Maps embed coordinates");
assert(standaloneEnglishHtml.includes("data-map-link"), "index-en.html: missing tracked map CTA");
assert(stylesCss.includes("scroll-margin-top: 90px"), "Stylesheet: Raw District location section needs hash-scroll spacing");
assert(stylesCss.includes("min-height: clamp(380px, 42vw, 560px)"), "Stylesheet: Raw District map frame needs stable desktop height");
assert(stylesCss.includes(".template-raw-ar .raw-location-map iframe"), "Stylesheet: Raw District map iframe needs full-frame styling");
assert(stylesCss.includes("min-height: 320px;"), "Stylesheet: Raw District map frame needs stable mobile height");
assert(stylesCss.includes(".template-raw-ar .lead-strip-section .field.is-message"), "Stylesheet: Raw District inquiry field should span the lead form");
assert(stylesCss.includes("min-height: 74px;"), "Stylesheet: Raw District inquiry field needs usable height");
assert(stylesCss.includes("@media (max-width: 1080px)"), "Stylesheet: Raw District lead form needs tablet stacking");
assert(clientJs.includes("const leadPopupDelayMs = 15000"), "client.js: lead popup should open after 15 seconds");
assert(clientJs.includes("copyLeadPopupIntoMainForm"), "client.js: lead popup should reuse the main form submit path");
assert(!clientJs.includes("leadPopupStorageKey"), "client.js: dismissed lead popup should not be persisted across refresh");
assert(!clientJs.includes("_lead_popup_closed"), "client.js: lead popup close state should reset on refresh");

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

  for (const field of requiredPopupFields) {
    assert(html.includes(field), `${file}: missing required popup lead field ${field}`);
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
  assert(!html.includes('data-whatsapp-modal'), `${file}: WhatsApp modal should not be rendered`);
  assert(!html.includes('data-country-picker="whatsapp"'), `${file}: WhatsApp country-code picker should not be rendered`);
  assert(!html.includes('id="whatsapp_modal_country_search"'), `${file}: WhatsApp country-code search should not be rendered`);
  assert(!html.includes('id="whatsappModalCountryCode" type="hidden"'), `${file}: WhatsApp hidden country-code input should not be rendered`);
  assert(html.includes('"language_switcher_enabled": false'), `${file}: language switcher should be disabled`);
  validateJsonLd(html, file);
  assertSeoMetadata(html, file);
}

const englishLandingHtml = await readFile(path.join(distDir, `${englishInternalRoutePath}/index.html`), "utf8");
assert(englishLandingHtml.includes(project.name), "English internal route: missing project name");
assert(englishLandingHtml.includes(`lang="en"`), "English internal route: missing lang=en");
assert(englishLandingHtml.includes(project.landingPageUrl), "English internal route: missing public landing URL");

const arabicLandingHtml = await readFile(path.join(distDir, `${arabicInternalRoutePath}/index.html`), "utf8");
assert(arabicLandingHtml.includes(project.name), "Old Arabic internal route: missing English project name");
assert(arabicLandingHtml.includes('lang="en"'), "Old Arabic internal route should render English");
assert(arabicLandingHtml.includes('dir="ltr"'), "Old Arabic internal route should be LTR");
assert(arabicLandingHtml.includes(project.seo.title), "Old Arabic internal route: missing English SEO title");
assert(!arabicLandingHtml.includes("راو ديستريكت"), "Old Arabic internal route should not include Arabic project name");
assert(!arabicLandingHtml.includes("أوكلِن ريالتي"), "Old Arabic internal route should not include Arabic Oaklyn name");

const standaloneArabicHtml = await readFile(path.join(distDir, "index-ar.html"), "utf8");
assert(standaloneArabicHtml.includes('lang="en"'), "index-ar.html should render English");
assert(standaloneArabicHtml.includes('dir="ltr"'), "index-ar.html should be LTR");
assert(stylesCss.includes("Cairo"), "Stylesheet: missing Cairo font");
assert(standaloneArabicHtml.includes("Raw District by IMTIAZ"), "Standalone Arabic file: missing English project title");
assert(!standaloneArabicHtml.includes("Imtiaz"), "Standalone Arabic file: IMTIAZ should be uppercase");
assert(!standaloneArabicHtml.includes("راو ديستريكت"), "Standalone Arabic file: project name should stay English");
assert(!standaloneArabicHtml.includes('data-cta-location="hero_whatsapp"'), "Standalone Arabic file: hero WhatsApp CTA should be removed");
assert(standaloneArabicHtml.includes("raw-hero-grid"), "Standalone Arabic file: missing hero conversion grid");
assert(!standaloneArabicHtml.includes("hero-lead-panel"), "Standalone Arabic file: header hero form should be removed");
assert(standaloneArabicHtml.includes("raw-template-contact"), "Standalone Arabic file: missing lower contact form section");
assert(standaloneArabicHtml.includes('</section>\n    <section class="raw-hero-highlights"'), "Standalone Arabic file: highlights bar should render outside the hero section");
assert(standaloneArabicHtml.indexOf('id="contact"') > standaloneArabicHtml.indexOf("raw-template-location"), "Standalone Arabic file: contact form should sit below the location section, not in the header");
assert(standaloneArabicHtml.includes('data-cta-location="footer_contact"'), "Standalone Arabic file: missing footer WhatsApp contact link");
assert(standaloneArabicHtml.includes('data-cta-location="floating_icon"'), "Standalone Arabic file: missing floating WhatsApp icon link");
assert(standaloneArabicHtml.includes("ti-brand-whatsapp"), "Standalone Arabic file: missing WhatsApp icon");
assert(stylesCss.includes(".template-raw-ar .whatsapp-float-wrap"), "Stylesheet: missing Arabic floating WhatsApp override");
assert(standaloneArabicHtml.includes("footer-call-icon"), "Standalone Arabic file: missing footer call icon link");
assert(!standaloneArabicHtml.includes(`<span>${project.brand.phoneDisplay}</span>`), "Standalone Arabic file: call number should not be visible in nav span");
assert(!standaloneArabicHtml.includes(`>${project.brand.phoneDisplay}</a>`), "Standalone Arabic file: call number should not be visible as footer link text");
assert(!standaloneArabicHtml.includes("جاري التحقق من معلوماتك"), "index-ar.html should not render Arabic verification copy");

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
assert(arabicThankYouHtml.includes('lang="en"'), "Arabic internal thank-you fallback should render English");
assert(arabicThankYouHtml.includes('dir="ltr"'), "Arabic internal thank-you fallback should be LTR");
assert(arabicThankYouHtml.includes("Thank you. Our property consultant will contact you shortly."), "Arabic internal thank-you fallback: missing English thank-you copy");
assert(!arabicThankYouHtml.includes("شكراً لك"), "Arabic internal thank-you fallback should not render Arabic thank-you copy");
assert(!arabicThankYouHtml.includes("راو ديستريكت"), "Arabic internal thank-you: project name should stay English");

if (linkHubRoutePath) {
  const html = await readFile(path.join(distDir, `${linkHubRoutePath}/index.html`), "utf8");
  assert(html.includes(project.linkHub.seo.title), "Link hub: missing SEO title");
  assert(html.includes(project.linkHub.profile.title), "Link hub: missing heading");
  assert(html.includes("link-hub-card"), "Link hub: missing cards");
  validateJsonLd(html, `${linkHubRoutePath}/index.html`, 2);
}

console.log(`All checks passed for ${project.name} one-url bilingual build.`);
