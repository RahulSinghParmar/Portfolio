// One policy shared by the page transitions, diagram engine and CSS animations.
// Explicit controls override Auto; Auto respects the OS and data-saving preference.
export type MotionPreference = "auto" | "on" | "off";
const storageKey = "portfolio-motion";
const changeEvent = "portfolio:motion-change";

export function readMotionPreference(): MotionPreference {
  const query = new URLSearchParams(window.location.search).get("motion");
  if (query === "full") return "on";
  if (query === "reduced" || query === "off") return "off";
  try {
    const value = localStorage.getItem(storageKey);
    if (value === "on" || value === "off") return value;
  } catch {
    // Storage can be blocked in private browsing; session controls still work.
  }
  const session = document.documentElement.dataset.motionPreference;
  return session === "on" || session === "off" ? session : "auto";
}

export function motionEnabled(preference = readMotionPreference()) {
  if (preference !== "auto") return preference === "on";
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !connection?.saveData;
}

export function setMotionPreference(preference: MotionPreference) {
  // A visible choice replaces a one-time diagnostic query override.
  const url = new URL(window.location.href);
  if (url.searchParams.has("motion")) {
    url.searchParams.delete("motion");
    window.history.replaceState(null, "", url);
  }
  document.documentElement.dataset.motionPreference = preference;
  try {
    localStorage.setItem(storageKey, preference);
  } catch {
    /* Session choice remains valid. */
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function observeMotionPreference(update: () => void) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
  reduced.addEventListener("change", update);
  connection?.addEventListener("change", update);
  window.addEventListener("storage", update);
  window.addEventListener(changeEvent, update);
  return () => {
    reduced.removeEventListener("change", update);
    connection?.removeEventListener("change", update);
    window.removeEventListener("storage", update);
    window.removeEventListener(changeEvent, update);
  };
}
