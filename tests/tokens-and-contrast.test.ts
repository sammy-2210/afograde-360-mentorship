import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { convertTokensToCss } = require("../scripts/generate-tokens-css.js");

const tokensPath = path.resolve(import.meta.dirname, "..", "afograde-design-tokens.json");
const tokensJson = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

function hexToRelativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = hexToRelativeLuminance(fgHex);
  const l2 = hexToRelativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Design Tokens CSS Generator & WCAG 2.2 AA Contrast", () => {
  it("generates CSS variables with --afograde- prefix, resolved var() aliases, and no prose leakage", () => {
    const css = convertTokensToCss(tokensJson);

    assert.match(css, /--afograde-color-brand-primary: #0A4A0A;/);
    assert.match(
      css,
      /--afograde-color-primary: var\(--afograde-color-light-primary\);/
    );
    assert.match(
      css,
      /--afograde-elevation-level1: 0px 1px 2px 0px rgba\(0, 0, 0, 0\.08\);/
    );
    assert.match(
      css,
      /--afograde-components-button-corner-radius: var\(--afograde-shape-full\);/
    );
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(css, /color-scheme:\s*light;/);
    assert.doesNotMatch(css, /\[data-theme="dark"\]/);
    assert.doesNotMatch(css, /--afograde-typography-responsive-note:/);
    assert.doesNotMatch(css, /--afograde-accessibility-contrast:/);
  });

  it("verifies active UI foreground/background pairings meet WCAG 2.2 AA contrast thresholds", () => {
    const light = tokensJson.color.light;
    const dark = tokensJson.color.dark;
    const brand = tokensJson.color.brand;
    const util = tokensJson.color.utility;

    // Normal text pairs must be >= 4.5:1
    assert.ok(
      contrastRatio(light.onPrimary.$value, light.primary.$value) >= 4.5,
      "onPrimary on primary >= 4.5:1"
    );
    assert.ok(
      contrastRatio(dark.surfaceContainerLowest.$value, light.surfaceContainerLowest.$value) >= 4.5,
      "Ink black (#0B100B) on white (#FFFFFF) >= 4.5:1"
    );
    assert.ok(
      contrastRatio(dark.surfaceContainerLowest.$value, brand.tint.$value) >= 4.5,
      "Ink black (#0B100B) on brand tint (#E8F1E8) >= 4.5:1"
    );
    assert.ok(
      contrastRatio(light.onPrimary.$value, dark.surfaceContainerLowest.$value) >= 4.5,
      "White (#FFFFFF) on ink black (#0B100B) >= 4.5:1"
    );
    assert.ok(
      contrastRatio(light.inversePrimary.$value, dark.surfaceContainerLowest.$value) >= 4.5,
      "Mint inversePrimary (#A6D49F) on ink black (#0B100B) >= 4.5:1"
    );
    assert.ok(
      contrastRatio(brand.primary.$value, brand.tint.$value) >= 4.5,
      "Brand primary (#0A4A0A) on brand tint (#E8F1E8) >= 4.5:1"
    );
    assert.ok(
      contrastRatio(light.onSurface.$value, light.surface.$value) >= 4.5,
      "onSurface on surface >= 4.5:1"
    );
    assert.ok(
      contrastRatio(light.onSurfaceVariant.$value, light.surface.$value) >= 4.5,
      "onSurfaceVariant on surface >= 4.5:1"
    );
    assert.ok(
      contrastRatio(light.onPrimaryContainer.$value, light.primaryContainer.$value) >= 4.5,
      "onPrimaryContainer on primaryContainer >= 4.5:1"
    );
    assert.ok(
      contrastRatio(brand.deepest.$value, util.whatsapp.$value) >= 4.5,
      "WhatsApp button pairing (#062806 text on #25D366) >= 4.5:1"
    );

    // Non-text input border outline on surface must be >= 3.0:1 (WCAG 1.4.11)
    assert.ok(
      contrastRatio(light.outline.$value, light.surface.$value) >= 3.0,
      "outline border on surface >= 3.0:1"
    );
  });
});

