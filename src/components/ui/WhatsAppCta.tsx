"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl, type WhatsAppLinkContext } from "@/lib/whatsapp";
import { Button, type ButtonVariant } from "./Button";
import { WhatsAppIcon } from "./Icons";

interface WhatsAppCtaProps extends WhatsAppLinkContext {
  label: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  ctaLocation: string;
  className?: string;
}

export function WhatsAppCta({
  intent,
  registrationId,
  planName,
  expectedAmountNgn,
  label,
  variant = "outline",
  fullWidth = false,
  ctaLocation,
  className,
}: WhatsAppCtaProps) {
  const href = buildWhatsAppUrl({
    intent,
    registrationId,
    planName,
    expectedAmountNgn,
  });

  const handleClick = () => {
    trackEvent("whatsapp_cta_clicked", {
      cta_location: ctaLocation,
      whatsapp_intent: intent,
    });
    if (intent === "payment_proof") {
      trackEvent("send_proof_clicked", {
        cta_location: ctaLocation,
      });
    }
  };

  return (
    <Button
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      fullWidth={fullWidth}
      className={className}
      onClick={handleClick}
    >
      <WhatsAppIcon />
      <span>{label}</span>
    </Button>
  );
}

