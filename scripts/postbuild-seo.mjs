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

const alternates = [
  { hreflang: "en-AE", href: landingProject.landingPageUrl },
  ...(landingProject.seo?.alternates || [
    { hreflang: "en", href: landingProject.landingPageUrl },
    { hreflang: "x-default", href: landingProject.landingPageUrl },
  ]),
].filter(
  (item, index, all) =>
    all.findIndex((candidate) => candidate.hreflang === item.hreflang && candidate.href === item.href) === index,
);

const renderHreflangItem = (item) =>
  `<link rel="alternate" hreflang="${escapeHtml(item.hreflang)}" href="${escapeHtml(item.href)}">`;
const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPrimarySchemaGraph = () => {
  const image = new URL(
    landingProject.seo?.image || landingProject.hero?.background || "",
    landingProject.landingPageUrl,
  ).href;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        "@id": "https://oaklynrealty.ae/#organization",
        name: landingProject.brand.company,
        legalName: landingProject.brand.legalName,
        url: landingProject.brand.mainWebsite,
        logo: landingProject.brand.logo,
        telephone: landingProject.brand.phoneHref,
        email: landingProject.brand.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: landingProject.brand.office,
          addressLocality: "Dubai",
          addressCountry: "AE",
        },
      },
      {
        "@type": "Product",
        "@id": `${landingProject.landingPageUrl}#raw-district-product`,
        name: landingProject.name,
        description: landingProject.seo.description,
        image,
        brand: {
          "@type": "Organization",
          name: landingProject.listing?.developer || "IMTIAZ Developments",
        },
        category: "Dubai real estate project",
        areaServed: {
          "@type": "Place",
          name: `${landingProject.listing?.addressLocality || "Downtown Jebel Ali"}, ${landingProject.listing?.addressRegion || "Dubai"}`,
        },
        offers: {
          "@type": "Offer",
          url: landingProject.landingPageUrl,
          price: String(landingProject.listing?.startingPrice || "649000"),
          priceCurrency: landingProject.listing?.priceCurrency || "AED",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${landingProject.landingPageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: landingProject.brand.company,
            item: landingProject.brand.mainWebsite,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: landingProject.name,
            item: landingProject.landingPageUrl,
          },
        ],
      },
    ],
  };
};

const primarySchemaHtml = `<script type="application/ld+json">\n${JSON.stringify(getPrimarySchemaGraph(), null, 2).replaceAll("</script", "<\\/script")}\n</script>`;

const hasNoindex = (html) => /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);

const ensureRobots = (html) => {
  if (/<meta\s+name=["']robots["']/i.test(html)) return html;
  return html.replace(
    /(<meta\s+name=["']viewport["'][^>]*>\s*)/i,
    `$1  <meta name="robots" content="index, follow">\n  `,
  );
};

const ensureHreflang = (html) => {
  if (hasNoindex(html)) return html;
  const missingAlternates = alternates.filter(
    (item) => !new RegExp(`hreflang=["']${escapeRegExp(item.hreflang)}["']`, "i").test(html),
  );
  if (!missingAlternates.length) return html;
  const missingHreflangHtml = missingAlternates.map(renderHreflangItem).join("\n  ");
  return html.replace(/(<link\s+rel=["']canonical["'][^>]*>\s*)/i, `$1  ${missingHreflangHtml}\n  `);
};

const ensurePrimarySchemaGraph = (html) => {
  if (html.includes("#raw-district-product")) return html;
  return html.replace(
    /(\s*<link href="https:\/\/unpkg\.com\/boxicons@2\.1\.4\/css\/boxicons\.min\.css" rel="stylesheet">)/,
    `\n  ${primarySchemaHtml}$1`,
  );
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
    html = ensurePrimarySchemaGraph(html);
    html = ensureListingOfferSchema(html);
    await writeFile(target, html);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

console.log("Applied Raw District SEO post-build fixes.");
