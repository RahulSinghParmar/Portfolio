import { SectionLabel } from "@/components/typography/section-label";
import { certifications } from "@/data/certifications";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { careerDirections, education, workingModes } from "@/data/professional";

export function ProfessionalSection() {
  return (
    <section className="professional-section section-grid ruled-section" id="about">
      <SectionLabel index="04">Professional practice</SectionLabel>

      <div className="professional-section__heading" data-reveal>
        <p className="mono-meta">Physical infrastructure / software thinking</p>
        <h2>I operate where cloud becomes physical—and build beyond the shift.</h2>
      </div>

      <dl className="professional-snapshot mono-meta" data-reveal>
        <div>
          <dt>Current role</dt>
          <dd>{profile.role}</dd>
        </div>
        <div>
          <dt>Organization</dt>
          <dd>{profile.employer}</dd>
        </div>
        <div>
          <dt>Base</dt>
          <dd>{profile.location}</dd>
        </div>
        <div>
          <dt>Education</dt>
          <dd>{education.discipline}</dd>
        </div>
      </dl>

      <div className="professional-modes">
        {workingModes.map((mode) => (
          <article key={mode.label} data-reveal>
            <p className="mono-meta">{mode.label}</p>
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
          </article>
        ))}
      </div>

      <div className="career-record">
        <header className="career-record__heading" data-reveal>
          <p className="mono-meta">Career record</p>
          <h3>Responsibility at the operational layer.</h3>
        </header>
        <ol>
          {experience.map((item, index) => (
            <li key={`${item.company}-${item.role}`} data-reveal>
              <div className="career-record__rail">
                <span className="career-record__marker" aria-hidden="true" />
                <span className="mono-meta">{item.period}</span>
                <span className="mono-meta">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="career-record__role">
                <p className="mono-meta">{item.company}</p>
                <h4>{item.role}</h4>
                <p>{item.location}</p>
              </div>
              <div className="career-record__scope">
                <p>{item.summary}</p>
                {item.responsibilities.length > 0 ? (
                  <ul>
                    {item.responsibilities.map((responsibility) => (
                      <li key={responsibility}>{responsibility}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="professional-credentials">
        <div className="professional-credentials__education" data-reveal>
          <p className="mono-meta">Education</p>
          <p className="professional-credentials__index" aria-hidden="true">
            BE
          </p>
          <h3>{education.degree}</h3>
          <p>{education.discipline}</p>
          <p>{education.note}</p>
        </div>

        <div className="professional-credentials__certifications" data-reveal>
          <p className="mono-meta">Credential archive</p>
          {certifications.map((certification) => (
            <article key={certification.name}>
              <div>
                <span className="mono-meta">{certification.index}</span>
                <span className="mono-meta">{certification.issued}</span>
              </div>
              <h3>{certification.name}</h3>
              <p>{certification.issuer}</p>
              {certification.credentialUrl ? (
                <a
                  className="focus-ring mono-meta"
                  href={certification.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Verify credential <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div className="career-direction">
        <header data-reveal>
          <p className="mono-meta">Direction / next</p>
          <h3>Where the practice is heading.</h3>
        </header>
        <ol>
          {careerDirections.map((direction) => (
            <li key={direction.index} data-reveal>
              <span className="mono-meta">{direction.index}</span>
              <h4>{direction.title}</h4>
              <p>{direction.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
