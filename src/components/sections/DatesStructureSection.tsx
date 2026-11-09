import { SCHEDULE_CONFIG } from "@/config/programme";
import type { ServerConfigPayload } from "@/types/registration";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

interface DatesStructureSectionProps {
  serverConfig: ServerConfigPayload | null;
}

export function DatesStructureSection({
  serverConfig,
}: DatesStructureSectionProps) {
  const openingDisplay =
    serverConfig?.openingDateLabel ??
    SCHEDULE_CONFIG.workingRegistrationOpeningLabel;
  const periodDisplay = (
    serverConfig?.programmePeriodLabel ??
    SCHEDULE_CONFIG.workingProgrammePeriodLabel
  ).replace(/\s*\([Cc]onfirm\s*P0\)/i, "").trim();

  return (
    <section id="dates-structure" className="section section-brand-deep">
      <div className="container">
        <SectionHeading
          eyebrow="Calendar & 4-Cycle Structure"
          title="Programme Dates & Four-Cycle Progression"
          lead="The mentorship is organised into four progressive monthly cycles leading up to the 2027 UTME."
          inverse
        />

        <div className={styles.gridTwo} style={{ marginBottom: "24px" }}>
          <div className={styles.cardDarkGlass}>
            <span
              className="type-label-large"
              style={{ color: "var(--afograde-color-inverse-primary)" }}
            >
              Registration Schedule
            </span>
            <p className="type-title-large">{openingDisplay}</p>
            {serverConfig?.closingDateLabel ? (
              <p
                className="type-body-medium"
                style={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                Registration closes: {serverConfig.closingDateLabel}
              </p>
            ) : null}
          </div>

          <div className={styles.cardDarkGlass}>
            <span
              className="type-label-large"
              style={{ color: "var(--afograde-color-inverse-primary)" }}
            >
              Programme Window
            </span>
            <p className="type-title-large">{periodDisplay}</p>
            <p
              className="type-body-small"
              style={{ color: "rgba(255, 255, 255, 0.84)" }}
            >
              Official 2027 JAMB/UTME examination dates are set solely by JAMB
              and are never speculated on this page.
            </p>
          </div>
        </div>

        <div className={styles.gridFour}>
          {SCHEDULE_CONFIG.cyclesOverview.map((cycle) => (
            <article key={cycle.cycleNumber} className={styles.cardElevatedWhite}>
              <span className={styles.cardNumberPill}>C{cycle.cycleNumber}</span>
              <h3 className={`type-title-large ${styles.cardTitle}`}>
                {cycle.title}
              </h3>
              <p className={`type-body-medium ${styles.cardBody}`}>
                {cycle.periodNotice}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

