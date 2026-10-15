// Planted-error controls for scripts/verify-pmg.mjs.
//
// A verifier that cannot be shown to fail is not evidence. Each case below
// corrupts a copy of the data in one specific, plausible way — the kind of slip
// a transcription actually produces, or one of the escapes the 2026-10-06 peer
// review demonstrated — and asserts the verifier rejects it. The first case
// asserts the real data passes. Every mutation must actually change the data
// (a control whose edit is a no-op is a control that tests nothing).
// Re-run after any edit to the verifier.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import * as pmg from "../src/data/pmg.js";
import { ROOT, readPdf, verify } from "../scripts/verify-pmg.mjs";

let pdf;
before(async () => {
  pdf = await readPdf(path.join(ROOT, "public", pmg.source.file));
});

const clone = () => structuredClone({ ...pmg });
const find = (data, id) => data.indications.find((i) => i.id === id);
const abx = (data, id) => data.openFractures.antimicrobial.find((a) => a.id === id);

async function expectFail(name, mutate, needle) {
  const data = clone();
  const before = JSON.stringify(data);
  mutate(data);
  assert.notEqual(JSON.stringify(data), before, `${name}: the mutation changed nothing — the control is a no-op`);
  const result = await verify(data, { pdf });
  assert.equal(result.ok, false, `${name}: verifier passed corrupted data`);
  if (needle) {
    assert.ok(
      result.errors.some((e) => e.includes(needle)),
      `${name}: expected an error mentioning "${needle}", got:\n${result.errors.join("\n")}`
    );
  }
}

test("the real data passes", async () => {
  const result = await verify(clone(), { pdf });
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
  assert.equal(result.summary.matched, 34);
  assert.equal(result.summary.rows, 34);
});

// ── Indication tables (pages 1–2) ──
test("swapped doses within a combination", () =>
  expectFail("dose swap", (d) => {
    const r = find(d, "abdominal-trauma").regimen;
    [r[0].dose, r[1].dose] = [r[1].dose, r[0].dose];
  }, "abdominal-trauma / dose"));
test("a changed frequency", () =>
  expectFail("frequency", (d) => (find(d, "appendicitis").regimen[0].frequency = "Q12H"), "appendicitis / frequency"));
test("a deleted indication", () =>
  expectFail("deleted row", (d) => (d.indications = d.indications.filter((i) => i.id !== "sinusitis")), "Sinusitis"));
test("a renamed indication", () => expectFail("renamed row", (d) => (find(d, "craniotomy").name = "Craniectomy"), "Craniotomy"));
test("a qualifier appended to a row name", () =>
  expectFail("name suffix", (d) => (find(d, "abdominal-trauma").name += " — pediatric patients only"), "matches 0 data entries"));
test("a changed duration", () =>
  expectFail(
    "duration",
    (d) => (find(d, "cholecystitis").duration[0] = "Post Cholecystectomy with local inflammation: 48 hours"),
    "cholecystitis / duration"
  ));
test("a changed alternative", () =>
  expectFail(
    "alternative",
    (d) => (find(d, "open-skull-fracture").alternative = "Contamination: ceftriaxone and Metronidazole x 48 hours"),
    "open-skull-fracture / alternative"
  ));
test("drugs swapped between two single-agent rows", () =>
  expectFail("drug swap", (d) => {
    const a = find(d, "craniotomy").regimen[0];
    const b = find(d, "open-skull-fracture").regimen[0];
    [a.drug, b.drug] = [b.drug, a.drug];
  }, "/ drug"));
test("a dropped combination partner", () =>
  expectFail("dropped partner", (d) => (find(d, "gu-trauma").regimen = find(d, "gu-trauma").regimen.slice(0, 1)), "gu-trauma / drug"));
test("an invented redose rule", () =>
  expectFail("redose", (d) => (find(d, "craniotomy").redose = "Every 4 hours"), "craniotomy / redose"));
test("an N/A row given a regimen", () =>
  expectFail("N/A row", (d) => {
    const ind = find(d, "chest-tubes");
    ind.regimen = [{ drug: "Cefazolin", dose: "2 g", frequency: "Q8H" }];
    ind.duration = ["24 hours"];
  }, "chest-tubes / drug"));
test("an alternative on an N/A row", () =>
  expectFail("N/A alternative", (d) => (find(d, "chest-tubes").alternative = "Levofloxacin"), "N/A row must be N/A"));
// An N/A row renders without its note today, so this guards the data, not the
// screen (Gemini whole-codebase review, 2026-10-14).
test("a regimen note on an N/A row", () =>
  expectFail("N/A note", (d) => (find(d, "chest-tubes").regimenNote = "Administer prophylactic cefazolin"), "N/A row must be N/A"));
test("an empty frequency", () =>
  expectFail("empty frequency", (d) => (find(d, "colectomy").regimen[1].frequency = ""), "frequency is empty"));
test("a route or note on a table regimen", () =>
  expectFail("table route", (d) => (find(d, "craniotomy").regimen[0].route = "IM"), "print no route"));
test("a wrong page", () => expectFail("page", (d) => (find(d, "craniotomy").page = 2), "craniotomy: data says page 2"));
test("an indication moved to another section", () =>
  expectFail("section move", (d) => (find(d, "appendicitis").section = "elective"), 'data section "elective"'));
test("a duplicated indication", () =>
  expectFail("duplicate", (d) => d.indications.push({ ...find(d, "sinusitis"), id: "sinusitis-2" }), "matches 2 data entries"));
test("an invented indication on page 3", () =>
  expectFail(
    "invented row",
    (d) =>
      d.indications.push({
        id: "invented",
        section: "trauma",
        page: 3,
        name: "Invented indication",
        short: "Invented indication",
        regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "Q8H" }],
        duration: ["24 hours"],
        redose: null,
        alternative: null,
      }),
    "page must be 1 or 2"
  ));
test("an empty dataset", () => expectFail("empty", (d) => (d.indications = []), "data has 0 indications"));
// The escapes the 2026-10-14 Codex whole-codebase review found in the tables:
// the truncated-label row matched by id whatever its name, and a frequency cell
// compared after removing repeats.
test("the truncated-label row given another indication's name", () =>
  expectFail("relabelled UTI", (d) => {
    const ind = find(d, "complicated-uti");
    ind.name = "Neonatal meningitis";
    ind.short = "Neonatal meningitis";
  }, "matches 0 data entries"));
test("both frequencies of a pair given to each drug", () =>
  expectFail("combined frequency", (d) => {
    for (const r of find(d, "abdominal-trauma").regimen) r.frequency = "Q8H Q12H";
  }, "is not one frequency"));

// ── Open fractures (pages 3–4) ──
test("a changed open-fracture dose in the text", () =>
  expectFail("fracture text dose", (d) => {
    const t3 = abx(d, "type-3");
    t3.text = t3.text.replace("Cefepime* 2g", "Cefepime* 1g");
  }, 'antimicrobial "type-3"'));
test("a displayed open-fracture dose that borrows another drug's", () =>
  expectFail("fracture display dose", (d) => (abx(d, "type-3").regimen[0].dose = "15 mg/kg"), "does not re-state the text"));
test("a displayed open-fracture frequency that borrows another drug's", () =>
  expectFail("fracture display frequency", (d) => (abx(d, "type-3").regimen[0].frequency = "q12 hours"), "does not re-state the text"));
test("a changed route", () => expectFail("route", (d) => (abx(d, "pcn-allergy").regimen[0].route = "IM"), "does not re-state the text"));
// The cefepime route is a listed correction (IV, v0.7.10); TYPO_MAP must not let a
// wrong one through. A dropped "IV" is pinned by tests/pmg.test.js instead.
test("a wrong open-fracture cefepime route, in the text and the display", () =>
  expectFail("cefepime route", (d) => {
    const a = abx(d, "type-3");
    a.text = a.text.replace("Cefepime* 2g IV", "Cefepime* 2g IM");
    a.regimen[0].route = "IM";
  }, "antimicrobial bullets"));
test("a wrong open-fracture cefepime route in the display only", () =>
  expectFail("cefepime display route", (d) => (abx(d, "contamination").regimen[0].route = "IM"), "does not re-state the text"));
test("a dropped open-fracture partner", () =>
  expectFail("dropped fracture partner", (d) => abx(d, "contamination").regimen.pop(), "does not re-state the text"));
test("an empty open-fracture regimen", () => expectFail("empty regimen", (d) => (abx(d, "type-3").regimen = []), "non-empty regimen"));
test("footnote marks removed from the display regimen", () =>
  expectFail("marks", (d) => {
    for (const r of abx(d, "type-3").regimen) delete r.footnote;
  }, "does not re-state the text"));
test("a swapped applicability label", () =>
  expectFail("applies swap", (d) => (abx(d, "type-3").applies = "Type I & II"), "antimicrobial bullets"));
test("a duration shortened to a substring", () =>
  expectFail("4 hours", (d) => (d.openFractures.duration[0].value = "4 hours"), "duration bullets"));
test("a duration borrowed from the other type", () =>
  expectFail("72 hours", (d) => (d.openFractures.duration[0].value = "72 hours"), "duration bullets"));
test("duration labels swapped", () =>
  expectFail("duration label", (d) => (d.openFractures.duration[0].applies = "Type III"), "duration bullets"));
test("a blank timing rule", () => expectFail("timing", (d) => (d.openFractures.timing = ""), "timing rule"));
// The escapes the 2026-10-14 Gemini whole-codebase review found: each passed a
// word-boundary phrase match, because only one end of the value was anchored.
test("a timing rule cut short (the MRSA screen dropped)", () =>
  expectFail("timing cut", (d) => (d.openFractures.timing = "Administer within 30 min of arrival to the ED"), "timing rule"));
test("a timing rule missing its first word", () =>
  expectFail("timing start", (d) => (d.openFractures.timing = d.openFractures.timing.replace("Administer ", "")), "timing rule"));
test("a debridement heading missing its first word", () =>
  expectFail("debridement start", (d) => (d.openFractures.debridement.heading = "debridement within 24 hours"), "debridement heading"));
test("a femoral-shaft heading missing its first words", () =>
  expectFail(
    "femoral start",
    (d) => (d.openFractures.femoralShaft.heading = d.openFractures.femoralShaft.heading.replace("Timing and ", "")),
    "femoral-shaft heading"
  ));
test("a whole open-fracture regimen held in the dose field", () =>
  expectFail("regimen in dose", (d) => (abx(d, "type-1-2").regimen = [{ drug: "Cefazolin", dose: "2 g IV q8 hours" }]), "shaped like a dose"));
test("open-fracture regimen words shifted one field along", () =>
  expectFail(
    "fields shifted",
    (d) => (abx(d, "type-1-2").regimen = [{ drug: "Cefazolin", dose: "2 g IV", route: "q8", frequency: "hours" }]),
    "shaped like a"
  ));
// From the v0.7.11 pre-commit Codex review: a note could hold a whole partner
// whose own entry was deleted, with the prose unchanged.
test("a combination partner moved into the other drug's note", () =>
  expectFail("partner in note", (d) => {
    const a = abx(d, "type-3");
    a.regimen = [{ ...a.regimen[0], note: "Vancomycin** 15 mg/kg IV q12 hours Pharmacy To Dose Consult" }];
  }, "is not a note"));
test("an open-fracture regimen moved to the other page", () =>
  expectFail("fracture page", (d) => (abx(d, "type-3").page = 4), "not printed on page 4"));
test("debridement rules deleted", () =>
  expectFail("debridement", (d) => (d.openFractures.debridement.items = []), "debridement rules"));
test("a changed debridement heading", () =>
  expectFail("debridement heading", (d) => (d.openFractures.debridement.heading = "Operative debridement within 48 hours"), "debridement"));
test("stable and unstable femoral labels swapped", () =>
  expectFail("femoral labels", (d) => {
    const f = d.openFractures.femoralShaft;
    [f.stable.label, f.unstable.label] = [f.unstable.label, f.stable.label];
  }, "femoral-shaft"));
test("a blank classification description", () =>
  expectFail("Type I description", (d) => (d.openFractures.classification.types[0].description = ""), "classification Type I"));
test("subtypes added under a type that prints a description", () =>
  expectFail("Type I subtypes", (d) => {
    const types = d.openFractures.classification.types;
    types[0].subtypes = [structuredClone(types[2].subtypes[2])];
  }, "classification Type I"));
test("a classification type duplicated over another", () =>
  expectFail("Type II as Type I", (d) => {
    const types = d.openFractures.classification.types;
    types[1] = structuredClone(types[0]);
  }, "lists this type twice"));
test("a changed classification subtype", () =>
  expectFail(
    "IIIC",
    (d) => (d.openFractures.classification.types[2].subtypes[2].description = "Open fracture associated with arterial injury."),
    "classification Type III"
  ));

// ── Dosing table (page 4) ──
test("a reversed threshold operator", () =>
  expectFail("operator", (d) => (d.dosingTable.rows[0].pediatric[0] = "> 60 kg: 33 mg/kg/dose IV Q8h"), "Cefazolin / pediatric"));
test("pediatric cells copied from another drug's row", () =>
  expectFail("cross-row", (d) => (d.dosingTable.rows[1].pediatric = [...d.dosingTable.rows[0].pediatric]), "Cefepime / pediatric"));
test("a dosing drug renamed to a duplicate", () =>
  expectFail("duplicate dosing drug", (d) => (d.dosingTable.rows[1].drug = "Cefazolin"), "twice"));
test("a leading digit dropped from a dose", () =>
  expectFail("5 mg/kg", (d) => (d.dosingTable.rows[3].adult[0] = "5 mg/kg IV Q12h (max 1.5g/dose)"), "Vancomycin / adult"));
test("a dropped maximum dose", () =>
  expectFail("max dropped", (d) => (d.dosingTable.rows[3].pediatric[0] = "20 mg/kg/dose IV Q8h"), "Vancomycin / pediatric"));
test("an emptied adult cell", () => expectFail("adult []", (d) => (d.dosingTable.rows[0].adult = []), "Cefazolin"));
test("a changed dosing cell", () =>
  expectFail("dosing cell", (d) => (d.dosingTable.rows[1].pediatric[0] = "< 40 kg: 40 mg/kg/dose IV Q12h"), "Cefepime / pediatric"));
test("a wrong adult age label", () =>
  expectFail("age label", (d) => (d.dosingTable.adultLabel = "Adult Dosing (age ≥5 years)"), "adult header"));
test("a dropped footnote association", () => expectFail("footnote null", (d) => (d.dosingTable.rows[0].footnote = null), "Cefazolin"));
test("swapped footnote marks", () =>
  expectFail("mark swap", (d) => {
    d.dosingTable.footnotes.renal.mark = "**";
    d.dosingTable.footnotes.pharmacy.mark = "*";
  }, "dosing row"));
test("the vancomycin footnote cut after its first sentence", () =>
  expectFail(
    "pharmacy footnote cut",
    (d) => (d.dosingTable.footnotes.pharmacy.text = "Order Vancomycin IV – Pharmacy to Dose for adult and pediatric patients."),
    "footnotes"
  ));
// A point or dash between digits was erased in the prose comparison until
// v0.7.11, so these compared equal to the PDF (Codex whole-codebase review).
test("a decimal point turned into a range dash", () =>
  expectFail("1–5g", (d) => {
    const row = d.dosingTable.rows.find((r) => r.drug === "Vancomycin");
    const i = row.adult.findIndex((l) => l.includes("1.5g"));
    row.adult[i] = row.adult[i].replace("1.5g", "1–5g");
  }, "Vancomycin / adult"));
test("a weight-based dose's decimal point turned into a dash", () =>
  expectFail("13–3", (d) => {
    const row = d.dosingTable.rows.find((r) => r.drug === "Metronidazole");
    const i = row.pediatric.findIndex((l) => l.includes("13.3"));
    row.pediatric[i] = row.pediatric[i].replace("13.3", "13–3");
  }, "Metronidazole / pediatric"));
test("a minus sign before a maximum", () =>
  expectFail("-1.5g", (d) => {
    const row = d.dosingTable.rows.find((r) => r.drug === "Vancomycin");
    const i = row.adult.findIndex((l) => l.includes("max 1.5g"));
    row.adult[i] = row.adult[i].replace("max 1.5g", "max -1.5g");
  }, "Vancomycin / adult"));
test("an empty extra footnote", () =>
  expectFail("empty footnote", (d) => (d.dosingTable.footnotes.empty = { mark: "", text: "" }), "a mark of asterisks"));
test("the renal footnote cut short", () =>
  expectFail("renal footnote cut", (d) => (d.dosingTable.footnotes.renal.text = "Pharmacy to dose adjust"), "footnotes"));

// ── Page 5 links and page 12 references ──
test("a link target moved to another label", () =>
  expectFail(
    "NHSN link",
    (d) => (d.feverWorkup.referenceStandards[0].url = "https://www.cdc.gov/nhsn/pdfs/pscmanual/7psccauticurrent.pdf"),
    "resolves to"
  ));
test("a page-5 link entry duplicated over another", () =>
  expectFail("duplicate link", (d) => {
    const rs = d.feverWorkup.referenceStandards;
    rs[1] = structuredClone(rs[0]);
  }, "twice"));
test("a changed NHSN link", () =>
  expectFail(
    "NHSN link 2",
    (d) => (d.feverWorkup.referenceStandards[0].url = "https://www.cdc.gov/nhsn/pdfs/pscmanual/wrong.pdf"),
    "resolves to"
  ));
test("a reference year that exists elsewhere on the page", () =>
  expectFail("ref year", (d) => (d.references[2].text = d.references[2].text.replace("(2000)", "(2019)")), "reference 3"));
test("a changed reference page range", () =>
  expectFail("ref pages", (d) => (d.references[2].text = d.references[2].text.replace("621–630", "621–639")), "reference 3"));
test("a DOI moved from another reference", () =>
  expectFail("DOI swap", (d) => (d.references[0].url = "https://doi.org/10.1097/CCM.0b013e318287f713"), "reference 1"));
test("a deleted reference", () => expectFail("ref deleted", (d) => d.references.pop(), "expected 13 references"));
test("a reference cut off before its journal", () =>
  expectFail("ref cut", (d) => {
    const r = d.references[1];
    r.text = r.text.slice(0, r.text.indexOf(" American Journal"));
  }, "page 12: the references"));
test("a reference without its DOI", () => expectFail("DOI dropped", (d) => delete d.references[0].url, "page 12: the references"));
test("the last reference's URL cut by one character", () =>
  expectFail("URL cut", (d) => (d.references[12].url = d.references[12].url.slice(0, -1)), "page 12: the references"));

// ── Source binding ──
test("a stale source hash", () => expectFail("hash", (d) => (d.source.sha256 = "0".repeat(64)), "sha256 mismatch"));
test("a PDF filename without the content hash", () =>
  expectFail("filename", (d) => (d.source.file = "MU-ACS-Antibiotic-PMG-2025-12.pdf"), "content hash"));
