import type { MetadataRoute } from "next";
import { isProductionIndexable, PUBLIC_ENV } from "@/config/env";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = isProductionIndexable()
    ? PUBLIC_ENV.siteUrl
    : "https://example.invalid";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date("2026-11-08"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: new Date("2026-11-08"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}

