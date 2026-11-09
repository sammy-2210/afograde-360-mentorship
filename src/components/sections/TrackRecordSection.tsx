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

        {/* PART B: STUDENT REVIEWS & TESTIMONIALS (Auto-shown only when consent-verified reviews exist) */}
        {testimonials.length > 0 && currentReview ? (
          <div className={styles.partBlock}>
            <div className={styles.subHeader}>
              <div>
                <h3 className={`type-headline-small ${styles.subTitle}`}>
                  {TRACK_RECORD_COPY.partBHeading}
                </h3>
                <p
                  className="type-body-medium"
                  style={{ color: "var(--afograde-ink-muted)", marginTop: "4px" }}
                >
                  {TRACK_RECORD_COPY.partBLead}
                </p>
              </div>
              {testimonials.length > 1 ? (
                <span className="type-label-large" style={{ color: "var(--afograde-color-primary)" }}>
                  Review {activeSlide + 1} of {testimonials.length}
                </span>
              ) : null}
            </div>

            <div
              className={styles.carouselShell}
              aria-roledescription="carousel"
              aria-label="Student testimonials"
            >
              <article
                className={`${styles.testimonialCard} ${
                  currentReview.feedbackScreenshotUrl
                    ? styles.testimonialCardWithShot
                    : ""
                }`.trim()}
              >
                <div className={styles.testimonialBody}>
                  <p className={styles.quoteText}>
                    “{currentReview.reviewText}”
                  </p>
                  <div className={styles.studentMeta}>
                    {currentReview.photoUrl ? (
                      <img
                        src={currentReview.photoUrl}
                        alt={currentReview.displayName}
                        width={52}
                        height={52}
                        loading="lazy"
                        decoding="async"
                        className={styles.avatar}
                      />
                    ) : (
                      <span className={styles.avatarInitial} aria-hidden="true">
                        {currentReview.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className={styles.studentName}>
                        {currentReview.displayName}
                      </p>
                      {currentReview.institutionAndCourse ? (
                        <p className={styles.studentCourse}>
                          {currentReview.institutionAndCourse}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {currentReview.feedbackScreenshotUrl ? (
                  <div className={styles.screenshotFrame}>
                    <img
                      src={currentReview.feedbackScreenshotUrl}
                      alt={`Original feedback from ${currentReview.displayName}`}
                      loading="lazy"
                      decoding="async"
                      className={styles.screenshotImg}
                    />
                  </div>
                ) : null}
              </article>

              {testimonials.length > 1 ? (
                <div className={styles.carouselControls}>
                  <div className={styles.dots} role="tablist" aria-label="Select testimonial">
                    {testimonials.map((rev, idx) => (
                      <button
                        key={rev.id}
                        type="button"
                        role="tab"
                        aria-selected={idx === activeSlide}
                        aria-label={`View review ${idx + 1} from ${rev.displayName}`}
                        className={`${styles.dotBtn} ${
                          idx === activeSlide ? styles.dotBtnActive : ""
                        }`.trim()}
                        onClick={() => setActiveSlide(idx)}
                      />
                    ))}
                  </div>

                  <div className={styles.navBtns}>
                    <button
                      type="button"
                      className={styles.circleBtn}
                      aria-label="Previous testimonial"
                      onClick={() =>
                        setActiveSlide((prev) =>
                          prev === 0 ? testimonials.length - 1 : prev - 1
                        )
                      }
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      type="button"
                      className={styles.circleBtn}
                      aria-label="Next testimonial"
                      onClick={() =>
                        setActiveSlide((prev) =>
                          prev === testimonials.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              ) : null}
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

