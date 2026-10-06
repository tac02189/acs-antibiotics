// Number-and-unit binding (src/lib/text.js). The helpers are display only: they may
// turn ordinary spaces into no-break spaces and change nothing else, so what a
// reader sees is still the PDF's wording. Checked against every string in the data.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as pmg from "../src/data/pmg.js";
import { fmtDose, keepUnits } from "../src/lib/text.js";

const NBSP = String.fromCharCode(0xa0); // no-break space
const NNBSP = String.fromCharCode(0x202f); // narrow no-break space

// Every string in the data, however deeply nested.
function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}
const ALL = strings(Object.values(pmg));
const DOSES = [
  ...pmg.indications.flatMap((i) => (i.regimen || []).map((r) => r.dose)),
  ...pmg.openFractures.antimicrobial.flatMap((a) => a.regimen.map((r) => r.dose)),
];

// True when `after` is `before` with some ordinary spaces replaced by `space`.
const onlySpaces = (before, after, space) =>
  before.length === after.length && [...before].every((c, i) => c === after[i] || (c === " " && after[i] === space));

test("keepUnits changes nothing but spaces, in every string in the data", () => {
  assert.ok(ALL.length > 500, `only ${ALL.length} strings found; the walk is broken`);
  for (const s of ALL) assert.ok(onlySpaces(s, keepUnits(s), NBSP), `changed more than spaces: ${s}`);
  for (const v of [null, undefined, 3]) assert.equal(keepUnits(v), v);
});

test("keepUnits joins numbers to their units and signs to their numbers", () => {
  const cases = [
    ["4 days OR 8 days", `4${NBSP}days OR 8${NBSP}days`],
    ["< 37.5 kg: 13.3 mg/kg/dose IV Q8h", `<${NBSP}37.5${NBSP}kg: 13.3${NBSP}mg/kg/dose IV Q8h`],
    ["q12 hours", `q12${NBSP}hours`],
    ["> 10 units blood", `>${NBSP}10${NBSP}units blood`],
    ["≥ 10⁴ CFU/mL → narrow spectrum × 7 days", `≥${NBSP}10⁴${NBSP}CFU/mL → narrow spectrum ×${NBSP}7${NBSP}days`],
    ["Temp >38.0 °C or 100.4 °F", `Temp >38.0${NBSP}°C or 100.4${NBSP}°F`],
    ["within 30 min of arrival", `within 30${NBSP}min of arrival`],
    ["Central line >72 h with", `Central line >72${NBSP}h with`],
    ["Adult Dosing (age ≥15 years)", `Adult Dosing (age ≥15${NBSP}years)`],
    ["> 10 WBC", `>${NBSP}10${NBSP}WBC`],
    ["800 mg/160 mg", `800${NBSP}mg/160${NBSP}mg`],
  ];
  for (const [input, want] of cases) assert.equal(keepUnits(input), want, input);
  // A word that merely starts like a unit is not one.
  for (const s of ["2 grams", "2 hospitals", "Type I & II", "PMG p.3"]) assert.equal(keepUnits(s), s, s);
});

test("after keepUnits no number in the data can end a line before its unit", () => {
  // Written independently of the implementation's pattern.
  const breakable = /[0-9⁰¹²³⁴⁵⁶⁷⁸⁹] (?:g|mg|mcg|kg|mL|hours?|days?|min|h|units?|years?|WBC|CFU|°[CF])\b/;
  for (const s of ALL) assert.doesNotMatch(keepUnits(s), breakable, s);
});

test("fmtDose joins every regimen dose's number and unit with a narrow no-break space", () => {
  assert.ok(DOSES.length > 40, `only ${DOSES.length} doses found`);
  for (const d of DOSES) {
    const shown = fmtDose(d);
    assert.ok(onlySpaces(d, shown, NNBSP), `changed more than spaces: ${d}`);
    assert.doesNotMatch(shown, /[0-9] (?:g|mg)\b/, d);
  }
  assert.equal(fmtDose("2 g"), `2${NNBSP}g`);
  assert.equal(fmtDose("15 mg/kg"), `15${NNBSP}mg/kg`);
});
