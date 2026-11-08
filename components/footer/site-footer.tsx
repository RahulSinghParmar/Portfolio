import { profile } from "@/data/profile";
import { FooterSignal } from "./footer-signal";
import { MotionControl } from "@/components/motion/motion-control";

export function SiteFooter() {
  return (
    <footer className="site-footer section-grid">
      <div className="site-footer__signal">
        <p className="mono-meta">Signal path / end</p>
        <FooterSignal />
      </div>
      <div className="site-footer__identity">
        <p>{profile.name}</p>
        <p>{profile.footerNote}</p>
      </div>
      <a className="site-footer__top focus-ring mono-meta" href="#index">
        Back to index <span aria-hidden="true">↑</span>
      </a>
      <div className="site-footer__meta mono-meta">
        <span>© {new Date().getFullYear()}</span>
        <span>{process.env.NEXT_PUBLIC_SITE_VERSION ?? "v1.2.0"}</span>
        <span>{profile.location}</span>
        <MotionControl />
        <a className="focus-ring" href={profile.repositoryUrl} target="_blank" rel="noreferrer">
          Source <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}
