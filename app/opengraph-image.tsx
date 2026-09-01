import { createSocialImage, socialImageSize } from "@/lib/social-image";

export const alt =
  "Rahul Singh Parmar — DCO Tech 3, infrastructure operator, and automation builder";
export const size = socialImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSocialImage();
}
