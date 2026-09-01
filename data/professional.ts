import type { CareerDirection, Education } from "./types";

export const education = {
  degree: "Bachelor of Engineering",
  discipline: "Computer Engineering",
  note: "Engineering foundation spanning computing systems and software development.",
} satisfies Education;

export const careerDirections = [
  {
    index: "01",
    title: "Automate operations",
    description:
      "Move recurring infrastructure work from manual procedure into reviewed, observable workflows.",
  },
  {
    index: "02",
    title: "Deepen cloud security",
    description:
      "Apply network and systems experience to identity-aware, resilient AWS infrastructure.",
  },
  {
    index: "03",
    title: "Build reliable platforms",
    description:
      "Bridge operations and development so internal tools are as maintainable as the systems they support.",
  },
] satisfies readonly CareerDirection[];

export const workingModes = [
  {
    label: "Primary practice",
    title: "Data center operations",
    description:
      "Infrastructure availability, hardware and network operations, incident handling, change execution, and cross-team coordination.",
  },
  {
    label: "Weekend practice",
    title: "Development and homelab",
    description:
      "Automation, edge services, self-hosting, and small software systems built from real operational needs.",
  },
] as const;
