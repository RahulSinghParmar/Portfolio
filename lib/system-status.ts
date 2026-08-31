import "server-only";

export type ServiceState = "operational" | "degraded" | "unavailable" | "unknown";

export type PublicServiceStatus = {
  name: string;
  state: ServiceState;
  responseTimeMs: number | null;
};

export type SystemStatus = {
  state: ServiceState | "pending";
  status: string;
  version: string;
  checkedAt: string | null;
  responseTimeMs: number | null;
  uptimePercent: number | null;
  region: string | null;
  source: "disconnected" | "live" | "unavailable";
  services: readonly PublicServiceStatus[];
};

const baseStatus = {
  version: process.env.NEXT_PUBLIC_SITE_VERSION ?? "v1.0.0",
  responseTimeMs: null,
  uptimePercent: null,
  region: null,
  services: [],
} as const;

const disconnectedStatus: SystemStatus = {
  ...baseStatus,
  state: "pending",
  status: "Status source not connected",
  checkedAt: null,
  source: "disconnected",
};

function safeText(value: unknown, fallback: string, maximumLength = 80) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maximumLength)
    : fallback;
}

function safeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeState(value: unknown): ServiceState {
  const state = typeof value === "string" ? value.toLowerCase() : "";
  if (["up", "online", "operational", "healthy"].includes(state)) return "operational";
  if (["degraded", "warning", "partial"].includes(state)) return "degraded";
  if (["down", "offline", "unavailable", "failed"].includes(state)) return "unavailable";
  return "unknown";
}

function normalizeTimestamp(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function normalizePayload(payload: unknown): SystemStatus {
  if (!payload || typeof payload !== "object") throw new Error("Invalid status payload");

  const record = payload as Record<string, unknown>;
  const rawServices = Array.isArray(record.services) ? record.services.slice(0, 12) : [];
  const services = rawServices
    .filter((service): service is Record<string, unknown> =>
      Boolean(service && typeof service === "object"),
    )
    .map((service) => ({
      name: safeText(service.name ?? service.service, "Unnamed service", 48),
      state: normalizeState(service.state ?? service.status),
      responseTimeMs: safeNumber(service.responseTimeMs ?? service.responseTime),
    }));

  const aggregateState = services.length
    ? services.some((service) => service.state === "unavailable")
      ? "unavailable"
      : services.some((service) => service.state === "degraded" || service.state === "unknown")
        ? "degraded"
        : "operational"
    : normalizeState(record.state ?? record.status);

  const responseTimes = services
    .map((service) => service.responseTimeMs)
    .filter((value): value is number => value !== null);
  const averageResponseTime = responseTimes.length
    ? Math.round(responseTimes.reduce((total, value) => total + value, 0) / responseTimes.length)
    : safeNumber(record.responseTimeMs ?? record.responseTime);

  return {
    state: aggregateState,
    status: safeText(
      record.status,
      aggregateState === "operational"
        ? "All monitored services operational"
        : aggregateState === "unavailable"
          ? "One or more services unavailable"
          : "Service state requires attention",
    ),
    version: safeText(record.version, baseStatus.version, 24),
    checkedAt: normalizeTimestamp(record.checkedAt ?? record.timestamp),
    responseTimeMs: averageResponseTime,
    uptimePercent: safeNumber(record.uptimePercent ?? record.uptime),
    region: typeof record.region === "string" ? safeText(record.region, "", 40) || null : null,
    source: "live",
    services,
  };
}

export async function getSystemStatus(): Promise<SystemStatus> {
  if (process.env.SYSTEM_STATUS_SOURCE !== "http" || !process.env.SYSTEM_STATUS_URL) {
    return disconnectedStatus;
  }

  try {
    const url = new URL(process.env.SYSTEM_STATUS_URL);
    if (url.protocol !== "https:" && process.env.NODE_ENV === "production") {
      throw new Error("Production status source must use HTTPS");
    }

    const timeout = Math.min(
      Math.max(Number(process.env.SYSTEM_STATUS_TIMEOUT_MS) || 3500, 1000),
      8000,
    );
    const headers: HeadersInit = { Accept: "application/json" };
    if (process.env.SYSTEM_STATUS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.SYSTEM_STATUS_TOKEN}`;
    }

    const response = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok) throw new Error(`Status source returned ${response.status}`);

    return normalizePayload(await response.json());
  } catch {
    return {
      ...baseStatus,
      state: "unavailable",
      status: "Status source temporarily unavailable",
      checkedAt: new Date().toISOString(),
      source: "unavailable",
    };
  }
}
