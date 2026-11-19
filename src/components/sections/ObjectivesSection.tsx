import { LAUNCH_GATES } from "@/config/gates";
import { OBJECTIVES_CONFIG } from "@/config/programme";
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

        {/* Single Card With All Content Listed As Bullet Points */}
        <article className={styles.singleBulletCard}>
          <ul className={styles.cleanBulletList}>
            {OBJECTIVES_CONFIG.whoIsItForItems.map((item) => (
              <li key={item.id} className={styles.cleanBulletItem}>
                <strong>{item.highlight}:</strong> {item.detail}
              </li>
            ))}
            <li className={styles.cleanBulletItem}>
              <strong>The 5,000 Pacesetters Goal:</strong> {OBJECTIVES_CONFIG.pacesettersExplanation}
            </li>
          </ul>
        </article>

        {!LAUNCH_GATES.internationalEligibility.approved ? (
          <div className={styles.noticeBox} style={{ marginTop: "var(--afograde-spacing-4)" }}>
            <p className="type-body-medium">
              <strong>Eligibility scope note:</strong> Online registration is
              configured for Science, Art and Commercial UTME candidates residing across Nigeria’s 36
              states and FCT. Candidates outside Nigeria should enquire via the
              official WhatsApp line before attempting registration.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
