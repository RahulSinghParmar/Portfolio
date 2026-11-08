import { certifications } from "@/data/certifications";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { educationHistory } from "@/data/professional";
import { skillLayers } from "@/data/skills";
import content from "@/content/portfolio.json";

export const siteMetadata = {
  ...content.seo,
  title: `${profile.name} — ${profile.role}${profile.employerShort ? ` at ${profile.employerShort}` : ""}`,
  socialImageAlt: `${profile.name} — ${profile.role} at ${profile.employer}`,
  keywords: [profile.name, profile.role, ...content.seo.keywords],
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
        image: absoluteUrl(profile.portrait.src),
        jobTitle: profile.role,
        worksFor: {
          "@type": "Organization",
          name: profile.employer,
        },
        email: profile.email,
        address: profile.location,
        sameAs: profile.links.map((link) => link.href),
        knowsAbout,
        hasCredential: [
          ...educationHistory.map((education) => ({
            "@type": "EducationalOccupationalCredential",
            name: `${education.degree} in ${education.discipline}`,
            credentialCategory: "degree",
          })),
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
        primaryImageOfPage: absoluteUrl(profile.portrait.src),
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
