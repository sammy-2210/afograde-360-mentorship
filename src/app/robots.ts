import type { MetadataRoute } from "next";
import { isProductionIndexable, PUBLIC_ENV } from "@/config/env";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionIndexable()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${PUBLIC_ENV.siteUrl}/sitemap.xml`,
  };
}

