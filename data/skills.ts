import type { SkillLayer } from "./types";

export const skillLayers = [
  {
    index: "01",
    id: "network",
    label: "Network",
    description:
      "Designing and operating the paths that keep users, services, and sites connected.",
    signal: "Route / segment / resolve",
    x: 130,
    y: 84,
    items: ["Cisco", "Brocade", "Routing", "VLAN", "VPN", "DNS", "DHCP"],
  },
  {
    index: "02",
    id: "security",
    label: "Security",
    description:
      "Reducing attack surface through edge policy, endpoint control, and vulnerability work.",
    signal: "Inspect / harden / assess",
    x: 354,
    y: 54,
    items: ["Sophos Firewall", "Sophos Endpoint", "Nessus", "OpenVAS", "Vulnerability Assessment"],
  },
  {
    index: "03",
    id: "systems",
    label: "Systems",
    description:
      "Administering the operating systems, identities, and virtual platforms beneath applications.",
    signal: "Provision / govern / maintain",
    x: 574,
    y: 92,
    items: ["Linux", "Windows Server", "Active Directory", "Virtualization"],
  },
  {
    index: "04",
    id: "cloud",
    label: "Cloud",
    description: "Extending infrastructure into isolated, identity-aware AWS environments.",
    signal: "Isolate / authorize / scale",
    x: 630,
    y: 242,
    items: ["AWS", "EC2", "IAM", "VPC"],
  },
  {
    index: "05",
    id: "automation",
    label: "Automation",
    description:
      "Turning repeatable operational work into reviewed scripts and delivery workflows.",
    signal: "Script / review / execute",
    x: 486,
    y: 340,
    items: ["PowerShell", "Python", "Shell", "GitHub Actions"],
  },
  {
    index: "06",
    id: "observability",
    label: "Observability",
    description:
      "Converting service and network signals into useful detection and actionable alerts.",
    signal: "Measure / correlate / alert",
    x: 250,
    y: 350,
    items: ["PRTG", "Domotz", "Metrics", "Alerting"],
  },
  {
    index: "07",
    id: "platform",
    label: "Platform",
    description:
      "Running self-hosted applications as a connected Linux and container service estate.",
    signal: "Package / route / serve",
    x: 82,
    y: 232,
    items: ["Docker", "Nextcloud", "Jellyfin", "Mattermost", "Self-hosting"],
  },
] satisfies readonly SkillLayer[];
