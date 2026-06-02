import { phoneCountries } from "./country-codes.mjs";
import { getTrackingConfig } from "../shared/gtm.mjs";

const asset = (name) => `/assets/raw-district/${name}`;

export const project = {
  name: "Raw District by Imtiaz",
  slug: "raw-district",
  sourcePage: "raw-district.oaklynrealty.ae",
  landingPageUrl: "https://raw-district.oaklynrealty.ae/",
  thankYouPageUrl: "https://raw-district.oaklynrealty.ae/thank-you",
  routePath: "/raw-district",
  alternateThankYouPath: "/raw-district-thank-you-page",
  assetVersion: "20260602-raw-district-sobha-template-1",
  webhookUrl: "https://hooks.zapier.com/hooks/catch/27424919/uvzwm7a/",
  whatsappWebhookUrl: "https://hooks.zapier.com/hooks/catch/27424919/4brjlen/",
  blacklistCheckUrl:
    "https://script.google.com/a/macros/oaklynrealty.ae/s/AKfycbxlrJjr1Up2ucBrAtOzkHA7gwITMLJEMAtPiAcmge1MkyIzsILTqTE7D3HK92rnuml2/exec?phone_number=%2B971501396674&email=mounir@oaklynrealty.ae&blacklisted=TRUE",
  blacklistTimeoutMs: 8000,
  tracking: getTrackingConfig(),
  brand: {
    company: "Oaklyn Realty",
    legalName: "Oaklyn Real Estate L.L.C.",
    phoneDisplay: "+971 58 583 5230",
    phoneHref: "+971585835230",
    whatsappDisplay: "+971 50 588 6769",
    whatsappHref: "+971505886769",
    email: "sales@oaklynrealty.ae",
    office: "Oxford Tower, Office 607, 6th Floor, Business Bay, Dubai, UAE",
    logo: "https://oaklynrealty.com/wp-content/uploads/2026/05/logo_landscape.png",
    mainWebsite: "https://oaklynrealty.ae",
    privacyUrl: "https://oaklynrealty.ae/privacy-policy",
    termsUrl: "https://oaklynrealty.ae/terms-and-conditions",
    contactUrl: "https://oaklynrealty.ae/contact"
  },
  listing: {
    addressLocality: "Downtown Jebel Ali",
    addressRegion: "Dubai",
    addressCountry: "AE",
    developer: "Imtiaz Developments",
    regulator: "Dubai Land Department"
  },
  seo: {
    title: "Raw District by Imtiaz Dubai | Oaklyn Realty",
    description:
      "Review Raw District by Imtiaz with Oaklyn Realty. Explore project facts, gallery, location, and current launch details."
  },
  whatsappPrefill: "Hello, I would like more information about Raw District by Imtiaz.",
  hero: {
    eyebrow: "Presented by Oaklyn Realty",
    title: "Raw District by Imtiaz",
    subtitle:
      "A furnished live-work address on Sheikh Zayed Road with direct metro access, presented with clear project guidance.",
    background: asset("photos/01KRZC2W7944W0BCSM4FNRRT1N.jpg"),
    primaryCta: "Request Details",
    secondaryCta: "Request Brochure"
  },
  highlights: [
    { label: "Starting Price", value: "AED 649K" },
    { label: "Location", value: "Downtown Jebel Ali" },
    { label: "Developer", value: "Imtiaz Developments" },
    { label: "Unit Types", value: "Studio to 3BR" },
    { label: "Payment Plan", value: "20 / 30 / 50" },
    { label: "Handover", value: "Q1 2029*" }
  ],
  details: [
    { label: "Location", value: "Downtown Jebel Ali (Sheikh Zayed Road), Dubai" },
    { label: "Developer", value: "Imtiaz Developments" },
    { label: "Unit Types", value: "Studio, 1, 2, and 3-bedroom fully furnished residences" },
    { label: "Property Type", value: "Apartments, workspaces, and retail" },
    { label: "Starting Price", value: "From AED 649K, subject to developer confirmation" },
    { label: "Handover", value: "Q1 2029, subject to developer confirmation" }
  ],
  trustPoints: [
    {
      title: "Oaklyn Realty advisory",
      text: "A consultant follows up with project details, unit options, and next steps."
    },
    {
      title: "Developer confirmation",
      text: "Pricing, payment plans, inventory, and handover timelines may change."
    },
    {
      title: "No sensitive data",
      text: "The form only asks for basic enquiry details."
    }
  ],
  gallery: {
    eyebrow: "Visual Experience",
    title: "Residences, district spaces, and lifestyle views",
    text: "Selected project visuals for Raw District by Imtiaz, including exterior, amenities, residences, lifestyle, and district context.",
    items: [
      {
        eyebrow: "Exterior",
        title: "Raw District exterior",
        image: asset("photos/01KRZC2W1B776Y1KJ2DHSTR0S1.jpg")
      },
      {
        eyebrow: "Amenities",
        title: "Amenities and social spaces",
        image: asset("photos/01KRZC2WMRPAF9SN1239N0MPXK.jpg")
      },
      {
        eyebrow: "Residences",
        title: "Furnished bedroom interior",
        image: asset("photos/01KRZC2WYQ02R3HJVWTA0HDK6D.jpg")
      },
      {
        eyebrow: "Lifestyle",
        title: "Lifestyle and tower outlook",
        image: asset("photos/01KRZC2WS1CRE6F83PKPAG3W7C.jpg")
      },
      {
        eyebrow: "District",
        title: "District plaza and retail setting",
        image: asset("photos/01KRZC2WFHWTX45AFD24MBXJ7Q.jpg")
      }
    ]
  },
  snapshot: {
    eyebrow: "Why This Project",
    title: "A calm way to review Raw District",
    text: "",
    items: [
      {
        title: "Direct metro convenience",
        text: "Positioned around quick access to Jebel Ali Metro Station and the Sheikh Zayed Road corridor."
      },
      {
        title: "Fully furnished smart homes",
        text: "Studios to 3-bedroom homes with furnished interiors, contemporary layouts, and smart home system features."
      },
      {
        title: "Mixed-use daily environment",
        text: "Apartments, workspaces, retail, and social amenities."
      },
      {
        title: "Flexible payment structure",
        text: "Published 20/30/50 split; final instalment timing reconfirmed before reservation."
      }
    ]
  },
  about: {
    eyebrow: "About The Community",
    title: "Project information with clearer guidance",
    text:
      "Raw District by Imtiaz brings together fully furnished residences, smart home system features, workspaces, and retail in Downtown Jebel Ali on Sheikh Zayed Road. Oaklyn Realty helps you review the project facts before you request updated availability."
  },
  location: {
    eyebrow: "Location",
    title: "Downtown Jebel Ali, Dubai",
    bullets: [
      "Direct access to Sheikh Zayed Road corridor.",
      "2 minutes to Jebel Ali Metro Station.",
      "10 minutes to Expo City Dubai.",
      "20 minutes to Al Maktoum International Airport."
    ]
  },
  faq: [
    {
      question: "What is the starting price?",
      answer: "From AED 649K, subject to developer confirmation."
    },
    {
      question: "What property types are available?",
      answer: "Apartments, workspaces, and retail in a mixed-use district."
    },
    {
      question: "Is the payment plan fixed?",
      answer: "The 20/30/50 split is published; confirm with the developer before reservation."
    },
    {
      question: "Does Oaklyn guarantee returns?",
      answer: "No. Oaklyn does not guarantee ROI, rental income, or resale value."
    }
  ],
  form: {
    title: "Request Raw District Details",
    text: "Share your details and Oaklyn Realty will follow up with current availability, unit options, and payment-plan guidance.",
    splitName: false,
    labels: {
      name: "Full Name",
      phone: "Phone Number",
      email: "Email",
      project: "Preferred Unit",
      propertyType: "Inquiry Type"
    },
    phoneCountries,
    preferredProjects: ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "General Availability"],
    propertyTypes: ["Apartment", "Workspace", "Retail", "Not Sure Yet"],
    consent:
      "By submitting this form, you agree to be contacted by Oaklyn Realty regarding your property inquiry.",
    sensitiveDataNotice:
      "We do not request sensitive personal information such as passport numbers, Emirates ID, salary information, nationality, religion, or health-related data through this form.",
    blacklistBlockedMessage:
      "Thank you. Your inquiry has already been received.",
    blacklistErrorMessage:
      "Something went wrong. Please try again.",
    disclaimer:
      "All pricing, payment plans, availability, and handover dates remain subject to developer confirmation."
  }
};
