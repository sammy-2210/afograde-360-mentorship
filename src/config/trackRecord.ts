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
export const DEFAULT_PAST_UTME_SCORES: readonly PastUtmeScoreItem[] = [];

/**
 * Part B: Verified Pacesetter Scholars & Testimonials.
 * Non-technical staff can add student photos, scores, universities, and courses directly
 * in the Google Sheet `Testimonials` tab without rebuilding the website.
 */
export const DEFAULT_STUDENT_TESTIMONIALS: readonly StudentTestimonialItem[] = [
  {
    id: "static-2025-ogunjimi-omodesire",
    displayName: "Ogunjimi Omodesire Daniella",
    examYear: "2025",
    score: 289,
    photoUrl: "/images/testimonials/ogunjimi.jpg",
    // Replaces the older "Desire" row from the Google Sheet.
    replacesSheetNames: ["Desire"],
    reviewText:
      "289 in JAMB is a score I never imagined myself having because during JAMB preparation classes I only had scores between 220-230+ and my teacher would always say that our real JAMB score was going to be an addition or subtraction of five from our JAMB preparation class. Anytime I heard that, it would always bring tears to my face, but then I met AFOGRADE Tutorials which changed my story completely. At AFOGRADE we had classes every day and the tutors were so nice and calm with us. We were given SOFTC (Speed of Focus and Thought Classes), also known as survival of the fittest classes, we had monthly mock exams and brainstorming sessions every day from 5pm to 7:30pm. The consistency amongst the tutors was really impressive and that was the major boost for me. THANK YOU AFOGRADE TUTORIAL.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "static-2026-nwogbo-obianuju",
    displayName: "Nwogbo Obianuju Elizabeth",
    examYear: "2026",
    score: 341,
    subjectScores: [
      { subject: "ENG", score: 72 },
      { subject: "PHY", score: 95 },
      { subject: "BIO", score: 78 },
      { subject: "CHE", score: 96 },
    ],
    feedbackScreenshotUrl: "/images/testimonials/nwogbo-result.jpg",
    consentVerified: true,
    approved: true,
  },
  {
    id: "static-2026-lawal-abdullahi",
    displayName: "Lawal Abdullahi Adeiyanu",
    examYear: "2026",
    score: 315,
    subjectScores: [
      { subject: "ENG", score: 62 },
      { subject: "PHY", score: 92 },
      { subject: "BIO", score: 74 },
      { subject: "CHE", score: 87 },
    ],
    photoUrl: "/images/testimonials/lawal.jpg",
    reviewText:
      "Joining AFOGRADE Tutorials and EduConsult was one of the best decisions I made during my UTME preparation. At first, I was worried about getting the score I needed, but the classes, guidance, and support I received made the journey much easier. The tutors were patient, encouraging, and always ready to explain difficult topics until I understood them. The study materials, practice questions, and constant assessments helped me improve my confidence and performance. I'm grateful to say that I scored 315 in my UTME, and I honestly believe AFOGRADE played a major role in helping me achieve this. It wasn't just about passing exams; I actually understood what I was learning. Thank you AFOGRADE Tutorials and EduConsult for the impact, support, and dedication. I highly recommend it to any student who wants proper guidance and excellent results.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "static-2026-ogunwuyi-joseph",
    displayName: "Ogunwuyi Joseph Olumide",
    examYear: "2026",
    score: 310,
    course: "Medicine and Surgery (aspiring)",
    university: "University of Ilorin",
    subjectScores: [
      { subject: "ENG", score: 62 },
      { subject: "PHY", score: 86 },
      { subject: "BIO", score: 75 },
      { subject: "CHE", score: 87 },
    ],
    photoUrl: "/images/testimonials/joseph.jpg",
    reviewText:
      "My name is Joseph Olumide, an aspirant for Medicine and Surgery at the University of Ilorin. I scored 310 in my JAMB exam, and I give all glory to God first, and then to AFOGRADE Tutorials Center for how instrumental they were in this success. Before I joined AFOGRADE, I was studying hard but without direction. The moment I enrolled, everything changed. Their tutors broke down difficult topics, gave us exam-focused practice, and trained us on time management, which is what made the difference in the JAMB hall. AFOGRADE didn't just teach us JAMB. They built our confidence. They pushed us, corrected us, and believed in us even when we doubted ourselves. If you're aiming for a high score like 280, 300, or above, especially for competitive courses like Medicine, AFOGRADE Tutorials is the place to be. They're not just a tutorial center, they're a family that's committed to your success. Thank you AFOGRADE. You were a huge part of my 310.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "static-2026-oyeniyi-precious",
    displayName: "Oyeniyi Precious Esther",
    examYear: "2026",
    score: 308,
    subjectScores: [
      { subject: "ENG", score: 69 },
      { subject: "PHY", score: 81 },
      { subject: "BIO", score: 69 },
      { subject: "CHE", score: 89 },
    ],
    photoUrl: "/images/testimonials/oyeniyi.jpg",
    reviewText:
      "My UTME preparation journey with AFOGRADE was highly beneficial. The tutors explained concepts clearly and made learning easier to understand. Despite the relatively small amount paid, they consistently delivered their best and were always willing to provide support for improvement. AFOGRADE personally took her time to always mentor and encourage us and this really helped me a lot while I was preparing for my exam. I am sincerely grateful to all the teachers for their patience, encouragement, and guidance throughout the journey. I sincerely appreciate AFOGRADE for being part of my academic journey. My 308 journey is never complete without AFOGRADE.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "static-2026-ope-haliyah",
    displayName: "Ope Haliyah Oyindamola",
    examYear: "2026",
    score: 296,
    subjectScores: [
      { subject: "ENG", score: 62 },
      { subject: "PHY", score: 81 },
      { subject: "BIO", score: 69 },
      { subject: "CHE", score: 84 },
    ],
    feedbackScreenshotUrl: "/images/testimonials/ope-result.jpg",
    consentVerified: true,
    approved: true,
  },
  {
    id: "static-2026-ibrahim-abdulrahman",
    displayName: "Ibrahim AbdulRahman",
    examYear: "2026",
    score: 261,
    subjectScores: [
      { subject: "ENG", score: 90 },
      { subject: "PHY", score: 74 },
      { subject: "BIO", score: 56 },
      { subject: "CHE", score: 41 },
    ],
    reviewText:
      "My experience with AFOGRADE Tutorials was excellent. Your classes, mentorship, and discipline greatly improved my academic performance and boosted my confidence. With your guidance, I scored 90 in English and 74 in Physics. I believe I could have achieved even more if not for the technical issue I had with my computer during the exam. I'm truly grateful for the support and quality teaching you provided.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "static-2026-moshood-jamolat",
    displayName: "Moshood Jamolat Opeyemi",
    examYear: "2026",
    score: 254,
    subjectScores: [
      { subject: "ENG", score: 59 },
      { subject: "PHY", score: 67 },
      { subject: "BIO", score: 57 },
      { subject: "CHE", score: 71 },
    ],
    photoUrl: "/images/testimonials/moshood.jpg",
    reviewText:
      "I am truly grateful to the AFOGRADE Tutorial Team. The lessons, guidance, and words of encouragement I received during my JAMB preparation played a major role in my success. The tutors were dedicated and committed to ensuring that we understood every topic thoroughly. The study materials, audio recordings, and videos provided made learning easier and more effective. Despite their busy schedules, they consistently supported and encouraged us throughout the journey. Thank you AFOGRADE, for your dedication, patience, and unwavering support. I am immensely grateful for everything you did to help me achieve success. May Allah continue to bless and reward the entire team abundantly.",
    consentVerified: true,
    approved: true,
  },
  {
    id: "static-2026-odia-favour",
    displayName: "Odia Favour Ebubechukwu",
    examYear: "2026",
    score: 252,
    subjectScores: [
      { subject: "ENG", score: 54 },
      { subject: "PHY", score: 76 },
      { subject: "BIO", score: 65 },
      { subject: "CHE", score: 57 },
    ],
    photoUrl: "/images/testimonials/odia.jpg",
    reviewText:
      "When I joined AFOGRADE's tutorial, I was looking for where to improve myself academically in order to ace my UTME exam but I got more than that. The materials shared here are very helpful, well-arranged, and easy to understand. One thing I really appreciate is the motivation from the tutors and members. Whenever I feel tired or discouraged, the encouragement here reminds me to stay focused on my goal. I would also like to specially appreciate Hydrogen, our Physics tutor; his explanations are simple, detailed, and easy to understand. He takes time to break down difficult topics and calculations, making them less challenging and helping me build confidence in the subject. My sincere appreciation also goes to Miss Afograde, our Biology tutor. Her teaching style is engaging and easy to follow. She explains concepts clearly and helps us understand topics using diagrams and her detailed notes instead of just memorizing or rather cramming. Her lessons have greatly improved my understanding of Biology. I'll never forget her favorite word \"Lock in\" when she's encouraging us to be serious with studies. Another thing I enjoyed in AFOGRADE is the brainstorming sessions and past question challenge; these activities expose us to different ways of thinking, help us test our knowledge and keep me on track. Thank you AFOGRADE.",
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

  // Sheet-managed testimonials (e.g. Desire) show first, followed by the
  // testimonials kept in this file. A name present in both is shown once.
  const replacedSheetNames = new Set(
    DEFAULT_STUDENT_TESTIMONIALS.flatMap((t) => t.replacesSheetNames ?? []).map(
      (n) => n.trim().toLowerCase()
    )
  );
  const serverTestimonials = (serverTrackRecord?.testimonials ?? []).filter(
    (t) => !replacedSheetNames.has(t.displayName.trim().toLowerCase())
  );
  const seenNames = new Set(
    serverTestimonials.map((t) => t.displayName.trim().toLowerCase())
  );
  const sourceTestimonials = [
    ...serverTestimonials,
    ...DEFAULT_STUDENT_TESTIMONIALS.filter(
      (t) => !seenNames.has(t.displayName.trim().toLowerCase())
    ),
  ];

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

