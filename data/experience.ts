import type { Experience } from "./types";

export const experience = [
  {
    period: "Current",
    company: "Amazon Web Services (AWS)",
    role: "DCO Tech 3",
    location: "Mumbai, India",
    summary:
      "Working in AWS data center operations. Public detail is intentionally limited to role and organization.",
    responsibilities: [],
  },
  {
    period: "Previous",
    company: "ALFA KPO PRIVATE LIMITED",
    role: "Team Lead Network Engineer",
    location: "Mumbai, India",
    summary:
      "Led the operation, reliability and security of business-critical network and systems infrastructure.",
    responsibilities: [
      "Coordinated network operations, monitoring, incident response and vendor escalation.",
      "Administered Windows, Linux, identity, endpoint and network-security systems.",
      "Improved reliability through documentation, PowerShell and Python automation.",
      "Mentored engineers and standardized operational runbooks.",
    ],
  },
] satisfies readonly Experience[];
