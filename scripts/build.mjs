import { cp, mkdir, rm, writeFile, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { project as landingProject, arabicProject } from "../src/project-data.mjs";
import { renderGtmBody, renderGtmHead } from "../shared/gtm.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

let project = landingProject;
let company = project.brand;

const defaultUiText = {
  nav_overview: "Overview",
  nav_gallery: "Gallery",
  nav_location: "Location",
  nav_contact: "Contact",
  nav_website: "Oaklyn Website",
  nav_request_details: "Request Details",
  brand_aria_suffix: "landing page",
  primary_nav_aria: "Primary navigation",
  mobile_nav_aria: "Mobile navigation",
  hero_whatsapp_cta: "Chat on WhatsApp",
  mobile_menu_label: "Menu",
  quick_highlights_eyebrow: "Quick Investment Highlights",
  quick_highlights_title: "Project facts at a glance",
  request_information_eyebrow: "Request Information",
  basic_enquiry_only: "Basic enquiry details only",
  subject_to_confirmation: "Subject to developer confirmation",
  no_guaranteed_returns: "No guaranteed investment returns",
  form_name_error: "Please enter your full name.",
  form_phone_placeholder: "050 123 4567",
  form_phone_error: "Please enter a valid international phone number.",
  form_email_error: "Please enter a valid email address.",
  form_message_error: "Please add a short inquiry.",
  form_message_placeholder: "Tell us what you would like to know.",
  form_select_error: "Please select an option.",
  form_submit: "Request Project Information",
  form_submit_error: "We could not submit your enquiry. Please try again or contact Oaklyn Realty directly.",
  form_success_title: "Thank you",
  blocked_success_title: "Thank you",
  form_success_copy_prefix: "Your enquiry has been received. Oaklyn Realty will contact you regarding",
  faq_eyebrow: "FAQ",
  faq_title: "Quick answers",
  trust_eyebrow: "Trust & Compliance",
  trust_title: "Clear, compliant enquiry process",
  footer_about_text:
    "Oaklyn Realty is a Dubai real estate brokerage helping you review project details, availability, and enquiry next steps with clear communication.",
  footer_contact_heading: "Contact",
  footer_legal_heading: "Legal",
  footer_about_link: "About Us",
  footer_contact_link: "Contact",
  footer_privacy_link: "Privacy Policy",
  footer_terms_link: "Terms & Conditions",
  footer_copyright:
    "Oaklyn Real Estate L.L.C. — DED Licence 1589593 · RERA ORN 59210. Regulated by Dubai DET and Dubai Land Department.",
  whatsapp_floating_label: "Chat on WhatsApp",
  whatsapp_close: "Close",
  whatsapp_eyebrow: "Quick Verification",
  whatsapp_title: "Continue to WhatsApp",
  whatsapp_copy: "Enter your number for a quick verification before we open WhatsApp.",
  whatsapp_country_code: "Country Code",
  whatsapp_phone: "WhatsApp Number",
  whatsapp_phone_placeholder: "50 123 4567",
  whatsapp_phone_error: "Please enter a valid phone number to continue.",
  whatsapp_note: "We use this step to filter duplicate and blocked numbers before WhatsApp opens.",
  whatsapp_error: "We could not continue to WhatsApp right now. Please try again.",
  whatsapp_continue: "Continue to WhatsApp",
  verification_headline_1: "Verifying your information...",
  verification_headline_2: "Checking availability...",
  verification_headline_3: "Securing your consultation slot...",
  verification_headline_4: "Connecting you with your advisor...",
  verification_sub_1: "This usually takes a few seconds",
  verification_sub_2: "Your data is encrypted and secure",
  verification_sub_3: "We never share your information",
  verification_sub_4: "Almost ready...",
  verification_trust_1: "🔒 SSL Secured",
  verification_trust_2: "✓ RERA Registered",
  verification_trust_3: "🛡 Data Protected",
  cancel: "Cancel",
  gallery_prev: "Previous gallery image",
  gallery_next: "Next gallery image",
  gallery_dot_aria: "Go to gallery image {index}",
  phone_search_sr_label: "Search country or code",
  phone_search_placeholder: "Type exact code or country",
  phone_search_empty: "No country found.",
  validation_name: "Please enter your name.",
  validation_first_name: "Please enter your first name.",
  validation_last_name: "Please enter your last name.",
  thank_you_meta_title_prefix: "Thank You",
  thank_you_meta_description: "Your Oaklyn Realty property enquiry has been received.",
  thank_you_eyebrow: "Enquiry Received",
  thank_you_title: "Thank you. Our property consultant will contact you shortly.",
  thank_you_copy_prefix:
    "Oaklyn Realty has received your enquiry for",
  thank_you_copy_suffix: "We will not ask for sensitive personal information through this form.",
  back_to_project: "Back to Project",
  contact_oaklyn: "Contact Oaklyn",
  mobile_call: "Call",
  mobile_whatsapp: "WhatsApp"
};

const setProject = (nextProject) => {
  project = nextProject;
  company = project.brand;
};

const t = (key, fallback) => {
  if (project?.uiText && Object.prototype.hasOwnProperty.call(project.uiText, key)) {
    return project.uiText[key];
  }
  if (fallback !== undefined) return fallback;
  return defaultUiText[key] || "";
};

const getLocaleLang = () => project.locale?.lang || "en";
const getLocaleDir = () => project.locale?.dir || "ltr";
const getBodyClass = (...classes) =>
  [getLocaleDir() === "rtl" ? "is-rtl" : "", ...classes].filter(Boolean).join(" ");
const formatLocalizedNumber = (value) => {
  const text = String(value);
  if (getLocaleLang() !== "ar") return text;
  return text.replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderBrandText = (value = "") =>
  escapeHtml(value).replaceAll(
    "Oaklyn Realty",
    '<span class="brand-inline">Oaklyn Realty</span>',
  );

const json = (data) => JSON.stringify(data, null, 2).replaceAll("</script", "<\\/script");
const renderJsonLd = (data) => `<script type="application/ld+json">\n${json(data)}\n</script>`;
const trimSlashes = (value = "") => String(value).replace(/^\/+|\/+$/g, "");
const languagePreferenceStorageKey = "oaklyn_lang_pref_raw_district_v2";
const digitsOnly = (value = "") => String(value).replace(/[^\d]/g, "");
const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const withAssetVersion = (value = "") => {
  const stringValue = String(value || "");
  if (!stringValue.startsWith("/assets/")) return stringValue;
  return `${stringValue}${stringValue.includes("?") ? "&" : "?"}v=${encodeURIComponent(project.assetVersion)}`;
};

const toAbsoluteUrl = (value = "", fallback = project.landingPageUrl) => {
  const stringValue = withAssetVersion(String(value || fallback || ""));
  if (!stringValue) return "";
  try {
    return new URL(stringValue, project.landingPageUrl).href;
  } catch (error) {
    return stringValue;
  }
};

const getProjectImageUrls = () => {
  const imageCandidates = [
    project.seo?.image,
    project.hero?.background,
    ...(project.gallery?.items || []).map((item) => item.image),
    company.logo,
  ];
  return [...new Set(imageCandidates.filter(Boolean).map((image) => toAbsoluteUrl(image)))];
};

const getSeoImageUrl = () => getProjectImageUrls()[0] || company.logo;

const getOpenGraphLocale = () => (getLocaleLang() === "ar" ? "ar_AE" : "en_AE");

const renderSocialMeta = ({ title, description, canonical }) => {
  const image = getSeoImageUrl();
  return [
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="${escapeHtml(getOpenGraphLocale())}">`,
    `<meta property="og:site_name" content="${escapeHtml(company.company)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(image)}">`,
  ].join("\n  ");
};

const getWhatsAppHref = () => {
  if (project.whatsappDirectUrl) return project.whatsappDirectUrl;
  const phone = digitsOnly(company.whatsappHref || company.phoneHref);
  const message = project.whatsappPrefill || `Hello, I would like more information about ${project.name}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const getLanguageRouteConfig = (kind = "landing") => ({
  en: `/${trimSlashes(kind === "thank-you" ? landingProject.alternateThankYouPath : landingProject.routePath)}/`,
  ar: `/${trimSlashes(kind === "thank-you" ? arabicProject.alternateThankYouPath : arabicProject.routePath)}/`,
});

const getLanguagePopupConfig = () => ({
  badge: "Oaklyn Realty",
  title: "Choose your language",
  subtitle: "اختر اللغة للمتابعة",
  englishLabel: "English",
  arabicLabel: "العربية",
  loading: "Loading your page..."
});

const getClientConfig = (options = {}) => ({
  project_name: project.name,
  project_slug: project.slug,
  current_language: project.languageCode || getLocaleLang(),
  language_preference_key: languagePreferenceStorageKey,
  language_prompt_enabled: Boolean(options.publicLanguageEntry),
  language_switcher_enabled: Boolean(options.languageSwitcherEnabled),
  language_routes: options.languageRoutes || getLanguageRouteConfig("landing"),
  language_popup: getLanguagePopupConfig(),
  source_page: project.sourcePage,
  landing_page_url: project.landingPageUrl,
  thank_you_page_url: project.thankYouPageUrl,
  webhook_url: project.webhookUrl,
  whatsapp_webhook_url: project.whatsappWebhookUrl || "",
  blacklist_check_url: project.blacklistCheckUrl || "",
  blacklist_timeout_ms: Number(project.blacklistTimeoutMs) || 8000,
  blacklist_block_message: project.form.blacklistBlockedMessage || "Thank you. Your inquiry has already been received.",
  blacklist_block_title: t("blocked_success_title", "Thank you"),
  blacklist_error_message: project.form.blacklistErrorMessage || "Something went wrong. Please try again.",
  verification_headlines: [
    t("verification_headline_1"),
    t("verification_headline_2"),
    t("verification_headline_3"),
    t("verification_headline_4")
  ],
  verification_subs: [
    t("verification_sub_1"),
    t("verification_sub_2"),
    t("verification_sub_3"),
    t("verification_sub_4")
  ],
  split_name: Boolean(project.form.splitName),
});

const renderLanguageShellPage = ({ kind = "landing" } = {}) => {
  const isThankYou = kind === "thank-you";
  const publicUrl = isThankYou ? landingProject.thankYouPageUrl : landingProject.landingPageUrl;
  const title = isThankYou
    ? "Thank You | Raw District | Oaklyn Realty"
    : "Raw District | Oaklyn Realty";
  const description = isThankYou
    ? "Language-aware thank-you page for Raw District by Oaklyn Realty."
    : "Choose your preferred language for Raw District and continue on one landing URL.";

  const shellConfig = {
    kind,
    storageKey: languagePreferenceStorageKey,
    routeByLanguage: getLanguageRouteConfig(kind),
    publicLandingUrl: landingProject.landingPageUrl,
    publicThankYouUrl: landingProject.thankYouPageUrl,
    popup: getLanguagePopupConfig()
  };

  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(publicUrl)}">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at top, rgba(201, 168, 76, 0.18), transparent 28rem),
        linear-gradient(180deg, #fbfaf6 0%, #f3eee4 100%);
      font-family: Inter, sans-serif;
      color: #0b1d3a;
    }
    .lang-shell {
      width: min(560px, calc(100% - 32px));
      padding: 32px;
      border: 1px solid rgba(11, 29, 58, 0.08);
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: 0 24px 60px rgba(11, 29, 58, 0.12);
      text-align: center;
    }
    .lang-shell-badge {
      display: inline-flex;
      margin-bottom: 14px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(201, 168, 76, 0.14);
      color: #c9a84c;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
    .lang-shell h1 {
      margin: 0 0 10px;
      font-family: Baskervville, serif;
      font-size: clamp(2rem, 5vw, 3.3rem);
      line-height: 1;
    }
    .lang-shell p {
      margin: 0;
      color: rgba(11, 29, 58, 0.68);
      font-size: 1rem;
      line-height: 1.7;
    }
    .lang-shell-actions {
      display: grid;
      gap: 12px;
      margin-top: 24px;
    }
    .lang-shell-actions button {
      min-height: 58px;
      border: 0;
      border-radius: 18px;
      font: inherit;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }
    .lang-shell-actions a {
      display: grid;
      place-items: center;
      min-height: 58px;
      border-radius: 18px;
      font: inherit;
      font-size: 1rem;
      font-weight: 700;
      text-decoration: none;
    }
    .lang-shell-actions button:first-child {
      background: #0b1d3a;
      color: #fbfaf6;
    }
    .lang-shell-actions button:last-child {
      background: #c9a84c;
      color: #0b1d3a;
    }
    .lang-shell-actions a:first-child {
      background: #0b1d3a;
      color: #fbfaf6;
    }
    .lang-shell-actions a:last-child {
      background: #c9a84c;
      color: #0b1d3a;
    }
    .lang-shell-loading {
      margin-top: 18px;
      color: rgba(11, 29, 58, 0.56);
      font-size: .94rem;
    }
    .lang-shell-loading[hidden] {
      display: none;
    }
  </style>
  <script>window.OAKLYN_LANGUAGE_SHELL = ${json(shellConfig)};</script>
  <script src="/client.js?v=${escapeHtml(landingProject.assetVersion)}" defer></script>
</head>
<body>
  <main class="lang-shell">
    <span class="lang-shell-badge">${escapeHtml(shellConfig.popup.badge)}</span>
    <h1>${escapeHtml(shellConfig.popup.title)}</h1>
    <p>${escapeHtml(shellConfig.popup.subtitle)}</p>
    <div class="lang-shell-actions" id="languageShellActions">
      <a href="${escapeHtml(shellConfig.routeByLanguage.en)}" data-language-choice="en">${escapeHtml(shellConfig.popup.englishLabel)}</a>
      <a href="${escapeHtml(shellConfig.routeByLanguage.ar)}" data-language-choice="ar">${escapeHtml(shellConfig.popup.arabicLabel)}</a>
    </div>
    <p class="lang-shell-loading" id="languageShellLoading" hidden>${escapeHtml(shellConfig.popup.loading)}</p>
  </main>
</body>
</html>`;
};

const renderWhatsAppLink = ({ className = "", label = "WhatsApp", location = "default", iconOnly = false } = {}) =>
  `<a class="${escapeHtml(className)}" href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp-cta data-cta-location="${escapeHtml(location)}" data-whatsapp-destination="${escapeHtml(getWhatsAppHref())}"${iconOnly ? ` aria-label="${escapeHtml(label)}"` : ""}>${
    iconOnly
      ? `<i class="bx bxl-whatsapp" aria-hidden="true"></i>`
      : `<i class="ti ti-brand-whatsapp" aria-hidden="true"></i><span>${escapeHtml(label)}</span>`
  }</a>`;

const renderCallIconLink = ({ className = "", location = "default" } = {}) =>
  `<a class="${escapeHtml(["call-icon-link", className].filter(Boolean).join(" "))}" href="tel:${escapeHtml(company.phoneHref)}" aria-label="${escapeHtml(`${t("mobile_call")} ${company.phoneDisplay}`)}" data-call-link data-cta-location="${escapeHtml(location)}">
    <i class="ti ti-phone-call" aria-hidden="true"></i>
    <span class="sr-only">${escapeHtml(t("mobile_call"))}</span>
  </a>`;

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

const getWebpageSchema = ({ canonical, title, description, hasListing = true }) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${canonical}#webpage`,
  url: canonical,
  name: title,
  description,
  inLanguage: getLocaleLang(),
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: getSeoImageUrl(),
  },
  about: hasListing ? { "@id": `${canonical}#listing` } : { "@id": "https://oaklynrealty.ae/#organization" },
  publisher: { "@id": "https://oaklynrealty.ae/#organization" },
});

const getListingSchema = (canonical) => {
  const listing = project.listing || {};
  const permit = project.compliance?.permit;
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${canonical}#listing`,
    url: canonical,
    name: project.name,
    description: project.seo.description,
    image: getProjectImageUrls(),
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

const getBreadcrumbSchema = (canonical) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: company.company,
      item: company.mainWebsite,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: project.name,
      item: canonical,
    },
  ],
});

const getFaqSchema = () => {
  const questions = (project.faq || []).filter((item) => item.question && item.answer);
  if (!questions.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${project.landingPageUrl}#faq`,
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
};

const renderOptionalJsonLd = (data) => (data ? renderJsonLd(data) : "");

const renderHead = ({
  title,
  description,
  canonical,
  noindex = false,
  includeListingSchema = true,
  extraHeadBeforeGtm = "",
}) => `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${noindex ? '<meta name="robots" content="noindex, nofollow">' : ""}
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="${escapeHtml(company.company)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${renderSocialMeta({ title, description, canonical })}
  <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" rel="stylesheet">
  ${extraHeadBeforeGtm}
  ${renderGtmHead(project.tracking, escapeHtml)}
  ${renderJsonLd(getOrganizationSchema())}
  ${renderJsonLd(getWebpageSchema({ canonical, title, description, hasListing: includeListingSchema }))}
  ${includeListingSchema ? renderJsonLd(getListingSchema(canonical)) : ""}
  ${includeListingSchema ? renderJsonLd(getBreadcrumbSchema(canonical)) : ""}
  ${includeListingSchema ? renderOptionalJsonLd(getFaqSchema()) : ""}
  <link rel="stylesheet" href="/styles.css?v=${escapeHtml(project.assetVersion)}">`;

const renderNav = () => `
  <header class="topbar">
    <div class="shell nav">
      <a class="brand" href="${escapeHtml(project.homeHref || "/")}" aria-label="${escapeHtml(company.company)} ${escapeHtml(project.name)} ${escapeHtml(t("brand_aria_suffix"))}">
        <img src="${escapeHtml(company.logo)}" alt="${escapeHtml(company.company)}">
        <span>${escapeHtml(project.name)}</span>
      </a>
      <nav class="nav-links" aria-label="${escapeHtml(t("primary_nav_aria"))}">
        <a href="#overview">${escapeHtml(t("nav_overview"))}</a>
        <a href="#gallery">${escapeHtml(t("nav_gallery"))}</a>
        <a href="#location">${escapeHtml(t("nav_location"))}</a>
        <a href="#contact">${escapeHtml(t("nav_contact"))}</a>
        <a href="${escapeHtml(company.mainWebsite)}">${escapeHtml(t("nav_website"))}</a>
      </nav>
      <div class="nav-actions">
        ${renderCallIconLink({ className: "nav-phone", location: "nav_call" })}
        <a class="btn btn-primary" href="#contact">${escapeHtml(t("nav_request_details"))}</a>
      </div>
      ${project.showMobileMenu === false ? "" : `<button class="mobile-menu-button" type="button" aria-label="${escapeHtml(t("mobile_menu_label"))}" aria-expanded="false" data-mobile-menu-button>${escapeHtml(t("mobile_menu_label"))}</button>`}
    </div>
    ${project.showMobileMenu === false ? "" : `<nav class="mobile-menu" aria-label="${escapeHtml(t("mobile_nav_aria"))}" data-mobile-menu>
      <a href="#overview">${escapeHtml(t("nav_overview"))}</a>
      <a href="#gallery">${escapeHtml(t("nav_gallery"))}</a>
      <a href="#location">${escapeHtml(t("nav_location"))}</a>
      <a href="#contact">${escapeHtml(t("nav_contact"))}</a>
      <a href="${escapeHtml(company.mainWebsite)}">${escapeHtml(t("nav_website"))}</a>
    </nav>`}
  </header>`;

const renderFooter = () => `
  <footer class="section">
    <div class="shell footer-panel">
      <div class="footer-grid">
        <div>
          <strong>${escapeHtml(project.footer?.company || company.company)}</strong>
          ${project.footer?.tagline ? `<p class="footer-tagline">${escapeHtml(project.footer.tagline)}</p>` : ""}
          <p>${renderBrandText(project.footer?.description || t("footer_about_text"))}</p>
        </div>
        <div>
          <strong>${escapeHtml(t("footer_contact_heading"))}</strong>
          <p>${escapeHtml(project.footer?.address || company.office)}</p>
          <p>${renderCallIconLink({ className: "footer-call-icon", location: "footer_call" })}<br>${renderWhatsAppLink({ label: company.whatsappDisplay || company.phoneDisplay, location: "footer_contact" })}<br><a href="mailto:${escapeHtml(company.email)}">${escapeHtml(company.email)}</a></p>
        </div>
        <div>
          <strong>${escapeHtml(t("footer_legal_heading"))}</strong>
          <div class="footer-links">
            <a href="${escapeHtml(company.aboutUrl)}">${escapeHtml(t("footer_about_link"))}</a>
            <a href="${escapeHtml(company.contactUrl)}">${escapeHtml(t("footer_contact_link"))}</a>
            <a href="${escapeHtml(company.privacyUrl)}">${escapeHtml(t("footer_privacy_link"))}</a>
            <a href="${escapeHtml(company.termsUrl)}">${escapeHtml(t("footer_terms_link"))}</a>
          </div>
        </div>
      </div>
      <p class="copyright">${escapeHtml(project.footer?.license || t("footer_copyright"))}</p>
      ${project.footer?.copyright ? `<p class="copyright">${escapeHtml(project.footer.copyright)}</p>` : ""}
      ${project.footer?.disclaimer ? `<p class="copyright">${escapeHtml(project.footer.disclaimer)}</p>` : ""}
    </div>
  </footer>`;

const renderWhatsAppFloat = () => `<div class="whatsapp-float-wrap">
    ${renderWhatsAppLink({ className: "whatsapp-float", label: t("whatsapp_floating_label"), location: "floating_icon", iconOnly: true })}
  </div>`;

const renderPermitQrBadge = () => {
  const isArabic = getLocaleLang() === "ar";
  const label = isArabic ? "رمز تصريح المشروع" : "Project permit QR";
  const ariaLabel = isArabic ? "عرض رمز تصريح المشروع" : "View project permit QR code";
  const image = withAssetVersion("/assets/raw-district/permit-qr.jpeg");

  return `<a class="permit-qr-badge" href="${escapeHtml(image)}" target="_blank" rel="noopener" aria-label="${escapeHtml(ariaLabel)}" data-permit-qr-badge>
    <img src="${escapeHtml(image)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async">
    <span>${escapeHtml(label)}</span>
  </a>`;
};

const renderWhatsAppModal = () => `
  <div class="whatsapp-modal" data-whatsapp-modal hidden aria-hidden="true">
    <div class="whatsapp-modal-backdrop" data-whatsapp-modal-close></div>
    <section class="whatsapp-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="whatsappModalTitle">
      <button class="whatsapp-modal-close" type="button" data-whatsapp-modal-close>${escapeHtml(t("whatsapp_close"))}</button>
      <span class="eyebrow">${escapeHtml(t("whatsapp_eyebrow"))}</span>
      <h3 id="whatsappModalTitle">${escapeHtml(t("whatsapp_title"))}</h3>
      <p class="section-copy">${escapeHtml(t("whatsapp_copy"))}</p>
      <div class="phone-input-row whatsapp-modal-phone-row">
        <div class="field">
          <label id="whatsappModalCountryCodeLabel">${escapeHtml(t("whatsapp_country_code"))}</label>
          ${renderPhoneCountryPicker({
            inputId: "whatsappModalCountryCode",
            inputName: "",
            pickerKey: "whatsapp",
            searchId: "whatsapp_modal_country_search",
            labelledBy: "whatsappModalCountryCodeLabel",
          })}
        </div>
        <div class="field" id="whatsappModalPhoneField">
          <label for="whatsappModalPhone">${escapeHtml(t("whatsapp_phone"))}</label>
          <input id="whatsappModalPhone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="${escapeHtml(t("whatsapp_phone_placeholder"))}">
          <div class="field-error">${escapeHtml(t("whatsapp_phone_error"))}</div>
        </div>
      </div>
      <p class="whatsapp-modal-note">${escapeHtml(t("whatsapp_note"))}</p>
      <div id="whatsappModalError" class="form-error">${escapeHtml(t("whatsapp_error"))}</div>
      <div id="whatsappModalBlocked" class="form-success">
        <h3>${escapeHtml(t("blocked_success_title"))}</h3>
        <p class="section-copy">${escapeHtml(project.form.blacklistBlockedMessage || "Thank you. Your inquiry has already been received.")}</p>
      </div>
      <div class="whatsapp-modal-actions">
        <button class="btn btn-primary" type="button" id="whatsappModalContinue">${escapeHtml(t("whatsapp_continue"))}</button>
        <button class="btn btn-ghost" type="button" data-whatsapp-modal-close>${escapeHtml(t("cancel"))}</button>
      </div>
    </section>
  </div>`;

const renderVerificationOverlay = () => `
  <div id="verify-overlay" style="display:none; position:fixed; inset:0; background:rgba(8,8,8,0.97); z-index:99999; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px;">
    <img src="${escapeHtml(company.logo)}" alt="Oaklyn Realty" style="height:48px; margin-bottom:40px; opacity:0.9;">
    <svg id="verify-icon" width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom:32px;">
      <circle cx="32" cy="32" r="28" stroke="#C9A84C" stroke-width="2" opacity="0.3"/>
      <path id="shield-path" d="M32 12 L48 20 L48 34 C48 44 32 52 32 52 C32 52 16 44 16 34 L16 20 Z" stroke="#C9A84C" stroke-width="2" fill="none" stroke-dasharray="120" stroke-dashoffset="120" style="transition: stroke-dashoffset 1s ease;"/>
      <path id="check-path" d="M22 32 L29 39 L42 26" stroke="#C9A84C" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="30" stroke-dashoffset="30" style="transition: stroke-dashoffset 0.6s ease 0.8s;"/>
    </svg>
    <h2 id="verify-headline" style="font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:700; color:#F5F0E8; margin-bottom:16px; transition:opacity 0.4s;">${escapeHtml(t("verification_headline_1"))}</h2>
    <div style="width:320px; max-width:100%; height:3px; background:rgba(255,255,255,0.08); border-radius:50px; margin-bottom:16px; overflow:hidden;">
      <div id="verify-bar" style="height:100%; width:0%; background:linear-gradient(90deg,#C9A84C,#E8C96A); border-radius:50px; transition:width 0.1s linear;"></div>
    </div>
    <p id="verify-pct" style="font-family:'Inter',sans-serif; font-size:14px; color:#C9A84C; margin-bottom:12px; font-weight:600;">0%</p>
    <p id="verify-sub" style="font-family:'Inter',sans-serif; font-size:13px; color:#A8A39D; transition:opacity 0.4s;">${escapeHtml(t("verification_sub_1"))}</p>
    <div style="display:flex; gap:24px; margin-top:40px; flex-wrap:wrap; justify-content:center;">
      <span style="font-size:12px; color:#A8A39D; font-family:'Inter',sans-serif;">${escapeHtml(t("verification_trust_1"))}</span>
      <span style="font-size:12px; color:#A8A39D; font-family:'Inter',sans-serif;">${escapeHtml(t("verification_trust_2"))}</span>
      <span style="font-size:12px; color:#A8A39D; font-family:'Inter',sans-serif;">${escapeHtml(t("verification_trust_3"))}</span>
    </div>
  </div>`;

const renderLanguageChoiceOverlay = () => {
  const popup = getLanguagePopupConfig();
  const routes = getLanguageRouteConfig("landing");
  return `<div class="language-choice-overlay" data-language-choice-overlay aria-modal="true" role="dialog" aria-labelledby="languageChoiceTitle">
    <div class="language-choice-backdrop" aria-hidden="true"></div>
    <section class="language-choice-card">
      <span class="language-choice-badge">${escapeHtml(popup.badge)}</span>
      <h2 id="languageChoiceTitle">${escapeHtml(popup.title)}</h2>
      <p>${escapeHtml(popup.subtitle)}</p>
      <div class="language-choice-actions" id="languageChoiceActions">
        <a class="language-choice-option" href="${escapeHtml(routes.en)}" data-language-choice="en">${escapeHtml(popup.englishLabel)}</a>
        <a class="language-choice-option" href="${escapeHtml(routes.ar)}" data-language-choice="ar">${escapeHtml(popup.arabicLabel)}</a>
      </div>
      <p class="language-choice-loading" data-language-choice-loading hidden>${escapeHtml(popup.loading)}</p>
    </section>
  </div>`;
};

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
    return `<div class="hero-bg" style="background-image: url('${escapeHtml(withAssetVersion(slides[0].image))}');"></div>`;
  }
  return `<div class="hero-slider" data-hero-slider>
        ${slides
          .map(
            (slide, index) =>
              `<div class="hero-bg hero-slide${index === 0 ? " is-active" : ""}" style="background-image: url('${escapeHtml(withAssetVersion(slide.image))}');" aria-label="${escapeHtml(slide.label)}"></div>`,
          )
          .join("\n        ")}
      </div>`;
};

const renderGallerySlides = () =>
  project.gallery.items
    .map(
      (item, index) => `
            <article class="gallery-slide" data-gallery-slide>
              <div class="gallery-image">
                <img class="gallery-photo" src="${escapeHtml(withAssetVersion(item.image))}" alt="${escapeHtml(`${item.eyebrow} - ${item.title}`)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
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
          <button class="gallery-dot${index === 0 ? " is-active" : ""}" type="button" aria-label="${escapeHtml(t("gallery_dot_aria").replace("{index}", formatLocalizedNumber(index + 1)))}" aria-pressed="${index === 0 ? "true" : "false"}" data-gallery-dot></button>`,
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
            <strong>${renderBrandText(item.title)}</strong>
            <p>${renderBrandText(item.text)}</p>
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
          <span class="eyebrow">${escapeHtml(t("faq_eyebrow"))}</span>
          <h2 class="section-title">${escapeHtml(t("faq_title"))}</h2>
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

const renderPhoneCountryPicker = ({
  inputId = "landing_phone_country",
  inputName = "phone_country_code",
  pickerKey = "lead",
  searchId = "landing_phone_country_search",
  labelledBy = "",
  includeOptions = true,
} = {}) => {
  const defaultCountry = getDefaultPhoneCountry();
  const inputNameAttribute = inputName ? ` name="${escapeHtml(inputName)}"` : "";
  const labelledByAttribute = labelledBy ? ` aria-labelledby="${escapeHtml(labelledBy)}"` : "";

  return `<div class="country-picker is-placeholder" data-country-picker="${escapeHtml(pickerKey)}">
      <input id="${escapeHtml(inputId)}"${inputNameAttribute} type="hidden" value="" data-country-picker-input>
      <button
        class="country-picker-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="false"
        ${labelledByAttribute}
        data-country-picker-trigger
      >
        <span class="country-picker-current">
          <span class="country-picker-flag" data-country-picker-flag></span>
          <span class="country-picker-label" data-country-picker-label>Country code</span>
          <span class="country-picker-code" data-country-picker-code>${escapeHtml(defaultCountry.dialCode)}</span>
        </span>
        <span class="country-picker-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="country-picker-panel" data-country-picker-panel hidden>
        <label class="sr-only" for="${escapeHtml(searchId)}">${escapeHtml(t("phone_search_sr_label"))}</label>
        <input
          id="${escapeHtml(searchId)}"
          class="country-picker-search"
          type="search"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          enterkeyhint="search"
          placeholder="${escapeHtml(t("phone_search_placeholder"))}"
          data-country-picker-search
        >
        <div class="country-picker-list" role="listbox" data-country-picker-list>
          ${includeOptions ? project.form.phoneCountries
            .map(
              (item, index) => `<button
              class="country-picker-option"
              type="button"
              role="option"
              aria-selected="false"
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
            .join("") : ""}
        </div>
        <p class="country-picker-empty" data-country-picker-empty hidden>${escapeHtml(t("phone_search_empty"))}</p>
      </div>
    </div>`;
};

const getFormLabels = () => ({
  name: "Full Name",
  firstName: "First Name",
  lastName: "Last Name",
  phone: "Phone",
  email: "Email",
  message: "Inquiry",
  project: "Preferred Project",
  propertyType: "Property Type",
  ...(project.form.labels || {}),
});

const renderNameFields = (formLabels) => {
  if (!project.form.splitName) {
    return `<div class="field" id="nameField">
                <label for="landing_full_name">${escapeHtml(formLabels.name)}</label>
                <input id="landing_full_name" name="full_name" type="text" autocomplete="name" required>
                <div class="field-error">${escapeHtml(t("validation_name"))}</div>
              </div>`;
  }

  return `<div class="field" id="firstNameField">
                <label for="landing_first_name">${escapeHtml(formLabels.firstName)}</label>
                <input id="landing_first_name" name="first_name" type="text" autocomplete="given-name" required>
                <div class="field-error">${escapeHtml(t("validation_first_name"))}</div>
              </div>
              <div class="field" id="lastNameField">
                <label for="landing_last_name">${escapeHtml(formLabels.lastName)}</label>
                <input id="landing_last_name" name="last_name" type="text" autocomplete="family-name" required>
                <div class="field-error">${escapeHtml(t("validation_last_name"))}</div>
              </div>`;
};

const renderAbout = () => {
  if (!project.about) return "";
  return `<section class="section about-community">
      <div class="shell about-panel">
        <span class="eyebrow">${escapeHtml(project.about.eyebrow)}</span>
        <h2 class="section-title">${escapeHtml(project.about.title)}</h2>
        <p class="section-copy">${renderBrandText(project.about.text)}</p>
      </div>
    </section>`;
};

const renderUnitCardsSection = () => {
  if (!project.unitCardsSection?.items?.length) return "";
  const labels = {
    size: project.unitCardsSection.labels?.size || "Size",
    price: project.unitCardsSection.labels?.price || "Price",
    pricePerSqft: project.unitCardsSection.labels?.pricePerSqft || "Price / Sqft"
  };
  return `<section class="section unit-cards-section">
      <div class="shell">
        <div class="section-kicker">
          <span class="eyebrow">${escapeHtml(project.unitCardsSection.eyebrow)}</span>
          <h2 class="section-title">${escapeHtml(project.unitCardsSection.title)}</h2>
        </div>
        <div class="unit-cards-grid">
          ${project.unitCardsSection.items
            .map(
              (item) => `<article class="unit-card">
                <strong class="unit-card-title">${escapeHtml(item.title)}</strong>
                <div class="unit-card-rows">
                  <div class="unit-card-row">
                    <span class="unit-card-label">${escapeHtml(labels.size)}</span>
                    <span class="unit-card-value">${escapeHtml(item.size)}</span>
                  </div>
                  <div class="unit-card-row unit-card-row--price">
                    <span class="unit-card-label">${escapeHtml(labels.price)}</span>
                    <span class="unit-card-value">${escapeHtml(item.price)}</span>
                  </div>
                  <div class="unit-card-row unit-card-row--accent">
                    <span class="unit-card-label">${escapeHtml(labels.pricePerSqft)}</span>
                    <span class="unit-card-value">${escapeHtml(item.pricePerSqft)}</span>
                  </div>
                </div>
              </article>`,
            )
            .join("")}
        </div>
        ${project.unitCardsSection.note ? `<p class="unit-cards-note">${escapeHtml(project.unitCardsSection.note)}</p>` : ""}
      </div>
    </section>`;
};

const renderAboutUsSection = () => {
  if (!project.aboutUsSection) return "";
  return `<section class="section about-us-section">
      <div class="shell about-panel about-us-panel">
        <span class="eyebrow">${escapeHtml(project.aboutUsSection.eyebrow)}</span>
        <h2 class="section-title">${renderBrandText(project.aboutUsSection.title)}</h2>
        <p class="section-copy">${renderBrandText(project.aboutUsSection.text)}</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="${escapeHtml(project.aboutUsSection.href)}" target="_blank" rel="noopener">${renderBrandText(project.aboutUsSection.ctaLabel)}</a>
        </div>
      </div>
    </section>`;
};

const isHttpUrl = (value = "") => /^https?:\/\//i.test(String(value));
const isWhatsAppUrl = (value = "") => /wa\.me|whatsapp/i.test(String(value));
const isTelUrl = (value = "") => /^tel:/i.test(String(value));
const isMapUrl = (value = "") => /maps\.app|google\.[^/]+\/maps/i.test(String(value));

const getFaviconUrl = (href = "") => {
  if (!isHttpUrl(href)) return "";
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(href)}`;
};

const getLinkHubActionLabel = (item) => {
  if (!item.href) return "URL Pending";
  if (item.actionLabel) return item.actionLabel;
  if (isTelUrl(item.href)) return "Call";
  if (isWhatsAppUrl(item.href)) return "Chat";
  if (isMapUrl(item.href)) return "Directions";
  return "Visit";
};

const renderLinkHubCardMedia = (item = {}) => {
  if (item.image) {
    return `<span class="link-hub-card-media is-image" aria-hidden="true"><img src="${escapeHtml(item.image)}" alt=""></span>`;
  }

  if (item.logo) {
    return `<span class="link-hub-card-media is-logo" aria-hidden="true"><img src="${escapeHtml(item.logo)}" alt=""></span>`;
  }

  if (item.avatarText) {
    return `<span class="link-hub-card-media is-avatar" aria-hidden="true">${escapeHtml(item.avatarText)}</span>`;
  }

  if (item.href && isHttpUrl(item.href) && !isMapUrl(item.href) && !isWhatsAppUrl(item.href)) {
    return `<span class="link-hub-card-media is-favicon" aria-hidden="true"><img src="${escapeHtml(getFaviconUrl(item.href))}" alt=""></span>`;
  }

  const iconClass = item.icon || "bx bx-link";
  return `<span class="link-hub-card-media is-icon" aria-hidden="true"><i class="${escapeHtml(iconClass)}"></i></span>`;
};

const renderLinkHubCards = (items = [], section = {}) =>
  items
    .map((item) => {
      const actionLabel = getLinkHubActionLabel(item);
      const classes = [
        "link-hub-card",
        item.href ? "" : "is-placeholder",
        item.image ? "has-image" : "",
        item.logo ? "has-logo" : "",
        item.avatarText ? "has-avatar" : "",
        section.title === "Contacts" ? "is-contact" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const cardInner = `
        ${renderLinkHubCardMedia(item)}
        <span class="link-hub-card-copy">
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.description || "Add final destination URL")}</small>
        </span>
        <span class="link-hub-card-badge${item.href ? "" : " is-pending"}">${escapeHtml(actionLabel)}</span>
        <span class="link-hub-card-arrow" aria-hidden="true">${item.href ? "↗" : "…"}</span>`;

      if (item.href) {
        const externalAttrs = isHttpUrl(item.href) ? ' target="_blank" rel="noopener"' : "";
        return `<a class="${classes}" href="${escapeHtml(item.href)}"${externalAttrs}>${cardInner}</a>`;
      }

      return `<article class="${classes}">${cardInner}</article>`;
    })
    .join("");

const renderLinkHubJumpNav = (sections = []) =>
  `<nav class="link-hub-jump-nav" aria-label="Quick links">
    ${sections
      .map(
        (section) => `<a class="link-hub-jump-chip" href="#${escapeHtml(slugify(section.title))}">${escapeHtml(section.title)}</a>`,
      )
      .join("")}
  </nav>`;

const renderLinkHubSections = () =>
  (project.linkHub?.sections || [])
    .map(
      (section) => `
        <section class="link-hub-group link-hub-group--${escapeHtml(section.layout || "compact")}" id="${escapeHtml(slugify(section.title))}">
          <div class="link-hub-group-panel">
            <div class="link-hub-group-header">
              <span class="link-hub-group-title">${escapeHtml(section.title)}</span>
              <span class="link-hub-group-count">${section.items.length} link${section.items.length === 1 ? "" : "s"}</span>
            </div>
            <div class="link-hub-card-stack">
              ${renderLinkHubCards(section.items, section)}
            </div>
          </div>
        </section>`,
    )
    .join("");

const renderLinkHubPage = (nextProject) => {
  setProject(nextProject);
  const linkHub = project.linkHub;
  if (!linkHub) return "";
  const lang = getLocaleLang();
  const dir = getLocaleDir();
  const bodyClass = getBodyClass("link-hub-page");

  return `<!doctype html>
<html lang="${escapeHtml(lang)}" dir="${escapeHtml(dir)}">
<head>
${renderHead({
  title: linkHub.seo.title,
  description: linkHub.seo.description,
  canonical: linkHub.landingPageUrl,
  noindex: true,
  includeListingSchema: false,
})}
</head>
<body${bodyClass ? ` class="${escapeHtml(bodyClass)}"` : ""}>
${renderGtmBody(project.tracking, escapeHtml)}
  <main class="link-hub">
    <div class="link-hub-shell">
      <section class="link-hub-profile">
        <div class="link-hub-profile-panel">
          <div class="link-hub-profile-cover"${linkHub.profile.coverImage ? ` style="background-image: url('${escapeHtml(linkHub.profile.coverImage)}')"` : ""}></div>
          <div class="link-hub-profile-overlay"></div>
          <div class="link-hub-profile-body">
            <div class="link-hub-mark" aria-hidden="true">${linkHub.profile.logo ? `<img src="${escapeHtml(linkHub.profile.logo)}" alt="">` : "OR"}</div>
            <span class="eyebrow">${escapeHtml(linkHub.profile.eyebrow)}</span>
            <div class="link-hub-handle">${escapeHtml(linkHub.profile.handle)}</div>
            <h1>${escapeHtml(linkHub.profile.title)}</h1>
            <p class="link-hub-subtitle">${escapeHtml(linkHub.profile.subtitle)}</p>
            <p class="link-hub-note">${escapeHtml(linkHub.profile.note)}</p>
            ${renderLinkHubJumpNav(linkHub.sections)}
          </div>
        </div>
      </section>
      <div class="link-hub-stack">
        ${renderLinkHubSections()}
      </div>
    </div>
  </main>
</body>
</html>`;
};

const renderLeadFormPanel = (formLabels, options = {}) => {
  const panelClass = ["form-panel", "lead-strip-panel", options.panelClassName].filter(Boolean).join(" ");
  const headingClass = ["lead-strip-heading", options.headingClassName].filter(Boolean).join(" ");
  const formClass = options.formClassName || "";
  const panelId = options.id ? ` id="${escapeHtml(options.id)}"` : "";

  return `
        <div class="${escapeHtml(panelClass)}"${panelId} aria-label="${escapeHtml(project.form.title)}">
          <div class="${escapeHtml(headingClass)}">
            <div>
              <span class="eyebrow">${escapeHtml(t("request_information_eyebrow"))}</span>
              <h2 class="section-title">${escapeHtml(project.form.title)}</h2>
            </div>
            <p class="section-copy">${renderBrandText(project.form.text)}</p>
          </div>
          <form id="landingLeadForm"${formClass ? ` class="${escapeHtml(formClass)}"` : ""} novalidate>
            <div class="field-grid">
              ${renderNameFields(formLabels)}
              <div class="field is-phone" id="phoneField">
                <label for="landing_phone">${escapeHtml(formLabels.phone)}</label>
                <div class="phone-input-row">
                  ${renderPhoneCountryPicker()}
                  <input id="landing_phone" name="phone" type="tel" inputmode="tel" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="20" placeholder="${escapeHtml(t("form_phone_placeholder"))}" required>
                </div>
                <div class="field-error">${escapeHtml(t("form_phone_error"))}</div>
              </div>
              <div class="field" id="emailField">
                <label for="landing_email">${escapeHtml(formLabels.email)}</label>
                <input id="landing_email" name="email" type="email" autocomplete="email" placeholder="email@example.com" required>
                <div class="field-error">${escapeHtml(t("form_email_error"))}</div>
              </div>
              <div class="field is-message" id="messageField">
                <label for="landing_message">${escapeHtml(formLabels.message)}</label>
                <textarea id="landing_message" name="message" rows="3" maxlength="600" placeholder="${escapeHtml(t("form_message_placeholder"))}" required></textarea>
                <div class="field-error">${escapeHtml(t("form_message_error"))}</div>
              </div>
              <div class="field payload-hidden" id="projectField" hidden>
                <label for="landing_preferred_project">${escapeHtml(formLabels.project)}</label>
                <input id="landing_preferred_project" name="preferred_project" type="hidden" value="${escapeHtml(project.form.defaultPreferredProject || project.form.preferredProjects?.[0] || project.name)}">
              </div>
              <div class="field payload-hidden" id="propertyTypeField" hidden>
                <label for="landing_property_type">${escapeHtml(formLabels.propertyType)}</label>
                <input id="landing_property_type" name="property_type" type="hidden" value="${escapeHtml(project.form.defaultPropertyType || project.form.propertyTypes?.[0] || "Apartment")}">
              </div>
            </div>
            <input id="landing_gclid" name="gclid" type="hidden">
            <input id="landing_gbraid" name="gbraid" type="hidden">
            <input id="landing_wbraid" name="wbraid" type="hidden">
            <input id="landing_lead_id" name="lead_id" type="hidden">
            <input id="landing_website" class="hidden-field" name="landing_website" type="text" tabindex="-1" autocomplete="off">
            <div class="btn-outer lead-strip-submit">
              <div class="btn-glow-ring"></div>
              <div class="btn-border-ring"></div>
              <button id="landingSubmitBtn" class="btn btn-primary" type="submit">${escapeHtml(t("form_submit"))}</button>
            </div>
            ${project.form.privacyText ? `<p class="disclaimer form-security-note">${renderBrandText(project.form.privacyText)}</p>` : ""}
            <p class="disclaimer">${renderBrandText(project.form.consent)}</p>
            <div id="landingFormError" class="form-error">${renderBrandText(t("form_submit_error"))}</div>
          </form>
          ${project.form.trustBadges?.length ? `<div class="raw-form-trust" aria-label="${escapeHtml(t("trust_eyebrow"))}">
            ${project.form.trustBadges
              .map(
                (item) => `<span>
                  <i class="${escapeHtml(item.icon || "ti ti-shield-check")}" aria-hidden="true"></i>
                  ${escapeHtml(item.label)}
                </span>`,
              )
              .join("")}
          </div>` : ""}
          <div id="landingSuccess" class="form-success">
            <h3>${escapeHtml(t("form_success_title"))}</h3>
            <p class="section-copy">${renderBrandText(project.form.successText || `${t("form_success_copy_prefix")} ${project.name}.`)}</p>
          </div>
        </div>`;
};

const renderLeadFormSection = (formLabels, options = {}) => {
  const sectionClass = ["lead-strip-section", options.className].filter(Boolean).join(" ");
  const shellClass = options.useShell === false ? "lead-strip-inline-shell" : "shell";

  return `
    <section class="${escapeHtml(sectionClass)}" id="contact" aria-label="${escapeHtml(project.form.title)}">
      <div class="${escapeHtml(shellClass)}">
        ${renderLeadFormPanel(formLabels)}
      </div>
    </section>`;
};

const renderLeadPopup = (formLabels) => `
  <div class="lead-popup" data-lead-popup hidden aria-hidden="true">
    <div class="lead-popup-backdrop" data-lead-popup-close></div>
    <section class="lead-popup-dialog" role="dialog" aria-modal="true" aria-labelledby="leadPopupTitle">
      <button class="lead-popup-close" type="button" data-lead-popup-close aria-label="${escapeHtml(t("whatsapp_close"))}">${escapeHtml(t("whatsapp_close"))}</button>
      <div class="lead-popup-heading">
        <span class="eyebrow">${escapeHtml(t("request_information_eyebrow"))}</span>
        <h2 id="leadPopupTitle">${escapeHtml(project.form.title)}</h2>
        <p>${renderBrandText(project.form.text)}</p>
      </div>
      <form id="leadPopupForm" class="lead-popup-form" data-popup-lead-form novalidate>
        <div class="field-grid">
          <div class="field" id="leadPopupNameField" data-popup-field="name">
            <label for="lead_popup_full_name">${escapeHtml(formLabels.name)}</label>
            <input id="lead_popup_full_name" name="full_name" type="text" autocomplete="name" placeholder="Full name" required>
            <div class="field-error">${escapeHtml(t("form_name_error"))}</div>
          </div>
          <div class="field is-phone" id="leadPopupPhoneField" data-popup-field="phone">
            <label for="lead_popup_phone">${escapeHtml(formLabels.phone)}</label>
            <div class="phone-input-row">
              ${renderPhoneCountryPicker({
                inputId: "lead_popup_phone_country",
                inputName: "phone_country_code",
                pickerKey: "lead_popup",
                searchId: "lead_popup_country_search",
                includeOptions: false,
              })}
              <input id="lead_popup_phone" name="phone" type="tel" inputmode="tel" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="20" placeholder="${escapeHtml(t("form_phone_placeholder"))}" required>
            </div>
            <div class="field-error">${escapeHtml(t("form_phone_error"))}</div>
          </div>
          <div class="field" id="leadPopupEmailField" data-popup-field="email">
            <label for="lead_popup_email">${escapeHtml(formLabels.email)}</label>
            <input id="lead_popup_email" name="email" type="email" autocomplete="email" placeholder="email@example.com" required>
            <div class="field-error">${escapeHtml(t("form_email_error"))}</div>
          </div>
          <div class="field is-message" id="leadPopupMessageField" data-popup-field="message">
            <label for="lead_popup_message">${escapeHtml(formLabels.message)}</label>
            <textarea id="lead_popup_message" name="message" rows="3" maxlength="600" placeholder="${escapeHtml(t("form_message_placeholder"))}" required></textarea>
            <div class="field-error">${escapeHtml(t("form_message_error"))}</div>
          </div>
        </div>
        <div id="leadPopupError" class="form-error">${renderBrandText(t("form_submit_error"))}</div>
        <button id="leadPopupSubmit" class="btn btn-primary" type="submit">${escapeHtml(t("form_submit"))}</button>
        <p class="disclaimer">${renderBrandText(project.form.consent)}</p>
      </form>
    </section>
  </div>`;

const renderRawTemplateGallery = () => {
  const items = project.gallery.items || [];
  const feature = items[0] || { eyebrow: project.gallery.eyebrow, title: project.gallery.title, image: project.hero.background };
  const sideItems = items.slice(1, 3);
  while (sideItems.length < 2) sideItems.push(feature);
  const titleMarkup = project.gallery.title.includes("Atmospheres.")
    ? `${escapeHtml(project.gallery.title.replace("Atmospheres.", ""))}<em>Atmospheres.</em>`
    : escapeHtml(project.gallery.title);

  return `<section class="section raw-template-gallery" id="gallery">
      <div class="shell">
        <div class="section-kicker raw-template-centered">
          <span class="eyebrow">${escapeHtml(project.gallery.eyebrow)}</span>
          <h2 class="section-title">${titleMarkup}</h2>
          ${project.gallery.text ? `<p class="section-copy">${escapeHtml(project.gallery.text)}</p>` : ""}
        </div>
        <div class="raw-gallery-grid">
          <article class="raw-gallery-item raw-gallery-feature">
            <img src="${escapeHtml(withAssetVersion(feature.image))}" alt="${escapeHtml(feature.title)}" loading="eager" decoding="async">
            <span>${escapeHtml(feature.eyebrow)}</span>
          </article>
          ${sideItems
            .map(
              (item) => `<article class="raw-gallery-item">
                  <img src="${escapeHtml(withAssetVersion(item.image))}" alt="${escapeHtml(item.title)}" loading="eager" decoding="async">
                  <span>${escapeHtml(item.eyebrow)}</span>
                </article>`,
            )
            .join("")}
        </div>
      </div>
    </section>`;
};

const renderRawTemplateValueCards = () => {
  const icons = ["ti ti-train", "ti ti-device-mobile", "ti ti-building-community", "ti ti-credit-card"];
  return `<section class="section raw-template-value">
      <div class="shell">
        <div class="raw-value-grid">
          ${project.snapshot.items
            .map(
              (item, index) => `<article class="raw-value-card">
                <i class="${escapeHtml(icons[index] || "ti ti-building-skyscraper")}" aria-hidden="true"></i>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </article>`,
            )
            .join("")}
        </div>
      </div>
    </section>`;
};

const renderRawTemplateLocation = () => {
  const image = project.location.image || project.gallery.items?.[4]?.image || project.hero.background;
  const mapUrl = project.location.mapUrl || "";
  const mapEmbedUrl = project.location.mapEmbedUrl || "";
  return `<section class="section raw-template-location" id="location">
      <div class="shell raw-location-grid">
        <div>
          <span class="eyebrow">${escapeHtml(project.location.eyebrow)}</span>
          <h2 class="section-title">${escapeHtml(project.location.title)}</h2>
          <ul class="location-list">
            ${renderLocationBullets()}
          </ul>
          ${mapUrl ? `<a class="raw-map-link btn btn-primary" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener" data-map-link data-cta-location="location_map">
            <i class="ti ti-map-pin" aria-hidden="true"></i>
            <span>Open in Google Maps</span>
          </a>` : ""}
        </div>
        <figure class="raw-location-media${mapEmbedUrl ? " raw-location-map" : ""}">
          ${mapEmbedUrl ? `<iframe src="${escapeHtml(mapEmbedUrl)}" title="${escapeHtml(`${project.name} map location`)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>` : `<img src="${escapeHtml(withAssetVersion(image))}" alt="${escapeHtml(project.location.title)}" loading="eager" decoding="async">`}
        </figure>
      </div>
    </section>`;
};

const renderRawTemplateConsultantCta = () => {
  const isArabic = getLocaleLang() === "ar";
  const label = isArabic ? "إرشاد مستشار عقاري" : "Property consultant guidance";
  const title = isArabic
    ? "راجع Raw District مع مستشار عقاري قبل اتخاذ القرار."
    : "Review Raw District with a property consultant before you decide.";
  const body = isArabic
    ? "يمكن لمستشار عقاري من Oaklyn Realty توضيح الأسعار الحالية، التوافر، خطة الدفع، تفاصيل الموقع، والخطوة الأنسب لاستفسارك."
    : "A licensed Oaklyn Realty consultant can walk you through current pricing, availability, payment plan, location details, and the next step that fits your inquiry.";
  const cta = isArabic ? "تواصل عبر واتساب" : "Chat on WhatsApp";
  return `
    <section class="raw-consultant-section" aria-label="${escapeHtml(label)}">
      <div class="shell raw-consultant-card">
        <div class="raw-consultant-copy">
          <span class="raw-consultant-mark" aria-hidden="true">"</span>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(body)}</p>
          ${renderWhatsAppLink({ className: "raw-consultant-whatsapp", label: cta, location: "consultant_section" })}
        </div>
        <figure class="raw-consultant-photo">
          <img src="${escapeHtml(withAssetVersion("/assets/raw-district/photos/oaklyn-property-consultant.jpg"))}" alt="Oaklyn Realty property consultant" loading="lazy" decoding="async">
        </figure>
      </div>
    </section>`;
};

const renderRawTemplateTrustBanner = () => `
    <section class="raw-template-trust">
      <div class="shell">
        <i class="ti ti-shield-check" aria-hidden="true"></i>
        <h2>${escapeHtml(t("trust_title"))}</h2>
        <p>${renderBrandText(project.form.sensitiveDataNotice || t("footer_about_text"))}</p>
        <div class="raw-trust-points">
          <span><i class="ti ti-lock" aria-hidden="true"></i>${escapeHtml(t("verification_trust_1").replace(/[🔒✓🛡]/g, "").trim())}</span>
          <span><i class="ti ti-certificate" aria-hidden="true"></i>${escapeHtml(t("verification_trust_2").replace(/[🔒✓🛡]/g, "").trim())}</span>
          <span><i class="ti ti-shield-lock" aria-hidden="true"></i>${escapeHtml(t("verification_trust_3").replace(/[🔒✓🛡]/g, "").trim())}</span>
        </div>
      </div>
    </section>`;

const renderRawTemplateLaunchBanner = () => {
  if (!project.launchBanner?.text) return "";
  return `<div class="raw-launch-banner">${escapeHtml(project.launchBanner.text)}</div>`;
};

const renderRawTemplateNav = () => `
  <header class="topbar raw-template-nav">
    <div class="shell nav">
      <a class="brand raw-brand-wordmark" href="${escapeHtml(project.homeHref || "/")}" aria-label="${escapeHtml(company.company)} ${escapeHtml(project.name)} ${escapeHtml(t("brand_aria_suffix"))}">
        <span>RAW DISTRICT</span>
      </a>
      <nav class="nav-links" aria-label="${escapeHtml(t("primary_nav_aria"))}">
        <a href="#overview">Thesis</a>
        <a href="#gallery">Architecture</a>
        <a href="#location">Investment</a>
        <a href="#gallery">${escapeHtml(t("nav_gallery"))}</a>
      </nav>
      <div class="nav-actions">
        <a class="btn btn-primary" href="#contact">${escapeHtml(t("nav_request_details"))}</a>
      </div>
    </div>
  </header>`;

const renderRawArabicTemplateLandingPage = ({ formLabels, options = {} }) => {
  const lang = getLocaleLang();
  const dir = getLocaleDir();
  const bodyClass = getBodyClass("template-raw-ar", project.launchBanner?.text ? "has-launch-banner" : "");
  return `<!doctype html>
<html lang="${escapeHtml(lang)}" dir="${escapeHtml(dir)}">
<head>
${renderHead({
  title: project.seo.title,
  description: project.seo.description,
  canonical: project.landingPageUrl,
  noindex: Boolean(options.noindex),
})}
  <script>window.OAKLYN_LANDING_CONFIG = ${json(getClientConfig(options))};</script>
</head>
<body${bodyClass ? ` class="${escapeHtml(bodyClass)}"` : ""}>
${renderGtmBody(project.tracking, escapeHtml)}
${options.publicLanguageEntry ? renderLanguageChoiceOverlay() : ""}
${renderRawTemplateLaunchBanner()}
${renderRawTemplateNav()}
  <main class="raw-template-page">
    <section class="hero raw-template-hero">
      ${renderHeroVisual()}
      <div class="hero-shade"></div>
      <div class="shell raw-hero-grid">
        <div class="hero-content">
          <span class="eyebrow">${escapeHtml(project.name)}</span>
          <h1>${escapeHtml(project.hero.title)}</h1>
          <p>${escapeHtml(project.hero.subtitle)}</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="#contact">${escapeHtml(project.hero.primaryCta)}</a>
            <a class="btn btn-ghost" href="#contact"><span>${escapeHtml(project.hero.secondaryCta)}</span><i class="ti ti-download" aria-hidden="true"></i></a>
          </div>
        </div>
      </div>
    </section>
    <section class="raw-hero-highlights" id="overview" aria-label="${escapeHtml(t("quick_highlights_title"))}">
      <div class="highlight-grid">
        ${renderHighlights()}
      </div>
    </section>

    ${renderRawTemplateGallery()}
    ${renderRawTemplateValueCards()}
    ${renderRawTemplateLocation()}
    ${renderRawTemplateConsultantCta()}
    ${renderLeadFormSection(formLabels, { className: "raw-template-contact" })}
    ${renderFaq()}
    ${renderRawTemplateTrustBanner()}
  </main>
  ${renderFooter()}
  ${renderWhatsAppFloat()}
  ${renderPermitQrBadge()}
  ${renderWhatsAppModal()}
  ${renderLeadPopup(formLabels)}
  <div class="mobile-contact-bar">
    <a href="tel:${escapeHtml(company.phoneHref)}">${escapeHtml(t("mobile_call"))}</a>
    ${renderWhatsAppLink({ label: t("mobile_whatsapp"), location: "mobile_contact_bar" })}
  </div>
  ${renderVerificationOverlay()}
  <script src="/client.js?v=${escapeHtml(project.assetVersion)}" defer></script>
</body>
</html>`;
};

const renderLandingPage = (nextProject, options = {}) => {
  setProject(nextProject);
  const formLabels = getFormLabels();
  if (project.landingTemplate === "raw-ar-attached-template") {
    return renderRawArabicTemplateLandingPage({ formLabels, options });
  }

  const lang = getLocaleLang();
  const dir = getLocaleDir();
  const bodyClass = getBodyClass();
  return `<!doctype html>
<html lang="${escapeHtml(lang)}" dir="${escapeHtml(dir)}">
<head>
${renderHead({
  title: project.seo.title,
  description: project.seo.description,
  canonical: project.landingPageUrl,
  noindex: Boolean(options.noindex),
})}
  <script>window.OAKLYN_LANDING_CONFIG = ${json(getClientConfig(options))};</script>
</head>
<body${bodyClass ? ` class="${escapeHtml(bodyClass)}"` : ""}>
${renderGtmBody(project.tracking, escapeHtml)}
${options.publicLanguageEntry ? renderLanguageChoiceOverlay() : ""}
${renderNav()}
  <main>
    <section class="hero">
      ${renderHeroVisual()}
      <div class="hero-shade"></div>
      <div class="shell hero-content">
        <span class="eyebrow">${renderBrandText(project.hero.eyebrow)}</span>
        <h1>${escapeHtml(project.hero.title)}</h1>
        <p>${escapeHtml(project.hero.subtitle)}</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="#contact">${escapeHtml(project.hero.primaryCta)}</a>
          <a class="btn btn-ghost" href="#contact">${escapeHtml(project.hero.secondaryCta)}</a>
          <a class="btn btn-whatsapp" href="${escapeHtml(getWhatsAppHref())}" target="_blank" rel="noopener" data-whatsapp-cta data-cta-location="hero_whatsapp" data-whatsapp-destination="${escapeHtml(getWhatsAppHref())}">
            <i class="ti ti-brand-whatsapp" aria-hidden="true"></i>
            <span>${escapeHtml(t("hero_whatsapp_cta"))}</span>
          </a>
        </div>
      </div>
    </section>

    ${renderLeadFormSection(formLabels)}

    <section class="section quick-highlights" id="overview">
      <div class="shell">
        <div class="section-kicker">
          <span class="eyebrow">${escapeHtml(t("quick_highlights_eyebrow"))}</span>
          <h2 class="section-title">${escapeHtml(t("quick_highlights_title"))}</h2>
        </div>
        <div class="highlight-grid">
          ${renderHighlights()}
        </div>
      </div>
    </section>

    ${renderUnitCardsSection()}

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
          <div class="gallery-progress" aria-hidden="true"><span data-gallery-progress></span></div>
        </div>
        <div class="gallery-controls">
          <div class="gallery-dots">${renderGalleryDots()}</div>
          <div class="gallery-arrows">
            <button class="gallery-arrow" type="button" aria-label="${escapeHtml(t("gallery_prev"))}" data-gallery-prev>←</button>
            <button class="gallery-arrow" type="button" aria-label="${escapeHtml(t("gallery_next"))}" data-gallery-next>→</button>
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

    ${renderAboutUsSection()}

    ${renderFaq()}

    <section class="section trust-compliance">
      <div class="shell">
        <div class="section-kicker">
          <span class="eyebrow">${escapeHtml(t("trust_eyebrow"))}</span>
          <h2 class="section-title">${escapeHtml(t("trust_title"))}</h2>
        </div>
        <div class="compliance-grid">${renderComplianceCards()}</div>
        ${renderPermitNote()}
      </div>
    </section>
  </main>
  ${renderFooter()}
  ${renderWhatsAppFloat()}
  ${renderPermitQrBadge()}
  ${renderWhatsAppModal()}
  <div class="mobile-contact-bar">
    <a href="tel:${escapeHtml(company.phoneHref)}">${escapeHtml(t("mobile_call"))}</a>
    ${renderWhatsAppLink({ label: t("mobile_whatsapp"), location: "mobile_contact_bar" })}
  </div>
  ${renderVerificationOverlay()}
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
})();
</script>`;

const renderThankYouLanguageRedirect = () => `<script>
(function () {
  try {
    var params = new URLSearchParams(window.location.search);
    var storedLang = "";
    try {
      storedLang = window.localStorage.getItem(${JSON.stringify(languagePreferenceStorageKey)}) || "";
    } catch (error) {}
    var lang = String(params.get("lang") || storedLang || "").toLowerCase();
    if (lang !== "ar") return;
    var target = new URL("/${trimSlashes(arabicProject.alternateThankYouPath)}/", window.location.origin);
    params.forEach(function (value, key) {
      target.searchParams.set(key, value);
    });
    window.location.replace(target.pathname + target.search + window.location.hash);
  } catch (error) {}
})();
</script>`;

const renderThankYouPage = ({ currentProject, canonical, backHref, languageRedirect = false }) => {
  setProject(currentProject);
  const lang = getLocaleLang();
  const dir = getLocaleDir();
  const bodyClass = getBodyClass();
  const thankYouBodyClass = [bodyClass, "thank-you-page"].filter(Boolean).join(" ");
  return `<!doctype html>
<html lang="${escapeHtml(lang)}" dir="${escapeHtml(dir)}">
<head>
${renderHead({
  title: `${t("thank_you_meta_title_prefix")} | ${project.name} | ${company.company}`,
  description: t("thank_you_meta_description"),
  canonical,
  noindex: true,
  extraHeadBeforeGtm: languageRedirect ? renderThankYouLanguageRedirect() : "",
})}
</head>
<body${thankYouBodyClass ? ` class="${escapeHtml(thankYouBodyClass)}"` : ""}>
${renderGtmBody(project.tracking, escapeHtml)}
${renderNav()}
  <main class="thank-you-main">
    <section class="thank-you-hero">
      <div class="thank-you-bg" style="background-image: url('${escapeHtml(withAssetVersion(project.hero.background))}');"></div>
      <div class="thank-you-shade" aria-hidden="true"></div>
      <div class="shell thank-you-shell">
        <section class="thank-you-card">
          <span class="eyebrow">${escapeHtml(t("thank_you_eyebrow"))}</span>
          <div class="thank-you-icon" aria-hidden="true">
            <i class="ti ti-shield-check"></i>
          </div>
          <h1>${escapeHtml(t("thank_you_title"))}</h1>
          <p class="section-copy">${renderBrandText(project.form.thankYouText || `${t("thank_you_copy_prefix")} ${project.name}. ${t("thank_you_copy_suffix")}`)}</p>
          <div class="thank-you-details">
            <span>${escapeHtml(project.name)}</span>
            <span>${escapeHtml(company.phoneDisplay)}</span>
          </div>
          <div class="cta-row">
            <a class="btn btn-primary" href="${escapeHtml(backHref)}">${escapeHtml(t("back_to_project"))}</a>
            <a class="btn btn-ghost" href="${escapeHtml(company.contactUrl)}">${escapeHtml(t("contact_oaklyn"))}</a>
          </div>
        </section>
      </div>
    </section>
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

const writeRootFile = async (relativePath, contents) => {
  const target = path.join(rootDir, relativePath);
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

const publicRoutePath = trimSlashes(landingProject.publicRoutePath || landingProject.routePath);
const publicThankYouPath = trimSlashes(landingProject.publicThankYouPath || "thank-you");
const internalEnglishRoutePath = trimSlashes(landingProject.routePath);
const internalEnglishThankYouPath = trimSlashes(landingProject.alternateThankYouPath);
const internalArabicRoutePath = trimSlashes(arabicProject?.routePath);
const internalArabicThankYouPath = trimSlashes(arabicProject?.alternateThankYouPath);

const standaloneLanguageRoutes = {
  en: "/index.html",
  ar: "/index.html"
};
const standaloneEnglishHtml = renderLandingPage(landingProject, {
  languageRoutes: standaloneLanguageRoutes
});
await writeGeneratedFile("index-en.html", standaloneEnglishHtml);
await writeRootFile("index-en.html", standaloneEnglishHtml);
await writeGeneratedFile("index.html", standaloneEnglishHtml);
await writeRootFile("index.html", standaloneEnglishHtml);
await writeGeneratedFile("index-ar.html", standaloneEnglishHtml);
await writeRootFile("index-ar.html", standaloneEnglishHtml);

if (publicRoutePath) {
  const publicRouteHtml = renderLandingPage(landingProject);
  await writeGeneratedFile(`${publicRoutePath}/index.html`, publicRouteHtml);
  await writeRootFile(`${publicRoutePath}/index.html`, publicRouteHtml);
}

if (publicThankYouPath) {
  const publicThankYouHtml = renderThankYouPage({
    currentProject: landingProject,
    canonical: landingProject.thankYouPageUrl,
    backHref: landingProject.homeHref || "/",
    languageRedirect: false,
  });
  await writeGeneratedFile(`${publicThankYouPath}/index.html`, publicThankYouHtml);
  await writeRootFile(`${publicThankYouPath}/index.html`, publicThankYouHtml);
}

if (internalEnglishRoutePath) {
  await writeGeneratedFile(`${internalEnglishRoutePath}/index.html`, renderLandingPage(landingProject, { noindex: true }));
}

if (internalEnglishThankYouPath) {
  const internalEnglishThankYouHtml = renderThankYouPage({
    currentProject: landingProject,
    canonical: landingProject.thankYouPageUrl,
    backHref: landingProject.homeHref || (publicRoutePath ? `/${publicRoutePath}/` : "/"),
  });
  await writeGeneratedFile(`${internalEnglishThankYouPath}/index.html`, internalEnglishThankYouHtml);
  await writeRootFile(`${internalEnglishThankYouPath}/index.html`, internalEnglishThankYouHtml);
}

const linkHubRoutePath = trimSlashes(landingProject.linkHub?.routePath);
if (linkHubRoutePath) {
  await writeGeneratedFile(`${linkHubRoutePath}/index.html`, renderLinkHubPage(landingProject));
}

if (internalArabicRoutePath) {
  await writeGeneratedFile(`${internalArabicRoutePath}/index.html`, renderLandingPage(landingProject, { noindex: true }));
}

if (internalArabicThankYouPath) {
  const internalArabicThankYouHtml = renderThankYouPage({
    currentProject: landingProject,
    canonical: landingProject.thankYouPageUrl,
    backHref: landingProject.homeHref || (publicRoutePath ? `/${publicRoutePath}/` : "/"),
  });
  await writeGeneratedFile(`${internalArabicThankYouPath}/index.html`, internalArabicThankYouHtml);
  await writeRootFile(`${internalArabicThankYouPath}/index.html`, internalArabicThankYouHtml);
}

await copyFile(path.join(rootDir, "src", "styles.css"), path.join(distDir, "styles.css"));
await copyFile(path.join(rootDir, "src", "client.js"), path.join(distDir, "client.js"));
await copyFile(path.join(rootDir, "src", "styles.css"), path.join(rootDir, "styles.css"));
await copyFile(path.join(rootDir, "src", "client.js"), path.join(rootDir, "client.js"));
await copyRequiredAssets();

console.log(`Built ${landingProject.name} landing project in ${distDir}`);
