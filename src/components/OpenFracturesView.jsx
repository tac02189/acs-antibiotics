import { Clock3, ArrowRight } from "lucide-react";
import { openFractures as of, dosingTable } from "../data/pmg.js";
import { Card, Eyebrow, OrderLine, PageTag, Plus } from "./shared.jsx";

export default function OpenFracturesView({ pcn }) {
  return (
    <div className="space-y-6" style={{ "--hue": "var(--hue-trauma)" }}>
      <header className="rise">
        <Eyebrow>Musculoskeletal · PMG p.3–4</Eyebrow>
        <h1 className="font-display font-semibold text-[26px] leading-tight tracking-tight mt-1">
          Open extremity fractures
        </h1>
      </header>

      {/* The one number an ED clinician must remember. */}
      <Card className="rise flex items-center gap-4 p-4 sm:p-5 border-gold/70" style={{ animationDelay: "60ms" }}>
        <div className="shrink-0 grid place-items-center size-20 sm:size-24 rounded-full border-[3px] border-gold text-center">
          <span className="font-display font-bold text-[26px] sm:text-[30px] leading-none tabular-nums">30</span>
          <span className="eyebrow text-deepgold dark:text-gold mt-1">min</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[16px] leading-snug text-balance">
            Antibiotics within 30 min of arrival to the ED
          </p>
          <p className="text-sm text-muted mt-1">
            All patients get an MRSA nasal screen.{" "}
            <span className="text-ink/80">PMG wording: “{of.timing}”</span>
          </p>
        </div>
      </Card>

      <Card className="rise p-4" style={{ animationDelay: "120ms" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold text-[19px] tracking-tight">Antimicrobial by type</h2>
          <PageTag page="3–4" />
        </div>
        <ol className="mt-3 space-y-3">
          {of.antimicrobial.map((a) => {
            const isAllergy = a.id === "pcn-allergy";
            return (
              <li
                key={a.id}
                className={`rounded-lg border p-3 ${
                  isAllergy && pcn ? "border-gold bg-gold/15" : "border-rule/80"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <div className={`eyebrow ${isAllergy ? "text-deepgold dark:text-gold" : "text-hue"}`}>{a.applies}</div>
                  <span className="font-mono text-[11px] text-muted whitespace-nowrap">p.{a.page}</span>
                </div>
                <ol className="space-y-0.5">
                  {a.regimen.map((r, i) => (
                    <li key={i}>
                      {i > 0 && <Plus />}
                      <OrderLine {...r} footnotes={dosingTable.footnotes} />
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ol>
        <dl className="mt-3 text-[12px] text-muted leading-snug space-y-1">
          {Object.values(dosingTable.footnotes).map((f) => (
            <div key={f.mark} className="grid grid-cols-[1.5rem_1fr] gap-x-1">
              <dt className="font-mono text-deepgold dark:text-gold">{f.mark}</dt>
              <dd>{f.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[12px] text-muted leading-snug">
          <a href="#/dosing" className="inline-flex items-center gap-1 underline underline-offset-4 decoration-dotted hover:decoration-gold">
            Adult &amp; pediatric dosing table <ArrowRight className="size-3" aria-hidden="true" />
          </a>
        </p>
      </Card>

      <Card className="rise p-4" style={{ animationDelay: "180ms" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold text-[19px] tracking-tight">Duration</h2>
          <PageTag page={4} />
        </div>
        <dl className="mt-2 divide-y divide-rule/70">
          {of.duration.map((d) => (
            <div key={d.applies} className="grid grid-cols-[1fr_auto] gap-x-3 py-2 items-baseline">
              <dt className="text-[14px]">{d.applies}</dt>
              <dd className="font-mono text-[13px] text-right text-muted max-w-[16rem]">{d.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 rounded-lg bg-ink/[0.04] p-3">
          <div className="eyebrow text-muted mb-1.5 flex items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden="true" /> {of.debridement.heading}
          </div>
          <ul className="space-y-1.5 text-[14px] leading-snug">
            {of.debridement.items.map((it) => (
              <li key={it} className="pl-3 relative before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-hue">
                {it}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="rise p-4" style={{ animationDelay: "240ms" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold text-[19px] tracking-tight">{of.classification.title}</h2>
          <PageTag page={3} />
        </div>
        <dl className="mt-2 divide-y divide-rule/70">
          {of.classification.types.map((t) => (
            <div key={t.type} className="py-2.5 grid grid-cols-[4.5rem_1fr] gap-x-3">
              <dt className="font-display font-semibold text-[15px] text-hue">{t.type}</dt>
              <dd className="text-[14px] leading-snug">
                {t.description}
                {t.subtypes && (
                  <ul className="space-y-2">
                    {t.subtypes.map((s) => (
                      <li key={s.code} className="grid grid-cols-[2.6rem_1fr] gap-x-2">
                        <span className="font-mono text-[12px] font-semibold text-hue pt-0.5">{s.code}</span>
                        <span>{s.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="rise p-4" style={{ animationDelay: "300ms" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold text-[19px] tracking-tight text-balance">
            Femoral diaphyseal fractures in multiply injured patients
          </h2>
          <PageTag page={3} />
        </div>
        <p className="text-[13px] text-muted mt-1">{of.femoralShaft.heading}</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          {[of.femoralShaft.stable, of.femoralShaft.unstable].map((g) => (
            <div key={g.label} className="rounded-lg bg-ink/[0.04] p-3">
              <div className="eyebrow text-muted mb-1.5">{g.label}</div>
              <ul className="space-y-1.5 text-[14px] leading-snug">
                {g.items.map((it) => (
                  <li key={it} className="pl-3 relative before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-hue">
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
