"use client";

import { trackEvent } from "./analytics";

/**
 * Navigates smoothly to #register and focuses the first interactive form field
 * (or the active registration state container when form is gated/completed),
 * fulfilling PRD FR-02 & Section 18.2.
 */
export function navigateToRegistrationForm(ctaLocation: string): void {
  trackEvent("register_cta_clicked", { cta_location: ctaLocation });

  if (typeof document === "undefined") return;

  const section = document.getElementById("register");
  if (section) {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    section.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  // Allow smooth scroll to initiate before moving focus
  window.setTimeout(() => {
    const firstField = document.getElementById(
      "field-fullName"
    ) as HTMLInputElement | null;
    if (firstField && !firstField.disabled) {
      firstField.focus({ preventScroll: true });
      trackEvent("registration_form_opened", { cta_location: ctaLocation });
      return;
    }

    const fallbackHeading = document.getElementById(
      "registration-active-heading"
    ) as HTMLElement | null;
    if (fallbackHeading) {
      fallbackHeading.focus({ preventScroll: true });
    }
  }, 320);
}

