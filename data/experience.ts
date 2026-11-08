import { content } from "./content";
import { profile } from "./profile";
import type { Experience } from "./types";

// Current employment shares the profile's role, employer and location.
export const experience: readonly Experience[] = content.experience.map((item) => ({
  ...item,
  company: item.current ? profile.employer : (item.company ?? ""),
  role: item.current ? profile.role : (item.role ?? ""),
  location: item.current ? profile.location : (item.location ?? ""),
}));
