import { isProductionIndexable, PUBLIC_ENV } from "@/config/env";
import { BRAND_CONFIG } from "@/config/programme";
import { LandingPageClient } from "@/components/LandingPageClient";

export default function HomePage() {
  const indexable = isProductionIndexable();

  // Verified Organization JSON-LD (PRD Section 17: contains ONLY verified facts)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: BRAND_CONFIG.organisationName,
    slogan: BRAND_CONFIG.tagline,
    telephone: "+2349079255537",
    ...(indexable ? { url: `${PUBLIC_ENV.siteUrl}/` } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageClient />
    </>
  );
}

