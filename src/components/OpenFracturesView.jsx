import { ArrowRight, Clock3 } from "lucide-react";
import { openFractures as of, dosingTable } from "../data/pmg.js";
import { CollapsibleCard, ExpandAll, PageHeader, Regimen, ToneCard, keepUnits } from "./shared.jsx";

// The headline numeral is read out of the PDF's own timing sentence, so the
// big "30 min" can never drift from the verified text. If the sentence ever
// stops matching, the numeral simply disappears and the sentence stands alone.
const TIMING_MATCH = /within (\d+) (min|minutes|hours?)\b/i.exec(of.timing);

const KEYS = ["fractures:antimicrobial", "fractures:duration", "fractures:classification", "fractures:femoral-shaft"];

// The penicillin-allergy regimen is a row of its own, as the PDF prints it (four
// bullets at one indent). v0.7.9 briefly nested it under Type I & II at Thiago’s
// request; after the Codex review rated High that the nesting reads as "Type I & II
// only", he chose to put it back (2026-10-09). The amber highlight finds it by id,
// as it always has; tests/pmg.test.js fails the build if the id is renamed.
const ALLERGY_ID = "pcn-allergy";

// Phones stack each label over its plate; from `sm` the label takes a column,
// as in the Gustilo-Anderson table, which also keeps the plates from stretching
// across the whole card. The plates fill the remaining column so their edges
// line up (sized to their contents, they came out ragged).
const LABEL_GRID = "grid gap-y-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-4";

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

      <ExpandAll keys={KEYS} />

      {/* The regimens: the trauma spine down the card's edge, each regimen on
          its plate under the PDF's own label for who it applies to. The label is
          the row's heading (v0.7.9): it is what the reader looks up by. */}
      <CollapsibleCard id="fractures:antimicrobial" title="Antimicrobial by type" className="border-l-4 border-l-hue">
        <ol className="divide-y divide-rule-soft">
          {of.antimicrobial.map((a) => {
            // Amber only while the PCN Allergy toggle highlights the allergy regimen
            // (label, wash and edge). The wash reaches 8px past the row on each side
            // whether or not it shows, so the toggle moves nothing.
            const washed = a.id === ALLERGY_ID && pcn;
            return (
              <li key={a.id} className="py-3">
                <div
                  className={`${LABEL_GRID} -mx-2 -my-2 rounded-lg px-2 py-2 transition-colors ${
                    washed ? "bg-warn-bg text-warn-ink ring-1 ring-inset ring-warn-line" : ""
                  }`}
                >
                  <h3 className={`text-[16px] font-bold leading-snug ${washed ? "text-warn-mark" : "text-ink"}`}>{a.applies}</h3>
                  <div className="min-w-0">
                    <Regimen regimen={a.regimen} footnotes={fn} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <dl className="border-t border-rule-soft pt-3 space-y-1 text-[12px] leading-snug text-muted">
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
        {/* Drawn as the Gustilo-Anderson table is (v0.7.9, Thiago, 2026-10-09: "make
            duration tab also look like gustilo-anderson"): the fracture type in a
            fixed column on the left, the duration beside it. From `sm` the column
            widens to the antimicrobial card's 10rem, so the longer type fits. */}
        <dl className="divide-y divide-rule-soft">
          {of.duration.map((d) => (
            <div key={d.applies} className="py-3 grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[10rem_minmax(0,1fr)] gap-x-3 sm:gap-x-4">
              <dt className="text-[16px] font-bold leading-snug text-ink">{d.applies}</dt>
              <dd className="text-[15px] leading-snug text-prose">{keepUnits(d.value)}</dd>
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
