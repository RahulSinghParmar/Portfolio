import { createSocialImage, socialImageSize } from "@/lib/social-image";

export const dynamic = "force-static";
export const alt = "Rahul Singh Parmar — DCO Tech 3 at Amazon Web Services and automation builder";
export const size = socialImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return createSocialImage();
}
