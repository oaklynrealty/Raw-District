import { promises as fs } from "node:fs";

const targetFiles = ["client.js", "dist/client.js"];

const phoneRulesBlock = `  const PHONE_LENGTH_RULES_BY_DIAL_CODE = {
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
    const digits = String(nationalNumber || "").replace(/\D/g, "");
    const allowedLengths = PHONE_LENGTH_RULES_BY_DIAL_CODE[countryCode];

    if (!allowedLengths) {
      return digits.length >= 6 && digits.length <= 14;
    }

    return allowedLengths.includes(digits.length);
  }
`;

const buildFunctionMarker = "  function buildValidatedPhoneNumber(localValue, countryCode, allowedDialCodes) {";
const genericLengthCheck = `    if (!nationalNumber || nationalNumber.length < 6 || nationalNumber.length > 14) {
      return { valid: false };
    }

`;
const countryLengthCheck = `    if (!passesCountryPhoneRules(normalizedCountryCode, nationalNumber)) {
      return { valid: false };
    }

`;

function patchPhoneRules(content, filePath) {
  if (!content.includes(buildFunctionMarker)) {
    throw new Error(`${filePath}: buildValidatedPhoneNumber was not found`);
  }

  let output = content;

  if (!output.includes("PHONE_LENGTH_RULES_BY_DIAL_CODE")) {
    output = output.replace(buildFunctionMarker, `${phoneRulesBlock}\n${buildFunctionMarker}`);
  }

  if (!output.includes("passesCountryPhoneRules(normalizedCountryCode, nationalNumber)")) {
    if (!output.includes(genericLengthCheck)) {
      throw new Error(`${filePath}: national number length check was not found`);
    }

    output = output.replace(genericLengthCheck, `${genericLengthCheck}${countryLengthCheck}`);
  }

  return output;
}

let checkedFiles = 0;
let changedFiles = 0;

for (const filePath of targetFiles) {
  let content;

  try {
    content = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }

  checkedFiles += 1;
  const patched = patchPhoneRules(content, filePath);

  if (patched !== content) {
    await fs.writeFile(filePath, patched);
    changedFiles += 1;
  }
}

if (!checkedFiles) {
  throw new Error("No generated client files were found to patch");
}

console.log(`Applied country-specific phone validation to ${checkedFiles} generated client file(s). Changed ${changedFiles}.`);
