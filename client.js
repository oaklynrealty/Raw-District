(function () {
  const shellConfig = window.OAKLYN_LANGUAGE_SHELL;
  if (shellConfig) {
    const params = new URLSearchParams(window.location.search);
    const validLanguages = new Set(["en", "ar"]);
    const storageKey = shellConfig.storageKey || "oaklyn_lang_pref_raw_district";
    const actions = document.getElementById("languageShellActions");
    const loading = document.getElementById("languageShellLoading");

    function readCookie(name) {
      return document.cookie
        .split(";")
        .map(function (part) {
          return part.trim();
        })
        .filter(Boolean)
        .reduce(function (value, part) {
          if (value) return value;
          const prefix = name + "=";
          return part.indexOf(prefix) === 0 ? decodeURIComponent(part.slice(prefix.length)) : "";
        }, "");
    }

    function saveLanguage(lang) {
      if (!validLanguages.has(lang)) return;
      try {
        window.localStorage.setItem(storageKey, lang);
      } catch (error) {}
      document.cookie = storageKey + "=" + encodeURIComponent(lang) + "; path=/; max-age=31536000; SameSite=Lax";
    }

    function getInitialLanguage() {
      const queryLang = String(params.get("lang") || "").trim().toLowerCase();
      if (validLanguages.has(queryLang)) return queryLang;

      try {
        const storedLang = String(window.localStorage.getItem(storageKey) || "").trim().toLowerCase();
        if (validLanguages.has(storedLang)) return storedLang;
      } catch (error) {}

      const cookieLang = String(readCookie(storageKey) || "").trim().toLowerCase();
      if (validLanguages.has(cookieLang)) return cookieLang;

      return "";
    }

    function getTargetUrlWithCurrentQuery(targetUrl, lang) {
      const nextUrl = new URL(targetUrl, window.location.origin);
      params.forEach(function (value, key) {
        if (key === "lang") return;
        if (!nextUrl.searchParams.has(key)) {
          nextUrl.searchParams.set(key, value);
        }
      });
      nextUrl.searchParams.set("lang", lang || "");
      return nextUrl.pathname + nextUrl.search + nextUrl.hash;
    }

    async function loadLanguage(lang) {
      if (!validLanguages.has(lang)) return;
      const targetUrl = shellConfig.routeByLanguage && shellConfig.routeByLanguage[lang];
      if (!targetUrl) return;
      const fallbackUrl = getTargetUrlWithCurrentQuery(targetUrl, lang);

      saveLanguage(lang);

      if (actions) actions.hidden = true;
      if (loading) loading.hidden = false;

      const fallbackTimer = window.setTimeout(function () {
        window.location.href = fallbackUrl;
      }, 2500);

      try {
        const response = await fetch(targetUrl, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin"
        });

        if (!response.ok) {
          throw new Error("Failed to load language page.");
        }

        const html = await response.text();
        window.clearTimeout(fallbackTimer);
        document.open();
        document.write(html);
        document.close();
      } catch (error) {
        window.clearTimeout(fallbackTimer);
        console.error("Language shell load error:", error);
        window.location.href = fallbackUrl;
      }
    }

    const initialLanguage = getInitialLanguage();
    if (initialLanguage) {
      loadLanguage(initialLanguage);
      return;
    }

    if (actions) {
      actions.querySelectorAll("[data-language-choice]").forEach(function (button) {
        button.addEventListener("click", function (event) {
          const targetLanguage = String(button.getAttribute("data-language-choice") || "").trim().toLowerCase();
          if (validLanguages.has(targetLanguage)) {
            event.preventDefault();
            loadLanguage(targetLanguage);
          }
        });
      });
    }

    return;
  }

  const config = window.OAKLYN_LANDING_CONFIG;
  if (!config) return;

  const landingLanguageParams = new URLSearchParams(window.location.search);
  const landingValidLanguages = new Set(["en", "ar"]);
  const languagePreferenceKey = config.language_preference_key || "oaklyn_lang_pref_raw_district";

  function readLandingCookie(name) {
    return document.cookie
      .split(";")
      .map(function (part) {
        return part.trim();
      })
      .filter(Boolean)
      .reduce(function (value, part) {
        if (value) return value;
        const prefix = name + "=";
        return part.indexOf(prefix) === 0 ? decodeURIComponent(part.slice(prefix.length)) : "";
      }, "");
  }

  function saveLandingLanguage(lang) {
    if (!landingValidLanguages.has(lang)) return;
    try {
      window.localStorage.setItem(languagePreferenceKey, lang);
    } catch (error) {}
    document.cookie = languagePreferenceKey + "=" + encodeURIComponent(lang) + "; path=/; max-age=31536000; SameSite=Lax";
  }

  function getStoredLandingLanguage() {
    try {
      const storedLang = String(window.localStorage.getItem(languagePreferenceKey) || "").trim().toLowerCase();
      if (landingValidLanguages.has(storedLang)) return storedLang;
    } catch (error) {}

    const cookieLang = String(readLandingCookie(languagePreferenceKey) || "").trim().toLowerCase();
    return landingValidLanguages.has(cookieLang) ? cookieLang : "";
  }

  function getLandingLanguageRoute(targetUrl, lang) {
    const nextUrl = new URL(targetUrl, window.location.origin);
    landingLanguageParams.forEach(function (value, key) {
      if (key === "lang") return;
      if (!nextUrl.searchParams.has(key)) {
        nextUrl.searchParams.set(key, value);
      }
    });
    nextUrl.searchParams.set("lang", lang || "");
    return nextUrl.pathname + nextUrl.search + nextUrl.hash;
  }

  async function loadLandingLanguage(lang, elements) {
    if (!landingValidLanguages.has(lang)) return;
    const targetUrl = config.language_routes && config.language_routes[lang];
    if (!targetUrl) return;
    const fallbackUrl = getLandingLanguageRoute(targetUrl, lang);

    saveLandingLanguage(lang);

    if (elements && elements.actions) elements.actions.hidden = true;
    if (elements && elements.loading) elements.loading.hidden = false;

    const fallbackTimer = window.setTimeout(function () {
      window.location.href = fallbackUrl;
    }, 2500);

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin"
      });

      if (!response.ok) {
        throw new Error("Failed to load selected language.");
      }

      const html = await response.text();
      window.clearTimeout(fallbackTimer);
      document.open();
      document.write(html);
      document.close();
    } catch (error) {
      window.clearTimeout(fallbackTimer);
      console.error("Landing language load error:", error);
      window.location.href = fallbackUrl;
    }
  }

  function setupLandingLanguageExperience() {
    const currentLanguage = String(config.current_language || "").trim().toLowerCase();
    const queryLanguage = String(landingLanguageParams.get("lang") || "").trim().toLowerCase();
    const forceLanguagePrompt = ["1", "true", "yes"].includes(
      String(landingLanguageParams.get("choose_language") || "").trim().toLowerCase()
    );
    const storedLanguage = getStoredLandingLanguage();
    const overlay = document.querySelector("[data-language-choice-overlay]");
    const actions = overlay ? overlay.querySelector("#languageChoiceActions") : null;
    const loading = overlay ? overlay.querySelector("[data-language-choice-loading]") : null;
    const overlayElements = { actions: actions, loading: loading };

    if (!config.language_prompt_enabled && !config.language_switcher_enabled) {
      if (landingValidLanguages.has(currentLanguage)) {
        saveLandingLanguage(currentLanguage);
      }
      return false;
    }

    if (landingValidLanguages.has(queryLanguage)) {
      saveLandingLanguage(queryLanguage);
      if (queryLanguage !== currentLanguage) {
        loadLandingLanguage(queryLanguage, overlayElements);
        return true;
      }
    } else if (!forceLanguagePrompt && storedLanguage && storedLanguage !== currentLanguage) {
      loadLandingLanguage(storedLanguage, overlayElements);
      return true;
    }

    if (overlay) {
      const shouldShowOverlay = Boolean(config.language_prompt_enabled && !queryLanguage && (forceLanguagePrompt || !storedLanguage));
      overlay.hidden = !shouldShowOverlay;
      overlay.setAttribute("aria-hidden", String(!shouldShowOverlay));
      document.body.classList.toggle("language-modal-open", shouldShowOverlay);

      overlay.querySelectorAll("[data-language-choice]").forEach(function (choice) {
        choice.addEventListener("click", function (event) {
          const targetLanguage = String(choice.getAttribute("data-language-choice") || "").trim().toLowerCase();
          if (!landingValidLanguages.has(targetLanguage)) return;

          event.preventDefault();
          saveLandingLanguage(targetLanguage);

          if (targetLanguage === currentLanguage) {
            overlay.hidden = true;
            overlay.setAttribute("aria-hidden", "true");
            document.body.classList.remove("language-modal-open");
            return;
          }

          loadLandingLanguage(targetLanguage, overlayElements);
        });
      });
    }

    return false;
  }

  if (setupLandingLanguageExperience()) return;

  const menuButton = document.querySelector("[data-mobile-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      const isOpen = mobileMenu.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.addEventListener("click", function (event) {
    const link = event.target && event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", hash);
    }
  });

  function setupPageMotion() {
    const motionTargets = [
      ".raw-hero-grid .eyebrow",
      ".raw-hero-grid h1",
      ".raw-hero-grid p",
      ".raw-hero-grid .cta-row",
      ".raw-hero-highlights .highlight-card",
      ".raw-template-gallery .section-kicker",
      ".raw-gallery-item",
      ".raw-value-card",
      ".raw-location-grid > *",
      ".raw-consultant-card",
      ".raw-template-contact .section-kicker",
      ".lead-strip-section .field",
      ".lead-strip-section .btn-outer",
      ".faq-card",
      ".raw-template-trust .shell > *",
      "footer .footer-panel"
    ];
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animatedElements = [];

    motionTargets.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        if (element.hasAttribute("data-animate")) return;
        element.setAttribute("data-animate", "fade-up");
        element.style.setProperty("--motion-index", String(animatedElements.length % 6));
        animatedElements.push(element);
      });
    });

    if (!animatedElements.length) return;
    document.body.classList.add("js-motion-ready");

    if (reducedMotion || !("IntersectionObserver" in window)) {
      animatedElements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      }
    );

    animatedElements.forEach(function (element) {
      observer.observe(element);
    });
  }

  setupPageMotion();

  const heroSlider = document.querySelector("[data-hero-slider]");
  if (heroSlider) {
    const heroSlides = Array.from(heroSlider.querySelectorAll(".hero-slide"));
    let heroIndex = 0;

    function setHeroSlide(index) {
      if (!heroSlides.length) return;
      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (slide, slideIndex) {
        const active = slideIndex === heroIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
    }

    setHeroSlide(0);
    if (heroSlides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.setInterval(function () {
        setHeroSlide(heroIndex + 1);
      }, 5200);
    }
  }

  const carousel = document.querySelector("[data-gallery]");
  if (carousel) {
    const track = carousel.querySelector("[data-gallery-track]");
    const dots = Array.from(document.querySelectorAll("[data-gallery-dot]"));
    const slides = Array.from(carousel.querySelectorAll("[data-gallery-slide]"));
    const prev = document.querySelector("[data-gallery-prev]");
    const next = document.querySelector("[data-gallery-next]");
    const progressBar = carousel.querySelector("[data-gallery-progress]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const autoSlideDuration = 6800;
    let activeIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let autoTimer = null;
    if (track) {
      track.style.direction = "ltr";
    }

    function setSlide(index) {
      if (!track || !slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
      [activeIndex, (activeIndex + 1) % slides.length].forEach(function (slideIndex) {
        const image = slides[slideIndex]?.querySelector(".gallery-photo");
        if (image && image.loading === "lazy") {
          image.loading = "eager";
        }
      });
      track.style.transform = "translate3d(" + activeIndex * -100 + "%, 0, 0)";
      slides.forEach(function (slide, slideIndex) {
        const active = slideIndex === activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach(function (dot, dotIndex) {
        const active = dotIndex === activeIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", String(active));
      });
      if (progressBar) {
        progressBar.style.animation = "none";
        progressBar.style.width = "0%";
        if (!reducedMotion.matches && slides.length > 1) {
          void progressBar.offsetWidth;
          progressBar.style.animation = "galleryProgress " + autoSlideDuration + "ms linear forwards";
        }
      }
    }

    function stopAutoSlide() {
      if (autoTimer) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function startAutoSlide() {
      if (slides.length < 2 || reducedMotion.matches) return;
      stopAutoSlide();
      autoTimer = window.setInterval(function () {
        setSlide(activeIndex + 1);
      }, autoSlideDuration);
    }

    function userSetSlide(index) {
      setSlide(index);
      startAutoSlide();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        userSetSlide(index);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        userSetSlide(activeIndex - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        userSetSlide(activeIndex + 1);
      });
    }

    carousel.addEventListener(
      "touchstart",
      function (event) {
        if (!event.touches || !event.touches.length) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchend",
      function (event) {
        if (!event.changedTouches || !event.changedTouches.length) return;
        const diffX = event.changedTouches[0].clientX - touchStartX;
        const diffY = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(diffX) < 42 || Math.abs(diffX) < Math.abs(diffY)) return;
        userSetSlide(activeIndex + (diffX < 0 ? 1 : -1));
      },
      { passive: true }
    );

    setSlide(0);
    startAutoSlide();
  }

  const params = new URLSearchParams(window.location.search);
  const clickIdStoragePrefix = "oaklyn_" + config.project_slug + "_click_id_";

  function captureClickId(paramName) {
    const valueFromUrl = params.get(paramName) || "";
    const storageKey = clickIdStoragePrefix + paramName;

    if (valueFromUrl) {
      try {
        window.localStorage.setItem(storageKey, valueFromUrl);
      } catch (error) {}
      return valueFromUrl;
    }

    try {
      return window.localStorage.getItem(storageKey) || "";
    } catch (error) {
      return "";
    }
  }

  const clickIds = {
    gclid: captureClickId("gclid"),
    gbraid: captureClickId("gbraid"),
    wbraid: captureClickId("wbraid")
  };

  const utmData = {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    utm_platform: params.get("utm_platform") || "",
    utm_keyword: params.get("utm_keyword") || "",
    gad_source: params.get("gad_source") || "",
    gad_campaignid: params.get("gad_campaignid") || "",
    gad_adgroupid: params.get("gad_adgroupid") || "",
    gad_creative: params.get("gad_creative") || ""
  };

  function injectLanguageSwitcher() {
    if (!config.language_switcher_enabled || !config.landing_page_url || document.querySelector("[data-language-switcher]")) return;

    const switcher = document.createElement("div");
    switcher.className = "language-switcher";
    switcher.setAttribute("data-language-switcher", "true");
    switcher.innerHTML =
      '<button type="button" data-language-target="en">EN</button>' +
      '<button type="button" data-language-target="ar">AR</button>';

    switcher.querySelectorAll("button").forEach(function (button) {
      const targetLanguage = String(button.getAttribute("data-language-target") || "").trim().toLowerCase();
      const isActive = targetLanguage === String(config.current_language || "").trim().toLowerCase();

      button.classList.toggle("is-active", isActive);
      button.addEventListener("click", function () {
        if (!targetLanguage || isActive) return;

        try {
          window.localStorage.setItem(languagePreferenceKey, targetLanguage);
        } catch (error) {}

        document.cookie = languagePreferenceKey + "=" + encodeURIComponent(targetLanguage) + "; path=/; max-age=31536000; SameSite=Lax";

        const routeUrl =
          config.language_routes && config.language_routes[targetLanguage]
            ? config.language_routes[targetLanguage]
            : config.landing_page_url;
        const nextUrl = new URL(routeUrl, window.location.origin);
        if (!/\.html$/i.test(nextUrl.pathname)) {
          nextUrl.searchParams.set("lang", targetLanguage);
        }
        window.location.href = nextUrl.toString();
      });
    });

    document.body.appendChild(switcher);
  }

  injectLanguageSwitcher();

  function pushDataLayerEvent(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function splitFullNameForMatching(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || "",
      lastName: parts.length > 1 ? parts.slice(1).join(" ") : ""
    };
  }

  function buildLeadMatchData(payload) {
    const fullName = String(payload && (payload.full_name || payload.name) ? payload.full_name || payload.name : "").trim();
    const splitName = splitFullNameForMatching(fullName);
    const firstName = String(payload && payload.first_name ? payload.first_name : splitName.firstName).trim();
    const lastName = String(payload && payload.last_name ? payload.last_name : splitName.lastName).trim();
    const email = normalizeEmailValue(payload && payload.email ? payload.email : "");
    const phone = normalizePhone(payload && (payload.phone || payload.phone_number) ? payload.phone || payload.phone_number : "");
    const externalId = payload && payload.lead_id ? String(payload.lead_id) : "";

    return {
      email: email,
      phone: phone,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      external_id: externalId,
      em: email,
      ph: phone,
      fn: firstName.toLowerCase(),
      ln: lastName.toLowerCase()
    };
  }

  function buildLeadMatchingTrackingFields(matchData) {
    const data = matchData || {};
    return {
      lead_email: data.email || "",
      lead_phone: data.phone || "",
      lead_full_name: data.full_name || "",
      lead_first_name: data.first_name || "",
      lead_last_name: data.last_name || "",
      external_id: data.external_id || "",
      meta_advanced_matching: {
        em: data.em || data.email || "",
        ph: data.ph || data.phone || "",
        fn: data.fn || "",
        ln: data.ln || "",
        external_id: data.external_id || ""
      }
    };
  }

  function setLeadMatchKeys(payload) {
    const matchData = buildLeadMatchData(payload || {});
    window._leadEmail = matchData.email;
    window._leadPhone = matchData.phone;
    window._leadFullName = matchData.full_name;
    window._leadFirstName = matchData.first_name;
    window._leadLastName = matchData.last_name;
    window._leadExternalId = matchData.external_id;
    window.oaklynLeadMatchData = matchData;
    return matchData;
  }

  function encodeWebhookPayload(payload) {
    const requestBody = new URLSearchParams();
    Object.keys(payload || {}).forEach(function (key) {
      const value = payload[key];
      requestBody.append(key, value == null ? "" : String(value));
    });
    return requestBody;
  }

  function validateWebhookLeadPayload(payload) {
    const fullName = String(payload && (payload.full_name || payload.name) ? payload.full_name || payload.name : "").trim();
    const phone = normalizePhone(payload && (payload.phone || payload.phone_number) ? payload.phone || payload.phone_number : "");
    const phoneCountryCode = String(payload && payload.phone_country_code ? payload.phone_country_code : "").trim();
    const email = normalizeEmailValue(payload && payload.email ? payload.email : "");

    if (fullName.length < 2) return "full name is missing";
    if (!phoneCountryCode) return "country code is missing";
    if (!phone || phone.replace(/\D/g, "").length < 8) return "phone number is missing";
    if (!email || !isValidEmailValue(email)) return "email is invalid";

    return "";
  }

  function submitFormWebhook(payload) {
    const payloadError = validateWebhookLeadPayload(payload || {});

    if (payloadError) {
      pushDataLayerEvent({
        event: "lead_webhook_blocked_empty_payload",
        project: config.project_name,
        project_name: config.project_name,
        project_slug: config.project_slug,
        block_reason: payloadError
      });
      return Promise.reject(new Error("Blocked empty lead payload: " + payloadError));
    }

    if (!config.webhook_url) {
      return Promise.reject(new Error("Missing form webhook URL."));
    }

    return fetch(config.webhook_url, {
      method: "POST",
      body: encodeWebhookPayload(payload),
      keepalive: true
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Webhook response status " + response.status);
      }
      return response;
    });
  }

  function createLeadId() {
    return config.project_slug + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

  const FORM_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
  let formSubmissionInProgress = false;

  function hashLeadFingerprint(value) {
    let hash = 0;
    const input = String(value || "");
    for (let index = 0; index < input.length; index += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function buildFormSubmissionKey(phone, email) {
    const fingerprint = [config.project_slug, normalizePhone(phone), normalizeEmailValue(email)].join("|");
    return "oaklyn_" + config.project_slug + "_form_submission_" + hashLeadFingerprint(fingerprint);
  }

  function readFormSubmissionState(storageKey) {
    try {
      return JSON.parse(
        window.sessionStorage.getItem(storageKey) || window.localStorage.getItem(storageKey) || "null"
      );
    } catch (error) {
      return null;
    }
  }

  function getRecentFormSubmission(storageKey) {
    const state = readFormSubmissionState(storageKey);
    if (!state || !state.timestamp) return null;
    return Date.now() - Number(state.timestamp) < FORM_DEDUPE_WINDOW_MS ? state : null;
  }

  function writeFormSubmissionState(storageKey, leadId, status) {
    const state = JSON.stringify({
      project_slug: config.project_slug,
      lead_id: leadId,
      status: status || "pending",
      timestamp: Date.now()
    });
    try {
      window.sessionStorage.setItem(storageKey, state);
      window.localStorage.setItem(storageKey, state);
    } catch (error) {}
  }

  function clearFormSubmissionState(storageKey) {
    try {
      window.sessionStorage.removeItem(storageKey);
      window.localStorage.removeItem(storageKey);
    } catch (error) {}
  }

  function releaseFormSubmissionLock() {
    formSubmissionInProgress = false;
  }

  function normalizePhone(value) {
    const cleaned = String(value || "").replace(/[^\d+]/g, "");
    if (!cleaned) return "";
    if (cleaned.charAt(0) === "+") return cleaned;
    return "+" + cleaned.replace(/\D/g, "");
  }

  const BLACKLIST = [];
  const verifiedWhatsAppUrl =
    "https://wa.me/971505886769?text=Hello%20Oaklyn%20Realty%2C%20I%20am%20interested%20in%20Raw%20District%20by%20IMTIAZ";

  function normalizeBlacklistPhone(p) {
    let value = String(p || "").replace(/[\s\-()]/g, "");
    if (value.startsWith("00971")) value = value.slice(5);
    else if (value.startsWith("+971")) value = value.slice(4);
    else if (value.startsWith("971")) value = value.slice(3);
    if (value.startsWith("0")) value = value.slice(1);
    return value;
  }

  function isBlacklisted(phone) {
    const normalized = normalizeBlacklistPhone(phone);
    return BLACKLIST.some(function (blockedPhone) {
      return normalizeBlacklistPhone(blockedPhone) === normalized;
    });
  }

  function resetVerificationOverlay() {
    const overlay = document.getElementById("verify-overlay");
    const shieldPath = document.getElementById("shield-path");
    const checkPath = document.getElementById("check-path");
    const headline = document.getElementById("verify-headline");
    const sub = document.getElementById("verify-sub");
    const bar = document.getElementById("verify-bar");
    const pct = document.getElementById("verify-pct");

    if (overlay) {
      overlay.style.opacity = "1";
      overlay.style.transition = "";
    }
    if (shieldPath) shieldPath.style.strokeDashoffset = "120";
    if (checkPath) checkPath.style.strokeDashoffset = "30";
    const configuredHeadlines =
      Array.isArray(config.verification_headlines) && config.verification_headlines.length
        ? config.verification_headlines
        : ["Verifying your information..."];
    const configuredSubs =
      Array.isArray(config.verification_subs) && config.verification_subs.length
        ? config.verification_subs
        : ["This usually takes a few seconds"];
    if (headline) {
      headline.textContent = configuredHeadlines[0];
      headline.style.opacity = "1";
    }
    if (sub) {
      sub.textContent = configuredSubs[0];
      sub.style.opacity = "1";
    }
    if (bar) bar.style.width = "0%";
    if (pct) pct.textContent = "0%";
  }

  function showVerification(onComplete) {
    const overlay = document.getElementById("verify-overlay");
    if (!overlay) {
      if (onComplete) onComplete();
      return;
    }

    resetVerificationOverlay();
    overlay.style.display = "flex";

    window.setTimeout(function () {
      const shieldPath = document.getElementById("shield-path");
      const checkPath = document.getElementById("check-path");
      if (shieldPath) shieldPath.style.strokeDashoffset = "0";
      if (checkPath) checkPath.style.strokeDashoffset = "0";
    }, 100);

    const headlines =
      Array.isArray(config.verification_headlines) && config.verification_headlines.length
        ? config.verification_headlines
        : [
            "Verifying your information...",
            "Checking availability...",
            "Securing your consultation slot...",
            "Connecting you with your advisor..."
          ];
    const subs =
      Array.isArray(config.verification_subs) && config.verification_subs.length
        ? config.verification_subs
        : [
            "This usually takes a few seconds",
            "Your data is encrypted and secure",
            "We never share your information",
            "Almost ready..."
          ];
    let headlineIndex = 0;
    const hInterval = window.setInterval(function () {
      headlineIndex += 1;
      if (headlineIndex < headlines.length) {
        const headline = document.getElementById("verify-headline");
        const sub = document.getElementById("verify-sub");
        if (!headline || !sub) return;
        headline.style.opacity = "0";
        sub.style.opacity = "0";
        window.setTimeout(function () {
          headline.textContent = headlines[headlineIndex];
          sub.textContent = subs[headlineIndex];
          headline.style.opacity = "1";
          sub.style.opacity = "1";
        }, 400);
      }
    }, 1400);

    const duration = 4500 + Math.random() * 1500;
    const start = Date.now();
    const bar = document.getElementById("verify-bar");
    const pct = document.getElementById("verify-pct");

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    const ticker = window.setInterval(function () {
      const elapsed = Date.now() - start;
      const raw = Math.min(elapsed / duration, 1);
      const eased = easeInOut(raw);
      const progress = Math.round(eased * 100);
      if (bar) bar.style.width = progress + "%";
      if (pct) pct.textContent = progress + "%";
      if (raw >= 1) {
        window.clearInterval(ticker);
        window.clearInterval(hInterval);
        window.setTimeout(function () {
          Promise.resolve()
            .then(function () {
              if (onComplete) return onComplete();
              return null;
            })
            .catch(function (error) {
              console.error("[verification] Completion failed", error);
            })
            .finally(function () {
              overlay.style.opacity = "0";
              overlay.style.transition = "opacity 0.4s";
              window.setTimeout(function () {
                overlay.style.display = "none";
                overlay.style.opacity = "1";
              }, 400);
            });
        }, 300);
      }
    }, 50);
  }

  function handleWhatsApp(event) {
    if (event && event.__oaklynWhatsAppTracked) return;
    if (event) event.__oaklynWhatsAppTracked = true;

    const target = event && event.currentTarget ? event.currentTarget : null;
    const destinationUrl =
      target && target.dataset
        ? String(target.dataset.whatsappDestination || target.getAttribute("href") || verifiedWhatsAppUrl)
        : verifiedWhatsAppUrl;
    const now = Date.now();
    const dedupeKey = "oaklyn_" + config.project_slug + "_whatsapp_cta_conversion";
    const dedupeWindowMs = 24 * 60 * 60 * 1000;
    let storedConversion = null;

    try {
      storedConversion = JSON.parse(
        window.sessionStorage.getItem(dedupeKey) || window.localStorage.getItem(dedupeKey) || "null"
      );
    } catch (error) {
      storedConversion = null;
    }

    if (
      storedConversion &&
      storedConversion.timestamp &&
      now - Number(storedConversion.timestamp) < dedupeWindowMs
    ) {
      if (!event && destinationUrl) {
        window.open(destinationUrl, "_blank");
      }
      return;
    }

    const leadId = createLeadId();
    const googleClickId = clickIds.gclid || clickIds.gbraid || clickIds.wbraid || "";
    const conversionState = JSON.stringify({ lead_id: leadId, timestamp: now });

    try {
      window.sessionStorage.setItem(dedupeKey, conversionState);
      window.localStorage.setItem(dedupeKey, conversionState);
    } catch (error) {}

    const trackingPayload = Object.assign(
      {
        lead_id: leadId,
        event_id: leadId,
        blacklist_status: "not_checked",
        verification_status: "skipped",
        google_ads_eligible: Boolean(googleClickId),
        google_click_id: googleClickId,
        dedupe_window_hours: 24
      },
      buildWhatsAppTrackingPayload(target)
    );

    pushDataLayerEvent(
      Object.assign(
        {
          event: "whatsapp_cta_click"
        },
        trackingPayload
      )
    );

    pushDataLayerEvent(
      Object.assign(
        {
          event: "whatsapp_cta_conversion",
          conversion_type: "whatsapp"
        },
        trackingPayload
      )
    );

    if (!event && destinationUrl) {
      window.open(destinationUrl, "_blank");
    }
  }

  function handleCall(event) {
    if (event) event.preventDefault();
    showVerification(function () {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "phone_call_click",
        conversion_type: "call",
        project_name: config.project_name,
        project_slug: config.project_slug
      });
      window.location.href = "tel:+971585835230";
    });
  }

  window.showVerification = showVerification;
  window.handleWhatsApp = handleWhatsApp;
  window.handleCall = handleCall;
  window.isBlacklisted = isBlacklisted;

  function normalizeDialCode(value) {
    const cleaned = String(value || "").replace(/[^\d+]/g, "");
    if (!cleaned) return "";
    return cleaned.charAt(0) === "+" ? cleaned : "+" + cleaned.replace(/\D/g, "");
  }

  function stripPhoneFormatting(value) {
    return String(value || "").replace(/[\s\-()]/g, "");
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function hasRepeatedDigits(value) {
    return /^(\d)\1+$/.test(String(value || ""));
  }

  function isSequentialDigits(value) {
    const digits = String(value || "");
    if (digits.length < 6) return false;

    let ascendingRun = 1;
    let descendingRun = 1;
    for (let index = 1; index < digits.length; index += 1) {
      const previous = Number(digits.charAt(index - 1));
      const current = Number(digits.charAt(index));

      ascendingRun = current === previous + 1 ? ascendingRun + 1 : 1;
      descendingRun = current === previous - 1 ? descendingRun + 1 : 1;

      if (ascendingRun >= 6 || descendingRun >= 6) return true;
    }

    return false;
  }

  function hasRepeatingDigitPattern(value) {
    const digits = String(value || "");
    if (digits.length < 6) return false;
    return /^(\d{2,3})\1+$/.test(digits);
  }

  const PHONE_LENGTH_RULES_BY_DIAL_CODE = {
    "+1": [10],
    "+7": [10],
    "+20": [10],
    "+27": [9],
    "+30": [10],
    "+31": [9],
    "+32": [8, 9],
    "+33": [9],
    "+34": [9],
    "+36": [8, 9],
    "+39": [9, 10, 11],
    "+40": [9],
    "+41": [9],
    "+43": [10, 11, 12, 13],
    "+44": [10],
    "+45": [8],
    "+46": [7, 8, 9],
    "+47": [8],
    "+48": [9],
    "+49": [10, 11, 12],
    "+51": [8, 9],
    "+52": [10],
    "+53": [8],
    "+54": [10],
    "+55": [10, 11],
    "+56": [9],
    "+57": [10],
    "+58": [10],
    "+60": [9, 10],
    "+61": [9],
    "+62": [9, 10, 11, 12],
    "+63": [10],
    "+64": [8, 9, 10],
    "+65": [8],
    "+66": [8, 9],
    "+81": [10],
    "+82": [9, 10],
    "+84": [9],
    "+86": [11],
    "+90": [10],
    "+91": [10],
    "+92": [10],
    "+93": [9],
    "+94": [9],
    "+95": [8, 9, 10],
    "+98": [10],
    "+211": [9],
    "+212": [9],
    "+213": [8, 9],
    "+216": [8],
    "+218": [8, 9],
    "+220": [7],
    "+221": [9],
    "+222": [8],
    "+223": [8],
    "+224": [9],
    "+225": [10],
    "+226": [8],
    "+227": [8],
    "+229": [8, 10],
    "+230": [7, 8],
    "+231": [7, 8],
    "+232": [8],
    "+233": [9],
    "+234": [10],
    "+235": [8],
    "+236": [8],
    "+237": [9],
    "+238": [7],
    "+239": [7],
    "+240": [9],
    "+241": [8, 9],
    "+242": [9],
    "+243": [9],
    "+244": [9],
    "+245": [7],
    "+248": [7],
    "+249": [9],
    "+250": [9],
    "+251": [9],
    "+252": [8, 9],
    "+253": [8],
    "+254": [9],
    "+255": [9],
    "+256": [9],
    "+257": [8],
    "+258": [8, 9],
    "+260": [9],
    "+261": [9],
    "+262": [9],
    "+263": [9],
    "+264": [9],
    "+265": [8, 9],
    "+266": [8],
    "+267": [7, 8],
    "+268": [8],
    "+269": [7],
    "+290": [4, 5],
    "+291": [7],
    "+297": [7],
    "+298": [6],
    "+299": [6],
    "+350": [8],
    "+351": [9],
    "+352": [8, 9],
    "+353": [9],
    "+354": [7],
    "+355": [9],
    "+356": [8],
    "+357": [8],
    "+358": [9, 10],
    "+359": [8, 9],
    "+370": [8],
    "+371": [8],
    "+372": [7, 8],
    "+373": [8],
    "+374": [8],
    "+375": [9],
    "+376": [6],
    "+377": [8, 9],
    "+378": [10],
    "+380": [9],
    "+381": [8, 9],
    "+382": [8],
    "+383": [8],
    "+385": [8, 9],
    "+386": [8],
    "+387": [8],
    "+389": [8],
    "+420": [9],
    "+421": [9],
    "+423": [7],
    "+500": [5],
    "+501": [7],
    "+502": [8],
    "+503": [8],
    "+504": [8],
    "+505": [8],
    "+506": [8],
    "+507": [7, 8],
    "+508": [6],
    "+509": [8],
    "+590": [9],
    "+591": [8],
    "+592": [7],
    "+593": [8, 9],
    "+594": [9],
    "+595": [9],
    "+596": [9],
    "+597": [6, 7],
    "+598": [8],
    "+599": [7, 8],
    "+670": [7, 8],
    "+672": [6],
    "+673": [7],
    "+674": [7],
    "+675": [8],
    "+676": [5],
    "+677": [7],
    "+678": [7],
    "+679": [7],
    "+680": [7],
    "+681": [6],
    "+682": [5],
    "+683": [4],
    "+685": [5, 7],
    "+686": [5],
    "+687": [6],
    "+689": [8],
    "+690": [4],
    "+691": [7],
    "+692": [7],
    "+850": [8, 9, 10],
    "+852": [8],
    "+853": [8],
    "+855": [8, 9],
    "+856": [8, 9, 10],
    "+880": [10],
    "+886": [9],
    "+960": [7],
    "+961": [7, 8],
    "+962": [8, 9],
    "+963": [9],
    "+964": [10],
    "+965": [8],
    "+966": [9],
    "+967": [9],
    "+968": [8],
    "+970": [9],
    "+971": [9],
    "+972": [9],
    "+973": [8],
    "+974": [8],
    "+975": [7, 8],
    "+976": [8],
    "+977": [10],
    "+992": [9],
    "+993": [8],
    "+994": [9],
    "+995": [9],
    "+996": [9],
    "+998": [9],
    "+228": [8],
    "+688": [5],
    "+1340": [7],
    "+1242": [7],
    "+1246": [7],
    "+1264": [7],
    "+1268": [7],
    "+1284": [7],
    "+1345": [7],
    "+1441": [7],
    "+1473": [7],
    "+1649": [7],
    "+1664": [7],
    "+1670": [7],
    "+1671": [7],
    "+1684": [7],
    "+1721": [7],
    "+1758": [7],
    "+1767": [7],
    "+1784": [7],
    "+1787": [7],
    "+1809": [7],
    "+1868": [7],
    "+1869": [7],
    "+1876": [7]
  };

  function passesCountryPhoneRules(countryCode, nationalNumber) {
    const digits = String(nationalNumber || "").replace(/D/g, "");
    const allowedLengths = PHONE_LENGTH_RULES_BY_DIAL_CODE[countryCode];

    if (!allowedLengths) {
      return digits.length >= 6 && digits.length <= 14;
    }

    return allowedLengths.includes(digits.length);
  }

  function buildValidatedPhoneNumber(localValue, countryCode, allowedDialCodes) {
    const rawCountryCode = String(countryCode || "").trim();
    if (!rawCountryCode) {
      return { valid: false };
    }

    const normalizedCountryCode = normalizeDialCode(rawCountryCode);
    const rawLocalValue = String(localValue || "").trim();

    if (!normalizedCountryCode || !allowedDialCodes.has(normalizedCountryCode)) {
      return { valid: false };
    }

    if (!rawLocalValue || !/^[\d\s\-()]+$/.test(rawLocalValue)) {
      return { valid: false };
    }

    const normalizedLocalInput = stripPhoneFormatting(rawLocalValue);
    if (!/^\d+$/.test(normalizedLocalInput)) {
      return { valid: false };
    }

    const nationalNumber = normalizedLocalInput.charAt(0) === "0" ? normalizedLocalInput.slice(1) : normalizedLocalInput;
    if (!nationalNumber || nationalNumber.length < 6 || nationalNumber.length > 14) {
      return { valid: false };
    }

    if (!passesCountryPhoneRules(normalizedCountryCode, nationalNumber)) {
      return { valid: false };
    }

    const significantNationalNumber = nationalNumber.replace(/^0+/, "");
    if (
      !significantNationalNumber ||
      hasRepeatedDigits(significantNationalNumber) ||
      isSequentialDigits(significantNationalNumber) ||
      hasRepeatingDigitPattern(significantNationalNumber)
    ) {
      return { valid: false };
    }

    const e164 = normalizePhone(normalizedCountryCode + nationalNumber);
    const e164Digits = e164.replace(/[^\d]/g, "");
    if (e164Digits.length < 8 || e164Digits.length > 15) {
      return { valid: false };
    }

    return {
      valid: true,
      countryCode: normalizedCountryCode,
      phoneLocal: normalizedLocalInput,
      nationalNumber,
      e164
    };
  }

  function buildSimilarPhoneCandidates(phoneValidation) {
    if (!phoneValidation || !phoneValidation.valid) return [];

    const candidates = [];
    const seen = new Set();

    function pushCandidate(value) {
      const normalized = String(value || "").trim();
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      candidates.push(normalized);
    }

    const e164 = normalizePhone(phoneValidation.e164 || "");
    const e164Digits = digitsOnly(e164);
    const countryDigits = digitsOnly(phoneValidation.countryCode || "");
    const nationalDigits = digitsOnly(phoneValidation.nationalNumber || "");
    const localDigits = digitsOnly(phoneValidation.phoneLocal || "");
    const localWithLeadingZero =
      nationalDigits && localDigits !== "0" + nationalDigits ? "0" + nationalDigits : "";

    pushCandidate(e164);
    pushCandidate(e164Digits);

    if (countryDigits && nationalDigits) {
      pushCandidate("+" + countryDigits + nationalDigits);
      pushCandidate(countryDigits + nationalDigits);
    }

    pushCandidate(localDigits);
    pushCandidate(nationalDigits);
    pushCandidate(localWithLeadingZero);

    return candidates;
  }

  function setError(field, hasError) {
    if (!field || !field.wrap || !field.input) return;
    field.wrap.classList.toggle("has-error", hasError);
    field.input.setAttribute("aria-invalid", hasError ? "true" : "false");
  }

  function focusFieldError(field) {
    if (!field || !field.wrap) return;
    const focusTarget = field.input || field.wrap.querySelector("input, select, textarea, button");

    field.wrap.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    window.setTimeout(function () {
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus({
          preventScroll: true
        });
      }
    }, 180);
  }

  function buildThankYouUrl(leadId) {
    const thankYouUrl = new URL(config.thank_you_page_url);
    thankYouUrl.searchParams.set("lead", "success");
    thankYouUrl.searchParams.set("project", config.project_slug);
    thankYouUrl.searchParams.set("lead_id", leadId);
    if (config.current_language) {
      thankYouUrl.searchParams.set("lang", config.current_language);
    }

    Object.keys(clickIds).forEach(function (key) {
      if (clickIds[key]) thankYouUrl.searchParams.set(key, clickIds[key]);
    });

    Object.keys(utmData).forEach(function (key) {
      if (utmData[key]) thankYouUrl.searchParams.set(key, utmData[key]);
    });

    return thankYouUrl.toString();
  }

  function writeLeadSuccessState(leadId) {
    const storageKey = "oaklyn_" + config.project_slug + "_lead_success";
    const state = JSON.stringify({
      project_name: config.project_name,
      project_slug: config.project_slug,
      lead_id: leadId,
      timestamp: Date.now()
    });

    try {
      window.sessionStorage.setItem(storageKey, state);
    } catch (error) {}

    try {
      window.localStorage.setItem(storageKey, state);
    } catch (error) {}
  }

  function normalizeEmailValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  const BLOCKED_EMAIL_DOMAINS = new Set([
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "yopmail.com",
    "example.com",
    "test.com"
  ]);

  const COMMON_EMAIL_TYPOS = new Set([
    "gmal.com",
    "gmail.con",
    "gnail.com",
    "gmial.com",
    "hotnail.com",
    "hotmil.com",
    "outlook.con",
    "yahoo.con",
    "yaho.com"
  ]);

  function isValidEmailAddress(value) {
    const email = normalizeEmailValue(value);
    if (email.length < 6 || email.length > 254) return false;
    if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email)) return false;

    const parts = email.split("@");
    if (parts.length !== 2) return false;

    const localPart = parts[0];
    const domain = parts[1];
    if (!localPart || localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
      return false;
    }

    if (!domain || domain.includes("..") || BLOCKED_EMAIL_DOMAINS.has(domain) || COMMON_EMAIL_TYPOS.has(domain)) {
      return false;
    }

    const domainLabels = domain.split(".");
    if (domainLabels.some((label) => !label || label.startsWith("-") || label.endsWith("-"))) {
      return false;
    }

    const topLevelDomain = domainLabels[domainLabels.length - 1] || "";
    return /^[a-z]{2,24}$/i.test(topLevelDomain);
  }

  function normalizeBlacklistUrl(value) {
    return String(value || "").trim();
  }

  function encodeBlacklistPhoneQueryValue(value) {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    if (normalized.charAt(0) === "+") {
      return "%2B+" + normalized.slice(1);
    }
    return encodeURIComponent(normalized);
  }

  function buildBlacklistRequestUrl(baseUrl, lead) {
    const [path, query = ""] = String(baseUrl || "").split("?");
    const pairs = query ? query.split("&").filter(Boolean) : [];
    const nextPairs = [];
    let hasPhone = false;
    let hasEmail = false;

    pairs.forEach(function (pair) {
      const equalsIndex = pair.indexOf("=");
      const rawKey = equalsIndex >= 0 ? pair.slice(0, equalsIndex) : pair;
      const key = decodeURIComponent(rawKey || "").trim();

      if (key === "phone_number") {
        hasPhone = true;
        nextPairs.push("phone_number=" + encodeBlacklistPhoneQueryValue(lead.phone_number || ""));
        return;
      }

      if (key === "email") {
        hasEmail = true;
        nextPairs.push("email=" + String(lead.email || "").trim());
        return;
      }

      nextPairs.push(pair);
    });

    if (!hasPhone) {
      nextPairs.unshift("phone_number=" + encodeBlacklistPhoneQueryValue(lead.phone_number || ""));
    }

    if (!hasEmail) {
      const insertionIndex = hasPhone ? 1 : 0;
      nextPairs.splice(insertionIndex, 0, "email=" + String(lead.email || "").trim());
    }

    return path + (nextPairs.length ? "?" + nextPairs.join("&") : "");
  }

  function looksLikeHtmlDocument(value) {
    return /^\s*<(?:!doctype html|html)\b/i.test(String(value || ""));
  }

  const form = document.getElementById("landingLeadForm");
  if (!form) return;

  const honeypot = document.getElementById("landing_website");
  const submitBtn = document.getElementById("landingSubmitBtn");
  const defaultSubmitLabel = submitBtn ? submitBtn.textContent : "Submit";
  const formError = document.getElementById("landingFormError");
  const success = document.getElementById("landingSuccess");
  const gclidInput = document.getElementById("landing_gclid");
  const gbraidInput = document.getElementById("landing_gbraid");
  const wbraidInput = document.getElementById("landing_wbraid");
  const leadIdInput = document.getElementById("landing_lead_id");
  const phoneCountryInput = document.getElementById("landing_phone_country");

  function hydrateEmptyCountryPickerLists() {
    const sourceList = document.querySelector('[data-country-picker="lead"] [data-country-picker-list]');
    if (!sourceList || !sourceList.innerHTML.trim()) return;

    Array.from(document.querySelectorAll("[data-country-picker-list]")).forEach(function (list) {
      if (list.children.length) return;
      list.innerHTML = sourceList.innerHTML;
    });
  }

  hydrateEmptyCountryPickerLists();

  const countryPickers = Array.from(document.querySelectorAll("[data-country-picker]"));
  const countryOptions = Array.from(document.querySelectorAll("[data-country-option]"));
  const countryPickerControllers = new Map();
  const allowedPhoneCountryCodes = new Set(
    countryOptions
      .map(function (option) {
        return normalizeDialCode(option.dataset.countryCode || "");
      })
      .filter(Boolean)
  );

  if (gclidInput) gclidInput.value = clickIds.gclid;
  if (gbraidInput) gbraidInput.value = clickIds.gbraid;
  if (wbraidInput) wbraidInput.value = clickIds.wbraid;

  function setFormErrorMessage(message) {
    if (!formError) return;
    formError.textContent = message;
  }

  const normalizeCountrySearch = function (value) {
    return String(value || "").trim().toLowerCase().replace(/[^\da-z+]/g, "");
  };

  const normalizeCodeDigits = function (value) {
    return String(value || "").replace(/\D/g, "");
  };

  function setupCountryPicker(countryPicker) {
    const countryInput = countryPicker.querySelector("[data-country-picker-input]");
    const countryPickerTrigger = countryPicker.querySelector("[data-country-picker-trigger]");
    const countryPickerPanel = countryPicker.querySelector("[data-country-picker-panel]");
    const countryPickerSearch = countryPicker.querySelector("[data-country-picker-search]");
    const countryPickerFlag = countryPicker.querySelector("[data-country-picker-flag]");
    const countryPickerLabel = countryPicker.querySelector("[data-country-picker-label]");
    const countryPickerCode = countryPicker.querySelector("[data-country-picker-code]");
    const countryPickerEmpty = countryPicker.querySelector("[data-country-picker-empty]");
    const scopedCountryOptions = Array.from(countryPicker.querySelectorAll("[data-country-option]"));

    if (!countryInput || !countryPickerTrigger || !countryPickerPanel || !scopedCountryOptions.length) return;

    const closeCountryPicker = function () {
      countryPicker.classList.remove("is-open");
      countryPickerTrigger.setAttribute("aria-expanded", "false");
      countryPickerPanel.hidden = true;
    };

    const openCountryPicker = function () {
      countryPicker.classList.add("is-open");
      countryPickerTrigger.setAttribute("aria-expanded", "true");
      countryPickerPanel.hidden = false;
      if (countryPickerSearch) {
        countryPickerSearch.focus();
        countryPickerSearch.select();
      }
    };

    const syncCountryOptionVisibility = function () {
      const rawQuery = countryPickerSearch ? countryPickerSearch.value.trim().toLowerCase() : "";
      const normalizedQuery = normalizeCountrySearch(rawQuery);
      const normalizedCodeQuery = normalizeCodeDigits(rawQuery);
      const isCodeOnlyQuery = Boolean(normalizedCodeQuery) && !/[a-z]/i.test(rawQuery);
      const hasExactCodeMatch = isCodeOnlyQuery
        ? scopedCountryOptions.some(function (option) {
            return normalizeCodeDigits(option.dataset.countryCode || "") === normalizedCodeQuery;
          })
        : false;
      let visibleCount = 0;

      scopedCountryOptions.forEach(function (option) {
        const optionQuery = option.dataset.countryQuery || "";
        const normalizedOptionQuery = normalizeCountrySearch(optionQuery);
        const optionCodeDigits = normalizeCodeDigits(option.dataset.countryCode || "");
        let matches = false;

        if (!rawQuery) {
          matches = true;
        } else if (isCodeOnlyQuery) {
          matches = hasExactCodeMatch
            ? optionCodeDigits === normalizedCodeQuery
            : optionCodeDigits.startsWith(normalizedCodeQuery);
        } else {
          matches = optionQuery.includes(rawQuery) || normalizedOptionQuery.includes(normalizedQuery);
        }

        option.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      if (countryPickerEmpty) {
        countryPickerEmpty.hidden = visibleCount !== 0;
      }
    };

    const selectCountryOption = function (option, selectionOptions) {
      if (!option) return;

      const nextFlag = option.dataset.countryFlag || "";
      const nextLabel = option.dataset.countryLabel || "";
      const nextCode = option.dataset.countryCode || "";

      countryInput.value = nextCode;
      countryPicker.classList.remove("is-placeholder");
      if (countryPickerFlag) countryPickerFlag.textContent = nextFlag;
      if (countryPickerLabel) countryPickerLabel.textContent = nextLabel;
      if (countryPickerCode) countryPickerCode.textContent = nextCode;

      scopedCountryOptions.forEach(function (item) {
        const active = item === option;
        item.classList.toggle("is-selected", active);
        item.setAttribute("aria-selected", String(active));
      });

      if (countryPickerSearch) {
        countryPickerSearch.value = "";
      }

      const closestField = countryPicker.closest(".field");
      if (closestField) {
        closestField.classList.remove("has-error");
      }

      if (countryInput === phoneCountryInput) {
        const phoneFieldWrap = document.getElementById("phoneField");
        if (phoneFieldWrap) {
          phoneFieldWrap.classList.remove("has-error");
        }
        if (formError) {
          formError.classList.remove("is-visible");
        }
      }

      syncCountryOptionVisibility();
      if (!selectionOptions || selectionOptions.close !== false) {
        closeCountryPicker();
      }
    };

    const selectCountryByCode = function (countryCode) {
      const normalizedCode = normalizeDialCode(countryCode || "");
      const matchedOption = scopedCountryOptions.find(function (option) {
        return normalizeDialCode(option.dataset.countryCode || "") === normalizedCode;
      });

      if (matchedOption) {
        selectCountryOption(matchedOption, { close: false });
      } else if (normalizedCode) {
        countryInput.value = normalizedCode;
      }
    };

    countryPickerTrigger.addEventListener("click", function () {
      if (countryPicker.classList.contains("is-open")) {
        closeCountryPicker();
      } else {
        openCountryPicker();
      }
    });

    scopedCountryOptions.forEach(function (option) {
      option.addEventListener("click", function () {
        selectCountryOption(option);
      });
    });

    if (countryPickerSearch) {
      countryPickerSearch.addEventListener("input", syncCountryOptionVisibility);
      countryPickerSearch.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeCountryPicker();
          countryPickerTrigger.focus();
        }
      });
    }

    document.addEventListener("click", function (event) {
      if (!countryPicker.classList.contains("is-open")) return;
      if (countryPicker.contains(event.target)) return;
      closeCountryPicker();
    });

    syncCountryOptionVisibility();
    countryPickerControllers.set(countryPicker, {
      close: closeCountryPicker,
      open: openCountryPicker,
      selectByCode: selectCountryByCode
    });
  }

  countryPickers.forEach(function (countryPicker) {
    setupCountryPicker(countryPicker);
  });

  function syncCountryPickerByInput(input, countryCode) {
    if (!input) return;
    const normalizedCode = normalizeDialCode(countryCode || "");
    input.value = normalizedCode;
    const picker = input.closest("[data-country-picker]");
    const controller = picker ? countryPickerControllers.get(picker) : null;
    if (controller && typeof controller.selectByCode === "function") {
      controller.selectByCode(normalizedCode);
    }
  }

  function showBlockedSuccess(message) {
    const successTitle = success ? success.querySelector("h3") : null;
    const successCopy = success ? success.querySelector(".section-copy") : null;

    form.style.display = "none";
    if (successTitle) successTitle.textContent = config.blacklist_block_title || "Thank you";
    if (successCopy) successCopy.textContent = message;
    if (success) success.classList.add("is-visible");
  }

  async function checkBlacklistStatus(lead) {
    const originalBlacklistUrl = String(config.blacklist_check_url || "").trim();
    const normalizedBlacklistUrl = normalizeBlacklistUrl(originalBlacklistUrl);
    if (!normalizedBlacklistUrl) {
      throw new Error("Blacklist check URL is not configured.");
    }

    const requestPayload = {
      phone_number: lead.phone_number || "",
      email: lead.email || ""
    };
    const blacklistUrl = buildBlacklistRequestUrl(normalizedBlacklistUrl, requestPayload);

    const timeoutMs = Number(config.blacklist_timeout_ms) || 8000;
    const controller = typeof window.AbortController === "function" ? new window.AbortController() : null;
    const timeoutId = controller
      ? window.setTimeout(function () {
          controller.abort();
        }, timeoutMs)
      : null;

    console.log("Checking blacklist...");
    console.info("[blacklist] Checking lead against sheet", {
      url: blacklistUrl,
      phone_number: requestPayload.phone_number,
      email: requestPayload.email
    });

    try {
      const response = await fetch(blacklistUrl, {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
        headers: {
          Accept: "application/json"
        },
        signal: controller ? controller.signal : undefined
      });

      const responseText = await response.text();
      const responseContentType = response.headers.get("content-type") || "";
      const responseUrl = response.url || blacklistUrl;
      let responseJson;

      if (
        responseUrl.includes("accounts.google.com") ||
        responseText.includes("ServiceLogin") ||
        looksLikeHtmlDocument(responseText) ||
        responseContentType.includes("text/html")
      ) {
        throw new Error("Blacklist API is not publicly accessible.");
      }

      try {
        responseJson = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Invalid blacklist response.");
      }

      console.info("[blacklist] Response received", responseJson);

      if (!response.ok) {
        throw new Error("Blacklist check failed with status " + response.status);
      }

      if (!responseJson || typeof responseJson.blocked !== "boolean") {
        throw new Error("Blacklist response missing blocked flag.");
      }

      return responseJson;
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new Error("Blacklist check timed out.");
      }
      throw error;
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  }

  async function checkBlacklistStatusWithSimilarPhone(lead) {
    const phoneCandidates = Array.isArray(lead.phone_candidates) ? lead.phone_candidates.filter(Boolean) : [];
    const dedupedCandidates = Array.from(new Set(phoneCandidates.length ? phoneCandidates : [lead.phone_number || ""])).filter(Boolean);

    if (!dedupedCandidates.length) {
      return checkBlacklistStatus(lead);
    }

    for (let index = 0; index < dedupedCandidates.length; index += 1) {
      const phoneCandidate = dedupedCandidates[index];
      const result = await checkBlacklistStatus({
        phone_number: phoneCandidate,
        email: lead.email || ""
      });

      if (result && result.blocked) {
        return Object.assign({}, result, {
          matched_phone_number: phoneCandidate,
          checked_phone_numbers: dedupedCandidates
        });
      }
    }

    return {
      blocked: false,
      matched_phone_number: "",
      checked_phone_numbers: dedupedCandidates
    };
  }

  const splitName = Boolean(config.split_name);
  const fields = {
    phone: {
      input: document.getElementById("landing_phone"),
      wrap: document.getElementById("phoneField"),
      test: function () {
        return true;
      }
    },
    email: {
      input: document.getElementById("landing_email"),
      wrap: document.getElementById("emailField"),
      test: function (value) {
        return isValidEmailAddress(value);
      }
    },
    message: {
      input: document.getElementById("landing_message"),
      wrap: document.getElementById("messageField"),
      test: function (value) {
        return value.trim().length >= 3;
      }
    },
    project: {
      input: document.getElementById("landing_preferred_project"),
      wrap: document.getElementById("projectField"),
      test: function (value) {
        return value.trim() !== "";
      }
    },
    propertyType: {
      input: document.getElementById("landing_property_type"),
      wrap: document.getElementById("propertyTypeField"),
      test: function (value) {
        return value.trim() !== "";
      }
    }
  };

  if (splitName) {
    fields.firstName = {
      input: document.getElementById("landing_first_name"),
      wrap: document.getElementById("firstNameField"),
      test: function (value) {
        return value.trim().length >= 2;
      }
    };
    fields.lastName = {
      input: document.getElementById("landing_last_name"),
      wrap: document.getElementById("lastNameField"),
      test: function (value) {
        return value.trim().length >= 2;
      }
    };
  } else {
    fields.name = {
      input: document.getElementById("landing_full_name"),
      wrap: document.getElementById("nameField"),
      test: function (value) {
        return value.trim().length >= 2;
      }
    };
  }

  Object.keys(fields).forEach(function (key) {
    const field = fields[key];
    if (!field.input) return;
    field.input.addEventListener("input", function () {
      if (key === "phone") {
        field.input.value = field.input.value.replace(/[^\d\s\-()]/g, "");
      }
      setError(field, false);
      if (formError) formError.classList.remove("is-visible");
    });
    field.input.addEventListener("change", function () {
      setError(field, false);
      if (formError) formError.classList.remove("is-visible");
    });
  });

  const leadPopup = document.querySelector("[data-lead-popup]");
  const leadPopupForm = document.getElementById("leadPopupForm");
  const leadPopupCloseButtons = Array.from(document.querySelectorAll("[data-lead-popup-close]"));
  const leadPopupSubmit = document.getElementById("leadPopupSubmit");
  const leadPopupError = document.getElementById("leadPopupError");
  const leadPopupCountryInput = document.getElementById("lead_popup_phone_country");
  const leadPopupDelayMs = 15000;
  const leadSuccessStorageKey = "oaklyn_" + config.project_slug + "_lead_success";
  let leadPopupOpened = false;

  const leadPopupFields = {
    name: {
      input: document.getElementById("lead_popup_full_name"),
      wrap: document.getElementById("leadPopupNameField"),
      test: function (value) {
        return value.trim().length >= 2;
      }
    },
    phone: {
      input: document.getElementById("lead_popup_phone"),
      wrap: document.getElementById("leadPopupPhoneField"),
      test: function () {
        return true;
      }
    },
    email: {
      input: document.getElementById("lead_popup_email"),
      wrap: document.getElementById("leadPopupEmailField"),
      test: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      }
    },
    message: {
      input: document.getElementById("lead_popup_message"),
      wrap: document.getElementById("leadPopupMessageField"),
      test: function (value) {
        return value.trim().length >= 3;
      }
    }
  };

  function setLeadPopupErrorMessage(message) {
    if (!leadPopupError) return;
    leadPopupError.textContent = message;
  }

  function clearLeadPopupError() {
    if (leadPopupError) leadPopupError.classList.remove("is-visible");
    Object.keys(leadPopupFields).forEach(function (key) {
      setError(leadPopupFields[key], false);
    });
  }

  function hasStoredLeadSuccess() {
    try {
      if (window.sessionStorage.getItem(leadSuccessStorageKey)) return true;
    } catch (error) {}
    try {
      if (window.localStorage.getItem(leadSuccessStorageKey)) return true;
    } catch (error) {}
    return false;
  }

  function shouldSuppressLeadPopup() {
    if (!leadPopup || !leadPopupForm || leadPopupOpened || hasStoredLeadSuccess()) return true;
    return false;
  }

  function openLeadPopup() {
    if (shouldSuppressLeadPopup()) return;
    leadPopupOpened = true;
    clearLeadPopupError();
    leadPopup.hidden = false;
    leadPopup.classList.add("is-visible");
    leadPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open", "lead-popup-open");
    window.setTimeout(function () {
      if (leadPopupFields.name.input && typeof leadPopupFields.name.input.focus === "function") {
        leadPopupFields.name.input.focus();
      }
    }, 80);
  }

  function closeLeadPopup(options) {
    if (!leadPopup) return;
    leadPopup.hidden = true;
    leadPopup.classList.remove("is-visible");
    leadPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open", "lead-popup-open");
  }

  function validateLeadPopupForm() {
    let valid = true;
    let firstInvalidField = null;
    let firstInvalidKey = "";
    let validatedPhone = null;

    Object.keys(leadPopupFields).forEach(function (key) {
      const field = leadPopupFields[key];
      const inputValue = field.input ? field.input.value || "" : "";
      const isValid =
        key === "phone"
          ? Boolean(
              (validatedPhone = buildValidatedPhoneNumber(
                inputValue,
                leadPopupCountryInput ? leadPopupCountryInput.value : "",
                allowedPhoneCountryCodes
              )).valid
            )
          : field.input && field.test(inputValue);

      setError(field, !isValid);
      if (!isValid) {
        valid = false;
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    if (!valid) {
      setLeadPopupErrorMessage(config.form_submit_error || "Please check the required fields and try again.");
      if (leadPopupError) leadPopupError.classList.add("is-visible");
      focusFieldError(firstInvalidField);
      return null;
    }

    if (leadPopupError) leadPopupError.classList.remove("is-visible");
    return validatedPhone;
  }

  function copyLeadPopupIntoMainForm(validatedPhone) {
    const popupName = leadPopupFields.name.input ? leadPopupFields.name.input.value.trim() : "";
    const popupEmail = leadPopupFields.email.input ? normalizeEmailValue(leadPopupFields.email.input.value) : "";
    const popupMessage = leadPopupFields.message.input ? leadPopupFields.message.input.value.trim() : "";

    if (splitName) {
      const nameParts = popupName.split(/\s+/).filter(Boolean);
      if (fields.firstName && fields.firstName.input) fields.firstName.input.value = nameParts.shift() || popupName;
      if (fields.lastName && fields.lastName.input) fields.lastName.input.value = nameParts.join(" ") || popupName;
    } else if (fields.name && fields.name.input) {
      fields.name.input.value = popupName;
    }

    if (fields.phone && fields.phone.input) fields.phone.input.value = validatedPhone.phoneLocal;
    syncCountryPickerByInput(phoneCountryInput, validatedPhone.countryCode);
    if (fields.email && fields.email.input) fields.email.input.value = popupEmail;
    if (fields.message && fields.message.input) fields.message.input.value = popupMessage;
  }

  if (leadPopupForm) {
    Object.keys(leadPopupFields).forEach(function (key) {
      const field = leadPopupFields[key];
      if (!field.input) return;
      field.input.addEventListener("input", function () {
        if (key === "phone") {
          field.input.value = field.input.value.replace(/[^\d\s\-()]/g, "");
        }
        setError(field, false);
        if (leadPopupError) leadPopupError.classList.remove("is-visible");
      });
      field.input.addEventListener("change", function () {
        setError(field, false);
        if (leadPopupError) leadPopupError.classList.remove("is-visible");
      });
    });

    leadPopupCloseButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        closeLeadPopup();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && leadPopup && leadPopup.classList.contains("is-visible")) {
        closeLeadPopup();
      }
    });

    leadPopupForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const validatedPhone = validateLeadPopupForm();
      if (!validatedPhone) return;

      copyLeadPopupIntoMainForm(validatedPhone);
      if (leadPopupSubmit) {
        leadPopupSubmit.disabled = true;
        leadPopupSubmit.textContent = "Submitting...";
      }
      closeLeadPopup({ remember: false });
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    window.setTimeout(function () {
      if (document.hidden) {
        const openWhenVisible = function () {
          if (!document.hidden) {
            document.removeEventListener("visibilitychange", openWhenVisible);
            openLeadPopup();
          }
        };
        document.addEventListener("visibilitychange", openWhenVisible);
        return;
      }
      openLeadPopup();
    }, leadPopupDelayMs);
  }

  const whatsappCtas = Array.from(document.querySelectorAll("[data-whatsapp-cta]"));
  const whatsappModal = document.querySelector("[data-whatsapp-modal]");
  const whatsappModalCloseButtons = Array.from(document.querySelectorAll("[data-whatsapp-modal-close]"));
  const whatsappModalCountryInput = document.getElementById("whatsappModalCountryCode");
  const whatsappModalPhoneInput = document.getElementById("whatsappModalPhone");
  const whatsappModalPhoneField = document.getElementById("whatsappModalPhoneField");
  const whatsappModalError = document.getElementById("whatsappModalError");
  const whatsappModalBlocked = document.getElementById("whatsappModalBlocked");
  const whatsappModalContinue = document.getElementById("whatsappModalContinue");
  const defaultWhatsAppModalLabel = whatsappModalContinue ? whatsappModalContinue.textContent : "Continue to WhatsApp";
  const defaultWhatsAppPhoneErrorMessage =
    whatsappModalPhoneField && whatsappModalPhoneField.querySelector(".field-error")
      ? whatsappModalPhoneField.querySelector(".field-error").textContent.trim()
      : "Please enter a valid phone number before continuing to WhatsApp.";
  let activeWhatsAppLink = null;

  function setWhatsAppModalError(message) {
    if (!whatsappModalError) return;
    whatsappModalError.textContent = message;
    whatsappModalError.classList.add("is-visible");
  }

  function setWhatsAppModalPhoneError(hasError) {
    if (!whatsappModalPhoneField || !whatsappModalPhoneInput) return;
    whatsappModalPhoneField.classList.toggle("has-error", hasError);
    whatsappModalPhoneInput.setAttribute("aria-invalid", hasError ? "true" : "false");
  }

  function clearWhatsAppModalState() {
    setWhatsAppModalPhoneError(false);
    if (whatsappModalError) whatsappModalError.classList.remove("is-visible");
    if (whatsappModalBlocked) whatsappModalBlocked.classList.remove("is-visible");
    if (whatsappModalContinue) {
      whatsappModalContinue.disabled = false;
      whatsappModalContinue.textContent = defaultWhatsAppModalLabel;
    }
  }

  function closeWhatsAppModal() {
    if (!whatsappModal) return;
    clearWhatsAppModalState();
    whatsappModal.hidden = true;
    whatsappModal.classList.remove("is-visible");
    whatsappModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    activeWhatsAppLink = null;
  }

  function openWhatsAppModal(link) {
    if (!whatsappModal) return;
    activeWhatsAppLink = link;
    clearWhatsAppModalState();

    if (whatsappModalCountryInput) {
      syncCountryPickerByInput(whatsappModalCountryInput, phoneCountryInput ? phoneCountryInput.value : "+971");
    }
    if (whatsappModalPhoneInput) {
      whatsappModalPhoneInput.value = fields.phone && fields.phone.input ? String(fields.phone.input.value || "").trim() : "";
    }

    whatsappModal.hidden = false;
    whatsappModal.classList.add("is-visible");
    whatsappModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    window.setTimeout(function () {
      if (whatsappModalPhoneInput && typeof whatsappModalPhoneInput.focus === "function") {
        whatsappModalPhoneInput.focus();
        whatsappModalPhoneInput.select();
      }
    }, 40);
  }

  function buildWhatsAppTrackingPayload(link) {
    const ctaLocation = link ? String(link.dataset.ctaLocation || "whatsapp_cta") : "whatsapp_cta";
    const destinationUrl = link ? String(link.dataset.whatsappDestination || link.href || "").trim() : "";
    return Object.assign(
      {
        cta_type: "whatsapp",
        cta_label: "WhatsApp",
        cta_location: ctaLocation,
        destination_url: destinationUrl,
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        project_name: config.project_name,
        project_slug: config.project_slug,
        source_page: config.source_page,
        gclid: clickIds.gclid,
        gbraid: clickIds.gbraid,
        wbraid: clickIds.wbraid
      },
      utmData
    );
  }

  function buildWhatsAppLeadPayload(validatedPhone, link) {
    const firstName = fields.firstName && fields.firstName.input ? fields.firstName.input.value.trim() : "";
    const lastName = fields.lastName && fields.lastName.input ? fields.lastName.input.value.trim() : "";
    const fullName = splitName
      ? (firstName + " " + lastName).trim()
      : fields.name && fields.name.input
        ? fields.name.input.value.trim()
        : "";
    const emailNormalized = fields.email && fields.email.input ? normalizeEmailValue(fields.email.input.value) : "";
    const messageText = fields.message && fields.message.input ? fields.message.input.value.trim() : "";
    const preferredProject = fields.project && fields.project.input ? fields.project.input.value.trim() : "";
    const propertyType = fields.propertyType && fields.propertyType.input ? fields.propertyType.input.value.trim() : "";
    const leadId = createLeadId();

    return Object.assign(
      {
        lead_id: leadId,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        name: fullName,
        phone: validatedPhone.e164,
        phone_number: validatedPhone.e164,
        phone_local: validatedPhone.phoneLocal,
        phone_country_code: validatedPhone.countryCode,
        email: emailNormalized,
        preferred_project: preferredProject || config.project_name,
        preferred_unit: preferredProject || config.project_name,
        property_type: propertyType || "",
        inquiry_type: propertyType || "",
        project_name: config.project_name,
        project_slug: config.project_slug,
        source_page: config.source_page,
        landing_page_url: config.landing_page_url,
        thank_you_page_url: config.thank_you_page_url,
        project: config.project_name,
        brokerage: "Oaklyn Realty",
        source: config.source_page,
        submitted_at: new Date().toISOString(),
        page_url: window.location.href,
        entry_point: "whatsapp_verification_popup",
        cta_location: link ? String(link.dataset.ctaLocation || "") : "",
        gclid: clickIds.gclid,
        gbraid: clickIds.gbraid,
        wbraid: clickIds.wbraid,
        google_click_id: clickIds.gclid || clickIds.gbraid || clickIds.wbraid,
        message: messageText,
        inquiry_message: messageText,
        comments: messageText,
        gdpr_consent:
          "By submitting this form, you agree to be contacted by Oaklyn Realty regarding your property inquiry."
      },
      utmData
    );
  }

  function sendWhatsAppLeadWebhook(payload) {
    if (!config.whatsapp_webhook_url) return Promise.resolve();

    const requestBody = new URLSearchParams();
    Object.keys(payload).forEach(function (key) {
      requestBody.append(key, payload[key] == null ? "" : String(payload[key]));
    });

    return fetch(config.whatsapp_webhook_url, {
      method: "POST",
      body: requestBody,
      keepalive: true
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("WhatsApp webhook request failed with status " + response.status);
      }
      return response.text();
    });
  }

  async function handleWhatsAppModalContinue() {
    if (!activeWhatsAppLink) return;

    clearWhatsAppModalState();

    const rawCountryCode = whatsappModalCountryInput ? whatsappModalCountryInput.value : "+971";
    const rawPhone = whatsappModalPhoneInput ? whatsappModalPhoneInput.value : "";
    const validatedPhone = buildValidatedPhoneNumber(rawPhone, rawCountryCode, allowedPhoneCountryCodes);

    if (!validatedPhone.valid) {
      setWhatsAppModalPhoneError(true);
      setWhatsAppModalError(defaultWhatsAppPhoneErrorMessage);
      pushDataLayerEvent(
        Object.assign(
          {
            event: "whatsapp_cta_blocked",
            blacklist_status: "validation_required"
          },
          buildWhatsAppTrackingPayload(activeWhatsAppLink)
        )
      );
      if (whatsappModalPhoneInput && typeof whatsappModalPhoneInput.focus === "function") {
        whatsappModalPhoneInput.focus();
      }
      return;
    }

    const linkForTracking = activeWhatsAppLink;
    const destinationUrl = String(
      linkForTracking.dataset.whatsappDestination || linkForTracking.href || ""
    ).trim();
    const blacklistPromise = checkBlacklistStatusWithSimilarPhone({
      phone_number: validatedPhone.e164,
      email: fields.email && fields.email.input ? normalizeEmailValue(fields.email.input.value) : "",
      phone_candidates: buildSimilarPhoneCandidates(validatedPhone)
    });

    if (whatsappModalContinue) {
      whatsappModalContinue.disabled = true;
    }

    closeWhatsAppModal();

    showVerification(async function () {
      try {
        const blacklistResult = await blacklistPromise;

        if (blacklistResult.blocked) {
          openWhatsAppModal(linkForTracking);
          if (whatsappModalCountryInput) whatsappModalCountryInput.value = validatedPhone.countryCode;
          if (whatsappModalPhoneInput) whatsappModalPhoneInput.value = validatedPhone.phoneLocal;
          if (whatsappModalBlocked) whatsappModalBlocked.classList.add("is-visible");
          pushDataLayerEvent(
            Object.assign(
              {
                event: "whatsapp_cta_blocked",
                blacklist_status: "blocked",
                block_reason: "blacklist",
                matched_phone_number: blacklistResult.matched_phone_number || ""
              },
              buildWhatsAppTrackingPayload(linkForTracking)
            )
          );

          if (whatsappModalContinue) {
            whatsappModalContinue.disabled = false;
            whatsappModalContinue.textContent = defaultWhatsAppModalLabel;
          }
          return;
        }

        const whatsappLeadPayload = buildWhatsAppLeadPayload(validatedPhone, linkForTracking);
        const whatsappTrackingPayload = Object.assign(
          {
            lead_id: whatsappLeadPayload.lead_id,
            event_id: whatsappLeadPayload.lead_id
          },
          buildWhatsAppTrackingPayload(linkForTracking)
        );
        setLeadMatchKeys({
          email: whatsappLeadPayload.email,
          phone: whatsappLeadPayload.phone_number
        });

        await sendWhatsAppLeadWebhook(whatsappLeadPayload)
          .then(function () {
            pushDataLayerEvent(
              Object.assign(
                {
                  event: "whatsapp_webhook_success",
                  webhook_status: "success",
                  blacklist_status: "clear"
                },
                whatsappTrackingPayload
              )
            );
          })
          .catch(function (error) {
            console.error("[whatsapp] Popup webhook failed", error);
            pushDataLayerEvent(
              Object.assign(
                {
                  event: "whatsapp_webhook_error",
                  webhook_status: "error",
                  blacklist_status: "clear",
                  error_message: error && error.message ? error.message : "unknown"
                },
                whatsappTrackingPayload
              )
            );
          });

        pushDataLayerEvent(
          Object.assign(
            {
              event: "whatsapp_cta_click",
              blacklist_status: "clear"
            },
            whatsappTrackingPayload
          )
        );

        pushDataLayerEvent(
          Object.assign(
            {
              event: "whatsapp_cta_conversion",
              conversion_type: "whatsapp",
              blacklist_status: "clear"
            },
            whatsappTrackingPayload
          )
        );

        window.location.assign(destinationUrl);
      } catch (error) {
        console.error("[whatsapp] Blacklist check failed", error);
        openWhatsAppModal(linkForTracking);
        if (whatsappModalCountryInput) whatsappModalCountryInput.value = validatedPhone.countryCode;
        if (whatsappModalPhoneInput) whatsappModalPhoneInput.value = validatedPhone.phoneLocal;
        setWhatsAppModalError(config.blacklist_error_message || "Something went wrong. Please try again.");
        pushDataLayerEvent(
          Object.assign(
            {
              event: "whatsapp_cta_blacklist_error",
              blacklist_status: "error"
            },
            buildWhatsAppTrackingPayload(linkForTracking)
          )
        );

        if (whatsappModalContinue) {
          whatsappModalContinue.disabled = false;
          whatsappModalContinue.textContent = defaultWhatsAppModalLabel;
        }
      }
    });
  }

  if (whatsappModal) {
    whatsappModalCloseButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        closeWhatsAppModal();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && whatsappModal.classList.contains("is-visible")) {
        closeWhatsAppModal();
      }
    });
  }

  if (whatsappModalPhoneInput) {
    whatsappModalPhoneInput.addEventListener("input", function () {
      whatsappModalPhoneInput.value = whatsappModalPhoneInput.value.replace(/[^\d\s\-()]/g, "");
      setWhatsAppModalPhoneError(false);
      if (whatsappModalError) whatsappModalError.classList.remove("is-visible");
      if (whatsappModalBlocked) whatsappModalBlocked.classList.remove("is-visible");
    });
  }

  if (whatsappModalCountryInput) {
    whatsappModalCountryInput.addEventListener("input", function () {
      whatsappModalCountryInput.value = whatsappModalCountryInput.value.replace(/[^\d+]/g, "");
      if (whatsappModalError) whatsappModalError.classList.remove("is-visible");
    });
  }

  if (whatsappModalContinue) {
    whatsappModalContinue.addEventListener("click", function () {
      handleWhatsAppModalContinue();
    });
  }

  const whatsappClickTargets = Array.from(
    new Set(whatsappCtas.concat(Array.from(document.querySelectorAll('a[href*="wa.me"]'))))
  );
  whatsappClickTargets.forEach(function (link) {
    link.addEventListener("click", handleWhatsApp);
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener("click", handleCall);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (formSubmissionInProgress) return;
    setFormErrorMessage("We could not submit your enquiry. Please try again or contact Oaklyn Realty directly.");
    if (formError) formError.classList.remove("is-visible");

    if (honeypot && honeypot.value.trim() !== "") return;

    let valid = true;
    let firstInvalidField = null;
    let validatedPhone = null;
    Object.keys(fields).forEach(function (key) {
      const field = fields[key];
      const inputValue = field.input ? field.input.value || "" : "";
      const isValid =
        key === "phone"
          ? Boolean(
              (validatedPhone = buildValidatedPhoneNumber(
                inputValue,
                phoneCountryInput ? phoneCountryInput.value : "",
                allowedPhoneCountryCodes
              )).valid
            )
          : field.input && field.test(inputValue);
      setError(field, !isValid);
      if (!isValid) {
        valid = false;
        if (!firstInvalidField && field.wrap && field.wrap.offsetParent !== null) {
          firstInvalidField = field;
          firstInvalidKey = key;
        }
      }
    });

    if (!valid) {
      if (formError) {
        const isArabic = config.current_language === "ar" || document.documentElement.lang === "ar";
        if (firstInvalidKey === "phone") {
          setFormErrorMessage(config.form_phone_error || (isArabic ? "يرجى اختيار مفتاح الدولة وإدخال رقم هاتف صحيح." : "Please select a country code and enter a real phone number."));
        } else if (firstInvalidKey === "email") {
          setFormErrorMessage(config.form_email_error || (isArabic ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a real email address."));
        } else {
          setFormErrorMessage(config.form_select_error || (isArabic ? "يرجى إكمال جميع الحقول المطلوبة." : "Please complete all required fields."));
        }
        formError.classList.add("is-visible");
      }
      focusFieldError(firstInvalidField);
      return;
    }

    const leadId = createLeadId();
    const phoneCountryCode = validatedPhone ? validatedPhone.countryCode : "";
    const phoneLocal = validatedPhone ? validatedPhone.phoneLocal : stripPhoneFormatting(fields.phone.input.value.trim());
    const phoneFull = validatedPhone ? validatedPhone.e164 : "";
    fields.phone.input.value = phoneLocal;
    const firstName = fields.firstName && fields.firstName.input ? fields.firstName.input.value.trim() : "";
    const lastName = fields.lastName && fields.lastName.input ? fields.lastName.input.value.trim() : "";
    const fullName = splitName ? (firstName + " " + lastName).trim() : fields.name.input.value.trim();
    const formName = fullName;
    const formPhone = phoneFull;
    const formEmail = normalizeEmailValue(fields.email.input.value);
    const formMessage = fields.message && fields.message.input ? fields.message.input.value.trim() : "";
    const formUnit = fields.project.input.value.trim();
    const formInquiry = fields.propertyType.input.value.trim();
    const formSubmissionKey = buildFormSubmissionKey(formPhone, formEmail);
    const recentSubmission = getRecentFormSubmission(formSubmissionKey);

    if (recentSubmission) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "lead_duplicate_suppressed",
        project: config.project_name,
        project_name: config.project_name,
        project_slug: config.project_slug,
        lead_id: recentSubmission.lead_id || "",
        form_submission_key: formSubmissionKey,
        dedupe_window_minutes: Math.round(FORM_DEDUPE_WINDOW_MS / 60000)
      });
      showBlockedSuccess(config.blacklist_block_message || "Thank you. Your inquiry has already been received.");
      return;
    }

    formSubmissionInProgress = true;
    writeFormSubmissionState(formSubmissionKey, leadId, "pending");
    const blockedLead = isBlacklisted(formPhone);
    const blacklistPromise = (blockedLead
      ? Promise.resolve({
          blocked: true,
          matched_phone_number: formPhone,
          checked_phone_numbers: [formPhone]
        })
      : checkBlacklistStatusWithSimilarPhone({
          phone_number: formPhone,
          email: formEmail,
          phone_candidates: buildSimilarPhoneCandidates(validatedPhone)
        })
    ).then(
      function (result) {
        return { result: result };
      },
      function (error) {
        return { error: error };
      }
    );

    if (leadIdInput) leadIdInput.value = leadId;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Verifying...";
    }

    showVerification(async function () {
      let blacklistResult;

      const blacklistOutcome = await blacklistPromise;

      if (blacklistOutcome && blacklistOutcome.error) {
        console.error("[form] Blacklist check failed", blacklistOutcome.error);
        releaseFormSubmissionLock();
        clearFormSubmissionState(formSubmissionKey);
        setFormErrorMessage(config.blacklist_error_message || "Something went wrong. Please try again.");
        if (formError) formError.classList.add("is-visible");
        pushDataLayerEvent({
          event: "lead_blacklist_error",
          project: config.project_name,
          project_name: config.project_name,
          project_slug: config.project_slug,
          lead_id: leadId,
          blacklist_status: "error"
        });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultSubmitLabel;
        }
        return;
      }

      blacklistResult = blacklistOutcome ? blacklistOutcome.result : null;

      if (blacklistResult && blacklistResult.blocked) {
        releaseFormSubmissionLock();
        clearFormSubmissionState(formSubmissionKey);
        pushDataLayerEvent({
          event: "lead_blocked",
          project: config.project_name,
          project_name: config.project_name,
          project_slug: config.project_slug,
          lead_id: leadId,
          blacklist_status: "blocked",
          block_reason: "blacklist",
          matched_phone_number: blacklistResult.matched_phone_number || ""
        });
        showBlockedSuccess(config.blacklist_block_message || "Thank you. Your inquiry has already been received.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultSubmitLabel;
        }
        return;
      }

      if (submitBtn) {
        submitBtn.textContent = "Submitting...";
      }

      const payload = Object.assign(
        {
          lead_id: leadId,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          name: formName,
          phone: formPhone,
          phone_number: formPhone,
          phone_local: phoneLocal,
          phone_country_code: phoneCountryCode,
          email: formEmail,
          unit: formUnit,
          inquiry: formInquiry,
          preferred_project: formUnit,
          preferred_unit: formUnit,
          property_type: formInquiry,
          inquiry_type: formInquiry,
          project_interest: formUnit,
          unit_type: formInquiry,
          project_name: config.project_name,
          project_slug: config.project_slug,
          source_page: config.source_page,
          landing_page_url: config.landing_page_url,
          thank_you_page_url: config.thank_you_page_url,
          project: config.project_name,
          brokerage: "Oaklyn Realty",
          source: document.referrer || "direct",
          submitted_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          page: window.location.href,
          page_url: window.location.href,
          gclid: clickIds.gclid,
          gbraid: clickIds.gbraid,
          wbraid: clickIds.wbraid,
          google_click_id: clickIds.gclid || clickIds.gbraid || clickIds.wbraid,
          buyer_type: "",
          preferred_contact: "",
          budget_range: "",
          message: formMessage,
          inquiry_message: formMessage,
          comments: formMessage,
          gdpr_consent:
            "By submitting this form, you agree to be contacted by Oaklyn Realty regarding your property inquiry."
        },
        utmData
      );

      let webhookSucceeded = false;
      let leadMatchData = null;

      submitFormWebhook(payload)
        .then(function () {
          webhookSucceeded = true;
          writeFormSubmissionState(formSubmissionKey, leadId, "submitted");
          leadMatchData = setLeadMatchKeys(
            Object.assign({}, payload, {
              lead_id: leadId,
              email: formEmail,
              phone: formPhone
            })
          );
          pushDataLayerEvent(
            Object.assign(
              {
                event: "form_webhook_success",
                project: config.project_name,
                project_name: config.project_name,
                project_slug: config.project_slug,
                lead_id: leadId,
                event_id: leadId,
                blacklist_status: "clear",
                webhook_status: "success"
              },
              buildLeadMatchingTrackingFields(leadMatchData),
              clickIds,
              utmData
            )
          );
        })
        .catch(function (error) {
          console.error("Webhook submit error:", error);
          releaseFormSubmissionLock();
          clearFormSubmissionState(formSubmissionKey);
          setFormErrorMessage(config.form_submit_error || "We could not submit your enquiry. Please try again or contact Oaklyn Realty directly.");
          if (formError) formError.classList.add("is-visible");
          pushDataLayerEvent({
            event: "form_webhook_error",
            project: config.project_name,
            project_name: config.project_name,
            project_slug: config.project_slug,
            lead_id: leadId,
            error_message: error && error.message ? error.message : "unknown"
          });
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = defaultSubmitLabel;
          }
        })
        .finally(function () {
          if (!webhookSucceeded) return;
          leadMatchData = leadMatchData || buildLeadMatchData(payload);
          pushDataLayerEvent(
            Object.assign(
              {
                event: "lead_success",
                conversion_type: "form",
                conversion_action: "form_submission",
                project: config.project_name,
                project_name: config.project_name,
                project_slug: config.project_slug,
                lead_id: leadId,
                event_id: leadId,
                form_submission_confirmed: true,
                blacklist_status: "clear",
                webhook_status: "success",
                preferred_unit: formUnit,
                preferred_project: formUnit,
                property_type: formInquiry,
                inquiry_type: formInquiry
              },
              buildLeadMatchingTrackingFields(leadMatchData),
              clickIds,
              utmData
            )
          );
          writeLeadSuccessState(leadId);
          window.setTimeout(function () {
            window.location.href = buildThankYouUrl(leadId);
          }, 350);
        });
    });
  });
})();
