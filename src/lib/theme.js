// Light / dark theme.
//
// Light is the default (the design shared with the Pediatric CPG and the
// Antibiogram); dark is opt-in through the toggle in the brand bar, and the
// choice is remembered on that device. index.html applies the saved theme
// before first paint, with an inline script, so the page never flashes the
// other scheme; this module owns every change after that. THEME_KEY must match
// that script (a test runs it).
import { useState } from "react";

export const THEME_KEY = "acs-abx:theme";

// The browser's theme-color (Android status bar and address bar). The brand bar
// is Mizzou black in both schemes, so this never changes: it is index.html's
// static meta and the manifest's theme_color, and a test keeps the three equal.
export const THEME_COLOR = "#000000";

// Anything but an explicit "dark" (nothing stored, storage blocked, a stale or
// tampered value) is the default.
export function resolveTheme(value) {
  return value === "dark" ? "dark" : "light";
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
    const next = theme === "dark" ? "light" : "dark";
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
