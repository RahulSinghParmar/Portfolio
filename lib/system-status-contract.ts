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
