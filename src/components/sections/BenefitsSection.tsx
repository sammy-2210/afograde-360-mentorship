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

        {/* Single Card With All Content Listed As Bullet Points */}
        <article className={styles.singleBulletCard}>
          <ul className={styles.cleanBulletList}>
            {BENEFITS_LIST.map((item) => (
              <li key={item.id} className={styles.cleanBulletItem}>
                <strong>{item.title}:</strong> {item.description.trim()}
              </li>
            ))}
          </ul>

          <div className={styles.subjectsCleanBar}>
            <strong>Approved UTME Subjects Covered ({COMPULSORY_SUBJECT} + 3 Electives):</strong>{" "}
            <span>{ALL_PROGRAMME_SUBJECTS.join(", ")}</span>
          </div>
        </article>
      </div>
    </section>
  );
}

