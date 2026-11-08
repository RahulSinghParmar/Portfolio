import { createSocialImage, socialImageSize } from "@/lib/social-image";
import { siteMetadata } from "@/lib/seo";

export const dynamic = "force-static";
export const alt = siteMetadata.socialImageAlt;
export const size = socialImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return createSocialImage();
}
