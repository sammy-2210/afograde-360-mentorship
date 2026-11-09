"use client";

import { useEffect, useState } from "react";
import { navigateToRegistrationForm } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import styles from "./StickyMobileBar.module.css";

/**
 * Sticky Mobile CTA Bar (PRD FR-02 & Section 16.3):
 * Register Now (primary) + WhatsApp (secondary).
 * Automatically hides when #register is visible in the viewport OR when any form field
 * has focus so it never obscures keyboard entry, payment instructions, or error states.
 */
export function StickyMobileBar() {
  const [registerInView, setRegisterInView] = useState(false);
  const [formInputFocused, setFormInputFocused] = useState(false);

  useEffect(() => {
    const registerEl = document.getElementById("register");
    if (!registerEl || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setRegisterInView(entry.isIntersecting);
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(registerEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
        setFormInputFocused(true);
      }
    };

    const onFocusOut = () => {
      window.setTimeout(() => {
        const active = document.activeElement;
        const tag = active?.tagName;
        setFormInputFocused(
          tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA"
        );
      }, 100);
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const shouldHide = registerInView || formInputFocused;

  return (
    <aside
      aria-label="Quick registration actions"
      aria-hidden={shouldHide}
      className={`${styles.bar} ${shouldHide ? styles.hidden : ""}`.trim()}
    >
      <div className={styles.actions}>
        <Button
          variant="primary"
          fullWidth
          tabIndex={shouldHide ? -1 : 0}
          onClick={() => navigateToRegistrationForm("mobile_sticky_bar")}
        >
          Register Now
        </Button>
        <WhatsAppCta
          intent="general_enquiry"
          label="WhatsApp"
          variant="outline"
          fullWidth
          ctaLocation="mobile_sticky_bar"
        />
      </div>
    </aside>
  );
}

