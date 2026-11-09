import { BRAND_CONFIG } from "@/config/programme";
import { ShieldCheckIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

export function CredibilitySection() {
  const pillars = [
    {
      title: "Unique, Never-Reused Registration IDs",
      body: "Every confirmed registration generates a permanent server-assigned ID (such as AFO-2027-00001) so your transfer and student record can be matched accurately.",
    },
    {
      title: "Independent Bank-App Verification",
      body: "AFOGRADE staff verify every transaction directly in the official bank account—not from screenshots alone—before updating payment status or granting group access.",
    },
    {
      title: "Parent & Sponsor Friendly Transfers",
      body: "Parents, guardians, or relatives can transfer fees from their own bank accounts. Simply include the candidate's Registration ID in the narration and send the receipt on WhatsApp.",
    },
    {
      title: "Strict Anti-Impersonation Safeguards",
      body: `Bank details are shown only after server-confirmed registration, and all official support happens exclusively through ${BRAND_CONFIG.whatsappDisplay}. We never ask for PINs, passwords, or OTPs.`,
    },
  ] as const;

  return (
    <section id="transparency" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Credibility & Safeguards"
          title="Transparent Records & Safe Verification for Students and Parents"
          lead="Designed so families know exactly where registration details go, how transfers are verified, and how to recognise official AFOGRADE communication."
        />

        <div className={styles.gridTwo}>
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className={`${styles.cardElevatedWhite} ${styles.cardLeftAccent}`}
            >
              <div className={styles.shieldIconBadge}>
                <ShieldCheckIcon width={26} height={26} />
              </div>
              <h3 className={`type-title-large ${styles.cardTitle}`}>
                {pillar.title}
              </h3>
              <p className={`type-body-large ${styles.cardBody}`}>
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

