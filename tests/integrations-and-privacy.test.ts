import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeAnalyticsParams } from "../src/lib/analytics.ts";
import { fetchServerConfig, submitRegistration } from "../src/lib/api.ts";
import { createEmptyUtm, mergeFirstTouchUtm } from "../src/lib/utm.ts";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "../src/lib/whatsapp.ts";

describe("WhatsApp Deep Links, UTM First-Touch Capture, Analytics PII Blocking & Missing Env Fail-Closed", () => {
  it("constructs official WhatsApp links with minimal context and zero personal data", () => {
    const url = buildWhatsAppUrl({
      intent: "payment_proof",
      registrationId: "AFO-2027-00009",
      planName: "2-Month Plan",
      expectedAmountNgn: 3000,
    });

    assert.ok(url.startsWith("https://wa.me/2349079255537?text="));
    const msg = buildWhatsAppMessage({
      intent: "payment_proof",
      registrationId: "AFO-2027-00009",
      planName: "2-Month Plan",
      expectedAmountNgn: 3000,
    });
    assert.match(msg, /AFO-2027-00009/);
    assert.match(msg, /2-Month Plan/);
    assert.match(msg, /₦3,000/);

    // Invalid registration IDs must never be injected into WhatsApp messages
    const invalidIdMsg = buildWhatsAppMessage({
      intent: "registration_help",
      registrationId: "<script>alert(1)</script>",
    });
    assert.doesNotMatch(invalidIdMsg, /script/);
  });

  it("retains first non-empty UTM values within the session and strips unsafe characters", () => {
    const initial = mergeFirstTouchUtm(
      createEmptyUtm(),
      "?utm_source=whatsapp_broadcast&utm_campaign=pacesetters<script>"
    );
    assert.equal(initial.utm_source, "whatsapp_broadcast");
    assert.equal(initial.utm_campaign, "pacesettersscript");

    // Subsequent navigation must preserve first-touch utm_source while filling empty utm_medium
    const second = mergeFirstTouchUtm(
      initial,
      "?utm_source=twitter&utm_medium=social"
    );
    assert.equal(second.utm_source, "whatsapp_broadcast");
    assert.equal(second.utm_medium, "social");
  });

  it("scrubs PII, Registration IDs, submission keys, emails, and phones from analytics params", () => {
    const sanitized = sanitizeAnalyticsParams({
      cta_location: "hero_primary",
      plan_id: "plan-4m",
      months: 4,
      fullName: "Should Be Dropped",
      email: "leak@example.com",
      faq_id: "AFO-2027-00001", // Forbidden pattern!
      error_code: "+2348012345678", // Forbidden phone pattern!
      whatsapp_intent: "sub_1234567890abcdef", // Forbidden submission key!
    });

    assert.deepEqual(sanitized, {
      cta_location: "hero_primary",
      plan_id: "plan-4m",
      months: 4,
    });
  });

  it("fails closed without simulating success when NEXT_PUBLIC_APPS_SCRIPT_URL is unconfigured", async () => {
    const cfgRes = await fetchServerConfig();
    assert.equal(cfgRes.ok, false);
    if (!cfgRes.ok) {
      assert.equal(cfgRes.code, "CONFIG_INVALID");
    }

    const regRes = await submitRegistration({
      action: "register",
      submissionKey: "sub_00000000-0000-4000-8000-000000000000",
      payloadHash: "f".repeat(64),
      confirmDuplicateRecent: false,
      privacyNoticeVersion: "v0.1",
      turnstileToken: "",
      honeypot: "",
      student: {
        fullName: "Test Student",
        whatsappCanonical: "+2348012345678",
        telegramUsername: "",
        email: "",
        stateOfResidence: "Lagos",
        schoolName: "",
        subjectsLabel: "Use of English + Not sure yet",
        planId: "plan-1m",
      },
      utm: createEmptyUtm(),
    });
    assert.equal(regRes.ok, false);
    if (!regRes.ok) {
      assert.equal(regRes.code, "CONFIG_INVALID");
    }
  });
});

