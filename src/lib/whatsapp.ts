/**
 * Official WhatsApp Deep-Link & Message Builder (PRD Sections 12.3 & 12.5)
 *
 * Rules enforced:
 * - Official AFOGRADE number (2349079255537) ONLY.
 * - Minimal, purpose-specific messages.
 * - Never includes full name, phone number, email, school, or blank placeholders.
 * - Includes Registration ID ONLY when valid and available.
 */

import { BRAND_CONFIG } from "../config/programme.ts";
import type { WhatsAppIntent } from "../types/registration.ts";
import { isValidRegistrationId } from "./crypto.ts";
import { formatNaira } from "./validation.ts";

export interface WhatsAppLinkContext {
  intent: WhatsAppIntent;
  registrationId?: string;
  planName?: string;
  expectedAmountNgn?: number;
}

export function buildWhatsAppMessage(ctx: WhatsAppLinkContext): string {
  const validId =
    ctx.registrationId && isValidRegistrationId(ctx.registrationId)
      ? ctx.registrationId.trim()
      : null;

  switch (ctx.intent) {
    case "payment_proof": {
      const parts = [
        "Hello AFOGRADE, I have completed my bank transfer for The 360+ Mentorship Series and attached my payment screenshot.",
      ];
      if (validId) {
        parts.push(`Registration ID: ${validId}`);
      }
      if (ctx.planName?.trim()) {
        parts.push(`Plan: ${ctx.planName.trim()}`);
      }
      if (
        typeof ctx.expectedAmountNgn === "number" &&
        Number.isFinite(ctx.expectedAmountNgn) &&
        ctx.expectedAmountNgn > 0
      ) {
        parts.push(`Amount: ${formatNaira(ctx.expectedAmountNgn)}`);
      }
      return parts.join("\n");
    }

    case "session_recovery": {
      if (validId) {
        return `Hello AFOGRADE, I need assistance verifying my registration payment details for The 360+ Mentorship Series.\nRegistration ID: ${validId}`;
      }
      return "Hello AFOGRADE, I submitted a registration for The 360+ Mentorship Series and need help recovering my Registration ID and payment instructions.";
    }

    case "registration_help": {
      if (validId) {
        return `Hello AFOGRADE, I need assistance with my registration for The 360+ Mentorship Series (Registration ID: ${validId}).`;
      }
      return "Hello AFOGRADE, I would like assistance registering for The 360+ Mentorship Series (2027 UTME).";
    }

    case "general_enquiry":
    default:
      return "Hello AFOGRADE, I have an enquiry about The 360+ Mentorship Series for 2027 UTME candidates.";
  }
}

export function buildWhatsAppUrl(ctx: WhatsAppLinkContext): string {
  const message = buildWhatsAppMessage(ctx);
  const encoded = encodeURIComponent(message);
  // Complaints and enquiries use 08066402077; registration & payment verification use 09079255537
  const phoneDigits =
    ctx.intent === "general_enquiry"
      ? BRAND_CONFIG.supportWhatsAppDigits
      : BRAND_CONFIG.registrationWhatsAppDigits;
  return `https://wa.me/${phoneDigits}?text=${encoded}`;
}

