import type { Project } from "@/data/types";
import { ProjectArchitecture } from "./project-architecture";

type ProjectCaseStudyProps = {
  project: Project;
  position: number;
};

const detailFields = [
  ["Challenge", "challenge"],
  ["Approach", "approach"],
  ["Automation", "automation"],
  ["Security", "security"],
  ["Observability", "observability"],
] as const;

export function ProjectCaseStudy({ project, position }: ProjectCaseStudyProps) {
  return (
    <article
      className="project-case-study section-grid"
      id={project.slug}
      data-project
      data-layout={position % 2 === 0 ? "forward" : "reverse"}
    >
      <header className="project-case-study__header">
        <p className="project-case-study__index" aria-hidden="true" data-project-index>
          {project.index}
        </p>
        <div className="project-case-study__title-block">
          <p className="mono-meta">{project.role}</p>
          <h3>{project.title}</h3>
          <p className="project-case-study__summary">{project.summary}</p>
        </div>
        <dl className="project-case-study__meta mono-meta">
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{project.technologies.join(" · ")}</dd>
          </div>
        </dl>
      </header>

      <ProjectArchitecture project={project} />

      <div className="project-case-study__details">
        {detailFields.map(([label, field]) => (
          <div className="project-case-study__detail" key={field} data-project-detail>
            <h4 className="mono-meta">{label}</h4>
            <p>{project[field]}</p>
          </div>
        ))}
      </div>

      <footer className="project-case-study__outcome">
        <div>
          <p className="mono-meta">Operational outcome</p>
          <p>{project.outcome}</p>
        </div>
        <dl className="project-case-study__metrics">
          {project.metrics.map((metric) => (
            <div key={metric.label} data-project-metric>
              <dd>{metric.value}</dd>
              <dt className="mono-meta">{metric.label}</dt>
            </div>
          ))}
        </dl>
        <div className="project-case-study__links mono-meta">
          {project.repositoryUrl ? (
            <a className="focus-ring" href={project.repositoryUrl} target="_blank" rel="noreferrer">
              Source <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
          {project.liveUrl ? (
            <a className="focus-ring" href={project.liveUrl} target="_blank" rel="noreferrer">
              Live system <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
