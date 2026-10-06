import { useCallback, useEffect, useState } from "react";

// Hash routing, hand-rolled: the app has six views and a couple of parameters,
// and a hash URL survives a static host with zero server configuration.

export function parseHash(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  return raw.startsWith("/") ? raw : "/" + raw;
}

export function matchRoute(path) {
  const seg = path.split("?")[0].split("/").filter(Boolean);
  if (seg.length === 0) return { view: "indications" };
  switch (seg[0]) {
    case "i":
      return { view: "indications", focus: seg[1] || null };
    case "s":
      return { view: "indications", section: seg[1] || null };
    case "fractures":
      return { view: "fractures" };
    case "dosing":
      return { view: "dosing" };
    case "workup":
      return { view: "workup" };
    case "drugs":
      return { view: "drugs", drug: seg[1] ? safeDecode(seg[1]) : null };
    case "source":
      return { view: "source" };
    default:
      return { view: "indications" };
  }
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function useHashRoute() {
  const [path, setPath] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setPath(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const next = "#" + to;
    if (replace) {
      window.history.replaceState(null, "", next);
      setPath(parseHash(next)); // replaceState fires no hashchange
    } else if (window.location.hash !== next) {
      window.location.hash = to;
    }
  }, []);

  return { path, navigate };
}
