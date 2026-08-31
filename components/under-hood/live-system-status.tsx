"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SystemStatus } from "@/lib/system-status";

const stateLabels = {
  pending: "Awaiting source",
  operational: "Operational",
  degraded: "Degraded",
  unavailable: "Unavailable",
  unknown: "Unknown",
} as const;

function valueOrDash(value: string | number | null, suffix = "") {
  return value === null || value === "" ? "—" : `${value}${suffix}`;
}

export function LiveSystemStatus() {
  const statusRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldPoll, setShouldPoll] = useState(false);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    setIsLoading(true);

    try {
      const response = await fetch("/api/system-status", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Status request failed");
      setStatus((await response.json()) as SystemStatus);
    } catch {
      setStatus({
        state: "unavailable",
        status: "Status boundary unavailable",
        version: "—",
        checkedAt: null,
        responseTimeMs: null,
        uptimePercent: null,
        region: null,
        source: "unavailable",
        services: [],
      });
    } finally {
      window.clearTimeout(timeout);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const element = statusRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setShouldPoll(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setShouldPoll(entry.isIntersecting), {
      rootMargin: "600px 0px",
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldPoll) return;

    const initial = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 60_000);
    const handleVisibility = () => {
      if (!document.hidden) void refresh();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh, shouldPoll]);

  const state = status?.state ?? "pending";

  return (
    <div className="live-status" data-state={state} ref={statusRef}>
      <header>
        <div>
          <p className="mono-meta">Read-only status boundary</p>
          <h3>{status?.status ?? "Checking system state"}</h3>
        </div>
        <div
          className="live-status__state mono-meta"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span aria-hidden="true" />
          {isLoading ? "Checking" : stateLabels[state]}
        </div>
      </header>

      <dl className="live-status__metrics mono-meta">
        <div>
          <dt>Version</dt>
          <dd>{status?.version ?? "—"}</dd>
        </div>
        <div>
          <dt>Mean response</dt>
          <dd>{valueOrDash(status?.responseTimeMs ?? null, " ms")}</dd>
        </div>
        <div>
          <dt>Uptime</dt>
          <dd>{valueOrDash(status?.uptimePercent ?? null, "%")}</dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{status?.region ?? "—"}</dd>
        </div>
      </dl>

      {status?.services.length ? (
        <ul className="live-status__services" aria-label="Monitored services">
          {status.services.map((service) => (
            <li key={service.name}>
              <span className="mono-meta">{service.name}</span>
              <span className="mono-meta" data-state={service.state}>
                {stateLabels[service.state]}
                {service.responseTimeMs === null ? "" : ` / ${service.responseTimeMs} ms`}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="live-status__empty">
          {status?.source === "disconnected"
            ? "The secure adapter is ready. Connect a read-only monitoring endpoint to publish live service state."
            : "No service-level data is currently available."}
        </p>
      )}

      <footer className="mono-meta">
        <span>
          Source / {status?.source === "live" ? "server relay" : (status?.source ?? "pending")}
        </span>
        <button
          className="focus-ring"
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading}
        >
          Refresh state
        </button>
      </footer>
    </div>
  );
}
