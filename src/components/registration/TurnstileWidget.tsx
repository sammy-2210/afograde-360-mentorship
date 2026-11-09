"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { isTurnstileConfigured, PUBLIC_ENV } from "@/config/env";
import styles from "./Registration.module.css";

interface TurnstileWidgetProps {
  resetNonce: number;
  error?: string;
  onVerify: (token: string) => void;
  onExpireOrError: () => void;
}

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({
  resetNonce,
  error,
  onVerify,
  onExpireOrError,
}: TurnstileWidgetProps) {
  const configured = isTurnstileConfigured();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!configured) return;
    if (typeof window !== "undefined" && window.turnstile) {
      setScriptReady(true);
    }
  }, [configured]);

  useEffect(() => {
    if (!configured || !scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Ignore stale widget cleanup error
      }
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: PUBLIC_ENV.turnstileSiteKey,
      theme: "light",
      callback: (token: string) => onVerify(token),
      "expired-callback": () => onExpireOrError(),
      "error-callback": () => onExpireOrError(),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [configured, onExpireOrError, onVerify, scriptReady]);

  useEffect(() => {
    if (resetNonce === 0) return;
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // Ignore
      }
    }
  }, [resetNonce]);

  if (!configured) {
    return null;
  }

  return (
    <div className={styles.turnstileWrap}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <div
        id="field-turnstileToken"
        ref={containerRef}
        tabIndex={-1}
        aria-label="Security verification challenge"
      />
      {error ? (
        <p className={styles.fieldError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

