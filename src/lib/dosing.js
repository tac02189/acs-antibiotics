// The dose the app shows beside a drug on an indication row.
//
// The October 2026 PMG's indication tables name drugs only; the doses are in two
// dosing tables of their own, one for surgical prophylaxis (page 3) and one for
// empiric therapy (page 4). An indication row's drugs are looked up in the table
// that matches its section's `kind` (Thiago, 2026-10-16: "Dose from matching
// table"). A drug the prophylaxis table does not list takes its line from the
// empiric table instead (Thiago, 2026-10-19: "Use the empiric table dosing for
// places where dosing is missing"), and every place that shows such a line says
// it is the empiric table's: that table gives a treatment frequency, not an OR
// redosing interval. There is no fallback the other way. Both tables are checked
// against the PDF by the verifier; this lookup is tested in tests/pmg.test.js.
import { empiricDosing, prophylaxisDosing, sections } from "../data/pmg.js";

export const TABLES = { prophylaxis: prophylaxisDosing, empiric: empiricDosing };

export const kindOf = (ind) => sections.find((s) => s.id === ind.section)?.kind ?? null;

// `tables`' row for `drug` in the table named `kind`, or null. Own keys only: a
// `kind` of "toString" found Object.prototype's (Codex review, 2026-10-19).
const rowIn = (tables, drug, kind) =>
  (Object.hasOwn(tables, kind) && tables[kind].rows.find((r) => r.drug === drug)) || null;

// The matching table's row for `drug`, or null.
export function dosingRow(drug, kind) {
  return rowIn(TABLES, drug, kind);
}

// Where a drug's line on a row of `kind` comes from, in `tables`: { kind, row,
// fallback }. `kind` is the table `row` is from: the matching one, or the
// empiric one, with `fallback` true, for a drug the prophylaxis table does not
// list. Null when neither applies. Exported with `tables` so a test can give it
// a drug only the prophylaxis table lists, which the PMG has none of.
export function doseSourceIn(tables, drug, kind) {
  const row = rowIn(tables, drug, kind);
  if (row) return { kind, row, fallback: false };
  const empiric = kind === "prophylaxis" ? rowIn(tables, drug, "empiric") : null;
  return empiric ? { kind: "empiric", row: empiric, fallback: true } : null;
}

export const doseSource = (drug, kind) => doseSourceIn(TABLES, drug, kind);

// What a pill says after a fallback line. The plate words its own note.
export const FALLBACK_NOTE = "empiric table";

// The drugs a row names (preferred, then the alternative column) whose line is a
// fallback, each once, in that order.
export function fallbackDrugs(ind) {
  const kind = kindOf(ind);
  const named = [...(ind.preferred || []), ...(ind.alternative || []).flatMap((l) => l.options.flat())];
  return [...new Set(named)].filter((d) => doseSource(d, kind)?.fallback);
}

// The OR redosing interval as the pill shows it: "OR redose 3 h", or the cell's
// own words ("OR redose not recommended"). The column is "Redosing Interval for
// OR Only (hours)".
// Trimmed first: "8 " passed the verifier, which ignores outer spaces, and lost
// its "h" here (Codex review, 2026-10-16).
export function redoseLabel(row) {
  const v = String(row.redose).trim();
  return /^\d+(?:\.\d+)?$/.test(v) ? `OR redose ${v} h` : `OR redose ${v.toLowerCase()}`;
}

// A pill's dose line, as plain text (for search and tests): the prophylaxis
// table's dose and OR redosing interval, or the empiric table's dose, route and
// frequency, followed by "· empiric table" when it is a fallback. Null when
// neither table lists the drug.
export function doseLine(drug, kind) {
  const src = doseSource(drug, kind);
  if (!src) return null;
  const { row } = src;
  if (src.kind === "prophylaxis") return `${row.dose.join(" ")} · ${redoseLabel(row)}`;
  return `${row.dose} ${row.route} ${row.frequency}${src.fallback ? ` · ${FALLBACK_NOTE}` : ""}`;
}
