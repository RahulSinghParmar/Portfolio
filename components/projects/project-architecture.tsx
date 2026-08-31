import type { Project } from "@/data/types";

type ProjectArchitectureProps = {
  project: Project;
};

export function ProjectArchitecture({ project }: ProjectArchitectureProps) {
  const { architecture } = project;

  return (
    <figure className="project-architecture" aria-labelledby={`${project.slug}-diagram-title`}>
      <div className="project-architecture__meta mono-meta">
        <span id={`${project.slug}-diagram-title`}>System topology</span>
        <span>Diagram / {project.index}</span>
      </div>
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-labelledby={`${project.slug}-diagram-svg-title`}
        aria-describedby={`${project.slug}-diagram-description`}
      >
        <title id={`${project.slug}-diagram-svg-title`}>{`${project.title} system topology`}</title>
        <desc id={`${project.slug}-diagram-description`}>{architecture.label}</desc>
        <g className="project-architecture__grid" aria-hidden="true">
          {Array.from({ length: 13 }, (_, index) => (
            <line key={`v-${index}`} x1={index * 60} y1="0" x2={index * 60} y2="320" />
          ))}
          {Array.from({ length: 9 }, (_, index) => (
            <line key={`h-${index}`} x1="0" y1={index * 40} x2="720" y2={index * 40} />
          ))}
        </g>

        <g className="project-architecture__routes" aria-hidden="true">
          {architecture.routes.map((route) => (
            <g key={route.id}>
              <path className="project-architecture__route-base" d={route.path} />
              <path
                className="project-architecture__route-signal"
                d={route.path}
                data-project-route
              />
              <text x={route.labelX} y={route.labelY} textAnchor="middle">
                {route.label}
              </text>
            </g>
          ))}
        </g>

        <g className="project-architecture__nodes">
          {architecture.nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`} data-project-node>
              <circle className="project-architecture__node-ring" r="12" />
              <circle className="project-architecture__node-core" r="3" />
              <text
                className="project-architecture__node-label"
                x="0"
                y="27"
                textAnchor={node.align ?? "middle"}
              >
                {node.label}
              </text>
              <text
                className="project-architecture__node-detail"
                x="0"
                y="41"
                textAnchor={node.align ?? "middle"}
              >
                {node.detail}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <figcaption>{architecture.label}</figcaption>
    </figure>
  );
}
