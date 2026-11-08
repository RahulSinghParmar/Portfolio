import { content } from "./content";
import type { Project, ProjectArchitecture } from "./types";

// JSON Schema validates optional diagram enums before each development/release build.
type ProjectInput = Pick<
  Project,
  "slug" | "title" | "summary" | "role" | "year" | "technologies" | "outcome"
> &
  Partial<Project>;
const entries = content.projects as unknown as readonly ProjectInput[];
export const projects: readonly Project[] = entries.map((item, index) => ({
  ...item,
  challenge: item.challenge ?? "",
  approach: item.approach ?? "",
  automation: item.automation ?? "",
  security: item.security ?? "",
  observability: item.observability ?? "",
  metrics: item.metrics ?? [],
  repositoryUrl: item.repositoryUrl ?? null,
  liveUrl: item.liveUrl ?? null,
  index: String(index + 1).padStart(2, "0"),
  architecture: (item.architecture ?? null) as ProjectArchitecture | null,
}));
