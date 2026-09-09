type TopologyNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  labelSide?: "left" | "right";
};

type TopologyScene = {
  id: "desktop" | "tablet" | "mobile";
  viewBox: string;
  nodes: readonly TopologyNode[];
  routes: readonly (readonly [number, number])[];
};

const scenes: readonly TopologyScene[] = [
  {
    id: "desktop",
    viewBox: "0 0 1440 900",
    nodes: [
      { id: "edge", label: "EDGE", x: 525, y: 202, labelSide: "left" },
      { id: "network", label: "NETWORK", x: 760, y: 126 },
      { id: "security", label: "SECURITY", x: 1002, y: 236 },
      { id: "compute", label: "COMPUTE", x: 718, y: 430, labelSide: "left" },
      { id: "observe", label: "OBSERVE", x: 1022, y: 558 },
      { id: "cloud", label: "CLOUD", x: 820, y: 704 },
      { id: "automate", label: "AUTOMATE", x: 548, y: 642, labelSide: "left" },
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
  {
    id: "tablet",
    viewBox: "0 0 900 900",
    nodes: [
      { id: "edge", label: "EDGE", x: 326, y: 208, labelSide: "left" },
      { id: "network", label: "NETWORK", x: 514, y: 126 },
      { id: "security", label: "SECURITY", x: 610, y: 292, labelSide: "left" },
      { id: "compute", label: "COMPUTE", x: 454, y: 466, labelSide: "left" },
      { id: "cloud", label: "CLOUD", x: 602, y: 650 },
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
  {
    id: "mobile",
    viewBox: "0 0 390 844",
    nodes: [
      { id: "edge", label: "EDGE", x: 46, y: 432 },
      { id: "network", label: "NETWORK", x: 116, y: 548 },
      { id: "cloud", label: "CLOUD", x: 54, y: 620 },
    ],
    routes: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
  },
] as const;

function TopologyScene({ scene }: { scene: TopologyScene }) {
  return (
    <svg
      className={`network-foundation network-foundation--${scene.id}`}
      viewBox={scene.viewBox}
      preserveAspectRatio="xMidYMid slice"
    >
      <g>
        {scene.routes.map(([fromIndex, toIndex], index) => {
          const from = scene.nodes[fromIndex];
          const to = scene.nodes[toIndex];
          return (
            <line
              key={`${from.id}-${to.id}`}
              className={index < 2 ? "is-active" : undefined}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              pathLength="1"
            />
          );
        })}
      </g>

      <g>
        {scene.nodes.map((node, index) => {
          const labelOnLeft = node.labelSide === "left";
          return (
            <g
              data-network-node={node.id}
              key={node.id}
              transform={`translate(${node.x} ${node.y})`}
            >
              <circle r={index === 3 ? 31 : 25} />
              <circle r={index === 3 ? 15 : 12} />
              <circle r="3.5" />
              <text x={labelOnLeft ? -22 : 22} y="4" textAnchor={labelOnLeft ? "end" : "start"}>
                {node.label}
              </text>
            </g>
          );
        })}
      </g>

      <g className="network-foundation__coordinates">
        <text x="10" y="22">
          SYS / {String(scene.nodes.length).padStart(2, "0")}
        </text>
      </g>
    </svg>
  );
}

export function NetworkFoundation() {
  return (
    <div className="network-foundation-set" aria-hidden="true">
      {scenes.map((scene) => (
        <TopologyScene key={scene.id} scene={scene} />
      ))}
    </div>
  );
}
