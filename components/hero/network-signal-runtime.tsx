"use client";

import { useEffect, useRef } from "react";
import { motionEnabled, observeMotionPreference } from "@/lib/motion-preference";

export function NetworkSignalRuntime() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.closest<HTMLElement>("[data-network-frame]");
    if (!canvas || !frame) return;

    const shouldSkipEngine = () => !motionEnabled();

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
      cancelScheduledLoad();
      if (shouldSkipEngine()) {
        observer.disconnect();
        detach?.();
        detach = undefined;
      } else {
        observer.observe(frame);
      }
    };

    if (!shouldSkipEngine()) observer.observe(frame);
    const unobserve = observeMotionPreference(handleMotionPreference);

    return () => {
      disposed = true;
      observer.disconnect();
      detach?.();
      cancelScheduledLoad();
      unobserve();
    };
  }, []);

  return <canvas className="network-signal-canvas" ref={canvasRef} aria-hidden="true" />;
}
