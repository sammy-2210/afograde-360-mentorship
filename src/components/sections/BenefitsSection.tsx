import {
  ALL_PROGRAMME_SUBJECTS,
  BENEFITS_LIST,
  COMPULSORY_SUBJECT,
} from "@/config/programme";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

export function BenefitsSection() {
  return (
    <section id="benefits" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Learning & Mentorship Experience"
          title="Everything Included in Your Active Subscription"
          lead="Every programme cycle combines live teaching, revision recordings, active recall drills, and admission guidance."
        />

        <div className={styles.gridThree}>
          {BENEFITS_LIST.map((item, idx) => (
            <article key={item.id} className={styles.card}>
              <span className={styles.cardNumberPill} aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3 className={`type-title-large ${styles.cardTitle}`}>
                {item.title}
              </h3>
              <p className={`type-body-large ${styles.cardBody}`}>
                {item.description.trim()}
              </p>
            </article>
          ))}
        </div>

        <div className={styles.subjectsPanel} aria-label="Covered UTME subjects">
          <div>
            <h3
              className="type-title-large"
              style={{ color: "var(--afograde-color-on-primary)" }}
            >
              Approved UTME Subjects Covered
            </h3>
            <p
              className="type-body-medium"
              style={{ marginTop: "4px", color: "rgba(255, 255, 255, 0.9)" }}
            >
              {COMPULSORY_SUBJECT} is compulsory for every UTME candidate, paired
              with your combination from the four core subjects below:
            </p>
          </div>
          <div className={styles.subjectChipsRow}>
            {ALL_PROGRAMME_SUBJECTS.map((subject) => (
              <span key={subject} className={styles.subjectChip}>
                {subject}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

