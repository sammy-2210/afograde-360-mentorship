/**
 * Public Environment Configuration Loader
 * Distinguishes public configuration from private secrets and detects unconfigured integrations.
 */

export type SiteEnvironment = "preview" | "production";

function cleanEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

export const PUBLIC_ENV = {
  siteEnv: (cleanEnv(process.env.NEXT_PUBLIC_SITE_ENV) === "production"
    ? "production"
    : "preview") as SiteEnvironment,
  siteUrl: cleanEnv(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/+$/, ""),
  appsScriptUrl: cleanEnv(process.env.NEXT_PUBLIC_APPS_SCRIPT_URL),
  turnstileSiteKey: cleanEnv(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  analyticsApproved: cleanEnv(process.env.NEXT_PUBLIC_ANALYTICS_APPROVED).toLowerCase() === "true",
  ga4MeasurementId: cleanEnv(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID),
} as const;

export function isProductionIndexable(): boolean {
  return PUBLIC_ENV.siteEnv === "production" && PUBLIC_ENV.siteUrl.startsWith("https://");
}

export function isAppsScriptConfigured(): boolean {
  return (
    PUBLIC_ENV.appsScriptUrl.startsWith("https://script.google.com/macros/s/") &&
    PUBLIC_ENV.appsScriptUrl.endsWith("/exec")
  );
}

export function isTurnstileConfigured(): boolean {
  return PUBLIC_ENV.turnstileSiteKey.length >= 10;
}

export function isAnalyticsEnabledByConfig(): boolean {
  return (
    PUBLIC_ENV.analyticsApproved && /^G-[A-Z0-9]+$/i.test(PUBLIC_ENV.ga4MeasurementId)
  );
}

