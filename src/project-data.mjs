import { phoneCountries } from "./country-codes.mjs";
import { getTrackingConfig } from "../shared/gtm.mjs";

const asset = (name) => `/assets/raw-district/${name}`;

export const project = {
  name: "Raw District by IMTIAZ",
  slug: "raw-district",
  languageCode: "en",
  sourcePage: "raw-district.oaklynrealty.ae",
  landingPageUrl: "https://raw-district.oaklynrealty.ae/",
  thankYouPageUrl: "https://raw-district.oaklynrealty.ae/thank-you/",
  publicRoutePath: "/raw-district",
  publicThankYouPath: "/thank-you",
  routePath: "/__oaklyn-lang/en",
  alternateThankYouPath: "/__oaklyn-lang/en-thank-you",
  homeHref: "/",
  assetVersion: "20260610-raw-template-en",
  landingTemplate: "raw-ar-attached-template",
  launchBanner: null,
  webhookUrl: "https://hooks.zapier.com/hooks/catch/27424919/uvzwm7a/",
  whatsappWebhookUrl: "https://hooks.zapier.com/hooks/catch/27424919/4brjlen/",
  blacklistCheckUrl:
    "https://script.google.com/a/macros/oaklynrealty.ae/s/AKfycbxlrJjr1Up2ucBrAtOzkHA7gwITMLJEMAtPiAcmge1MkyIzsILTqTE7D3HK92rnuml2/exec?phone_number=%2B971501396674&email=mounir@oaklynrealty.ae&blacklisted=TRUE",
  blacklistTimeoutMs: 8000,
  tracking: getTrackingConfig(),
  showMobileMenu: false,
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
    aboutUrl: "https://www.oaklynrealty.ae/about",
    privacyUrl: "https://oaklynrealty.ae/privacy-policy",
    termsUrl: "https://oaklynrealty.ae/terms-and-conditions",
    contactUrl: "https://oaklynrealty.ae/contact"
  },
  listing: {
    addressLocality: "Downtown Jebel Ali",
    addressRegion: "Dubai",
    addressCountry: "AE",
    developer: "IMTIAZ Developments",
    regulator: "Dubai Land Department"
  },
  seo: {
    title: "Raw District by IMTIAZ Dubai | Downtown Jebel Ali",
    description:
      "Explore Raw District by IMTIAZ in Downtown Jebel Ali, Dubai: furnished units, metro access, prices, payment plan, and Oaklyn Realty guidance.",
    image: asset("photos/template-exterior-master-aerial.png")
  },
  whatsappPrefill: "Hello Oaklyn Realty, I am interested in Raw District by IMTIAZ",
  whatsappDirectUrl:
    "https://wa.me/971505886769?text=Hello%20Oaklyn%20Realty%2C%20I%20am%20interested%20in%20Raw%20District%20by%20IMTIAZ",
  hero: {
    eyebrow: "RAW DISTRICT BY IMTIAZ",
    title: "A furnished live-work address on Sheikh Zayed Road",
    subtitle:
      "Direct metro access in Downtown Jebel Ali, with fully furnished residences designed for practical daily living and long-term usability.",
    background: asset("photos/template-exterior-master-aerial.png"),
    primaryCta: "Request Details",
    secondaryCta: "Request Brochure"
  },
  highlights: [
    { label: "Starting Price", value: "AED 649K" },
    { label: "Location", value: "Downtown Jebel Ali" },
    { label: "Developer", value: "IMTIAZ Developments" },
    { label: "Unit Types", value: "Studio to 3BR" },
    { label: "Payment Plan", value: "20 / 30 / 50" },
    { label: "Handover", value: "Q1 2029*" }
  ],
  details: [
    { label: "Location", value: "Downtown Jebel Ali (Sheikh Zayed Road), Dubai" },
    { label: "Developer", value: "IMTIAZ Developments" },
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
    text: "Selected project visuals for Raw District by IMTIAZ, including exterior, amenities, residences, lifestyle, and district context.",
    items: [
      {
        eyebrow: "Exterior",
        title: "Master project view",
        image: asset("photos/template-exterior-master-aerial.png")
      },
      {
        eyebrow: "Residences",
        title: "Furnished living spaces",
        image: asset("photos/template-interior-living.png")
      },
      {
        eyebrow: "Location",
        title: "City and metro context",
        image: asset("photos/template-skyline-metro.png")
      },
      {
        eyebrow: "Facade",
        title: "Evening residential facade",
        image: asset("photos/template-building-evening.png")
      },
      {
        eyebrow: "Amenities",
        title: "Lounge and social facilities",
        image: asset("photos/template-amenity-lounge.png")
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
      "Raw District by IMTIAZ brings together fully furnished residences, smart home system features, workspaces, and retail in Downtown Jebel Ali on Sheikh Zayed Road. Oaklyn Realty helps you review the project facts before you request updated availability."
  },
  location: {
    eyebrow: "Location",
    title: "Downtown Jebel Ali, Dubai",
    image: asset("photos/template-skyline-metro.png"),
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
      question: "Does Oaklyn Realty provide rental and resale support?",
      answer: "Yes. Oaklyn Realty can support you with rental or resale services when needed, subject to market conditions and availability."
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
    defaultPreferredProject: "General Availability",
    defaultPropertyType: "Apartment",
    consent:
      "By submitting this form, you agree to be contacted by our property consultants regarding your inquiry.",
    trustBadges: [
      { label: "RERA Registered", icon: "ti ti-certificate" },
      { label: "DED Licensed", icon: "ti ti-building-bank" },
      { label: "Data Protected", icon: "ti ti-lock" }
    ],
    sensitiveDataNotice:
      "We do not request sensitive personal information such as passport numbers, Emirates ID, salary information, nationality, religion, or health-related data through this form.",
    blacklistBlockedMessage:
      "Thank you. Your inquiry has already been received.",
    blacklistErrorMessage:
      "Something went wrong. Please try again.",
    disclaimer:
      "All pricing, payment plans, availability, and handover dates remain subject to developer confirmation."
  },
  linkHub: {
    routePath: "/oaklyn-links",
    landingPageUrl: "https://oaklynrealty.ae/oaklyn-links/",
    seo: {
      title: "Oaklyn Realty Links",
      description:
        "Browse Oaklyn Realty pages, project links, and contact points from one clean page."
    },
    profile: {
      logo: "https://oaklynrealty.com/wp-content/uploads/2026/05/logo_landscape.png",
      coverImage: asset("photos/01KRZC2W7944W0BCSM4FNRRT1N.jpg"),
      eyebrow: "Oaklyn Realty",
      handle: "@oaklynrealty",
      title: "Oaklyn Realty Links",
      subtitle:
        "Company pages, project links, and direct contact points in one cleaner mobile-first hub.",
      note: "Template preview only. Replace the placeholder cards with final links before launch."
    },
    sections: [
      {
        title: "Our Pages",
        layout: "compact",
        items: [
          {
            label: "Main Website",
            description: "Primary Oaklyn website link",
            logo: "https://oaklynrealty.com/wp-content/uploads/2026/05/logo_landscape.png",
            href: "https://www.oaklynrealty.ae/"
          },
          {
            label: "About Oaklyn",
            description: "Company profile and brand page",
            logo: "https://oaklynrealty.com/wp-content/uploads/2026/05/logo_landscape.png",
            href: "https://www.oaklynrealty.ae/about"
          },
          {
            label: "Contact Oaklyn",
            description: "Main contact page",
            logo: "https://oaklynrealty.com/wp-content/uploads/2026/05/logo_landscape.png",
            href: "https://www.oaklynrealty.ae/contact"
          }
        ]
      },
      {
        title: "Project Pages",
        layout: "wide",
        items: [
          {
            label: "Raw District by IMTIAZ",
            description: "Project landing page",
            image: asset("photos/01KRZC2W1B776Y1KJ2DHSTR0S1.jpg"),
            href: "https://raw-district.oaklynrealty.ae/"
          },
          {
            label: "Project Page 02",
            description: "Add your second featured project URL",
            icon: "bx bx-building",
            href: ""
          },
          {
            label: "Project Page 03",
            description: "Add your third featured project URL",
            icon: "bx bx-home-alt-2",
            href: ""
          }
        ]
      },
      {
        title: "Contacts",
        layout: "wide",
        items: [
          {
            label: "General Enquiries",
            description: "+971 58 583 5230",
            icon: "bx bxs-phone-call",
            href: "tel:+971585835230"
          },
          {
            label: "WhatsApp Contact",
            description: "+971 50 588 6769",
            icon: "bx bxl-whatsapp",
            href: "https://wa.me/971505886769"
          },
          {
            label: "Contact Sara",
            description: "+971 50 588 6769",
            avatarText: "S",
            href: "https://wa.me/971505886769"
          },
          {
            label: "Office Location",
            description: "Oxford Tower, 607, 6th Floor, Business Bay",
            icon: "bx bxs-map",
            href: "https://maps.app.goo.gl/9ERcbxY2ThDDv4aM6"
          }
        ]
      },
      {
        title: "CEO Contact",
        layout: "compact",
        items: [
          {
            label: "CEO Contact Page",
            description: "Executive profile or direct contact page",
            icon: "bx bx-user-voice",
            href: ""
          }
        ]
      }
    ]
  }
};

export const arabicProject = {
  ...project,
  homeHref: "/",
  name: "Raw District by IMTIAZ",
  slug: "raw-district",
  languageCode: "ar",
  sourcePage: "raw-district.oaklynrealty.ae",
  landingPageUrl: "https://raw-district.oaklynrealty.ae/",
  thankYouPageUrl: "https://raw-district.oaklynrealty.ae/thank-you/",
  routePath: "/__oaklyn-lang/ar",
  alternateThankYouPath: "/__oaklyn-lang/ar-thank-you",
  assetVersion: "20260610-new-ar-template",
  landingTemplate: "raw-ar-attached-template",
  launchBanner: null,
  seo: {
    title: "Raw District Dubai | IMTIAZ Downtown Jebel Ali",
    description:
      "تفاصيل Raw District by IMTIAZ في وسط جبل علي دبي: شقق مفروشة، وصول للمترو، أسعار، خطة دفع، ومساعدة Oaklyn Realty.",
    image: asset("photos/template-exterior-master-aerial.png")
  },
  locale: {
    lang: "ar",
    dir: "rtl"
  },
  showMobileMenu: false,
  whatsappProgressMinMs: 2400,
  brand: {
    ...project.brand,
    company: "Oaklyn Realty",
    legalName: "Oaklyn Real Estate L.L.C.",
    office: "برج أوكسفورد، مكتب ٦٠٧، الطابق السادس، الخليج التجاري، دبي، الإمارات"
  },
  whatsappDirectUrl:
    "https://wa.me/971505886769?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20Oaklyn%20Realty%D8%8C%20%D8%A3%D9%88%D8%AF%20%D9%85%D8%B9%D8%B1%D9%81%D8%A9%20%D8%A7%D9%84%D9%85%D8%B2%D9%8A%D8%AF%20%D8%B9%D9%86%20Raw%20District",
  listing: {
    addressLocality: "Downtown Jebel Ali",
    addressRegion: "Dubai",
    addressCountry: "AE",
    developer: "IMTIAZ Developments",
    regulator: "Dubai Land Department"
  },
  whatsappPrefill: "مرحباً Oaklyn Realty، أود معرفة المزيد عن Raw District",
  hero: {
    eyebrow: "RAW DISTRICT BY IMTIAZ",
    title: "عنوان سكني وعملي متكامل على شارع الشيخ زايد",
    subtitle:
      "مع وصول مباشر للمترو في قلب جبل علي، نقدم لك تجربة معيشية مفروشة بالكامل تجمع بين التصميم العصري والاستخدام اليومي العملي.",
    background: asset("photos/template-exterior-master-aerial.png"),
    primaryCta: "طلب التفاصيل",
    secondaryCta: "طلب الكتيب"
  },
  highlights: [
    { label: "سعر البداية", value: "٦٤٩،٠٠٠ درهم" },
    { label: "الموقع", value: "وسط جبل علي" },
    { label: "المطور", value: "IMTIAZ Developments" },
    { label: "أنواع الوحدات", value: "استوديو إلى ٣ غرف" },
    { label: "خطة الدفع", value: "٢٠ / ٣٠ / ٥٠" },
    { label: "التسليم", value: "الربع الأول ٢٠٢٩*" }
  ],
  unitCardsSection: null,
  details: [
    { label: "الموقع", value: "وسط جبل علي، شارع الشيخ زايد، دبي" },
    { label: "المطور", value: "IMTIAZ Developments" },
    { label: "أنواع الوحدات", value: "استوديو، ١ غرفة، ٢ غرفة، ٣ غرف" },
    { label: "نوع المشروع", value: "شقق، مساحات عمل، وتجـزئة" },
    { label: "سعر البداية", value: "من ٦٤٩،٠٠٠ درهم، وفقاً لتأكيد المطور" },
    { label: "التسليم", value: "الربع الأول ٢٠٢٩، وفقاً لتأكيد المطور" }
  ],
  trustPoints: [
    {
      title: "استشارة Oaklyn Realty",
      text: "يتابع معك مستشار متخصص بتفاصيل المشروع، خيارات الوحدات والخطوات التالية."
    },
    {
      title: "لا بيانات حساسة",
      text: "النموذج يطلب فقط تفاصيل الاستفسار الأساسية."
    }
  ],
  gallery: {
    eyebrow: "المعرض",
    title: "المساكن والمساحات الحيوية",
    text: "صور مختارة لـ Raw District by IMTIAZ، تشمل الواجهة الخارجية، المرافق، المساكن، نمط الحياة وسياق المنطقة.",
    items: [
      {
        eyebrow: "الواجهة الخارجية",
        title: "منظور المشروع الرئيسي",
        image: asset("photos/template-exterior-master-aerial.png")
      },
      {
        eyebrow: "المساكن",
        title: "مساحات معيشة مفروشة",
        image: asset("photos/template-interior-living.png")
      },
      {
        eyebrow: "الموقع",
        title: "سياق المدينة والمترو",
        image: asset("photos/template-skyline-metro.png")
      },
      {
        eyebrow: "الواجهة",
        title: "واجهة سكنية مضاءة",
        image: asset("photos/template-building-evening.png")
      },
      {
        eyebrow: "المرافق",
        title: "ردهة ومرافق اجتماعية",
        image: asset("photos/template-amenity-lounge.png")
      }
    ]
  },
  snapshot: {
    eyebrow: "لماذا هذا المشروع",
    title: "طريقة هادئة لمراجعة Raw District",
    text: "",
    items: [
      {
        title: "ملاءمة مترو مباشر",
        text: "موقع قريب من محطة مترو جبل علي وممر شارع الشيخ زايد."
      },
      {
        title: "منازل ذكية مفروشة بالكامل",
        text: "استوديوهات إلى منازل ٣ غرف بتصاميم عصرية ونظام منزل ذكي."
      },
      {
        title: "بيئة متعددة الاستخدامات",
        text: "شقق سكنية، مساحات عمل، تجزئة ومرافق اجتماعية."
      },
      {
        title: "هيكل دفع مرن",
        text: "تقسيم ٢٠/٣٠/٥٠ المنشور؛ يُعاد تأكيد توقيت القسط الأخير قبل الحجز."
      }
    ]
  },
  about: {
    eyebrow: "نبذة عن المشروع",
    title: "معلومات المشروع بإرشاد أوضح",
    text:
      "Raw District by IMTIAZ يجمع بين المساكن المفروشة بالكامل، ميزات المنزل الذكي، أماكن العمل والتجزئة في وسط جبل علي على شارع الشيخ زايد. Oaklyn Realty تساعدك على مراجعة تفاصيل المشروع قبل طلب آخر المتاح."
  },
  location: {
    eyebrow: "الموقع",
    title: "وسط جبل علي، دبي",
    image: asset("photos/template-skyline-metro.png"),
    bullets: [
      "وصول مباشر لممر شارع الشيخ زايد.",
      "دقيقتان إلى محطة مترو جبل علي.",
      "١٠ دقائق إلى مدينة إكسبو دبي.",
      "٢٠ دقيقة إلى مطار آل مكتوم الدولي."
    ]
  },
  aboutUsSection: null,
  faq: [
    {
      question: "ما هو سعر البداية؟",
      answer: "من ٦٤٩،٠٠٠ درهم، وفقاً لتأكيد المطور."
    },
    {
      question: "ما أنواع العقارات المتاحة؟",
      answer: "شقق، مساحات عمل وتجزئة في منطقة متعددة الاستخدامات."
    },
    {
      question: "هل خطة الدفع ثابتة؟",
      answer: "تقسيم ٢٠/٣٠/٥٠ منشور؛ يُرجى التأكيد مع المطور قبل الحجز."
    },
    {
      question: "هل توفر Oaklyn Realty خدمات التأجير وإعادة البيع؟",
      answer: "نعم. يمكن لفريق Oaklyn Realty مساعدتك في تأجير الوحدة أو دعمك في إعادة البيع عند الحاجة، حسب ظروف السوق والتوافر."
    }
  ],
  form: {
    ...project.form,
    title: "طلب تفاصيل Raw District",
    text: "أدخل بياناتك الأساسية وسيتواصل معك فريق Oaklyn Realty بآخر المتاح وخيارات الوحدات.",
    labels: {
      name: "الاسم الكامل",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني",
      project: "الوحدة المفضلة",
      propertyType: "نوع الاستفسار"
    },
    preferredProjects: ["استوديو", "١ غرفة", "٢ غرفة", "٣ غرف"],
    propertyTypes: ["شراء للسكن", "استثمار", "إعادة بيع", "أخرى"],
    defaultPreferredProject: "استفسار عام",
    defaultPropertyType: "شراء للسكن",
    trustBadges: [
      { label: "مسجل في RERA", icon: "ti ti-certificate" },
      { label: "مرخص من DED", icon: "ti ti-building-bank" },
      { label: "بياناتك محمية", icon: "ti ti-lock" }
    ],
    whatsappAlternativeLabel: "",
    whatsappButtonLabel: "تواصل عبر واتساب",
    privacyText:
      "بياناتك تستخدم فقط للرد على استفسارك العقاري.",
    consent:
      "By submitting this form, you agree to be contacted by our property consultants regarding your inquiry.",
    sensitiveDataNotice:
      "لا نطلب معلومات شخصية حساسة كأرقام جوازات السفر أو الهوية الإماراتية أو معلومات الراتب أو الجنسية أو الدين أو البيانات الصحية.",
    blacklistBlockedMessage:
      "شكراً لك. تم استلام استفسارك مسبقاً.",
    blacklistErrorMessage:
      "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    disclaimer:
      "جميع الأسعار وخطط الدفع والتوافر ومواعيد التسليم تخضع لتأكيد المطور.",
    successText:
      "تم استلام طلبك. سيتواصل معك فريق Oaklyn Realty بخصوص Raw District.",
    thankYouText:
      "استلمت Oaklyn Realty طلبك بخصوص Raw District. نحن لا نطلب بيانات شخصية حساسة عبر هذا النموذج."
  },
  footer: {
    company: "Oaklyn Realty",
    tagline: "معيشة راقية. استثمار ذكي.",
    description:
      "Oaklyn Realty شركة استشارات عقارية متخصصة في دبي تساعد العملاء على اتخاذ قرارات عقارية ذكية تدعم أسلوب الحياة وأهداف الاستثمار طويل المدى.",
    address: "برج أوكسفورد، مكتب ٦٠٧، الطابق السادس، الخليج التجاري، دبي، الإمارات",
    license:
      "Oaklyn Real Estate L.L.C. — رخصة DED: ١٥٨٩٥٩٣ · ORN RERA: ٥٩٢١٠. مرخصة من دائرة الاقتصاد وهيئة التنمية بدبي ودائرة الأراضي والأملاك.",
    copyright: "© ٢٠٢٦ Oaklyn Realty. جميع الحقوق محفوظة.",
    disclaimer:
      "جميع المعلومات الواردة في هذا الموقع مقدمة للإرشاد العام فقط. تفاصيل العقار والأسعار والتوافر عرضة للتغيير دون إشعار مسبق."
  },
  uiText: {
    nav_overview: "نظرة عامة",
    nav_gallery: "المعرض",
    nav_location: "الموقع",
    nav_contact: "تواصل",
    nav_website: "موقعنا",
    nav_request_details: "طلب التفاصيل",
    brand_aria_suffix: "صفحة هبوط",
    primary_nav_aria: "التنقل الرئيسي",
    mobile_nav_aria: "تنقل الجوال",
    hero_whatsapp_cta: "تواصل عبر واتساب",
    mobile_menu_label: "القائمة",
    quick_highlights_eyebrow: "أبرز مميزات الاستثمار",
    quick_highlights_title: "حقائق المشروع في لمحة",
    request_information_eyebrow: "طلب المعلومات",
    basic_enquiry_only: "تفاصيل استفسار أساسية فقط",
    subject_to_confirmation: "وفقاً لتأكيد المطور",
    no_guaranteed_returns: "",
    form_phone_placeholder: "٥٠ ١٢٣ ٤٥٦٧",
    form_phone_error: "يرجى إدخال رقم هاتف دولي صحيح.",
    form_email_error: "يرجى إدخال بريد إلكتروني صحيح.",
    form_select_error: "يرجى اختيار أحد الخيارات.",
    form_submit: "احصل على الأسعار ومخططات الطوابق",
    form_submit_error: "تعذر إرسال الطلب حالياً. حاول مرة أخرى أو تواصل مع Oaklyn Realty مباشرة.",
    form_success_title: "شكراً لك",
    blocked_success_title: "شكراً لك",
    faq_eyebrow: "الأسئلة الشائعة",
    faq_title: "إجابات سريعة",
    trust_eyebrow: "الثقة والامتثال",
    trust_title: "عملية استفسار واضحة وممتثلة",
    footer_about_text:
      "Oaklyn Realty شركة استشارات عقارية متخصصة في دبي تساعد العملاء على اتخاذ قرارات عقارية ذكية تدعم أسلوب الحياة وأهداف الاستثمار طويل المدى.",
    footer_contact_heading: "تواصل معنا",
    footer_legal_heading: "قانوني",
    footer_about_link: "عن Oaklyn",
    footer_contact_link: "اتصل بنا",
    footer_privacy_link: "سياسة الخصوصية",
    footer_terms_link: "الشروط والأحكام",
    footer_copyright:
      "Oaklyn Real Estate L.L.C. — رخصة DED: ١٥٨٩٥٩٣ · ORN RERA: ٥٩٢١٠. مرخصة من دائرة الاقتصاد وهيئة التنمية بدبي ودائرة الأراضي والأملاك.",
    whatsapp_floating_label: "واتساب",
    whatsapp_close: "إغلاق",
    whatsapp_eyebrow: "تحقق سريع",
    whatsapp_title: "تابع إلى واتساب",
    whatsapp_copy: "أدخل رقمك للتحقق السريع قبل فتح واتساب.",
    whatsapp_country_code: "مفتاح الدولة",
    whatsapp_phone: "رقم واتساب",
    whatsapp_phone_placeholder: "٥٠ ١٢٣ ٤٥٦٧",
    whatsapp_phone_error: "يرجى إدخال رقم صحيح للمتابعة.",
    whatsapp_note: "نستخدم هذه الخطوة للتحقق السريع من رقمك قبل فتح واتساب.",
    whatsapp_error: "تعذر المتابعة إلى واتساب الآن. حاول مرة أخرى.",
    whatsapp_continue: "المتابعة إلى واتساب",
    verification_headline_1: "جاري التحقق من معلوماتك...",
    verification_headline_2: "جاري التحقق من التوافر...",
    verification_headline_3: "جاري تأمين موعد استشارتك...",
    verification_headline_4: "جاري التواصل مع مستشارك...",
    verification_sub_1: "هذا يستغرق عادةً بضع ثوانٍ",
    verification_sub_2: "بياناتك مشفرة وآمنة",
    verification_sub_3: "نحن لا نشارك معلوماتك أبداً",
    verification_sub_4: "جاهز تقريباً...",
    verification_trust_1: "🔒 SSL آمن",
    verification_trust_2: "✓ مسجل في RERA",
    verification_trust_3: "🛡 البيانات محمية",
    cancel: "إلغاء",
    gallery_prev: "الصورة السابقة",
    gallery_next: "الصورة التالية",
    gallery_dot_aria: "الانتقال إلى صورة المعرض {index}",
    phone_search_sr_label: "ابحث عن الدولة أو المفتاح",
    phone_search_placeholder: "اكتب اسم الدولة أو المفتاح",
    phone_search_empty: "لا توجد دولة مطابقة.",
    validation_name: "يرجى إدخال الاسم الكامل.",
    validation_first_name: "يرجى إدخال الاسم الأول.",
    validation_last_name: "يرجى إدخال اسم العائلة.",
    thank_you_meta_title_prefix: "شكراً لك",
    thank_you_meta_description: "تم استلام استفسارك العقاري لدى Oaklyn Realty.",
    thank_you_eyebrow: "تم استلام الطلب",
    thank_you_title: "شكراً لك. سيتواصل معك مستشارنا العقاري قريباً.",
    back_to_project: "العودة إلى المشروع",
    contact_oaklyn: "التواصل مع Oaklyn",
    mobile_call: "اتصال",
    mobile_whatsapp: "واتساب"
  }
};
