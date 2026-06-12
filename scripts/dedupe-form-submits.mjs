import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const targets = [path.join(rootDir, "client.js"), path.join(distDir, "client.js")];

const helperBlock = `  const FORM_DEDUPE_WINDOW_MS = 10 * 60 * 1000;
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

  function writeFormSubmissionState(storageKey, leadId) {
    const state = JSON.stringify({
      project_slug: config.project_slug,
      lead_id: leadId,
      timestamp: Date.now()
    });
    try {
      window.sessionStorage.setItem(storageKey, state);
      window.localStorage.setItem(storageKey, state);
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
`;

function replaceOnce(source, searchValue, replacement, label) {
  if (!source.includes(searchValue)) {
    throw new Error(`Could not find ${label}.`);
  }
  return source.replace(searchValue, replacement);
}

function patchClient(source) {
  if (source.includes("lead_duplicate_suppressed") && source.includes("FORM_DEDUPE_WINDOW_MS")) {
    return source;
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
`
      )
      .replace(
        `      if (blacklistResult && blacklistResult.blocked) {
`,
        `      if (blacklistResult && blacklistResult.blocked) {
        releaseFormSubmissionLock();
`
      )
      .replace(
        `          webhookSucceeded = true;
`,
        `          webhookSucceeded = true;
          writeFormSubmissionState(formSubmissionKey, leadId);
`
      )
      .replace(
        `          console.error("Webhook submit error:", error);
`,
        `          console.error("Webhook submit error:", error);
          releaseFormSubmissionLock();
`
      );
  } else {
    formBlock = formBlock
      .replace(
        `      if (blacklistResult.blocked) {
`,
        `      if (blacklistResult.blocked) {
        releaseFormSubmissionLock();
`
      )
      .replace(
        `      console.error("[blacklist] Check failed", error);
`,
        `      console.error("[blacklist] Check failed", error);
      releaseFormSubmissionLock();
`
      )
      .replace(
        `      await response.text();

      form.style.display = "none";`,
        `      await response.text();
      writeFormSubmissionState(formSubmissionKey, leadId);

      form.style.display = "none";`
      )
      .replace(
        `      console.error("Webhook submit error:", error);
`,
        `      console.error("Webhook submit error:", error);
      releaseFormSubmissionLock();
`
      );
  }

  output = beforeForm + formBlock;

  if (!output.includes("writeFormSubmissionState(formSubmissionKey, leadId)")) {
    throw new Error("Could not patch webhook success dedupe write.");
  }

  return output;
}

for (const target of targets) {
  try {
    const current = await readFile(target, "utf8");
    await writeFile(target, patchClient(current));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

console.log("Applied form duplicate lead guard.");
