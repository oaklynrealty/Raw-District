import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const clientTargets = [path.join(rootDir, "client.js"), path.join(distDir, "client.js")];

const helperBlock = `  const FORM_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
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
`;

const duplicateGuard = (phoneExpression, emailExpression) => `    const formSubmissionKey = buildFormSubmissionKey(${phoneExpression}, ${emailExpression});
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
`;

function replaceOnce(source, searchValue, replacement, label) {
  if (!source.includes(searchValue)) {
    throw new Error(`Could not find ${label}.`);
  }
  return source.replace(searchValue, replacement);
}

function patchValidation(source) {
  let output = source.replace('if (!cleaned) return "+971";', 'if (!cleaned) return "";');

  if (!output.includes("function isSequentialDigits(value)")) {
    output = replaceOnce(
      output,
      `  function hasRepeatedDigits(value) {
    return /^(\\d)\\1+$/.test(String(value || ""));
  }
`,
      `  function hasRepeatedDigits(value) {
    return /^(\\d)\\1+$/.test(String(value || ""));
  }

  function isSequentialDigits(value) {
    const digits = String(value || "");
    if (digits.length < 6) return false;
    return "01234567890123456789".includes(digits) || "98765432109876543210".includes(digits);
  }

  function hasRepeatingDigitPattern(value) {
    const digits = String(value || "");
    if (digits.length < 6) return false;
    return /^(\\d{2,3})\\1+$/.test(digits);
  }
`,
      "phone validation helper block"
    );
  }

  if (!output.includes("function isValidEmailAddress(value)")) {
    output = replaceOnce(
      output,
      `  function normalizeEmailValue(value) {
    return String(value || "").trim().toLowerCase();
  }
`,
      `  function normalizeEmailValue(value) {
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
    if (!/^[a-z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-z0-9-]+(?:\\.[a-z0-9-]+)+$/i.test(email)) return false;

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
`,
      "email validation helper block"
    );
  }

  output = output
    .replace(
      `    if (!nationalNumber || nationalNumber.length < 6 || nationalNumber.length > 12) {
      return { valid: false };
    }

    if (hasRepeatedDigits(nationalNumber)) {
      return { valid: false };
    }
`,
      `    if (!nationalNumber || nationalNumber.length < 6 || nationalNumber.length > 14) {
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
`
    )
    .replace(
      `return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());`,
      `return isValidEmailAddress(value);`
    );

  if (!output.includes("let firstInvalidKey =")) {
    output = output.replace(
      `    let valid = true;
    let firstInvalidField = null;
    let validatedPhone = null;
`,
      `    let valid = true;
    let firstInvalidField = null;
    let firstInvalidKey = "";
    let validatedPhone = null;
`
    );
  }

  if (!output.includes("firstInvalidKey = key;")) {
    output = output.replace(
      `          firstInvalidField = field;
        }
      }
    });

    if (!valid) {
      focusFieldError(firstInvalidField);
      return;
    }
`,
      `          firstInvalidField = field;
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
`
    );
  }

  return output;
}

function patchClient(source) {
  if (source.includes("lead_duplicate_suppressed") && source.includes("FORM_DEDUPE_WINDOW_MS")) {
    return patchValidation(source);
  }

  let output = source;

  output = replaceOnce(
    output,
    `  function createLeadId() {
    return config.project_slug + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }
`,
    `  function createLeadId() {
    return config.project_slug + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

${helperBlock}`,
    "createLeadId block"
  );

  output = output.replace(
    /form\.addEventListener\("submit", (async )?function \(event\) \{\n    event\.preventDefault\(\);\n/,
    (match) => `${match}    if (formSubmissionInProgress) return;\n`
  );

  if (!output.includes("if (formSubmissionInProgress) return;")) {
    throw new Error("Could not patch submit lock.");
  }

  const modernNeedle = `    const formInquiry = fields.propertyType.input.value.trim();
    const blockedLead = isBlacklisted(formPhone);
`;
  const legacyNeedle = `    const emailNormalized = normalizeEmailValue(fields.email.input.value);
    if (leadIdInput) leadIdInput.value = leadId;
`;

  if (output.includes(modernNeedle)) {
    output = output.replace(
      modernNeedle,
      `    const formInquiry = fields.propertyType.input.value.trim();
${duplicateGuard("formPhone", "formEmail")}    const blockedLead = isBlacklisted(formPhone);
`
    );
  } else if (output.includes(legacyNeedle)) {
    output = output.replace(
      legacyNeedle,
      `    const emailNormalized = normalizeEmailValue(fields.email.input.value);
${duplicateGuard("phoneFull", "emailNormalized")}    if (leadIdInput) leadIdInput.value = leadId;
`
    );
  } else {
    throw new Error("Could not find form duplicate guard insertion point.");
  }

  const formStart = output.indexOf(`  form.addEventListener("submit"`);
  if (formStart < 0) {
    throw new Error("Could not find form submit block.");
  }

  const beforeForm = output.slice(0, formStart);
  let formBlock = output.slice(formStart);

  formBlock = formBlock.replace(
    `          buyer_type: "",
          preferred_contact: "",
          budget_range: "",
          message: "",
          gdpr_consent:`,
    `          buyer_type: "",
          preferred_contact: "",
          budget_range: "",
          message: "",
          form_submission_key: formSubmissionKey,
          dedupe_window_minutes: Math.round(FORM_DEDUPE_WINDOW_MS / 60000),
          gdpr_consent:`
  );

  if (formBlock.includes(`blacklistOutcome`)) {
    formBlock = formBlock
      .replace(
        `        console.error("[form] Blacklist check failed", blacklistOutcome.error);
`,
        `        console.error("[form] Blacklist check failed", blacklistOutcome.error);
        releaseFormSubmissionLock();
        clearFormSubmissionState(formSubmissionKey);
`
      )
      .replace(
        `      if (blacklistResult && blacklistResult.blocked) {
`,
        `      if (blacklistResult && blacklistResult.blocked) {
        releaseFormSubmissionLock();
        clearFormSubmissionState(formSubmissionKey);
`
      )
      .replace(
        `          webhookSucceeded = true;
`,
        `          webhookSucceeded = true;
          writeFormSubmissionState(formSubmissionKey, leadId, "submitted");
`
      )
      .replace(
        `          console.error("Webhook submit error:", error);
`,
        `          console.error("Webhook submit error:", error);
          releaseFormSubmissionLock();
          clearFormSubmissionState(formSubmissionKey);
`
      );
  } else {
    formBlock = formBlock
      .replace(
        `      if (blacklistResult.blocked) {
`,
        `      if (blacklistResult.blocked) {
        releaseFormSubmissionLock();
        clearFormSubmissionState(formSubmissionKey);
`
      )
      .replace(
        `      console.error("[blacklist] Check failed", error);
`,
        `      console.error("[blacklist] Check failed", error);
      releaseFormSubmissionLock();
      clearFormSubmissionState(formSubmissionKey);
`
      )
      .replace(
        `      await response.text();

      form.style.display = "none";`,
        `      await response.text();
      writeFormSubmissionState(formSubmissionKey, leadId, "submitted");

      form.style.display = "none";`
      )
      .replace(
        `      console.error("Webhook submit error:", error);
`,
        `      console.error("Webhook submit error:", error);
      releaseFormSubmissionLock();
      clearFormSubmissionState(formSubmissionKey);
`
      );
  }

  output = beforeForm + formBlock;

  if (!output.includes('writeFormSubmissionState(formSubmissionKey, leadId, "submitted")')) {
    throw new Error("Could not patch webhook success dedupe write.");
  }

  return patchValidation(output);
}

function patchHtml(source) {
  const isArabic = /<html[^>]*(?:lang="ar"|dir="rtl")/i.test(source);
  const placeholder = isArabic ? "+ مفتاح الدولة" : "+ country code";

  return source
    .replace(/(<input id="landing_phone_country"[^>]*type="hidden"[^>]*value=")[^"]*(")/g, "$1$2")
    .replace(/(<span class="country-picker-flag" data-country-picker-flag>)[\s\S]*?(<\/span>)/g, "$1$2")
    .replace(/(<span class="country-picker-label" data-country-picker-label>)[\s\S]*?(<\/span>)/g, `$1${placeholder}$2`)
    .replace(/(<span class="country-picker-code" data-country-picker-code>)[\s\S]*?(<\/span>)/g, "$1$2")
    .replace(/class="country-picker-option is-selected"/g, 'class="country-picker-option"')
    .replace(/aria-selected="true"/g, 'aria-selected="false"');
}

const patchFile = async (target, patcher) => {
  try {
    const current = await readFile(target, "utf8");
    const updated = patcher(current);
    if (updated !== current) {
      await writeFile(target, updated);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const collectHtmlFiles = async (dir) => {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === ".git" || entry.name === "node_modules") continue;
        files.push(...(await collectHtmlFiles(target)));
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        files.push(target);
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return files;
};

for (const target of clientTargets) {
  await patchFile(target, patchClient);
}

for (const target of await collectHtmlFiles(rootDir)) {
  await patchFile(target, patchHtml);
}

console.log("Applied form duplicate lead guard and validation hardening.");
