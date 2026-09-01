"use client";

import { useLayoutEffect } from "react";

type ThemePreference = "system" | "light" | "dark";

const storageKey = "rsp-theme";
const preferences: readonly ThemePreference[] = ["system", "light", "dark"];
const themeColors = { light: "#f3f1e9", dark: "#0b0c0c" } as const;

function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(preference: ThemePreference) {
  const theme = resolveTheme(preference);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute("content", themeColors[theme]);
}

function readStoredPreference(): ThemePreference {
  try {
    const storedPreference = window.localStorage.getItem(storageKey);
    return isThemePreference(storedPreference) ? storedPreference : "system";
  } catch {
    return "system";
  }
}

export function ThemeControl() {
  useLayoutEffect(() => {
    const initialPreference = isThemePreference(document.documentElement.dataset.themePreference)
      ? document.documentElement.dataset.themePreference
      : readStoredPreference();
    applyTheme(initialPreference);

    const colorScheme = window.matchMedia("(prefers-color-scheme: light)");
    const handleSystemThemeChange = () => {
      if (document.documentElement.dataset.themePreference === "system") {
        applyTheme("system");
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      const nextPreference = isThemePreference(event.newValue) ? event.newValue : "system";
      applyTheme(nextPreference);
    };

    colorScheme.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      colorScheme.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const cycleTheme = () => {
    const currentPreference = isThemePreference(document.documentElement.dataset.themePreference)
      ? document.documentElement.dataset.themePreference
      : "system";
    const nextPreference =
      preferences[(preferences.indexOf(currentPreference) + 1) % preferences.length];
    applyTheme(nextPreference);
    try {
      window.localStorage.setItem(storageKey, nextPreference);
    } catch {
      // The active document still receives the selected theme when storage is unavailable.
    }
  };

  return (
    <button
      className="theme-control focus-ring"
      type="button"
      aria-label="Change color theme. Cycles system, light, and dark."
      title="Change color theme"
      onClick={cycleTheme}
    >
      <span aria-hidden="true">Theme</span>
      <span className="theme-control__value" aria-hidden="true">
        <span data-theme-option="system">System</span>
        <span data-theme-option="light">Light</span>
        <span data-theme-option="dark">Dark</span>
      </span>
      <span className="theme-control__indicator" aria-hidden="true" />
    </button>
  );
}
