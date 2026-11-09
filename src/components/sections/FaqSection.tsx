import { FAQ_ITEMS } from "@/config/faq";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FaqSection() {
  return (
    <section id="faq" className="section">
      <div className="container" style={{ maxWidth: "900px" }}>
        <SectionHeading
          eyebrow="Frequently Asked Questions"
          title="Clear Answers for Candidates, Parents & Sponsors"
          lead="Everything you need to know about eligibility, subjects, monthly plans, transfers, verification, and group onboarding."
          centered
        />
        <Accordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}

