/**
 * Central Official Social Media Configuration — AFOGRADE Tutorials & EduServices
 *
 * HOW TO UPDATE:
 * 1. Code configuration: Paste the official `https://...` URL for any platform below.
 * 2. No-rebuild Google Sheets option: Staff can also set `SOCIAL_FACEBOOK_PAGE`,
 *    `SOCIAL_FACEBOOK_COMMUNITY`, `SOCIAL_INSTAGRAM`, `SOCIAL_WHATSAPP_CHANNEL`,
 *    `SOCIAL_TELEGRAM`, or `SOCIAL_X_TWITTER` in the `Settings` tab of the official
 *    Google Sheet to publish or update links live without rebuilding the site.
 *
 * SAFETY RULE:
 * Do NOT invent social media URLs or usernames. Any platform with an empty `""`
 * or invalid URL is automatically hidden so broken or dummy links never appear.
 */

import type {
  SocialLinksOverrideMap,
  SocialPlatformKey,
} from "../types/registration.ts";

export interface SocialPlatformEntry {
  key: SocialPlatformKey;
  label: string;
  url: string;
}

/**
 * Primary official AFOGRADE platforms.
 * Leave `url: ""` until the official page/channel link is confirmed.
 */
export const OFFICIAL_SOCIAL_PLATFORMS: readonly SocialPlatformEntry[] = [
  {
    key: "facebookPage",
    label: "Facebook Page",
    url: "",
  },
  {
    key: "facebookCommunity",
    label: "Facebook Community",
    url: "",
  },
  {
    key: "instagram",
    label: "Instagram",
    url: "",
  },
  {
    key: "whatsapp",
    label: "WhatsApp Support",
    url: "https://wa.me/2348066402077",
  },
  {
    key: "whatsappChannel",
    label: "WhatsApp Channel",
    url: "",
  },
  {
    key: "whatsappChannel2",
    label: "WhatsApp Channel 2",
    url: "",
  },
  {
    key: "tiktok",
    label: "TikTok",
    url: "",
  },
  {
    key: "telegram",
    label: "Telegram",
    url: "",
  },
  {
    key: "xTwitter",
    label: "X (Twitter)",
    url: "",
  },
] as const;

/**
 * Optional future platforms (e.g., YouTube, TikTok, LinkedIn).
 * Add `{ key: "other", label: "YouTube", url: "https://..." }` when available.
 */
export const ADDITIONAL_SOCIAL_PLATFORMS: readonly SocialPlatformEntry[] = [];

export function isValidOfficialSocialUrl(raw: string | undefined): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "#") return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" && Boolean(parsed.hostname.includes("."));
  } catch {
    return false;
  }
}

export function getActiveSocialLinks(
  serverOverrides?: SocialLinksOverrideMap
): SocialPlatformEntry[] {
  const mergedPrimary = OFFICIAL_SOCIAL_PLATFORMS.map((entry) => {
    const override = serverOverrides?.[entry.key];
    const candidateUrl =
      override && isValidOfficialSocialUrl(override)
        ? override.trim()
        : entry.url.trim();
    return {
      ...entry,
      url: candidateUrl,
    };
  });

  return [...mergedPrimary, ...ADDITIONAL_SOCIAL_PLATFORMS].filter((entry) =>
    isValidOfficialSocialUrl(entry.url)
  );
}

