/**
 * Typed Programme Content, Subject Rules & Contact Configuration
 * Strictly traceable to PRD v1.1 — no fabricated claims, scores, or unapproved contacts.
 */

import type {
  BankTransferDetails,
  ElectiveSubject,
  PlanOption,
} from "../types/registration.ts";
import { LAUNCH_GATES } from "./gates.ts";

export const BRAND_CONFIG = {
  organisationName: "AFOGRADE Tutorials & EduServices",
  shortName: "AFOGRADE",
  programmeName: "The 360+ Mentorship Series",
  campaignName: "The 5,000 Pacesetters Project",
  tagline: "Where Success Begins With Preparation.",
  copyrightNotice: "© 2026 AFOGRADE Tutorials & EduServices. All Rights Reserved.",
  targetCohortLabel: "2027 UTME Candidates",
  pacesettersTargetCount: "5,000",
  logoSrc: "/afograde%20favicon.jpeg",
  logoAlt: "AFOGRADE Tutorials & EduServices official logo",
  logoWidth: 1254,
  logoHeight: 1254,
  // Registration & Payment Verification Line (remains 09079255537)
  whatsappDisplay: "09079255537",
  whatsappInternationalDigits: "2349079255537",
  registrationWhatsAppDisplay: "09079255537",
  registrationWhatsAppDigits: "2349079255537",
  registrationCallHref: "tel:+2349079255537",
  // Complaints & Enquiries Line (08066402077)
  supportWhatsAppDisplay: "08066402077",
  supportWhatsAppDigits: "2348066402077",
  supportCallHref: "tel:+2348066402077",
  callHref: "tel:+2348066402077",
} as const;

/**
 * Approved Audience & Institutional Objectives (Updated with client brief & A3).
 */
export const OBJECTIVES_CONFIG = {
  programmePurpose:
    "The 360+ Mentorship Series is a structured, subscription-based UTME preparation and admission mentorship programme designed to equip 2027 Science, Art and Commercial UTME candidates with daily academic teaching, disciplined practice, and continuous guidance.",
  pacesettersExplanation:
    "Our goal is to raise 5,000 Pacesetters who are prepared, confident and ready to excel in the 2027 UTME.",
  whoIsItForIntro: "The 360+ Mentorship Series is designed for:",
  whoIsItForItems: [
    {
      id: "aud-utme-2027",
      highlight: "2027 UTME Candidates",
      detail: "seeking excellent examination performance.",
    },
    {
      id: "aud-streams",
      highlight: "Science, Art & Commercial Students preparing for UTME",
      detail:
        "taking Use of English plus any 3 of Mathematics, Biology, Chemistry, Physics, CRS/IRS, Literature in English, Economics, Government and Financial Accounting.",
    },
    {
      id: "aud-aspiring-uni",
      highlight: "Aspiring University Students",
      detail:
        "determined to secure admission into their preferred institutions.",
    },
    {
      id: "aud-serious-learners",
      highlight: "Serious-Minded Learners",
      detail:
        "willing to commit to consistent study, practice and academic improvement.",
    },
    {
      id: "aud-guidance",
      highlight: "Students Seeking Academic Guidance",
      detail:
        "who need structured preparation, mentorship and admission support.",
    },
  ],
  missionStatement: LAUNCH_GATES.brandAssetsAndCopy.approved
    ? ""
    : "To guide UTME candidates through structured academic preparation, disciplined practice, and mentorship rooted in clarity and integrity.",
  visionStatement: LAUNCH_GATES.brandAssetsAndCopy.approved
    ? ""
    : "To build a focused community of well-prepared candidates approaching the 2027 UTME and university admission process with confidence.",
  audienceScope:
    "Built specifically for determined 2027 Science, Art and Commercial UTME candidates, alongside parents and sponsors seeking structured academic mentorship.",
} as const;

export const COMPULSORY_SUBJECT = "Use of English" as const;

export const ELECTIVE_SUBJECTS: readonly ElectiveSubject[] = [
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "CRS/IRS",
  "Literature in English",
  "Economics",
  "Government",
  "Financial Accounting",
] as const;

/**
 * Display grouping only. Candidates may pick ANY 3 distinct subjects from
 * ELECTIVE_SUBJECTS; a subject listed under more than one stream counts once.
 */
export const SUBJECT_STREAMS: readonly {
  id: string;
  name: string;
  subjects: readonly ElectiveSubject[];
}[] = [
  {
    id: "science",
    name: "Science",
    subjects: ["Mathematics", "Biology", "Chemistry", "Physics"],
  },
  {
    id: "art",
    name: "Art",
    subjects: ["CRS/IRS", "Literature in English", "Government", "Economics"],
  },
  {
    id: "commercial",
    name: "Commercial",
    subjects: ["Mathematics", "Economics", "Government", "Financial Accounting"],
  },
] as const;

export const ALL_PROGRAMME_SUBJECTS = [
  COMPULSORY_SUBJECT,
  ...ELECTIVE_SUBJECTS,
] as const;

export const BENEFITS_LIST = [
  {
    id: "daily-tutorials",
    title: "4 Hours of Daily Academic Tutorials",
    description:
      "Consistent daily teaching covering high-yield 2027 UTME syllabus concepts step by step.",
  },
  {
    id: "daily-brainstorming",
    title: "1 Hour of Daily Brainstorming",
    description:
      "Dedicated active problem-solving and concept clarification sessions to deepen understanding.",
  },
  {
    id: "structured-learning",
    title: "3 Months of Structured Learning",
    description:
      "Progressive syllabus coverage across Cycles 1 to 3 so core topics are mastered methodically.",
  },
  {
    id: "intensive-revision",
    title: "2–4 Weeks of Intensive Revision",
    description:
      "Focused Cycle 4 consolidation, rapid topic recaps, and exam-readiness drills ahead of UTME.",
  },
  {
    id: "mock-speed-tests",
    title: "Monthly Mock Examinations and Speed Tests",
    description:
      "Timed full-standard assessments engineered to build accuracy, stamina, and speed.",
  },
  {
    id: "question-battles",
    title: "Daily WhatsApp Question Battles",
    description:
      "Fast-paced daily academic drills on WhatsApp that sharpen recall under time pressure.",
  },
  {
    id: "peer-study-groups",
    title: "Dedicated Peer Study Groups",
    description:
      "Structured collaborative groups keeping serious-minded candidates accountable every week.",
  },
  {
    id: "admission-mentorship",
    title: "Continuous Admission Mentorship",
    description:
      "Ongoing guidance on UTME strategy, institutional cut-offs, and university admission readiness.",
  },
  {
    id: "weekly-recognition",
    title: "Weekly Performance Recognition",
    description:
      "Consistent spotlighting of top-performing learners in weekly drills and assessments.",
  },
  {
    id: "learning-materials",
    title: "Access to AFOGRADE Learning Materials and Updates",
    description:
      "Curated study notes, practice compilations, and verified UTME/admission announcements.",
  },
  {
    id: "free-events",
    title: "Participation in Free AFOGRADE Events",
    description:
      "Priority participation in open academic seminars, orientation sessions, and workshops.",
  },
  {
    id: "ataa-community",
    title: "Membership of the ATAA Community",
    description:
      "Connection to AFOGRADE's broader academic network for sustained scholarly growth.",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    stepNumber: "01",
    title: "Complete Online Registration",
    description:
      "Choose an available monthly plan, enter your candidate details and UTME subjects, and receive your unique Registration ID (e.g., AFO-2027-00001).",
  },
  {
    stepNumber: "02",
    title: "Make Verified Bank Transfer",
    description:
      "Once your registration is recorded by the server, view the official Kuda Bank details, verify the account name, and transfer the exact plan amount.",
  },
  {
    stepNumber: "03",
    title: "Send Payment Screenshot on WhatsApp",
    description:
      "Tap Send Proof to open AFOGRADE's official WhatsApp chat with your Registration ID prefilled, then manually attach and send your transfer screenshot.",
  },
  {
    stepNumber: "04",
    title: "Independent Staff Verification",
    description:
      "AFOGRADE staff independently confirm your bank transfer in the official bank account and match it to your Registration ID.",
  },
  {
    stepNumber: "05",
    title: "Receive Group Access & Join Classes",
    description:
      "After verification, staff send your official WhatsApp and Telegram class group instructions so you can join live sessions.",
  },
] as const;

/**
 * Working dates & structure from PRD Sections 1, 7.6 & 22.
 * Flagged explicitly where P0 schedule confirmation remains open.
 */
export const SCHEDULE_CONFIG = {
  monthlyFeeNgn: 1500,
  /** Minimum plan length offered on the site (the 1-month plan was withdrawn). */
  minimumPlanMonths: 2,
  registrationDeadlineLabel: "Sunday, 22 November 2026 at 11:59 PM",
  timetableStatus: "Class timetable: To be announced prior to cycle kick-off.",
  workingRegistrationOpeningLabel: LAUNCH_GATES.registrationWindow.approved
    ? "9 November 2026"
    : "Target opening: 9 November 2026 (subject to final readiness confirmation)",
  workingProgrammePeriodLabel: "30 November 2026 – 31 March 2027",
  cyclesOverview: [
    {
      cycleNumber: 1,
      title: "Cycle 1 (Structured Month 1)",
      periodNotice: "Foundation syllabus coverage, daily tutorials & diagnostic speed drills",
    },
    {
      cycleNumber: 2,
      title: "Cycle 2 (Structured Month 2)",
      periodNotice: "Core topic mastery, daily brainstorming & monthly mock examination",
    },
    {
      cycleNumber: 3,
      title: "Cycle 3 (Structured Month 3)",
      periodNotice: "Advanced syllabus completion, daily WhatsApp question battles & speed tests",
    },
    {
      cycleNumber: 4,
      title: "Cycle 4 (Intensive Revision)",
      periodNotice: "2–4 weeks of intensive cross-topic revision, UTME simulations & admission mentorship",
    },
  ],
  cyclePricingRuleNotice:
    "Subscription fee is ₦1,500 per programme month across 2- to 4-month plans. Plan availability and covered cycles are determined automatically by the server date and approved cycle cutoff schedule (fixed cycle coverage; no mid-cycle proration unless explicitly announced).",
} as const;

/**
 * Plans shown on the site: hides anything shorter than the minimum plan length
 * (even if an older backend still returns it) and labels the 4-month plan.
 */
export function presentOfferedPlans(plans: readonly PlanOption[]): PlanOption[] {
  return plans
    .filter((plan) => plan.months >= SCHEDULE_CONFIG.minimumPlanMonths)
    .map((plan) =>
      plan.months === 4 ? { ...plan, badge: "Most Recommended" } : plan
    );
}

/**
 * Reference catalog of the 3 subscription tiers (2, 3 and 4 months) for the Pricing overview section.
 * Authoritative availability & exact amount during registration ALWAYS come from GET ?action=config.
 */
export const REFERENCE_PLANS_OVERVIEW: readonly PlanOption[] = [
  {
    id: "plan-2m",
    name: "2-Month Plan",
    months: 2,
    monthlyPriceNgn: 1500,
    totalAmountNgn: 3000,
    startCycleLabel: "Next eligible cycle",
    coveredCyclesLabel: "2 consecutive programme cycles",
    accessEndLabel: "End of 2nd covered cycle",
    available: true,
  },
  {
    id: "plan-3m",
    name: "3-Month Plan",
    months: 3,
    monthlyPriceNgn: 1500,
    totalAmountNgn: 4500,
    startCycleLabel: "Next eligible cycle",
    coveredCyclesLabel: "3 consecutive programme cycles",
    accessEndLabel: "End of 3rd covered cycle",
    available: true,
  },
  {
    id: "plan-4m",
    name: "4-Month Full Series Plan",
    months: 4,
    monthlyPriceNgn: 1500,
    totalAmountNgn: 6000,
    startCycleLabel: "Cycle 1",
    coveredCyclesLabel: "All 4 programme cycles",
    accessEndLabel: "End of Cycle 4",
    available: true,
    badge: "Most Recommended",
  },
] as const;

export const REWARDS_CONFIG = {
  provisionalDisclaimer:
    "Provisional Merit Recognition Notice: Final award eligibility, official UTME score verification procedures, minimum active participation requirements, tie-break criteria, and prize delivery terms will be published by AFOGRADE prior to assessment qualification.",
  awards: [
    {
      rank: "Top Performance Recognition",
      prize: "HP Elite Laptop",
      summary:
        "Awarded subject to verified 2027 UTME performance and approved programme participation criteria.",
    },
    {
      rank: "Second Tier Merit Recognition",
      prize: "Smartphone",
      summary:
        "Awarded subject to verified 2027 UTME score validation and official tie-break rules.",
    },
    {
      rank: "Third Tier Merit Recognition",
      prize: "₦50,000 Cash Grant",
      summary:
        "Awarded subject to verified programme completion and official score verification terms.",
    },
  ],
} as const;

/**
 * Nigerian 36 States + FCT (PRD Section 8 REG-05).
 * "Outside Nigeria" is appended dynamically ONLY if international eligibility is enabled.
 */
export const NIGERIAN_STATES_AND_FCT: readonly string[] = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

/**
 * SECURITY NOTE (PRD FR-20 & Section 12.1):
 * Bank account details are NEVER rendered on the public landing page prior to server-confirmed
 * registration. Furthermore, in production, `POST action=register` and `POST action=status`
 * return authoritative `bankDetails` from Google Apps Script; this fallback constant is only
 * used if a verified server response omits formatting fields, and is encoded as runtime char
 * codes so `3003920115` never appears in pre-registration static HTML markup.
 */
const ACCOUNT_NUMBER_CHAR_CODES = [51, 48, 48, 51, 57, 50, 48, 49, 49, 53] as const;

export function getVerifiedFallbackBankDetails(): BankTransferDetails {
  return {
    bankName: "Kuda Bank",
    accountName: "AFOGRADE TUTORIALS AND EDUSERVICES",
    accountNumber: String.fromCharCode(...ACCOUNT_NUMBER_CHAR_CODES),
  };
}
