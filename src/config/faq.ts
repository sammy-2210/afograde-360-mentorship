/**
 * Approved Frequently Asked Questions (PRD Section 7.13)
 * Every answer is strictly grounded in PRD-approved programme facts and gate flags.
 */

import { LAUNCH_GATES, REFUND_POLICY_CONFIG } from "./gates.ts";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "faq-eligibility",
    question: "Who is the AFOGRADE 360+ Mentorship Series for?",
    answer:
      "The programme is designed for determined 2027 Science UTME candidates preparing across Use of English, Mathematics, Biology, Chemistry, and Physics who want 4 hours of daily tutorials, 1 hour of daily brainstorming, regular mock speed tests, and continuous admission mentorship. Candidates under 18 should review and register with parent or guardian involvement.",
  },
  {
    id: "faq-pricing-plans",
    question: "How much does the mentorship cost and what plans are available?",
    answer:
      "The subscription rate is ₦1,500 per programme month. Depending on when you join and which programme cycles remain open on the server, you can select from available 1-month (₦1,500), 2-month (₦3,000), 3-month (₦4,500), or full 4-month (₦6,000) plans. Plans cover fixed programme cycles without mid-cycle proration.",
  },
  {
    id: "faq-subjects",
    question: "Which UTME subjects are covered and how many must I select?",
    answer:
      "Tutorials and practice materials cover Science UTME combinations: Use of English (included automatically for every candidate) plus 3 distinct subjects selected from Mathematics, Biology, Chemistry, and Physics during registration.",
  },
  {
    id: "faq-payment-process",
    question: "Why can't I see the bank account number before filling the registration form?",
    answer:
      "To ensure every bank transfer can be matched accurately to a student record, you must submit the registration form first. Once the server confirms your registration, you receive a unique Registration ID (e.g., AFO-2027-00001) along with the official Kuda Bank transfer instructions.",
  },
  {
    id: "faq-third-party-payer",
    question: "Can my parent, guardian, or sponsor pay from their own bank account?",
    answer:
      "Yes. A parent, guardian, or sponsor can transfer the fee from their own bank account. Please include your unique Registration ID in the bank transfer narration if possible, and send the payment confirmation screenshot via the Send Proof WhatsApp button so our team can match the transaction to your Registration ID.",
  },
  {
    id: "faq-proof-and-access",
    question: "Do I get instant group access as soon as I submit the form or click Send Proof?",
    answer:
      "No. Submitting the form records your registration as Pending, and clicking Send Proof opens WhatsApp so you can manually attach and send your transfer receipt. AFOGRADE staff independently verify every transfer in the official bank app before sending your WhatsApp and Telegram class access instructions.",
  },
  {
    id: "faq-30min-expiry",
    question: "What happens if my 30-minute payment screen session expires or I reload my browser?",
    answer:
      "Your registration is NOT cancelled. The 30-minute timer only controls how long the payment instructions automatically stay open on your current browser. Your Registration ID remains saved on our server, and you can restore your payment instructions using the recovery option or contact AFOGRADE on WhatsApp with your Registration ID.",
  },
  {
    id: "faq-timetable-delivery",
    question: "How are classes delivered and when will the timetable be shared?",
    answer:
      "Classes, practice drills, and mentorship updates are delivered online through live tutorial sessions and official WhatsApp and Telegram study groups. The detailed weekly class timetable will be announced to verified participants ahead of cycle commencement.",
  },
  {
    id: "faq-refund-policy",
    question: "What is the refund or plan-change policy?",
    answer: LAUNCH_GATES.refundPolicy.approved
      ? REFUND_POLICY_CONFIG.approvedWording
      : REFUND_POLICY_CONFIG.pendingFallbackNotice,
  },
  {
    id: "faq-prizes",
    question: "How do candidates qualify for the HP Elite Laptop, Smartphone, and cash awards?",
    answer:
      "Merit awards—including an HP Elite Laptop, a Smartphone, and a ₦50,000 cash grant—are subject to AFOGRADE's official qualification rules, active programme participation, independent verification of official 2027 UTME scores, and tie-break procedures published for registered participants.",
  },
] as const;
