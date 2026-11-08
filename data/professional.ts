import { content } from "./content";
import type { Education } from "./types";

export const educationHistory: readonly Education[] = content.educationHistory;
export const education = educationHistory[0];
export const workingModes = content.workingModes;
export const careerDirections = content.careerDirections.map((item, index) => ({
  ...item,
  index: String(index + 1).padStart(2, "0"),
}));
export const sectionCopy = content.sections;
