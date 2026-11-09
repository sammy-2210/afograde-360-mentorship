import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant =
  | "brand"
  | "neutral"
  | "success"
  | "warning"
  | "info"
  | "inverse";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "brand", className = "" }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}

