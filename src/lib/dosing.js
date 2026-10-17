// The dose the app shows beside a drug on an indication row.
//
// The October 2026 PMG's indication tables name drugs only; the doses are in two
// dosing tables of their own, one for surgical prophylaxis (page 3) and one for
// empiric therapy (page 4). An indication row's drugs are looked up in the table
// that matches its section's `kind` (Thiago, 2026-10-16: "Dose from matching
// table"). A drug that table does not list gets no dose: there is no fallback to
// the other table. Both tables are checked against the PDF by the verifier; this
// lookup is tested in tests/pmg.test.js.
import { empiricDosing, prophylaxisDosing, sections } from "../data/pmg.js";

export const TABLES = { prophylaxis: prophylaxisDosing, empiric: empiricDosing };

export const kindOf = (ind) => sections.find((s) => s.id === ind.section)?.kind ?? null;

// The matching table's row for `drug`, or null.
export function dosingRow(drug, kind) {
  return TABLES[kind]?.rows.find((r) => r.drug === drug) ?? null;
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
// frequency. Null when the matching table does not list the drug.
export function doseLine(drug, kind) {
  const row = dosingRow(drug, kind);
  if (!row) return null;
  if (kind === "prophylaxis") return `${row.dose.join(" ")} · ${redoseLabel(row)}`;
  return `${row.dose} ${row.route} ${row.frequency}`;
}
