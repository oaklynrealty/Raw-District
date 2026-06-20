(function () {
  const config = window.OAKLYN_LANDING_CONFIG;
  if (!config) return;

  const params = new URLSearchParams(window.location.search);
  const trackingKeys = [
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
    "meta_placement"
  ];

  function getActiveVariant() {
    const requested = String(params.get("variant") || "").trim().toLowerCase();
    if (requested === "b") return "b";
    return document.body.dataset.defaultVariant || config.default_variant || "a";
  }

  const activeVariant = getActiveVariant();
  document.body.classList.toggle("variant-b", activeVariant === "b");
  document.body.classList.toggle("variant-a", activeVariant !== "b");

  function pushDataLayerEvent(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ project_slug: config.project_slug }, payload));
  }

  function createLeadId() {
    return config.project_slug + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  }

  function normalizeDialCode(value) {
    const cleaned = String(value || "").replace(/[^\d+]/g, "");
    if (!cleaned) return "+971";
    return cleaned.charAt(0) === "+" ? cleaned : "+" + cleaned.replace(/\D/g, "");
  }

  function normalizePhone(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function isValidPhone(countryCode, phone) {
    const code = normalizeDialCode(countryCode).replace(/\D/g, "");
    const local = normalizePhone(phone);
    const national = local.charAt(0) === "0" ? local.slice(1) : local;
    const full = code + national;
    if (!national || national.length < 6 || national.length > 12) return false;
    if (/^(\d)\1+$/.test(national)) return false;
    return full.length >= 8 && full.length <= 15;
  }

  function getE164(countryCode, phone) {
    const code = normalizeDialCode(countryCode);
    const local = normalizePhone(phone);
    const national = local.charAt(0) === "0" ? local.slice(1) : local;
    return code + national;
  }

  function isValidEmail(value) {
    const email = String(value || "").trim();
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getCookieValue(name) {
    const pattern = new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]*)");
    const match = document.cookie.match(pattern);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function getTrackingParam(key) {
    if (key === "fbp") return params.get("fbp") || getCookieValue("_fbp");
    if (key === "fbc") return params.get("fbc") || getCookieValue("_fbc");
    return params.get(key) || "";
  }

  function getAllUrlParamsJson() {
    const allParams = {};
    params.forEach(function (value, key) {
      if (Object.prototype.hasOwnProperty.call(allParams, key)) {
        allParams[key] = Array.isArray(allParams[key]) ? allParams[key].concat(value) : [allParams[key], value];
      } else {
        allParams[key] = value;
      }
    });
    return JSON.stringify(allParams);
  }

  function deriveAdPlatform(values) {
    const source = String(values.utm_source || "").toLowerCase();
    if (values.gclid || values.gbraid || values.wbraid || values.gad_source || source.includes("google")) return "Google Ads";
    if (values.fbclid || values.fbp || values.fbc || source.includes("facebook") || source.includes("instagram") || source.includes("meta")) return "Meta Ads";
    return "Website";
  }

  function getFirstTrackingValue(keys) {
    for (const key of keys) {
      const value = String(getTrackingParam(key) || "").trim();
      if (value) return value;
    }
    return "";
  }

  function getPageLanguage() {
    return (
      getFirstTrackingValue(["language", "lang"]) ||
      String(document.documentElement.lang || config.language || "en").trim() ||
      "en"
    );
  }

  function getCampaignSearchTerm() {
    return getFirstTrackingValue(["campaign_search_term", "search_term", "utm_term", "keyword", "query", "q"]);
  }

  function getSelectedCountryLabel(form, countryCode) {
    const picker = form.querySelector("[data-country-code-picker]");
    if (!picker) return "";
    const normalizedCode = normalizeDialCode(countryCode);
    const options = Array.from(picker.querySelectorAll("[data-country-code-option]"));
    const selected =
      options.find(function (option) {
        return option.classList.contains("is-selected");
      }) ||
      options.find(function (option) {
        return normalizeDialCode(option.dataset.countryCode || "") === normalizedCode;
      });
    return selected ? selected.dataset.countryLabel || "" : "";
  }

  function setHiddenFields(form, leadId) {
    const now = new Date().toISOString();
    const variant = form.dataset.formVariant || activeVariant;
    const campaignSearchTerm = getCampaignSearchTerm();
    const language = getPageLanguage();
    const propertyLink = config.property_link || config.landing_page_url || window.location.href.split("?")[0];
    const generalWhatsappLink = config.general_whatsapp_link || "";
    const values = {
      source_page: config.source_page,
      project_slug: config.project_slug,
      landing_page_variant: variant,
      timestamp: now,
      lead_id: leadId,
      event_id: leadId,
      events_id: leadId,
      portal_lead_id: leadId,
      property_link: propertyLink,
      property_url: propertyLink,
      listing_link: propertyLink,
      general_whatsapp_link: generalWhatsappLink,
      whatsapp_link: generalWhatsappLink,
      language: language,
      page_language: language,
      browser_language: navigator.language || "",
      campaign_search_term: campaignSearchTerm,
      search_term: getFirstTrackingValue(["search_term", "query", "q"]) || campaignSearchTerm,
      url_query_string: window.location.search.replace(/^\?/, ""),
      all_url_params_json: getAllUrlParamsJson(),
      crm_lead_stage: "new_campaign_lead",
      qualified_lead_status: "pending_crm_update",
      converted_lead_status: "pending_crm_update"
    };

    trackingKeys.forEach(function (key) {
      values[key] = getTrackingParam(key);
    });

    Object.keys(values).forEach(function (key) {
      const input = form.querySelector('[data-hidden-field="' + key + '"]');
      if (input) input.value = values[key];
    });

    return values;
  }

  function formValue(form, name) {
    const field = form.elements[name];
    if (!field) return "";
    if (field instanceof RadioNodeList) return field.value || "";
    if (field.type === "checkbox") return field.checked ? field.value : "";
    return field.value || "";
  }

  function splitName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ")
    };
  }

  function encodeWebhookPayload(payload) {
    const requestBody = new URLSearchParams();
    Object.keys(payload || {}).forEach(function (key) {
      const value = payload[key];
      requestBody.append(key, value == null ? "" : String(value));
    });
    return requestBody;
  }

  function setupCountryCodePickers() {
    const pickers = Array.from(document.querySelectorAll("[data-country-code-picker]"));

    function closePicker(picker) {
      const trigger = picker.querySelector("[data-country-code-trigger]");
      const panel = picker.querySelector("[data-country-code-panel]");
      picker.classList.remove("is-open");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
      if (panel) panel.hidden = true;
    }

    function closeOtherPickers(activePicker) {
      pickers.forEach(function (picker) {
        if (picker !== activePicker) closePicker(picker);
      });
    }

    pickers.forEach(function (picker) {
      const trigger = picker.querySelector("[data-country-code-trigger]");
      const panel = picker.querySelector("[data-country-code-panel]");
      const input = picker.querySelector("[data-country-code-input]");
      const current = picker.querySelector("[data-country-code-current]");
      const search = picker.querySelector("[data-country-code-search]");
      const empty = picker.querySelector("[data-country-code-empty]");
      const options = Array.from(picker.querySelectorAll("[data-country-code-option]"));

      if (!trigger || !panel || !input || !current || !search) return;

      function openPicker() {
        closeOtherPickers(picker);
        picker.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        window.setTimeout(function () {
          search.focus();
          search.select();
        }, 0);
      }

      function filterOptions() {
        const rawQuery = String(search.value || "").trim().toLowerCase();
        const digitQuery = rawQuery.replace(/\D/g, "");
        const isCodeOnly = Boolean(digitQuery) && !/[a-z]/i.test(rawQuery);
        const hasExactCodeMatch = isCodeOnly
          ? options.some(function (option) {
              return String(option.dataset.countryCode || "").replace(/\D/g, "") === digitQuery;
            })
          : false;
        let visibleCount = 0;

        options.forEach(function (option) {
          const query = String(option.dataset.countryQuery || "").toLowerCase();
          const codeDigits = String(option.dataset.countryCode || "").replace(/\D/g, "");
          let matches = true;

          if (rawQuery) {
            matches = isCodeOnly
              ? hasExactCodeMatch
                ? codeDigits === digitQuery
                : codeDigits.startsWith(digitQuery)
              : query.includes(rawQuery);
          }

          option.hidden = !matches;
          if (matches) visibleCount += 1;
        });

        if (empty) empty.hidden = visibleCount !== 0;
      }

      function selectOption(option) {
        if (!option) return;
        const label = option.dataset.countryLabel || "";
        const code = option.dataset.countryCode || "";
        input.value = code;
        current.textContent = (label + " " + code).trim();

        options.forEach(function (item) {
          const active = item === option;
          item.classList.toggle("is-selected", active);
          item.setAttribute("aria-selected", String(active));
        });

        const phoneField = picker.closest("form")?.querySelector('[data-field="phone"]');
        if (phoneField) phoneField.classList.remove("has-error");
        search.value = "";
        filterOptions();
        closePicker(picker);
        trigger.focus();
      }

      trigger.addEventListener("click", function () {
        if (picker.classList.contains("is-open")) {
          closePicker(picker);
        } else {
          openPicker();
        }
      });

      search.addEventListener("input", filterOptions);
      search.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closePicker(picker);
          trigger.focus();
        }
      });

      options.forEach(function (option) {
        option.addEventListener("click", function () {
          selectOption(option);
        });
      });

      document.addEventListener("click", function (event) {
        if (!picker.classList.contains("is-open")) return;
        if (picker.contains(event.target)) return;
        closePicker(picker);
      });

      filterOptions();
    });
  }

  function setFieldError(fieldWrap, hasError) {
    if (!fieldWrap) return;
    fieldWrap.classList.toggle("has-error", Boolean(hasError));
    const input = fieldWrap.querySelector("input, select, textarea");
    if (input) input.setAttribute("aria-invalid", hasError ? "true" : "false");
  }

  function focusFirstError(form) {
    const error = form.querySelector(".has-error input, .has-error select, .has-error textarea, .consent-row.has-error input");
    if (error && typeof error.focus === "function") {
      error.focus({ preventScroll: false });
    }
  }

  function buildLeadPayload(form, leadId) {
    const hidden = setHiddenFields(form, leadId);
    const countryCode = formValue(form, "phone_country_code");
    const phone = formValue(form, "phone");
    const fullName = String(formValue(form, "full_name")).trim();
    const nameParts = splitName(fullName);
    const phoneNumber = getE164(countryCode, phone);
    const phoneLocal = normalizePhone(phone);
    const phoneCountryCode = normalizeDialCode(countryCode);
    const phoneCountry = getSelectedCountryLabel(form, countryCode);
    const email = String(formValue(form, "email")).trim().toLowerCase();
    const propertyPreference = formValue(form, "property_preference");
    const purchaseTimeframe = formValue(form, "purchase_timeframe");
    const contactMethod = formValue(form, "contact_method") || "Advisor follow-up";
    const adPlatform = deriveAdPlatform(hidden);
    const campaignName = hidden.utm_campaign || "Raw District English";
    const sourceInformation = [
      adPlatform,
      hidden.utm_source ? "utm_source: " + hidden.utm_source : "",
      hidden.utm_medium ? "utm_medium: " + hidden.utm_medium : "",
      hidden.utm_campaign ? "utm_campaign: " + hidden.utm_campaign : "",
      hidden.gclid ? "gclid: " + hidden.gclid : "",
      hidden.fbclid ? "fbclid: " + hidden.fbclid : ""
    ]
      .filter(Boolean)
      .join(" | ");
    const propertyType = config.property_type || "Apartments";
    const leadTitle = fullName
      ? fullName + " - Raw District prices and availability"
      : "Raw District prices and availability request";
    const message = [
      "Project: " + config.project_name,
      "Property preference: " + (propertyPreference || "Not specified"),
      "Purchase timeframe: " + (purchaseTimeframe || "Not specified"),
      "Preferred contact: " + contactMethod,
      "Request: Official price list, floor plans and current availability"
    ].join("\n");
    const crmComment = [
      "Raw District lead details",
      "Lead title: " + leadTitle,
      "Full name: " + (fullName || "Not provided"),
      "Phone: " + (phoneNumber || "Not provided"),
      "Email: " + (email || "Not provided"),
      "Country: " + (phoneCountry || phoneCountryCode || "Not provided"),
      "Property preference: " + (propertyPreference || "Not specified"),
      "Purchase timeframe: " + (purchaseTimeframe || "Not specified"),
      "Preferred contact: " + contactMethod,
      "Source: " + adPlatform,
      "Source information: " + sourceInformation,
      "Campaign name: " + campaignName,
      "Campaign search term: " + (hidden.campaign_search_term || ""),
      "GCLID: " + (hidden.gclid || ""),
      "FBCLID: " + (hidden.fbclid || ""),
      "UTM source: " + (hidden.utm_source || ""),
      "UTM medium: " + (hidden.utm_medium || ""),
      "UTM campaign: " + (hidden.utm_campaign || ""),
      "UTM content: " + (hidden.utm_content || ""),
      "Property link: " + (hidden.property_link || config.landing_page_url),
      "General WhatsApp link: " + (hidden.general_whatsapp_link || ""),
      "Lead ID: " + leadId,
      "Submitted at: " + hidden.timestamp
    ].join("\n");

    const payload = Object.assign({}, hidden, {
      event: "generate_lead",
      project_name: config.project_name,
      project: config.project_name,
      brokerage: "Oaklyn Realty",
      ad_platform: adPlatform,
      traffic_source: adPlatform,
      form_type: form.dataset.formType || "",
      lead_title: leadTitle,
      title: leadTitle,
      TITLE: leadTitle,
      Title: leadTitle,
      "Lead Title": leadTitle,
      event_id: leadId,
      events_id: leadId,
      portal_lead_id: hidden.portal_lead_id || leadId,
      full_name: fullName,
      name: fullName,
      contact_name: fullName,
      first_name: nameParts.firstName,
      last_name: nameParts.lastName,
      phone: phoneNumber,
      phone_number: phoneNumber,
      mobile: phoneNumber,
      mobile_phone: phoneNumber,
      whatsapp_number: phoneNumber,
      phone_country_code: phoneCountryCode,
      phone_local: phoneLocal,
      country: phoneCountry || phoneCountryCode,
      country_name: phoneCountry,
      phone_country: phoneCountry,
      email: email,
      EMAIL: email,
      property_preference: propertyPreference,
      purchase_timeframe: purchaseTimeframe,
      contact_method: contactMethod,
      preferred_contact: contactMethod,
      unit: propertyPreference,
      inquiry: purchaseTimeframe || "Prices and availability request",
      preferred_project: config.project_name,
      preferred_unit: propertyPreference,
      project_interest: config.project_name,
      property_type: propertyPreference,
      inquiry_type: purchaseTimeframe || "Prices and availability request",
      unit_type: propertyPreference,
      lead_type: "Offplan Buyer",
      source: adPlatform,
      lead_source: adPlatform,
      marketing_source: hidden.utm_source || adPlatform,
      campaign_search_term: hidden.campaign_search_term || "",
      search_term: hidden.search_term || hidden.campaign_search_term || "",
      language: hidden.language || "en",
      page_language: hidden.page_language || hidden.language || "en",
      browser_language: hidden.browser_language || "",
      property_link: hidden.property_link || config.landing_page_url,
      property_url: hidden.property_url || hidden.property_link || config.landing_page_url,
      listing_link: hidden.listing_link || hidden.property_link || config.landing_page_url,
      general_whatsapp_link: hidden.general_whatsapp_link || "",
      whatsapp_link: hidden.whatsapp_link || hidden.general_whatsapp_link || "",
      message: message,
      inquiry_message: crmComment,
      comments: crmComment,
      comment: crmComment,
      comment_text: crmComment,
      COMMENTS: crmComment,
      NAME: nameParts.firstName || fullName,
      LAST_NAME: nameParts.lastName,
      FULL_NAME: fullName,
      PHONE: phoneNumber,
      PHONE_WORK: phoneNumber,
      PHONE_MOBILE: phoneNumber,
      PHONE_VALUE: phoneNumber,
      EMAIL_WORK: email,
      EMAIL_VALUE: email,
      SOURCE_ID: "WEB",
      SOURCE_DESCRIPTION: adPlatform + " - " + config.project_name,
      CURRENCY_ID: "AED",
      OPPORTUNITY: "0",
      OPENED: "Y",
      "Full Name": fullName,
      "Campaign name": campaignName,
      "Bedroom": propertyPreference,
      "Lead Name": fullName,
      "Name": nameParts.firstName || fullName,
      "Last name": nameParts.lastName,
      "Contact Name": fullName,
      "Source information": sourceInformation,
      "Comment": crmComment,
      "Ad system": adPlatform,
      "Medium": hidden.utm_medium || adPlatform,
      "Ad campaign UTM": hidden.utm_campaign || "",
      "Campaign contents": hidden.utm_content || "",
      "Mobile or WhatsApp number": phoneNumber,
      "Phone Number": phoneNumber,
      "Phone": phoneNumber,
      "Mobile": phoneNumber,
      "Mobile Phone": phoneNumber,
      "Phone (mobile)": phoneNumber,
      "WhatsApp Number": phoneNumber,
      "Email Address": email,
      "Email": email,
      "Email Work": email,
      "E-mail (mailing)": email,
      "Project": config.project_name,
      "Project Name": config.project_name,
      "Property Preference": propertyPreference,
      "Property Type": propertyType,
      "Purchase Timeframe": purchaseTimeframe,
      "Preferred Contact Method": contactMethod,
      "Lead Type": "Offplan Buyer",
      "Source": adPlatform,
      "Ad Platform": adPlatform,
      "Traffic Source": adPlatform,
      "Campaign search term": hidden.campaign_search_term || "",
      "Language": hidden.language || "en",
      "Events ID": leadId,
      "Event ID": leadId,
      "Portal Lead ID": hidden.portal_lead_id || leadId,
      "Property Link": hidden.property_link || config.landing_page_url,
      "Whatsapp Tracking Link": hidden.general_whatsapp_link || "",
      "General Whatsapp Link": hidden.general_whatsapp_link || "",
      "General WhatsApp Link": hidden.general_whatsapp_link || "",
      "Interested IN": config.project_name,
      "GCLID": hidden.gclid || "",
      "FBCLID": hidden.fbclid || "",
      "UTM Source": hidden.utm_source || "",
      "UTM Medium": hidden.utm_medium || "",
      "UTM Campaign": hidden.utm_campaign || "",
      "UTM Content": hidden.utm_content || "",
      "UTM Term": hidden.utm_term || "",
      "Country": phoneCountry || phoneCountryCode,
      "Comment text": crmComment,
      "Comments": crmComment,
      "Message": crmComment,
      consent: formValue(form, "consent") === "yes",
      gdpr_consent:
        "By submitting this form, you agree to be contacted by our property consultants regarding your inquiry.",
      landing_page_url: config.landing_page_url,
      thank_you_page_url: config.thank_you_page_url,
      page_url: window.location.href,
      page: window.location.href,
      submitted_at: hidden.timestamp,
      user_agent: navigator.userAgent
    });

    return payload;
  }

  async function sendLead(payload) {
    if (!config.webhook_url) return;
    await fetch(config.webhook_url, {
      method: "POST",
      mode: "no-cors",
      body: encodeWebhookPayload(payload),
      keepalive: true
    });
  }

  function renderSummary(container, payload) {
    if (!container) return;
    const rows = [
      ["Property preference", payload.property_preference || "Not specified"],
      ["Purchase timeframe", payload.purchase_timeframe || "Not specified"],
      ["Preferred contact", payload.contact_method || "Advisor follow-up"]
    ];
    container.textContent = "";
    rows.forEach(function (row) {
      const wrapper = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = row[0];
      detail.textContent = row[1];
      wrapper.append(term, detail);
      container.appendChild(wrapper);
    });
  }

  function showSuccess(form, payload) {
    const card = form.closest(".form-card");
    const success = card ? card.querySelector("[data-success-state]") : null;
    const summary = success ? success.querySelector("[data-success-summary]") : null;
    renderSummary(summary, payload);
    form.hidden = true;
    if (success) success.hidden = false;
    if (card) {
      card.classList.add("is-complete");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function setupMultiStepForm(form) {
    const panels = Array.from(form.querySelectorAll("[data-step-panel]"));
    const progress = Array.from(form.querySelectorAll("[data-progress-step]"));
    const currentStepText = form.closest(".form-card")?.querySelector("[data-current-step]");
    let currentStep = 1;

    function showStep(step) {
      currentStep = step;
      panels.forEach(function (panel) {
        const active = Number(panel.dataset.stepPanel) === step;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
      progress.forEach(function (item) {
        item.classList.toggle("is-active", Number(item.dataset.progressStep) <= step);
      });
      if (currentStepText) currentStepText.textContent = String(step);
    }

    function setStepError(step, visible) {
      const error = form.querySelector('[data-step-error="' + step + '"]');
      if (error) error.classList.toggle("is-visible", Boolean(visible));
    }

    function validateStep(step) {
      if (step === 1) {
        const valid = Boolean(formValue(form, "property_preference"));
        setStepError(1, !valid);
        return valid;
      }
      if (step === 2) {
        const valid = Boolean(formValue(form, "purchase_timeframe"));
        setStepError(2, !valid);
        return valid;
      }
      return validateContactFields(form);
    }

    form.querySelectorAll("[data-next-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (!validateStep(currentStep)) return;
        if (currentStep === 1 && !form.dataset.step1Tracked) {
          form.dataset.step1Tracked = "true";
          pushDataLayerEvent({
            event: "form_step_1_complete",
            landing_page_variant: form.dataset.formVariant || activeVariant,
            property_preference: formValue(form, "property_preference")
          });
        }
        if (currentStep === 2 && !form.dataset.step2Tracked) {
          form.dataset.step2Tracked = "true";
          pushDataLayerEvent({
            event: "form_step_2_complete",
            landing_page_variant: form.dataset.formVariant || activeVariant,
            purchase_timeframe: formValue(form, "purchase_timeframe")
          });
        }
        showStep(Math.min(currentStep + 1, 3));
      });
    });

    form.querySelectorAll("[data-prev-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        showStep(Math.max(currentStep - 1, 1));
      });
    });

    showStep(1);
  }

  function validateContactFields(form) {
    let valid = true;
    const fullNameWrap = form.querySelector('[data-field="full_name"]');
    const phoneWrap = form.querySelector('[data-field="phone"]');
    const emailWrap = form.querySelector('[data-field="email"]');
    const propertyWrap = form.querySelector('[data-field="property_preference"]');
    const consentWrap = form.querySelector('[data-field="consent"]');
    const consentError = form.querySelector(".consent-error");

    if (fullNameWrap) {
      const fieldValid = String(formValue(form, "full_name")).trim().length >= 2;
      setFieldError(fullNameWrap, !fieldValid);
      valid = valid && fieldValid;
    }

    if (phoneWrap) {
      const fieldValid = isValidPhone(formValue(form, "phone_country_code"), formValue(form, "phone"));
      setFieldError(phoneWrap, !fieldValid);
      valid = valid && fieldValid;
    }

    if (emailWrap) {
      const fieldValid = isValidEmail(formValue(form, "email"));
      setFieldError(emailWrap, !fieldValid);
      valid = valid && fieldValid;
    }

    if (propertyWrap) {
      const fieldValid = Boolean(formValue(form, "property_preference"));
      setFieldError(propertyWrap, !fieldValid);
      valid = valid && fieldValid;
    }

    if (consentWrap) {
      const fieldValid = formValue(form, "consent") === "yes";
      consentWrap.classList.toggle("has-error", !fieldValid);
      if (consentError) consentError.classList.toggle("is-visible", !fieldValid);
      valid = valid && fieldValid;
    }

    if (!valid) focusFirstError(form);
    return valid;
  }

  function setupLeadForm(form) {
    if (form.dataset.formType === "multi-step") setupMultiStepForm(form);

    function trackStart() {
      if (form.dataset.started) return;
      form.dataset.started = "true";
      pushDataLayerEvent({
        event: "form_start",
        form_type: form.dataset.formType || "",
        landing_page_variant: form.dataset.formVariant || activeVariant
      });
    }

    form.addEventListener("focusin", trackStart);
    form.addEventListener("change", trackStart);
    form.addEventListener("click", trackStart);

    form.addEventListener("input", function (event) {
      const field = event.target.closest("[data-field]");
      if (field) setFieldError(field, false);
      const consentError = form.querySelector(".consent-error");
      if (consentError) consentError.classList.remove("is-visible");
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      trackStart();

      const honeypot = form.elements.website;
      if (honeypot && honeypot.value) return;

      if (!validateContactFields(form)) return;

      const status = form.querySelector("[data-form-status]");
      const button = form.querySelector('button[type="submit"]');
      const originalLabel = button ? button.textContent : "";
      const leadId = createLeadId();
      const payload = buildLeadPayload(form, leadId);

      if (status) {
        status.textContent = "Please wait while we prepare your request.";
        status.classList.add("is-visible");
      }
      if (button) {
        button.disabled = true;
        button.textContent = config.cta;
      }

      try {
        await sendLead(payload);
        pushDataLayerEvent({
          event: "generate_lead",
          event_id: leadId,
          lead_id: leadId,
          form_type: payload.form_type,
          landing_page_variant: payload.landing_page_variant,
          property_preference: payload.property_preference,
          purchase_timeframe: payload.purchase_timeframe
        });
        pushDataLayerEvent({
          event: "lead_success",
          event_id: leadId,
          events_id: leadId,
          lead_id: leadId,
          portal_lead_id: payload.portal_lead_id,
          webhook_status: "success",
          form_submission_confirmed: "true",
          conversion_type: "form",
          conversion_action: "form_submission",
          form_type: payload.form_type,
          landing_page_variant: payload.landing_page_variant,
          lead_title: payload.lead_title,
          ad_platform: payload.ad_platform,
          source: payload.source,
          campaign_search_term: payload.campaign_search_term,
          language: payload.language,
          property_link: payload.property_link,
          general_whatsapp_link: payload.general_whatsapp_link,
          gclid: payload.gclid,
          fbclid: payload.fbclid,
          utm_source: payload.utm_source,
          utm_medium: payload.utm_medium,
          utm_campaign: payload.utm_campaign,
          utm_content: payload.utm_content,
          country: payload.country,
          comment_text: payload.comment_text,
          gbraid: payload.gbraid,
          wbraid: payload.wbraid,
        });
        showSuccess(form, payload);
      } catch (error) {
        if (status) {
          status.textContent = "We could not process the request. Please call or WhatsApp Oaklyn Realty directly.";
          status.classList.add("is-visible", "is-error");
        }
        if (button) {
          button.disabled = false;
          button.textContent = originalLabel || config.cta;
        }
      }
    });
  }

  function setupModal(modalSelector, openSelector, closeSelector, openEventName) {
    const modal = document.querySelector(modalSelector);
    if (!modal) return;
    const panel = modal.querySelector("[role='dialog']");

    function openModal() {
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      if (openEventName) {
        pushDataLayerEvent({
          event: openEventName,
          landing_page_variant: activeVariant
        });
      }
      window.setTimeout(function () {
        const focusable = modal.querySelector("input, select, button, a");
        if (focusable) focusable.focus();
      }, 40);
    }

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    }

    document.querySelectorAll(openSelector).forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        openModal();
      });
    });

    modal.querySelectorAll(closeSelector).forEach(function (button) {
      button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    if (panel) {
      panel.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    }
  }

  document.querySelectorAll("[data-call]").forEach(function (link) {
    link.addEventListener("click", function () {
      pushDataLayerEvent({
        event: "click_call",
        cta_location: link.dataset.ctaLocation || ""
      });
    });
  });

  document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
    link.addEventListener("click", function () {
      pushDataLayerEvent({
        event: "click_whatsapp",
        cta_location: link.dataset.ctaLocation || ""
      });
    });
  });

  document.querySelectorAll("[data-book-viewing]").forEach(function (link) {
    link.addEventListener("click", function () {
      pushDataLayerEvent({
        event: "book_viewing",
        landing_page_variant: activeVariant
      });
    });
  });

  setupCountryCodePickers();
  document.querySelectorAll("[data-lead-form]").forEach(setupLeadForm);
  setupModal("[data-lead-modal]", "[data-open-lead-modal]", "[data-close-lead-modal]", "form_start");
  setupModal("[data-gallery-modal]", "[data-open-gallery]", "[data-close-gallery]");

  pushDataLayerEvent({
    event: "landing_page_view",
    landing_page_variant: activeVariant,
    page_location: window.location.href
  });
})();
