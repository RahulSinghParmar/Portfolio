import type {
  PublicServiceStatus,
  ServiceState,
  SystemStatus,
} from "../lib/system-status-contract.ts";
import type { PortfolioWorkerEnv, WorkerDependencies } from "./environment.ts";

const defaultVersion = "v1.0.0";
const defaultTimeoutMs = 3500;
const minimumTimeoutMs = 1000;
const maximumTimeoutMs = 8000;
const maximumResponseBytes = 64 * 1024;

type StatusConfiguration =
  | { mode: "disabled"; version: string }
  | { mode: "invalid"; version: string }
  | {
      mode: "http";
      version: string;
      url: URL;
      token?: string;
      timeoutMs: number;
    };

function safeText(value: unknown, fallback: string, maximumLength = 80) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maximumLength)
    : fallback;
}

function safeMetric(value: unknown, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
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

function baseStatus(version: string) {
  return {
    version,
    responseTimeMs: null,
    uptimePercent: null,
    region: null,
    services: [],
  } as const;
}

function disconnectedStatus(version: string): SystemStatus {
  return {
    ...baseStatus(version),
    state: "pending",
    status: "Status source not connected",
    checkedAt: null,
    source: "disconnected",
  };
}

function unavailableStatus(version: string, now: Date): SystemStatus {
  return {
    ...baseStatus(version),
    state: "unavailable",
    status: "Status source temporarily unavailable",
    checkedAt: now.toISOString(),
    source: "unavailable",
  };
}

export function resolveStatusConfiguration(env: PortfolioWorkerEnv): StatusConfiguration {
  const version = safeText(env.SITE_VERSION, defaultVersion, 24);
  if (env.SYSTEM_STATUS_SOURCE !== "http" || !env.SYSTEM_STATUS_URL?.trim()) {
    return { mode: "disabled", version };
  }

  try {
    const url = new URL(env.SYSTEM_STATUS_URL);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.hash) {
      return { mode: "invalid", version };
    }

    const configuredTimeout = Number.parseInt(env.SYSTEM_STATUS_TIMEOUT_MS ?? "", 10);
    const timeoutMs = Number.isFinite(configuredTimeout)
      ? Math.min(Math.max(configuredTimeout, minimumTimeoutMs), maximumTimeoutMs)
      : defaultTimeoutMs;

    return {
      mode: "http",
      version,
      url,
      token: env.SYSTEM_STATUS_TOKEN?.trim() || undefined,
      timeoutMs,
    };
  } catch {
    return { mode: "invalid", version };
  }
}

async function readBoundedJson(response: Response) {
  const declaredLength = Number.parseInt(response.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > maximumResponseBytes) {
    throw new Error("Status response exceeds the size limit");
  }

  if (!response.body) throw new Error("Status response has no body");

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > maximumResponseBytes) {
        await reader.cancel("Status response exceeds the size limit");
        throw new Error("Status response exceeds the size limit");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder().decode(body)) as unknown;
}

export function normalizeStatusPayload(payload: unknown, version: string): SystemStatus {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid status payload");
  }

  const record = payload as Record<string, unknown>;
  const rawServices = Array.isArray(record.services) ? record.services.slice(0, 12) : [];
  const services: PublicServiceStatus[] = rawServices
    .filter((service): service is Record<string, unknown> =>
      Boolean(service && typeof service === "object" && !Array.isArray(service)),
    )
    .map((service) => ({
      name: safeText(service.name ?? service.service, "Unnamed service", 48),
      state: normalizeState(service.state ?? service.status),
      responseTimeMs: safeMetric(service.responseTimeMs ?? service.responseTime),
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
    : safeMetric(record.responseTimeMs ?? record.responseTime);

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
    version: safeText(record.version, version, 24),
    checkedAt: normalizeTimestamp(record.checkedAt ?? record.timestamp),
    responseTimeMs: averageResponseTime,
    uptimePercent: safeMetric(record.uptimePercent ?? record.uptime, 0, 100),
    region: typeof record.region === "string" ? safeText(record.region, "", 40) || null : null,
    source: "live",
    services,
  };
}

export async function getSystemStatus(
  env: PortfolioWorkerEnv,
  dependencies: WorkerDependencies = {},
): Promise<SystemStatus> {
  const configuration = resolveStatusConfiguration(env);
  if (configuration.mode === "disabled") return disconnectedStatus(configuration.version);

  const now = dependencies.now ?? (() => new Date());
  if (configuration.mode === "invalid") return unavailableStatus(configuration.version, now());

  const fetcher = dependencies.fetch ?? fetch;
  const headers = new Headers({ Accept: "application/json" });
  if (configuration.token) headers.set("Authorization", `Bearer ${configuration.token}`);

  try {
    const response = await fetcher(configuration.url, {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(configuration.timeoutMs),
    });
    if (!response.ok || response.status >= 300) throw new Error("Status source request failed");

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/json") && !contentType.includes("+json")) {
      throw new Error("Status source did not return JSON");
    }

    return normalizeStatusPayload(await readBoundedJson(response), configuration.version);
  } catch {
    return unavailableStatus(configuration.version, now());
  }
}
