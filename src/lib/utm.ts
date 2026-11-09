/**
 * First-Touch Session UTM Capture & Sanitization (PRD Section 14.4)
 *
 * - Captures utm_source, utm_medium, utm_campaign, utm_content, utm_term.
 * - Retains the first non-empty values within the current browser session.
 * - Sanitizes and length-limits each field (max 100 chars, no HTML/control chars).
 */

import type { UtmParams } from "../types/registration.ts";

export const UTM_SESSION_STORAGE_KEY = "afograde_utm_session_v1";
const MAX_UTM_FIELD_LENGTH = 100;

const UTM_KEYS: ReadonlyArray<keyof UtmParams> = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

let memoryUtmFallback: UtmParams = createEmptyUtm();

export function createEmptyUtm(): UtmParams {
  return {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
  };
}

export function sanitizeUtmValue(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/[\u0000-\u001F\u007F<>`"']/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_UTM_FIELD_LENGTH);
}

export function mergeFirstTouchUtm(
  existing: UtmParams,
  incomingSearch: string | URLSearchParams
): UtmParams {
  const params =
    typeof incomingSearch === "string"
      ? new URLSearchParams(
          incomingSearch.startsWith("?") ? incomingSearch.slice(1) : incomingSearch
        )
      : incomingSearch;

  const merged: UtmParams = { ...existing };

  for (const key of UTM_KEYS) {
    // First-touch rule within session: only populate if existing slot is empty
    if (!merged[key]) {
      const candidate = sanitizeUtmValue(params.get(key));
      if (candidate) {
        merged[key] = candidate;
      }
    }
  }

  return merged;
}

export function captureSessionUtm(search?: string): UtmParams {
  if (typeof window === "undefined") {
    return search ? mergeFirstTouchUtm(createEmptyUtm(), search) : createEmptyUtm();
  }

  let stored = memoryUtmFallback;

  try {
    const raw = window.sessionStorage.getItem(UTM_SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UtmParams>;
      stored = {
        utm_source: sanitizeUtmValue(parsed.utm_source),
        utm_medium: sanitizeUtmValue(parsed.utm_medium),
        utm_campaign: sanitizeUtmValue(parsed.utm_campaign),
        utm_content: sanitizeUtmValue(parsed.utm_content),
        utm_term: sanitizeUtmValue(parsed.utm_term),
      };
    }
  } catch {
    // Fall back to in-memory session storage
  }

  const next = mergeFirstTouchUtm(stored, search ?? window.location.search);
  memoryUtmFallback = next;

  try {
    window.sessionStorage.setItem(UTM_SESSION_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota / private-browsing block
  }

  return next;
}

