"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import Link from "next/link";
import { isAnalyticsEnabledByConfig, PUBLIC_ENV } from "@/config/env";
import {
  getAnalyticsConsentDecision,
  setAnalyticsConsent,
} from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import styles from "./AnalyticsManager.module.css";

/**
 * Privacy-Gated GA4 Loader & Consent Banner (PRD Section 14.1)
 *
 * - Renders nothing at all unless `NEXT_PUBLIC_ANALYTICS_APPROVED=true` AND
 *   a valid `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is configured.
 * - Never loads GA4 scripts until the visitor explicitly clicks "Accept Analytics".
 * - Declining or ignoring never blocks or alters registration.
 */
export function AnalyticsManager() {
  const enabled = isAnalyticsEnabledByConfig();
  const [decision, setDecision] = useState<"granted" | "declined" | "pending">(
    "pending"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!enabled) return;
    const saved = getAnalyticsConsentDecision();
    setDecision(saved ?? "pending");
  }, [enabled]);

  if (!enabled || !mounted) {
    return null;
  }

  const handleDecision = (choice: "granted" | "declined") => {
    setAnalyticsConsent(choice);
    setDecision(choice);
  };

  return (
    <>
      {decision === "granted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${PUBLIC_ENV.ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="afograde-ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${PUBLIC_ENV.ga4MeasurementId}', {
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false,
                send_page_view: true
              });
            `}
          </Script>
        </>
      ) : null}

      {decision === "pending" ? (
        <section
          aria-label="Analytics privacy preference"
          className={styles.banner}
        >
          <p className={styles.title}>Optional Campaign Measurement</p>
          <p className={styles.copy}>
            With your permission, AFOGRADE uses privacy-restricted analytics (no
            names, phone numbers, or Registration IDs) to understand how visitors
            use this page. Registration works normally if you decline.{" "}
            <Link href="/privacy/">Read Privacy Notice</Link>.
          </p>
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={() => handleDecision("granted")}
            >
              Accept Analytics
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDecision("declined")}
            >
              Decline
            </Button>
          </div>
        </section>
      ) : null}
    </>
  );
}

