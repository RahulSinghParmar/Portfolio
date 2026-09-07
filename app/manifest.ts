import type { MetadataRoute } from "next";

import { profile } from "@/data/profile";
import { siteMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${profile.name} — Portfolio`,
    short_name: "RSP Portfolio",
    description: siteMetadata.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0c0c",
    theme_color: "#0b0c0c",
    categories: ["portfolio", "technology", "productivity"],
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
