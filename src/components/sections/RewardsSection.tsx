import { LAUNCH_GATES } from "@/config/gates";
import { REWARDS_CONFIG } from "@/config/programme";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

const PRIZE_MEDIA: Record<string, { src: string; alt: string }> = {
  "HP Elite Laptop": {
    src: "/images/prize-laptop-unboxing.jpg",
    alt: "Brand new laptop unboxing with retail box and presentation packaging",
  },
  Smartphone: {
    src: "/images/prize-smartphone-unboxing.jpg",
    alt: "Brand new smartphone unboxing with opened retail box and accessories",
  },
  "₦50,000 Cash Grant": {
    src: "/images/prize-cash-grant.svg",
    alt: "AFOGRADE ₦50,000 academic excellence cash grant award voucher",
  },
};

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
            const media = PRIZE_MEDIA[item.prize] ?? {
              src: "/images/prize-laptop-unboxing.jpg",
              alt: item.prize,
            };

            return (
              <article
                key={item.prize}
                className={`${styles.prizeCard} ${
                  isTopAward ? styles.prizeCardTop : styles.prizeCardStandard
                }`}
              >
                <div className={styles.prizeImageWrap}>
                  <img
                    src={media.src}
                    alt={media.alt}
                    width={400}
                    height={230}
                    loading="lazy"
                    decoding="async"
                    className={styles.prizeImg}
                  />
                  <div className={styles.prizeBadgeWrap}>
                    <Badge variant={isTopAward ? "inverse" : "neutral"}>
                      {item.rank}
                    </Badge>
                  </div>
                </div>

                <div className={styles.prizeContent}>
                  <h3
                    className="type-title-large"
                    style={{
                      color: isTopAward
                        ? "var(--afograde-color-on-primary)"
                        : "var(--afograde-ink-black)",
                      margin: "0 0 var(--afograde-spacing-2) 0",
                    }}
                  >
                    {item.prize}
                  </h3>
                  <p
                    className={`type-body-medium ${
                      isTopAward ? "" : styles.cardBody
                    }`.trim()}
                    style={
                      isTopAward
                        ? { color: "rgba(255, 255, 255, 0.92)", margin: 0 }
                        : { margin: 0 }
                    }
                  >
                    {item.summary}
                  </p>
                </div>
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

