import { useEffect, useMemo, useState } from "react";
import { matchRoute, useHashRoute } from "./lib/route.js";
import { sections } from "./data/pmg.js";
import Header from "./components/Header.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Footer from "./components/Footer.jsx";
import IndicationsView from "./components/IndicationsView.jsx";
import OpenFracturesView from "./components/OpenFracturesView.jsx";
import DosingView from "./components/DosingView.jsx";
import FeverWorkupView from "./components/FeverWorkupView.jsx";
import DrugsView from "./components/DrugsView.jsx";
import SourceView from "./components/SourceView.jsx";
import { OpenCards } from "./components/shared.jsx";

// Written by src/main.jsx before a service-worker update reload, so the
// alternative-column toggle survives the reload. Read once, then cleared, so a
// manual reload still starts at the default.
const VIEW_HANDOFF = "acs-abx:view-across-update";

export default function App() {
  const { path, navigate } = useHashRoute();
  const route = useMemo(() => matchRoute(path), [path]);
  const [query, setQuery] = useState("");
  const [pcn, setPcn] = useState(false);
  // Indication sections the reader has collapsed. Every section starts collapsed
  // (Thiago, 2026-10-08), so the list opens as four heads with their counts.
  // Held here rather than in the view, so the reader's choices survive a trip to
  // another tab; not stored, so a fresh launch starts collapsed again.
  const [collapsed, setCollapsed] = useState(() => new Set(sections.map((s) => s.id)));
  // The collapsible cards and rows on the other tabs that the reader has opened
  // (OpenCards in shared.jsx); every one starts collapsed, held here for the same
  // reason.
  const [opened, setOpened] = useState(() => new Set());
  const openCards = useMemo(
    () => ({
      opened,
      toggle: (key) =>
        setOpened((prev) => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return next;
        }),
      setMany: (keys, open) =>
        setOpened((prev) => {
          const next = new Set(prev);
          for (const key of keys) {
            if (open) next.add(key);
            else next.delete(key);
          }
          return next;
        }),
    }),
    [opened]
  );

  // Restore the toggle after an update reload. Done in an effect, not a state
  // initialiser: React StrictMode runs initialisers twice in development, and a
  // read-and-clear initialiser would lose the handoff on the second run.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(VIEW_HANDOFF) === "pcn") {
        sessionStorage.removeItem(VIEW_HANDOFF);
        setPcn(true);
      }
    } catch {
      // private mode etc. — default off
    }
  }, []);

  useEffect(() => {
    window.__acsPcnAllergy = pcn;
  }, [pcn]);

  // A link to one indication must never be hidden by a stale search: arriving
  // at #/i/<id> clears the query so the card is in the rendered list.
  useEffect(() => {
    if (route.focus) setQuery("");
  }, [route.focus]);

  // Changing view scrolls to the top; opening a specific indication does not,
  // because IndicationsView scrolls to the card itself.
  useEffect(() => {
    if (!route.focus) window.scrollTo({ top: 0 });
  }, [route.view, route.drug, route.section, route.focus]);

  // Typing a search always searches the whole guideline, from the top of the
  // Indications view, whatever view or section the reader was in.
  const onQuery = (q) => {
    setQuery(q);
    if (q && (route.view !== "indications" || route.focus || route.section)) navigate("/");
  };

  let view;
  switch (route.view) {
    case "fractures":
      view = <OpenFracturesView pcn={pcn} />;
      break;
    case "dosing":
      view = <DosingView />;
      break;
    case "workup":
      view = <FeverWorkupView />;
      break;
    case "drugs":
      view = <DrugsView drug={route.drug} navigate={navigate} />;
      break;
    case "source":
      view = <SourceView />;
      break;
    default:
      view = (
        <IndicationsView
          query={query}
          onQuery={onQuery}
          pcn={pcn}
          route={route}
          navigate={navigate}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* The whole header is sticky, as in the Antibiogram. */}
      <Header
        view={route.view}
        query={query}
        onQuery={onQuery}
        pcn={pcn}
        onPcn={() => setPcn((v) => !v)}
        navigate={navigate}
      />
      {/* Bottom padding clears the phone-only bottom navigation. */}
      <main className="flex-1 w-full max-w-3xl mx-auto pad-safe-x pt-4 pb-28 sm:pb-16">
        <OpenCards.Provider value={openCards}>{view}</OpenCards.Provider>
      </main>
      <Footer />
      <BottomNav view={route.view} navigate={navigate} />
    </div>
  );
}
