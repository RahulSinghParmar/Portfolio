import type { Project } from "./types";

export const projects = [
  {
    index: "01",
    slug: "home-server-heartbeat",
    title: "Home Server Heartbeat",
    summary:
      "An edge-run health monitor that distinguishes a real outage from a transient failed request.",
    role: "Infrastructure + automation",
    year: "2026",
    technologies: ["Cloudflare Workers", "KV", "Resend", "JavaScript"],
    challenge:
      "Public homelab services need continuous checks, but single-request alerting creates noise and makes recovery harder to trust.",
    approach:
      "A scheduled Worker probes each service with a ten-second timeout, records consecutive results in KV, and treats redirects as reachable responses.",
    automation:
      "Cloudflare Cron runs the monitor every five minutes. Email is emitted only after three failures or two successful recovery checks.",
    security:
      "Notification credentials stay in Worker secrets, while the repository contains only deployment configuration and non-sensitive routing logic.",
    observability:
      "Each run reports service state, HTTP status, response time, and transition counters; Worker observability is enabled at the platform layer.",
    outcome:
      "A low-maintenance feedback loop for Immich, Nextcloud, Vaultwarden, and the Glance dashboard—with state-aware outage and recovery signals.",
    metrics: [
      { value: "05m", label: "check cadence" },
      { value: "03", label: "failures to alert" },
      { value: "02", label: "checks to recover" },
    ],
    architecture: {
      label: "Scheduled checks become state-aware notifications",
      nodes: [
        { id: "cron", label: "CRON", detail: "05 MIN", x: 72, y: 98, align: "start" },
        { id: "worker", label: "WORKER", detail: "EDGE PROBE", x: 252, y: 98 },
        { id: "services", label: "SERVICES", detail: "04 ROUTES", x: 476, y: 98 },
        { id: "kv", label: "KV STATE", detail: "THRESHOLDS", x: 252, y: 240 },
        { id: "resend", label: "RESEND", detail: "TRANSITIONS", x: 648, y: 240, align: "end" },
      ],
      routes: [
        { id: "trigger", path: "M72 98 H252", label: "TRIGGER", labelX: 162, labelY: 82 },
        { id: "probe", path: "M252 98 H476", label: "HTTP PROBE", labelX: 364, labelY: 82 },
        {
          id: "result",
          path: "M476 98 C476 184 390 240 252 240",
          label: "RESULT",
          labelX: 415,
          labelY: 184,
        },
        {
          id: "notify",
          path: "M252 240 H648",
          label: "STATE CHANGE ONLY",
          labelX: 450,
          labelY: 224,
        },
      ],
    },
    repositoryUrl: "https://github.com/RahulSinghParmar/home-server-heartbeat",
    liveUrl: null,
  },
  {
    index: "02",
    slug: "infrastructure-maintenance-page",
    title: "Infrastructure Maintenance Edge",
    summary:
      "A Cloudflare Worker that converts tunnel and origin failures into a useful, protocol-correct maintenance response.",
    role: "Edge + interface engineering",
    year: "2026",
    technologies: ["Cloudflare Workers", "HTTP", "JavaScript", "Edge delivery"],
    challenge:
      "When a tunnel or origin disappears, a default provider error gives visitors no context and gives crawlers the wrong operational signal.",
    approach:
      "The Worker forwards healthy requests unchanged, intercepts known Cloudflare and origin failure codes, and catches disconnected-tunnel exceptions.",
    automation:
      "The maintenance response includes a thirty-second retry contract and an in-page countdown, allowing the service path to recover without manual intervention.",
    security:
      "The fallback is deliberately static and dependency-light. No origin credentials or privileged control surface are exposed to the browser.",
    observability:
      "Worker observability is enabled, and failure classes remain explicit through temporary-unavailability response semantics.",
    outcome:
      "Visitors receive a branded recovery state while crawlers receive HTTP 503, Retry-After, and no-cache headers instead of a misleading permanent failure.",
    metrics: [
      { value: "503", label: "temporary status" },
      { value: "30s", label: "retry contract" },
      { value: "05", label: "failure codes" },
    ],
    architecture: {
      label: "Healthy traffic passes through; failure traffic falls back at the edge",
      nodes: [
        { id: "visitor", label: "REQUEST", detail: "PUBLIC EDGE", x: 72, y: 112, align: "start" },
        { id: "worker", label: "WORKER", detail: "STATUS GATE", x: 282, y: 112 },
        { id: "origin", label: "ORIGIN", detail: "TUNNEL", x: 648, y: 72, align: "end" },
        { id: "fallback", label: "FALLBACK", detail: "HTTP 503", x: 648, y: 238, align: "end" },
      ],
      routes: [
        { id: "request", path: "M72 112 H282", label: "REQUEST", labelX: 177, labelY: 96 },
        {
          id: "healthy",
          path: "M282 112 C420 112 464 72 648 72",
          label: "2XX / 3XX",
          labelX: 475,
          labelY: 67,
        },
        {
          id: "failure",
          path: "M282 112 C420 112 464 238 648 238",
          label: "5XX / EXCEPTION",
          labelX: 475,
          labelY: 211,
        },
      ],
    },
    repositoryUrl: "https://github.com/RahulSinghParmar/maintenance-page",
    liveUrl: null,
  },
  {
    index: "03",
    slug: "homelab-dashboard",
    title: "Homelab Dashboard",
    summary:
      "A single operational surface for navigating and checking the services that make up the parmar.homes homelab.",
    role: "Homelab + platform operations",
    year: "Current",
    technologies: ["Glance", "Docker", "Linux", "Cloudflare Tunnel"],
    challenge:
      "A growing self-hosted environment becomes difficult to operate when service entry points, availability, and ownership are scattered.",
    approach:
      "The Glance dashboard acts as the front door to a Linux and Docker-based service estate, keeping the operational surface compact and legible.",
    automation:
      "The dashboard itself is included in the five-minute heartbeat cycle, so the control surface is monitored alongside the services it represents.",
    security:
      "Public routing is separated from the private service layer through the tunnel and reverse-proxy path rather than exposing the host directly.",
    observability:
      "The dashboard, Immich, Nextcloud, and Vaultwarden each have purpose-built health endpoints consumed by the external heartbeat worker.",
    outcome:
      "One memorable entry point connects daily self-hosted tools while the surrounding monitor and maintenance edge cover failure and recovery states.",
    metrics: [
      { value: "04", label: "monitored routes" },
      { value: "24/7", label: "service intent" },
      { value: "01", label: "operational entry" },
    ],
    architecture: {
      label: "A public entry point routes to a private, monitored service layer",
      nodes: [
        { id: "edge", label: "EDGE", detail: "TUNNEL", x: 72, y: 160, align: "start" },
        { id: "proxy", label: "PROXY", detail: "ROUTING", x: 250, y: 160 },
        { id: "glance", label: "GLANCE", detail: "DASHBOARD", x: 438, y: 160 },
        { id: "apps-a", label: "MEDIA", detail: "IMMICH", x: 648, y: 72, align: "end" },
        { id: "apps-b", label: "CLOUD", detail: "NEXTCLOUD", x: 648, y: 160, align: "end" },
        { id: "apps-c", label: "VAULT", detail: "VAULTWARDEN", x: 648, y: 248, align: "end" },
      ],
      routes: [
        { id: "tunnel", path: "M72 160 H250", label: "HTTPS", labelX: 161, labelY: 144 },
        { id: "route", path: "M250 160 H438", label: "ROUTE", labelX: 344, labelY: 144 },
        {
          id: "media",
          path: "M438 160 C510 160 540 72 648 72",
          label: "SERVICE",
          labelX: 552,
          labelY: 91,
        },
        { id: "cloud", path: "M438 160 H648", label: "SERVICE", labelX: 543, labelY: 144 },
        {
          id: "vault",
          path: "M438 160 C510 160 540 248 648 248",
          label: "SERVICE",
          labelX: 552,
          labelY: 235,
        },
      ],
    },
    repositoryUrl: null,
    liveUrl: "https://dash.parmar.homes",
  },
] satisfies readonly Project[];
