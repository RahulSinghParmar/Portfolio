import { SectionLabel } from "@/components/typography/section-label";
import { DeploymentPipeline } from "./deployment-pipeline";
import { LiveSystemStatus } from "./live-system-status";
import { PortfolioArchitecture } from "./portfolio-architecture";

export function UnderHoodSection() {
  return (
    <section className="under-hood section-grid ruled-section" id="architecture">
      <SectionLabel index="05">Under the hood</SectionLabel>
      <div className="under-hood__heading" data-reveal>
        <p className="mono-meta">Portfolio / operated system</p>
        <h2>The portfolio is deployed like the systems it describes.</h2>
        <p>
          Most of the page ships as pre-rendered HTML from Cloudflare&apos;s asset edge. Client code
          is limited to navigation, optional motion, the capability map and the read-only status
          view.
        </p>
      </div>
      <PortfolioArchitecture />
      <div className="under-hood__status-heading" data-reveal>
        <p className="mono-meta">Runtime signal</p>
        <h3>Truthful state, including when no source is connected.</h3>
      </div>
      <LiveSystemStatus />
      <DeploymentPipeline />
    </section>
  );
}
