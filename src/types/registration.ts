/**
 * Strict Domain & Integration Types — AFOGRADE 360+ Mentorship Series
 * Matches PRD v1.1 Sections 6, 8, 9, 10, 11, 12, 13 & 14.
 */

export type ServerRegistrationStatus = "NOT_OPEN" | "OPEN" | "PAUSED" | "CLOSED";

export type RegistrationUiState =
  | "loading"
  | "config_error"
  | "not_open"
  | "paused"
  | "closed"
  | "form"
  | "validation_error"
  | "submitting"
  | "duplicate_confirmation"
  | "ambiguous_timeout"
  | "recovery"
  | "payment"
  | "expired_session";

export type ElectiveSubject = "Mathematics" | "Biology" | "Chemistry" | "Physics";

export interface PastUtmeScoreItem {
  id: string;
  score: number;
  examYear: string;
  maxScore?: number;
  note?: string;
  approved: boolean;
}

export interface StudentTestimonialItem {
  id: string;
  displayName: string;
  photoUrl?: string;
  institutionAndCourse?: string;
  reviewText: string;
  feedbackScreenshotUrl?: string;
  consentVerified: boolean;
  approved: boolean;
}

export type GalleryCategory =
  | "UTME Result"
  | "Student Testimonial"
  | "WhatsApp Feedback"
  | "Admission Success"
  | "Achievement";

export interface TrackRecordGalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  caption?: string;
  consentVerified: boolean;
  approved: boolean;
}

export interface TrackRecordPayload {
  scores?: PastUtmeScoreItem[];
  testimonials?: StudentTestimonialItem[];
  gallery?: TrackRecordGalleryItem[];
}

export type SocialPlatformKey =
  | "facebookPage"
  | "facebookCommunity"
  | "instagram"
  | "whatsapp"
  | "whatsappChannel"
  | "whatsappChannel2"
  | "tiktok"
  | "telegram"
  | "xTwitter"
  | "other";

export type SocialLinksOverrideMap = Partial<Record<SocialPlatformKey, string>>;

export interface PlanOption {
  id: string;
  name: string;
  months: 1 | 2 | 3 | 4;
  monthlyPriceNgn: number;
  totalAmountNgn: number;
  startCycleLabel: string;
  coveredCyclesLabel: string;
  accessEndLabel: string;
  available: boolean;
  badge?: string;
}

export interface ServerConfigPayload {
  configVersion: string;
  serverTimeIso: string;
  registrationState: ServerRegistrationStatus;
  stateMessage?: string;
  openingDateLabel?: string;
  closingDateLabel?: string;
  programmePeriodLabel?: string;
  allowInternationalCandidates?: boolean;
  plans: PlanOption[];
  trackRecord?: TrackRecordPayload;
  socialLinks?: SocialLinksOverrideMap;
}

export interface UtmParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
}

export interface RegistrationFormValues {
  fullName: string;
  whatsappNumber: string;
  telegramUsername: string;
  email: string;
  stateOfResidence: string;
  schoolName: string;
  electiveSubjects: ElectiveSubject[];
  planId: string;
  privacyAcknowledged: boolean;
  honeypot: string;
  turnstileToken: string;
}

export type RegistrationFieldName =
  | "fullName"
  | "whatsappNumber"
  | "telegramUsername"
  | "email"
  | "stateOfResidence"
  | "schoolName"
  | "electiveSubjects"
  | "planId"
  | "privacyAcknowledged"
  | "turnstileToken";

export type FieldValidationErrors = Partial<Record<RegistrationFieldName, string>>;

export interface RegisterRequestPayload {
  action: "register";
  submissionKey: string;
  payloadHash: string;
  confirmDuplicateRecent: boolean;
  privacyNoticeVersion: string;
  turnstileToken: string;
  honeypot: string;
  student: {
    fullName: string;
    whatsappCanonical: string;
    telegramUsername: string;
    email: string;
    stateOfResidence: string;
    schoolName: string;
    subjectsLabel: string;
    planId: string;
  };
  utm: UtmParams;
}

export interface StatusRequestPayload {
  action: "status";
  registrationId?: string;
  submissionKey?: string;
  recoveryToken?: string;
}

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface ConfirmedRegistration {
  registrationId: string;
  firstName: string;
  planId: string;
  planName: string;
  months: number;
  coveredCyclesLabel: string;
  accessEndLabel: string;
  expectedAmountNgn: number;
  recordedAtLagos: string;
  recoveryToken?: string;
  bankDetails: BankTransferDetails;
}

export type ApiErrorCode =
  | "VALIDATION"
  | "NOT_OPEN"
  | "CLOSED"
  | "PAUSED"
  | "PLAN_UNAVAILABLE"
  | "TURNSTILE_FAILED"
  | "RATE_LIMITED"
  | "DUPLICATE_RECENT"
  | "BUSY"
  | "CONFIG_INVALID"
  | "SERVER_ERROR"
  | "UNKNOWN"
  | "RECOVERY_NOT_FOUND";

export type ConfigResult =
  | { ok: true; data: ServerConfigPayload }
  | { ok: false; code: ApiErrorCode; message: string };

export type RegisterResult =
  | { ok: true; data: ConfirmedRegistration; idempotentReplay?: boolean }
  | {
      ok: false;
      code: ApiErrorCode;
      message: string;
      fieldErrors?: FieldValidationErrors;
    };

export type StatusResult =
  | { ok: true; data: ConfirmedRegistration }
  | { ok: false; code: ApiErrorCode; message: string };

/**
 * Minimal browser persistence model (PRD Section 13):
 * Stores NO phone, email, school, or bank account numbers.
 */
export interface PersistedPaymentSession {
  registrationId: string;
  recoveryToken: string;
  firstName: string;
  planId: string;
  createdAtMs: number;
  expiresAtMs: number;
}

export interface PersistedAttemptKey {
  submissionKey: string;
  payloadHash: string;
  createdAtMs: number;
}

export interface RetainedRegistrationReference {
  registrationId: string;
  recoveryToken?: string;
  recordedAtIso: string;
}

export type WhatsAppIntent =
  | "general_enquiry"
  | "registration_help"
  | "payment_proof"
  | "session_recovery";

export type AnalyticsEventName =
  | "register_cta_clicked"
  | "registration_form_opened"
  | "plan_selected"
  | "registration_submit_attempted"
  | "registration_recorded"
  | "registration_failed"
  | "payment_instructions_displayed"
  | "send_proof_clicked"
  | "whatsapp_cta_clicked"
  | "payment_cancelled"
  | "registration_session_expired"
  | "faq_opened";

