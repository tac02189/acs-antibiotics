import { createContext, useContext, useEffect, useRef } from "react";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { source } from "../data/pmg.js";
import { fmtDose, keepUnits } from "../lib/text.js";
import { TABLES, dosingRow, redoseLabel } from "../lib/dosing.js";

// The PDF's filename carries its content hash (see source.file), so a new
// edition is a new URL and no cache — HTTP or service worker — can hand back an
// old copy under it.
export const pdfHref = `/${source.file}`;

// Number-and-unit display helpers (no-break spaces only; see src/lib/text.js).
export { fmtDose, keepUnits };

// Tone classes, after the Pediatric CPG's tones.js: complete literals so the
// Tailwind content scan keeps them. `card` is a wash with its line and ink,
// `mark` the label and icon colour.
export const TONES = {
  warn: { card: "bg-warn-bg border-warn-line text-warn-ink", mark: "text-warn-mark" },
  danger: { card: "bg-danger-bg border-danger-line text-danger-ink", mark: "text-danger-mark" },
  good: { card: "bg-good-bg border-good-line text-good-ink", mark: "text-good-mark" },
  neutral: { card: "bg-well border-rule text-prose", mark: "text-muted" },
};
export const tone = (t) => TONES[t] || TONES.neutral;

// A white card with a hairline border.
export function Card({ children, className = "", as: Tag = "section", ...rest }) {
  return (
    <Tag className={`rounded-lg border border-rule bg-card shadow-sm ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// The bordered group that list rows sit in: a rule between rows, one border
// around the group. Decoration lives on the group, not on each row. (The
// Indications list does not use it: its rows are separate cards, each on its
// section's hue spine — IndicationRow.)
export function Group({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`divide-y divide-rule overflow-hidden rounded-lg border border-rule bg-card shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// A tone-washed card: the amber / rose / emerald cards of the Peds app.
export function ToneCard({ tone: t = "neutral", children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag className={`rounded-lg border p-3 ${tone(t).card} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Which collapsible cards and rows the reader has opened, as a set of keys
// ("<view>:<id>"), with `toggle(key)` and `setMany(keys, open)`. App holds it,
// so the choices survive a trip to another tab; it is not stored, so a fresh
// launch starts with every one collapsed, as the Indications sections do.
export const OpenCards = createContext({ opened: new Set(), toggle: () => {}, setMany: () => {} });

export function useCardOpen(key) {
  const { opened, toggle } = useContext(OpenCards);
  return [opened.has(key), () => toggle(key)];
}

// "Expand all" while anything it covers is collapsed, "Collapse all" once
// everything is open (v0.7.8, Thiago, 2026-10-08). Opening everything also lets
// the browser's find-in-page reach the text, which an inert panel hides.
export function ExpandAllButton({ allOpen, onClick }) {
  const Icon = allOpen ? ChevronsDownUp : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded px-2 min-h-[44px] text-[14px] font-semibold text-accent hover:text-accent-hi transition-colors"
    >
      <Icon className="size-4" aria-hidden="true" />
      {allOpen ? "Collapse all" : "Expand all"}
    </button>
  );
}

// The button for a set of OpenCards keys, on its own right-aligned row. -mb-4
// pulls it towards the cards it opens (4px clear of them in a space-y-5 stack),
// so its 44px tap height does not leave it floating between two blocks. It sits
// on an inner flex item: space-y-* sets the row's own bottom margin and would
// override it there.
export function ExpandAll({ keys }) {
  const { opened, setMany } = useContext(OpenCards);
  const allOpen = keys.every((k) => opened.has(k));
  return (
    <div className="flex justify-end">
      <div className="-mb-4">
        <ExpandAllButton allOpen={allOpen} onClick={() => setMany(keys, !allOpen)} />
      </div>
    </div>
  );
}

// A card that collapses (v0.7.7): the title is one 56px button over a panel
// holding the rest, drawn as an indication row is (`.expand`, `inert` while
// closed), so it animates as a row does and prints open. `id` is its key in
// OpenCards. `tone="warn"` gives the amber card of the physician notes; `icon`
// sits before the title. (v0.7.10's `preview`, the pills under the closed
// Antimicrobial by type card, went with v0.7.12, when that card stopped
// collapsing.)
export function CollapsibleCard({ id, title, icon: Icon, tone: t, className = "", as: Tag = "section", children }) {
  const [open, toggle] = useCardOpen(id);
  const panelId = `cc-${id.replace(/[^A-Za-z0-9_-]/g, "-")}`;
  const warn = t === "warn";
  return (
    <Tag
      className={`overflow-hidden rounded-lg border ${warn ? TONES.warn.card : "border-rule bg-card shadow-sm"} ${className}`}
    >
      <div className={`group transition-colors ${warn ? "" : "hover:bg-well"}`}>
        <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex w-full min-h-[56px] items-center gap-3 px-4 py-3 text-left focus-visible:outline-offset-[-2px]"
          >
            {Icon && <Icon className={`size-5 shrink-0 ${warn ? "text-warn-mark" : "text-accent"}`} aria-hidden="true" />}
            <span className={`min-w-0 flex-1 text-balance ${warn ? "text-warn-ink" : "text-ink"}`}>{title}</span>
            <ChevronDown
              className={`size-4 shrink-0 transition-transform duration-200 ${
                warn ? "text-warn-mark" : "text-muted group-hover:text-prose"
              } ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </h2>
      </div>
      <div className="expand" data-open={open} id={panelId}>
        {/* inert keeps the collapsed panel out of the tab order and the a11y tree. */}
        <div inert={open ? undefined : ""} aria-hidden={!open}>
          <div className={`px-4 pt-3 pb-4 border-t ${warn ? "border-warn-line" : "border-rule-soft"}`}>{children}</div>
        </div>
      </div>
    </Tag>
  );
}

// Publishes a sticky section head's rendered height on its <section> as
// --section-head-h, which the rows read as their scroll margin.
export function publishHeadHeight(head) {
  head?.parentElement?.style.setProperty("--section-head-h", `${head.offsetHeight}px`);
}

// A section head: the section's title on its hue spine, something on the right
// (a count), and an optional blurb under the title row. `sticky`
// keeps the title row just under the brand bar while the section's rows scroll
// past it, so the reader always knows which section they are in; the blurb
// scrolls away with the rows. z-30 sits under the header's z-40. Rows inside a
// sticky section read the head's measured height (--section-head-h, published on
// the <section>) as their scroll margin, so a deep link or a keyboard focus lands
// below the stuck title at any text size.
//
// The head and the blurb are rendered as a fragment, so both are direct children
// of the <section> the caller renders them in: a sticky element sticks only
// within its parent box, and wrapped in a div of its own it scrolled away with
// the blurb instead of staying put for the rows (found 2026-10-07, 414px).
//
// With `onToggle` the whole head is one button (`open`, `controls`) that shows
// or hides the section's list, after the accordion pattern: an h2 holding the
// button, the title's span carrying `id` for the section's aria-labelledby.
export function SectionHead({ id, title, aside, blurb, sticky = false, open = true, onToggle, controls }) {
  const ref = useRef(null);
  // A fixed 64px margin hid part of a deep-linked row behind a two-line head at
  // 200% text (Gemini review, 2026-10-07); measuring it, as Header.jsx does for
  // the brand bar, holds at any width or text size.
  useEffect(() => {
    const el = ref.current;
    if (!sticky || !el?.parentElement) return;
    const set = () => publishHeadHeight(el);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sticky]);

  // Collapsing from the stuck position would leave the head far above the
  // viewport once the rows under it are gone, and the reader somewhere in the
  // next section. So a stuck head brings its section back to the top first.
  const toggle = () => {
    const el = ref.current;
    const section = el?.parentElement;
    const stuck = open && el && section && el.getBoundingClientRect().top - section.getBoundingClientRect().top > 1;
    onToggle();
    if (stuck) requestAnimationFrame(() => section.scrollIntoView({ block: "start" }));
  };

  return (
    <>
      <div
        ref={ref}
        className={`section-head border-l-4 border-l-hue bg-paper ${onToggle ? "" : "flex items-center gap-x-3 py-1.5 pl-3"} ${
          blurb ? "" : "mb-2"
        } ${sticky ? "sticky top-[var(--app-header-h,6.625rem)] z-30" : ""}`}
      >
        {onToggle ? (
          <h2 className="text-[18px] font-bold leading-tight">
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={controls}
              className="group flex w-full min-h-[44px] items-center gap-x-3 py-1.5 pl-3 pr-1 text-left focus-visible:outline-offset-[-2px]"
            >
              <span id={id} className="min-w-0 flex-1 text-ink">
                {title}
              </span>
              {/* A real space, so the button's name is not "Trauma12"; flex does
                  not render it. */}{" "}
              {aside && <span className="shrink-0">{aside}</span>}
              <ChevronDown
                className={`size-4 shrink-0 text-muted transition-transform duration-200 group-hover:text-prose ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
          </h2>
        ) : (
          <>
            <h2 id={id} className="min-w-0 text-[18px] font-bold leading-tight text-ink">
              {title}
            </h2>
            {aside && <span className="ml-auto shrink-0 pr-1">{aside}</span>}
          </>
        )}
      </div>
      {/* The blurb shows whether the section is open or collapsed (Thiago, 2026-10-08), so a
          collapsed head still says what the section covers. */}
      {blurb && <p className="mt-1 mb-2 pl-4 text-[13px] leading-snug text-muted">{blurb}</p>}
    </>
  );
}

// The small uppercase label above a page title.
export function Eyebrow({ children, className = "" }) {
  return <div className={`eyebrow text-muted ${className}`}>{children}</div>;
}

// A page heading: eyebrow, title and an optional intro, as the Peds app heads a
// guideline.
export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="pb-3 border-b border-rule">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight text-ink mt-0.5">{title}</h1>
      {children}
    </header>
  );
}

// A card heading row: title on the left, anything passed as children on the right.
export function CardHeading({ title, children }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-rule-soft pb-2 mb-3">
      <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug text-ink text-balance">{title}</h2>
      {children}
    </div>
  );
}

// ─── The dose plate ─────────────────────────────────────────────────────────
// Mizzou black, the drug in white, the dose in gold mono. Every medication in
// the app sits on one — the collapsed regimen pills, the expanded regimen, the
// open-fracture regimens, the dosing table and the By-drug lists — so the
// medication is the first thing the eye lands on wherever it appears. The plate
// is neutral: the PDF's regimen column is transcribed, not graded, so it carries
// no "good" tone and no check mark (Gemini review, 2026-10-07). The `plate`
// class is for print (index.css), which clears the fill and keeps a box.
export function Plate({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag className={`plate bg-plate text-plate-ink ring-1 ring-inset ring-plate-line ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// A drug name on the plate: a button to its By-drug entry when `onDrug` is given.
function PlateDrug({ drug, onDrug }) {
  return onDrug ? (
    <button
      type="button"
      onClick={() => onDrug(drug)}
      className="text-left text-[16px] font-bold text-plate-ink leading-snug break-words py-[11px] -my-[11px] underline decoration-dotted decoration-plate-soft/60 underline-offset-4 hover:text-plate-dose transition-colors focus-visible:outline-offset-[-2px]"
    >
      {drug}
    </button>
  ) : (
    <span className="text-[16px] font-bold text-plate-ink leading-snug break-words">{drug}</span>
  );
}

// A label and value on the plate: a dosing table's own column header over its cell.
export function PlateField({ label, children }) {
  return (
    <div className="mt-1.5">
      <div className="eyebrow text-plate-soft">{label}</div>
      <div className="font-mono text-[15px] font-bold leading-snug text-plate-dose tabular-nums break-words">{children}</div>
    </div>
  );
}

// One drug of an indication row on the plate, with its line from the dosing
// table that matches the row's section (src/lib/dosing.js): the prophylaxis
// table's dose, OR redosing interval and OR infusion time, each under the
// table's own header; or the empiric table's dose, route and frequency. A drug
// the matching table does not list says so, and shows no dose.
export function DrugDose({ drug, kind, onDrug }) {
  const row = dosingRow(drug, kind);
  const t = TABLES[kind];
  return (
    <div>
      <PlateDrug drug={drug} onDrug={onDrug} />
      {!row ? (
        <p className="mt-0.5 text-[13px] leading-snug text-plate-soft">
          Not in the {kind === "prophylaxis" ? "prophylaxis" : "empiric"} dosing table
        </p>
      ) : kind === "prophylaxis" ? (
        <>
          <div className="mt-0.5 font-mono text-[16px] font-bold leading-snug text-plate-dose tabular-nums break-words">
            {row.dose.map((l, i) => (
              <span key={i} className="block">
                {keepUnits(fmtDose(l))}
              </span>
            ))}
          </div>
          <PlateField label={t.columns.redose}>{row.redose}</PlateField>
          <PlateField label={t.columns.infusion}>{keepUnits(row.infusion)}</PlateField>
        </>
      ) : (
        <div className="mt-0.5 font-mono text-[16px] font-bold leading-snug text-plate-dose tabular-nums break-words">
          {fmtDose(row.dose)}
          <span className="font-medium text-plate-soft"> {row.route}</span>
          <span className="font-medium"> {row.frequency}</span>
        </div>
      )}
    </div>
  );
}

// A regimen line on the plate for an open-fracture bullet: the drug over its
// dose, route and frequency, then its note ("IV: pharmacy to dose").
export function OrderLine({ drug, dose, frequency, route, note, onDrug }) {
  return (
    <div>
      <PlateDrug drug={drug} onDrug={onDrug} />
      <div className="mt-0.5 font-mono text-[16px] font-bold leading-snug text-plate-dose tabular-nums break-words">
        {dose ? fmtDose(dose) : null}
        {route ? (
          <span className="font-medium text-plate-soft">
            {dose ? " " : ""}
            {route}
          </span>
        ) : null}
        {frequency ? <span className="font-medium"> {keepUnits(frequency)}</span> : null}
        {/* The note moves to the next line as a unit rather than splitting; the colon is the PDF's. */}
        {note ? (
          <span className="font-sans text-[13px] font-medium text-plate-soft">
            : <span className="inline-block max-w-full">{keepUnits(note)}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

// The PDF's own connector between combination partners.
export function Plus() {
  return (
    <div className="eyebrow text-plate-soft py-1" aria-label="plus">
      plus
    </div>
  );
}

// An indication row's preferred drugs on one plate, "plus" between them.
export function Regimen({ drugs, kind, onDrug, className = "" }) {
  return (
    <Plate as="ol" className={`rounded-lg px-3.5 py-3 ${className}`}>
      {drugs.map((d, i) => (
        <li key={d}>
          {i > 0 && <Plus />}
          <DrugDose drug={d} kind={kind} onDrug={onDrug} />
        </li>
      ))}
    </Plate>
  );
}

// One small plate: the drug in white, its detail in gold mono. `dim` is a
// By-drug row's partner, dimmed to the soft grey.
function Pill({ drug, dim, children }) {
  return (
    <Plate
      as="span"
      className={`inline-flex min-w-0 max-w-full flex-wrap items-baseline gap-x-1.5 rounded-md px-2 py-1 text-[13px] leading-snug ${
        dim ? "text-plate-soft" : ""
      }`}
    >
      <span className="font-bold">{drug}</span>
      {/* A real space between the name and the dose: the flex gap is visual only, and
          without it a screen reader or the clipboard gets "Cefazolin2 g" (Gemini
          review, 2026-10-07). Flex does not render whitespace-only text, so the
          layout is unchanged. */}{" "}
      {children ? (
        <span className={`font-mono font-bold tabular-nums break-words ${dim ? "" : "text-plate-dose"}`}>{children}</span>
      ) : null}
    </Plate>
  );
}

// Pills joined by the "+" the PDF prints between partners. Pills wrap as
// units, the "+" staying with the pill it introduces, and the text inside a
// pill wraps too: a no-wrap span once hid "Pharmacy to dose Pharmacy to dose"
// under the page chip on phones (Gemini review, 2026-10-07).
function PillRow({ pills }) {
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
      {pills.map((pill, i) => (
        <span key={i} className="inline-flex max-w-full items-center gap-x-1.5">
          {i > 0 && (
            <span className="text-[14px] font-bold text-muted">
              <span aria-hidden="true">+</span>
              <span className="sr-only">plus</span>
            </span>
          )}
          {pill}
        </span>
      ))}
    </span>
  );
}

// A combination of drugs as pills, each with its line from the matching dosing
// table: [Cefazolin 2 g if < 120 kg, 3 g if ≥ 120 kg · OR redose 3 h] +
// [Metronidazole 500 mg · OR redose 8 h]. A drug the table does not list is a
// name-only pill. `emphasize` names the drug a By-drug row is about; its
// partners are dimmed.
export function DrugPills({ drugs, kind, emphasize }) {
  return (
    <PillRow
      pills={drugs.map((d) => {
        const row = dosingRow(d, kind);
        const dim = Boolean(emphasize) && emphasize !== d;
        let detail = null;
        if (row && kind === "prophylaxis") {
          detail = (
            <>
              {keepUnits(fmtDose(row.dose.join(" ")))}
              {/* The redose note moves to the next line whole rather than splitting. */}{" "}
              <span className="inline-block font-sans font-medium">· {keepUnits(redoseLabel(row))}</span>
            </>
          );
        } else if (row) {
          detail = `${fmtDose(row.dose)} ${row.route} ${row.frequency}`;
        }
        return (
          <Pill key={d} drug={d} dim={dim}>
            {detail}
          </Pill>
        );
      })}
    />
  );
}

// The alternative column as pills: each line, its "Linezolid alternative:"
// label when it has one, then its choices joined by "or".
export function AlternativePills({ alternative, kind, emphasize }) {
  if (alternative == null) return <span className="text-muted">N/A</span>;
  return (
    <span className="block space-y-1.5">
      {alternative.map((line, i) => (
        <span key={i} className="block">
          {line.for && <span className="block mb-1 text-[13px] font-semibold">{line.for} alternative:</span>}
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {line.options.map((o, k) => (
              <span key={k} className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1.5">
                {k > 0 && <span className="text-[13px] font-bold">or</span>}
                <DrugPills drugs={o} kind={kind} emphasize={emphasize} />
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

// An open-fracture regimen as pills: [Cefazolin 2 g IV Q8H] + [Vancomycin IV: pharmacy to dose].
// On the pills the route and the note stay gold with the dose (Thiago, 2026-10-15: "keep A").
export function RegimenInline({ regimen, emphasize }) {
  return (
    <PillRow
      pills={regimen.map((r, i) => (
        <Pill key={i} drug={r.drug} dim={Boolean(emphasize) && emphasize !== r.drug}>
          {[r.dose && fmtDose(r.dose), r.route, r.frequency && keepUnits(r.frequency)].filter(Boolean).join(" ")}
          {/* As on the plate, the note moves to the next line whole (v0.7.10). */}
          {r.note ? (
            <span className="font-sans font-medium">
              : <span className="inline-block max-w-full">{keepUnits(r.note)}</span>
            </span>
          ) : null}
        </Pill>
      ))}
    />
  );
}

// A PDF cell that may hold several lines ("24 hours", "OR", "4 days after…").
export function Lines({ value, muted = ["or", "OR", "+/-", "plus"] }) {
  if (value == null) return <span className="text-muted">N/A</span>;
  const lines = Array.isArray(value) ? value : [value];
  if (lines.length === 1) return <span className="leading-snug">{keepUnits(lines[0])}</span>;
  return (
    <ul className="space-y-1">
      {lines.map((l, i) => (
        <li key={i} className={muted.includes(l) ? "eyebrow text-muted" : "leading-snug"}>
          {keepUnits(l)}
        </li>
      ))}
    </ul>
  );
}
