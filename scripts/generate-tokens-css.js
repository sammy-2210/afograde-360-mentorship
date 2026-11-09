#!/usr/bin/env node
/**
 * Converts afograde-design-tokens.json (W3C Design Tokens format + custom composite groups)
 * into CSS custom properties (--afograde-*).
 *
 * Usage:
 *   node scripts/generate-tokens-css.js
 *   node scripts/generate-tokens-css.js <input.json> <output.css>
 *   node scripts/generate-tokens-css.js --stdout
 */

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INPUT = path.resolve(__dirname, "..", "afograde-design-tokens.json");
const DEFAULT_OUTPUT = path.resolve(__dirname, "..", "afograde-design-tokens.css");

const TOP_LEVEL_META_KEYS = new Set([
  "$schema",
  "name",
  "version",
  "description",
  "metadata",
  "implementation",
]);

const GENERIC_FONT_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "math",
  "fangsong",
]);

/**
 * Paths or leaf keys that hold human-readable guidance rather than CSS values.
 */
const PROSE_PATHS = new Set([
  "typography.responsive.note",
  "motion.reducedMotion",
  "accessibility.focusVisible",
  "accessibility.contrast",
  "accessibility.forms",
]);

const PROSE_GROUP_PATHS = new Set(["elevation.usage"]);

/**
 * Converts a camelCase / PascalCase segment to kebab-case.
 * Example: "onPrimaryContainer" -> "on-primary-container", "level1" -> "level1"
 */
function toKebabCase(segment) {
  return String(segment)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Normalizes the CSS variable prefix so it starts with "--" and ends with "-".
 */
function normalizePrefix(rawPrefix = "--afograde-") {
  let prefix = String(rawPrefix).trim();
  if (!prefix.startsWith("--")) {
    prefix = `--${prefix.replace(/^-+/, "")}`;
  }
  if (!prefix.endsWith("-")) {
    prefix = `${prefix}-`;
  }
  return prefix;
}

/**
 * Converts an array of JSON path segments into a CSS custom property name.
 * Example: ["color", "light", "onPrimary"] -> "--afograde-color-light-on-primary"
 */
function pathToCssVar(segments, prefix) {
  return `${prefix}${segments.map(toKebabCase).join("-")}`;
}

/**
 * Converts a hex color (#RGB or #RRGGBB) + opacity into rgba(...) when opacity < 1.
 */
function formatColorWithOpacity(color, opacity) {
  if (opacity === undefined || opacity === null || Number(opacity) >= 1) {
    return color;
  }

  const hex = String(color).trim();
  let r;
  let g;
  let b;

  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  const pct = Math.round(Number(opacity) * 10000) / 100;
  return `color-mix(in srgb, ${hex} ${pct}%, transparent)`;
}

/**
 * Formats a W3C shadow $value (string "none" or array of shadow layer objects).
 */
function formatShadowValue(value) {
  if (typeof value === "string") {
    return value;
  }

  if (!Array.isArray(value)) {
    throw new Error(`Invalid shadow token value: ${JSON.stringify(value)}`);
  }

  return value
    .map((layer) => {
      if (typeof layer === "string") {
        return layer;
      }
      const parts = [];
      if (layer.inset) {
        parts.push("inset");
      }
      parts.push(layer.offsetX ?? "0px");
      parts.push(layer.offsetY ?? "0px");
      parts.push(layer.blur ?? "0px");
      if (layer.spread !== undefined) {
        parts.push(layer.spread);
      }
      parts.push(formatColorWithOpacity(layer.color ?? "#000000", layer.opacity));
      return parts.join(" ");
    })
    .join(", ");
}

/**
 * Formats a W3C fontFamily $value (array of font family names or string).
 */
function formatFontFamilyValue(value) {
  if (typeof value === "string") {
    return value;
  }
  if (!Array.isArray(value)) {
    throw new Error(`Invalid fontFamily token value: ${JSON.stringify(value)}`);
  }
  return value
    .map((family) => {
      const trimmed = String(family).trim();
      if (GENERIC_FONT_FAMILIES.has(trimmed.toLowerCase())) {
        return trimmed;
      }
      if (/^[a-zA-Z][a-zA-Z0-9-]*$/.test(trimmed)) {
        return trimmed;
      }
      return `"${trimmed.replace(/"/g, '\\"')}"`;
    })
    .join(", ");
}

/**
 * Resolves "{token.path}" references to "var(--prefix-token-path)" and validates targets.
 */
function resolveReferences(rawString, knownDotPaths, prefix) {
  return String(rawString).replace(/\{([a-zA-Z0-9_.-]+)\}/g, (_, refPath) => {
    if (!knownDotPaths.has(refPath)) {
      throw new Error(`Unresolved design token reference "{${refPath}}"`);
    }
    const segments = refPath.split(".");
    return `var(${pathToCssVar(segments, prefix)})`;
  });
}

/**
 * Formats any primitive or W3C typed token value into a raw string (prior to reference resolution).
 */
function formatTokenValue(value, type) {
  if (type === "shadow") {
    return formatShadowValue(value);
  }
  if (type === "fontFamily" || Array.isArray(value)) {
    return formatFontFamilyValue(value);
  }
  if (typeof value === "number" || typeof value === "string") {
    return String(value);
  }
  throw new Error(`Unsupported token value at type "${type ?? "unknown"}": ${JSON.stringify(value)}`);
}

function isPlainObject(val) {
  return Boolean(val) && typeof val === "object" && !Array.isArray(val);
}

/**
 * Walks the token tree and collects extracted token entries grouped by top-level category.
 */
function collectTokens(tokensJson, prefix) {
  const entries = [];
  const knownDotPaths = new Set();
  const elevationUsage = tokensJson?.elevation?.usage ?? {};

  function walk(node, segments, topCategory) {
    const dotPath = segments.join(".");

    if (PROSE_PATHS.has(dotPath) || PROSE_GROUP_PATHS.has(dotPath)) {
      return;
    }

    // W3C Design Token leaf node: { "$value": ..., "$type": ... }
    if (isPlainObject(node) && Object.prototype.hasOwnProperty.call(node, "$value")) {
      const cssVar = pathToCssVar(segments, prefix);
      const rawValue = formatTokenValue(node.$value, node.$type);
      const comment =
        dotPath.startsWith("elevation.level") && elevationUsage[segments[segments.length - 1]]
          ? elevationUsage[segments[segments.length - 1]]
          : node.$description ?? null;

      knownDotPaths.add(dotPath);
      entries.push({
        category: topCategory,
        dotPath,
        segments,
        cssVar,
        rawValue,
        comment,
      });
      return;
    }

    // Composite / nested group object (e.g., typography.scale.displayLarge, components.button)
    if (isPlainObject(node)) {
      for (const [key, child] of Object.entries(node)) {
        if (key.startsWith("$")) {
          continue;
        }
        walk(child, [...segments, key], topCategory);
      }
      return;
    }

    // Plain primitive leaf token (e.g., spacing.baseUnit, components.*, typography.scale.*.*)
    if (typeof node === "string" || typeof node === "number") {
      const cssVar = pathToCssVar(segments, prefix);
      knownDotPaths.add(dotPath);
      entries.push({
        category: topCategory,
        dotPath,
        segments,
        cssVar,
        rawValue: String(node),
        comment: null,
      });
    }
  }

  for (const [topKey, topValue] of Object.entries(tokensJson)) {
    if (TOP_LEVEL_META_KEYS.has(topKey) || topKey.startsWith("$")) {
      continue;
    }
    walk(topValue, [topKey], topKey);
  }

  // Second pass: resolve {path.to.token} references into var(--prefix-...)
  for (const entry of entries) {
    entry.cssValue = resolveReferences(entry.rawValue, knownDotPaths, prefix);
  }

  return entries;
}

/**
 * Builds semantic color alias declarations so components can reference e.g.
 * --afograde-color-primary (defaulting to light scheme, switchable via [data-theme="dark"]).
 */
function buildSemanticColorAliases(tokensJson, prefix) {
  const lightColors = tokensJson?.color?.light;
  const darkColors = tokensJson?.color?.dark;
  const lightAliases = [];
  const darkAliases = [];

  if (isPlainObject(lightColors)) {
    for (const role of Object.keys(lightColors)) {
      if (role.startsWith("$")) continue;
      const semanticVar = pathToCssVar(["color", role], prefix);
      const lightVar = pathToCssVar(["color", "light", role], prefix);
      lightAliases.push({ cssVar: semanticVar, cssValue: `var(${lightVar})` });

      if (isPlainObject(darkColors) && Object.prototype.hasOwnProperty.call(darkColors, role)) {
        const darkVar = pathToCssVar(["color", "dark", role], prefix);
        darkAliases.push({ cssVar: semanticVar, cssValue: `var(${darkVar})` });
      }
    }
  }

  return { lightAliases, darkAliases };
}

/**
 * Builds responsive layout & typography alias declarations (mobile-first 360px base,
 * 768px tablet, 1024px desktop) from typography.responsive and spacing.layout.
 */
function buildResponsiveAliases(tokensJson, prefix) {
  const base = [];
  const tablet = [];
  const desktop = [];

  const responsiveType = tokensJson?.typography?.responsive;
  if (isPlainObject(responsiveType)) {
    for (const [role, breakpoints] of Object.entries(responsiveType)) {
      if (!isPlainObject(breakpoints)) continue;
      const aliasVar = pathToCssVar(["typography", `${role}Size`], prefix);
      if (breakpoints.mobile) {
        base.push({
          cssVar: aliasVar,
          cssValue: `var(${pathToCssVar(["typography", "responsive", role, "mobile"], prefix)})`,
        });
      }
      if (breakpoints.tablet) {
        tablet.push({
          cssVar: aliasVar,
          cssValue: `var(${pathToCssVar(["typography", "responsive", role, "tablet"], prefix)})`,
        });
      }
      if (breakpoints.desktop) {
        desktop.push({
          cssVar: aliasVar,
          cssValue: `var(${pathToCssVar(["typography", "responsive", role, "desktop"], prefix)})`,
        });
      }
    }
  }

  const layoutSpacing = tokensJson?.spacing?.layout;
  if (isPlainObject(layoutSpacing)) {
    if (layoutSpacing.pageGutterMobile) {
      const gutterAlias = pathToCssVar(["spacing", "pageGutter"], prefix);
      base.push({
        cssVar: gutterAlias,
        cssValue: `var(${pathToCssVar(["spacing", "layout", "pageGutterMobile"], prefix)})`,
      });
      if (layoutSpacing.pageGutterTablet) {
        tablet.push({
          cssVar: gutterAlias,
          cssValue: `var(${pathToCssVar(["spacing", "layout", "pageGutterTablet"], prefix)})`,
        });
      }
      if (layoutSpacing.pageGutterDesktop) {
        desktop.push({
          cssVar: gutterAlias,
          cssValue: `var(${pathToCssVar(["spacing", "layout", "pageGutterDesktop"], prefix)})`,
        });
      }
    }

    if (layoutSpacing.sectionVerticalMobile) {
      const sectionAlias = pathToCssVar(["spacing", "sectionVertical"], prefix);
      base.push({
        cssVar: sectionAlias,
        cssValue: `var(${pathToCssVar(["spacing", "layout", "sectionVerticalMobile"], prefix)})`,
      });
      if (layoutSpacing.sectionVerticalDesktop) {
        desktop.push({
          cssVar: sectionAlias,
          cssValue: `var(${pathToCssVar(["spacing", "layout", "sectionVerticalDesktop"], prefix)})`,
        });
      }
    }
  }

  return { base, tablet, desktop };
}

/**
 * Converts a parsed design-tokens JSON object into a complete CSS stylesheet string.
 */
function convertTokensToCss(tokensJson, options = {}) {
  const prefix = normalizePrefix(
    options.prefix ?? tokensJson?.implementation?.cssVariablePrefix ?? "--afograde-"
  );
  const entries = collectTokens(tokensJson, prefix);
  const { lightAliases, darkAliases } = buildSemanticColorAliases(tokensJson, prefix);
  const responsiveAliases = buildResponsiveAliases(tokensJson, prefix);

  const lines = [];

  // Header banner
  lines.push("/**");
  lines.push(` * ${tokensJson.name ?? "Design System Tokens"} (v${tokensJson.version ?? "1.0.0"})`);
  if (tokensJson.description) {
    lines.push(` * ${tokensJson.description}`);
  }
  lines.push(" *");
  lines.push(" * Auto-generated from afograde-design-tokens.json — do not edit manually.");
  lines.push(" */");
  lines.push("");

  // Group entries by category for readable :root output
  const grouped = new Map();
  for (const entry of entries) {
    if (!grouped.has(entry.category)) {
      grouped.set(entry.category, []);
    }
    grouped.get(entry.category).push(entry);
  }

  lines.push(":root {");
  lines.push("  color-scheme: light;");

  let isFirstGroup = true;
  for (const [category, groupEntries] of grouped.entries()) {
    if (!isFirstGroup) {
      lines.push("");
    }
    isFirstGroup = false;
    lines.push(`  /* === ${category.toUpperCase()} === */`);

    for (const item of groupEntries) {
      const inlineComment = item.comment ? ` /* ${item.comment} */` : "";
      lines.push(`  ${item.cssVar}: ${item.cssValue};${inlineComment}`);
    }

    // Place semantic color aliases immediately after the color tokens
    if (category === "color" && lightAliases.length > 0) {
      lines.push("");
      lines.push("  /* === COLOR SEMANTIC ROLES (Light scheme default) === */");
      for (const alias of lightAliases) {
        lines.push(`  ${alias.cssVar}: ${alias.cssValue};`);
      }
    }
  }

  if (responsiveAliases.base.length > 0) {
    lines.push("");
    lines.push("  /* === RESPONSIVE ACTIVE ALIASES (Mobile-first base) === */");
    for (const alias of responsiveAliases.base) {
      lines.push(`  ${alias.cssVar}: ${alias.cssValue};`);
    }
  }

  lines.push("}");

  // Only light theme exists per user specification; dark scheme overrides are not emitted.

  // Responsive Breakpoints (Tablet 768px, Desktop 1024px)
  if (responsiveAliases.tablet.length > 0) {
    lines.push("");
    lines.push("@media (min-width: 768px) {");
    lines.push("  :root {");
    for (const alias of responsiveAliases.tablet) {
      lines.push(`    ${alias.cssVar}: ${alias.cssValue};`);
    }
    lines.push("  }");
    lines.push("}");
  }

  if (responsiveAliases.desktop.length > 0) {
    lines.push("");
    lines.push("@media (min-width: 1024px) {");
    lines.push("  :root {");
    for (const alias of responsiveAliases.desktop) {
      lines.push(`    ${alias.cssVar}: ${alias.cssValue};`);
    }
    lines.push("  }");
    lines.push("}");
  }

  // Reduced Motion block
  const durationEntries = entries.filter(
    (e) => e.category === "motion" && e.dotPath.startsWith("motion.duration")
  );
  if (durationEntries.length > 0) {
    lines.push("");
    if (tokensJson?.motion?.reducedMotion) {
      lines.push(`/* ${tokensJson.motion.reducedMotion} */`);
    }
    lines.push("@media (prefers-reduced-motion: reduce) {");
    lines.push("  :root {");
    for (const dur of durationEntries) {
      lines.push(`    ${dur.cssVar}: 0ms;`);
    }
    lines.push("  }");
    lines.push("}");
  }

  lines.push("");
  return lines.join("\n");
}

function runCli(argv = process.argv.slice(2)) {
  const emitStdout = argv.includes("--stdout");
  const positional = argv.filter((arg) => !arg.startsWith("--"));

  const inputPath = positional[0] ? path.resolve(positional[0]) : DEFAULT_INPUT;
  const outputPath = positional[1] ? path.resolve(positional[1]) : DEFAULT_OUTPUT;

  const rawJson = fs.readFileSync(inputPath, "utf8");
  const tokensJson = JSON.parse(rawJson);
  const cssOutput = convertTokensToCss(tokensJson);

  if (emitStdout) {
    process.stdout.write(cssOutput);
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, cssOutput, "utf8");
  console.log(`Generated CSS variables: ${outputPath}`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  convertTokensToCss,
  collectTokens,
  pathToCssVar,
  toKebabCase,
};

