// Planted-error controls for scripts/verify-pmg.mjs.
//
// A verifier that cannot be shown to fail is not evidence. Each case below
// corrupts a copy of the data in one specific, plausible way — the kind of slip
// a transcription actually produces, or one of the escapes earlier peer reviews
// demonstrated — and asserts the verifier rejects it, with an error that names
// the right thing. The first case asserts the real data passes. Every mutation
// must actually change the data (a control whose edit is a no-op is a control
// that tests nothing). Re-run after any edit to the verifier; a new check gets
// a control that fails without it.
//
// Rewritten for the October 2026 edition (v0.8.0); the December 2025 set had 79.
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
const sec = (data, id) => data.sections.find((s) => s.id === id);
const pro = (data, drug) => data.prophylaxisDosing.rows.find((r) => r.drug === drug);
const emp = (data, drug) => data.empiricDosing.rows.find((r) => r.drug === drug);
const sel = (data, id) => [...data.openFractures.selection, ...data.openFractures.contamination.items].find((e) => e.id === id);
const ref = (data, n) => data.references.find((r) => r.n === n);

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
const control = (name, mutate, needle) => test(name, () => expectFail(name, mutate, needle));

test("the real data passes", async () => {
  const result = await verify(clone(), { pdf });
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
  assert.equal(result.summary.matched, 40);
  assert.equal(result.summary.rows, 40);
});

// ── Source binding, running header, page 1 ──
control("a wrong sha256", (d) => (d.source.sha256 = "0".repeat(64)), "sha256 mismatch");
control("a filename without the content hash", (d) => (d.source.file = "MU-ACS-Antibiotic-PMG-2026-10.pdf"));
control("a wrong page count", (d) => (d.source.pages = 12), "source.pages");
control("the previous edition's date", (d) => (d.source.reviewDate = "December 2025"), "running header");
control("an introduction paragraph cut short", (d) => (d.source.intro[3] = d.source.intro[3].replace(/ Our shared priority.*$/, "")), "page 1");
control("introduction paragraphs out of order", (d) => d.source.intro.reverse(), "page 1");
control("a changed title", (d) => (d.source.title = d.source.title.replace("Empiric Treatment", "Treatment")), "page 1");

// ── Indication tables (pages 2–4) ──
control("a changed preferred drug", (d) => (find(d, "abdominal-trauma").preferred[0] = "Ceftriaxone"), "abdominal-trauma / preferred");
control("combination partners in the wrong order", (d) => find(d, "nsti").preferred.reverse(), "nsti / preferred");
control("a dropped combination partner", (d) => find(d, "colectomy").preferred.pop(), "colectomy / preferred");
control("an added combination partner", (d) => find(d, "craniotomy").preferred.push("Metronidazole"), "craniotomy / preferred");
control("a changed alternative", (d) => (find(d, "craniotomy").alternative[0].options[0][0] = "Levofloxacin"), "craniotomy / alternative");
control("an alternative choice dropped", (d) => find(d, "complicated-uti").alternative[0].options.pop(), "complicated-uti / alternative");
control("an 'or' choice turned into a combination", (d) => {
  const a = find(d, "uncomplicated-uti").alternative[0];
  a.options = [a.options.flat()];
}, "uncomplicated-uti / alternative");
control("per-drug alternatives swapped", (d) => {
  const [a, b] = find(d, "cap").alternative;
  [a.options, b.options] = [b.options, a.options];
}, "cap / alternative");
control("an alternative for a drug the row does not prefer", (d) => (find(d, "hap-vap").alternative[0].for = "Linezolid"), "not a preferred drug");
control("an N/A alternative given a value", (d) => (find(d, "fungemia").alternative = [{ options: [["Cefepime"]] }]), "fungemia / alternative");
control("a changed duration", (d) => (find(d, "appendectomy").duration[1] = "Perforated with source control: 5 days"), "appendectomy / duration");
// The appendectomy colon is a listed correction the data must carry; a TYPO_MAP
// entry for it passed both of these (Codex review, 2026-10-19).
control("the corrected appendectomy colon dropped", (d) => (find(d, "appendectomy").duration[2] = "Perforated without source control 8 days"), "appendectomy / duration");
control("a printed colon dropped from another row", (d) => (find(d, "cholecystitis").duration[2] = "Perforated without source control 8 days"), "cholecystitis / duration");
control("a dropped duration line", (d) => find(d, "cholecystitis").duration.pop(), "cholecystitis / duration");
control("an N/A duration given a value", (d) => (find(d, "colectomy").duration = ["24 hours"]), "colectomy / duration");
control("a duration taken from another row", (d) => (find(d, "diverticulitis-no-source-control").duration = find(d, "diverticulitis-source-control").duration), "diverticulitis-no-source-control / duration");
control("an N/A row given a regimen", (d) => (find(d, "chest-tube").preferred = ["Cefazolin"]), "chest-tube / preferred");
control("an N/A row half filled", (d) => (find(d, "csf-leak").duration = ["24 hours"]), "N/A in every column");
control("a deleted indication", (d) => (d.indications = d.indications.filter((i) => i.id !== "sinusitis")), "Sinusitis");
control("a renamed indication", (d) => (find(d, "craniotomy").name = "Craniectomy"), "Craniotomy");
control("a qualifier appended to a row name", (d) => (find(d, "vascular-trauma").name += " (pediatric)"), "matches 0 data entries");
control("a duplicated indication", (d) => d.indications.push({ ...structuredClone(find(d, "craniotomy")), id: "craniotomy-2" }), "matches 2 data entries");
control("an indication moved to another section", (d) => (find(d, "cholecystitis").section = "egs"), "cholecystitis: data section");
control("an indication on the wrong page", (d) => (find(d, "sinusitis").page = 3), "sinusitis: data says page 3");
control("alternatives swapped between two rows", (d) => {
  const a = find(d, "craniotomy");
  const b = find(d, "gu-trauma");
  [a.alternative, b.alternative] = [b.alternative, a.alternative];
}, "craniotomy / alternative");
control("a misspelled drug", (d) => (find(d, "sinusitis").preferred[0] = "Ampicillin-sulbactum"), "no entry in drugs{}");
// Controls added from the 2026-10-16 Codex review: each escape it described, and
// each guard that had no control.
control("two rows in the wrong order", (d) => {
  const a = d.indications.findIndex((i) => i.id === "craniotomy");
  const b = d.indications.findIndex((i) => i.id === "csf-leak");
  [d.indications[a], d.indications[b]] = [d.indications[b], d.indications[a]];
}, "not in the PDF's order");
control("a section on the wrong page", (d) => (sec(d, "elective").page = 2), "data says page 2");
control("an empty preferred list", (d) => (find(d, "craniotomy").preferred = []), "preferred must be a non-empty list");
control("an alternative with no options", (d) => (find(d, "craniotomy").alternative = [{ options: [] }]), "non-empty list of non-empty options");
control("an empty duration list", (d) => (find(d, "craniotomy").duration = []), "duration must be a non-empty list");
control("an invented drug in drugs{}", (d) => (d.drugs.Gentamicin = { brand: "Garamycin", class: "Aminoglycoside" }), 'drugs{} lists "Gentamicin"');
control("a changed section title", (d) => (sec(d, "elective").printedTitle = "Elective Surgery: Antibiotic Prophylaxis"), "elective");
control("a changed column header", (d) => (sec(d, "empiric").columns[3] = "Duration of Post-Operative Antibiotic(s)"), "column headers");
control("a section's dosing kind flipped", (d) => (sec(d, "empiric").kind = "prophylaxis"), 'kind "prophylaxis"');
control("an unknown dosing kind", (d) => (sec(d, "trauma").kind = "treatment"), "kind must be");

// ── Dosing tables ──
control("cefazolin's ≥ read as >", (d) => (pro(d, "Cefazolin").dose[1] = "3 g if > 120 kg"), "Cefazolin, column 2");
control("cefazolin's weight threshold changed", (d) => (pro(d, "Cefazolin").dose[0] = "2 g if < 100 kg,"), "Cefazolin, column 2");
control("a prophylaxis dose changed", (d) => (pro(d, "Levofloxacin").dose = ["500 mg"]), "Levofloxacin, column 2");
control("a redosing interval changed", (d) => (pro(d, "Piperacillin-tazobactam").redose = "4"), "Piperacillin-tazobactam, column 3");
control("'Not recommended' given a number", (d) => (pro(d, "Vancomycin").redose = "12"), "Vancomycin, column 3");
control("an infusion time changed", (d) => (pro(d, "Levofloxacin").infusion = "60"), "Levofloxacin, column 4");
control("prophylaxis rows in the wrong order", (d) => {
  const r = d.prophylaxisDosing.rows;
  [r[2], r[3]] = [r[3], r[2]];
}, "prophylaxis dosing");
control("a prophylaxis row deleted", (d) => d.prophylaxisDosing.rows.splice(4, 1), "prophylaxis dosing");
control("a prophylaxis header changed", (d) => (d.prophylaxisDosing.columns.redose = "Redosing Interval (hours)"), "prophylaxis dosing headers");
control("a prophylaxis table title changed", (d) => (d.prophylaxisDosing.title = "Dosing of Antibiotics for Surgical Prophylaxis"), "prophylaxis dosing table's title");
control("an empiric dose changed", (d) => (emp(d, "Levofloxacin").dose = "500 mg"), "Levofloxacin, column 2");
control("an empiric route changed", (d) => (emp(d, "Azithromycin").route = "IV"), "Azithromycin, column 3");
control("an empiric frequency narrowed", (d) => (emp(d, "Metronidazole").frequency = "Q8H"), "Metronidazole, column 4");
control("a combination dose inverted", (d) => (emp(d, "Sulfamethoxazole-trimethoprim").dose = "160 mg / 800 mg"), "Sulfamethoxazole-trimethoprim, column 2");
control("an empiric row deleted", (d) => d.empiricDosing.rows.splice(7, 1), "empiric dosing");
control("rows swapped across the two halves", (d) => {
  const r = d.empiricDosing.rows;
  [r[9], r[10]] = [r[10], r[9]];
}, "empiric dosing");
control("an empiric header changed", (d) => (d.empiricDosing.columns.route = "Routes"), "empiric dosing headers");
control("the empiric footnote cut short", (d) => (d.empiricDosing.footnote = d.empiricDosing.footnote.replace(/; Dose adjustments.*$/, "")), "footnote");
control("an empiric table title changed", (d) => (d.empiricDosing.title = "Dosing of Empiric Antimicrobials"), "empiric dosing table's title");
control("a prophylaxis table on the wrong page", (d) => (d.prophylaxisDosing.page = 4), "prophylaxisDosing.page");
control("an empiric table on the wrong page", (d) => (d.empiricDosing.page = 3), "empiricDosing.page");
control("a duplicated dosing row", (d) => d.empiricDosing.rows.push({ ...emp(d, "Cefazolin") }), "listed twice");
control("an empty dosing cell", (d) => (emp(d, "Cefazolin").route = ""), "is empty in the data");

// ── Re-dosing rules (page 3) ──
control("a blood-loss threshold changed", (d) => (d.redosingRules[0].items[0] = d.redosingRules[0].items[0].replace("1,500 mL", "1,000 mL")), "re-dosing rules");
control("a comparison sign reversed", (d) => (d.redosingRules[0].items[0] = d.redosingRules[0].items[0].replace("> 30%", "< 30%")), "re-dosing rules");
control("a rule dropped", (d) => d.redosingRules[1].items.pop(), "re-dosing rules");
control("rules in the wrong order", (d) => d.redosingRules[1].items.reverse(), "re-dosing rules");
control("rules moved between headings", (d) => {
  const [a, b] = d.redosingRules;
  [a.items[1], b.items[1]] = [b.items[1], a.items[1]];
}, "re-dosing rules");
control("SAME and DIFFERENT swapped", (d) => {
  const it = d.redosingRules[1].items;
  it[0] = it[0].replace("SAME", "DIFFERENT");
}, "re-dosing rules");
control("a heading changed", (d) => (d.redosingRules[0].heading = "Intraoperative redosing"), "is not printed");
control("a number's comma read as a colon", (d) => (d.redosingRules[0].items[0] = d.redosingRules[0].items[0].replace("1,500 mL", "1:500 mL")), "re-dosing rules");
control("a list of rules dropped", (d) => d.redosingRules.pop(), "two headed lists");

// ── Open fractures (page 5) ──
control("a displayed dose that differs from the text", (d) => (sel(d, "type-1-2").regimen[0].dose = "1 g"), "does not re-state");
control("a dose changed in both text and display", (d) => {
  const e = sel(d, "type-1-2");
  e.text = "Cefazolin 1 g Q8H";
  e.regimen[0].dose = "1 g";
}, "antibiotic selection");
control("an allergy frequency changed in both text and display", (d) => {
  const a = sel(d, "contamination").allergy;
  a.text = a.text.replace("Metronidazole 500 mg Q12H", "Metronidazole 500 mg Q8H");
  a.regimen[1].frequency = "Q8H";
}, "open fracture contamination");
control("allergy regimens moved to the other type", (d) => {
  const [a, b] = d.openFractures.selection;
  [a.allergy, b.allergy] = [b.allergy, a.allergy];
}, "antibiotic selection");
control("an allergy regimen deleted", (d) => delete sel(d, "type-3").allergy, "antibiotic selection");
control("an allergy regimen promoted to a bullet of its own", (d) => {
  const e = sel(d, "type-1-2");
  d.openFractures.selection.splice(1, 0, { id: "pcn", ...e.allergy });
  delete e.allergy;
}, "antibiotic selection");
control("a partner dropped from the display only", (d) => sel(d, "contamination").regimen.pop(), "does not re-state");
control("a partner dropped from text and display", (d) => {
  const e = sel(d, "type-3");
  e.text = "Ceftriaxone 2 g Q24H";
  e.regimen.pop();
}, "antibiotic selection");
control("a whole regimen held in the dose field", (d) => {
  const r = sel(d, "type-1-2").regimen[0];
  r.dose = "2 g Q8H";
  delete r.frequency;
}, "not shaped like a dose");
control("a note that hides a drug", (d) => (sel(d, "type-3").regimen[1].note = "pharmacy to dose Levofloxacin"), "is not a note");
control("a changed timing rule", (d) => (d.openFractures.timing = d.openFractures.timing.replace("30 min", "60 min")), "timing rule");
control("a timing rule cut short", (d) => (d.openFractures.timing = "Administer within 30 min of arrival to the ED"), "timing rule");
control("a changed contamination scope", (d) => (d.openFractures.contamination.scope = "Applies to type III fractures"), "contamination heading");
control("a changed duration", (d) => (d.openFractures.duration[0].value = "48 hours total"), "antibiotic duration");
control("durations swapped between types", (d) => {
  const [a, b] = d.openFractures.duration;
  [a.value, b.value] = [b.value, a.value];
}, "antibiotic duration");
control("a classification description changed", (d) => (d.openFractures.classification.types[1].description = d.openFractures.classification.types[1].description.replace("1-10 cm", "1-5 cm")), "classification Type II");
control("a subtype dropped", (d) => d.openFractures.classification.types[2].subtypes.pop(), "classification");
control("subtype descriptions swapped", (d) => {
  const s = d.openFractures.classification.types[2].subtypes;
  [s[0].description, s[1].description] = [s[1].description, s[0].description];
}, "classification Type III");
control("a classification header changed", (d) => (d.openFractures.classification.columns[1] = "Description"), "classification header");
control("a duplicated fracture type", (d) => d.openFractures.classification.types.push({ ...structuredClone(d.openFractures.classification.types[0]) }), "classification");
control("fracture types in the wrong order", (d) => {
  const t = d.openFractures.classification.types;
  [t[0], t[1]] = [t[1], t[0]];
}, "not in the PDF's order");
control("a changed contamination heading", (d) => (d.openFractures.contamination.heading = "Open Fractures Without Contamination"), "contamination heading");
control("the open-fracture page on the wrong page", (d) => (d.openFractures.page = 4), "openFractures.page");
control("a duplicated regimen id", (d) => (sel(d, "type-3").id = "type-1-2"), "duplicate regimen id");

// ── References (pages 6–8) ──
control("a word changed in a reference", (d) => (ref(d, 18).text = ref(d, 18).text.replace("(2026)", "(2025)")), "references are not printed as one run");
control("a DOI digit changed", (d) => (ref(d, 7).url = "https://doi.org/10.1177/1060028019867115"), "pages 6–8");
control("a reference deleted", (d) => d.references.splice(20, 1), "expected 35 references");
control("references out of order", (d) => {
  const r = d.references;
  [r[3].text, r[4].text] = [r[4].text, r[3].text];
}, "references are not printed as one run");
control("a reference's link dropped", (d) => delete ref(d, 1).url, "references are not printed as one run");
control("a link added to the reference that prints none", (d) => (ref(d, 30).url = "https://doi.org/10.1097/TA.0000000000000536"), "references are not printed as one run");
control("a reference on the wrong page", (d) => (ref(d, 12).page = 6), "reference 12: not printed on page 6");
control("the last reference cut short", (d) => (ref(d, 35).url = "https://doi.org/10.1007/s00268-019-05286"), "pages 6–8");
control("a link moved into the reference's text", (d) => {
  const r = ref(d, 2);
  r.text += " " + r.url;
  delete r.url;
}, "its text holds a URL");
control("a reference misnumbered", (d) => (ref(d, 5).n = 50), "reference numbering");
