import { ArrowRight, Clock3 } from "lucide-react";
import { openFractures as of, dosingTable } from "../data/pmg.js";
import { CollapsibleCard, PageHeader, Regimen, ToneCard, keepUnits } from "./shared.jsx";

// The headline numeral is read out of the PDF's own timing sentence, so the
// big "30 min" can never drift from the verified text. If the sentence ever
// stops matching, the numeral simply disappears and the sentence stands alone.
const TIMING_MATCH = /within (\d+) (min|minutes|hours?)\b/i.exec(of.timing);

export default function OpenFracturesView({ pcn }) {
  const fn = dosingTable.footnotes;
  return (
    <div className="space-y-5" style={{ "--hue": "var(--hue-trauma)" }}>
      <PageHeader eyebrow="Musculoskeletal" title="Open extremity fractures" />

      {/* The one number an ED clinician must remember. It stays visible; the cards
          under it collapse, all starting collapsed (v0.7.7). */}
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
            <div className="eyebrow text-danger-mark mb-1">Timing</div>
            {/* The PDF's sentence, verbatim — no paraphrase of the timing or the screen. */}
            <p className="text-[16px] sm:text-[18px] font-bold leading-snug text-balance">{keepUnits(of.timing)}</p>
          </div>
        </div>
      </ToneCard>

      {/* The regimens: the trauma spine down the card's edge, each regimen on
          its plate under the PDF's own label for who it applies to. */}
      <CollapsibleCard id="fractures:antimicrobial" title="Antimicrobial by type" className="border-l-4 border-l-hue">
        <ol className="space-y-3">
          {of.antimicrobial.map((a) => {
            const isAllergy = a.id === "pcn-allergy";
            const washed = isAllergy && pcn;
            return (
              <li
                key={a.id}
                className={`rounded-lg border p-3 transition-colors ${
                  washed ? "border-warn-line bg-warn-bg text-warn-ink" : "border-rule bg-well"
                }`}
              >
                {/* 12px: the label says which fracture type, or which patient, the regimen
                    applies to. Amber only while the PCN Allergy toggle highlights the
                    allergy regimen; the PDF's own label identifies it otherwise. */}
                <div className={`eyebrow text-[12px] mb-2 ${washed ? "text-warn-mark" : "text-prose"}`}>{a.applies}</div>
                <Regimen regimen={a.regimen} footnotes={fn} />
              </li>
            );
          })}
        </ol>
        <dl className="mt-3 space-y-1 text-[12px] leading-snug text-muted">
          {Object.values(fn).map((f) => (
            <div key={f.mark} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-1">
              <dt className="font-mono font-bold text-warn-mark">{f.mark}</dt>
              <dd>{keepUnits(f.text)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[13px]">
          <a href="#/dosing" className="inline-flex items-center gap-1 py-2 font-semibold text-accent hover:text-accent-hi underline underline-offset-2">
            Adult &amp; pediatric dosing table <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        </p>
      </CollapsibleCard>

      <CollapsibleCard id="fractures:duration" title="Duration">
        {/* Type above duration on phones: side by side, a long duration left the
            type a sliver of the row at 320–375px. */}
        <dl className="divide-y divide-rule-soft">
          {of.duration.map((d) => (
            <div key={d.applies} className="grid gap-y-0.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3 sm:items-baseline py-2">
              <dt className="text-[15px] font-medium leading-snug text-ink">{d.applies}</dt>
              <dd className="font-mono text-[15px] font-bold leading-snug text-ink tabular-nums sm:text-right sm:max-w-[16rem]">
                {keepUnits(d.value)}
              </dd>
            </div>
          ))}
        </dl>
        <ToneCard tone="danger" className="mt-3">
          <div className="eyebrow text-[12px] text-danger-mark mb-1.5 flex items-center gap-1.5">
            <Clock3 className="size-4" aria-hidden="true" /> {keepUnits(of.debridement.heading)}
          </div>
          <ul className="space-y-1.5 text-[15px] leading-snug">
            {of.debridement.items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-danger-mark" aria-hidden="true" />
                <span>{keepUnits(it)}</span>
              </li>
            ))}
          </ul>
        </ToneCard>
      </CollapsibleCard>

      <CollapsibleCard id="fractures:classification" title={of.classification.title}>
        <dl className="divide-y divide-rule-soft">
          {of.classification.types.map((t) => (
            <div key={t.type} className="py-3 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3">
              <dt className="text-[16px] font-bold leading-snug text-ink">{t.type}</dt>
              <dd className="text-[15px] leading-snug text-prose">
                {keepUnits(t.description)}
                {t.subtypes && (
                  <ul className="mt-2 space-y-1.5 border-t border-rule-soft pt-2">
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

      <CollapsibleCard id="fractures:femoral-shaft" title="Femoral diaphyseal fractures in multiply injured patients">
        <p className="text-[13px] leading-snug text-muted">{keepUnits(of.femoralShaft.heading)}</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          {[of.femoralShaft.stable, of.femoralShaft.unstable].map((g) => (
            <div key={g.label} className="rounded-lg border border-rule bg-well p-3">
              <div className="eyebrow text-[12px] text-accent mb-1.5">{g.label}</div>
              <ul className="space-y-1.5 text-[15px] leading-snug text-prose">
                {g.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-faint" aria-hidden="true" />
                    <span>{keepUnits(it)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
}
