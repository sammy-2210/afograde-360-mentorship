"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND_CONFIG } from "@/config/programme";
import { navigateToRegistrationForm } from "@/lib/navigation";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  CloseIcon,
  MenuIcon,
  PhoneIcon,
} from "@/components/ui/Icons";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { label: "Benefits", href: "#benefits" },
  { label: "Hall of Fame", href: "#track-record" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Structure", href: "#dates-structure" },
  { label: "Registration", href: "#register" },
  { label: "Awards", href: "#rewards" },
  { label: "FAQs", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  // Lock body scroll while mobile drawer is open to prevent background scrolling
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close drawer on Escape key and return focus to toggle
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleRegisterClick = (location: string) => {
    setMenuOpen(false);
    navigateToRegistrationForm(location);
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#hero" className={styles.brandLink}>
          <span className={styles.brandLogoFrame}>
            <img
              src={BRAND_CONFIG.logoSrc}
              alt={BRAND_CONFIG.logoAlt}
              width={48}
              height={48}
              decoding="async"
              fetchPriority="high"
              className={styles.brandLogoImg}
            />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandTitle}>{BRAND_CONFIG.shortName}</span>
            <span className={styles.brandSubtitle}>360+ Mentorship Series</span>
          </span>
        </a>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              <span className={styles.navLinkText}>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.desktopActions}>
          <button
            type="button"
            className={styles.headerRegisterBtn}
            onClick={() => handleRegisterClick("header_desktop")}
          >
            <span className={styles.headerRegisterBg} aria-hidden="true" />
            <span className={styles.headerRegisterLabel}>Register Now</span>
            <span className={styles.headerRegisterIconBadge} aria-hidden="true">
              <span className={styles.headerRegisterArrowViewport}>
                <ArrowRightIcon
                  width={16}
                  height={16}
                  className={styles.headerArrowIncoming}
                />
                <ArrowRightIcon
                  width={16}
                  height={16}
                  className={styles.headerArrowResting}
                />
              </span>
            </span>
          </button>
        </div>

        <button
          ref={toggleBtnRef}
          type="button"
          className={`${styles.menuToggle} ${
            menuOpen ? styles.menuToggleActive : ""
          }`.trim()}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen ? (
        <>
          {/* Dimmed backdrop overlay; tapping anywhere outside closes the drawer */}
          <div
            className={styles.mobileBackdrop}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          <nav
            id="mobile-nav-drawer"
            className={styles.mobileDrawer}
            aria-label="Mobile navigation"
          >
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.mobileDrawerBadge}>
                2027 UTME Cohort
              </span>
              <span className={styles.mobileDrawerTagline}>
                5,000 Pacesetters Project
              </span>
            </div>

            <ul className={styles.mobileNavList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={styles.mobileNavLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    <ChevronRightIcon
                      width={18}
                      height={18}
                      className={styles.mobileNavArrow}
                    />
                  </a>
                </li>
              ))}
            </ul>

            <div className={styles.mobileDrawerActions}>
              <button
                type="button"
                className={`${styles.headerRegisterBtn} ${styles.headerRegisterBtnFull}`}
                onClick={() => handleRegisterClick("header_mobile_drawer")}
              >
                <span className={styles.headerRegisterBg} aria-hidden="true" />
                <span className={styles.headerRegisterLabel}>Register Now</span>
                <span className={styles.headerRegisterIconBadge} aria-hidden="true">
                  <span className={styles.headerRegisterArrowViewport}>
                    <ArrowRightIcon
                      width={16}
                      height={16}
                      className={styles.headerArrowIncoming}
                    />
                    <ArrowRightIcon
                      width={16}
                      height={16}
                      className={styles.headerArrowResting}
                    />
                  </span>
                </span>
              </button>

              <WhatsAppCta
                intent="general_enquiry"
                label="Chat on WhatsApp"
                variant="whatsapp"
                fullWidth
                ctaLocation="header_mobile_drawer"
              />

              <a
                href={BRAND_CONFIG.supportCallHref}
                className={styles.mobileContactCall}
              >
                <PhoneIcon width={16} height={16} />
                <span>Call Line: {BRAND_CONFIG.supportWhatsAppDisplay}</span>
              </a>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}
