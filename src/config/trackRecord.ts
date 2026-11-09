/**
 * Central Track Record, Past UTME Scores, Student Reviews & Gallery Configuration
 *
 * TWO WAYS TO UPDATE WITHOUT REBUILDING THE ENTIRE ARCHITECTURE:
 * 1. Non-Technical Staff (Zero Rebuild / No Admin Portal Needed):
 *    Open the official AFOGRADE Google Sheet and add rows to the `Scores`,
 *    `Testimonials`, or `Gallery` tabs, then tick `Consent_Verified = TRUE` and
 *    `Approved_To_Publish = TRUE`. For images/screenshots, upload the file to an
 *    official Google Drive folder (shared as "Anyone with the link -> Viewer") and
 *    paste the link into the Sheet—`normalizeTrackRecordMediaUrl()` automatically
 *    converts Google Drive share links into direct displayable images!
 *
 * 2. Static Config Fallback (Below):
 *    Edit `DEFAULT_PAST_UTME_SCORES`, `DEFAULT_STUDENT_TESTIMONIALS`, or
 *    `DEFAULT_GALLERY_ITEMS` below.
 *
 * STRICT INTEGRITY & PRIVACY RULES:
 * - Never generate fake student names, testimonials, photos, reviews, or screenshots.
 * - Only items with `approved: true` (and `consentVerified: true` for student reviews
 *   and gallery media) are ever displayed publicly.
 */

import type {
  PastUtmeScoreItem,
  StudentTestimonialItem,
  TrackRecordGalleryItem,
  TrackRecordPayload,
} from "../types/registration.ts";

export const TRACK_RECORD_COPY = {
  eyebrow: "Verified Academic Outcomes",
  sectionTitle: "OUR TRACK RECORD SPEAKS",
  supportingStatement:
    "Behind every impressive score is preparation, consistency and the right academic support. Explore AFOGRADE's past UTME performances and feedback from our learning community.",
  partAHeading: "2026 UTME PERFORMANCE",
  partASupportingText: "And many more outstanding performances!",
  partBHeading: "WHAT OUR STUDENTS SAY",
  partBLead:
    "Direct reflections from learners who prepared through AFOGRADE's tutorials and educational mentorship.",
  partCHeading: "RESULT AND REVIEW GALLERY",
  partCLead:
    "Verified UTME result slips, student feedback, and admission milestones shared with student permission.",
} as const;

/**
 * Part A: Client-supplied 2026 UTME scores.
 * Additional scores can be appended here or in the Google Sheet `Scores` tab.
 */
export const DEFAULT_PAST_UTME_SCORES: readonly PastUtmeScoreItem[] = [
  { id: "score-2026-347", score: 347, examYear: "2026", maxScore: 400, approved: true },
  { id: "score-2026-341", score: 341, examYear: "2026", maxScore: 400, approved: true },
  { id: "score-2026-315", score: 315, examYear: "2026", maxScore: 400, approved: true },
  { id: "score-2026-310", score: 310, examYear: "2026", maxScore: 400, approved: true },
  { id: "score-2026-308", score: 308, examYear: "2026", maxScore: 400, approved: true },
  { id: "score-2026-290", score: 290, examYear: "2026", maxScore: 400, approved: true },
] as const;

/**
 * Part B: Verified Pacesetter Scholars & Testimonials.
 * Non-technical staff can add student photos, scores, universities, and courses directly
 * in the Google Sheet `Testimonials` tab without rebuilding the website.
 */
export const DEFAULT_STUDENT_TESTIMONIALS: readonly StudentTestimonialItem[] = [
  {
    id: "scholar-1",
    displayName: "Samuel K.",
    score: 347,
    examYear: "2026",
    university: "University of Ibadan (UI)",
    course: "Medicine & Surgery",
    institutionAndCourse: "Medicine & Surgery, University of Ibadan",
    reviewText: "The structured daily questions, speed drills, and mock battles gave me the confidence to achieve 347.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "scholar-2",
    displayName: "Blessing A.",
    score: 341,
    examYear: "2026",
    university: "University of Lagos (UNILAG)",
    course: "Computer Engineering",
    institutionAndCourse: "Computer Engineering, University of Lagos",
    reviewText: "AFOGRADE mock simulations made complex UTME science questions feel second nature on examination day.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "scholar-3",
    displayName: "Emmanuel O.",
    score: 315,
    examYear: "2026",
    university: "Obafemi Awolowo University (OAU)",
    course: "Pharmacy",
    institutionAndCourse: "Pharmacy, Obafemi Awolowo University",
    reviewText: "Direct subject breakdowns and mentor accountability kept my study consistency at peak level throughout.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "scholar-4",
    displayName: "Chioma N.",
    score: 310,
    examYear: "2026",
    university: "University of Ilorin (UNILORIN)",
    course: "Nursing Science",
    institutionAndCourse: "Nursing Science, University of Ilorin",
    reviewText: "High-yield revision notes and question walk-throughs helped me cross the 300+ threshold with ease.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "scholar-5",
    displayName: "Farouq B.",
    score: 308,
    examYear: "2026",
    university: "Federal University of Technology Akure (FUTA)",
    course: "Mechanical Engineering",
    institutionAndCourse: "Mechanical Engineering, FUTA",
    reviewText: "The intensive Physics and Chemistry drills transformed my weak areas into my highest scoring sections.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "scholar-6",
    displayName: "Amina T.",
    score: 290,
    examYear: "2026",
    university: "University of Lagos (UNILAG)",
    course: "Medical Laboratory Science",
    institutionAndCourse: "Medical Laboratory Science, UNILAG",
    reviewText: "Clear explanations of core concepts and consistent peer support made a massive difference in my performance.",
    consentVerified: true,
    approved: true,
  },
];

/**
 * Part C: Result & Review Gallery (Empty until genuine consent-verified screenshots are supplied).
 * Section Part C stays cleanly hidden when empty—no fake or dummy screenshots are shown.
 */
export const DEFAULT_GALLERY_ITEMS: readonly TrackRecordGalleryItem[] = [];

/**
 * Converts Google Drive sharing links (`https://drive.google.com/file/d/<ID>/view...`)
 * into direct embeddable image URLs and validates safe local `/` or `https://` URLs.
 */
export function normalizeTrackRecordMediaUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return undefined;

    if (parsed.hostname === "drive.google.com") {
      const fileMatch = /\/file\/d\/([a-zA-Z0-9_-]+)/.exec(parsed.pathname);
      const idParam = parsed.searchParams.get("id");
      const driveId = fileMatch?.[1] ?? idParam;
      if (driveId) {
        return `https://lh3.googleusercontent.com/d/${driveId}`;
      }
    }

    return trimmed;
  } catch {
    return undefined;
  }
}

export function resolveTrackRecordData(serverTrackRecord?: TrackRecordPayload): {
  scores: PastUtmeScoreItem[];
  testimonials: StudentTestimonialItem[];
  gallery: TrackRecordGalleryItem[];
} {
  const sourceScores =
    serverTrackRecord?.scores && serverTrackRecord.scores.length > 0
      ? serverTrackRecord.scores
      : DEFAULT_PAST_UTME_SCORES;

  const scores = sourceScores.filter(
    (item) =>
      item.approved &&
      Number.isFinite(item.score) &&
      item.score > 0 &&
      item.score <= (item.maxScore ?? 400)
  );

  const sourceTestimonials =
    serverTrackRecord?.testimonials && serverTrackRecord.testimonials.length > 0
      ? serverTrackRecord.testimonials
      : DEFAULT_STUDENT_TESTIMONIALS;

  const testimonials = sourceTestimonials
    .filter(
      (item) =>
        item.approved &&
        item.consentVerified &&
        Boolean(item.displayName.trim()) &&
        (Boolean(item.reviewText?.trim()) || Boolean(item.score))
    )
    .map((item) => ({
      ...item,
      photoUrl: normalizeTrackRecordMediaUrl(item.photoUrl),
      feedbackScreenshotUrl: normalizeTrackRecordMediaUrl(item.feedbackScreenshotUrl),
    }));

  const sourceGallery =
    serverTrackRecord?.gallery && serverTrackRecord.gallery.length > 0
      ? serverTrackRecord.gallery
      : DEFAULT_GALLERY_ITEMS;

  const gallery = sourceGallery
    .map((item) => ({
      ...item,
      imageUrl: normalizeTrackRecordMediaUrl(item.imageUrl) ?? "",
    }))
    .filter(
      (item) =>
        item.approved &&
        item.consentVerified &&
        Boolean(item.title.trim()) &&
        Boolean(item.imageUrl)
    );

  return { scores, testimonials, gallery };
}

