// Plants each escape Codex claimed in a copy of the real data and runs the real
// verify(), to turn its claims into evidence before anything is fixed.
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = process.argv[2];
const pmg = await import(pathToFileURL(path.join(root, "src/data/pmg.js")).href);
const { readPdf, verify } = await import(pathToFileURL(path.join(root, "scripts/verify-pmg.mjs")).href);
const { redoseLabel } = await import(pathToFileURL(path.join(root, "src/lib/dosing.js")).href);
const pdf = await readPdf(path.join(root, "public", pmg.source.file));
const clone = () => structuredClone({ ...pmg });

const cases = {
  "F1 contamination heading": (d) => (d.openFractures.contamination.heading = "Open Fractures Without Contamination"),
  // Flags became { text, reviewed } in v0.8.3; this handles both shapes.
  "F1 flag dose": (d) => {
    const f = d.transcription.flags[5];
    if (typeof f === "string") d.transcription.flags[5] = f.replace("15-20 mg/kg", "150-200 mg/kg");
    else f.text = f.text.replace("15-20 mg/kg", "150-200 mg/kg");
  },
  "F1 section title": (d) => (d.sections[0].title = "Empiric Therapy"),
  "F1 correction where": (d) => (d.transcription.corrections[0].where = "Open fractures — Type III"),
  "F2 short or→and": (d) => (d.indications.find((i) => i.id === "sbo-necrosis").short = "SBO with necrosis and bowel resection"),
  "F3 redose '8 '": (d) => (d.prophylaxisDosing.rows.find((r) => r.drug === "Metronidazole").redose = "8 "),
  "F4 1,500 → 1:500": (d) => (d.redosingRules[0].items[0] = d.redosingRules[0].items[0].replace("1,500 mL", "1:500 mL")),
  "F5 url moved into text": (d) => {
    const r = d.references[1];
    r.text += " " + r.url;
    delete r.url;
  },
  "F6 extra drug": (d) => (d.drugs.Gentamicin = { brand: "", class: "" }),
  "extra: dosing page": (d) => (d.prophylaxisDosing.page = 4),
  "extra: indication order": (d) => {
    const a = d.indications.findIndex((i) => i.id === "craniotomy");
    const b = d.indications.findIndex((i) => i.id === "csf-leak");
    [d.indications[a], d.indications[b]] = [d.indications[b], d.indications[a]];
  },
  "extra: classification order": (d) => d.openFractures.classification.types.reverse(),
  "extra: route IV → PO": (d) => (d.openFractures.selection[0].regimen[0].route = "PO"),
};
for (const [name, mutate] of Object.entries(cases)) {
  const d = clone();
  mutate(d);
  const r = await verify(d, { pdf });
  console.log(`${r.ok ? "PASSES (escape confirmed)" : "caught          "}  ${name}${r.ok ? "" : "  — " + r.errors[0].split("\n")[0].slice(0, 90)}`);
}
console.log("redoseLabel('8 ') →", JSON.stringify(redoseLabel({ redose: "8 " })));
