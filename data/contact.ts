import type { ContactChannel } from "./types";

export const contactChannels = [
  {
    index: "01",
    label: "LinkedIn",
    value: "rahulsinghparmar4",
    href: "https://www.linkedin.com/in/rahulsinghparmar4/",
    description: "Professional background and engineering updates.",
  },
  {
    index: "02",
    label: "GitHub",
    value: "RahulSinghParmar",
    href: "https://github.com/RahulSinghParmar",
    description: "Source code, experiments, and infrastructure tooling.",
  },
  {
    index: "03",
    label: "Field notes",
    value: "rahulsinghparmar.hashnode.dev",
    href: "https://rahulsinghparmar.hashnode.dev/",
    description: "Writing across hardware, security, networking, and development.",
  },
  {
    index: "04",
    label: "Homelab",
    value: "dash.parmar.homes",
    href: "https://dash.parmar.homes",
    description: "The public operating surface for Rahul's self-hosted environment.",
  },
  {
    index: "05",
    label: "X / Twitter",
    value: "@rahulsingh474",
    href: "https://twitter.com/rahulsingh474",
    description: "Short-form technology notes and conversations.",
  },
  {
    index: "06",
    label: "Portfolio source",
    value: "RahulSinghParmar/Portfolio",
    href: "https://github.com/RahulSinghParmar/Portfolio",
    description: "The implementation, decisions, and release history behind this site.",
  },
] satisfies readonly ContactChannel[];
