import { Bone, Thermometer, FileText, FlaskConical, ListChecks, Clock3 } from "lucide-react";

// Phone-only navigation docked within thumb reach. Labels are kept short, and
// slightly tightened, so all six fit a 320px screen at 11px; the full names are
// on the Toolbar tabs at larger widths.
const NAV_ITEMS = [
  { id: "indications", label: "Indications", to: "/", icon: ListChecks },
  { id: "fractures", label: "Fractures", to: "/fractures", icon: Bone },
  { id: "dosing", label: "Dosing", to: "/dosing", icon: Clock3 },
  { id: "workup", label: "Workup", to: "/workup", icon: Thermometer },
  { id: "drugs", label: "By drug", to: "/drugs", icon: FlaskConical },
  { id: "source", label: "Source", to: "/source", icon: FileText },
];

export default function BottomNav({ view, navigate }) {
  return (
    <nav
      className="no-print sm:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-md border-t border-rule shadow-dock pb-[env(safe-area-inset-bottom)]"
      aria-label="Sections"
    >
      <div className="grid grid-cols-6 h-14">
        {NAV_ITEMS.map((item) => {
          const active = view === item.id;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={"#" + item.to}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.to);
              }}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors active:scale-95 relative ${
                active ? "text-accent-hi bg-well/70" : "text-muted hover:text-prose"
              }`}
            >
              {active && (
                <span className="absolute top-0 inset-x-2 h-0.5 bg-accent rounded-full shadow-glow-cyan" aria-hidden="true" />
              )}
              <Icon className={`size-[18px] ${active ? "text-accent" : "text-muted"}`} aria-hidden="true" />
              <span className={`font-sans text-[11px] leading-none tracking-tight ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
