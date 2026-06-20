import { phoneCountries } from "./country-codes.mjs";
import { getTrackingConfig } from "../shared/gtm.mjs";

const asset = (name) => `/assets/raw-district/${name}`;

export const project = {
  name: "Raw District by IMTIAZ",
  slug: "raw-district-ads-campaign",
  sourcePage: "raw-district.oaklynrealty.ae",
  landingPageUrl: "https://raw-district.oaklynrealty.ae/",
  thankYouPageUrl: "https://raw-district.oaklynrealty.ae/thank-you/",
  routePath: "/raw-district",
  variantBPath: "/variant-b",
  assetVersion: "20260620-github-publish-1",
  webhookUrl: "https://hooks.zapier.com/hooks/catch/27424919/42y0f2c/",
  tracking: getTrackingConfig(),
  cta: "Show Me Prices & Availability",
  microcopy: "Free information • No obligation • Your details remain private",
  whatsappPrefill:
    "Hello Oaklyn Realty, I would like the current prices and availability for Raw District by IMTIAZ.",
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
    termsUrl: "https://oaklynrealty.ae/terms-and-conditions"
  },
  listing: {
    propertyType: "Apartments",
    location: "Downtown Jebel Ali",
    addressLocality: "Downtown Jebel Ali",
    addressRegion: "Dubai",
    addressCountry: "AE",
    developer: "IMTIAZ Developments",
    regulator: "Dubai Land Department",
    startingPrice: "AED 649K",
    bedroomOptions: "Studio to 3 bedroom options",
    paymentPlan: "20 / 30 / 50 payment plan",
    handover: "Q1 2029, subject to developer confirmation"
  },
  compliance: {
    licence: "DED Licence 1589593",
    rera: "RERA ORN 59210",
    permitLabel: "Trakheesi permit",
    permitValue: "Scan QR code",
    permitQr: {
      src: asset("permit/raw-district-permit-qr.jpeg"),
      alt: "Raw District permit QR code"
    }
  },
  seo: {
    title: "Raw District Prices & Availability",
    description:
      "Get Raw District by IMTIAZ prices, floor plans and current availability in Downtown Jebel Ali from Oaklyn Realty."
  },
  media: {
    hero: {
      src: asset("photos/raw-district-exterior-evening.jpg"),
      webp: asset("photos/raw-district-exterior-evening.webp"),
      alt: "Raw District by IMTIAZ exterior evening view"
    },
    heroAlt: {
      src: asset("photos/raw-district-interior-suite.jpeg"),
      webp: asset("photos/raw-district-interior-suite.webp"),
      alt: "Furnished Raw District residence interior"
    },
    locationMap: {
      src: asset("photos/raw-district-aerial-metro.jpg"),
      webp: asset("photos/raw-district-aerial-metro.webp"),
      alt: "Raw District location near the Sheikh Zayed Road corridor and metro access"
    },
    gallery: [
      {
        caption: "Building exterior",
        src: asset("photos/raw-district-exterior-evening.jpg"),
        webp: asset("photos/raw-district-exterior-evening.webp"),
        alt: "Raw District exterior"
      },
      {
        caption: "Living area",
        src: asset("photos/raw-district-interior-suite.jpeg"),
        webp: asset("photos/raw-district-interior-suite.webp"),
        alt: "Furnished Raw District living area"
      },
      {
        caption: "Community amenities",
        src: asset("photos/hero-pool-courtyard.jpg"),
        webp: asset("photos/hero-pool-courtyard.webp"),
        alt: "Raw District amenity courtyard"
      },
      {
        caption: "Workspaces",
        src: asset("photos/gallery-workspaces.jpg"),
        webp: asset("photos/gallery-workspaces.webp"),
        alt: "Raw District workspace amenity"
      }
    ],
    floorPlanRequest: {
      title: "Floor plans shared after request",
      text: "No public floor-plan preview is shown. An advisor will send the relevant layouts for available units."
    },
    videoThumb: {
      src: asset("photos/gallery-podcast-studio.jpg"),
      webp: asset("photos/gallery-podcast-studio.webp"),
      alt: "Video tour thumbnail placeholder"
    }
  },
  hero: {
    eyebrow: "Apartments in Downtown Jebel Ali",
    title: "See Current Prices and Available Apartments in Downtown Jebel Ali",
    subtitle:
      "Receive the official price list, available unit options and floor plans, followed by assistance from a local property advisor.",
    proofPoints: [
      "Official project information",
      "Floor plans and unit options",
      "Advisor follow-up after request"
    ],
    chips: [
      "From AED 649K",
      "Studio to 3 bedroom options",
      "20 / 30 / 50 payment plan"
    ]
  },
  trustStrip: [
    {
      label: "Developer",
      value: "IMTIAZ Developments"
    },
    {
      label: "Brokerage",
      value: "Oaklyn Realty"
    },
    {
      label: "Regulatory details",
      value: "DED 1589593, RERA ORN 59210"
    },
    {
      label: "Project info",
      value: "Current details subject to developer confirmation"
    }
  ],
  benefits: [
    {
      icon: "map",
      title: "Direct location context",
      text: "Review Raw District around Downtown Jebel Ali, Sheikh Zayed Road and metro access."
    },
    {
      icon: "building",
      title: "Furnished unit options",
      text: "Compare studios, 1, 2 and 3 bedroom options based on current availability."
    },
    {
      icon: "wallet",
      title: "Payment-plan clarity",
      text: "Understand the published 20 / 30 / 50 structure before deciding next steps."
    },
    {
      icon: "check",
      title: "Verified availability request",
      text: "Ask for the latest inventory instead of relying on outdated screenshots or posts."
    }
  ],
  location: {
    title: "Raw District by IMTIAZ, Downtown Jebel Ali",
    text:
      "Use the map link to view the Raw District pin in Downtown Jebel Ali and check the route from your current location.",
    mapHref: "https://maps.app.goo.gl/KKVy9kvr2MNMFQcD6",
    mapEmbedSrc:
      "https://maps.google.com/maps?hl=en&q=Raw%20District%20by%20IMTIAZ%2C%20Downtown%20Jebel%20Ali%2C%20Dubai&z=17&output=embed",
    mapCta: "View Raw District on Map",
    landmarks: [
      "2 minutes to Jebel Ali Metro Station",
      "10 minutes to Expo City Dubai",
      "20 minutes to Al Maktoum International Airport",
      "Direct access to Sheikh Zayed Road",
      "Approximate timings, subject to traffic conditions"
    ]
  },
  advisor: {
    name: "Call our property advisor",
    role: "Oaklyn Property Advisor",
    licence: "Licence number to be added before launch",
    languages: "English, Arabic",
    statement:
      "A local advisor will share the relevant unit options, floor plans and current pricing based on your request.",
    photo: {
      src: asset("advisor/raw-district-advisor.jpg"),
      webp: asset("advisor/raw-district-advisor.webp"),
      alt: "Oaklyn Realty property advisor"
    }
  },
  testimonial: {
    label: "Active client testimonial",
    text:
      "Oaklyn Real Estate made our buying experience enjoyable and simple. Their dedication and expertise truly set them apart.",
    attribution: "Sophia Martinez"
  },
  faq: [
    {
      question: "Is the price list current?",
      answer:
        "We request the latest project information before sharing prices. Final figures remain subject to developer confirmation."
    },
    {
      question: "What information will I receive?",
      answer:
        "You will receive the relevant price list, available unit options and floor-plan details for Raw District."
    },
    {
      question: "Can I arrange an in-person or virtual viewing?",
      answer:
        "Yes. An advisor can help arrange the most suitable viewing option when access is available."
    },
    {
      question: "Are payment-plan or financing options available?",
      answer:
        "Published payment-plan details can be shared. Financing options depend on eligibility and lender terms."
    },
    {
      question: "How will my contact information be used?",
      answer:
        "Your details are used only to respond to this Raw District enquiry and arrange relevant follow-up."
    }
  ],
  form: {
    phoneCountries,
    consent:
      "By submitting this form, you agree to be contacted by our property consultants regarding your inquiry.",
    privacyText: "I agree to the contact consent and privacy policy.",
    propertyOptions: ["Studio", "1 bedroom", "2 bedrooms", "3+ bedrooms", "Not sure yet"],
    timeframeOptions: ["Within 3 months", "3-6 months", "6-12 months", "I am researching"],
    contactMethods: ["Call", "WhatsApp", "Email"],
    shortPropertyOptions: ["Studio", "1 bedroom", "2 bedrooms", "3+ bedrooms", "Not sure yet"]
  }
};
