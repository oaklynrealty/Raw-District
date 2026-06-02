(function () {
  const config = window.OAKLYN_LANDING_CONFIG;
  if (!config) return;

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
    let activeIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let autoTimer = null;

    function setSlide(index) {
      if (!track || !slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
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
    }

    function stopAutoSlide() {
      if (autoTimer) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function startAutoSlide() {
      if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      stopAutoSlide();
      autoTimer = window.setInterval(function () {
        setSlide(activeIndex + 1);
      }, 5600);
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

  function pushDataLayerEvent(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function createLeadId() {
    return config.project_slug + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

  function normalizePhone(value) {
    const cleaned = String(value || "").replace(/[^\d+]/g, "");
    if (!cleaned) return "";
    if (cleaned.charAt(0) === "+") return cleaned;
    return "+" + cleaned.replace(/\D/g, "");
  }

  function normalizeDialCode(value) {
    const cleaned = String(value || "").replace(/[^\d+]/g, "");
    if (!cleaned) return "+971";
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
    if (!nationalNumber || nationalNumber.length < 6 || nationalNumber.length > 12) {
      return { valid: false };
    }

    if (hasRepeatedDigits(nationalNumber)) {
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
  const countryPicker = document.querySelector("[data-country-picker]");
  const countryPickerTrigger = document.querySelector("[data-country-picker-trigger]");
  const countryPickerPanel = document.querySelector("[data-country-picker-panel]");
  const countryPickerSearch = document.querySelector("[data-country-picker-search]");
  const countryPickerFlag = document.querySelector("[data-country-picker-flag]");
  const countryPickerLabel = document.querySelector("[data-country-picker-label]");
  const countryPickerCode = document.querySelector("[data-country-picker-code]");
  const countryPickerEmpty = document.querySelector("[data-country-picker-empty]");
  const countryOptions = Array.from(document.querySelectorAll("[data-country-option]"));
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

  if (countryPicker && phoneCountryInput && countryPickerTrigger && countryPickerPanel) {
    const normalizeCountrySearch = function (value) {
      return String(value || "").trim().toLowerCase().replace(/[^\da-z+]/g, "");
    };

    const normalizeCodeDigits = function (value) {
      return String(value || "").replace(/\D/g, "");
    };

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
        ? countryOptions.some(function (option) {
            return normalizeCodeDigits(option.dataset.countryCode || "") === normalizedCodeQuery;
          })
        : false;
      let visibleCount = 0;

      countryOptions.forEach(function (option) {
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

    const selectCountryOption = function (option) {
      if (!option) return;

      const nextFlag = option.dataset.countryFlag || "";
      const nextLabel = option.dataset.countryLabel || "";
      const nextCode = option.dataset.countryCode || "";

      phoneCountryInput.value = nextCode;
      if (countryPickerFlag) countryPickerFlag.textContent = nextFlag;
      if (countryPickerLabel) countryPickerLabel.textContent = nextLabel;
      if (countryPickerCode) countryPickerCode.textContent = nextCode;

      countryOptions.forEach(function (item) {
        const active = item === option;
        item.classList.toggle("is-selected", active);
        item.setAttribute("aria-selected", String(active));
      });

      if (countryPickerSearch) {
        countryPickerSearch.value = "";
      }

      const phoneFieldWrap = document.getElementById("phoneField");
      if (phoneFieldWrap) {
        phoneFieldWrap.classList.remove("has-error");
      }
      if (formError) {
        formError.classList.remove("is-visible");
      }

      syncCountryOptionVisibility();
      closeCountryPicker();
    };

    countryPickerTrigger.addEventListener("click", function () {
      if (countryPicker.classList.contains("is-open")) {
        closeCountryPicker();
      } else {
        openCountryPicker();
      }
    });

    countryOptions.forEach(function (option) {
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
  }

  function showBlockedSuccess(message) {
    const successTitle = success ? success.querySelector("h3") : null;
    const successCopy = success ? success.querySelector(".section-copy") : null;

    form.style.display = "none";
    if (successTitle) successTitle.textContent = "Thank you";
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
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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
      whatsappModalCountryInput.value = normalizeDialCode(phoneCountryInput ? phoneCountryInput.value : "+971");
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
        message: "",
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
      setWhatsAppModalError("Please enter a valid phone number before continuing to WhatsApp.");
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

    if (whatsappModalContinue) {
      whatsappModalContinue.disabled = true;
      whatsappModalContinue.textContent = "Checking...";
    }

    try {
      const blacklistResult = await checkBlacklistStatusWithSimilarPhone({
        phone_number: validatedPhone.e164,
        email: fields.email && fields.email.input ? normalizeEmailValue(fields.email.input.value) : "",
        phone_candidates: buildSimilarPhoneCandidates(validatedPhone)
      });

      if (blacklistResult.blocked) {
        if (whatsappModalBlocked) whatsappModalBlocked.classList.add("is-visible");
        pushDataLayerEvent(
          Object.assign(
            {
              event: "whatsapp_cta_blocked",
              blacklist_status: "blocked",
              block_reason: "blacklist",
              matched_phone_number: blacklistResult.matched_phone_number || ""
            },
            buildWhatsAppTrackingPayload(activeWhatsAppLink)
          )
        );

        if (whatsappModalContinue) {
          whatsappModalContinue.disabled = false;
          whatsappModalContinue.textContent = defaultWhatsAppModalLabel;
        }
        return;
      }

      sendWhatsAppLeadWebhook(buildWhatsAppLeadPayload(validatedPhone, activeWhatsAppLink)).catch(function (error) {
        console.error("[whatsapp] Popup webhook failed", error);
      });

      pushDataLayerEvent(
        Object.assign(
          {
            event: "whatsapp_cta_click",
            blacklist_status: "clear"
          },
          buildWhatsAppTrackingPayload(activeWhatsAppLink)
        )
      );

      pushDataLayerEvent(
        Object.assign(
          {
            event: "whatsapp_cta_conversion",
            conversion_type: "whatsapp",
            blacklist_status: "clear"
          },
          buildWhatsAppTrackingPayload(activeWhatsAppLink)
        )
      );

      const destinationUrl = String(activeWhatsAppLink.dataset.whatsappDestination || activeWhatsAppLink.href || "").trim();
      closeWhatsAppModal();
      window.location.assign(destinationUrl);
    } catch (error) {
      console.error("[whatsapp] Blacklist check failed", error);
      setWhatsAppModalError(config.blacklist_error_message || "Something went wrong. Please try again.");
      pushDataLayerEvent(
        Object.assign(
          {
            event: "whatsapp_cta_blacklist_error",
            blacklist_status: "error"
          },
          buildWhatsAppTrackingPayload(activeWhatsAppLink)
        )
      );

      if (whatsappModalContinue) {
        whatsappModalContinue.disabled = false;
        whatsappModalContinue.textContent = defaultWhatsAppModalLabel;
      }
    }
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

  if (whatsappCtas.length) {
    whatsappCtas.forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (event.defaultPrevented) return;
        event.preventDefault();
        openWhatsAppModal(link);
      });
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
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
        }
      }
    });

    if (!valid) {
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
    const emailNormalized = normalizeEmailValue(fields.email.input.value);
    if (leadIdInput) leadIdInput.value = leadId;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Checking...";
    }

    try {
      const blacklistResult = await checkBlacklistStatusWithSimilarPhone({
        phone_number: phoneFull,
        email: emailNormalized,
        phone_candidates: buildSimilarPhoneCandidates(validatedPhone)
      });

      if (blacklistResult.blocked) {
        console.log("Lead is blacklisted. Submission blocked.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultSubmitLabel;
        }
        showBlockedSuccess(config.blacklist_block_message || "Thank you. Your inquiry has already been received.");
        return;
      }

      console.log("Lead is clean. Submitting to webhook.");
    } catch (error) {
      console.error("[blacklist] Check failed", error);
      setFormErrorMessage(config.blacklist_error_message || "Something went wrong. Please try again.");
      if (formError) formError.classList.add("is-visible");
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
        name: fullName,
        phone: phoneFull,
        phone_number: phoneFull,
        phone_local: phoneLocal,
        phone_country_code: phoneCountryCode,
        email: emailNormalized,
        preferred_project: fields.project.input.value.trim(),
        preferred_unit: fields.project.input.value.trim(),
        property_type: fields.propertyType.input.value.trim(),
        inquiry_type: fields.propertyType.input.value.trim(),
        project_interest: fields.project.input.value.trim(),
        unit_type: fields.propertyType.input.value.trim(),
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
        gclid: clickIds.gclid,
        gbraid: clickIds.gbraid,
        wbraid: clickIds.wbraid,
        google_click_id: clickIds.gclid || clickIds.gbraid || clickIds.wbraid,
        buyer_type: "",
        preferred_contact: "",
        budget_range: "",
        message: "",
        gdpr_consent:
          "By submitting this form, you agree to be contacted by Oaklyn Realty regarding your property inquiry."
      },
      utmData
    );

    const requestBody = new URLSearchParams();
    Object.keys(payload).forEach(function (key) {
      requestBody.append(key, payload[key] == null ? "" : String(payload[key]));
    });

    try {
      const response = await fetch(config.webhook_url, {
        method: "POST",
        body: requestBody
      });

      if (!response.ok) {
        throw new Error("Webhook request failed with status " + response.status);
      }

      await response.text();

      form.style.display = "none";
      if (success) success.classList.add("is-visible");

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "lead_success",
        project: config.project_name,
        project_name: config.project_name,
        project_slug: config.project_slug,
        lead_id: leadId
      });

      writeLeadSuccessState(leadId);
      console.log("Redirecting to thank-you page.");

      window.setTimeout(function () {
        window.location.href = buildThankYouUrl(leadId);
      }, 700);
    } catch (error) {
      console.error("Webhook submit error:", error);
      setFormErrorMessage("We could not submit your enquiry. Please try again or contact Oaklyn Realty directly.");
      if (formError) formError.classList.add("is-visible");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultSubmitLabel;
      }
    }
  });
})();
