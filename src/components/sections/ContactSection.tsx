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
          eyebrow="Official Support Channels"
          title="Need Help Before or After Registering?"
          lead={`Speak directly with ${BRAND_CONFIG.organisationName} through our dedicated lines for enquiries, complaints, and registration assistance.`}
        />

        <div className={styles.gridTwo}>
          <div className={styles.cardElevatedWhite}>
            <h3 className={`type-title-large ${styles.cardTitle}`}>
              Enquiries &amp; Complaints Line
            </h3>
            <p
              className="type-headline-medium"
              style={{ color: "var(--afograde-color-primary)", fontWeight: 700 }}
            >
              {BRAND_CONFIG.supportWhatsAppDisplay}
            </p>
            <p className={`type-body-large ${styles.cardBody}`}>
              Available for general programme enquiries, complaints, syllabus
              questions, timetable guidance, and student or parent support.
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
                label="Enquiry on WhatsApp"
                variant="whatsapp"
                ctaLocation="contact_general"
              />
              <Button href={BRAND_CONFIG.supportCallHref} variant="outline">
                <PhoneIcon />
                <span>Call {BRAND_CONFIG.supportWhatsAppDisplay}</span>
              </Button>
            </div>
          </div>

          <div className={`${styles.cardElevatedWhite} ${styles.cardInkTop}`}>
            <h3 className={`type-title-large ${styles.cardTitle}`}>
              Registration &amp; Verification Help
            </h3>
            <p
              className="type-headline-medium"
              style={{ color: "var(--afograde-ink-black)", fontWeight: 700 }}
            >
              {BRAND_CONFIG.registrationWhatsAppDisplay}
            </p>
            <p className={`type-body-large ${styles.cardBody}`}>
              Dedicated line for registration assistance, bank transfer
              verification, attaching payment screenshots, and recovering your
              Registration ID.
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
              <Button href={BRAND_CONFIG.registrationCallHref} variant="outline">
                <PhoneIcon />
                <span>Call {BRAND_CONFIG.registrationWhatsAppDisplay}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

