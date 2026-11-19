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
  const { testimonials, gallery } =
    resolveTrackRecordData(serverTrackRecord);
  const [lightboxItem, setLightboxItem] =
    useState<TrackRecordGalleryItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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


  return (
    <section id="track-record" className={`section ${styles.section}`}>
      <div className="container">
        <SectionHeading
          eyebrow="Academic Track Record"
          title="PACESETTERS HALL OF FAME"
          lead="Behind every impressive score is preparation, consistency, and the right academic mentorship. Explore verified scores, courses, and tertiary admissions from our pacesetters community."
        />

        {/* PACESETTERS HALL OF FAME GRID */}
        {testimonials.length > 0 ? (
          <div className={styles.partBlock}>
            <div className={styles.scholarsGrid} role="list" aria-label="Verified student scholars">
              {testimonials.map((student) => {
                const isExpanded = expandedIds.has(student.id);
                const isLongReview = (student.reviewText?.length ?? 0) > 260;
                return (
                <article key={student.id} role="listitem" className={styles.scholarCard}>
                  <div
                    className={`${styles.scholarPhotoFrame} ${
                      !student.photoUrl && !student.feedbackScreenshotUrl
                        ? styles.scholarPhotoFrameCompact
                        : ""
                    }`.trim()}
                  >
                    <span className={styles.scholarPhotoAccent} aria-hidden="true" />
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.displayName}
                        loading="lazy"
                        decoding="async"
                        className={styles.scholarPhoto}
                      />
                    ) : student.feedbackScreenshotUrl ? (
                      <img
                        src={student.feedbackScreenshotUrl}
                        alt={`${student.displayName} 2026 UTME result`}
                        loading="lazy"
                        decoding="async"
                        className={`${styles.scholarPhoto} ${styles.scholarSlipAsPhoto}`}
                      />
                    ) : (
                      <span className={styles.scholarPhotoInitial} aria-hidden="true">
                        {student.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <dl className={styles.scholarFacts}>
                    <div className={styles.scholarFactRow}>
                      <dt>Name:</dt>
                      <dd className={styles.scholarName}>{student.displayName}</dd>
                    </div>
                    <div className={styles.scholarFactRow}>
                      <dt>Year:</dt>
                      <dd>{student.examYear || "2026"} UTME</dd>
                    </div>
                    {student.score ? (
                      <div className={styles.scholarFactRow}>
                        <dt>Score:</dt>
                        <dd className={styles.scholarScoreValue}>
                          {student.score}
                          <span className={styles.scholarScoreDenom}> / 400</span>
                        </dd>
                      </div>
                    ) : null}
                    {student.course ? (
                      <div className={styles.scholarFactRow}>
                        <dt>Course:</dt>
                        <dd>{student.course}</dd>
                      </div>
                    ) : null}
                    {student.university && student.university !== student.course ? (
                      <div className={styles.scholarFactRow}>
                        <dt>School:</dt>
                        <dd>{student.university}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {student.subjectScores && student.subjectScores.length > 0 ? (
                    <ul className={styles.scholarSubjectChips} aria-label="Subject scores">
                      {student.subjectScores.map((s) => (
                        <li key={s.subject}>
                          <span>{s.subject}</span>
                          <strong>{s.score}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {student.reviewText ? (
                    <div className={styles.scholarReviewPanel}>
                      <p
                        className={`${styles.scholarReviewQuote} ${
                          isLongReview && !isExpanded ? styles.scholarReviewClamped : ""
                        }`.trim()}
                      >
                        “{student.reviewText}”
                      </p>
                      {isLongReview ? (
                        <button
                          type="button"
                          className={styles.readMoreBtn}
                          aria-expanded={isExpanded}
                          onClick={() => toggleExpanded(student.id)}
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {student.feedbackScreenshotUrl ? (
                    <button
                      type="button"
                      className={styles.viewSlipBtn}
                      onClick={() =>
                        setLightboxItem({
                          id: student.id,
                          category: "Student Testimonial",
                          title: `${student.displayName} UTME Result`,
                          imageUrl: student.feedbackScreenshotUrl!,
                          caption: `2026 UTME result for ${student.displayName}.`,
                          consentVerified: true,
                          approved: true,
                        })
                      }
                    >
                      <span>View Result Slip</span>
                      <ChevronRightIcon width={14} height={14} />
                    </button>
                  ) : null}
                </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {testimonials.length === 0 && gallery.length === 0 ? (
          <div className={styles.emptyDirectoryCard}>
            <div className={styles.emptyDirectoryIcon} aria-hidden="true">
              🎓
            </div>
            <h3 className={`type-headline-small ${styles.emptyDirectoryTitle}`}>
              Verified Pacesetter Directory
            </h3>
            <p className={`type-body-medium ${styles.emptyDirectoryText}`}>
              Official scholar profiles, top UTME scores, and verified tertiary admissions are published directly from our academic records. Join our official community channels for real-time announcements.
            </p>
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

