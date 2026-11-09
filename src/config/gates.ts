/**
 * Explicit Launch Gate & Compliance Configuration (PRD Sections 22 & 24)
 *
 * IMPORTANT: Do not flip any gate to `approved: true` until AFOGRADE signs off on
 * the corresponding P0/P1 decision in PRD Section 22.
 */

export interface LaunchGateFlag {
  id: string;
  priority: "P0" | "P1";
  approved: boolean;
  decisionSummary: string;
}

export const LAUNCH_GATES = {
  programmeDatesAndCycles: {
    id: "GATE-P0-01",
    priority: "P0",
    approved: false,
    decisionSummary:
      "Confirm 1 March vs 31 March 2027 programme end date, four monthly cycle start/end dates, and cutoff/no-proration rules.",
  },
  registrationWindow: {
    id: "GATE-P0-03",
    priority: "P0",
    approved: false,
    decisionSummary:
      "Confirm official registration opening date (9 November 2026 or revised date) and closing date.",
  },
  commercialHosting: {
    id: "GATE-P0-04",
    priority: "P0",
    approved: false,
    decisionSummary:
      "Confirm Netlify commercial-use eligibility and monthly bandwidth/build allowances for campaign volume.",
  },
  privacyAndMinorsReview: {
    id: "GATE-P0-05",
    priority: "P0",
    approved: false,
    decisionSummary:
      "Complete NDPA legal review covering lawful basis, minors/parental-consent handling, retention period, and named privacy contact.",
  },
  refundPolicy: {
    id: "GATE-P1-01",
    priority: "P1",
    approved: false,
    decisionSummary:
      "Approve refund policy and exact public wording before displaying refund promises.",
  },
  internationalEligibility: {
    id: "GATE-P1-02",
    priority: "P1",
    approved: false,
    decisionSummary:
      "Confirm whether candidates outside Nigeria and international WhatsApp numbers are eligible.",
  },
  prizeRules: {
    id: "GATE-P1-03",
    priority: "P1",
    approved: false,
    decisionSummary:
      "Approve complete prize eligibility, UTME score verification, tie-break, and prize delivery terms.",
  },
  brandAssetsAndCopy: {
    id: "GATE-P1-04",
    priority: "P1",
    approved: false,
    decisionSummary:
      "Supply official vector/raster AFOGRADE logo, mission/vision statements, and signed-off section copy.",
  },
} as const satisfies Record<string, LaunchGateFlag>;

/**
 * Approved refund text is rendered ONLY when LAUNCH_GATES.refundPolicy.approved === true.
 */
export const REFUND_POLICY_CONFIG = {
  approvedWording: "",
  pendingFallbackNotice:
    "Please contact AFOGRADE via the official WhatsApp line before making a transfer if you have questions regarding fee terms or plan changes.",
} as const;

/**
 * Privacy Notice Version recorded alongside registrations (REG-09).
 * Update version identifier whenever the legal notice changes.
 */
export const PRIVACY_NOTICE_CONFIG = {
  version: "provisional-pending-ndpa-signoff-v0.1",
  controllerName: "AFOGRADE Tutorials & Eduservices",
  officialContactPhone: "09079255537",
  retentionPeriodLabel: "Pending final NDPA retention schedule sign-off by AFOGRADE",
  minorsGuidanceNotice:
    "Candidates under 18 years of age should review these programme details and complete registration and bank-transfer arrangements together with a parent or legal guardian.",
} as const;

