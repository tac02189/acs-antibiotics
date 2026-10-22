import { openFractures as of } from "../data/pmg.js";
import { Card, CardHeading, CollapsibleCard, ExpandAll, PageHeader, RegimenInline, ToneCard, keepUnits } from "./shared.jsx";

// The headline numeral is read out of the PDF's own timing sentence, so the
// big "30 min" can never drift from the verified text. If the sentence ever
// stops matching, the numeral simply disappears and the sentence stands alone.
const TIMING_MATCH = /within (\d+) (min|minutes|hours?)\b/i.exec(of.timing);

const KEYS = ["fractures:duration", "fractures:classification"];

// One printed bullet: its label, then its regimen as pills (v0.7.10, Thiago,
// 2026-10-12: "add the pills"). Phones stack the label over the pills; from `sm`
// the label takes a 10rem column, as in the Duration and Gustilo-Anderson
// tables. An "If penicillin allergy" sub-bullet is indented under the bullet it
// is printed under, as the October 2026 PDF nests it, and takes the amber
// label, wash and inset edge while the Allergy toggle is on, over the same 8px
// overhang either way, so nothing moves.
function Bullet({ entry, sub = false, washed = false }) {
  return (
    <div
      className={`grid gap-y-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-4 sm:items-baseline -mx-2 rounded-md px-2 py-1 transition-colors ${
        sub ? "ml-2 sm:ml-4 border-l-2 border-rule-soft" : ""
      } ${washed ? "bg-warn-bg text-warn-ink ring-1 ring-inset ring-warn-line" : ""}`}
    >
      <dt className={`text-[14px] font-bold leading-snug ${washed ? "text-warn-mark" : sub ? "text-soft" : "text-ink"}`}>{entry.applies}</dt>
      <dd className="min-w-0">
        <RegimenInline regimen={entry.regimen} />
      </dd>
    </div>
  );
}

function Bullets({ entries, pcn }) {
  return (
    <dl className="space-y-2">
      {entries.map((e) => (
        <div key={e.id} className="space-y-1.5">
          <Bullet entry={e} />
          {e.allergy && <Bullet entry={e.allergy} sub washed={pcn} />}
        </div>
      ))}
    </dl>
  );
}

export default function OpenFracturesView({ pcn }) {
  return (
    <div className="space-y-5" style={{ "--hue": "var(--hue-trauma)" }}>
      <PageHeader eyebrow="Musculoskeletal" title="Open extremity fractures" />

      {/* The one number an ED clinician must remember. It stays visible, as do the
          regimens under it; the two cards after them collapse, both starting
          collapsed (v0.7.7). */}
      <ToneCard tone="danger" className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {TIMING_MATCH && (
            <div
              className="shrink-0 flex sm:flex-col items-baseline sm:items-center justify-center gap-x-1.5 rounded-lg border border-danger-line bg-card/70 px-3 py-2 sm:min-w-[5.5rem] text-center"
              aria-hidden="true"
            >
              <span className="text-[28px] sm:text-[36px] font-bold leading-none text-danger-mark tabular-nums tracking-tight">
                {TIMING_MATCH[1]}
              </span>
              <span className="eyebrow text-[12px] text-danger-mark sm:mt-1">{TIMING_MATCH[2]}</span>
            </div>
          )}
          <div className="min-w-0 text-center sm:text-left">
            <div className="eyebrow text-danger-mark mb-1">Antibiotic timing</div>
            {/* The PDF's sentence, verbatim — no paraphrase of the timing or the screen. */}
            <p className="text-[16px] sm:text-[18px] font-bold leading-snug text-balance">{keepUnits(of.timing)}</p>
          </div>
        </div>
      </ToneCard>

      {/* The regimens, always open (v0.7.12, Thiago, 2026-10-14: "it doesn't need to
          expand"): the trauma spine down the card's edge, each bullet as pills under
          the PDF's own label, then the contamination bullet under its heading and the
          PDF's statement of which types it applies to. The PDF prints no route in
          these bullets; the IV on every pill is Thiago's (2026-10-16: "They are all
          IV"), listed in `transcription.corrections`. */}
      <Card className="border-l-4 border-l-hue p-4">
        <CardHeading title="Antibiotic selection" />
        <Bullets entries={of.selection} pcn={pcn} />

        <div className="mt-4 border-t border-rule-soft pt-3">
          <h3 className="text-[16px] font-bold leading-snug text-ink">{of.contamination.heading}</h3>
          <p className="mt-0.5 mb-2.5 text-[13px] leading-snug text-muted">{of.contamination.scope}</p>
          <Bullets entries={of.contamination.items} pcn={pcn} />
        </div>
      </Card>

      <ExpandAll keys={KEYS} />

      <CollapsibleCard id="fractures:duration" title="Antibiotic duration">
        {/* Drawn as the Gustilo-Anderson table is (v0.7.9, Thiago, 2026-10-09: "make
            duration tab also look like gustilo-anderson"): the fracture type in a
            fixed column on the left, the duration beside it. */}
        <dl className="divide-y divide-rule-soft">
          {of.duration.map((d) => (
            <div key={d.applies} className="py-3 grid grid-cols-[6rem_minmax(0,1fr)] sm:grid-cols-[10rem_minmax(0,1fr)] gap-x-3 sm:gap-x-4">
              <dt className="text-[16px] font-bold leading-snug text-ink">{d.applies}</dt>
              <dd className="text-[15px] leading-snug text-prose">{keepUnits(d.value)}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleCard>

      <CollapsibleCard id="fractures:classification" title={of.classification.heading}>
        {/* The PDF's two column headers, over their columns (both printed since the
            2026-10-16 Codex review noted the second was missing). */}
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 pb-2 border-b border-rule-soft text-[12px] font-semibold leading-snug text-muted" aria-hidden="true">
          <span>{of.classification.columns[0]}</span>
          <span>{of.classification.columns[1]}</span>
        </div>
        <dl className="divide-y divide-rule-soft">
          {of.classification.types.map((t) => (
            <div key={t.type} className="py-3 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3">
              <dt className="text-[16px] font-bold leading-snug text-ink">{t.type}</dt>
              <dd className="text-[15px] leading-snug text-prose">
                {keepUnits(t.description)}
                {t.subtypes && (
                  <ul className="space-y-1.5">
                    {t.subtypes.map((s) => (
                      <li key={s.code} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-2">
                        <span className="font-mono text-[13px] font-bold text-accent pt-0.5">{s.code}</span>
                        <span className="text-soft">{keepUnits(s.description)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CollapsibleCard>
    </div>
  );
}
