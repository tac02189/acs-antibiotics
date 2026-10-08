import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { source } from "../data/pmg.js";
import { fmtDose, keepUnits } from "../lib/text.js";

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

// A section head: the section's title on its hue spine, something on the right
// (a count, a page tag), and an optional blurb under the title row. `sticky`
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
    const section = el?.parentElement;
    if (!sticky || !el || !section) return;
    const set = () => section.style.setProperty("--section-head-h", `${el.offsetHeight}px`);
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
          blurb && open ? "" : "mb-2"
        } ${sticky ? "sticky top-[var(--app-header-h,7.25rem)] z-30" : ""}`}
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
              {/* A real space, so the button's name is not "Trauma12 · p.1"; flex does
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
      {/* A collapsed section hides its blurb on screen but keeps it in the DOM, so print
          (which shows collapsed lists) still has it (Codex review, 2026-10-08). */}
      {blurb && (
        <p hidden={!open} className="section-blurb mt-1 mb-2 pl-4 text-[13px] leading-snug text-muted">
          {blurb}
        </p>
      )}
    </>
  );
}

// A page reference chip.
export function PageTag({ page, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-chip px-1.5 py-0.5 text-[11px] font-semibold text-soft whitespace-nowrap tabular-nums">
      {children}
      <span>PMG p.{page}</span>
    </span>
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

// A card heading row: title on the left, a page tag on the right.
export function CardHeading({ title, page, children }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-rule-soft pb-2 mb-3">
      <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug text-ink text-balance">{title}</h2>
      {page != null ? <PageTag page={page} /> : children}
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

// A regimen line on the plate: the drug (with its PDF footnote mark) over its
// dose, route and frequency. `footnotes` resolves a regimen entry's `footnote`
// key to its printed mark ("*", "**").
export function OrderLine({ drug, footnote, dose, frequency, route, note, footnotes, onDrug }) {
  const mark = footnote && footnotes ? footnotes[footnote]?.mark : null;
  const name = (
    <>
      {drug}
      {mark && (
        <sup className="ml-0.5 font-mono text-[12px] font-bold text-plate-dose" aria-label={`footnote ${mark}`}>
          {mark}
        </sup>
      )}
    </>
  );
  return (
    <div>
      {onDrug ? (
        <button
          type="button"
          onClick={() => onDrug(drug)}
          className="text-left text-[16px] font-bold text-plate-ink leading-snug break-words py-[11px] -my-[11px] underline decoration-dotted decoration-plate-soft/60 underline-offset-4 hover:text-plate-dose transition-colors focus-visible:outline-offset-[-2px]"
        >
          {name}
        </button>
      ) : (
        <span className="text-[16px] font-bold text-plate-ink leading-snug break-words">{name}</span>
      )}
      <div className="mt-0.5 font-mono text-[16px] font-bold leading-snug text-plate-dose tabular-nums break-words">
        {fmtDose(dose)}
        {route ? <span className="font-medium text-plate-soft"> {route}</span> : null}
        <span className="font-medium"> {keepUnits(frequency)}</span>
        {note ? <span className="font-sans text-[13px] font-medium text-plate-soft">, {keepUnits(note)}</span> : null}
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

// A regimen on one plate: each partner as an OrderLine, "plus" between them.
export function Regimen({ regimen, footnotes, onDrug, className = "" }) {
  return (
    <Plate as="ol" className={`rounded-lg px-3.5 py-3 ${className}`}>
      {regimen.map((r, i) => (
        <li key={i}>
          {i > 0 && <Plus />}
          <OrderLine {...r} footnotes={footnotes} onDrug={onDrug} />
        </li>
      ))}
    </Plate>
  );
}

// A regimen as pills, one small plate per partner, for collapsed rows and
// lists: [Cefazolin 2 g Q8H] + [Metronidazole 500 mg Q12H]. `emphasize` names
// the drug a By-drug row is about; its partners are dimmed to the soft grey.
// Pills wrap as units, the "+" staying with the pill it introduces, and the
// text inside a pill wraps too: a no-wrap span once hid
// "Pharmacy to dose Pharmacy to dose" under the page chip on phones (Gemini
// review, 2026-10-07).
export function RegimenInline({ regimen, emphasize, footnotes }) {
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
      {regimen.map((r, i) => {
        const dim = emphasize && emphasize !== r.drug;
        const mark = r.footnote && footnotes ? footnotes[r.footnote]?.mark : null;
        return (
          <span key={i} className="inline-flex max-w-full items-center gap-x-1.5">
            {i > 0 && (
              <span className="text-[14px] font-bold text-muted">
                <span aria-hidden="true">+</span>
                <span className="sr-only">plus</span>
              </span>
            )}
            <Plate
              as="span"
              className={`inline-flex min-w-0 max-w-full flex-wrap items-baseline gap-x-1.5 rounded-md px-2 py-1 text-[13px] leading-snug ${
                dim ? "text-plate-soft" : ""
              }`}
            >
              <span className="font-bold">
                {r.drug}
                {mark && (
                  <sup className="ml-0.5 font-mono text-[11px] font-bold text-plate-dose" aria-label={`footnote ${mark}`}>
                    {mark}
                  </sup>
                )}
              </span>
              {/* A real space between the name and the dose: the flex gap is visual only, and
                  without it a screen reader or the clipboard gets "Cefazolin2 g" (Gemini
                  review, 2026-10-07). Flex does not render whitespace-only text, so the
                  layout is unchanged. */}{" "}
              <span className={`font-mono font-bold tabular-nums break-words ${dim ? "" : "text-plate-dose"}`}>
                {fmtDose(r.dose)}
                {r.route ? ` ${r.route}` : ""} {keepUnits(r.frequency)}
                {r.note ? <span className="font-sans font-medium">, {keepUnits(r.note)}</span> : null}
              </span>
            </Plate>
          </span>
        );
      })}
    </span>
  );
}

// A dosing-table cell on the plate: the PDF's column label over its lines
// ("Adult Dosing (age ≥15 years)" over "2 g IV Q8h").
export function DosePlate({ label, lines }) {
  return (
    <Plate className="rounded-lg px-3 py-2.5">
      {/* 12px: the adult label carries the PMG's age threshold, kept with its unit. */}
      <div className="eyebrow text-[12px] text-plate-soft mb-1">{keepUnits(label)}</div>
      <ul className="space-y-0.5">
        {lines.map((l) => (
          <li key={l} className="font-mono text-[15px] font-bold leading-snug text-plate-dose tabular-nums break-words">
            {keepUnits(l)}
          </li>
        ))}
      </ul>
    </Plate>
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
