type Point = { x: number; y: number };
type Particle = Point & {
  active: boolean;
  age: number;
  life: number;
  size: number;
  tone: number;
  vx: number;
  vy: number;
};
type Pulse = Point & { active: boolean; age: number; life: number };
type ProtectedRegion = { bottom: number; left: number; right: number; top: number };
type Topology = {
  ids: readonly string[];
  nodes: readonly Point[];
  routes: readonly (readonly [number, number])[];
};

const topologies: readonly [number, Topology][] = [
  [
    768,
    {
      ids: ["edge", "network", "cloud"],
      nodes: [
        { x: 0.118, y: 0.512 },
        { x: 0.297, y: 0.649 },
        { x: 0.138, y: 0.735 },
      ],
      routes: [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
    },
  ],
  [
    1024,
    {
      ids: ["edge", "network", "security", "compute", "cloud"],
      nodes: [
        { x: 0.362, y: 0.231 },
        { x: 0.571, y: 0.14 },
        { x: 0.678, y: 0.324 },
        { x: 0.504, y: 0.518 },
        { x: 0.669, y: 0.722 },
      ],
      routes: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
        [0, 3],
        [1, 3],
      ],
    },
  ],
  [
    Number.POSITIVE_INFINITY,
    {
      ids: ["edge", "network", "security", "compute", "observe", "cloud", "automate"],
      nodes: [
        { x: 0.365, y: 0.224 },
        { x: 0.528, y: 0.14 },
        { x: 0.696, y: 0.262 },
        { x: 0.499, y: 0.478 },
        { x: 0.71, y: 0.62 },
        { x: 0.569, y: 0.782 },
        { x: 0.381, y: 0.713 },
      ],
      routes: [
        [0, 1],
        [1, 2],
        [2, 4],
        [4, 5],
        [5, 6],
        [6, 0],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 4],
        [3, 5],
        [3, 6],
      ],
    },
  ],
] as const;

const protectedSelectors = [".hero__title-wrap", ".hero__portrait", ".hero__metadata"];
const selectTopology = (width: number) => topologies.find(([limit]) => width < limit)![1];

export function attachNetworkSignalEngine(frame: HTMLElement, canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return () => undefined;
  const drawingContext = context;

  const surface = frame.closest<HTMLElement>(".hero") ?? frame;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const particlePool: Particle[] = Array.from({ length: 24 }, () => ({
    active: false,
    age: 0,
    life: 0,
    size: 0,
    tone: 0,
    vx: 0,
    vy: 0,
    x: 0,
    y: 0,
  }));
  const pulsePool: Pulse[] = Array.from({ length: 2 }, () => ({
    active: false,
    age: 0,
    life: 0,
    x: 0,
    y: 0,
  }));
  const ambientOffsets = [0.08, 0.43, 0.76];
  let width = 1;
  let height = 1;
  let ratio = 1;
  let frameId = 0;
  let previousFrame = 0;
  let visible = false;
  let disposed = false;
  let accent = "#c7e85b";
  let foreground = "#efede6";
  let lastPointer: Point | undefined;
  let lastSpawn = 0;
  let particleSequence = 0;
  let nearNode: string | undefined;
  let tapHighlightUntil = 0;
  let protectedRegions: ProtectedRegion[] = [];

  const pointerLimit = () => (width < 768 ? 0 : width < 1024 ? 12 : 24);
  const targetFrameInterval = () => 1000 / (width < 768 ? 20 : 30);

  const readPalette = () => {
    const styles = getComputedStyle(document.documentElement);
    accent = styles.getPropertyValue("--accent").trim() || accent;
    foreground = styles.getPropertyValue("--foreground").trim() || foreground;
  };

  const rebuildProtectedRegions = (frameBounds: DOMRect) => {
    protectedRegions = protectedSelectors.flatMap((selector) => {
      const element = surface.querySelector<HTMLElement>(selector);
      if (!element) return [];
      const bounds = element.getBoundingClientRect();
      const inset = 12;
      return [
        {
          top: bounds.top - frameBounds.top - inset,
          right: bounds.right - frameBounds.left + inset,
          bottom: bounds.bottom - frameBounds.top + inset,
          left: bounds.left - frameBounds.left - inset,
        },
      ];
    });
  };

  const resize = () => {
    const bounds = frame.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    rebuildProtectedRegions(bounds);

    const maximum = pointerLimit();
    particlePool.forEach((particle, index) => {
      if (index >= maximum) particle.active = false;
    });
  };

  const setNearNode = (id?: string) => {
    if (nearNode === id) return;
    frame
      .querySelectorAll<SVGGElement>("[data-network-node][data-near]")
      .forEach((node) => delete node.dataset.near);
    nearNode = id;
    if (id)
      frame
        .querySelectorAll<SVGGElement>(`[data-network-node="${id}"]`)
        .forEach((node) => (node.dataset.near = "true"));
  };

  const toLocalPoint = (event: PointerEvent) => {
    const bounds = frame.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const isInsideFrame = (point: Point) =>
    point.x >= 0 && point.y >= 0 && point.x <= width && point.y <= height;

  const closestNode = (topology: Topology, point: Point) => {
    const distances = topology.nodes.map((node) =>
      Math.hypot(node.x * width - point.x, node.y * height - point.y),
    );
    const index = distances.indexOf(Math.min(...distances));
    return { distance: distances[index], id: topology.ids[index] };
  };

  const closestRoutePoint = (topology: Topology, point: Point) =>
    topology.routes.reduce(
      (best, [fromIndex, toIndex]) => {
        const from = topology.nodes[fromIndex];
        const to = topology.nodes[toIndex];
        const start = { x: from.x * width, y: from.y * height };
        const end = { x: to.x * width, y: to.y * height };
        const routeX = end.x - start.x;
        const routeY = end.y - start.y;
        const routeLengthSquared = routeX * routeX + routeY * routeY || 1;
        const progress = Math.max(
          0,
          Math.min(
            1,
            ((point.x - start.x) * routeX + (point.y - start.y) * routeY) / routeLengthSquared,
          ),
        );
        const target = { x: start.x + routeX * progress, y: start.y + routeY * progress };
        const distance = Math.hypot(target.x - point.x, target.y - point.y);
        return distance < best.distance ? { distance, target } : best;
      },
      { distance: Number.POSITIVE_INFINITY, target: point },
    ).target;

  const visibilityAt = (point: Point) =>
    protectedRegions.some(
      (region) =>
        point.x >= region.left &&
        point.x <= region.right &&
        point.y >= region.top &&
        point.y <= region.bottom,
    )
      ? 0.08
      : 1;

  const spawnPointerPacket = (point: Point, now: number) => {
    const maximum = pointerLimit();
    if (!finePointer.matches || maximum === 0) return;
    let slot: Particle | undefined;
    for (let index = 0; index < maximum; index += 1) {
      if (!particlePool[index].active) {
        slot = particlePool[index];
        break;
      }
    }
    if (!slot) return;

    const routePoint = closestRoutePoint(selectTopology(width), point);
    const dx = routePoint.x - point.x;
    const dy = routePoint.y - point.y;
    const magnitude = Math.max(Math.hypot(dx, dy), 1);
    const tablet = width < 1024;
    Object.assign(slot, {
      active: true,
      age: 0,
      life: tablet ? 400 + Math.random() * 200 : 450 + Math.random() * 250,
      size: 1.4 + Math.random() * 2,
      tone: particleSequence % 3,
      vx: (dx / magnitude) * 0.12 + (Math.random() - 0.5) * 0.08,
      vy: (dy / magnitude) * 0.12 + (Math.random() - 0.5) * 0.08,
      ...point,
    });
    particleSequence += 1;
    lastSpawn = now;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!finePointer.matches) return;
    const point = toLocalPoint(event);
    if (!isInsideFrame(point)) return;

    frame.style.setProperty("--network-shift-x", `${(point.x / width - 0.5) * 10}px`);
    frame.style.setProperty("--network-shift-y", `${(point.y / height - 0.5) * 7}px`);

    const nearest = closestNode(selectTopology(width), point);
    setNearNode(nearest.distance < Math.min(width, height) * 0.13 ? nearest.id : undefined);

    const now = performance.now();
    const threshold = width < 1024 ? 24 : 18;
    const interval = width < 1024 ? 32 : 24;
    if (
      !lastPointer ||
      (Math.hypot(lastPointer.x - point.x, lastPointer.y - point.y) >= threshold &&
        now - lastSpawn >= interval)
    ) {
      spawnPointerPacket(point, now);
      lastPointer = point;
    }
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (width >= 768 || event.pointerType === "mouse") return;
    const point = toLocalPoint(event);
    if (!isInsideFrame(point)) return;
    const pulse = pulsePool.find((candidate) => !candidate.active) ?? pulsePool[0];
    Object.assign(pulse, { active: true, age: 0, life: 520, ...point });

    const nearest = closestNode(selectTopology(width), point);
    if (nearest.distance < Math.min(width, height) * 0.18) {
      setNearNode(nearest.id);
      tapHighlightUntil = performance.now() + 520;
    }
  };

  const resetPointerState = () => {
    lastPointer = undefined;
    tapHighlightUntil = 0;
    setNearNode();
    frame.style.setProperty("--network-shift-x", "0px");
    frame.style.setProperty("--network-shift-y", "0px");
  };

  const drawAmbientPackets = (time: number, topology: Topology) => {
    ambientOffsets.forEach((offset, index) => {
      const [fromIndex, toIndex] = topology.routes[index % topology.routes.length];
      const from = topology.nodes[fromIndex];
      const to = topology.nodes[toIndex];
      const progress = (time * (0.000025 + index * 0.000004) + offset) % 1;
      const point = {
        x: (from.x + (to.x - from.x) * progress) * width,
        y: (from.y + (to.y - from.y) * progress) * height,
      };
      drawingContext.globalAlpha = visibilityAt(point);
      drawingContext.beginPath();
      drawingContext.arc(point.x, point.y, width < 768 ? 2 : 2.5, 0, Math.PI * 2);
      drawingContext.fillStyle = accent;
      drawingContext.shadowColor = accent;
      drawingContext.shadowBlur = 9;
      drawingContext.fill();
    });
  };

  const drawPointerPackets = (elapsed: number) => {
    drawingContext.shadowBlur = 0;
    particlePool.forEach((particle) => {
      if (!particle.active) return;
      particle.age += elapsed;
      if (particle.age >= particle.life) {
        particle.active = false;
        return;
      }
      particle.x += particle.vx * elapsed;
      particle.y += particle.vy * elapsed;
      const alpha = (1 - particle.age / particle.life) * visibilityAt(particle);
      drawingContext.globalAlpha = alpha;
      drawingContext.beginPath();
      drawingContext.arc(particle.x, particle.y, particle.size * alpha + 0.5, 0, Math.PI * 2);
      drawingContext.fillStyle = particle.tone === 0 ? foreground : accent;
      drawingContext.fill();
    });
  };

  const drawTouchPulses = (elapsed: number) => {
    pulsePool.forEach((pulse) => {
      if (!pulse.active) return;
      pulse.age += elapsed;
      if (pulse.age >= pulse.life) {
        pulse.active = false;
        return;
      }
      const progress = pulse.age / pulse.life;
      drawingContext.globalAlpha = (1 - progress) * visibilityAt(pulse);
      drawingContext.beginPath();
      drawingContext.arc(pulse.x, pulse.y, 8 + progress * 24, 0, Math.PI * 2);
      drawingContext.strokeStyle = accent;
      drawingContext.lineWidth = 1;
      drawingContext.stroke();
    });
  };

  const startLoop = () => {
    if (frameId || disposed || !visible || document.hidden) return;
    previousFrame = 0;
    frameId = requestAnimationFrame(draw);
  };

  const stopLoop = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  };

  function draw(time: number) {
    frameId = 0;
    if (disposed || !visible || document.hidden) return;
    const interval = targetFrameInterval();
    if (previousFrame && time - previousFrame < interval) {
      frameId = requestAnimationFrame(draw);
      return;
    }

    const elapsed = previousFrame ? Math.min(time - previousFrame, 50) : interval;
    previousFrame = time;
    drawingContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawingContext.clearRect(0, 0, width, height);
    drawAmbientPackets(time, selectTopology(width));
    drawPointerPackets(elapsed);
    drawTouchPulses(elapsed);
    drawingContext.globalAlpha = 1;

    if (tapHighlightUntil && time >= tapHighlightUntil) {
      tapHighlightUntil = 0;
      setNearNode();
    }
    frameId = requestAnimationFrame(draw);
  }

  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startLoop();
      else stopLoop();
    },
    { rootMargin: "120px" },
  );
  const themeObserver = new MutationObserver(readPalette);
  const handleDocumentVisibility = () => (document.hidden ? stopLoop() : startLoop());
  const handlePointerCapability = () => {
    if (!finePointer.matches) resetPointerState();
  };

  readPalette();
  resize();
  resizeObserver.observe(frame);
  visibilityObserver.observe(frame);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  surface.addEventListener("pointermove", handlePointerMove, { passive: true });
  surface.addEventListener("pointerdown", handlePointerDown, { passive: true });
  surface.addEventListener("pointerleave", resetPointerState);
  finePointer.addEventListener("change", handlePointerCapability);
  document.addEventListener("visibilitychange", handleDocumentVisibility);
  frame.dataset.enhanced = "true";

  return () => {
    disposed = true;
    stopLoop();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    themeObserver.disconnect();
    surface.removeEventListener("pointermove", handlePointerMove);
    surface.removeEventListener("pointerdown", handlePointerDown);
    surface.removeEventListener("pointerleave", resetPointerState);
    finePointer.removeEventListener("change", handlePointerCapability);
    document.removeEventListener("visibilitychange", handleDocumentVisibility);
    resetPointerState();
    drawingContext.clearRect(0, 0, width, height);
    delete frame.dataset.enhanced;
  };
}
