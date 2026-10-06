// Light / dark theme.
//
// Dark is the default (the original design); light is opt-in through the
// toggle in the brand bar, and the choice is remembered on that device.
// index.html applies the saved theme before first paint, with an inline script,
// so the page never flashes the other scheme; this module owns every change
// after that. THEME_KEY and THEME_COLOR must match that script (a test runs it).
import { useState } from "react";

export const THEME_KEY = "acs-abx:theme";

// The browser's theme-color (Android status bar and address bar) for each
// theme. Light is the white brand bar (--bar in the light block of index.css).
// Dark is the manifest's theme_color, unchanged since v0.1.0: the canvas colour,
// a shade darker than the dark bar (a test bounds the gap).
export const THEME_COLOR = { dark: "#080B10", light: "#FFFFFF" };

// True only in an iPhone or iPad home-screen app. There the status bar is
// black-translucent: a white clock drawn over the page that cannot change at
// runtime, so the area behind it must stay dark in both themes.
export function isIOSStandalone(nav = typeof navigator === "undefined" ? undefined : navigator) {
  return nav?.standalone === true;
}

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
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
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
