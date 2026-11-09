import {
  ALL_PROGRAMME_SUBJECTS,
  BENEFITS_LIST,
  COMPULSORY_SUBJECT,
} from "@/config/programme";
import { CheckCircleIcon } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/Badge";
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

        {/* Single Spacious Deliverables Card */}
        <article className={styles.singleMasterCard}>
          <div className={styles.masterCardHeader}>
            <Badge variant="brand">Full Subscription Benefits</Badge>
            <h3 className={`type-title-large ${styles.masterCardTitle}`}>
              Complete 4-Cycle Academic Deliverables
            </h3>
            <p className={styles.masterCardLead}>
              Everything you need to master your 4 UTME subjects without paying for expensive physical lesson centers:
            </p>
          </div>

          <div className={styles.benefitsTwoColGrid}>
            {BENEFITS_LIST.map((item, idx) => (
              <div key={item.id} className={styles.benefitPointCard}>
                <div className={styles.benefitPointHeader}>
                  <span className={styles.benefitIndexPill}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h4 className={styles.benefitPointTitle}>{item.title}</h4>
                </div>
                <p className={styles.benefitPointDesc}>{item.description.trim()}</p>
              </div>
            ))}
          </div>

          {/* Embedded Covered UTME Subjects Panel */}
          <div className={styles.subjectsPanelEmbedded} aria-label="Covered UTME subjects">
            <div>
              <h4 className={styles.subjectsPanelTitle}>
                Approved UTME Subjects Covered
              </h4>
              <p className={styles.subjectsPanelSubtitle}>
                {COMPULSORY_SUBJECT} is compulsory for every UTME candidate, paired
                with your combination from the four core subjects:
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
        </article>
      </div>
    </section>
  );
}

