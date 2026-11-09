import { BRAND_CONFIG, OBJECTIVES_CONFIG } from "@/config/programme";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

export function AboutSection() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="About AFOGRADE & The Series"
          title="Disciplined Preparation Built Around Real UTME Demands"
          lead={OBJECTIVES_CONFIG.programmePurpose}
        />

        <div className={styles.gridTwo}>
          <article className={styles.cardElevatedWhite}>
            <h3 className={`type-title-large ${styles.cardTitle}`}>
              {BRAND_CONFIG.programmeName}
            </h3>
            <p className={`type-body-large ${styles.cardBody}`}>
              Preparing for the UTME requires more than isolated reading—it
              demands steady syllabus progression, regular timed testing, and
              clear academic mentorship. {BRAND_CONFIG.shortName} combines live
              online instruction with structured practice and guided revision so
              candidates stay accountable week after week.
            </p>
            <p
              className="type-title-medium"
              style={{ color: "var(--afograde-color-primary)" }}
            >
              “{BRAND_CONFIG.tagline}”
            </p>
          </article>

          <article className={styles.cardObsidianBrand}>
            <h3
              className="type-title-large"
              style={{ color: "var(--afograde-color-on-primary)" }}
            >
              {BRAND_CONFIG.campaignName} (Campaign Target)
            </h3>
            <p
              className="type-body-large"
              style={{ color: "rgba(255, 255, 255, 0.92)" }}
            >
              {OBJECTIVES_CONFIG.pacesettersExplanation}
            </p>
            <p
              className="type-body-medium"
              style={{ color: "var(--afograde-color-inverse-primary)" }}
            >
              <strong>Transparency note:</strong> The{" "}
              {BRAND_CONFIG.pacesettersTargetCount}-candidate figure represents
              our 2027 campaign outreach target, not a claim of past enrolment.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

