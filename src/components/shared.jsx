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

// Quiet reference panels; the medication typography supplies the emphasis.
export function Card({ children, className = "", as: Tag = "section", ...rest }) {
  return (
    <Tag className={`rounded-xl border border-rule bg-card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Each list entry has its own boundary and breathing room.
export function Group({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag className={`reference-list space-y-3 ${className}`} {...rest}>
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

// A persistent section band: a named heading and a matching edge marker on
// each diagnosis, so category context survives a long scroll.
export function SectionLabel({ id, title, aside, blurb, children }) {
  return (
    <div className="section-heading mb-3 rounded-lg border-l-4 border-hue bg-section-bg px-3 py-2.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 id={id} className="min-w-0 flex-1 text-[16px] font-bold leading-tight text-section-ink">
          {title}
        </h2>
        {aside && <span className="ml-auto shrink-0">{aside}</span>}
      </div>
      {blurb && <p className="section-blurb mt-1 text-[13px] leading-snug text-section-soft">{blurb}</p>}
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

// Reference-page heading, with a restrained Mizzou gold rule.
export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="pb-4 border-b-2 border-deepgold">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="text-[28px] sm:text-[36px] font-bold leading-none tracking-tight text-ink mt-1.5">{title}</h1>
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
          className="min-h-11 text-left text-[20px] font-bold text-order-ink leading-tight break-words hover:text-accent underline decoration-dotted decoration-faint underline-offset-4 focus-visible:outline-offset-[-2px]"
        >
          {name}
        </button>
      ) : (
        <span className="block text-[20px] font-bold text-order-ink leading-tight break-words">{name}</span>
      )}
      <div className="mt-1 font-mono text-[18px] font-bold leading-snug text-order-ink tabular-nums break-words">
        <span className="font-bold">{fmtDose(dose)}</span>
        {route ? <span> {route}</span> : null}
        <span> {keepUnits(frequency)}</span>
        {note ? <span className="block mt-1 font-sans text-[14px] font-normal text-soft">{keepUnits(note)}</span> : null}
      </div>
    </div>
  );
}

// The PDF's own connector between combination partners.
export function Plus() {
  return (
    <div className="eyebrow text-soft py-1.5" aria-label="plus">
      plus
    </div>
  );
}

// A regimen in a distinct medication well. The rule
// is neutral: the PDF's regimen column is transcribed, not graded, so it gets no
// "good" tone and no check mark (Gemini review, 2026-10-07). Amber marks the
// alternative column, and only while the Alternatives toggle is on.
export function Regimen({ regimen, footnotes, onDrug, tone: t = "neutral" }) {
  return (
    <ol className={`rounded-lg border border-l-2 bg-order-bg p-3 space-y-1 ${tone(t).line}`}>
      {regimen.map((r, i) => (
        <li key={i}>
          {i > 0 && <Plus />}
          <OrderLine {...r} footnotes={footnotes} onDrug={onDrug} />
        </li>
      ))}
    </ol>
  );
}

// Each partner keeps its own drug and complete dose line, even when collapsed.
export function RegimenInline({ regimen }) {
  return (
    <span className="block text-[18px] leading-snug text-order-ink">
      {regimen.map((r, i) => (
        <span key={i} className="block">
          {i > 0 && (
            <span className="block py-1 text-[11px] uppercase tracking-wide font-semibold text-soft" aria-label="plus">
              plus
            </span>
          )}
          <span className="block font-bold text-[20px] leading-tight break-words">{r.drug}</span>
          {/* Wraps: a no-wrap span hid "Pharmacy to dose Pharmacy to dose" under the
              page chip on phones (Gemini review, 2026-10-07). Numbers keep their
              units through the no-break spaces fmtDose and keepUnits insert. */}
          <span className="block mt-1 font-mono text-[18px] font-bold tabular-nums break-words">
            {fmtDose(r.dose)} {r.route ? r.route + " " : ""}{keepUnits(r.frequency)}
          </span>
        </span>
      ))}
    </span>
  );
}

// A PDF cell that may hold several lines ("24 hours", "OR", "4 days after…").
export function Lines({ value, muted = ["or", "OR", "+/-", "plus"] }) {
  if (value == null) return <span className="text-soft">N/A</span>;
  const lines = Array.isArray(value) ? value : [value];
  if (lines.length === 1) return <span className="leading-snug">{keepUnits(lines[0])}</span>;
  return (
    <ul className="space-y-1">
      {lines.map((l, i) => (
        <li key={i} className={muted.includes(l) ? "eyebrow text-soft" : "leading-snug"}>
          {keepUnits(l)}
        </li>
      ))}
    </ul>
  );
}
