import { source } from "../data/pmg.js";
import { fmtDose, keepUnits } from "../lib/text.js";

// The PDF's filename carries its content hash (see source.file), so a new
// edition is a new URL and no cache — HTTP or service worker — can hand back an
// old copy under it.
export const pdfHref = `/${source.file}`;

// Number-and-unit display helpers (no-break spaces only; see src/lib/text.js).
export { fmtDose, keepUnits };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function PageTag({ page, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted bg-paper/90 px-2 py-0.5 rounded border border-rule/80 whitespace-nowrap">
      {children}
      <span>PMG p.{page}</span>
    </span>
  );
}

export function Eyebrow({ children, className = "" }) {
  return (
    <div className={`eyebrow text-muted flex items-center gap-1.5 ${className}`}>
      <span className="size-1.5 rounded-full bg-accent/80 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function Card({ children, className = "", as: Tag = "section", ...rest }) {
  return (
    <Tag className={`rounded-lg border border-rule bg-card shadow-card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// A regimen line: drug (with its PDF footnote mark) · dose in a readout well ·
// frequency, as an order would read. `footnotes` resolves a regimen entry's
// `footnote` key to its printed mark ("*", "**").
export function OrderLine({ drug, footnote, dose, frequency, route, note, footnotes, onDrug }) {
  const mark = footnote && footnotes ? footnotes[footnote]?.mark : null;
  const name = (
    <>
      {drug}
      {mark && (
        <sup className="ml-0.5 font-mono text-[13px] text-hazard-amber" aria-label={`footnote ${mark}`}>
          {mark}
        </sup>
      )}
    </>
  );
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] sm:grid-cols-[minmax(0,1fr)_minmax(0,auto)_auto] items-center gap-x-3 gap-y-1 rounded-lg bg-well/90 border border-rule/80 px-3 py-2.5 shadow-inner">
      <div className="min-w-0">
        {onDrug ? (
          <button
            type="button"
            onClick={() => onDrug(drug)}
            className="text-left font-display font-bold text-[16px] text-ink break-words py-1.5 -my-1.5 hover:text-accent-hi underline decoration-rule decoration-dotted underline-offset-4 transition-colors focus-visible:outline-offset-[-2px]"
          >
            {name}
          </button>
        ) : (
          <span className="font-display font-bold text-[16px] text-ink break-words">{name}</span>
        )}
      </div>

      {/* High-luminance dose readout. Wraps rather than squeezing the drug name. */}
      <div className="flex flex-wrap items-baseline justify-end gap-x-1.5 bg-readout/95 px-2.5 py-1 rounded border border-rule/90 justify-self-end min-w-0 max-w-full">
        <span className="font-mono text-[18px] sm:text-[20px] font-bold text-dose tabular-nums leading-none tracking-tight break-words min-w-0">
          {fmtDose(dose)}
        </span>
        {route ? <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent-hi">{route}</span> : null}
      </div>

      <div className="col-span-2 sm:col-span-1 justify-self-start sm:justify-self-end font-mono text-[13px] font-semibold uppercase tracking-wider text-prose">
        <span>{frequency}</span>
        {note ? <span className="normal-case tracking-normal text-muted font-normal"> · {keepUnits(note)}</span> : null}
      </div>
    </div>
  );
}

// The PDF's own connector between combination partners. It carries the space
// on both sides of itself, so a regimen list needs no spacing of its own.
export function Plus() {
  return (
    <div className="flex items-center gap-2 py-1 px-3" aria-label="plus">
      <div className="h-px flex-1 bg-rule/50" aria-hidden="true" />
      <span className="eyebrow text-muted tracking-widest leading-none bg-paper px-2 py-1 rounded border border-rule/60">plus</span>
      <div className="h-px flex-1 bg-rule/50" aria-hidden="true" />
    </div>
  );
}

export function Regimen({ regimen, footnotes, onDrug }) {
  return (
    <ol>
      {regimen.map((r, i) => (
        <li key={i}>
          {i > 0 && <Plus />}
          <OrderLine {...r} footnotes={footnotes} onDrug={onDrug} />
        </li>
      ))}
    </ol>
  );
}

// One-line summary of a regimen as readout pills:
// [Cefazolin 2 g Q8H] [+ Metronidazole 500 mg Q12H].
export function RegimenInline({ regimen, emphasize }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {regimen.map((r, i) => (
        <span
          key={i}
          className="inline-flex flex-wrap items-baseline gap-x-1.5 bg-paper/90 border border-rule/80 px-2 py-0.5 rounded text-[13px] max-w-full min-w-0"
        >
          {i > 0 && (
            <span className="text-muted text-[12px] font-mono font-bold" aria-label="plus">
              +
            </span>
          )}
          <span
            className={`font-display text-[14px] break-words min-w-0 ${
              emphasize && emphasize !== r.drug ? "text-soft font-semibold" : "text-ink font-bold"
            }`}
          >
            {r.drug}
          </span>
          <span className="font-mono font-bold text-dose text-[14px] tabular-nums break-words">{fmtDose(r.dose)}</span>
          <span className="font-mono uppercase text-[12px] text-soft font-semibold">{r.frequency}</span>
        </span>
      ))}
    </span>
  );
}

export function Lines({ value, muted = ["or", "OR", "+/-", "plus"] }) {
  if (value == null) return <span className="text-muted font-mono">N/A</span>;
  const lines = Array.isArray(value) ? value : [value];
  if (lines.length === 1) return <span className="leading-snug">{keepUnits(lines[0])}</span>;
  return (
    <ul className="space-y-1">
      {lines.map((l, i) => (
        <li key={i} className={muted.includes(l) ? "eyebrow text-gold font-mono text-[11px] my-1" : "leading-snug"}>
          {keepUnits(l)}
        </li>
      ))}
    </ul>
  );
}
