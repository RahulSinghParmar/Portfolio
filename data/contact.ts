import { content } from "./content";

export const contactChannels = content.contactChannels.map((channel, index) => ({
  ...channel,
  index: String(index + 1).padStart(2, "0"),
}));
