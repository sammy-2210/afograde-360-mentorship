import { LAUNCH_GATES } from "@/config/gates";
import { REWARDS_CONFIG } from "@/config/programme";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

export function RewardsSection() {
  return (
    <section id="rewards" className="section section-brand-tint">
      <div className="container">
        <SectionHeading
          eyebrow="Merit Recognition & Awards"
          title="Academic Excellence Incentives for Committed Pacesetters"
          lead="Top-performing verified participants in the 2027 UTME cohort are eligible for merit recognition awards under AFOGRADE's official verification rules."
        />

        <div className={styles.gridThree}>
          {REWARDS_CONFIG.awards.map((item, idx) => {
            const isTopAward = idx === 0;
            return (
              <article
                key={item.prize}
                className={
                  isTopAward
                    ? styles.cardObsidianBrand
                    : `${styles.cardElevatedWhite} ${styles.cardInkTop}`
                }
              >
                <div>
                  <Badge variant={isTopAward ? "inverse" : "neutral"}>
                    {item.rank}
                  </Badge>
                </div>
                <h3
                  className="type-headline-small"
                  style={{
                    color: isTopAward
                      ? "var(--afograde-color-on-primary)"
                      : "var(--afograde-ink-black)",
                  }}
                >
                  {item.prize}
                </h3>
                <p
                  className={`type-body-large ${
                    isTopAward ? "" : styles.cardBody
                  }`.trim()}
                  style={
                    isTopAward
                      ? { color: "rgba(255, 255, 255, 0.9)" }
                      : undefined
                  }
                >
                  {item.summary}
                </p>
              </article>
            );
          })}
        </div>

        {!LAUNCH_GATES.prizeRules.approved ? (
          <div className={styles.noticeBox}>
            <p className="type-body-medium">
              <strong>Terms &amp; verification notice:</strong>{" "}
              {REWARDS_CONFIG.provisionalDisclaimer}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

