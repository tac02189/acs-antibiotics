// Shape and consistency checks on the data file, plus the parts the PDF
// verifier cannot see (display labels, search, routing). These catch
// transcription slips and regressions; they cannot catch clinical errors.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as pmg from "../src/data/pmg.js";
import { loose, regimenAsProse } from "../scripts/verify-pmg.mjs";
import { matchRoute, parseHash } from "../src/lib/route.js";
import { searchIndications, score } from "../src/lib/search.js";

const { indications, sections, drugs, openFractures, dosingTable, feverWorkup, references, source } = pmg;

test("sections and indication ids are unique and cross-reference", () => {
  const sectionIds = sections.map((s) => s.id);
  assert.equal(new Set(sectionIds).size, sectionIds.length);
  const ids = indications.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate indication id");
  for (const ind of indications) {
    assert.ok(sectionIds.includes(ind.section), `${ind.id}: unknown section ${ind.section}`);
    assert.ok([1, 2].includes(ind.page), `${ind.id}: page must be 1 or 2`);
    assert.match(ind.id, /^[a-z0-9-]+$/, `${ind.id}: id must be url-safe`);
  }
  for (const s of sections) {
    assert.ok(indications.some((i) => i.section === s.id), `section ${s.id} is empty`);
  }
  assert.equal(indications.length, 34, "the PMG prints 34 table rows");
});

test("every regimen entry is complete and every drug has metadata", () => {
  for (const ind of indications) {
    assert.ok(ind.name && ind.short, `${ind.id}: name and short required`);
    if (ind.regimen === null) {
      assert.equal(ind.duration, null, `${ind.id}: N/A row must have null duration`);
      assert.equal(ind.redose, null, `${ind.id}: N/A row must have null redose`);
      assert.equal(ind.alternative, null, `${ind.id}: N/A row must have null alternative`);
      continue;
    }
    assert.ok(Array.isArray(ind.regimen) && ind.regimen.length > 0, `${ind.id}: regimen must be a non-empty array or null`);
    for (const r of ind.regimen) {
      for (const k of ["drug", "dose", "frequency"]) {
        assert.equal(typeof r[k], "string", `${ind.id}: regimen.${k} must be a string`);
        assert.ok(r[k].trim(), `${ind.id}: regimen.${k} is empty`);
      }
      assert.ok(drugs[r.drug], `${ind.id}: drug "${r.drug}" has no entry in drugs{}`);
      if (r.dose !== "Pharmacy to dose") assert.match(r.dose, /^\d+(\.\d+)? (g|mg)(\/\d+ mg)?$/, `${ind.id}: odd dose "${r.dose}"`);
      assert.equal(r.route, undefined, `${ind.id}: the tables print no route`);
      assert.equal(r.note, undefined, `${ind.id}: the tables print no note`);
    }
    assert.ok(Array.isArray(ind.duration) && ind.duration.length > 0, `${ind.id}: duration must be a non-empty array`);
    assert.ok(ind.redose === null || typeof ind.redose === "string", `${ind.id}: redose type`);
    assert.ok(
      ind.alternative === null || typeof ind.alternative === "string" || Array.isArray(ind.alternative),
      `${ind.id}: alternative type`
    );
  }
});

// `short` is the label the reader sees. The PDF verifier cannot judge it, so
// every word in it must come from the PDF's own row name (or be one of these
// spelled-out abbreviations), so a label can never be re-pointed at another
// row's regimen.
const ABBREVIATIONS = {
  sbo: ["small", "bowel", "obstruction"],
  uti: ["urinary", "tract", "infection"],
  facial: ["face"],
};
const STOP_WORDS = new Set(["with", "or", "without", "and", "of", "the", "a", "non"]);
const words = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9/ -]/g, " ")
    .split(/[\s/-]+/)
    .filter(Boolean);

test("short display labels use only words from the PDF row name", () => {
  for (const ind of indications) {
    const nameWords = new Set(words(ind.name));
    for (const w of words(ind.short)) {
      if (STOP_WORDS.has(w) || nameWords.has(w)) continue;
      const expansion = ABBREVIATIONS[w];
      if (expansion && expansion.every((x) => nameWords.has(x))) continue;
      if ([...nameWords].some((n) => n.length >= 5 && (n.startsWith(w) || w.startsWith(n)))) continue;
      assert.fail(`${ind.id}: short label word "${w}" is not in the PDF name "${ind.name}"`);
    }
  }
});

test("open-fracture display regimens re-state the verified PDF wording exactly", () => {
  for (const a of openFractures.antimicrobial) {
    assert.equal(loose(regimenAsProse(a.regimen, dosingTable.footnotes)), loose(a.text), `${a.id}: regimen ≠ text`);
    for (const r of a.regimen) {
      assert.ok(drugs[r.drug], `${a.id}: drug "${r.drug}" has no entry in drugs{}`);
      if (r.footnote) assert.ok(dosingTable.footnotes[r.footnote], `${a.id}: unknown footnote ${r.footnote}`);
    }
    assert.ok([3, 4].includes(a.page), `${a.id}: page`);
  }
  assert.equal(openFractures.antimicrobial.length, 4);
  assert.equal(openFractures.duration.length, 2);
});

// OpenFracturesView finds the regimen the PCN Allergy toggle highlights by this id;
// a rename would quietly drop the highlight, so it fails the build instead (v0.7.9).
test("the open-fracture penicillin-allergy id exists", () => {
  assert.ok(openFractures.antimicrobial.some((a) => a.id === "pcn-allergy"), "pcn-allergy is missing");
});

test("dosing table rows are complete and footnotes resolve", () => {
  assert.equal(dosingTable.rows.length, 4);
  const names = dosingTable.rows.map((r) => r.drug);
  assert.equal(new Set(names).size, names.length, "duplicate dosing row");
  for (const row of dosingTable.rows) {
    assert.ok(row.adult.length >= 1 && row.pediatric.length >= 2, `${row.drug}: missing dosing lines`);
    if (row.footnote) assert.ok(dosingTable.footnotes[row.footnote], `${row.drug}: unknown footnote ${row.footnote}`);
    assert.ok(drugs[row.drug], `${row.drug}: no drugs{} entry`);
  }
});

test("fever workup links are https CDC pages and references are numbered 1..13", () => {
  for (const r of feverWorkup.referenceStandards) assert.match(r.url, /^https:\/\/www\.cdc\.gov\//);
  assert.equal(feverWorkup.transcribedFromImage, true, "page 5 is an image; the disclosure flag must stay");
  assert.deepEqual(
    references.map((r) => r.n),
    Array.from({ length: 13 }, (_, i) => i + 1)
  );
  for (const r of references) if (r.url) assert.doesNotMatch(r.url, /utm_/, "tracking parameters must be stripped");
  assert.match(source.sha256, /^[0-9a-f]{64}$/);
  assert.ok(source.file.includes(source.sha256.slice(0, 12)), "the PDF filename must carry its content hash");
});

test("search finds indications by name, abbreviation, brand and generic, and respects negations", () => {
  const ids = (q) => searchIndications(indications, q, drugs).map((i) => i.id);
  const first = (q) => ids(q)[0];
  assert.equal(first("appy"), "appendicitis");
  assert.equal(first("appendicitis"), "appendicitis");
  assert.equal(first("nec fasc"), "nsti");
  assert.deepEqual(new Set(ids("SBO")), new Set(["sbo-necrosis", "sbo-no-necrosis"]));
  const zosyn = ids("zosyn");
  assert.ok(zosyn.length >= 7, "Zosyn should hit every piperacillin-tazobactam row and the Zosyn note in abdominal trauma");
  assert.ok(zosyn.includes("abdominal-trauma"), "duration text is searched");
  const ertapenem = ids("invanz");
  assert.ok(ertapenem.includes("appendicitis") && ertapenem.includes("diverticulitis-source-control"));
  assert.equal(searchIndications(indications, "", drugs).length, indications.length);
  assert.equal(ids("xyzzy").length, 0);
  assert.ok(score(indications.find((i) => i.id === "chest-tubes"), "chest", drugs) > 0);
  // Negations: "complicated" must not match "uncomplicated", "purulent" must not match "non-purulent".
  assert.ok(ids("complicated").includes("complicated-uti"));
  assert.ok(!ids("complicated").includes("uncomplicated-uti"), '"complicated" matched the uncomplicated row');
  assert.ok(ids("purulent").includes("cellulitis-purulent"));
  assert.ok(!ids("purulent").includes("cellulitis-nonpurulent"), '"purulent" matched the non-purulent row');
  assert.ok(ids("nonpurulent").includes("cellulitis-nonpurulent"), "hyphen-insensitive");
  assert.ok(ids("non-purulent").includes("cellulitis-nonpurulent"));
  assert.ok(ids("Q24H").includes("appendicitis"), "frequencies are searched");
  assert.ok(ids("4.5 g").includes("cholecystitis"), "doses are searched");
});

test("hash routes parse", () => {
  assert.equal(parseHash(""), "/");
  assert.equal(parseHash("#/fractures"), "/fractures");
  assert.equal(parseHash("#drugs/Cefazolin"), "/drugs/Cefazolin");
  assert.deepEqual(matchRoute("/"), { view: "indications" });
  assert.deepEqual(matchRoute("/i/appendicitis"), { view: "indications", focus: "appendicitis" });
  assert.deepEqual(matchRoute("/s/trauma"), { view: "indications", section: "trauma" });
  assert.deepEqual(matchRoute("/drugs/Piperacillin-tazobactam"), { view: "drugs", drug: "Piperacillin-tazobactam" });
  assert.deepEqual(matchRoute("/drugs/Sulfamethoxazole-TMP"), { view: "drugs", drug: "Sulfamethoxazole-TMP" });
  assert.deepEqual(matchRoute("/nonsense/x"), { view: "indications" });
  assert.deepEqual(matchRoute("/source"), { view: "source" });
});
