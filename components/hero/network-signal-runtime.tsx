"use client";

import { useEffect, useRef } from "react";

type NetworkConnection = Navigator & { connection?: { saveData?: boolean } };

export function NetworkSignalRuntime() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.closest<HTMLElement>("[data-network-frame]");
    if (!canvas || !frame) return;

    const forceMotion = new URLSearchParams(window.location.search).get("motion") === "full";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator as NetworkConnection;
    const lowCapability = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2;
    const shouldSkipEngine = () =>
      !forceMotion && (reducedMotion.matches || lowCapability || connection.connection?.saveData);

    let disposed = false;
    let loading = false;
    let detach: (() => void) | undefined;
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const cancelScheduledLoad = () => {
      if (idleHandle !== undefined) {
        window.cancelIdleCallback(idleHandle);
        idleHandle = undefined;
      }
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
        timeoutHandle = undefined;
      }
    };

    const loadEngine = async () => {
      if (disposed || loading || detach || shouldSkipEngine()) return;
      loading = true;
      try {
        const { attachNetworkSignalEngine } = await import("./network-signal-engine");
        if (!disposed && !shouldSkipEngine()) detach = attachNetworkSignalEngine(frame, canvas);
      } catch {
        // The static SVG remains the complete fallback when enhancement cannot load.
      } finally {
        loading = false;
      }
    };

    const scheduleLoad = () => {
      if (disposed || loading || detach || shouldSkipEngine()) return;
      if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(
          () => {
            idleHandle = undefined;
            void loadEngine();
          },
          { timeout: 700 },
        );
      } else {
        timeoutHandle = setTimeout(() => {
          timeoutHandle = undefined;
          void loadEngine();
        }, 120);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        scheduleLoad();
      },
      { rootMargin: "120px" },
    );

    const handleMotionPreference = () => {
      if (forceMotion) return;
      cancelScheduledLoad();
      if (reducedMotion.matches) {
        observer.disconnect();
        detach?.();
        detach = undefined;
      } else if (!lowCapability && !connection.connection?.saveData) {
        observer.observe(frame);
      }
    };

    if (!shouldSkipEngine()) observer.observe(frame);
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      disposed = true;
      observer.disconnect();
      detach?.();
      cancelScheduledLoad();
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return <canvas className="network-signal-canvas" ref={canvasRef} aria-hidden="true" />;
}
