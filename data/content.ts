import raw from "@/content/portfolio.json";
import type {
  CareerDirection,
  Certification,
  ContactChannel,
  Education,
  Experience,
  Project,
  SkillLayer,
} from "./types";

export type ProjectInput = Pick<
  Project,
  "slug" | "title" | "summary" | "role" | "year" | "technologies" | "outcome"
> &
  Partial<Project>;
type ExperienceInput = Pick<Experience, "period" | "summary" | "responsibilities"> &
  Partial<Experience> & { current: boolean };

type PortfolioContent = {
  profile: typeof raw.profile;
  seo: typeof raw.seo;
  sections: typeof raw.sections;
  projects: readonly ProjectInput[];
  experience: readonly ExperienceInput[];
  educationHistory: readonly Education[];
  certifications: readonly Omit<Certification, "index">[];
  careerDirections: readonly Omit<CareerDirection, "index">[];
  workingModes: readonly { label: string; title: string; description: string }[];
  skillLayers: readonly SkillLayer[];
  contactChannels: readonly (Omit<ContactChannel, "index"> & { identity: boolean })[];
};

// The predev/prebuild JSON Schema gate validates this boundary. Explicit collection
// types also let forks clear optional arrays without TypeScript inferring never[].
export const content = raw as unknown as PortfolioContent;
