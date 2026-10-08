import { Bone, Thermometer, FileText, FlaskConical, ListChecks, Clock3 } from "lucide-react";

// Phone-only navigation docked within thumb reach. Labels are kept short, and
// slightly tightened, so all six fit a 320px screen at 11px; the full names are
// on the header's tab row at larger widths. Black and gold anchor the phone
// view; the active item has both a gold mark and a raised background.
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
      className="no-print sm:hidden fixed bottom-0 inset-x-0 z-40 bg-bar border-t border-bar-line pb-[env(safe-area-inset-bottom)]"
      aria-label="Sections"
    >
      <div className="grid grid-cols-6 h-16">
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
              className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-colors focus-visible:outline-offset-[-2px] ${
                active ? "text-gold bg-bar-raised" : "text-bar-muted hover:text-bar-text"
              }`}
            >
              {active && <span className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-gold" aria-hidden="true" />}
              <Icon className="size-5" aria-hidden="true" />
              <span className={`text-[11px] leading-none tracking-tight ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
