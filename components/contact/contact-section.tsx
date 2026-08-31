import { SectionLabel } from "@/components/typography/section-label";
import { contactChannels } from "@/data/contact";
import { profile } from "@/data/profile";

export function ContactSection() {
  return (
    <section className="contact-section section-grid ruled-section" id="contact">
      <SectionLabel index="06">Contact</SectionLabel>

      <div className="contact-section__heading" data-reveal>
        <p className="mono-meta">Start a conversation / direct route</p>
        <h2>For infrastructure and automation conversations, email is the shortest path.</h2>
      </div>

      <div className="contact-section__invitation" data-reveal>
        <p>
          I am glad to compare notes on network operations, cloud security, practical automation,
          homelab engineering and developer tooling.
        </p>
        <dl className="mono-meta">
          <div>
            <dt>Base</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Working timezone</dt>
            <dd>{profile.timezone}</dd>
          </div>
          <div>
            <dt>Primary route</dt>
            <dd>Email</dd>
          </div>
        </dl>
      </div>

      <a
        className="contact-section__email focus-ring"
        href={`mailto:${profile.email}?subject=Infrastructure%20conversation`}
        data-reveal
      >
        <span className="mono-meta">Email / direct</span>
        <span>{profile.email}</span>
        <span aria-hidden="true">↗</span>
      </a>

      <div className="contact-section__channels">
        <p className="mono-meta">Elsewhere / public channels</p>
        <ol>
          {contactChannels.map((channel) => (
            <li key={channel.href} data-reveal>
              <a className="focus-ring" href={channel.href} target="_blank" rel="noreferrer">
                <span className="mono-meta">{channel.index}</span>
                <span className="contact-section__channel-name">{channel.label}</span>
                <span className="contact-section__channel-value mono-meta">{channel.value}</span>
                <span className="contact-section__channel-description">{channel.description}</span>
                <span className="contact-section__channel-arrow" aria-hidden="true">
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
