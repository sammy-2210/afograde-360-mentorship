import { BRAND_CONFIG } from "@/config/programme";
import { Button } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import styles from "./Sections.module.css";

export function ContactSection() {
  return (
    <section id="contact" className="section section-surface-low">
      <div className="container">
        <SectionHeading
          eyebrow="Official Support Channel"
          title="Need Help Before or After Registering?"
          lead={`Speak directly with ${BRAND_CONFIG.organisationName} through our single verified WhatsApp and telephone line.`}
        />

        <div className={styles.gridTwo}>
          <div className={styles.cardElevatedWhite}>
            <h3 className={`type-title-large ${styles.cardTitle}`}>
              Official WhatsApp &amp; Call Line
            </h3>
            <p
              className="type-headline-medium"
              style={{ color: "var(--afograde-color-primary)", fontWeight: 700 }}
            >
              {BRAND_CONFIG.whatsappDisplay}
            </p>
            <p className={`type-body-large ${styles.cardBody}`}>
              Available for programme enquiries, subject-combination questions,
              registration assistance, and payment-proof submission.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <WhatsAppCta
                intent="general_enquiry"
                label="General Enquiry on WhatsApp"
                variant="whatsapp"
                ctaLocation="contact_general"
              />
              <Button href={BRAND_CONFIG.callHref} variant="outline">
                <PhoneIcon />
                <span>Call {BRAND_CONFIG.whatsappDisplay}</span>
              </Button>
            </div>
          </div>

          <div className={`${styles.cardElevatedWhite} ${styles.cardInkTop}`}>
            <h3 className={`type-title-large ${styles.cardTitle}`}>
              Registration &amp; Recovery Help
            </h3>
            <p className={`type-body-large ${styles.cardBody}`}>
              Having trouble loading the registration form, switching devices,
              or retrieving your Registration ID? Use a direct support message
              below:
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <WhatsAppCta
                intent="registration_help"
                label="Registration Help"
                variant="secondary"
                ctaLocation="contact_reg_help"
              />
              <WhatsAppCta
                intent="session_recovery"
                label="Recover Registration ID"
                variant="outline"
                ctaLocation="contact_recovery"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

