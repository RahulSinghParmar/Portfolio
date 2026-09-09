import { certifications } from "@/data/certifications";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { education } from "@/data/professional";
import { skillLayers } from "@/data/skills";

export const siteMetadata = {
  title: `${profile.name} — ${profile.role} at AWS`,
  description:
    "Rahul Singh Parmar is a DCO Tech 3 at Amazon Web Services in Mumbai, focused on data center operations, networks, automation, and reliable systems.",
  socialDescription:
    "AWS data center operations, network engineering, security, automation, and self-hosted systems.",
  locale: "en_IN",
  language: "en-IN",
  twitterHandle: "@rahulsingh474",
  contentUpdated: "2026-09-08",
  socialImageAlt: "Rahul Singh Parmar — DCO Tech 3 at Amazon Web Services and automation builder",
  keywords: [
    "Rahul Singh Parmar",
    "DCO Tech 3",
    "Data Center Operations",
    "Network Engineer Mumbai",
    "Infrastructure Engineer",
    "Network Security",
    "Infrastructure Operations",
    "Systems Administration",
    "AWS",
    "Cloud Infrastructure",
    "DevOps",
    "Automation Engineer",
    "PowerShell",
    "Python",
    "Linux",
    "Windows Server",
    "Docker",
    "Cloudflare Workers",
    "Homelab",
    "Self Hosting",
  ],
} as const;

const absoluteUrl = (path: string) => new URL(path, profile.siteUrl).toString();

export function buildStructuredData() {
  const identifiers = {
    person: `${profile.siteUrl}/#person`,
    website: `${profile.siteUrl}/#website`,
    page: `${profile.siteUrl}/#profile-page`,
    work: `${profile.siteUrl}/#selected-work`,
  } as const;

  const knowsAbout = Array.from(
    new Set([
      ...profile.disciplines,
      ...skillLayers.map((layer) => layer.label),
      "Data Center Operations",
      "AWS",
      "PowerShell",
      "Python",
      "Linux",
      "Windows Server",
      "Docker",
      "Cloudflare Workers",
      "Homelab",
    ]),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": identifiers.person,
        name: profile.name,
        givenName: profile.givenName,
        familyName: profile.familyName,
        url: profile.siteUrl,
        image: absoluteUrl("/images/rahul-portrait.webp"),
        jobTitle: profile.role,
        worksFor: {
          "@type": "Organization",
          name: profile.employer,
        },
        email: profile.email,
        address: "Mumbai, India",
        sameAs: profile.links.map((link) => link.href),
        knowsAbout,
        hasCredential: [
          {
            "@type": "EducationalOccupationalCredential",
            name: `${education.degree} in ${education.discipline}`,
            credentialCategory: "degree",
          },
          ...certifications.map((certification) => ({
            "@type": "EducationalOccupationalCredential",
            name: certification.name,
            credentialCategory: "certificate",
          })),
        ],
        mainEntityOfPage: { "@id": identifiers.page },
      },
      {
        "@type": "WebSite",
        "@id": identifiers.website,
        url: profile.siteUrl,
        name: `${profile.name} — Portfolio`,
        inLanguage: siteMetadata.language,
        publisher: { "@id": identifiers.person },
      },
      {
        "@type": "ProfilePage",
        "@id": identifiers.page,
        url: profile.siteUrl,
        name: siteMetadata.title,
        inLanguage: siteMetadata.language,
        dateModified: siteMetadata.contentUpdated,
        isPartOf: { "@id": identifiers.website },
        mainEntity: { "@id": identifiers.person },
        primaryImageOfPage: absoluteUrl("/images/rahul-portrait.webp"),
        hasPart: { "@id": identifiers.work },
      },
      {
        "@type": "ItemList",
        "@id": identifiers.work,
        name: "Selected infrastructure and automation work",
        numberOfItems: projects.length,
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: project.title,
          url: `${profile.siteUrl}/#${project.slug}`,
        })),
      },
    ],
  };
}
