import { SectionLabel } from "@/components/typography/section-label";
import { AutomationPipeline } from "./automation-pipeline";
import { InfrastructureMap } from "./infrastructure-map";

export function SystemsSection() {
  return (
    <section className="systems-section section-grid ruled-section" id="systems">
      <SectionLabel index="03">Systems practice</SectionLabel>
      <div className="foundation-section__heading" data-reveal>
        <h2>Seven disciplines. One operating model.</h2>
        <p>
          These layers meet during real incidents: routing exposes a fault, monitoring narrows it,
          and scripts make the repair repeatable.
        </p>
      </div>
      <InfrastructureMap />
      <AutomationPipeline />
    </section>
  );
}
