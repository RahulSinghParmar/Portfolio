import { projects } from "@/data/projects";
import { SectionLabel } from "@/components/typography/section-label";
import { ProjectCaseStudy } from "./project-case-study";
import { sectionCopy } from "@/data/professional";

export function SelectedSystems() {
  return (
    <section className="selected-systems ruled-section" id="work">
      <div className="selected-systems__introduction section-grid">
        <SectionLabel index="02">Selected systems</SectionLabel>
        <div className="foundation-section__heading" data-reveal>
          <h2>{sectionCopy.work.title}</h2>
          <p>{sectionCopy.work.description}</p>
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
