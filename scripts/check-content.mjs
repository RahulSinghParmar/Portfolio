import { readFile, access } from "node:fs/promises";
import { resolve, join } from "node:path";
import Ajv from "ajv";

const root = resolve(import.meta.dirname, "..");
const content = JSON.parse(
  await readFile(process.argv[2] ?? join(root, "content/portfolio.json"), "utf8"),
);
const schema = JSON.parse(await readFile(join(root, "content/portfolio.schema.json"), "utf8"));
const validate = new Ajv({ allErrors: true }).compile(schema);
const errors = [];
if (!validate(content)) {
  for (const error of validate.errors ?? [])
    errors.push(`${error.instancePath || "/"}: ${error.message} ${JSON.stringify(error.params)}`);
}

if (!errors.length) {
  const unique = (items, field, label) => {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item[field])) errors.push(`${label}: duplicate ${field} '${item[field]}'`);
      seen.add(item[field]);
    }
  };
  unique(content.projects, "slug", "projects");
  unique(content.skillLayers, "id", "skillLayers");
  unique(content.contactChannels, "href", "contactChannels");
  const reserved = new Set([
    "index",
    "introduction",
    "work",
    "systems",
    "about",
    "architecture",
    "contact",
    "main-content",
  ]);
  for (const project of content.projects) {
    if (reserved.has(project.slug))
      errors.push(`projects: slug '${project.slug}' conflicts with a section`);
    if (project.architecture) {
      unique(project.architecture.nodes, "id", project.slug);
      unique(project.architecture.routes, "id", project.slug);
    }
  }
  if (content.experience.filter((item) => item.current).length > 1)
    errors.push("experience: only one current entry may inherit profile employment");
  if (content.profile.initials.length > 4)
    errors.push("profile.initials: use at most four characters for the icon");
  try {
    await access(join(root, "public", content.profile.portrait.src));
  } catch {
    errors.push(`profile.portrait.src: missing public asset ${content.profile.portrait.src}`);
  }
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? content.profile.siteUrl);
  if (
    url.protocol !== "https:" ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    errors.push(
      "profile.siteUrl: use an HTTPS origin without path, credentials, query or fragment",
    );
  const updated = content.seo.contentUpdated;
  if (
    !Number.isFinite(Date.parse(updated)) ||
    new Date(updated).toISOString().slice(0, 10) !== updated
  )
    errors.push("seo.contentUpdated: use a valid YYYY-MM-DD date");
}

if (errors.length) {
  console.error("\nContent needs attention:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Content valid: ${content.profile.name}; ${content.projects.length} projects, ${content.experience.length} roles, ${content.educationHistory.length} education entries, ${content.certifications.length} credentials.`,
  );
}
