import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

describe("Apps Script Client Protocol & Error/Recovery Handling (Simulated HTTP Transport)", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("parses valid server config, handles timeout as UNKNOWN, and validates confirmed registration responses", async () => {
    // Dynamically evaluate with simulated public endpoint env
    process.env.NEXT_PUBLIC_APPS_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbTestDeploymentId/exec";

    // Re-import fresh module instances via query cache-busting so PUBLIC_ENV reads the test URL
    const apiMod = await import(`../src/lib/api.ts?test=${Date.now()}`);

    // 1. Valid GET ?action=config
    globalThis.fetch = async (input) => {
      const url = String(input);
      assert.match(url, /\?action=config$/);
      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            configVersion: "1.2.0",
            serverTimeIso: "2026-11-09T10:00:00+01:00",
            registrationState: "OPEN",
            plans: [
              {
                id: "plan-1m",
                name: "1-Month Plan",
                months: 1,
                monthlyPriceNgn: 1500,
                totalAmountNgn: 1500,
                startCycleLabel: "Cycle 1",
                coveredCyclesLabel: "Cycle 1",
                accessEndLabel: "End of Cycle 1",
                available: true,
              },
            ],
          },
        }),
        { status: 200 }
      );
    };

    const cfgRes = await apiMod.fetchServerConfig();
    assert.equal(cfgRes.ok, true);
    if (cfgRes.ok) {
      assert.equal(cfgRes.data.registrationState, "OPEN");
      assert.equal(cfgRes.data.plans.length, 1);
    }

    // 2. Network abort / drop during register -> must return code: "UNKNOWN" (never false failure!)
    globalThis.fetch = async () => {
      throw new TypeError("Failed to fetch");
    };

    const timeoutRes = await apiMod.submitRegistration({
      action: "register",
      submissionKey: "sub_11111111-2222-4333-8444-555555555555",
      payloadHash: "a".repeat(64),
      confirmDuplicateRecent: false,
      privacyNoticeVersion: "v0.1",
      turnstileToken: "tok_test",
      honeypot: "",
      student: {
        fullName: "Amina Musa",
        whatsappCanonical: "+2348012345678",
        telegramUsername: "",
        email: "",
        stateOfResidence: "Kano",
        schoolName: "",
        subjectsLabel: "Use of English + Not sure yet",
        planId: "plan-1m",
      },
      utm: {
        utm_source: "",
        utm_medium: "",
        utm_campaign: "",
        utm_content: "",
        utm_term: "",
      },
    });

    assert.equal(timeoutRes.ok, false);
    if (!timeoutRes.ok) {
      assert.equal(timeoutRes.code, "UNKNOWN");
    }

    // 3. Confirmed registration response sends POST with text/plain;charset=utf-8
    let capturedContentType = "";
    globalThis.fetch = async (_input, init) => {
      const headers = (init?.headers ?? {}) as Record<string, string>;
      capturedContentType = headers["Content-Type"] ?? "";
      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            registrationId: "AFO-2027-00001",
            firstName: "Amina",
            planId: "plan-1m",
            planName: "1-Month Plan",
            months: 1,
            coveredCyclesLabel: "Cycle 1",
            accessEndLabel: "End of Cycle 1",
            expectedAmountNgn: 1500,
            recordedAtLagos: "2026-11-09 10:05:00",
            recoveryToken: "rec_token_xyz",
            bankDetails: {
              bankName: "Kuda Bank",
              accountName: "AFOGRADE TUTORIALS AND EDUSERVICES",
              accountNumber: "3003920115",
            },
          },
        }),
        { status: 200 }
      );
    };

    const okRes = await apiMod.submitRegistration({
      action: "register",
      submissionKey: "sub_11111111-2222-4333-8444-555555555555",
      payloadHash: "a".repeat(64),
      confirmDuplicateRecent: false,
      privacyNoticeVersion: "v0.1",
      turnstileToken: "tok_test",
      honeypot: "",
      student: {
        fullName: "Amina Musa",
        whatsappCanonical: "+2348012345678",
        telegramUsername: "",
        email: "",
        stateOfResidence: "Kano",
        schoolName: "",
        subjectsLabel: "Use of English + Not sure yet",
        planId: "plan-1m",
      },
      utm: {
        utm_source: "whatsapp",
        utm_medium: "broadcast",
        utm_campaign: "pacesetters",
        utm_content: "",
        utm_term: "",
      },
    });

    assert.equal(capturedContentType, "text/plain;charset=utf-8");
    assert.equal(okRes.ok, true);
    if (okRes.ok) {
      assert.equal(okRes.data.registrationId, "AFO-2027-00001");
      assert.equal(okRes.data.expectedAmountNgn, 1500);
    }

    delete process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  });
});

