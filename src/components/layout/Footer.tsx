import Link from "next/link";
import { BRAND_CONFIG } from "@/config/programme";
import { getActiveSocialLinks } from "@/config/social";
import type {
  SocialLinksOverrideMap,
  SocialPlatformKey,
} from "@/types/registration";
import {
  BroadcastChannelIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  PhoneIcon,
  TelegramIcon,
  TikTokIcon,
  UsersGroupIcon,
  WhatsAppIcon,
  XTwitterIcon,
} from "@/components/ui/Icons";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import styles from "./Footer.module.css";

interface FooterProps {
  socialLinks?: SocialLinksOverrideMap;
  isSubpage?: boolean;
}

const FOOTER_NAV_ITEMS = [
  { label: "Home", hash: "#hero" },
  { label: "About the Programme", hash: "#about" },
  { label: "Programme Benefits", hash: "#benefits" },
  { label: "Hall of Fame", hash: "#track-record" },
  { label: "Awards & Prizes", hash: "#rewards" },
  { label: "Registration", hash: "#register" },
  { label: "Frequently Asked Questions", hash: "#faq" },
] as const;

function renderSocialPlatformIcon(key: SocialPlatformKey) {
  switch (key) {
    case "facebookPage":
      return <FacebookIcon width={18} height={18} />;
    case "facebookCommunity":
      return <UsersGroupIcon width={18} height={18} />;
    case "instagram":
      return <InstagramIcon width={18} height={18} />;
    case "whatsapp":
      return <WhatsAppIcon width={18} height={18} />;
    case "whatsappChannel":
    case "whatsappChannel2":
      return <BroadcastChannelIcon width={18} height={18} />;
    case "tiktok":
      return <TikTokIcon width={18} height={18} />;
    case "telegram":
      return <TelegramIcon width={18} height={18} />;
    case "xTwitter":
      return <XTwitterIcon width={17} height={17} />;
    default:
      return <GlobeIcon width={18} height={18} />;
  }
}

export function Footer({ socialLinks, isSubpage = false }: FooterProps) {
  const activeSocialLinks = getActiveSocialLinks(socialLinks);
  const navPrefix = isSubpage ? "/" : "";

  return (
    <footer id="footer" className={styles.footer}>
      <div className="container">
        <div className={styles.topGrid}>
          {/* Column 1: Brand Identity + Connect With AFOGRADE */}
          <div className={styles.brandBlock}>
            <div className={styles.brandHeader}>
              <span className={styles.footerLogoFrame}>
                <img
                  src={BRAND_CONFIG.logoSrc}
                  alt={BRAND_CONFIG.logoAlt}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className={styles.footerLogoImg}
                />
              </span>
              <div>
                <p className={styles.orgName}>{BRAND_CONFIG.organisationName}</p>
                <p className={`type-title-medium ${styles.tagline}`}>
                  “{BRAND_CONFIG.tagline}”
                </p>
              </div>
            </div>

            <p className={`type-body-medium ${styles.summary}`}>
              {BRAND_CONFIG.programmeName}: {BRAND_CONFIG.campaignName} for{" "}
              {BRAND_CONFIG.targetCohortLabel}.
            </p>

            {activeSocialLinks.length > 0 ? (
              <div className={styles.socialBlock}>
                <h2 className={styles.colHeading}>Connect With AFOGRADE</h2>
                <ul className={styles.socialList}>
                  {activeSocialLinks.map((platform) => (
                    <li key={`${platform.key}-${platform.label}`}>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${BRAND_CONFIG.organisationName} on ${platform.label}`}
                        className={styles.socialChip}
                      >
                        <span className={styles.socialIconWrap}>
                          {renderSocialPlatformIcon(platform.key)}
                        </span>
                        <span>{platform.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Column 2: Footer Navigation */}
          <div>
            <h2 className={styles.colHeading}>Programme Navigation</h2>
            <ul className={styles.linkList}>
              {FOOTER_NAV_ITEMS.map((item) => (
                <li key={item.hash}>
                  <a
                    href={`${navPrefix}${item.hash}`}
                    className={styles.footerLink}
                  >
                    <span className={styles.footerLinkText}>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Official Contact Information & Legal */}
          <div className={styles.contactColumn}>
            <h2 className={styles.colHeading}>Contact Information</h2>
            <ul className={styles.linkList}>
              <li>
                <a href={BRAND_CONFIG.callHref} className={styles.contactPhoneLink}>
                  <PhoneIcon width={18} height={18} />
                  <span>WhatsApp/Call: {BRAND_CONFIG.whatsappDisplay}</span>
                </a>
              </li>
              <li className={styles.whatsappCtaItem}>
                <WhatsAppCta
                  intent="general_enquiry"
                  label="Chat on WhatsApp"
                  variant="whatsapp"
                  ctaLocation="footer_contact"
                />
              </li>
              <li>
                <Link href="/privacy/" className={styles.footerLink}>
                  <span className={styles.footerLinkText}>
                    Privacy Notice &amp; Data Protection
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <p className={styles.copyright}>{BRAND_CONFIG.copyrightNotice}</p>
          <p className={styles.antiImpersonation}>
            Anti-impersonation notice: Only deal with our official contact line (
            {BRAND_CONFIG.whatsappDisplay}) and verify the official account name
            after server-confirmed registration.
          </p>
        </div>
      </div>
    </footer>
  );
}
