import { ArrowRight, Clock3 } from "lucide-react";
import { openFractures as of, dosingTable } from "../data/pmg.js";
import { Card, CardHeading, PageHeader, PageTag, Regimen, ToneCard, keepUnits } from "./shared.jsx";

// The headline numeral is read out of the PDF's own timing sentence, so the
// big "30 min" can never drift from the verified text. If the sentence ever
// stops matching, the numeral simply disappears and the sentence stands alone.
const TIMING_MATCH = /within (\d+) (min|minutes|hours?)\b/i.exec(of.timing);

export default function OpenFracturesView({ pcn }) {
  const fn = dosingTable.footnotes;
  return (
    <div className="space-y-5" style={{ "--hue": "var(--hue-trauma)" }}>
      <PageHeader eyebrow="Musculoskeletal · PMG p.3–4" title="Open extremity fractures" />

      {/* The one number an ED clinician must remember. */}
      <ToneCard tone="danger" className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          {TIMING_MATCH && (
            <div
              className="shrink-0 flex sm:flex-col items-baseline sm:items-center justify-center gap-x-1.5 rounded-lg border border-danger-line bg-card/70 px-4 py-3 sm:min-w-[6.5rem] text-center shadow-xs"
              aria-hidden="true"
            >
              <span className="text-[36px] sm:text-[42px] font-bold leading-none text-danger-mark tabular-nums tracking-tight">
                {TIMING_MATCH[1]}
              </span>
              <span className="eyebrow text-[12px] font-bold text-danger-mark sm:mt-1">{TIMING_MATCH[2]}</span>
            </div>
          )}
          <div className="min-w-0 text-center sm:text-left">
            <div className="eyebrow text-danger-mark mb-1">Timing · PMG p.3</div>
            {/* The PDF's sentence, verbatim — no paraphrase of the timing or the screen. */}
            <p className="text-[18px] sm:text-[20px] font-bold leading-snug text-balance">{keepUnits(of.timing)}</p>
          </div>
        </div>
      </ToneCard>

      <Card className="p-4">
        <CardHeading title="Antimicrobial by type" page="3–4" />
        <ol className="space-y-3.5">
          {of.antimicrobial.map((a) => {
            const isAllergy = a.id === "pcn-allergy";
            const washed = isAllergy && pcn;
            return (
              <li
                key={a.id}
                className={`rounded-lg border p-3.5 transition-colors ${
                  washed ? "border-warn-line bg-warn-bg text-warn-ink shadow-xs" : "border-rule bg-well"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3 mb-2.5">
                  {/* 12px: the label says which fracture type, or which patient, the regimen
                      applies to. Amber only while the Alternatives toggle highlights the
                      allergy regimen; the PDF's own label identifies it otherwise. */}
                  <div className={`eyebrow text-[12px] font-bold ${washed ? "text-warn-mark" : "text-ink"}`}>{a.applies}</div>
                  <PageTag page={a.page} />
                </div>
                <Regimen regimen={a.regimen} footnotes={fn} tone={washed ? "warn" : "neutral"} />
              </li>
            );
          })}
        </ol>
        <dl className="mt-3.5 space-y-1.5 text-[12px] leading-snug text-muted border-t border-rule-soft pt-3">
          {Object.values(fn).map((f) => (
            <div key={f.mark} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-1">
              <dt className="font-mono font-bold text-warn-mark">{f.mark}</dt>
              <dd>{keepUnits(f.text)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2.5 text-[13px]">
          <a href="#/dosing" className="inline-flex items-center gap-1 py-1 font-semibold text-accent hover:text-accent-hi underline underline-offset-2">
            Adult &amp; pediatric dosing table <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        </p>
      </Card>

      <Card className="p-4">
        <CardHeading title="Duration" page={4} />
        {/* Type above duration on phones: side by side, a long duration left the
            type a sliver of the row at 320–375px. */}
        <dl className="divide-y divide-rule-soft">
          {of.duration.map((d) => (
            <div key={d.applies} className="grid gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3 sm:items-baseline py-2.5">
              <dt className="text-[15px] font-semibold leading-snug text-ink">{d.applies}</dt>
              <dd className="font-mono text-[15px] font-bold leading-snug text-ink tabular-nums sm:text-right sm:max-w-[16rem]">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-chip border border-rule font-bold text-ink">
                  {keepUnits(d.value)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <ToneCard tone="danger" className="mt-3.5">
          <div className="eyebrow text-[12px] font-bold text-danger-mark mb-1.5 flex items-center gap-1.5">
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
      </Card>

      <Card className="p-4">
        <CardHeading title={of.classification.title} page={3} />
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
      </Card>

      <Card className="p-4">
        <CardHeading title="Femoral diaphyseal fractures in multiply injured patients" page={3} />
        <p className="text-[13px] leading-snug text-muted">{keepUnits(of.femoralShaft.heading)}</p>
        <div className="mt-3.5 grid sm:grid-cols-2 gap-3">
          {[of.femoralShaft.stable, of.femoralShaft.unstable].map((g) => (
            <div key={g.label} className="rounded-lg border border-rule bg-well p-3">
              <div className="eyebrow text-[12px] font-bold text-accent mb-1.5">{g.label}</div>
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
      </Card>
    </div>
  );
}
