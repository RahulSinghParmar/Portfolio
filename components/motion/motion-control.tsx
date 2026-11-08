"use client";

import { useEffect, useState } from "react";
import {
  motionEnabled,
  observeMotionPreference,
  readMotionPreference,
  setMotionPreference,
  type MotionPreference,
} from "@/lib/motion-preference";

const choices: readonly MotionPreference[] = ["auto", "on", "off"];

export function MotionControl() {
  const [preference, setPreference] = useState<MotionPreference>("auto");
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const update = () => {
      setPreference(readMotionPreference());
      setEnabled(motionEnabled());
    };
    update();
    return observeMotionPreference(update);
  }, []);
  return (
    <button
      className="motion-control focus-ring mono-meta"
      type="button"
      aria-label={`Motion ${preference}, animations ${enabled ? "on" : "off"}. Change animation preference.`}
      title="Auto follows your device's reduced-motion and data-saving preferences."
      onClick={() =>
        setMotionPreference(choices[(choices.indexOf(preference) + 1) % choices.length])
      }
    >
      Motion / {preference}
      {preference === "auto" ? ` (${enabled ? "on" : "off"})` : ""}
    </button>
  );
}
