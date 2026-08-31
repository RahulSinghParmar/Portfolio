const nodes = [
  { id: "edge", x: 82, y: 70, label: "EDGE" },
  { id: "network", x: 238, y: 42, label: "NETWORK" },
  { id: "security", x: 390, y: 108, label: "SECURITY" },
  { id: "compute", x: 192, y: 190, label: "COMPUTE" },
  { id: "observe", x: 420, y: 236, label: "OBSERVE" },
  { id: "automate", x: 92, y: 290, label: "AUTOMATE" },
] as const;

export function NetworkFoundation() {
  return (
    <svg
      className="network-foundation"
      viewBox="0 0 520 350"
      role="img"
      aria-labelledby="network-title network-description"
    >
      <title id="network-title">Abstract infrastructure topology</title>
      <desc id="network-description">
        Connected edge, network, security, compute, observability and automation nodes.
      </desc>
      <g className="network-foundation__grid" aria-hidden="true">
        {Array.from({ length: 13 }, (_, index) => (
          <line key={`v-${index}`} x1={index * 43} x2={index * 43} y1="0" y2="350" />
        ))}
        {Array.from({ length: 9 }, (_, index) => (
          <line key={`h-${index}`} x1="0" x2="520" y1={index * 43} y2={index * 43} />
        ))}
      </g>
      <g className="network-foundation__routes" aria-hidden="true">
        <path d="M82 70 L238 42 L390 108 L420 236 L192 190 L92 290 L82 70" />
        <path d="M82 70 L192 190 L390 108" />
        <path d="M238 42 L192 190 L420 236" />
        <path d="M92 290 L420 236" />
      </g>
      <g className="network-foundation__nodes">
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <circle r="6" />
            <circle className="network-foundation__node-ring" r="13" />
            <text x="18" y="4">
              {node.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
