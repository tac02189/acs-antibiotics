import { Clock3, ArrowRight } from "lucide-react";
import { openFractures as of, dosingTable } from "../data/pmg.js";
import { Card, Eyebrow, OrderLine, PageTag, Plus, keepUnits } from "./shared.jsx";

// The headline numeral is read out of the PDF's own timing sentence, so the
// big "30 min" can never drift from the verified text. If the sentence ever
// stops matching, the numeral simply disappears and the sentence stands alone.
const TIMING_MATCH = /within (\d+) (min|minutes|hours?)\b/i.exec(of.timing);

export default function OpenFracturesView({ pcn }) {
  const fn = dosingTable.footnotes;
  return (
    <div className="space-y-6" style={{ "--hue": "var(--hue-trauma)" }}>
      <header className="rise border-b border-rule/60 pb-3">
        <Eyebrow>Musculoskeletal · PMG p.3–4</Eyebrow>
        <h1 className="font-display font-bold text-[24px] sm:text-[28px] leading-tight tracking-tight uppercase mt-1 text-ink flex items-center gap-2.5">
          <span className="size-3 rounded-sm bg-signal-red shrink-0" aria-hidden="true" />
          Open extremity fractures
        </h1>
      </header>

      {/* The one number an ED clinician must remember. */}
      <Card
        className="rise p-4 sm:p-5 border-signal-red/80 bg-gradient-to-r from-tint-red/40 via-card to-card shadow-glow-red"
        style={{ animationDelay: "40ms" }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          {TIMING_MATCH && (
            <div
              className="shrink-0 flex sm:flex-col items-center justify-center size-24 sm:size-28 rounded-xl bg-lcd border-2 border-signal-red shadow-readout text-center"
              aria-hidden="true"
            >
              <span className="font-mono font-bold text-[36px] sm:text-[42px] leading-none text-signal-red tabular-nums tracking-tighter">
                {TIMING_MATCH[1]}
              </span>
              <span className="eyebrow text-signal-red font-mono text-[12px] sm:mt-1 ml-2 sm:ml-0">{TIMING_MATCH[2]}</span>
            </div>
          )}
          <div className="min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="size-2 rounded-full bg-signal-red" aria-hidden="true" />
              <span className="eyebrow text-signal-red tracking-widest">Timing · PMG p.3</span>
            </div>
            {/* The PDF's sentence, verbatim — no paraphrase of the timing or the screen. */}
            <p className="font-display font-bold text-[18px] sm:text-[20px] text-ink leading-tight uppercase tracking-tight text-balance">
              {keepUnits(of.timing)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "80ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-3">
          <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink">Antimicrobial by type</h2>
          <PageTag page="3–4" />
        </div>
        <ol className="space-y-3">
          {of.antimicrobial.map((a) => {
            const isAllergy = a.id === "pcn-allergy";
            return (
              <li
                key={a.id}
                className={`rounded-lg border p-3 transition-colors ${
                  isAllergy && pcn
                    ? "border-hazard-amber bg-tint-amber/40 hazard-stripes shadow-glow-amber ring-1 ring-hazard-amber"
                    : isAllergy
                      ? "border-hazard-edge-dim/60 bg-well/80"
                      : "border-rule bg-well/60"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <div className={`eyebrow text-[12px] ${isAllergy ? "text-hazard-amber" : "text-accent"}`}>{a.applies}</div>
                  <span className="font-mono text-[11px] text-muted bg-paper px-1.5 py-0.5 rounded border border-rule/60 whitespace-nowrap">
                    p.{a.page}
                  </span>
                </div>
                <ol>
                  {a.regimen.map((r, i) => (
                    <li key={i}>
                      {i > 0 && <Plus />}
                      <OrderLine {...r} footnotes={fn} />
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ol>
        <dl className="mt-3 text-[12px] font-mono text-muted leading-relaxed bg-paper/60 p-2.5 rounded border border-rule/60 space-y-1">
          {Object.values(fn).map((f) => (
            <div key={f.mark} className="grid grid-cols-[1.5rem_1fr] gap-x-1">
              <dt className="text-hazard-amber font-bold">{f.mark}</dt>
              <dd>{keepUnits(f.text)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1.5 text-[12px] font-mono">
          <a href="#/dosing" className="inline-flex items-center gap-1 py-2.5 text-accent font-bold underline underline-offset-4 hover:text-accent-hi">
            Adult &amp; pediatric dosing table <ArrowRight className="size-3" aria-hidden="true" />
          </a>
        </p>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "120ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-3">
          <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink">Duration</h2>
          <PageTag page={4} />
        </div>
        {/* Type above duration on phones: side by side, a long duration left the
            type a sliver of the row at 320–375px. */}
        <dl className="space-y-1.5">
          {of.duration.map((d) => (
            <div
              key={d.applies}
              className="grid gap-y-0.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3 sm:items-baseline py-2 px-2.5 rounded bg-well/50"
            >
              <dt className="text-[15px] text-ink font-medium">{d.applies}</dt>
              <dd className="font-mono text-[15px] font-bold text-dose sm:text-right sm:max-w-[16rem]">{keepUnits(d.value)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-lg bg-well p-3 border border-rule">
          <div className="eyebrow text-[12px] text-signal-red mb-2 flex items-center gap-1.5">
            <Clock3 className="size-4" aria-hidden="true" /> {keepUnits(of.debridement.heading)}
          </div>
          <ul className="space-y-2 text-[15px] leading-snug">
            {of.debridement.items.map((it) => (
              <li
                key={it}
                className="pl-4 relative before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-signal-red text-prose"
              >
                {keepUnits(it)}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "160ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-3">
          <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink">{of.classification.title}</h2>
          <PageTag page={3} />
        </div>
        <dl className="space-y-2">
          {of.classification.types.map((t) => (
            <div key={t.type} className="py-3 px-3 rounded bg-well/60 border border-rule/70 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3">
              <dt className="font-display font-bold text-[16px] text-signal-red uppercase">{t.type}</dt>
              <dd className="text-[15px] leading-snug text-prose">
                {keepUnits(t.description)}
                {t.subtypes && (
                  <ul className="mt-2.5 space-y-2 pt-2 border-t border-rule/60">
                    {t.subtypes.map((s) => (
                      <li key={s.code} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-2">
                        <span className="font-mono text-[13px] font-bold text-accent-hi pt-0.5">{s.code}</span>
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

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "200ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-2">
          <h2 className="font-display font-bold text-[18px] sm:text-[20px] tracking-tight uppercase text-ink text-balance">
            Femoral diaphyseal fractures in multiply injured patients
          </h2>
          <PageTag page={3} />
        </div>
        <p className="text-[13px] font-mono text-muted mt-1">{keepUnits(of.femoralShaft.heading)}</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          {[of.femoralShaft.stable, of.femoralShaft.unstable].map((g) => (
            <div key={g.label} className="rounded-lg bg-well p-3 border border-rule">
              <div className="eyebrow text-[12px] text-accent mb-2 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                {g.label}
              </div>
              <ul className="space-y-2 text-[15px] leading-snug">
                {g.items.map((it) => (
                  <li
                    key={it}
                    className="pl-3.5 relative before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-accent text-prose"
                  >
                    {keepUnits(it)}
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
