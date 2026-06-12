import { promises as fs } from "node:fs";

const targetFiles = ["client.js", "dist/client.js"];
const missingCountryRules = [
  ['+228', '[8]'],
  ['+688', '[5]'],
  ['+1340', '[7]']
];

function patchMissingCountryRules(content, filePath) {
  if (!content.includes('PHONE_LENGTH_RULES_BY_DIAL_CODE')) {
    throw new Error(`${filePath}: country phone rules block was not found`);
  }

  const insertBefore = '    "+1242": [7],\n';
  if (!content.includes(insertBefore)) {
    throw new Error(`${filePath}: country phone rules insertion point was not found`);
  }

  let output = content;

  for (const [code, allowedLengths] of missingCountryRules) {
    if (output.includes(`    "${code}": `)) continue;
    output = output.replace(insertBefore, `    "${code}": ${allowedLengths},\n${insertBefore}`);
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
  const patched = patchMissingCountryRules(content, filePath);

  if (patched !== content) {
    await fs.writeFile(filePath, patched);
    changedFiles += 1;
  }
}

if (!checkedFiles) {
  throw new Error("No generated client files were found to complete country phone rules");
}

console.log(`Completed country phone validation coverage for ${checkedFiles} generated client file(s). Changed ${changedFiles}.`);
