import { projects } from "@/data/projects";
import { SectionLabel } from "@/components/typography/section-label";
import { ProjectCaseStudy } from "./project-case-study";

export function SelectedSystems() {
  return (
    <section className="selected-systems ruled-section" id="work">
      <div className="selected-systems__introduction section-grid">
        <SectionLabel index="02">Selected systems</SectionLabel>
        <div className="foundation-section__heading" data-reveal>
          <h2>Three parts of the same operating problem.</h2>
          <p>
            A dashboard provides the entry point, a heartbeat checks the services behind it, and an
            edge fallback handles the moments when the private origin cannot answer.
          </p>
        </div>
      </div>
      <div className="selected-systems__cases">
        {projects.map((project, index) => (
          <ProjectCaseStudy key={project.slug} project={project} position={index} />
        ))}
      </div>
    </section>
  );
}
