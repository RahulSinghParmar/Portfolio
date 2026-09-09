"use client";

import { useEffect } from "react";

type NetworkConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export function MotionRuntime() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const networkConnection = navigator as NetworkConnection;
    const forceMotion = new URLSearchParams(window.location.search).get("motion") === "full";
    const useReducedMotion =
      !forceMotion &&
      (reducedMotion.matches ||
        (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) ||
        networkConnection.connection?.saveData === true);
    document.documentElement.dataset.motion = useReducedMotion ? "reduced" : "full";

    if (useReducedMotion) {
      return () => {
        delete document.documentElement.dataset.motion;
      };
    }

    let disposed = false;
    let disposeMotion: (() => void) | undefined;

    const initializeMotion = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);

      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.82,
      });

      const updateScrollTrigger = () => ScrollTrigger.update();
      const advanceLenis = (time: number) => lenis.raf(time * 1000);

      lenis.on("scroll", updateScrollTrigger);
      gsap.ticker.add(advanceLenis);
      gsap.ticker.lagSmoothing(0);

      const context = gsap.context(() => {
        const entrance = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        entrance
          .from(".site-header", { yPercent: -105, duration: 0.8 })
          .from(".hero__eyebrow > *", { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.08)
          .from(
            "[data-hero-line]",
            { yPercent: 112, rotate: 0.7, stagger: 0.09, duration: 1.25 },
            0.08,
          )
          .from(
            ".hero__visual",
            { scale: 0.94, autoAlpha: 0, transformOrigin: "50% 50%", duration: 1.2 },
            0.28,
          )
          .from(
            "[data-hero-portrait]",
            { xPercent: 18, yPercent: 4, scale: 0.975, autoAlpha: 0, duration: 1.3 },
            0.24,
          )
          .from(
            ".hero__discipline > span",
            { y: 12, autoAlpha: 0, stagger: 0.06, duration: 0.65 },
            0.48,
          )
          .from(
            ".hero__metadata > div, .scroll-cue",
            { y: 10, autoAlpha: 0, stagger: 0.055, duration: 0.55 },
            0.62,
          );

        gsap.to("[data-hero-title]", {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        gsap.to(".hero__visual", {
          yPercent: 15,
          rotate: 0.75,
          scale: 0.975,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to("[data-hero-portrait]", {
          yPercent: 7,
          scale: 0.985,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.9,
          },
        });

        gsap.to(".scroll-cue i", {
          scaleX: 0.35,
          transformOrigin: "right center",
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "55% top",
            scrub: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, {
            y: 42,
            autoAlpha: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          });
        });

        gsap.from(".introduction__statement", {
          backgroundPositionX: "100%",
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".introduction__statement",
            start: "top 82%",
            once: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-project]").forEach((project) => {
          const title = project.querySelector(".project-case-study__title-block");
          const metadata = project.querySelector(".project-case-study__meta");
          const diagram = project.querySelector(".project-architecture");
          const routes = project.querySelectorAll<SVGPathElement>("[data-project-route]");
          const nodes = project.querySelectorAll<SVGGElement>("[data-project-node]");
          const details = project.querySelectorAll<HTMLElement>("[data-project-detail]");
          const metrics = project.querySelectorAll<HTMLElement>("[data-project-metric]");

          const reveal = gsap.timeline({
            scrollTrigger: {
              trigger: project,
              start: "top 76%",
              once: true,
            },
            defaults: { ease: "power3.out" },
          });

          reveal
            .from(title, { y: 48, autoAlpha: 0, duration: 1 })
            .from(metadata, { y: 24, autoAlpha: 0, duration: 0.75 }, 0.12)
            .from(diagram, { y: 38, autoAlpha: 0, duration: 1 }, 0.22)
            .from(nodes, { scale: 0, autoAlpha: 0, stagger: 0.075, duration: 0.55 }, 0.42)
            .from(routes, { autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.46)
            .from(details, { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.62)
            .from(metrics, { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.74);

          gsap.to(routes, {
            strokeDashoffset: -66,
            duration: 3.6,
            ease: "none",
            repeat: -1,
          });

          const index = project.querySelector("[data-project-index]");
          if (index && window.matchMedia("(min-width: 48rem)").matches) {
            gsap.fromTo(
              index,
              { xPercent: project.dataset.layout === "reverse" ? 8 : -8 },
              {
                xPercent: project.dataset.layout === "reverse" ? -8 : 8,
                ease: "none",
                scrollTrigger: {
                  trigger: project,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
          }
        });
      }, document.body);

      ScrollTrigger.refresh();

      disposeMotion = () => {
        context.revert();
        lenis.off("scroll", updateScrollTrigger);
        lenis.destroy();
        gsap.ticker.remove(advanceLenis);
        gsap.ticker.lagSmoothing(500, 33);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    };

    void initializeMotion().catch(() => {
      document.documentElement.dataset.motion = "reduced";
    });

    return () => {
      disposed = true;
      disposeMotion?.();
      delete document.documentElement.dataset.motion;
    };
  }, []);

  return null;
}
