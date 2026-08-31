import { profile } from "@/data/profile";

import { InfrastructureNetwork } from "./infrastructure-network";

export function HeroFoundation() {
  return (
    <section className="hero section-grid" id="index" aria-labelledby="hero-title">
      <div className="hero__eyebrow mono-meta">
        <span>INFRASTRUCTURE / NETWORK 01</span>
        <span>{profile.location}</span>
      </div>

      <div className="hero__title-wrap">
        <h1 className="hero__title" id="hero-title" data-hero-title>
          <span className="hero__title-line">
            <span data-hero-line>Rahul</span>
          </span>
          <span className="hero__title-line hero__title-line--muted">
            <span data-hero-line>Singh</span>
          </span>
          <span className="hero__title-line">
            <span data-hero-line>Parmar</span>
          </span>
        </h1>
      </div>

      <p className="hero__discipline" aria-label={profile.disciplines.join(", ")}>
        {profile.disciplines.map((discipline) => (
          <span key={discipline}>{discipline}</span>
        ))}
      </p>

      <div className="hero__visual">
        <InfrastructureNetwork />
      </div>

      <dl className="hero__metadata mono-meta">
        <div>
          <dt>Role</dt>
          <dd>{profile.role}</dd>
        </div>
        <div>
          <dt>Experience</dt>
          <dd>{profile.experience}</dd>
        </div>
        <div>
          <dt>Local time</dt>
          <dd>{profile.timezone}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className="status-value">{profile.status}</dd>
        </div>
      </dl>

      <a className="scroll-cue focus-ring" href="#introduction">
        <span>Scroll to inspect</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
