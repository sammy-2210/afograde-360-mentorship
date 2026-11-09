#!/usr/bin/env node
/**
 * Automated Static Export, SEO, Accessibility, Link & Security Verifier
 * Runs automatically at the end of `npm run build`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "out");

const errors = [];
const passed = [];

function check(condition, description) {
  if (condition) {
    passed.push(description);
  } else {
    errors.push(description);
  }
}

// 1. Required static export artifacts
const requiredFiles = [
  "index.html",
  path.join("privacy", "index.html"),
  "robots.txt",
  "sitemap.xml",
  "afograde favicon.jpeg",
  path.join("images", "og-preview.svg"),
];

for (const rel of requiredFiles) {
  const full = path.join(OUT_DIR, rel);
  check(fs.existsSync(full), `Static export contains out/${rel.replace(/\\/g, "/")}`);
}

if (fs.existsSync(path.join(OUT_DIR, "index.html"))) {
  const indexHtml = fs.readFileSync(path.join(OUT_DIR, "index.html"), "utf8");
  const privacyHtml = fs.existsSync(path.join(OUT_DIR, "privacy", "index.html"))
    ? fs.readFileSync(path.join(OUT_DIR, "privacy", "index.html"), "utf8")
    : "";

  // 2. Language & Heading Hierarchy (PRD Section 17 & 18.2)
  check(/<html[^>]*\blang="en-NG"/i.test(indexHtml), 'Root <html> declares lang="en-NG"');
  check(
    /color-scheme:\s*light/i.test(indexHtml) && /data-theme="light"/i.test(indexHtml),
    'Root <html> enforces strict light theme (color-scheme: light and data-theme="light")'
  );

  const h1Matches = indexHtml.match(/<h1\b/gi) ?? [];
  check(
    h1Matches.length === 1,
    `Landing page has exactly 1 <h1> element (found ${h1Matches.length})`
  );

  const privacyH1Matches = privacyHtml.match(/<h1\b/gi) ?? [];
  check(
    privacyH1Matches.length === 1,
    `Privacy page has exactly 1 <h1> element (found ${privacyH1Matches.length})`
  );

  // 3. Skip link & main landmark
  check(
    indexHtml.includes('href="#main-content"') && indexHtml.includes('id="main-content"'),
    "Accessible skip-to-content link and #main-content landmark are present"
  );

  // 4. All internal #anchor navigation targets exist in static HTML
  const idSet = new Set();
  for (const m of indexHtml.matchAll(/\bid="([^"]+)"/g)) {
    idSet.add(m[1]);
  }

  const hrefAnchors = new Set();
  for (const m of indexHtml.matchAll(/\bhref="#([^"]+)"/g)) {
    hrefAnchors.add(m[1]);
  }

  for (const anchor of hrefAnchors) {
    check(
      idSet.has(anchor),
      `Internal anchor href="#${anchor}" resolves to matching id="${anchor}"`
    );
  }

  // 5. Required PRD Section IDs
  const requiredSectionIds = [
    "hero",
    "about",
    "objectives",
    "benefits",
    "how-it-works",
    "dates-structure",
    "track-record",
    "transparency",
    "rewards",
    "plans",
    "register",
    "payment-info",
    "contact",
    "faq",
    "footer",
  ];

  for (const secId of requiredSectionIds) {
    check(idSet.has(secId), `Required PRD section id="#${secId}" rendered in HTML`);
  }

  // 6. SEO, Favicon, Logo & Social Sharing Metadata
  check(/<title>[^<]+360\+ Mentorship Series[^<]*<\/title>/i.test(indexHtml), "Page <title> present");
  check(/name="description"/i.test(indexHtml), "Meta description present");
  check(/property="og:title"/i.test(indexHtml), "Open Graph og:title present");
  check(/property="og:image"/i.test(indexHtml), "Open Graph og:image present");
  check(
    /<link[^>]+rel="icon"[^>]+href="\/afograde%20favicon\.jpeg"/i.test(indexHtml) &&
      /<link[^>]+rel="icon"[^>]+href="\/afograde%20favicon\.jpeg"/i.test(privacyHtml),
    "Favicon <link rel=\"icon\"> points to /afograde%20favicon.jpeg on all routes"
  );
  check(
    /<img[^>]+src="\/afograde%20favicon\.jpeg"[^>]+alt="[^"]+"/i.test(indexHtml),
    "Brand logo <img> uses /afograde%20favicon.jpeg with accessible alt text"
  );

  const isProdEnv =
    process.env.NEXT_PUBLIC_SITE_ENV === "production" &&
    (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

  if (!isProdEnv) {
    check(
      /noindex/i.test(indexHtml),
      "Preview build enforces robots noindex (PRD Section 17)"
    );
  }

  // 7. Security: Bank account number must NOT appear in pre-registration static HTML (PRD FR-20)
  check(
    !indexHtml.includes("3003920115") && !privacyHtml.includes("3003920115"),
    "Bank account number (3003920115) is hidden from pre-registration static HTML (FR-20)"
  );

  // 8. Security: No private secret keys leaked into static bundle
  check(
    !indexHtml.includes("TURNSTILE_SECRET_KEY") && !indexHtml.includes("RECOVERY_PEPPER"),
    "No private server secret identifiers present in static HTML"
  );
}

// 9. Verify netlify.toml security headers (PRD Section 18.3)
const netlifyPath = path.join(ROOT, "netlify.toml");
check(fs.existsSync(netlifyPath), "netlify.toml exists");
if (fs.existsSync(netlifyPath)) {
  const toml = fs.readFileSync(netlifyPath, "utf8");
  check(toml.includes("Content-Security-Policy"), "netlify.toml defines Content-Security-Policy");
  check(toml.includes("frame-ancestors 'none'"), "CSP sets frame-ancestors 'none' via HTTP header");
  check(toml.includes('X-Content-Type-Options = "nosniff"'), "netlify.toml sets X-Content-Type-Options");
  check(toml.includes("Referrer-Policy"), "netlify.toml sets Referrer-Policy");
}

console.log(`\n[verify-static-export] Passed ${passed.length} checks.`);

if (errors.length > 0) {
  console.error(`[verify-static-export] FAILED ${errors.length} check(s):`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

