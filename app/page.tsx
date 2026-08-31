import { HeroFoundation } from "@/components/hero/hero-foundation";
import { ContactSection } from "@/components/contact/contact-section";
import { SiteFooter } from "@/components/footer/site-footer";
import { SectionLabel } from "@/components/typography/section-label";
import { SelectedSystems } from "@/components/projects/selected-systems";
import { ProfessionalSection } from "@/components/professional/professional-section";
import { SystemsSection } from "@/components/systems/systems-section";
import { UnderHoodSection } from "@/components/under-hood/under-hood-section";
import { StructuredData } from "@/components/seo/structured-data";
import { profile } from "@/data/profile";

export default function Home() {
  return (
    <>
      <StructuredData />
      <main id="main-content" tabIndex={-1}>
        <HeroFoundation />

        <section className="introduction section-grid ruled-section" id="introduction">
          <SectionLabel index="01">Introduction</SectionLabel>
          <h2 className="introduction__statement">{profile.statement}</h2>
          <div className="introduction__copy" data-reveal>
            <p>{profile.introduction}</p>
            <p className="mono-meta">{profile.headline}</p>
          </div>
        </section>

        <SelectedSystems />

        <SystemsSection />

        <ProfessionalSection />

        <UnderHoodSection />

        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
