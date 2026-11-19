"use client";

import { useEffect, useState } from "react";
import { SCHEDULE_CONFIG } from "@/config/programme";
import styles from "./DeadlineCountdown.module.css";

const DEADLINE_MS = Date.parse(SCHEDULE_CONFIG.registrationDeadlineIso);

/** Whole hours, minutes and seconds left until the registration deadline. */
export function timeLeftUntil(deadlineMs: number, nowMs: number) {
  const totalSeconds = Math.max(0, Math.floor((deadlineMs - nowMs) / 1000));
  return {
    closed: nowMs >= deadlineMs,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

interface DeadlineCountdownProps {
  /** "dark" sits on the green hero; "light" sits on white sections. */
  tone?: "dark" | "light";
}

export function DeadlineCountdown({ tone = "light" }: DeadlineCountdownProps) {
  // null until mounted: the page is statically exported, so the time left
  // must be computed in the browser, not at build time.
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (nowMs === null) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  const { closed, hours, minutes, seconds } = timeLeftUntil(DEADLINE_MS, nowMs);
  const toneClass = tone === "dark" ? styles.dark : styles.light;

  if (closed) {
    return (
      <p className={`${styles.countdown} ${toneClass} ${styles.closedText}`} role="status">
        Registration has closed.
      </p>
    );
  }

  return (
    <div
      className={`${styles.countdown} ${toneClass}`}
      role="timer"
      // Screen readers get a minute-level label; reading out every second
      // would be noisy.
      aria-label={`Registration closes in ${hours} hours and ${minutes} minutes`}
    >
      <span className={styles.label}>Closes in</span>
      <span className={styles.tile}>
        <span className={styles.value}>{hours}</span>
        <span className={styles.unit}>{hours === 1 ? "Hour" : "Hours"}</span>
      </span>
      <span className={styles.separator} aria-hidden="true">
        :
      </span>
      <span className={styles.tile}>
        <span className={styles.value}>{String(minutes).padStart(2, "0")}</span>
        <span className={styles.unit}>{minutes === 1 ? "Minute" : "Minutes"}</span>
      </span>
      <span className={styles.separator} aria-hidden="true">
        :
      </span>
      <span className={styles.tile} aria-hidden="true">
        <span className={styles.value}>{String(seconds).padStart(2, "0")}</span>
        <span className={styles.unit}>{seconds === 1 ? "Second" : "Seconds"}</span>
      </span>
    </div>
  );
}
