import type { ReactNode } from "react";
import { Badge, type BadgeVariant } from "./Badge";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowVariant?: BadgeVariant;
  title: string;
  lead?: ReactNode;
  centered?: boolean;
  inverse?: boolean;
  id?: string;
}

export function SectionHeading({
  eyebrow,
  eyebrowVariant = "brand",
  title,
  lead,
  centered = false,
  inverse = false,
  id,
}: SectionHeadingProps) {
  const classes = [
    styles.wrapper,
    centered ? styles.centered : "",
    inverse ? styles.inverse : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {eyebrow ? (
        <div>
          <Badge variant={inverse ? "inverse" : eyebrowVariant}>{eyebrow}</Badge>
        </div>
      ) : null}
      <h2 id={id} className={`type-section-heading ${styles.heading}`}>
        {title}
      </h2>
      {lead ? <p className={`type-body-large ${styles.lead}`}>{lead}</p> : null}
    </div>
  );
}

