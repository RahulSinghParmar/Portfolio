import type { ExternalLink } from "./types";

// Public identity used by the hero, contact surfaces, metadata and structured data.
// Keep shared facts here instead of repeating them inside components.

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rahulsinghparmar.site").replace(
  /\/$/,
  "",
);

export const profile = {
  name: "Rahul Singh Parmar",
  givenName: "Rahul",
  familyName: "Singh Parmar",
  role: "DCO Tech 3",
  employer: "Amazon Web Services (AWS)",
  headline:
    "AWS data center operations, network reliability, systems administration and practical automation.",
  statement:
    "I work where cloud becomes physical—and build the tools that keep operations clear, repeatable and calm.",
  introduction:
    "At Amazon Web Services, I work in data center operations with a foundation in connectivity, Windows and Linux administration, monitoring, incident response and security controls. Away from the shift, I write PowerShell, Python and edge tooling in my homelab to remove repeat work and make failures easier to diagnose.",
  location: "Mumbai, India",
  timezone: "UTC+05:30",
  experience: "4+ years",
  email: "rahulsinghparmar4@protonmail.com",
  siteUrl,
  repositoryUrl: "https://github.com/RahulSinghParmar/Portfolio",
  status: "PORTFOLIO ONLINE",
  disciplines: ["AWS Operations", "Networks", "Security", "Automation"] as const,
  links: [
    { label: "GitHub", href: "https://github.com/RahulSinghParmar" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/rahulsinghparmar4/" },
    { label: "Field notes", href: "https://rahulsinghparmar.hashnode.dev/" },
    { label: "X / Twitter", href: "https://twitter.com/rahulsingh474" },
  ] satisfies readonly ExternalLink[],
} as const;
