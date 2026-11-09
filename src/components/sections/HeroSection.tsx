"use client";

import { BRAND_CONFIG, SCHEDULE_CONFIG } from "@/config/programme";
import { navigateToRegistrationForm } from "@/lib/navigation";
import { formatNaira } from "@/lib/validation";
import type { RegistrationUiState } from "@/types/registration";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/Icons";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import styles from "./Sections.module.css";

interface HeroSectionProps {
  uiState: RegistrationUiState;
}

function getHeroStatusLabel(uiState: RegistrationUiState): {
  text: string;
  isLiveOpen: boolean;
} {
  switch (uiState) {
    case "form":
    case "validation_error":
    case "submitting":
    case "duplicate_confirmation":
      return { text: "Online Registration Open", isLiveOpen: true };
    case "payment":
      return { text: "Registration Recorded — Transfer Pending", isLiveOpen: true };
    case "not_open":
      return { text: "Registration Opening Soon", isLiveOpen: false };
    case "paused":
      return { text: "Online Intake Temporarily Paused", isLiveOpen: false };
    case "closed":
      return { text: "Registration Window Closed", isLiveOpen: false };
    case "loading":
      return { text: "Checking Registration Status...", isLiveOpen: false };
    default:
      return { text: "WhatsApp Enquiries Available", isLiveOpen: false };
  }
}

export function HeroSection({ uiState }: HeroSectionProps) {
  const statusInfo = getHeroStatusLabel(uiState);

  return (
    <section id="hero" className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadgeRow}>
            <Badge variant="inverse">{BRAND_CONFIG.campaignName}</Badge>
            <Badge variant="inverse">
              <span
                className={`${styles.statusDot} ${
                  statusInfo.isLiveOpen ? "" : styles.statusDotPending
                }`.trim()}
              />
              <span>{statusInfo.text}</span>
            </Badge>
          </div>

          <h1 className="type-hero-heading">
            {BRAND_CONFIG.programmeName} for {BRAND_CONFIG.targetCohortLabel}
          </h1>

          <p className={styles.heroLead}>
            Structured online UTME tutorials, timed speed tests, active question
            battles, and university admission mentorship delivered by{" "}
            <strong>{BRAND_CONFIG.organisationName}</strong>.
          </p>

          <p className={`type-title-medium ${styles.heroTagline}`}>
            “{BRAND_CONFIG.tagline}”
          </p>

          <div className={styles.heroActions}>
            <Button
              variant="inversePrimary"
              onClick={() => navigateToRegistrationForm("hero_primary")}
            >
              <span>Register Now</span>
              <ArrowRightIcon />
            </Button>
            <WhatsAppCta
              intent="general_enquiry"
              label="Enquire on WhatsApp"
              variant="inverseOutline"
              ctaLocation="hero_secondary"
            />
          </div>
        </div>

        <aside
          className={styles.heroSummaryCard}
          aria-label="Programme key facts"
        >
          <div className={styles.heroCardHeader}>
            <p className={styles.heroCardEyebrow}>Monthly Subscription</p>
            <p className={styles.heroPriceHighlight}>
              {formatNaira(SCHEDULE_CONFIG.monthlyFeeNgn)}{" "}
              <span className={styles.heroPriceUnit}>/ programme month</span>
            </p>
          </div>

          <ul className={styles.heroFactList}>
            <li className={styles.heroFactItem}>
              <CheckCircleIcon className={styles.heroFactIcon} />
              <span>
                <strong>Flexible 1–4 Month Plans:</strong> Choose coverage for
                eligible programme cycles ({formatNaira(1500)} to{" "}
                {formatNaira(6000)}).
              </span>
            </li>
            <li className={styles.heroFactItem}>
              <CheckCircleIcon className={styles.heroFactIcon} />
              <span>
                <strong>5 Approved UTME Subjects:</strong> Use of English,
                Mathematics, Biology, Chemistry &amp; Physics.
              </span>
            </li>
            <li className={styles.heroFactItem}>
              <CheckCircleIcon className={styles.heroFactIcon} />
              <span>
                <strong>Multi-Channel Delivery:</strong> Live online classes
                supported by official WhatsApp &amp; Telegram study groups.
              </span>
            </li>
            <li className={styles.heroFactItem}>
              <CheckCircleIcon className={styles.heroFactIcon} />
              <span>
                <strong>Verified Onboarding:</strong> Unique Registration ID +
                manual staff bank verification before group access.
              </span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

