import { content } from "./content";

export const certifications = content.certifications.map((item, index) => ({
  ...item,
  index: `CERT / ${String(index + 1).padStart(3, "0")}`,
}));
