"use client";

import { useEffect, useRef, useState } from "react";

import { profile } from "@/data/profile";

const navigationItems = [
  { label: "Index", href: "#index" },
  { label: "Work", href: "#work" },
  { label: "Systems", href: "#systems" },
  { label: "About", href: "#about" },
  { label: "Build", href: "#architecture" },
  { label: "Contact", href: "#contact" },
] as const;

export function SiteNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => toggleRef.current?.focus());
    }
  };

  useEffect(() => {
    document.body.classList.toggle("navigation-open", isOpen);
    const backgroundRegions = [
      document.querySelector<HTMLElement>("main"),
      document.querySelector<HTMLElement>("body > footer"),
    ].filter((region): region is HTMLElement => region !== null);
    backgroundRegions.forEach((region) => {
      region.inert = isOpen;
    });

    if (!isOpen) {
      return () => {
        document.body.classList.remove("navigation-open");
        backgroundRegions.forEach((region) => {
          region.inert = false;
        });
      };
    }

    const mobileNavigation = mobileNavigationRef.current;
    const links = mobileNavigation
      ? Array.from(mobileNavigation.querySelectorAll<HTMLAnchorElement>("a[href]"))
      : [];
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab" || links.length === 0) return;

      const firstControl = toggleRef.current;
      const lastControl = links.at(-1);
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl?.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("navigation-open");
      backgroundRegions.forEach((region) => {
        region.inert = false;
      });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="site-header">
      <a
        className="site-mark focus-ring"
        href="#index"
        aria-label={`RSP — ${profile.name}, back to top`}
      >
        <span aria-hidden="true">RSP</span>
        <span className="site-mark__status" aria-hidden="true" />
      </a>

      <nav className="desktop-navigation" aria-label="Primary navigation">
        {navigationItems.map((item, index) => (
          <a className="navigation-link focus-ring" href={item.href} key={item.href}>
            <span className="navigation-link__index">0{index + 1}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <button
        className="menu-toggle focus-ring"
        type="button"
        ref={toggleRef}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => (isOpen ? closeMenu(true) : setIsOpen(true))}
      >
        <span>{isOpen ? "Close" : "Menu"}</span>
        <span className="menu-toggle__glyph" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>

      <div
        className="mobile-navigation"
        id="mobile-navigation"
        data-open={isOpen}
        ref={mobileNavigationRef}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <nav aria-label="Mobile navigation">
          {navigationItems.map((item, index) => (
            <a
              className="mobile-navigation__link focus-ring"
              href={item.href}
              key={item.href}
              onClick={() => closeMenu()}
            >
              <span>0{index + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <p>{profile.location}</p>
      </div>
    </header>
  );
}
