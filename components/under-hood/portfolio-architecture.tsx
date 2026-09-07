const nodes = [
  { label: "VISITOR", detail: "BROWSER", x: 65, y: 145, align: "start" as const },
  { label: "CLOUDFLARE", detail: "EDGE", x: 245, y: 145, align: "middle" as const },
  { label: "API WORKER", detail: "TRUST BOUNDARY", x: 430, y: 145, align: "middle" as const },
  { label: "STATUS", detail: "READ-ONLY", x: 650, y: 72, align: "end" as const },
  { label: "STATIC ASSETS", detail: "NEXT.JS EXPORT", x: 650, y: 225, align: "end" as const },
] as const;

const routes = [
  { path: "M65 145 H245", label: "HTTPS", x: 155, y: 130 },
  { path: "M245 145 H430", label: "API ONLY", x: 338, y: 130 },
  { path: "M430 145 C505 145 545 72 650 72", label: "SANITIZED JSON", x: 548, y: 91 },
  { path: "M245 145 C350 225 545 225 650 225", label: "HTML / JS / CSS", x: 490, y: 214 },
] as const;

export function PortfolioArchitecture() {
  return (
    <figure className="portfolio-architecture" data-reveal>
      <div className="portfolio-architecture__legend mono-meta">
        <span>Application topology</span>
        <span>Static / Worker boundary</span>
      </div>
      <svg viewBox="0 0 720 300" role="img" aria-labelledby="portfolio-architecture-title">
        <title id="portfolio-architecture-title">
          Portfolio requests served by Cloudflare static assets with an isolated API Worker status
          boundary
        </title>
        <g className="portfolio-architecture__grid" aria-hidden="true">
          {Array.from({ length: 13 }, (_, index) => (
            <line key={`v-${index}`} x1={index * 60} y1="0" x2={index * 60} y2="300" />
          ))}
          {Array.from({ length: 6 }, (_, index) => (
            <line key={`h-${index}`} x1="0" y1={index * 60} x2="720" y2={index * 60} />
          ))}
        </g>
        <g className="portfolio-architecture__routes" aria-hidden="true">
          {routes.map((route) => (
            <g key={route.label}>
              <path d={route.path} />
              <text x={route.x} y={route.y} textAnchor="middle">
                {route.label}
              </text>
            </g>
          ))}
        </g>
        <g className="portfolio-architecture__nodes" aria-hidden="true">
          {nodes.map((node) => (
            <g key={node.label} transform={`translate(${node.x} ${node.y})`}>
              <circle r="13" />
              <circle r="3" />
              <text x="0" y="30" textAnchor={node.align}>
                {node.label}
              </text>
              <text className="detail" x="0" y="43" textAnchor={node.align}>
                {node.detail}
              </text>
            </g>
          ))}
        </g>
        <rect
          className="portfolio-architecture__boundary"
          x="380"
          y="28"
          width="315"
          height="145"
        />
        <text className="portfolio-architecture__boundary-label" x="392" y="48">
          WORKER-ONLY
        </text>
      </svg>
      <figcaption>
        Static files bypass application code. Optional status credentials remain inside the API
        Worker, and the browser receives a deliberately small public contract.
      </figcaption>
    </figure>
  );
}
