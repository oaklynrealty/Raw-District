import { cp, mkdir, rm, writeFile, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { project as landingProject } from "../src/project-data.mjs";
import { renderGtmBody, renderGtmHead } from "../shared/gtm.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

let project = landingProject;
let company = project.brand;

const setProject = (nextProject) => {
  project = nextProject;
  company = project.brand;
};

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

const getWhatsAppHref = () => {
  const phone = digitsOnly(company.whatsappHref || company.phoneHref);
  const message = project.whatsappPrefill || `Hello, I would like more information about ${project.name}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const getClientConfig = () => ({
  project_name: project.name,
  project_slug: project.slug,
  source_page: project.sourcePage,
  landing_page_url: project.landingPageUrl,
  thank_you_page_url: project.thankYouPageUrl,
  webhook_url: project.webhookUrl,
  whatsapp_webhook_url: project.whatsappWebhookUrl || "",
  blacklist_check_url: project.blacklistCheckUrl || "",
  blacklist_timeout_ms: Number(project.blacklistTimeoutMs) || 8000,
  blacklist_block_message: project.form.blacklistBlockedMessage || "Thank you. Your inquiry has already been received.",
  blacklist_error_message: project.form.blacklistErrorMessage || "Something went wrong. Please try again.",
  split_name: Boolean(project.form.splitName),
});

const renderWhatsAppLink = ({ className = "", label = "WhatsApp", location = "default", iconOnly = false } = {}) =>
  `<a class="${escapeHtml(className)}" href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp-cta data-cta-location="${escapeHtml(location)}" data-whatsapp-destination="${escapeHtml(getWhatsAppHref())}"${iconOnly ? ` aria-label="${escapeHtml(label)}"` : ""}>${
    iconOnly
      ? `<i class="bx bxl-whatsapp" aria-hidden="true"></i>`
      : escapeHtml(label)
  }</a>`;

const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": "https://oaklynrealty.ae/#organization",
  name: company.legalName,
  alternateName: company.company,
  url: company.mainWebsite,
  logo: company.logo,
  image: company.logo,
  telephone: company.phoneHref,
  email: company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.office,
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  identifier: [
    { "@type": "PropertyValue", propertyID: "DED Licence", value: "1589593" },
    { "@type": "PropertyValue", propertyID: "RERA ORN", value: "59210" },
  ],
});

const getWebpageSchema = (canonical) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  url: canonical,
  name: project.seo.title,
  description: project.seo.description,
  inLanguage: "en",
  about: { "@id": "https://oaklynrealty.ae/#organization" },
  publisher: { "@id": "https://oaklynrealty.ae/#organization" },
});

const getListingSchema = (canonical) => {
  const listing = project.listing || {};
  const permit = project.compliance?.permit;
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    url: canonical,
    name: project.name,
    description: project.seo.description,
    brokerage: { "@id": "https://oaklynrealty.ae/#organization" },
    broker: { "@id": "https://oaklynrealty.ae/#organization" },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.addressLocality || "Dubai",
      addressRegion: listing.addressRegion || listing.addressLocality || "Dubai",
      addressCountry: listing.addressCountry || "AE",
    },
    regulator: {
      "@type": "GovernmentOrganization",
      name: listing.regulator || "Dubai Land Department",
    },
  };

  if (listing.developer) {
    schema.developer = {
      "@type": "Organization",
      name: listing.developer,
    };
  }

  if (permit?.value) {
    schema.identifier = [
      {
        "@type": "PropertyValue",
        propertyID: permit.propertyID || "Advertising Permit",
        value: permit.value,
      },
    ];
  }

  return schema;
};

const renderHead = ({ title, description, canonical, noindex = false }) => `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${noindex ? '<meta name="robots" content="noindex, nofollow">' : ""}
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
  ${renderGtmHead(project.tracking, escapeHtml)}
  ${renderJsonLd(getOrganizationSchema())}
  ${renderJsonLd(getWebpageSchema(canonical))}
  ${renderJsonLd(getListingSchema(canonical))}
  <link rel="stylesheet" href="/styles.css?v=${escapeHtml(project.assetVersion)}">`;

const renderNav = () => `
  <header class="topbar">
    <div class="shell nav">
      <a class="brand" href="/" aria-label="${escapeHtml(company.company)} ${escapeHtml(project.name)} landing page">
        <img src="${escapeHtml(company.logo)}" alt="${escapeHtml(company.company)}">
        <span>${escapeHtml(project.name)}</span>
      </a>
      <nav class="nav-links" aria-label="Primary navigation">
        <a href="#overview">Overview</a>
        <a href="#gallery">Gallery</a>
        <a href="#location">Location</a>
        <a href="#contact">Contact</a>
        <a href="${escapeHtml(company.mainWebsite)}">Oaklyn Website</a>
      </nav>
      <div class="nav-actions">
        <a class="nav-phone" href="tel:${escapeHtml(company.phoneHref)}">${escapeHtml(company.phoneDisplay)}</a>
        <a class="btn btn-primary" href="#contact">Request Details</a>
      </div>
      <button class="mobile-menu-button" type="button" aria-label="Open menu" aria-expanded="false" data-mobile-menu-button>Menu</button>
    </div>
    <nav class="mobile-menu" aria-label="Mobile navigation" data-mobile-menu>
      <a href="#overview">Overview</a>
      <a href="#gallery">Gallery</a>
      <a href="#location">Location</a>
      <a href="#contact">Contact</a>
      <a href="${escapeHtml(company.mainWebsite)}">Oaklyn Website</a>
    </nav>
  </header>`;

const renderFooter = () => `
  <footer class="section">
    <div class="shell footer-panel">
      <div class="footer-grid">
        <div>
          <strong>${escapeHtml(company.company)}</strong>
          <p>Oaklyn Realty is a Dubai real estate brokerage helping you review project details, availability, and enquiry next steps with clear communication.</p>
        </div>
        <div>
          <strong>Contact</strong>
          <p>${escapeHtml(company.office)}</p>
          <p><a href="tel:${escapeHtml(company.phoneHref)}">${escapeHtml(company.phoneDisplay)}</a><br>${renderWhatsAppLink({ label: company.whatsappDisplay || company.phoneDisplay, location: "footer_contact" })}<br><a href="mailto:${escapeHtml(company.email)}">${escapeHtml(company.email)}</a></p>
        </div>
        <div>
          <strong>Legal</strong>
          <div class="footer-links">
            <a href="${escapeHtml(company.contactUrl)}">Contact</a>
            <a href="${escapeHtml(company.privacyUrl)}">Privacy Policy</a>
            <a href="${escapeHtml(company.termsUrl)}">Terms & Conditions</a>
          </div>
        </div>
      </div>
      <p class="copyright">Oaklyn Real Estate L.L.C. — DED Licence 1589593 · RERA ORN 59210. Regulated by Dubai DET and Dubai Land Department.</p>
    </div>
  </footer>`;

const renderWhatsAppFloat = () => `<div class="whatsapp-float-wrap">
    ${renderWhatsAppLink({ className: "whatsapp-float", label: "Chat on WhatsApp", location: "floating_icon", iconOnly: true })}
  </div>`;

const renderWhatsAppModal = () => `
  <div class="whatsapp-modal" data-whatsapp-modal hidden aria-hidden="true">
    <div class="whatsapp-modal-backdrop" data-whatsapp-modal-close></div>
    <section class="whatsapp-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="whatsappModalTitle">
      <button class="whatsapp-modal-close" type="button" data-whatsapp-modal-close>Close</button>
      <span class="eyebrow">Quick Verification</span>
      <h3 id="whatsappModalTitle">Continue to WhatsApp</h3>
      <p class="section-copy">Enter your number for a quick verification before we open WhatsApp.</p>
      <div class="phone-input-row whatsapp-modal-phone-row">
        <div class="field">
          <label for="whatsappModalCountryCode">Country Code</label>
          <input id="whatsappModalCountryCode" type="text" inputmode="tel" autocomplete="tel-country-code" value="+971" placeholder="+971">
        </div>
        <div class="field" id="whatsappModalPhoneField">
          <label for="whatsappModalPhone">WhatsApp Number</label>
          <input id="whatsappModalPhone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="50 123 4567">
          <div class="field-error">Please enter a valid phone number to continue.</div>
        </div>
      </div>
      <p class="whatsapp-modal-note">We use this step to filter duplicate and blocked numbers before WhatsApp opens.</p>
      <div id="whatsappModalError" class="form-error">We could not continue to WhatsApp right now. Please try again.</div>
      <div id="whatsappModalBlocked" class="form-success">
        <h3>Thank you</h3>
        <p class="section-copy">${escapeHtml(project.form.blacklistBlockedMessage || "Thank you. Your inquiry has already been received.")}</p>
      </div>
      <div class="whatsapp-modal-actions">
        <button class="btn btn-primary" type="button" id="whatsappModalContinue">Continue to WhatsApp</button>
        <button class="btn btn-ghost" type="button" data-whatsapp-modal-close>Cancel</button>
      </div>
    </section>
  </div>`;

const renderHighlights = () =>
  project.highlights
    .map(
      (item) => `
          <article class="highlight-card">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </article>`,
    )
    .join("");

const renderHeroVisual = () => {
  const slides = project.heroSlides?.length ? project.heroSlides : [{ image: project.hero.background, label: project.hero.title }];
  if (slides.length === 1) {
    return `<div class="hero-bg" style="background-image: url('${escapeHtml(slides[0].image)}');"></div>`;
  }
  return `<div class="hero-slider" data-hero-slider>
        ${slides
          .map(
            (slide, index) =>
              `<div class="hero-bg hero-slide${index === 0 ? " is-active" : ""}" style="background-image: url('${escapeHtml(slide.image)}');" aria-label="${escapeHtml(slide.label)}"></div>`,
          )
          .join("\n        ")}
      </div>`;
};

const renderGallerySlides = () =>
  project.gallery.items
    .map(
      (item) => `
            <article class="gallery-slide" data-gallery-slide>
              <div class="gallery-image" style="background-image: url('${escapeHtml(item.image)}');">
                <div class="gallery-caption">
                  <span>${escapeHtml(item.eyebrow)}</span>
                  <strong>${escapeHtml(item.title)}</strong>
                </div>
              </div>
            </article>`,
    )
    .join("");

const renderGalleryDots = () =>
  project.gallery.items
    .map(
      (_, index) => `
          <button class="gallery-dot${index === 0 ? " is-active" : ""}" type="button" aria-label="Go to gallery image ${index + 1}" aria-pressed="${index === 0 ? "true" : "false"}" data-gallery-dot></button>`,
    )
    .join("");

const renderSnapshotItems = () =>
  project.snapshot.items
    .map(
      (item) => `
          <article class="why-card">
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.text)}</p>
          </article>`,
    )
    .join("");

const renderLocationBullets = () =>
  project.location.bullets
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

const renderComplianceCards = () =>
  project.trustPoints
    .map(
      (item) => `
          <article class="compliance-card">
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.text)}</p>
          </article>`,
    )
    .join("");

const renderPermitNote = () => {
  const permit = project.compliance?.permit;
  if (!permit?.value) return "";
  return `<p class="permit-note">${escapeHtml(permit.label || "Permit No.")} ${escapeHtml(permit.value)} — ${escapeHtml(permit.authority || "Issued by the relevant regulator")}</p>`;
};

const renderFaq = () => {
  if (!project.faq?.length) return "";
  return `<section class="section faq-section">
      <div class="shell">
        <div class="section-kicker">
          <span class="eyebrow">FAQ</span>
          <h2 class="section-title">Quick answers</h2>
        </div>
        <div class="faq-grid">
          ${project.faq
            .map(
              (item) => `<article class="faq-card">
            <strong>${escapeHtml(item.question)}</strong>
            <p>${escapeHtml(item.answer)}</p>
          </article>`,
            )
            .join("")}
        </div>
      </div>
    </section>`;
};

const renderOptions = (items) =>
  items.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");

const getDefaultPhoneCountry = () =>
  project.form.phoneCountries?.[0] || { flag: "🇦🇪", label: "United Arab Emirates", dialCode: "+971" };

const renderPhoneCountryPicker = () => {
  const defaultCountry = getDefaultPhoneCountry();

  return `<div class="country-picker" data-country-picker>
      <input id="landing_phone_country" name="phone_country_code" type="hidden" value="${escapeHtml(defaultCountry.dialCode)}">
      <button
        class="country-picker-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="false"
        data-country-picker-trigger
      >
        <span class="country-picker-current">
          <span class="country-picker-flag" data-country-picker-flag>${escapeHtml(defaultCountry.flag)}</span>
          <span class="country-picker-label" data-country-picker-label>${escapeHtml(defaultCountry.label)}</span>
          <span class="country-picker-code" data-country-picker-code>${escapeHtml(defaultCountry.dialCode)}</span>
        </span>
        <span class="country-picker-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="country-picker-panel" data-country-picker-panel hidden>
        <label class="sr-only" for="landing_phone_country_search">Search country or code</label>
        <input
          id="landing_phone_country_search"
          class="country-picker-search"
          type="search"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          enterkeyhint="search"
          placeholder="Type exact code or country"
          data-country-picker-search
        >
        <div class="country-picker-list" role="listbox" data-country-picker-list>
          ${project.form.phoneCountries
            .map(
              (item, index) => `<button
              class="country-picker-option${index === 0 ? " is-selected" : ""}"
              type="button"
              role="option"
              aria-selected="${index === 0 ? "true" : "false"}"
              data-country-option
              data-country-flag="${escapeHtml(item.flag)}"
              data-country-label="${escapeHtml(item.label)}"
              data-country-code="${escapeHtml(item.dialCode)}"
              data-country-query="${escapeHtml(`${item.label} ${item.dialCode}`.toLowerCase())}"
            >
              <span class="country-picker-option-flag">${escapeHtml(item.flag)}</span>
              <span class="country-picker-option-label">${escapeHtml(item.label)}</span>
              <span class="country-picker-option-code">${escapeHtml(item.dialCode)}</span>
            </button>`,
            )
            .join("")}
        </div>
        <p class="country-picker-empty" data-country-picker-empty hidden>No country found.</p>
      </div>
    </div>`;
};

const getFormLabels = () => ({
  name: "Full Name",
  firstName: "First Name",
  lastName: "Last Name",
  phone: "Phone",
  email: "Email",
  project: "Preferred Project",
  propertyType: "Property Type",
  ...(project.form.labels || {}),
});

const renderNameFields = (formLabels) => {
  if (!project.form.splitName) {
    return `<div class="field" id="nameField">
                <label for="landing_full_name">${escapeHtml(formLabels.name)}</label>
                <input id="landing_full_name" name="full_name" type="text" autocomplete="name" required>
                <div class="field-error">Please enter your name.</div>
              </div>`;
  }

  return `<div class="field" id="firstNameField">
                <label for="landing_first_name">${escapeHtml(formLabels.firstName)}</label>
                <input id="landing_first_name" name="first_name" type="text" autocomplete="given-name" required>
                <div class="field-error">Please enter your first name.</div>
              </div>
              <div class="field" id="lastNameField">
                <label for="landing_last_name">${escapeHtml(formLabels.lastName)}</label>
                <input id="landing_last_name" name="last_name" type="text" autocomplete="family-name" required>
                <div class="field-error">Please enter your last name.</div>
              </div>`;
};

const renderAbout = () => {
  if (!project.about) return "";
  return `<section class="section about-community">
      <div class="shell about-panel">
        <span class="eyebrow">${escapeHtml(project.about.eyebrow)}</span>
        <h2 class="section-title">${escapeHtml(project.about.title)}</h2>
        <p class="section-copy">${escapeHtml(project.about.text)}</p>
      </div>
    </section>`;
};

const renderLandingPage = (nextProject) => {
  setProject(nextProject);
  const formLabels = getFormLabels();
  return `<!doctype html>
<html lang="en">
<head>
${renderHead({
  title: project.seo.title,
  description: project.seo.description,
  canonical: project.landingPageUrl,
})}
  <script>window.OAKLYN_LANDING_CONFIG = ${json(getClientConfig())};</script>
</head>
<body>
${renderGtmBody(project.tracking, escapeHtml)}
${renderNav()}
  <main>
    <section class="hero">
      ${renderHeroVisual()}
      <div class="hero-shade"></div>
      <div class="shell hero-content">
        <span class="eyebrow">${escapeHtml(project.hero.eyebrow)}</span>
        <h1>${escapeHtml(project.hero.title)}</h1>
        <p>${escapeHtml(project.hero.subtitle)}</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="#contact">${escapeHtml(project.hero.primaryCta)}</a>
          <a class="btn btn-ghost" href="#contact">${escapeHtml(project.hero.secondaryCta)}</a>
        </div>
      </div>
    </section>

    <section class="section quick-highlights" id="overview">
      <div class="shell">
        <div class="section-kicker">
          <span class="eyebrow">Quick Investment Highlights</span>
          <h2 class="section-title">Project facts at a glance</h2>
        </div>
        <div class="highlight-grid">
          ${renderHighlights()}
        </div>
      </div>
    </section>

    ${renderAbout()}

    <section class="section gallery-section" id="gallery">
      <div class="shell">
        <div class="gallery-header section-kicker">
          <span class="eyebrow">${escapeHtml(project.gallery.eyebrow)}</span>
          <h2 class="section-title">${escapeHtml(project.gallery.title)}</h2>
          <p class="section-copy">${escapeHtml(project.gallery.text)}</p>
        </div>
        <div class="gallery glass-card" data-gallery>
          <div class="gallery-track" data-gallery-track>
            ${renderGallerySlides()}
          </div>
        </div>
        <div class="gallery-controls">
          <div class="gallery-dots">${renderGalleryDots()}</div>
          <div class="gallery-arrows">
            <button class="gallery-arrow" type="button" aria-label="Previous gallery image" data-gallery-prev>←</button>
            <button class="gallery-arrow" type="button" aria-label="Next gallery image" data-gallery-next>→</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section why-section">
      <div class="shell">
        <div class="section-kicker">
          <span class="eyebrow">${escapeHtml(project.snapshot.eyebrow)}</span>
          <h2 class="section-title">${escapeHtml(project.snapshot.title)}</h2>
        </div>
        <div class="why-grid">${renderSnapshotItems()}</div>
      </div>
    </section>

    <section class="section" id="location">
      <div class="shell location-panel">
        <div>
          <span class="eyebrow">${escapeHtml(project.location.eyebrow)}</span>
          <h2 class="section-title">${escapeHtml(project.location.title)}</h2>
        </div>
        <ul class="location-list">
          ${renderLocationBullets()}
        </ul>
      </div>
    </section>

    <section class="section" id="contact">
      <div class="shell contact-layout">
        <div class="form-intro compact-intro">
          <span class="eyebrow">Request Information</span>
          <h2 class="section-title">${escapeHtml(project.form.title)}</h2>
          <p class="section-copy">${escapeHtml(project.form.text)}</p>
          <div class="mini-compliance">
            <span>Basic enquiry details only</span>
            <span>Subject to developer confirmation</span>
            <span>No guaranteed investment returns</span>
          </div>
        </div>
        <div class="form-panel">
          <form id="landingLeadForm" novalidate>
            <div class="field-grid">
              ${renderNameFields(formLabels)}
              <div class="field is-phone" id="phoneField">
                <label for="landing_phone">${escapeHtml(formLabels.phone)}</label>
                <div class="phone-input-row">
                  ${renderPhoneCountryPicker()}
                  <input id="landing_phone" name="phone" type="tel" inputmode="tel" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="20" placeholder="050 123 4567" required>
                </div>
                <div class="field-error">Please enter a valid international phone number.</div>
              </div>
              <div class="field" id="emailField">
                <label for="landing_email">${escapeHtml(formLabels.email)}</label>
                <input id="landing_email" name="email" type="email" autocomplete="email" required>
                <div class="field-error">Please enter a valid email address.</div>
              </div>
              <div class="field" id="projectField">
                <label for="landing_preferred_project">${escapeHtml(formLabels.project)}</label>
                <select id="landing_preferred_project" name="preferred_project" required>${renderOptions(project.form.preferredProjects)}</select>
                <div class="field-error">Please select an option.</div>
              </div>
              <div class="field" id="propertyTypeField">
                <label for="landing_property_type">${escapeHtml(formLabels.propertyType)}</label>
                <select id="landing_property_type" name="property_type" required>${renderOptions(project.form.propertyTypes)}</select>
                <div class="field-error">Please select an enquiry type.</div>
              </div>
            </div>
            <input id="landing_gclid" name="gclid" type="hidden">
            <input id="landing_gbraid" name="gbraid" type="hidden">
            <input id="landing_wbraid" name="wbraid" type="hidden">
            <input id="landing_lead_id" name="lead_id" type="hidden">
            <input id="landing_website" class="hidden-field" name="landing_website" type="text" tabindex="-1" autocomplete="off">
            <p class="disclaimer">${escapeHtml(project.form.consent)}</p>
            <p class="disclaimer">${escapeHtml(project.form.sensitiveDataNotice)}</p>
            <p class="disclaimer">${escapeHtml(project.form.disclaimer)}</p>
            <button id="landingSubmitBtn" class="btn btn-primary" type="submit">Request Project Information</button>
            <div id="landingFormError" class="form-error">We could not submit your enquiry. Please try again or contact Oaklyn Realty directly.</div>
          </form>
          <div id="landingSuccess" class="form-success">
            <h3>Thank you</h3>
            <p class="section-copy">Your enquiry has been received. Oaklyn Realty will contact you regarding ${escapeHtml(project.name)}.</p>
          </div>
        </div>
      </div>
    </section>

    ${renderFaq()}

    <section class="section trust-compliance">
      <div class="shell">
        <div class="section-kicker">
          <span class="eyebrow">Trust & Compliance</span>
          <h2 class="section-title">Clear, compliant enquiry process</h2>
        </div>
        <div class="compliance-grid">${renderComplianceCards()}</div>
        ${renderPermitNote()}
      </div>
    </section>
  </main>
  ${renderFooter()}
  ${renderWhatsAppFloat()}
  ${renderWhatsAppModal()}
  <div class="mobile-contact-bar">
    <a href="tel:${escapeHtml(company.phoneHref)}">Call</a>
    ${renderWhatsAppLink({ label: "WhatsApp", location: "mobile_contact_bar" })}
  </div>
  <script src="/client.js?v=${escapeHtml(project.assetVersion)}" defer></script>
</body>
</html>`;
};

const renderThankYouTracking = () => `<script>
(function () {
  var params = new URLSearchParams(window.location.search);
  var leadId = params.get('lead_id') || '';
  var eventId = leadId || (${JSON.stringify(project.slug)} + '_thank_you_' + Date.now());
  var trackingPayload = {
    project_name: ${JSON.stringify(project.name)},
    project_slug: ${JSON.stringify(project.slug)},
    source_page: ${JSON.stringify(project.sourcePage)},
    landing_page_url: ${JSON.stringify(project.landingPageUrl)},
    thank_you_page_url: ${JSON.stringify(project.thankYouPageUrl)},
    lead_id: leadId,
    event_id: eventId,
    gclid: params.get('gclid') || '',
    gbraid: params.get('gbraid') || '',
    wbraid: params.get('wbraid') || '',
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || ''
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: 'lead_thank_you_page_view' }, trackingPayload));
  window.dataLayer.push(Object.assign({ event: 'lead_conversion_thank_you' }, trackingPayload));
})();
</script>`;

const renderThankYouPage = ({ currentProject, canonical, backHref }) => {
  setProject(currentProject);
  return `<!doctype html>
<html lang="en">
<head>
${renderHead({
  title: `Thank You | ${project.name} | ${company.company}`,
  description: "Your Oaklyn Realty property enquiry has been received.",
  canonical,
  noindex: true,
})}
</head>
<body>
${renderGtmBody(project.tracking, escapeHtml)}
${renderNav()}
  <main class="section">
    <div class="shell">
      <section class="form-panel">
        <span class="eyebrow">Enquiry Received</span>
        <h1>Thank you. Our property consultant will contact you shortly.</h1>
        <p class="section-copy">Oaklyn Realty has received your enquiry for ${escapeHtml(project.name)}. We will not ask for sensitive personal information through this form.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="${escapeHtml(backHref)}">Back to Project</a>
          <a class="btn btn-ghost" href="${escapeHtml(company.contactUrl)}">Contact Oaklyn</a>
        </div>
      </section>
    </div>
  </main>
  ${renderFooter()}
  ${renderThankYouTracking()}
</body>
</html>`;
};

const writeGeneratedFile = async (relativePath, contents) => {
  const target = path.join(distDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
};

const copyRequiredAssets = async () => {
  const source = path.join(rootDir, "assets");
  const target = path.join(distDir, "assets");

  try {
    const sourceStat = await stat(source);
    if (!sourceStat.isDirectory()) {
      throw new Error("assets exists but is not a directory");
    }
  } catch (error) {
    return;
  }

  await cp(source, target, { recursive: true });
};

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await writeGeneratedFile("index.html", renderLandingPage(landingProject));

const routePath = trimSlashes(landingProject.routePath);
if (routePath) {
  await writeGeneratedFile(`${routePath}/index.html`, renderLandingPage(landingProject));
}

await writeGeneratedFile(
  "thank-you/index.html",
  renderThankYouPage({ currentProject: landingProject, canonical: landingProject.thankYouPageUrl, backHref: routePath ? `/${routePath}/` : "/" }),
);

const alternateThankYouPath = trimSlashes(landingProject.alternateThankYouPath);
if (alternateThankYouPath && alternateThankYouPath !== "thank-you") {
  await writeGeneratedFile(
    `${alternateThankYouPath}/index.html`,
    renderThankYouPage({
      currentProject: landingProject,
      canonical: `${landingProject.landingPageUrl.replace(/\/$/, "")}/${alternateThankYouPath}`,
      backHref: routePath ? `/${routePath}/` : "/",
    }),
  );
}

await copyFile(path.join(rootDir, "src", "styles.css"), path.join(distDir, "styles.css"));
await copyFile(path.join(rootDir, "src", "client.js"), path.join(distDir, "client.js"));
await copyRequiredAssets();

console.log(`Built ${landingProject.name} landing project in ${distDir}`);
