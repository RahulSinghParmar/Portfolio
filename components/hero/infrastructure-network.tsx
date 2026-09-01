"use client";

import { useEffect, useRef, useState } from "react";

import { NetworkFoundation } from "./network-foundation";

type NetworkNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  depth: number;
  phase: number;
};

type Point = { x: number; y: number };

type NetworkPalette = {
  accent: string;
  caption: string;
  grid: string;
  label: string;
  labelActive: string;
  nodeActiveBorder: string;
  nodeBackground: string;
  nodeBorder: string;
  nodeCore: string;
  route: string;
  routeActive: string;
};

const networkNodes: readonly NetworkNode[] = [
  { id: "edge", label: "EDGE", x: 0.12, y: 0.23, depth: -0.35, phase: 0.4 },
  { id: "network", label: "NETWORK", x: 0.44, y: 0.13, depth: 0.5, phase: 1.1 },
  { id: "security", label: "SECURITY", x: 0.76, y: 0.32, depth: 0.15, phase: 2.2 },
  { id: "compute", label: "COMPUTE", x: 0.38, y: 0.56, depth: 0.75, phase: 2.9 },
  { id: "observe", label: "OBSERVE", x: 0.82, y: 0.7, depth: -0.2, phase: 3.8 },
  { id: "automate", label: "AUTOMATE", x: 0.14, y: 0.82, depth: 0.35, phase: 4.7 },
  { id: "cloud", label: "CLOUD", x: 0.6, y: 0.86, depth: -0.45, phase: 5.4 },
] as const;

const routes = [
  [0, 1],
  [1, 2],
  [2, 4],
  [4, 6],
  [6, 5],
  [5, 0],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [3, 6],
] as const;

const signals = [
  { route: 1, speed: 0.000035, offset: 0.08 },
  { route: 3, speed: 0.000027, offset: 0.53 },
  { route: 8, speed: 0.000031, offset: 0.3 },
] as const;

type NetworkConnection = Navigator & {
  connection?: { saveData?: boolean };
};

function readNetworkPalette(): NetworkPalette {
  const styles = window.getComputedStyle(document.documentElement);
  const read = (property: string, fallback: string) =>
    styles.getPropertyValue(property).trim() || fallback;

  return {
    accent: read("--accent", "#c7e85b"),
    caption: read("--network-caption", "rgba(153, 155, 149, 0.58)"),
    grid: read("--network-grid", "rgba(239, 237, 230, 0.052)"),
    label: read("--network-label", "rgba(153, 155, 149, 0.9)"),
    labelActive: read("--network-label-active", "rgba(239, 237, 230, 0.96)"),
    nodeActiveBorder: read("--network-node-active-border", "rgba(199, 232, 91, 0.72)"),
    nodeBackground: read("--network-node-background", "rgba(11, 12, 12, 0.92)"),
    nodeBorder: read("--network-node-border", "rgba(239, 237, 230, 0.4)"),
    nodeCore: read("--network-node-core", "#efede6"),
    route: read("--network-route", "rgba(239, 237, 230, 0.26)"),
    routeActive: read("--network-route-active", "rgba(199, 232, 91, 0.28)"),
  };
}

export function InfrastructureNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const networkConnection = navigator as NetworkConnection;
    const forceMotion = new URLSearchParams(window.location.search).get("motion") === "full";
    const shouldUseFallback =
      !forceMotion &&
      (reducedMotion.matches ||
        (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) ||
        networkConnection.connection?.saveData === true);

    if (shouldUseFallback) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let previousFrame = 0;
    let isVisible = true;
    let pointerInside = false;
    let scrollProgress = 0;
    let palette = readNetworkPalette();
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };

    const resize = () => {
      const bounds = frame.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const projectNode = (node: NetworkNode, time: number): Point => {
      const driftX = Math.sin(time * 0.00012 + node.phase) * 3.2;
      const driftY = Math.cos(time * 0.0001 + node.phase) * 2.4;
      const depthShift = 14 * node.depth;
      const scrollSpread = (node.y - 0.5) * scrollProgress * 22;

      return {
        x: node.x * width + pointer.x * depthShift + driftX,
        y: node.y * height + pointer.y * depthShift + driftY + scrollSpread,
      };
    };

    const drawGrid = () => {
      const columns = 12;
      const rows = 8;
      context.beginPath();
      for (let column = 0; column <= columns; column += 1) {
        const x = (column / columns) * width;
        context.moveTo(x, 0);
        context.lineTo(x, height);
      }
      for (let row = 0; row <= rows; row += 1) {
        const y = (row / rows) * height;
        context.moveTo(0, y);
        context.lineTo(width, y);
      }
      context.strokeStyle = palette.grid;
      context.lineWidth = 1;
      context.stroke();
    };

    const draw = (time: number) => {
      pointer.x += (pointerTarget.x - pointer.x) * 0.055;
      pointer.y += (pointerTarget.y - pointer.y) * 0.055;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      drawGrid();

      const points = networkNodes.map((node) => projectNode(node, time));

      context.lineWidth = 0.8;
      routes.forEach(([fromIndex, toIndex], routeIndex) => {
        const from = points[fromIndex];
        const to = points[toIndex];
        const active = routeIndex === 1 || routeIndex === 8;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.strokeStyle = active ? palette.routeActive : palette.route;
        context.stroke();
      });

      signals.forEach((signal) => {
        const [fromIndex, toIndex] = routes[signal.route];
        const from = points[fromIndex];
        const to = points[toIndex];
        const progress = (time * signal.speed + signal.offset) % 1;
        const signalX = from.x + (to.x - from.x) * progress;
        const signalY = from.y + (to.y - from.y) * progress;

        context.beginPath();
        context.arc(signalX, signalY, 2.4, 0, Math.PI * 2);
        context.fillStyle = palette.accent;
        context.fill();
      });

      points.forEach((point, index) => {
        const node = networkNodes[index];
        const distance = Math.hypot(
          point.x - (pointer.x * 0.5 + 0.5) * width,
          point.y - (pointer.y * 0.5 + 0.5) * height,
        );
        const isNearPointer = pointerInside && distance < Math.min(width, height) * 0.18;
        const outerRadius = isNearPointer ? 15 : 11;

        context.beginPath();
        context.arc(point.x, point.y, outerRadius, 0, Math.PI * 2);
        context.fillStyle = palette.nodeBackground;
        context.fill();
        context.strokeStyle = isNearPointer ? palette.nodeActiveBorder : palette.nodeBorder;
        context.lineWidth = 0.8;
        context.stroke();

        context.beginPath();
        context.arc(point.x, point.y, isNearPointer ? 3.8 : 2.8, 0, Math.PI * 2);
        context.fillStyle = isNearPointer ? palette.accent : palette.nodeCore;
        context.fill();

        context.fillStyle = isNearPointer ? palette.labelActive : palette.label;
        context.font = "9px var(--font-geist-mono), monospace";
        context.letterSpacing = "0.8px";
        context.fillText(node.label, point.x + 17, point.y + 3);
      });

      context.fillStyle = palette.caption;
      context.font = "8px var(--font-geist-mono), monospace";
      context.letterSpacing = "0.7px";
      context.fillText("SYS / 07", 12, 18);
      context.fillText(
        `DEPTH / ${(scrollProgress * 100).toFixed(0).padStart(3, "0")}`,
        12,
        height - 12,
      );
    };

    const animate = (time: number) => {
      if (!isVisible) return;
      animationFrame = window.requestAnimationFrame(animate);
      if (time - previousFrame < 1000 / 30) return;
      previousFrame = time;
      draw(time);
    };

    const start = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = frame.getBoundingClientRect();
      pointerTarget.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerTarget.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      pointerInside = true;
    };

    const handlePointerLeave = () => {
      pointerInside = false;
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };

    const handleScroll = () => {
      scrollProgress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else if (animationFrame) window.cancelAnimationFrame(animationFrame);
      },
      { rootMargin: "120px" },
    );
    const themeObserver = new MutationObserver(() => {
      palette = readNetworkPalette();
      if (isVisible) draw(window.performance.now());
    });

    resizeObserver.observe(frame);
    visibilityObserver.observe(frame);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    frame.addEventListener("pointermove", handlePointerMove, { passive: true });
    frame.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    resize();
    setIsEnhanced(true);
    start();

    return () => {
      setIsEnhanced(false);
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      frame.removeEventListener("pointermove", handlePointerMove);
      frame.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <figure className="infrastructure-network" data-enhanced={isEnhanced}>
      <div className="infrastructure-network__frame" ref={frameRef}>
        <NetworkFoundation />
        <canvas ref={canvasRef} aria-hidden="true" />
        <span className="infrastructure-network__crosshair" aria-hidden="true" />
      </div>
      <figcaption id="network-caption">
        <span>TOPOLOGY / LIVE</span>
        <span className="infrastructure-network__mode">
          {isEnhanced ? "Cursor-responsive routing" : "Static low-power route map"}
        </span>
      </figcaption>
    </figure>
  );
}
