import type { Metadata, Viewport } from "next";
import { isProductionIndexable, PUBLIC_ENV } from "@/config/env";
import { BRAND_CONFIG } from "@/config/programme";
import { AnalyticsManager } from "@/components/analytics/AnalyticsManager";
import "@/styles/tokens.css";
import "@/styles/typography.css";
import "@/styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A4A0A",
  colorScheme: "light",
};

export function generateMetadata(): Metadata {
  const indexable = isProductionIndexable();
  const title = `${BRAND_CONFIG.programmeName} (2027 UTME) | ${BRAND_CONFIG.organisationName}`;
  const description =
    "Online UTME tutorials, mock speed tests, question battles, and university admission mentorship for 2027 UTME candidates under AFOGRADE's 5,000 Pacesetters Project.";

  return {
    ...(indexable ? { metadataBase: new URL(PUBLIC_ENV.siteUrl) } : {}),
    title,
    description,
    icons: {
      icon: [
        {
          url: BRAND_CONFIG.logoSrc,
          type: "image/jpeg",
          sizes: `${BRAND_CONFIG.logoWidth}x${BRAND_CONFIG.logoHeight}`,
        },
      ],
      shortcut: [
        {
          url: BRAND_CONFIG.logoSrc,
          type: "image/jpeg",
        },
      ],
      apple: [
        {
          url: BRAND_CONFIG.logoSrc,
          type: "image/jpeg",
          sizes: `${BRAND_CONFIG.logoWidth}x${BRAND_CONFIG.logoHeight}`,
        },
      ],
    },
    ...(indexable
      ? {
          alternates: {
            canonical: "/",
          },
        }
      : {}),
    robots: indexable
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          nocache: true,
        },
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: BRAND_CONFIG.organisationName,
      title,
      description,
      ...(indexable ? { url: `${PUBLIC_ENV.siteUrl}/` } : {}),
      images: [
        {
          url: "/images/og-preview.svg",
          width: 1200,
          height: 630,
          alt: `${BRAND_CONFIG.programmeName} · ${BRAND_CONFIG.organisationName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-preview.svg"],
    },
    other: {
      "color-scheme": "light",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG" data-theme="light" style={{ colorScheme: "light" }}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <AnalyticsManager />
      </body>
    </html>
  );
}
