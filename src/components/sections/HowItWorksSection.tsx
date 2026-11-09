import { HOW_IT_WORKS_STEPS, SCHEDULE_CONFIG } from "@/config/programme";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section section-surface-low">
      <div className="container">
        <SectionHeading
          eyebrow="Step-by-Step Onboarding"
          title="How Registration, Payment & Group Access Work"
          lead="A clear, verifiable five-step workflow designed so every student and parent knows what happens at each stage."
        />

        <div className={styles.gridThree}>
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article key={step.stepNumber} className={styles.cardElevatedWhite}>
              <span className={styles.cardNumberPillInk}>{step.stepNumber}</span>
              <h3 className={`type-title-large ${styles.cardTitle}`}>
                {step.title}
              </h3>
              <p className={`type-body-large ${styles.cardBody}`}>
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className={styles.noticeBox}>
          <p className="type-body-medium">
            <strong>Delivery channels &amp; timetable:</strong> Tutorials and
            mentorship activities take place via live online classes alongside
            official WhatsApp and Telegram groups.{" "}
            {SCHEDULE_CONFIG.timetableStatus}
          </p>
        </div>
      </div>
    </section>
  );
}

