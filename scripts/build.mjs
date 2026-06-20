import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { project } from "../src/project-data.mjs";
import { renderGtmBody, renderGtmHead } from "../shared/gtm.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const company = project.brand;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const json = (data) => JSON.stringify(data, null, 2).replaceAll("</script", "<\\/script");
const renderJsonLd = (data) => `<script type="application/ld+json">\n${json(data)}\n</script>`;
const trimSlashes = (value = "") => String(value).replace(/^\/+|\/+$/g, "");
const digitsOnly = (value = "") => String(value).replace(/[^\d]/g, "");
const withVersion = (src = "") => {
  if (!String(src).startsWith("/assets/")) return src;
  return `${src}${String(src).includes("?") ? "&" : "?"}v=${encodeURIComponent(project.assetVersion)}`;
};

const absoluteUrl = (value = "", fallback = project.landingPageUrl) => {
  try {
    return new URL(value || fallback, project.landingPageUrl).href;
  } catch {
    return value || fallback;
  }
};

const getWhatsAppHref = () => {
  const phone = digitsOnly(company.whatsappHref || company.phoneHref);
  return `https://wa.me/${phone}?text=${encodeURIComponent(project.whatsappPrefill)}`;
};

const icon = (name) => {
  const icons = {
    phone:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6.1 6.1l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/></svg>',
    whatsapp:
      '<svg class="icon-whatsapp" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.9 11.9 0 0 0 2.9 18.3L2 22l3.8-1A11.9 11.9 0 0 0 12 22a12 12 0 0 0 8.5-18.5ZM12 20a9.8 9.8 0 0 1-5-1.4l-.4-.2-2.2.6.6-2.1-.3-.4A9.9 9.9 0 1 1 12 20Zm5.5-7.4c-.3-.2-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-1 1.1-.4.2-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6v-.6c0-.2-.7-1.9-1-2.6-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.8 1.2 3.2 1.4 3.4a12.5 12.5 0 0 0 4.8 4.2c.7.3 1.2.5 1.6.7.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5s-.3-.2-.6-.4Z"/></svg>',
    map:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zM9 3v15m6-12v15"/></svg>',
    building:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M8 7h4m-4 4h4m-4 4h4m8 6V9a2 2 0 0 0-2-2h-2M3 21h18"/></svg>',
    wallet:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7H5a3 3 0 0 0 0 6h15v7H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h13a2 2 0 0 1 2 2v1zm-3 7h.01"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>'
  };
  return icons[name] || icons.check;
};

const renderOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": "https://oaklynrealty.ae/#organization",
  name: company.legalName,
  alternateName: company.company,
  url: company.mainWebsite,
  logo: company.logo,
  telephone: company.phoneHref,
  email: company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.office,
    addressLocality: "Dubai",
    addressCountry: "AE"
  },
  identifier: [
    { "@type": "PropertyValue", propertyID: "DED Licence", value: "1589593" },
    { "@type": "PropertyValue", propertyID: "RERA ORN", value: "59210" }
  ]
});

const renderWebpageSchema = (canonical) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  url: canonical,
  name: project.seo.title,
  description: project.seo.description,
  inLanguage: "en",
  publisher: { "@id": "https://oaklynrealty.ae/#organization" }
});

const renderListingSchema = (canonical) => ({
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  url: canonical,
  name: project.name,
  description: project.seo.description,
  brokerage: { "@id": "https://oaklynrealty.ae/#organization" },
  address: {
    "@type": "PostalAddress",
    addressLocality: project.listing.addressLocality,
    addressRegion: project.listing.addressRegion,
    addressCountry: project.listing.addressCountry
  },
  developer: {
    "@type": "Organization",
    name: project.listing.developer
  },
  regulator: {
    "@type": "GovernmentOrganization",
    name: project.listing.regulator
  }
});

const renderHead = ({ canonical, title = project.seo.title, description = project.seo.description }) => `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="data:,">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(absoluteUrl(project.media.hero.src))}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary_large_image">
  ${renderGtmHead(project.tracking, escapeHtml)}
  ${renderJsonLd(renderOrganizationSchema())}
  ${renderJsonLd(renderWebpageSchema(canonical))}
  ${renderJsonLd(renderListingSchema(canonical))}
  <link rel="preload" as="image" href="${escapeHtml(withVersion(project.media.hero.src))}">
  <link rel="stylesheet" href="/styles.css?v=${escapeHtml(project.assetVersion)}">`;

const renderPicture = ({ image, className = "", loading = "lazy", fetchPriority = "auto", sizes = "100vw" }) => `
  <picture${className ? ` class="${escapeHtml(className)}"` : ""}>
    ${image.webp ? `<source srcset="${escapeHtml(withVersion(image.webp))}" type="image/webp" sizes="${escapeHtml(sizes)}">` : ""}
    ${image.avif ? `<source srcset="${escapeHtml(withVersion(image.avif))}" type="image/avif" sizes="${escapeHtml(sizes)}">` : ""}
    <img src="${escapeHtml(withVersion(image.src))}" alt="${escapeHtml(image.alt || "")}" loading="${escapeHtml(loading)}" decoding="async"${fetchPriority !== "auto" ? ` fetchpriority="${escapeHtml(fetchPriority)}"` : ""}>
  </picture>`;

const renderHeader = () => `
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="/" aria-label="${escapeHtml(company.company)} Raw District campaign">
        <img src="${escapeHtml(company.logo)}" alt="${escapeHtml(company.company)}">
      </a>
      <a class="advisor-link" href="tel:${escapeHtml(company.phoneHref)}" data-call data-cta-location="header">
        ${icon("phone")}
        <span>Call an Advisor</span>
      </a>
    </div>
  </header>`;

const renderChips = () =>
  project.hero.chips
    .map((chip) => `<span class="fact-chip">${escapeHtml(chip)}</span>`)
    .join("");

const renderProofPoints = () =>
  project.hero.proofPoints
    .map((point) => `<li>${icon("check")}<span>${escapeHtml(point)}</span></li>`)
    .join("");

const renderCountryCodePicker = (formId) => {
  const countries = project.form.phoneCountries || [];
  const defaultCountry = countries[0] || { label: "United Arab Emirates", dialCode: "+971" };
  const currentId = `${formId}_phone_country_current`;

  return `<div class="field country-field country-code-field" data-field="phone_country_code" data-country-code-picker>
            <label id="${escapeHtml(formId)}_phone_country_label">Country code</label>
            <input id="${escapeHtml(formId)}_phone_country" name="phone_country_code" type="hidden" value="${escapeHtml(defaultCountry.dialCode)}" autocomplete="tel-country-code" data-country-code-input>
            <button
              class="country-code-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-labelledby="${escapeHtml(formId)}_phone_country_label ${escapeHtml(currentId)}"
              data-country-code-trigger
            >
              <span id="${escapeHtml(currentId)}" data-country-code-current>${escapeHtml(`${defaultCountry.label} ${defaultCountry.dialCode}`)}</span>
              <span class="country-code-chevron" aria-hidden="true">▾</span>
            </button>
            <div class="country-code-panel" data-country-code-panel hidden>
              <label class="sr-only" for="${escapeHtml(formId)}_phone_country_search">Search country or code</label>
              <input
                id="${escapeHtml(formId)}_phone_country_search"
                class="country-code-search"
                type="search"
                autocomplete="off"
                autocapitalize="none"
                spellcheck="false"
                placeholder="Search country or code"
                data-country-code-search
              >
              <div class="country-code-list" role="listbox" data-country-code-list>
                ${countries
                  .map(
                    (country, index) => `<button
                  class="country-code-option${index === 0 ? " is-selected" : ""}"
                  type="button"
                  role="option"
                  aria-selected="${index === 0 ? "true" : "false"}"
                  data-country-code-option
                  data-country-label="${escapeHtml(country.label)}"
                  data-country-code="${escapeHtml(country.dialCode)}"
                  data-country-query="${escapeHtml(`${country.label} ${country.dialCode}`.toLowerCase())}"
                >
                  <span class="country-option-check" aria-hidden="true"></span>
                  <span>${escapeHtml(country.label)}</span>
                  <strong>${escapeHtml(country.dialCode)}</strong>
                </button>`,
                  )
                  .join("")}
              </div>
              <p class="country-code-empty" data-country-code-empty hidden>No country found.</p>
            </div>
          </div>`;
};

const trackingFieldNames = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "gclid",
  "gclsrc",
  "gad_source",
  "gad_campaignid",
  "campaignid",
  "adgroupid",
  "creative",
  "keyword",
  "matchtype",
  "device",
  "network",
  "gbraid",
  "wbraid",
  "fbclid",
  "fbp",
  "fbc",
  "campaign_id",
  "adset_id",
  "ad_id",
  "placement",
  "site_source_name",
  "meta_campaign_id",
  "meta_adset_id",
  "meta_ad_id",
  "meta_placement",
  "url_query_string",
  "all_url_params_json",
  "landing_page_variant",
  "timestamp",
  "lead_id",
  "event_id",
  "events_id",
  "portal_lead_id",
  "campaign_search_term",
  "search_term",
  "language",
  "page_language",
  "browser_language",
  "property_link",
  "property_url",
  "listing_link",
  "general_whatsapp_link",
  "whatsapp_link",
  "country",
  "country_name",
  "phone_country",
  "comment_text",
  "source_page",
  "project_slug",
  "crm_lead_stage",
  "qualified_lead_status",
  "converted_lead_status"
];

const renderHiddenFields = (formVariant) =>
  trackingFieldNames
    .map((name) => {
      const value =
        name === "source_page"
          ? project.sourcePage
          : name === "project_slug"
            ? project.slug
            : name === "crm_lead_stage"
              ? "new_campaign_lead"
              : name === "qualified_lead_status" || name === "converted_lead_status"
                ? "pending_crm_update"
            : name === "landing_page_variant"
              ? formVariant
              : "";
      return `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" data-hidden-field="${escapeHtml(name)}">`;
    })
    .join("\n        ");

const renderOptionCards = ({ name, items, formId }) =>
  items
    .map((item, index) => {
      const id = `${formId}_${name}_${index}`;
      return `<label class="choice-card" for="${escapeHtml(id)}">
        <input id="${escapeHtml(id)}" type="radio" name="${escapeHtml(name)}" value="${escapeHtml(item)}">
        <span>${escapeHtml(item)}</span>
      </label>`;
    })
    .join("");

const renderMultiStepForm = ({ formId = "campaignLeadForm", variant = "a", compact = false } = {}) => `
  <section class="form-card${compact ? " form-card-compact" : ""}" aria-labelledby="${escapeHtml(formId)}Title">
    <div class="form-card-header">
      <span class="form-kicker">Step <span data-current-step>1</span> of 3</span>
      <h2 id="${escapeHtml(formId)}Title">Get the official price list, floor plans and current availability</h2>
      <p>Answer a few short questions so we can send the most relevant Raw District options.</p>
    </div>
    <form id="${escapeHtml(formId)}" class="lead-form" novalidate data-lead-form data-form-type="multi-step" data-form-variant="${escapeHtml(variant)}">
      ${renderHiddenFields(variant)}
      <input id="${escapeHtml(formId)}_website" class="hp-field" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">

      <div class="progress-track" aria-hidden="true">
        <span class="is-active" data-progress-step="1"></span>
        <span data-progress-step="2"></span>
        <span data-progress-step="3"></span>
      </div>

      <fieldset class="form-step is-active" data-step-panel="1">
        <legend>What type of property are you looking for?</legend>
        <div class="choice-grid">
          ${renderOptionCards({ name: "property_preference", items: project.form.propertyOptions, formId })}
        </div>
        <p class="field-error" data-step-error="1">Please choose a property type to continue.</p>
        <button class="btn btn-primary btn-full" type="button" data-next-step>${escapeHtml(project.cta)}</button>
        <p class="cta-microcopy">${escapeHtml(project.microcopy)}</p>
      </fieldset>

      <fieldset class="form-step" data-step-panel="2" hidden>
        <legend>When are you planning to purchase?</legend>
        <div class="choice-grid">
          ${renderOptionCards({ name: "purchase_timeframe", items: project.form.timeframeOptions, formId })}
        </div>
        <p class="field-error" data-step-error="2">Please choose a timeframe to continue.</p>
        <div class="form-actions">
          <button class="btn btn-secondary" type="button" data-prev-step>Back</button>
          <button class="btn btn-primary" type="button" data-next-step>${escapeHtml(project.cta)}</button>
        </div>
        <p class="cta-microcopy">${escapeHtml(project.microcopy)}</p>
      </fieldset>

      <fieldset class="form-step" data-step-panel="3" hidden>
        <legend>Where should we send the details?</legend>
        <div class="field" data-field="full_name">
          <label for="${escapeHtml(formId)}_full_name">Full name</label>
          <input id="${escapeHtml(formId)}_full_name" name="full_name" type="text" autocomplete="name" required>
          <p class="field-error">Please enter your full name.</p>
        </div>
        <div class="phone-row">
          ${renderCountryCodePicker(formId)}
          <div class="field" data-field="phone">
            <label for="${escapeHtml(formId)}_phone">Mobile or WhatsApp number</label>
            <input id="${escapeHtml(formId)}_phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" required>
            <p class="field-error">Please enter a valid mobile number.</p>
          </div>
        </div>
        <div class="field" data-field="email">
          <label for="${escapeHtml(formId)}_email">Email address</label>
          <input id="${escapeHtml(formId)}_email" name="email" type="email" inputmode="email" autocomplete="email" required>
          <p class="field-error">Please enter a valid email address.</p>
        </div>
        <div class="field" data-field="contact_method">
          <label for="${escapeHtml(formId)}_contact_method">Preferred contact method</label>
          <select id="${escapeHtml(formId)}_contact_method" name="contact_method" required>
            ${project.form.contactMethods.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}
          </select>
          <p class="field-error">Please choose a contact method.</p>
        </div>
        <label class="consent-row" data-field="consent">
          <input type="checkbox" name="consent" value="yes" required>
          <span>${escapeHtml(project.form.consent)} <a href="${escapeHtml(company.privacyUrl)}" target="_blank" rel="noopener">Privacy Policy</a></span>
        </label>
        <p class="field-error consent-error">Please confirm consent so we can respond to your inquiry.</p>
        <div class="form-actions">
          <button class="btn btn-secondary" type="button" data-prev-step>Back</button>
          <button class="btn btn-primary" type="submit">${escapeHtml(project.cta)}</button>
        </div>
        <p class="cta-microcopy">${escapeHtml(project.microcopy)}</p>
      </fieldset>

      <p class="form-status" data-form-status role="alert"></p>
    </form>
    ${renderSuccessState()}
  </section>`;

const renderShortForm = () => `
  <section class="form-card form-card-compact" aria-labelledby="shortLeadFormTitle">
    <div class="form-card-header">
      <span class="form-kicker">A/B short form</span>
      <h2 id="shortLeadFormTitle">Get Raw District prices and availability</h2>
      <p>Share the basics and an advisor will send the relevant options.</p>
    </div>
    <form id="shortLeadForm" class="lead-form short-form" novalidate data-lead-form data-form-type="short" data-form-variant="b">
      ${renderHiddenFields("b")}
      <input id="shortLeadForm_website" class="hp-field" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="field" data-field="full_name">
        <label for="shortLeadForm_full_name">Full name</label>
        <input id="shortLeadForm_full_name" name="full_name" type="text" autocomplete="name" required>
        <p class="field-error">Please enter your full name.</p>
      </div>
      <div class="phone-row">
        ${renderCountryCodePicker("shortLeadForm")}
        <div class="field" data-field="phone">
          <label for="shortLeadForm_phone">Mobile or WhatsApp number</label>
          <input id="shortLeadForm_phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" required>
          <p class="field-error">Please enter a valid mobile number.</p>
        </div>
      </div>
      <div class="field" data-field="email">
        <label for="shortLeadForm_email">Email address</label>
        <input id="shortLeadForm_email" name="email" type="email" inputmode="email" autocomplete="email" required>
        <p class="field-error">Please enter a valid email address.</p>
      </div>
      <div class="field" data-field="property_preference">
        <label for="shortLeadForm_property">Property preference</label>
        <select id="shortLeadForm_property" name="property_preference" required>
          <option value="">Select preference</option>
          ${project.form.shortPropertyOptions.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}
        </select>
        <p class="field-error">Please choose a property preference.</p>
      </div>
      <label class="consent-row" data-field="consent">
        <input type="checkbox" name="consent" value="yes" required>
        <span>${escapeHtml(project.form.consent)} <a href="${escapeHtml(company.privacyUrl)}" target="_blank" rel="noopener">Privacy Policy</a></span>
      </label>
      <p class="field-error consent-error">Please confirm consent so we can respond to your inquiry.</p>
      <button class="btn btn-primary btn-full" type="submit">${escapeHtml(project.cta)}</button>
      <p class="cta-microcopy">${escapeHtml(project.microcopy)}</p>
      <p class="form-status" data-form-status role="alert"></p>
    </form>
    ${renderSuccessState()}
  </section>`;

const renderSuccessState = () => `
  <div class="success-state" data-success-state hidden>
    <span class="success-icon">${icon("check")}</span>
    <h2>Your Request Has Been Received</h2>
    <p>We will send the relevant prices and availability using your preferred contact method.</p>
    <dl class="summary-list" data-success-summary></dl>
    <div class="next-steps">
      <a class="btn btn-secondary" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Raw%20District%20Viewing&details=Discuss%20Raw%20District%20prices%2C%20floor%20plans%20and%20availability" target="_blank" rel="noopener" data-book-viewing>${icon("calendar")} Add viewing to calendar</a>
      <a class="btn btn-secondary" href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp data-cta-location="thank_you">${icon("whatsapp")} Start WhatsApp conversation</a>
      <a class="btn btn-secondary" href="tel:${escapeHtml(company.phoneHref)}" data-call data-cta-location="thank_you">${icon("phone")} Call the property advisor</a>
    </div>
  </div>`;

const renderHeroA = () => `
  <section class="hero hero-a" aria-labelledby="heroTitleA">
    <div class="shell hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(project.hero.eyebrow)}</p>
        <h1 id="heroTitleA">${escapeHtml(project.hero.title)}</h1>
        <p class="hero-subtitle">${escapeHtml(project.hero.subtitle)}</p>
        <div class="chip-row">${renderChips()}</div>
        <ul class="proof-list">${renderProofPoints()}</ul>
        <div class="desktop-only cta-row">
          <a class="text-link" href="tel:${escapeHtml(company.phoneHref)}" data-call data-cta-location="hero_a_secondary">${icon("phone")} Call an Advisor</a>
          <a class="text-link" href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp data-cta-location="hero_a_secondary">${icon("whatsapp")} WhatsApp</a>
        </div>
      </div>
      <div class="hero-form-wrap">
        ${renderMultiStepForm({ formId: "campaignLeadForm", variant: "a" })}
      </div>
      <figure class="hero-media">
        ${renderPicture({ image: project.media.hero, className: "image-frame", loading: "eager", fetchPriority: "high", sizes: "(max-width: 700px) 100vw, 48vw" })}
        <figcaption>Raw District by IMTIAZ, Downtown Jebel Ali</figcaption>
      </figure>
    </div>
  </section>`;

const renderHeroB = () => `
  <section class="hero hero-b" aria-labelledby="heroTitleB">
    <div class="shell hero-grid hero-grid-alt">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(project.hero.eyebrow)}</p>
        <h1 id="heroTitleB">${escapeHtml(project.hero.title)}</h1>
        <p class="hero-subtitle">${escapeHtml(project.hero.subtitle)}</p>
        <div class="chip-row">${renderChips()}</div>
        <ul class="proof-list">${renderProofPoints()}</ul>
        <button class="btn btn-primary btn-large" type="button" data-open-lead-modal>${escapeHtml(project.cta)}</button>
        <p class="cta-microcopy">${escapeHtml(project.microcopy)}</p>
      </div>
      <figure class="hero-media hero-media-alt">
        ${renderPicture({ image: project.media.heroAlt, className: "image-frame", loading: "eager", fetchPriority: "high", sizes: "(max-width: 700px) 100vw, 52vw" })}
        <figcaption>Furnished residence preview</figcaption>
      </figure>
    </div>
  </section>`;

const renderTrustStrip = () => `
  <section class="trust-strip" aria-label="Campaign trust information">
    <div class="shell trust-grid">
      ${project.trustStrip
        .map(
          (item) => `<div>
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
      </div>`,
        )
        .join("")}
    </div>
  </section>`;

const renderBenefits = () => `
  <section class="section benefits-section">
    <div class="shell">
      <div class="section-heading">
        <p class="eyebrow">Key property benefits</p>
        <h2>Useful project facts before you speak with an advisor</h2>
      </div>
      <div class="benefit-grid">
        ${project.benefits
          .map(
            (item) => `<article class="benefit-card">
          <span class="card-icon">${icon(item.icon)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>`,
          )
          .join("")}
      </div>
    </div>
  </section>`;

const renderGallery = () => `
  <section class="section gallery-section" id="gallery">
    <div class="shell">
      <div class="section-heading section-heading-row">
        <div>
          <p class="eyebrow">Visual property proof</p>
          <h2>Project visuals without a heavy carousel</h2>
        </div>
        <button class="btn btn-secondary" type="button" data-open-gallery>View gallery</button>
      </div>
      <div class="gallery-grid">
        ${project.media.gallery
          .map(
            (item, index) => `<figure class="gallery-card${index === 0 ? " gallery-card-large" : ""}">
          ${renderPicture({ image: item, className: "gallery-picture", sizes: index === 0 ? "(max-width: 700px) 100vw, 48vw" : "(max-width: 700px) 50vw, 24vw" })}
          <figcaption>${escapeHtml(item.caption)}</figcaption>
        </figure>`,
          )
          .join("")}
        <figure class="gallery-card gallery-card-plan">
          <div class="request-info-card">
            <div>
              <span>${escapeHtml(project.media.floorPlanRequest.title)}</span>
              <small>${escapeHtml(project.media.floorPlanRequest.text)}</small>
            </div>
            <button class="btn btn-primary btn-floor-plan" type="button" data-open-lead-modal>${escapeHtml(project.cta)}</button>
          </div>
          <figcaption>Floor plans available by request</figcaption>
        </figure>
        <figure class="gallery-card">
          ${renderPicture({ image: project.media.videoThumb, className: "gallery-picture" })}
          <figcaption>Video tour thumbnail placeholder</figcaption>
        </figure>
      </div>
    </div>
  </section>`;

const renderLocation = () => `
  <section class="section location-section" id="location">
    <div class="shell location-grid">
      <figure class="map-preview">
        <div class="map-embed">
          <iframe
            title="${escapeHtml(project.location.title)} map"
            src="${escapeHtml(project.location.mapEmbedSrc)}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        </div>
        <figcaption>Google Maps preview. Use the button to open the exact Raw District pin.</figcaption>
      </figure>
      <div class="location-copy">
        <p class="eyebrow">Location and accessibility</p>
        <h2>${escapeHtml(project.location.title)}</h2>
        <p>${escapeHtml(project.location.text)}</p>
        <ul class="landmark-list">
          ${project.location.landmarks.map((item) => `<li>${icon("check")}<span>${escapeHtml(item)}</span></li>`).join("")}
        </ul>
        <a class="btn btn-secondary" href="${escapeHtml(project.location.mapHref)}" target="_blank" rel="noopener">${escapeHtml(project.location.mapCta || "View on Map")}</a>
      </div>
    </div>
  </section>`;

const renderAdvisorPhoto = () => {
  if (project.advisor.photo?.src) {
    return `<figure class="advisor-photo advisor-photo-image">
          ${renderPicture({ image: project.advisor.photo, className: "advisor-picture", sizes: "(max-width: 700px) 220px, 210px" })}
        </figure>`;
  }

  const placeholder = project.advisor.photoPlaceholder || "Advisor photo required, 1:1 ratio";
  return `<div class="advisor-photo" role="img" aria-label="${escapeHtml(placeholder)}">
          <span>${escapeHtml(placeholder)}</span>
        </div>`;
};

const renderHumanTrust = () => `
  <section class="section human-trust">
    <div class="shell human-grid">
      <article class="advisor-card">
        ${renderAdvisorPhoto()}
        <div>
          <p class="eyebrow">Local advisor</p>
          <h2>${escapeHtml(project.advisor.name)}</h2>
          <p>${escapeHtml(project.advisor.role)}</p>
          <dl class="advisor-details">
            <div><dt>Licence</dt><dd>${escapeHtml(project.advisor.licence)}</dd></div>
            <div><dt>Languages</dt><dd>${escapeHtml(project.advisor.languages)}</dd></div>
          </dl>
          <p>${escapeHtml(project.advisor.statement)}</p>
          <div class="cta-row">
            <a class="btn btn-secondary" href="tel:${escapeHtml(company.phoneHref)}" data-call data-cta-location="advisor">${icon("phone")} Call</a>
            <a class="btn btn-secondary" href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp data-cta-location="advisor">${icon("whatsapp")} WhatsApp</a>
          </div>
        </div>
      </article>
      <article class="testimonial-card">
        <p class="eyebrow">${escapeHtml(project.testimonial.label)}</p>
        <blockquote>${escapeHtml(project.testimonial.text)}</blockquote>
        <cite>${escapeHtml(project.testimonial.attribution)}</cite>
      </article>
    </div>
  </section>`;

const renderFaq = () => `
  <section class="section faq-section">
    <div class="shell faq-wrap">
      <div class="section-heading">
        <p class="eyebrow">FAQ</p>
        <h2>Quick answers before you request availability</h2>
      </div>
      <div class="faq-list">
        ${project.faq
          .map(
            (item) => `<details>
          <summary>${escapeHtml(item.question)}</summary>
          <p>${escapeHtml(item.answer)}</p>
        </details>`,
          )
          .join("")}
      </div>
    </div>
  </section>`;

const renderFinalCta = () => `
  <section class="section final-cta">
    <div class="shell final-cta-panel">
      <div>
        <p class="eyebrow">Get Current Prices, Floor Plans and Availability</p>
        <h2>Tell us what you are looking for and a property advisor will provide the relevant options.</h2>
      </div>
      <div class="final-actions">
        <button class="btn btn-primary" type="button" data-open-lead-modal>${escapeHtml(project.cta)}</button>
        <a class="text-link" href="tel:${escapeHtml(company.phoneHref)}" data-call data-cta-location="final">${icon("phone")} Call</a>
        <a class="text-link" href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp data-cta-location="final">${icon("whatsapp")} WhatsApp</a>
      </div>
    </div>
  </section>`;

const renderFooter = () => `
  <footer class="site-footer">
    <div class="shell footer-grid">
      <div>
        <strong>${escapeHtml(company.legalName)}</strong>
        <p>${escapeHtml(company.office)}</p>
      </div>
      <div>
        <strong>Licence</strong>
        <p>${escapeHtml(project.compliance.licence)}<br>${escapeHtml(project.compliance.rera)}<br>${escapeHtml(project.compliance.permitLabel)}: ${escapeHtml(project.compliance.permitValue)}</p>
      </div>
      <div>
        <strong>Contact</strong>
        <p><a href="tel:${escapeHtml(company.phoneHref)}">${escapeHtml(company.phoneDisplay)}</a><br><a href="mailto:${escapeHtml(company.email)}">${escapeHtml(company.email)}</a></p>
      </div>
      <div>
        <strong>Legal</strong>
        <p><a href="${escapeHtml(company.privacyUrl)}">Privacy Policy</a><br><a href="${escapeHtml(company.termsUrl)}">Terms</a></p>
      </div>
    </div>
    <div class="shell footer-bottom">
      <p>Equal, transparent enquiry process. Pricing, availability, payment plans and handover dates are subject to developer confirmation.</p>
      <p>&copy; 2026 ${escapeHtml(company.legalName)}</p>
    </div>
  </footer>`;

const renderLeadModal = () => `
  <div class="lead-modal" data-lead-modal hidden aria-hidden="true">
    <div class="modal-backdrop" data-close-lead-modal></div>
    <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="leadModalTitle">
      <button class="modal-close" type="button" data-close-lead-modal aria-label="Close form">Close</button>
      ${renderShortForm()}
    </div>
  </div>`;

const renderGalleryModal = () => `
  <div class="gallery-modal" data-gallery-modal hidden aria-hidden="true">
    <div class="modal-backdrop" data-close-gallery></div>
    <div class="gallery-modal-panel" role="dialog" aria-modal="true" aria-labelledby="galleryModalTitle">
      <button class="modal-close" type="button" data-close-gallery aria-label="Close gallery">Close</button>
      <h2 id="galleryModalTitle">Raw District visual gallery</h2>
      <div class="gallery-modal-grid">
        ${project.media.gallery
          .map(
            (item) => `<figure>
          ${renderPicture({ image: item, className: "gallery-picture" })}
          <figcaption>${escapeHtml(item.caption)}</figcaption>
        </figure>`,
          )
          .join("")}
      </div>
    </div>
  </div>`;

const renderMobileBar = () => `
  <nav class="mobile-action-bar" aria-label="Mobile contact actions">
    <a href="tel:${escapeHtml(company.phoneHref)}" data-call data-cta-location="mobile_bar">${icon("phone")} Call</a>
    <button type="button" data-open-lead-modal>${escapeHtml(project.cta)}</button>
    <a href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp data-cta-location="mobile_bar">${icon("whatsapp")} WhatsApp</a>
  </nav>`;

const renderPermitQrIcon = () => {
  const permitQr = project.compliance?.permitQr;
  if (!permitQr?.src) return "";
  return `<div class="permit-qr-badge" aria-label="Raw District permit QR code">
    <img src="${escapeHtml(withVersion(permitQr.src))}" alt="${escapeHtml(permitQr.alt || "Permit QR code")}" loading="lazy" decoding="async">
    <span>Permit QR</span>
  </div>`;
};

const renderPage = ({ variant = "a", canonical = project.landingPageUrl } = {}) => `<!doctype html>
<html lang="en">
<head>
${renderHead({ canonical })}
</head>
<body class="${variant === "b" ? "variant-b" : "variant-a"}" data-default-variant="${escapeHtml(variant)}">
  ${renderGtmBody(project.tracking, escapeHtml)}
  ${renderHeader()}
  <main>
    ${renderHeroA()}
    ${renderHeroB()}
    ${renderTrustStrip()}
    ${renderBenefits()}
    ${renderGallery()}
    ${renderLocation()}
    ${renderHumanTrust()}
    ${renderFaq()}
    ${renderFinalCta()}
  </main>
  ${renderFooter()}
  ${renderLeadModal()}
  ${renderGalleryModal()}
  ${renderPermitQrIcon()}
  ${renderMobileBar()}
  <script>
    window.OAKLYN_LANDING_CONFIG = ${json({
      project_name: project.name,
      project_slug: project.slug,
      source_page: project.sourcePage,
      landing_page_url: project.landingPageUrl,
      thank_you_page_url: project.thankYouPageUrl,
      property_link: project.landingPageUrl,
      general_whatsapp_link: getWhatsAppHref(),
      language: "en",
      webhook_url: project.webhookUrl,
      cta: project.cta,
      default_variant: variant
    })};
  </script>
  <script src="/client.js?v=${escapeHtml(project.assetVersion)}" defer></script>
</body>
</html>`;

const renderThankYouPage = () => {
  const canonical = absoluteUrl("thank-you/");
  return `<!doctype html>
<html lang="en">
<head>
${renderHead({
  canonical,
  title: "Your Request Has Been Received | Raw District",
  description: "Oaklyn Realty has received your Raw District prices and availability request."
})}
</head>
<body class="thank-you-page">
  ${renderGtmBody(project.tracking, escapeHtml)}
  ${renderHeader()}
  <main class="thank-you-main">
    <section class="shell thank-you-panel">
      <span class="success-icon">${icon("check")}</span>
      <p class="eyebrow">Your Request Has Been Received</p>
      <h1>Your Request Has Been Received</h1>
      <p>We will send the relevant prices and availability using your preferred contact method.</p>
      <div class="next-steps">
        <a class="btn btn-secondary" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Raw%20District%20Viewing&details=Discuss%20Raw%20District%20prices%2C%20floor%20plans%20and%20availability" target="_blank" rel="noopener" data-book-viewing>${icon("calendar")} Add viewing to calendar</a>
        <a class="btn btn-secondary" href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp data-cta-location="thank_you_page">${icon("whatsapp")} Start WhatsApp conversation</a>
        <a class="btn btn-secondary" href="tel:${escapeHtml(company.phoneHref)}" data-call data-cta-location="thank_you_page">${icon("phone")} Call the property advisor</a>
      </div>
    </section>
  </main>
  ${renderFooter()}
  ${renderPermitQrIcon()}
  <script>
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "landing_page_view", page_type: "thank_you", project_slug: "${escapeHtml(project.slug)}" });
  </script>
  <script src="/client.js?v=${escapeHtml(project.assetVersion)}" defer></script>
</body>
</html>`;
};

const writeHtml = async (relativePath, html) => {
  const target = path.join(distDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
};

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(path.join(rootDir, "assets"), path.join(distDir, "assets"), { recursive: true });
await cp(path.join(rootDir, "src", "styles.css"), path.join(distDir, "styles.css"));
await cp(path.join(rootDir, "src", "client.js"), path.join(distDir, "client.js"));

await writeHtml("index.html", renderPage({ variant: "a", canonical: project.landingPageUrl }));
await writeHtml(`${trimSlashes(project.routePath)}/index.html`, renderPage({ variant: "a", canonical: absoluteUrl(project.routePath) }));
await writeHtml(`${trimSlashes(project.variantBPath)}/index.html`, renderPage({ variant: "b", canonical: absoluteUrl(project.variantBPath) }));
await writeHtml("thank-you/index.html", renderThankYouPage());

console.log(`Built ${project.name} campaign landing page.`);
