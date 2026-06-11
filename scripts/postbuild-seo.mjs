import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { project as landingProject } from "../src/project-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const landingFiles = [
  "index.html",
  "index-en.html",
  "index-ar.html",
  "raw-district/index.html",
];

const targets = landingFiles.flatMap((file) => [
  path.join(rootDir, file),
  path.join(distDir, file),
]);

const alternates = landingProject.seo?.alternates || [
  { hreflang: "en", href: landingProject.landingPageUrl },
  { hreflang: "x-default", href: landingProject.landingPageUrl },
];

const hreflangHtml = alternates
  .map(
    (item) =>
      `<link rel="alternate" hreflang="${escapeHtml(item.hreflang)}" href="${escapeHtml(item.href)}">`,
  )
  .join("\n  ");

const hasNoindex = (html) => /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);

const ensureRobots = (html) => {
  if (/<meta\s+name=["']robots["']/i.test(html)) return html;
  return html.replace(
    /(<meta\s+name=["']viewport["'][^>]*>\s*)/i,
    `$1\n  <meta name="robots" content="index, follow">`,
  );
};

const ensureHreflang = (html) => {
  if (hasNoindex(html) || /rel=["']alternate["']\s+hreflang=/i.test(html)) return html;
  return html.replace(/(<link\s+rel=["']canonical["'][^>]*>\s*)/i, `$1\n  ${hreflangHtml}`);
};

const ensureListingOfferSchema = (html) =>
  html.replace(
    /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g,
    (match, jsonText) => {
      try {
        const data = JSON.parse(jsonText);
        if (data?.["@type"] !== "RealEstateListing" || data.offers || !landingProject.listing?.startingPrice) {
          return match;
        }

        data.offers = {
          "@type": "Offer",
          url: landingProject.landingPageUrl,
          price: String(landingProject.listing.startingPrice),
          priceCurrency: landingProject.listing.priceCurrency || "AED",
          availability: "https://schema.org/InStock",
        };

        return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2).replaceAll("</script", "<\\/script")}\n</script>`;
      } catch (error) {
        return match;
      }
    },
  );

for (const target of targets) {
  try {
    let html = await readFile(target, "utf8");
    html = ensureRobots(html);
    html = ensureHreflang(html);
    html = ensureListingOfferSchema(html);
    await writeFile(target, html);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

console.log("Applied Raw District SEO post-build fixes.");
