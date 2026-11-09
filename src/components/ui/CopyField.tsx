"use client";

import { useState } from "react";
import { CheckCircleIcon, CopyIcon } from "./Icons";
import styles from "./CopyField.module.css";

interface CopyFieldProps {
  label: string;
  value: string;
  copyAnnouncementLabel: string;
}

export function CopyField({ label, value, copyAnnouncementLabel }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback selection copy for older Android WebViews
      try {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <span className={`type-label-large ${styles.label}`}>{label}</span>
      <div className={styles.row}>
        <span className={styles.value}>{value}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={`${styles.copyButton} ${copied ? styles.copied : ""}`.trim()}
          aria-label={`Copy ${copyAnnouncementLabel}`}
        >
          {copied ? <CheckCircleIcon width={18} height={18} /> : <CopyIcon />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? `${copyAnnouncementLabel} copied to clipboard.` : ""}
      </span>
    </div>
  );
}

