import { content } from "./content";

// Edit content/portfolio.json. This adapter keeps shared identity consistent.
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? content.profile.siteUrl).replace(/\/$/, "");
export const profile = {
  ...content.profile,
  siteUrl,
  links: content.contactChannels.filter((channel) => channel.identity),
};
