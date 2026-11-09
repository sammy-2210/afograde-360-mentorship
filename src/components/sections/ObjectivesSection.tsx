import { LAUNCH_GATES } from "@/config/gates";
import { OBJECTIVES_CONFIG } from "@/config/programme";
import { LocationPinIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

export function ObjectivesSection() {
  return (
    <section id="objectives" className="section section-surface-low">
      <div className="container">
        <SectionHeading
          eyebrow="Purpose & Eligibility"
          title="Who Is the Programme For?"
          lead={OBJECTIVES_CONFIG.whoIsItForIntro}
        />

        <div className={styles.gridThree}>
          {OBJECTIVES_CONFIG.whoIsItForItems.map((item) => (
            <article
              key={item.id}
              className={`${styles.cardElevatedWhite} ${styles.cardLeftAccent}`}
            >
              <div className={styles.shieldIconBadge}>
                <LocationPinIcon width={22} height={22} />
              </div>
              <h3 className={`type-title-large ${styles.cardTitle}`}>
                {item.highlight}
              </h3>
              <p className={`type-body-large ${styles.cardBody}`}>
                {item.highlight} {item.detail}
              </p>
            </article>
          ))}

          <article className={styles.cardObsidianBrand}>
            <span
              className="type-label-large"
              style={{
                color: "var(--afograde-color-inverse-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              The 5,000 Pacesetters Goal
            </span>
            <h3
              className="type-title-large"
              style={{ color: "var(--afograde-color-on-primary)" }}
            >
              Raising Confident 2027 UTME Achievers
            </h3>
            <p
              className="type-body-large"
              style={{ color: "rgba(255, 255, 255, 0.94)" }}
            >
              {OBJECTIVES_CONFIG.pacesettersExplanation}
            </p>
          </article>
        </div>

        {!LAUNCH_GATES.internationalEligibility.approved ? (
          <div className={styles.noticeBox}>
            <p className="type-body-medium">
              <strong>Eligibility scope note:</strong> Online registration is
              configured for Science UTME candidates residing across Nigeria’s 36
              states and FCT. Candidates outside Nigeria should enquire via the
              official WhatsApp line before attempting registration.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
