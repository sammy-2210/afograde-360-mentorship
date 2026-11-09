"use client";

import { BRAND_CONFIG } from "@/config/programme";
import { navigateToRegistrationForm } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import styles from "./Sections.module.css";

export function FinalCtaSection() {
  return (
    <section aria-labelledby="final-cta-heading" className="section section-surface-low">
      <div className="container">
        <div className={styles.finalCtaBox}>
          <h2 id="final-cta-heading" className="type-section-heading">
            Begin Your 2027 UTME Preparation with Structure
          </h2>
          <p
            className="type-body-large"
            style={{ maxWidth: "640px", color: "rgba(255, 255, 255, 0.9)" }}
          >
            Join {BRAND_CONFIG.programmeName} under {BRAND_CONFIG.campaignName}.
            Register your details, obtain your unique Registration ID, and take
            the next disciplined step toward your admission goals.
          </p>
          <div className={styles.finalCtaActions}>
            <Button
              variant="inversePrimary"
              onClick={() => navigateToRegistrationForm("final_cta")}
            >
              <span>Register Now</span>
              <ArrowRightIcon />
            </Button>
            <WhatsAppCta
              intent="general_enquiry"
              label="Chat on WhatsApp"
              variant="inverseOutline"
              ctaLocation="final_cta"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

