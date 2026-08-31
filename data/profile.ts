import type { ExternalLink } from "./types";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rahulsinghparmar.site").replace(
  /\/$/,
  "",
);

export const profile = {
  name: "Rahul Singh Parmar",
  givenName: "Rahul",
  familyName: "Singh Parmar",
  role: "Team Lead Network Engineer",
  headline: "Network operations, systems administration, security, AWS and practical automation.",
  statement:
    "I keep networks and systems available, secure and recoverable—and automate the work that should not stay manual.",
  introduction:
    "I lead day-to-day network and infrastructure operations across connectivity, Windows and Linux administration, monitoring, incident response and security controls. In my homelab, I write PowerShell, Python and edge tooling to remove repeat work and make failures easier to diagnose.",
  location: "Mumbai, India",
  timezone: "UTC+05:30",
  experience: "4+ years",
  email: "rahulsinghparmar4@gmail.com",
  siteUrl,
  repositoryUrl: "https://github.com/RahulSinghParmar/Portfolio",
  status: "PORTFOLIO ONLINE",
  disciplines: ["Infrastructure", "Networks", "Security", "Automation"] as const,
  links: [
    { label: "GitHub", href: "https://github.com/RahulSinghParmar" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/rahulsinghparmar4/" },
    { label: "Field notes", href: "https://rahulsinghparmar.hashnode.dev/" },
    { label: "X / Twitter", href: "https://twitter.com/rahulsingh474" },
  ] satisfies readonly ExternalLink[],
} as const;
