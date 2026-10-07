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
    <Tag className={`rounded-lg border p-3 ${tone(t).card} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// A section label over a group: a hue dot, a small uppercase title, something
// on the right (a count, a page tag), and an optional blurb beneath.
export function SectionLabel({ id, title, dot = false, aside, blurb, children }) {
  return (
    <div className="mb-2 px-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {dot && <span aria-hidden="true" className="size-2 self-center rounded-full bg-hue shrink-0" />}
        <h2 id={id} className="min-w-0 text-[13px] font-bold uppercase tracking-wide text-prose">
          {title}
        </h2>
        {aside && <span className="ml-auto shrink-0">{aside}</span>}
      </div>
      {blurb && <p className={`mt-0.5 text-[13px] leading-snug text-muted ${dot ? "pl-4" : ""}`}>{blurb}</p>}
      {children}
    </div>
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

// A regimen line, as an order would read: the drug (with its PDF footnote mark)
// over its dose, route and frequency in the data face. `footnotes` resolves a
// regimen entry's `footnote` key to its printed mark ("*", "**").
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
    <div>
      {onDrug ? (
        <button
          type="button"
          onClick={() => onDrug(drug)}
          className="text-left text-[16px] font-bold text-ink leading-snug break-words py-1.5 -my-1.5 hover:text-accent underline decoration-dotted decoration-faint underline-offset-4 transition-colors focus-visible:outline-offset-[-2px]"
        >
          {name}
        </button>
      ) : (
        <span className="text-[16px] font-bold text-ink leading-snug break-words">{name}</span>
      )}
      <div className="mt-0.5 font-mono text-[15px] leading-snug text-prose tabular-nums break-words">
        <span className="font-bold">{fmtDose(dose)}</span>
        {route ? <span className="text-soft"> {route}</span> : null}
        <span> {frequency}</span>
        {note ? <span className="font-sans text-[13px] text-muted"> · {keepUnits(note)}</span> : null}
      </div>
    </div>
  );
}

// The PDF's own connector between combination partners.
export function Plus() {
  return (
    <div className="eyebrow text-muted py-0.5" aria-label="plus">
      plus
    </div>
  );
}

// A regimen as a list with a left rule, after the Antibiogram's lists. The rule
// is neutral: the PDF's regimen column is transcribed, not graded, so it gets no
// "good" tone and no check mark (Gemini review, 2026-10-07). Amber marks the
// alternative column, and only while the Alternatives toggle is on.
export function Regimen({ regimen, footnotes, onDrug, tone: t = "neutral" }) {
  return (
    <ol className={`border-l-2 pl-3 space-y-1.5 ${tone(t).line}`}>
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
export function RegimenInline({ regimen, emphasize }) {
  return (
    <span className="text-[14px] leading-snug text-soft">
      {regimen.map((r, i) => (
        <span key={i}>
          {i > 0 && (
            <span className="text-muted" aria-label="plus">
              {" + "}
            </span>
          )}
          <span className={`font-semibold ${emphasize && emphasize !== r.drug ? "text-soft" : "text-prose"}`}>{r.drug}</span>{" "}
          {/* Wraps: a no-wrap span hid "Pharmacy to dose Pharmacy to dose" under the
              page chip on phones (Gemini review, 2026-10-07). Numbers keep their
              units through the no-break spaces fmtDose and keepUnits insert. */}
          <span className="font-mono text-[13px] text-prose tabular-nums break-words">
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
