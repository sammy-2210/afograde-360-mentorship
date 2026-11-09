"use client";

import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./Icons";
import styles from "./FloatingWhatsAppButton.module.css";

/**
 * Floating Official WhatsApp Action Button.
 * Displayed on desktop (`>= 1024px`) while preserving the existing 2-CTA
 * `StickyMobileBar` on mobile screens (`< 1024px`) without overlap.
 */
export function FloatingWhatsAppButton() {
  const href = buildWhatsAppUrl({ intent: "general_enquiry" });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with AFOGRADE on WhatsApp"
      className={styles.fab}
      onClick={() =>
        trackEvent("whatsapp_cta_clicked", {
          whatsapp_intent: "general_enquiry",
          cta_location: "floating_fab",
        })
      }
    >
      <span className={styles.iconWrap}>
        <WhatsAppIcon width={26} height={26} />
      </span>
      <span className={styles.label} aria-hidden="true">
        Chat on WhatsApp
      </span>
    </a>
  );
}
