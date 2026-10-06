import { Clock3, ArrowRight } from "lucide-react";
import { openFractures as of, dosingTable } from "../data/pmg.js";
import { Card, Eyebrow, OrderLine, PageTag, Plus } from "./shared.jsx";

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
        <h1 className="font-display font-bold text-[26px] sm:text-[28px] leading-tight tracking-tight uppercase mt-1 text-white flex items-center gap-2.5">
          <span className="size-3 rounded-sm bg-signal-red shrink-0" aria-hidden="true" />
          Open extremity fractures
        </h1>
      </header>

      {/* The one number an ED clinician must remember. */}
      <Card
        className="rise p-4 sm:p-5 border-signal-red/80 bg-gradient-to-r from-red-950/40 via-card to-card shadow-glow-red"
        style={{ animationDelay: "40ms" }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          {TIMING_MATCH && (
            <div
              className="shrink-0 flex sm:flex-col items-center justify-center size-24 sm:size-28 rounded-xl bg-black border-2 border-signal-red shadow-[0_0_20px_rgba(255,69,58,0.35)] text-center"
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
              <span className="eyebrow text-signal-red tracking-widest text-[11px]">Timing · PMG p.3</span>
            </div>
            {/* The PDF's sentence, verbatim — no paraphrase of the timing or the screen. */}
            <p className="font-display font-bold text-[18px] sm:text-[20px] text-white leading-tight uppercase tracking-tight text-balance">
              {of.timing}
            </p>
          </div>
        </div>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "80ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-3">
          <h2 className="font-display font-bold text-[19px] sm:text-[20px] tracking-tight uppercase text-white">Antimicrobial by type</h2>
          <PageTag page="3–4" />
        </div>
        <ol className="space-y-3">
          {of.antimicrobial.map((a) => {
            const isAllergy = a.id === "pcn-allergy";
            return (
              <li
                key={a.id}
                className={`rounded-lg border p-3.5 transition-colors ${
                  isAllergy && pcn
                    ? "border-hazard-amber bg-yellow-950/40 hazard-stripes shadow-glow-amber ring-1 ring-yellow-400"
                    : isAllergy
                      ? "border-yellow-600/60 bg-well/80"
                      : "border-rule bg-well/60"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3 mb-2.5">
                  <div className={`eyebrow text-[12px] ${isAllergy ? "text-hazard-amber" : "text-cyan-400"}`}>{a.applies}</div>
                  <span className="font-mono text-[10px] text-muted bg-paper px-1.5 py-0.5 rounded border border-rule/60 whitespace-nowrap">
                    p.{a.page}
                  </span>
                </div>
                <ol className="space-y-1.5">
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
        <dl className="mt-3.5 text-[12px] font-mono text-muted leading-relaxed bg-paper/60 p-2.5 rounded border border-rule/60 space-y-1">
          {Object.values(fn).map((f) => (
            <div key={f.mark} className="grid grid-cols-[1.5rem_1fr] gap-x-1">
              <dt className="text-hazard-amber font-bold">{f.mark}</dt>
              <dd>{f.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1.5 text-[12px] font-mono">
          <a href="#/dosing" className="inline-flex items-center gap-1 py-2.5 text-cyan-400 font-bold underline underline-offset-4 hover:text-cyan-300">
            Adult &amp; pediatric dosing table <ArrowRight className="size-3" aria-hidden="true" />
          </a>
        </p>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "120ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-3">
          <h2 className="font-display font-bold text-[19px] sm:text-[20px] tracking-tight uppercase text-white">Duration</h2>
          <PageTag page={4} />
        </div>
        <dl className="space-y-1.5">
          {of.duration.map((d) => (
            <div key={d.applies} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2 px-2.5 rounded bg-well/50 items-baseline">
              <dt className="text-[14px] text-white font-medium">{d.applies}</dt>
              <dd className="font-mono text-[13px] font-bold text-right text-emerald-400 max-w-[16rem]">{d.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-lg bg-well p-3.5 border border-rule">
          <div className="eyebrow text-signal-red mb-2 flex items-center gap-1.5 text-[11px]">
            <Clock3 className="size-4" aria-hidden="true" /> {of.debridement.heading}
          </div>
          <ul className="space-y-2 text-[14px] leading-snug">
            {of.debridement.items.map((it) => (
              <li
                key={it}
                className="pl-4 relative before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-signal-red text-slate-200"
              >
                {it}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="rise p-4 sm:p-5" style={{ animationDelay: "160ms" }}>
        <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-2 mb-3">
          <h2 className="font-display font-bold text-[19px] sm:text-[20px] tracking-tight uppercase text-white">{of.classification.title}</h2>
          <PageTag page={3} />
        </div>
        <dl className="space-y-2">
          {of.classification.types.map((t) => (
            <div key={t.type} className="py-3 px-3 rounded bg-well/60 border border-rule/70 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3">
              <dt className="font-display font-bold text-[16px] text-signal-red uppercase">{t.type}</dt>
              <dd className="text-[14px] leading-snug text-slate-200">
                {t.description}
                {t.subtypes && (
                  <ul className="mt-2.5 space-y-2 pt-2 border-t border-rule/60">
                    {t.subtypes.map((s) => (
                      <li key={s.code} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-2">
                        <span className="font-mono text-[13px] font-bold text-cyan-300 pt-0.5">{s.code}</span>
                        <span className="text-slate-300">{s.description}</span>
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
          <h2 className="font-display font-bold text-[19px] sm:text-[20px] tracking-tight uppercase text-white text-balance">
            Femoral diaphyseal fractures in multiply injured patients
          </h2>
          <PageTag page={3} />
        </div>
        <p className="text-[13px] font-mono text-muted mt-1">{of.femoralShaft.heading}</p>
        <div className="mt-3.5 grid sm:grid-cols-2 gap-3">
          {[of.femoralShaft.stable, of.femoralShaft.unstable].map((g) => (
            <div key={g.label} className="rounded-lg bg-well p-3.5 border border-rule">
              <div className="eyebrow text-cyan-400 mb-2 text-[11px] flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                {g.label}
              </div>
              <ul className="space-y-2 text-[14px] leading-snug">
                {g.items.map((it) => (
                  <li
                    key={it}
                    className="pl-3.5 relative before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-cyan-400 text-slate-200"
                  >
                    {it}
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
