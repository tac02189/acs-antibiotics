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
// `mark` the label and icon colour, `line` the left rule of a regimen list.
export const TONES = {
  warn: { card: "bg-warn-bg border-warn-line text-warn-ink", mark: "text-warn-mark", line: "border-warn-line" },
  danger: { card: "bg-danger-bg border-danger-line text-danger-ink", mark: "text-danger-mark", line: "border-danger-line" },
  good: { card: "bg-good-bg border-good-line text-good-ink", mark: "text-good-mark", line: "border-good-line" },
  neutral: { card: "bg-well border-rule text-prose", mark: "text-muted", line: "border-rule-strong" },
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

// The bordered group that list rows sit in: hairline dividers between rows, one
// border around the group. Decoration lives on the group, not on each row.
export function Group({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag className={`divide-y divide-rule-soft overflow-hidden rounded-lg border border-rule bg-card shadow-sm ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// A tone-washed card: the amber / rose / emerald cards of the Peds app.
export function ToneCard({ tone: t = "neutral", children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag className={`rounded-lg border p-3.5 ${tone(t).card} shadow-sm ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// A section label over a group: a hue dot, a bold uppercase title, something
// on the right (a count, a page tag), and an optional blurb beneath.
export function SectionLabel({ id, title, dot = false, aside, blurb, children }) {
  return (
    <div className="mb-2.5 px-0.5">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex items-center gap-2 min-w-0">
          {dot && <span aria-hidden="true" className="size-2.5 rounded-full bg-hue shrink-0 ring-2 ring-hue/30" />}
          <h2 id={id} className="min-w-0 text-[14px] font-bold uppercase tracking-wider text-ink">
            {title}
          </h2>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {blurb && <p className="mt-1 text-[13px] leading-snug text-muted">{blurb}</p>}
      {children}
    </div>
  );
}

// A page reference chip.
export function PageTag({ page, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-chip border border-rule-soft px-1.5 py-0.5 text-[11px] font-bold text-soft whitespace-nowrap tabular-nums">
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
    <header className="pb-3.5 border-b border-rule">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight text-ink mt-0.5">{title}</h1>
      {children}
    </header>
  );
}

// A card heading row: title on the left, a page tag on the right.
export function CardHeading({ title, page, children }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-rule-soft pb-2.5 mb-3.5">
      <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug text-ink text-balance">{title}</h2>
      {page != null ? <PageTag page={page} /> : children}
    </div>
  );
}

// A regimen line, as an order would read: the drug (with its PDF footnote mark)
// over its dose, route and frequency in a prominent clinical order block.
export function OrderLine({ drug, footnote, dose, frequency, route, note, footnotes, onDrug }) {
  const mark = footnote && footnotes ? footnotes[footnote]?.mark : null;
  const name = (
    <>
      {drug}
      {mark && (
        <sup className="ml-0.5 font-mono text-[12px] font-bold text-warn-mark" aria-label={`footnote ${mark}`}>
          {mark}
        </sup>
      )}
    </>
  );
  return (
    <div className="rounded-md border border-rule bg-card p-3 shadow-xs">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        {onDrug ? (
          <button
            type="button"
            onClick={() => onDrug(drug)}
            className="text-left text-[16px] font-bold text-ink leading-snug break-words py-0.5 hover:text-accent underline decoration-dotted decoration-faint underline-offset-4 transition-colors focus-visible:outline-offset-[-2px]"
          >
            {name}
          </button>
        ) : (
          <span className="text-[16px] font-bold text-ink leading-snug break-words">{name}</span>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[15px] leading-snug text-ink tabular-nums break-words">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-chip border border-rule font-bold text-ink">
          {fmtDose(dose)}
        </span>
        {route ? <span className="font-semibold text-soft">{route}</span> : null}
        <span className="font-semibold text-prose">{frequency}</span>
      </div>
      {note ? <div className="mt-1 font-sans text-[13px] text-muted leading-snug">· {keepUnits(note)}</div> : null}
    </div>
  );
}

// The PDF's own connector between combination partners.
export function Plus() {
  return (
    <div className="flex items-center gap-2 py-1 px-1" aria-label="plus">
      <span className="eyebrow text-[11px] font-bold text-soft tracking-wider uppercase">plus</span>
      <span className="h-px flex-1 bg-rule" aria-hidden="true" />
    </div>
  );
}

// A regimen as a list with a left rule. The rule is neutral: the PDF's
// regimen column is transcribed, not graded. Amber marks the alternative
// column, and only while the Alternatives toggle is on.
export function Regimen({ regimen, footnotes, onDrug, tone: t = "neutral" }) {
  return (
    <ol className={`border-l-[3px] pl-3.5 space-y-2 ${tone(t).line}`}>
      {regimen.map((r, i) => (
        <li key={i}>
          {i > 0 && <Plus />}
          <OrderLine {...r} footnotes={footnotes} onDrug={onDrug} />
        </li>
      ))}
    </ol>
  );
}

// One-line summary of a regimen: Cefazolin 2 g Q8H + Metronidazole 500 mg Q12H.
// Drug names in bold text-ink and doses highlighted in high-contrast badges.
export function RegimenInline({ regimen, emphasize }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[14px] leading-snug">
      {regimen.map((r, i) => (
        <span key={i} className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {i > 0 && (
            <span className="text-muted font-bold text-[13px] px-0.5" aria-label="plus">
              +
            </span>
          )}
          <span className={`font-bold ${emphasize && emphasize !== r.drug ? "text-soft" : "text-ink"}`}>
            {r.drug}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-chip border border-rule font-mono text-[13px] font-bold text-ink tabular-nums break-words">
            {fmtDose(r.dose)} {r.frequency}
          </span>
        </span>
      ))}
    </span>
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
