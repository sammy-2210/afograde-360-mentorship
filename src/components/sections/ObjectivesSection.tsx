import { LAUNCH_GATES } from "@/config/gates";
import { OBJECTIVES_CONFIG } from "@/config/programme";
import { CheckCircleIcon, ShieldCheckIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
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

        {/* Single Spacious Card Listing All Points */}
        <article className={styles.singleMasterCard}>
          <div className={styles.masterCardHeader}>
            <Badge variant="brand">Target Candidates</Badge>
            <h3 className={`type-title-large ${styles.masterCardTitle}`}>
              Designed Exclusively for Focused 2027 Science Candidates
            </h3>
            <p className={styles.masterCardLead}>
              Whether preparing for your first attempt or re-taking to cross the 300+ threshold for Medicine, Engineering, or Pharmacy:
            </p>
          </div>

          <ul className={styles.spaciousPointsList} role="list">
            {OBJECTIVES_CONFIG.whoIsItForItems.map((item) => (
              <li key={item.id} className={styles.spaciousPointItem} role="listitem">
                <div className={styles.pointIconWrap}>
                  <CheckCircleIcon width={22} height={22} className={styles.pointIcon} />
                </div>
                <div className={styles.pointTextWrap}>
                  <strong className={styles.pointHighlight}>{item.highlight}:</strong>{" "}
                  <span className={styles.pointDetail}>{item.detail}</span>
                </div>
              </li>
            ))}

            {/* Pacesetters Mission Highlight Point */}
            <li className={`${styles.spaciousPointItem} ${styles.spaciousPointFeatured}`} role="listitem">
              <div className={styles.pointIconWrap}>
                <ShieldCheckIcon width={22} height={22} className={styles.pointIconFeatured} />
              </div>
              <div className={styles.pointTextWrap}>
                <strong className={styles.pointHighlight}>The 5,000 Pacesetters Goal:</strong>{" "}
                <span className={styles.pointDetail}>{OBJECTIVES_CONFIG.pacesettersExplanation}</span>
              </div>
            </li>
          </ul>
        </article>

        {!LAUNCH_GATES.internationalEligibility.approved ? (
          <div className={styles.noticeBox} style={{ marginTop: "var(--afograde-spacing-6)" }}>
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
