"use client";

import {
  presentOfferedPlans,
  REFERENCE_PLANS_OVERVIEW,
  SCHEDULE_CONFIG,
} from "@/config/programme";
import { navigateToRegistrationForm } from "@/lib/navigation";
import { formatNaira } from "@/lib/validation";
import type { PlanOption, ServerConfigPayload } from "@/types/registration";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

interface PlansSectionProps {
  serverConfig: ServerConfigPayload | null;
  onSelectPlan: (planId: string) => void;
}

export function PlansSection({ serverConfig, onSelectPlan }: PlansSectionProps) {
  const liveOfferedPlans = serverConfig
    ? presentOfferedPlans(serverConfig.plans)
    : [];
  const isLiveServerPlans = liveOfferedPlans.length > 0;
  const plansToDisplay: readonly PlanOption[] = isLiveServerPlans
    ? liveOfferedPlans
    : REFERENCE_PLANS_OVERVIEW;

  const canSelectLivePlan =
    serverConfig?.registrationState === "OPEN" && isLiveServerPlans;

  return (
    <section id="plans" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Plans & Pricing"
          title="Simple, Affordable Monthly Mentorship Plans"
          lead={`Every plan is priced at ${formatNaira(
            SCHEDULE_CONFIG.monthlyFeeNgn
          )} per programme month, with plans from 2 to 4 months. Registration closes ${
            SCHEDULE_CONFIG.registrationDeadlineLabel
          }.`}
          centered
        />

        <div className={styles.gridPlans}>
          {plansToDisplay.map((plan) => {
            const isFeatured = plan.months === 4;
            const unavailable = isLiveServerPlans && !plan.available;

            return (
              <article
                key={plan.id}
                className={`${styles.planCard} ${
                  isFeatured ? styles.planCardFeatured : ""
                } ${unavailable ? styles.planCardUnavailable : ""}`.trim()}
              >
                <div>
                  {plan.badge ? (
                    <div style={{ marginBottom: "12px" }}>
                      <Badge variant="brand">{plan.badge}</Badge>
                    </div>
                  ) : null}
                  <h3 className={`type-title-large ${styles.cardTitle}`}>
                    {plan.name}
                  </h3>
                  <p className={styles.planPriceLarge} style={{ marginTop: "12px" }}>
                    {formatNaira(plan.totalAmountNgn)}
                  </p>
                  <p
                    className="type-body-small"
                    style={{ color: "var(--afograde-ink-muted)", fontWeight: 500 }}
                  >
                    {formatNaira(plan.monthlyPriceNgn)} per programme month
                  </p>

                  <ul className={styles.planMetaList}>
                    <li>
                      <strong>Coverage:</strong> {plan.coveredCyclesLabel}
                    </li>
                    <li>
                      <strong>Starts:</strong> {plan.startCycleLabel}
                    </li>
                    <li>
                      <strong>Access ends:</strong> {plan.accessEndLabel}
                    </li>
                  </ul>
                </div>

                <Button
                  variant={isFeatured ? "primary" : "outline"}
                  fullWidth
                  disabled={unavailable}
                  onClick={() => {
                    if (canSelectLivePlan && plan.available) {
                      onSelectPlan(plan.id);
                    }
                    navigateToRegistrationForm(`plan_card_${plan.id}`);
                  }}
                >
                  {unavailable
                    ? "Cycle Cutoff Passed"
                    : canSelectLivePlan
                      ? `Choose ${plan.months}-Month Plan`
                      : "Register Now"}
                </Button>
              </article>
            );
          })}
        </div>

        <div className={styles.noticeBox}>
          <p className="type-body-medium">
            <strong>Cycle coverage &amp; pricing rule:</strong>{" "}
            {SCHEDULE_CONFIG.cyclePricingRuleNotice}
            {!isLiveServerPlans
              ? " Live plan availability and exact cycle dates are confirmed dynamically when online registration opens."
              : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

