"use client";

import { useEffect, useState } from "react";
import {
  resolveTrackRecordData,
  TRACK_RECORD_COPY,
} from "@/config/trackRecord";
import type {
  TrackRecordGalleryItem,
  TrackRecordPayload,
} from "@/types/registration";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./TrackRecord.module.css";

interface TrackRecordSectionProps {
  serverTrackRecord?: TrackRecordPayload;
}

export function TrackRecordSection({
  serverTrackRecord,
}: TrackRecordSectionProps) {
  const { scores, testimonials, gallery } =
    resolveTrackRecordData(serverTrackRecord);
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxItem, setLightboxItem] =
    useState<TrackRecordGalleryItem | null>(null);

  useEffect(() => {
    if (activeSlide >= testimonials.length && testimonials.length > 0) {
      setActiveSlide(0);
    }
  }, [activeSlide, testimonials.length]);

  useEffect(() => {
    if (!lightboxItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxItem(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxItem]);

  if (scores.length === 0 && testimonials.length === 0 && gallery.length === 0) {
    return null;
  }

  const currentReview = testimonials[activeSlide];

  return (
    <section id="track-record" className={`section ${styles.section}`}>
      <div className="container">
        <SectionHeading
          eyebrow={TRACK_RECORD_COPY.eyebrow}
          title={TRACK_RECORD_COPY.sectionTitle}
          lead={TRACK_RECORD_COPY.supportingStatement}
        />

        {/* PART A: PAST UTME RESULTS */}
        {scores.length > 0 ? (
          <div className={styles.partBlock}>
            <div className={styles.subHeader}>
              <h3 className={`type-headline-small ${styles.subTitle}`}>
                {TRACK_RECORD_COPY.partAHeading}
              </h3>
              <Badge variant="brand">Out of 400 UTME Aggregate</Badge>
            </div>

            <div className={styles.scoresGrid} role="list" aria-label="Past UTME scores">
              {scores.map((item) => {
                const max = item.maxScore ?? 400;
                const pct = Math.min(100, Math.round((item.score / max) * 100));
                return (
                  <article
                    key={item.id}
                    role="listitem"
                    className={styles.scoreCard}
                  >
                    <span className={styles.scoreYearTag}>
                      {item.examYear} UTME
                    </span>
                    <span className={styles.scoreValue}>{item.score}</span>
                    <span className={styles.scoreDenom}>/ {max}</span>
                    <div className={styles.scoreMeterTrack} aria-hidden="true">
                      <div
                        className={styles.scoreMeterFill}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>

            <div className={styles.supportingBanner}>
              <span>{TRACK_RECORD_COPY.partASupportingText}</span>
              <Badge variant="neutral">AFOGRADE Scholars</Badge>
            </div>
          </div>
        ) : null}

        {/* PART B: STUDENT SCHOLARS & HALL OF FAME */}
        {testimonials.length > 0 ? (
          <div className={styles.partBlock}>
            <div className={styles.subHeader}>
              <div>
                <h3 className={`type-headline-small ${styles.subTitle}`}>
                  PACESETTERS HALL OF FAME
                </h3>
                <p
                  className="type-body-medium"
                  style={{ color: "var(--afograde-ink-muted)", marginTop: "4px" }}
                >
                  Authentic success stories: Student scores, verified courses, and tertiary institutions across Nigeria.
                </p>
              </div>
              <Badge variant="brand">Verified Academic Records</Badge>
            </div>

            <div className={styles.scholarsGrid} role="list" aria-label="Verified student scholars">
              {testimonials.map((student) => (
                <article key={student.id} role="listitem" className={styles.scholarCard}>
                  <div className={styles.scholarTopRow}>
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.displayName}
                        width={60}
                        height={60}
                        loading="lazy"
                        decoding="async"
                        className={styles.scholarAvatar}
                      />
                    ) : (
                      <span className={styles.scholarAvatarInitial} aria-hidden="true">
                        {student.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div className={styles.scholarMetaBlock}>
                      <h4 className={styles.scholarName}>{student.displayName}</h4>
                      <span className={styles.scholarYearTag}>
                        {student.examYear || "2026"} UTME
                      </span>
                    </div>

                    {student.score ? (
                      <div className={styles.scholarScorePillWrap}>
                        <span className={styles.scholarScoreValue}>{student.score}</span>
                        <span className={styles.scholarScoreDenom}>/ 400</span>
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.scholarAcademicDetails}>
                    <div className={styles.scholarDetailRow}>
                      <span className={styles.scholarDetailLabel}>Course:</span>
                      <strong className={styles.scholarDetailValue}>
                        {student.course || student.institutionAndCourse?.split("—")[0]?.trim() || student.institutionAndCourse || "Science Programme"}
                      </strong>
                    </div>

                    <div className={styles.scholarDetailRow}>
                      <span className={styles.scholarDetailLabel}>Institution:</span>
                      <span className={styles.scholarDetailValue}>
                        {student.university || student.institutionAndCourse?.split("—")[1]?.trim() || student.institutionAndCourse || "Federal / State University"}
                      </span>
                    </div>
                  </div>

                  {student.reviewText ? (
                    <p className={styles.scholarReviewQuote}>
                      “{student.reviewText}”
                    </p>
                  ) : null}

                  {student.feedbackScreenshotUrl ? (
                    <button
                      type="button"
                      className={styles.viewSlipBtn}
                      onClick={() =>
                        setLightboxItem({
                          id: student.id,
                          category: "Student Testimonial",
                          title: `${student.displayName} Verification Slip`,
                          imageUrl: student.feedbackScreenshotUrl!,
                          caption: `Verified UTME result & admission milestone for ${student.displayName}.`,
                          consentVerified: true,
                          approved: true,
                        })
                      }
                    >
                      <span>View Verification Slip</span>
                      <ChevronRightIcon width={14} height={14} />
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {/* PART C: RESULT & REVIEW GALLERY (Auto-shown only when consent-verified media exist) */}
        {gallery.length > 0 ? (
          <div className={styles.partBlock}>
            <div>
              <h3 className={`type-headline-small ${styles.subTitle}`}>
                {TRACK_RECORD_COPY.partCHeading}
              </h3>
              <p
                className="type-body-medium"
                style={{ color: "var(--afograde-ink-muted)", marginTop: "4px" }}
              >
                {TRACK_RECORD_COPY.partCLead}
              </p>
            </div>

            <div className={styles.galleryGrid}>
              {gallery.map((item) => (
                <figure key={item.id} className={styles.galleryCard}>
                  <button
                    type="button"
                    className={styles.galleryMediaBtn}
                    aria-label={`Enlarge ${item.title}`}
                    onClick={() => setLightboxItem(item)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className={styles.galleryImg}
                    />
                  </button>
                  <figcaption className={styles.galleryMeta}>
                    <div>
                      <Badge variant="brand">{item.category}</Badge>
                    </div>
                    <p className={styles.galleryTitle}>{item.title}</p>
                    {item.caption ? (
                      <p className={styles.galleryCaption}>{item.caption}</p>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : null}

        {lightboxItem ? (
          <div
            className={styles.lightboxBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label={lightboxItem.title}
            onClick={() => setLightboxItem(null)}
          >
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.title}
              className={styles.lightboxImg}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxItem(null)}
            >
              Close Preview
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

