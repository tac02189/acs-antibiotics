import { ChevronDown } from "lucide-react";
import { dosingTable as dt, drugs } from "../data/pmg.js";
import { Card, CardHeading, DosePlate, Group, PageHeader, keepUnits, useCardOpen } from "./shared.jsx";

export default function DosingView() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Open-fracture antimicrobials" title="Adult & pediatric dosing">
        <p className="mt-1.5 text-[14px] leading-snug text-soft">
          The PMG prints this table once, on the open-fracture page. Column headings and footnotes below are the
          PDF's own wording.
        </p>
      </PageHeader>

      {/* Each drug's row collapses, all starting collapsed (v0.7.7). */}
      <Group as="ol">
        {dt.rows.map((row) => (
          <DosingRow key={row.drug} row={row} />
        ))}
      </Group>

      {/* Not collapsible: the marks on the drug names point here. */}
      <Card className="p-4 text-[13px] leading-snug text-soft">
        <CardHeading title="Footnotes" />
        <dl className="space-y-2">
          {[dt.footnotes.renal, dt.footnotes.pharmacy].map((f) => (
            <div key={f.mark} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-1">
              <dt className="font-mono font-bold text-warn-mark">{f.mark}</dt>
              <dd>{keepUnits(f.text)}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}

// One row of the table: the drug's name (with its footnote mark) is the button,
// and the two PDF columns, each on a plate, are its panel.
function DosingRow({ row }) {
  const [open, toggle] = useCardOpen(`dosing:${row.drug}`);
  const fn = row.footnote ? dt.footnotes[row.footnote] : null;
  const meta = drugs[row.drug];
  const panelId = `dose-${row.drug.replace(/[^A-Za-z0-9_-]/g, "-")}`;
  return (
    <li>
      <h2 className="text-[18px] font-bold leading-snug">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full min-h-[56px] items-center gap-3 px-3.5 py-3 text-left hover:bg-well transition-colors focus-visible:outline-offset-[-2px]"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-ink">
              {row.drug}
              {fn && (
                <sup className="ml-0.5 font-mono text-[12px] font-bold text-warn-mark" aria-label={`footnote ${fn.mark}`}>
                  {fn.mark}
                </sup>
              )}
            </span>
            {/* A real space, so the button's name does not run the drug into its brand. */}{" "}
            {meta && (
              <span className="block mt-0.5 text-[12px] font-normal text-muted">
                {meta.brand} · {meta.class}
              </span>
            )}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted transition-transform duration-200 group-hover:text-prose ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </h2>
      <div className="expand" data-open={open} id={panelId}>
        {/* inert keeps the collapsed panel out of the tab order and the a11y tree. */}
        <div inert={open ? undefined : ""} aria-hidden={!open}>
          <div className="grid sm:grid-cols-2 gap-2.5 px-3.5 pt-3 pb-3.5 border-t border-rule bg-well">
            <DosePlate label={dt.adultLabel} lines={row.adult} />
            <DosePlate label={dt.pediatricLabel} lines={row.pediatric} />
          </div>
        </div>
      </div>
    </li>
  );
}
