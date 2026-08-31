import { createSocialImage, socialImageSize } from "@/lib/social-image";

export const alt =
  "Rahul Singh Parmar — Team Lead Network Engineer, infrastructure operator, and automation builder";
export const size = socialImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return createSocialImage();
}
