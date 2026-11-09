import type { RegistrationUiState } from "@/types/registration";
import styles from "./Registration.module.css";

interface StepIndicatorProps {
  uiState: RegistrationUiState;
}

/**
 * Three-Step Position Indicator (PRD Section 16.3):
 * Shows current workflow position ONLY; never implies payment verification or access granted.
 */
export function StepIndicator({ uiState }: StepIndicatorProps) {
  const activeStep = uiState === "payment" ? 2 : 1;

  const steps = [
    { num: 1, label: "Register Details" },
    { num: 2, label: "Bank Transfer" },
    { num: 3, label: "Send Proof on WhatsApp" },
  ] as const;

  return (
    <div className={styles.stepWrapper} aria-label="Registration workflow guide">
      <ol className={styles.stepList}>
        {steps.map((step) => {
          const isCurrent = step.num === activeStep;
          return (
            <li
              key={step.num}
              className={`${styles.stepItem} ${isCurrent ? styles.stepActive : ""}`.trim()}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className={styles.stepNum}>{step.num}</span>
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
      <p className={styles.stepNote}>
        Workflow guide only — bank transfers and class group access are verified
        manually by AFOGRADE staff after you send your payment screenshot.
      </p>
    </div>
  );
}

