import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const clientTargets = [path.join(rootDir, "client.js"), path.join(distDir, "client.js")];

const strictSequenceFunction = `  function isSequentialDigits(value) {
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
`;

function patchSequenceValidator(source, file) {
  if (!source.includes("function isSequentialDigits(value)")) {
    throw new Error(`${file}: missing phone sequence validator`);
  }

  if (source.includes("ascendingRun >= 6") && source.includes("descendingRun >= 6")) {
    return source;
  }

  const start = source.indexOf("  function isSequentialDigits(value) {");
  const end = source.indexOf("  function hasRepeatingDigitPattern(value)", start);

  if (start < 0 || end < 0) {
    throw new Error(`${file}: could not patch phone sequence validator`);
  }

  return source.slice(0, start) + strictSequenceFunction + "\n" + source.slice(end);
}

let checkedFiles = 0;
let changedFiles = 0;

for (const target of clientTargets) {
  try {
    const current = await readFile(target, "utf8");
    checkedFiles += 1;
    const updated = patchSequenceValidator(current, path.relative(rootDir, target));
    if (updated !== current) {
      await writeFile(target, updated);
      changedFiles += 1;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

if (!checkedFiles) {
  throw new Error("No generated client.js files were found for phone validation hardening.");
}

console.log(`Applied strict phone sequence validation to ${changedFiles} generated client file(s).`);
