export type ExternalLink = {
  label: string;
  href: string;
};

export type ProjectMetric = {
  value: string;
  label: string;
};

export type ArchitectureNode = {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  align?: "start" | "middle" | "end";
};

export type ArchitectureRoute = {
  id: string;
  path: string;
  label: string;
  labelX: number;
  labelY: number;
};

export type ProjectArchitecture = {
  label: string;
  nodes: readonly ArchitectureNode[];
  routes: readonly ArchitectureRoute[];
};

export type Project = {
  index: string;
  slug: string;
  title: string;
  summary: string;
  role: string;
  year: string;
  technologies: readonly string[];
  challenge: string;
  approach: string;
  automation: string;
  security: string;
  observability: string;
  outcome: string;
  metrics: readonly ProjectMetric[];
  architecture: ProjectArchitecture;
  repositoryUrl: string | null;
  liveUrl: string | null;
};

export type Experience = {
  period: string;
  company: string;
  role: string;
  location: string;
  summary: string;
  responsibilities: readonly string[];
};

export type Certification = {
  index: string;
  name: string;
  issuer: string;
  issued: string;
  credentialUrl: string | null;
};

export type Education = {
  degree: string;
  discipline: string;
  note: string;
};

export type CareerDirection = {
  index: string;
  title: string;
  description: string;
};

export type ContactChannel = {
  index: string;
  label: string;
  value: string;
  href: string;
  description: string;
};

export type SkillLayer = {
  index: string;
  id: string;
  label: string;
  description: string;
  signal: string;
  x: number;
  y: number;
  items: readonly string[];
};
