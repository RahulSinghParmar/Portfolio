import type { MetadataRoute } from "next";

import { profile } from "@/data/profile";
import { siteMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: profile.siteUrl,
      lastModified: siteMetadata.contentUpdated,
      changeFrequency: "monthly",
      priority: 1,
      images: [`${profile.siteUrl}/images/rahul-portrait.webp`],
    },
  ];
}
