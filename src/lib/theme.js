// Light / dark theme.
//
// Dark is the default (the original design); light is opt-in through the
// toggle in the brand bar, and the choice is remembered on that device.
// index.html applies the saved theme before first paint, with an inline script,
// so the page never flashes the other scheme; this module owns every change
// after that. THEME_KEY must match the key in that script (a test checks it).
import { useState } from "react";

export const THEME_KEY = "acs-abx:theme";

// Anything but an explicit "light" (nothing stored, storage blocked, a stale or
// tampered value) is the default.
export function resolveTheme(value) {
  return value === "light" ? "light" : "dark";
}

export function currentTheme() {
  return resolveTheme(document.documentElement.getAttribute("data-theme"));
}

export function applyTheme(theme) {
  const root = document.documentElement;
  // Colour transitions are switched off for one frame (see index.css), so the
  // whole page changes at once instead of a few controls fading behind it.
  root.setAttribute("data-theme-switching", "");
  root.setAttribute("data-theme", theme);
  void root.offsetWidth; // apply the new colours while transitions are off
  requestAnimationFrame(() => root.removeAttribute("data-theme-switching"));
}

export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode or blocked storage: the switch still holds for this visit.
    }
    setTheme(next);
  };
  return { theme, toggle };
}
