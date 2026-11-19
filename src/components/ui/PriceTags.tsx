import { SCHEDULE_CONFIG } from "@/config/programme";
import { formatNaira } from "@/lib/validation";
import styles from "./PriceTags.module.css";

/**
 * Display-only pricing story: full value, current affordable price, and the
 * late registration / late payment penalty price. It does not change what the
 * backend charges.
 */
interface PriceTagsProps {
  /** "dark" sits on the green hero card; "light" sits on white sections. */
  tone?: "dark" | "light";
}

const { valueMonthlyFeeNgn, monthlyFeeNgn, lateMonthlyFeeNgn } = SCHEDULE_CONFIG;
const penaltyPerMonth = lateMonthlyFeeNgn - monthlyFeeNgn;

export function PriceTags({ tone = "light" }: PriceTagsProps) {
  return (
    <div className={`${styles.wrap} ${tone === "dark" ? styles.dark : styles.light}`}>
      <p className={styles.worth}>
        Worth <s>{formatNaira(valueMonthlyFeeNgn)}</s> per month
      </p>

      <p className={styles.nowRow}>
        <span className={styles.nowPrice}>{formatNaira(monthlyFeeNgn)}</span>
        <span className={styles.nowUnit}>/ month</span>
        <span className={styles.nowTag}>Affordable price now</span>
      </p>

      <div className={styles.lateBox}>
        <p className={styles.lateTitle}>
          <span className={styles.penaltyTag}>
            +{formatNaira(penaltyPerMonth)}/month penalty
          </span>
          Late registration or late payment
        </p>
        <p className={styles.lateText}>
          Price increases to <strong>{formatNaira(lateMonthlyFeeNgn)} per month</strong>.
          A 2-month plan becomes <strong>{formatNaira(lateMonthlyFeeNgn * 2)}</strong>{" "}
          instead of <s>{formatNaira(monthlyFeeNgn * 2)}</s>.
        </p>
      </div>
    </div>
  );
}
