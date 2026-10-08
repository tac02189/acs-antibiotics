# Codex — transcription check of `src/data/pmg.js` against the PDF, 2026-10-08

Thiago: "have codex and gemini check everything against the pdf". Codex CLI 0.160.1, model
`gpt-6-astra`, `codex exec --sandbox read-only`, reasoning effort `xhigh` (header confirmed:
`sandbox: read-only`, `reasoning effort: xhigh`), run in an untrusted scratch folder. 768 s,
94,620 tokens. Relayed by the `codex` bridge agent. Gemini ran the same packet separately
(`2026-10-08-gemini-pdf-crosscheck.md`), but text-only, so page 5 was checked by Codex alone.

- **Packet:** `2026-10-08-pdf-crosscheck/prompt.md` (67,359 bytes: instructions, the pdf.js text of
  pages 1–5 and 12, and `src/data/pmg.js` at `1f1f450` with line numbers, sha256 `e788ad0f…`),
  plus 17 PNG renders of pages 1–5 and 12 (whole pages and 2.5–4× crops, made with
  `render.mjs` + `render.html` + `jobs.json` in the same folder; the images themselves are not
  committed, the scripts reproduce them).
- **Receipt:** Codex listed all 17 images by name, pmg.js line 924 `};`, and page 12's first
  extraction line. No tools were used (stderr has no `exec` lines).
- **This is a transcription check, not clinical verification.** No finding below, and no absence
  of one, confirms a clinical value. The pending-verification banner stays. *(At the time of the
  review; superseded by the rulings under Dispositions — the banner was removed in v0.7.5.)*
- **Nothing below was dismissed or softened.** Codex's answer follows verbatim; dispositions are
  at the end.

---

1. **Images received: 17** — `p1-full.png`, `p1-table-left.png`, `p1-table-right.png`, `p2-full.png`, `p2-top-left.png`, `p2-top-right.png`, `p2-bottom-left.png`, `p2-bottom-right.png`, `p3-top.png`, `p3-bottom.png`, `p4-top.png`, `p4-bottom.png`, `p5-full.png`, `p5-top.png`, `p5-bottom.png`, `p12-top.png`, `p12-bottom.png`.
2. **Last embedded pmg.js line: 924**, containing `};`.
3. **First extracted text line for page 12:** `[y=746 x=28] Original Publication Date: December 2025 | Practice Management Guidelines`

The packet is complete. No tools were used.

**I found no confirmed Critical discrepancy in the numerical regimens, durations, or redosing rules.** There are source differences in the UTI flowchart, an inferred completion of a truncated indication, and app-authored interpretations that the PDF does not explicitly supply. All findings below concern source fidelity, not whether the PDF’s recommendations are clinically appropriate.

For absent material, “absent” means there is no corresponding text to quote in the embedded file. The report does not establish how the application renders these data.

**Clinical text and flowchart findings**

| ID | Severity | pmg.js lines | PDF page and image | Exact PDF text | Exact data text | Difference |
|---|---|---|---|---|---|---|
| F1 | **High** | 768–770 | p5, `p5-top.png` | Separate bullets: “Unexplained” and “Hypotension” | “Unexplained hypotension” | The file combines two separately printed bullets into one qualified criterion; the source does not explicitly attach “Unexplained” to “Hypotension.” |
| F2 | **High** | 778 | p5, `p5-top.png` | “Obtain Urinalysis with Reflexive” | “YES → obtain urinalysis with reflexive culture” | “Culture” is an inferred addition to the printed test instruction. |
| F3 | **High** | 779–782 | p5, `p5-full.png`, `p5-bottom.png` | “Start empiric antibiotics” has a downward arrow to “<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative -> discontinue antibiotics” | Separate array entries: “> 10 WBC → (repeat UA if >2 squamous cells) → start empiric antibiotics” and “<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics” | The final culture outcome is stored alongside the two WBC outcomes without explicitly encoding its incoming connection from “Start empiric antibiotics”; this is a missing connection in the data representation, not evidence that the rendered UI necessarily shows the wrong connection. |
| F4 | **Medium** | 489–492, 907–909 | p2, `p2-bottom-left.png` | “Complicated Urinary Tract Infection/CAUTI/Urologic Instr” | “Complicated Urinary Tract Infection/CAUTI/Urologic Instrumentation” | The file completes the clipped indication with an inferred word whose remaining letters cannot be recovered from the supplied image or extraction. |
| F5 | **Low** | 780 | p5, `p5-top.png`, `p5-bottom.png` | “(Repeat UA if >2 squamous cells)*” | “(repeat UA if >2 squamous cells)” | The printed asterisk is omitted; no corresponding asterisk explanation is visible on the supplied page 5. |
| F6 | **Low** | 728 | p5, `p5-top.png` | “Temp >38.°C or 100.4°F” | “Temp >38.0 °C or 100.4 °F” | The file supplies a zero after the source’s trailing decimal point; the numerical threshold remains 38 degrees. |

The following potentially surprising source values **are preserved**, rather than transcription errors:

- Pneumonia outcomes use both “≥ 10⁴ CFU/mL” and “≤ 10⁴ CFU/mL.”
- UTI WBC branches use “> 10 WBC” and “< 10 WBC.”
- The central-line criterion is “Central line >72h w/purulence at site,” with **YES → remove/replace if indicated** and **NO → Stop**.
- The open-fracture prose gives cefepime every eight hours, while the pediatric dosing table gives it every twelve hours.
- The open-fracture prose does not supply an IV route for cefepime; its structured regimen likewise does not add one.
- No alternative doses have been invented for rows whose alternative cells only name drugs.

**App-authored clinical descriptions**

These findings identify additions or interpretations, not conclusions that the added statements are medically false.

| ID | Severity | pmg.js lines | PDF page and image | Exact PDF text | Exact data text | Difference |
|---|---|---|---|---|---|---|
| A1 | **High** | 53 | p1, `p1-full.png`, `p1-table-left.png` | “Trauma” | “Prophylaxis by injury pattern, with intra-operative redosing triggers.” | The section description characterizes the entire table as prophylaxis, which the source heading and rows do not explicitly do. |
| A2 | **High** | 61 | p2, `p2-top-left.png` | “Emergency General Surgery” | “Empiric therapy and duration by source-control status.” | “Empiric therapy” is an app-added characterization of this table. |
| A3 | **High** | 25–27 | p1, `p1-table-right.png`; p2, `p2-top-right.png`, `p2-bottom-right.png` | “PNC Allergy/Alternative”; “Vancomycin x 1 dose if known MRSA colonization” | “MRSA-colonization add-ons (elective surgery)” | The comment interprets elective vancomycin entries as additions, whereas the PDF places them in its combined allergy/alternative column without saying “add.” |
| A4 | **High** | 69 | p2, `p2-top-right.png`, `p2-bottom-right.png` | “Vancomycin x 1 dose if known MRSA colonization” | “One-time dose; vancomycin added if known MRSA colonization.” | The displayed section description independently makes the same “added” interpretation. |
| A5 | **Medium** | 69; compare 364–370 | p2, `p2-top-left.png`, `p2-top-right.png` | Cholecystectomy alternative: “N/A” | “One-time dose; vancomycin added if known MRSA colonization.” | The section-wide description does not state that the cholecystectomy row has no such printed alternative. |
| A6 | **Medium** | 69; compare 400–409 | p2, `p2-bottom-left.png`, `p2-bottom-right.png` | Colectomy alternative: “N/A” | “One-time dose; vancomycin added if known MRSA colonization.” | The same section-wide description does not state that the colectomy row has no such printed alternative. |
| A7 | **High** | 77 | p2, `p2-bottom-left.png` | “ICU & General Floor” | “Hospital-onset infections treated by the surgical services.” | The PDF section heading does not limit every listed infection to hospital onset. |
| A8 | **Medium** | 23 | p1, `p1-table-right.png` | “Redose” | “Redose” followed by “(intra-operative redosing)” | The comment adds an intraoperative scope that is not written in the source column heading. |
| A9 | **Medium** | 53 | p1, `p1-table-right.png` | “Redose” | “with intra-operative redosing triggers.” | The trauma blurb repeats that inferred scope. |
| A10 | **Medium** | 81 | p1, `p1-table-right.png` | “Redose” | “Intra-operative redose rule that several trauma rows share, verbatim from the PDF” | The comment calls the rule intraoperative even though that qualification is not part of the quoted source rule. |

The underlying elective alternative fields themselves preserve the printed wording. These interpretation findings concern the comments and section description.

**Declared corrections: every affected row**

These are differences even where the correction is reasonable. Spelling-only corrections are Low because they do not substitute a different intended drug or change a numerical rule.

| ID | Severity | pmg.js lines | PDF page and image | PDF text | Data text | Assessment |
|---|---|---|---|---|---|---|
| C1 | **Low** | 83, 99, 900 | p1, `p1-table-right.png`, abdominal-trauma row | “Every 4 hours or with >1500ml blood loss or > 10 units blood transfustion” in the supplied extraction | “Every 4 hours or with >1500ml blood loss or > 10 units blood transfusion” | The recorded correction changes spelling only; the extra “t” is not sufficiently clear to me in the image to independently certify that character from the raster. |
| C2 | **Low** | 83, 222, 900 | p1, `p1-table-right.png`, GU-trauma row | “Every 4 hours or with >1500ml blood loss or > 10 units blood transfustion” in the supplied extraction | “Every 4 hours or with >1500ml blood loss or > 10 units blood transfusion” | The same spelling-only correction is applied here, with the same image-character limitation. |
| C3 | **Low** | 83, 234, 900 | p1, `p1-table-right.png`, vascular row | “Every 4 hours or with >1500ml blood loss or > 10 units blood transfustion” in the supplied extraction | “Every 4 hours or with >1500ml blood loss or > 10 units blood transfusion” | The same spelling-only correction is applied here, with the same image-character limitation. |
| C4 | **Low** | 329, 901 | p2, `p2-top-left.png` | “Nectrotizing Soft Tissue Infection” in the supplied extraction | “Necrotizing Soft Tissue Infection” | This removes the extraction’s extra “t” without changing the intended indication; I cannot confidently resolve that extra character independently in the supplied image. |
| C5 | **Low** | 268, 902 | p2, `p2-top-right.png`, diverticulitis **with** source control | “Ertapenum” | “Ertapenem” | This corrects the printed drug-name spelling without changing its intended identity. |
| C6 | **Low** | 280, 902 | p2, `p2-top-right.png`, diverticulitis **without** source control | “Ertapenum” | “Ertapenem” | The same spelling correction is applied to this separate row. |
| C7 | **Low** | 463, 903 | p2, `p2-bottom-left.png`, `p2-bottom-right.png` | “7days” | “7 days” | Only a space is added. |
| C8 | **Low** | 447, 904 | p2, `p2-bottom-right.png` | “Every 4 hour” | “Every 4 hours” | Only the grammatical plural is restored; the redosing interval is unchanged. |
| C9 | **Low** | 530, 905 | p2, `p2-bottom-left.png` | “Pharmacy to dos” | “Pharmacy to dose” | This completes a clipped dose-cell word; the same row’s frequency cell visibly contains “Pharmacy to dose.” |
| C10 | **Medium** | 491, 907–909 | p2, `p2-bottom-left.png` | “Complicated Urinary Tract Infection/CAUTI/Urologic Instr” | “Complicated Urinary Tract Infection/CAUTI/Urologic Instrumentation” | This is an inferred completion, not a demonstrably readable spelling correction; it is the same discrepancy as F4. |

Thus, the seven correction entries comprise:

- Five categories of spelling, spacing, or grammar changes.
- One clipped word completion supported by adjacent source wording.
- One unverified completion of a clipped indication.

For C1–C4, the extraction supports the declared original spellings, but I am **not claiming a definite image/extraction disagreement or an independent visual confirmation of the extra letters**.

**Other omitted source text**

| ID | Severity | pmg.js location | PDF page and image | Exact PDF text | Data text | Difference |
|---|---|---|---|---|---|---|
| O1 | **Low** | 31–44, especially 42–43 | p1, `p1-full.png` | “Acute Care Surgery at the University of Missouri is committed to delivering safe, evidence-based, and cost-conscious care across the continuum of trauma, emergency general surgery, critical care, and elective surgical practice. As antimicrobial resistance continues to rise and practice variation persists nationally, establishing a unified antibiotic stewardship framework is essential to optimizing patient outcomes and preserving the effectiveness of critical therapies.” | Absent | The entire first introductory paragraph is omitted. |
| O2 | **Low** | 42–43 | p1, `p1-full.png` | “By creating consistent expectations for antibiotic selection, timing, dosing, and duration, this PMG aims to reduce unnecessary variation, promote judicious antimicrobial use, and ensure that every patient treated within our trauma and surgical care system receives the safest and most appropriate therapy.” | Absent | The last sentence of the second introductory paragraph is omitted. |

Repeated running headers, logos, ruling lines, emphasis, and page layout are not reproduced as data. Several presentation labels—such as “Classification:”, “Antibiotics:”, “Antimicrobial Cont.”, and “Reference”—are represented by the data’s structure rather than stored as literal display strings. I found no additional clinical instruction omitted under those headings.

**Other wording and typography differences**

These do not change the clinical values. They are listed separately from the substantive findings.

| Severity | pmg.js lines | PDF page and image | Exact PDF text | Exact data text | Difference |
|---|---|---|---|---|---|
| **Low** | 32 | p1, `p1-full.png` | “ACUTE CARE SURGERY MU HEALTH ANTIBIOTIC PRACTICE MANAGEMENT GUIDELINE” | “Acute Care Surgery MU Health Antibiotic Practice Management Guideline” | Capitalization is normalized. |
| **Low** | 32 | p1, `p1-full.png` | “Acute Care Surgery MUHEALTH Antibiotic Practice Management Guideline” | “Acute Care Surgery MU Health Antibiotic Practice Management Guideline” | The table’s “MUHEALTH” is normalized to “MU Health.” |
| **Low** | 43 | p1, `p1-full.png` | “bodies—and aligned with our institution’s local microbiologic trends and antibiogram.” | “bodies — and aligned with our institution's local microbiologic trends and antibiogram.” | Dash spacing and the apostrophe are normalized. |
| **Low** | 621–622 | p3, `p3-bottom.png` | “Type III - Treatment for ALL Type III: :” | “Type III — treatment for ALL Type III” | Capitalization and dash style change, and the duplicated colon is omitted. |
| **Low** | 638 | p4, `p4-top.png` | “Soil, Fecal Contamination, and standing water contamination” | “Soil, fecal contamination, and standing water contamination” | Capitalization is normalized. |
| **Low** | 659 | p4, `p4-bottom.png` | “Operative debridement within 24 hours:” | “Operative debridement within 24 hours” | The heading’s final colon is omitted. |
| **Low** | 666 | p3, `p3-top.png` | “Timing and sequence for the treatment of femoral diaphyseal fractures in multiply injured patients:” | “Timing and sequence for the treatment of femoral diaphyseal fractures in multiply injured patients” | The heading’s final colon is omitted. |
| **Low** | 733 | p5, `p5-top.png` | “SUSPECTED PNEUMONIA” | “Suspected pneumonia” | Capitalization is normalized. |
| **Low** | 738 | p5, `p5-top.png` | “Decline in pulmonary status such as:” with separate subitems “worsening hypoxemia”, “ventilator compliance”, and “elevated inspiratory pressures” | “Decline in pulmonary status such as: worsening hypoxemia, ventilator compliance, elevated inspiratory pressures” | The subordinate list becomes a comma-separated sentence with the same examples. |
| **Low** | 745 | p5, `p5-top.png` | “ETT or Tracheostomy” → “Perform bronchoscopy w/ BAL or obtain QTL” | “ETT or tracheostomy → perform bronchoscopy with BAL or obtain QTL” | Two connected boxes become one string; “w/” is expanded and capitalization changes. |
| **Low** | 747 | p5, `p5-top.png` | “Adjust/De-escalate therapy per culture and sensitivity:” | “Adjust / de-escalate therapy per culture and sensitivity:” | Slash spacing and capitalization change. |
| **Low** | 750 | p5, `p5-top.png` | “≥ 10⁴ CFU/mL → narrow spectrum x 7 days (total)” | “≥ 10⁴ CFU/mL → narrow spectrum × 7 days (total)” | The letter “x” becomes a multiplication sign. |
| **Low** | 751 | p5, `p5-top.png` | “≤ 10⁴ CFU/mL, negative cultures, or oropharyngeal flora” followed by “stop antibiotic therapy” | “≤ 10⁴ CFU/mL, negative cultures, or oropharyngeal flora → stop antibiotic therapy” | An arrow is added to express the source’s instruction. |
| **Low** | 756 | p5, `p5-top.png` | “SUSPECTED CENTRAL LINE” | “Suspected central line” | Capitalization is normalized. |
| **Low** | 757 | p5, `p5-top.png` | “Central line >72h w/purulence at site” | “Central line >72 h with purulence at site?” | Spacing and abbreviation change, and a question mark is added. |
| **Low** | 760 | p5, `p5-top.png` | “Blood cultures should only be obtained when other potential sources have been ruled out” | “Blood cultures should only be obtained when other potential sources have been ruled out.” | A final period is added. |
| **Low** | 764 | p5, `p5-top.png` | “SUSPECTED UTI” | “Suspected UTI” | Capitalization is normalized. |
| **Low** | 765 | p5, `p5-top.png` | “For uncomplicated UTI, use AgileMD Pathway for diagnosis & antibiotic selection” | “For uncomplicated UTI, use AgileMD Pathway for diagnosis & antibiotic selection.” | A final period is added. |
| **Low** | 767 | p5, `p5-top.png` | “One of the following (unless signs of sepsis):” | “ONE of the following (unless signs of sepsis):” | Capitalization changes. |
| **Low** | 774 | p5, `p5-top.png` | “Spasticity or Autonomic dysreflexia” | “Spasticity or autonomic dysreflexia” | Capitalization changes. |
| **Low** | 778 | p5, `p5-top.png` | “No UA indicated; investigate other sources” | “NO → no UA indicated; investigate other sources” | The incoming NO branch is incorporated into the string, with capitalization normalized. |
| **Low** | 782 | p5, `p5-bottom.png` | “<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative -> discontinue antibiotics” | “<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics” | The ASCII arrow becomes a Unicode arrow; F3 separately addresses the missing incoming connection. |
| **Low** | 858 | p12, `p12-bottom.png` | “pneumonia.Annals of Pharmacotherapy” | “pneumonia. Annals of Pharmacotherapy” | A missing space in reference 10 is corrected without changing the citation. |

Spaces introduced inside structured dose tuples—such as “2g” becoming “2 g”—do not change dose values; the corresponding open-fracture `text` fields also retain the source wording.

**Short labels and aliases**

All 34 mappings below are app-authored. Some individual terms already occur elsewhere in the PDF, but the PDF does not provide these alias lists.

A **Medium** entry means a search term is broader than the printed indication or omits one of its qualifications. It does **not** establish a wrong rendered recommendation: that depends on whether the app keeps the complete indication visible and requires the clinician to distinguish it.

Source keys in this table:

- **T:** PDF p1, `p1-table-left.png` and `p1-table-right.png`.
- **E:** PDF p2, `p2-top-left.png` and `p2-top-right.png`.
- **EL:** PDF p2, `p2-full.png`, `p2-bottom-left.png`, and `p2-bottom-right.png`.
- **I:** PDF p2, `p2-bottom-left.png` and `p2-bottom-right.png`.

| Severity | Lines | PDF source and exact indication | Exact app short label and aliases | Assessment |
|---|---|---|---|---|
| **Medium** | 92–93 | T: “Abdominal Trauma with/or without Hollow Viscus Injury” | “Abdominal trauma ± hollow viscus injury”; `["abdominal injury", "hollow viscus", "bowel injury", "penetrating abdomen", "laparotomy"]` | The shortened label preserves the alternatives, but “laparotomy” does not itself establish abdominal trauma. |
| **Medium** | 107–108 | T: “Chest Tubes” | “Chest tubes”; `["tube thoracostomy", "thoracostomy", "pigtail", "hemothorax", "pneumothorax"]` | The list adds devices and diagnoses that are not themselves identical to the printed procedure. |
| **Medium** | 119–120 | T: “Craniotomy” | “Craniotomy”; `["crani", "neurosurgery"]` | “Neurosurgery” is broader than craniotomy. |
| **Medium** | 131–132 | T: “Open Skull Fracture” | “Open skull fracture”; `["depressed skull fracture", "skull fx"]` | The aliases do not preserve the source’s “Open” qualification. |
| **Medium** | 143–144 | T: “Penetrating Brain/CNS Injury” | “Penetrating brain / CNS injury”; `["GSW head", "penetrating head injury", "TBI"]` | “TBI” does not preserve the penetrating-injury qualification. |
| **Medium** | 155–156 | T: “Ventriculostomy or ICP Monitor” | “Ventriculostomy / ICP monitor”; `["EVD", "external ventricular drain", "bolt", "ICP"]` | “ICP” alone does not specify placement or presence of a monitor. |
| **Low** | 167–168 | T: “Pneumocephaly” | “Pneumocephaly”; `["pneumocephalus", "intracranial air"]` | These are added search terms; the source provides no alias mapping. |
| **Medium** | 179–180 | T: “CSF Leak” | “CSF leak”; `["rhinorrhea", "otorrhea", "basilar skull fracture"]` | These aliases do not themselves state that a CSF leak is present. |
| **Medium** | 191–192 | T: “Open Face Fracture/Mandible Fracture” | “Open facial / mandible fracture”; `["mandible", "facial fracture", "maxillofacial", "Le Fort", "open facial fracture"]` | Several aliases omit the distinction between this row and the separate closed/nonoperative fracture row. |
| **Medium** | 203–204 | T: “Closed or Non-operative Face Fracture” | “Closed / non-operative facial fracture”; `["orbital fracture", "nasal fracture", "zygoma", "closed facial fracture"]` | Several aliases do not establish closed or nonoperative status. |
| **Low** | 215–216 | T: “GU Trauma” | “GU trauma”; `["genitourinary", "bladder injury", "renal laceration", "kidney injury", "urethral injury"]` | The source provides no such search mapping; no conflicting qualification is apparent from the supplied text. |
| **Low** | 230–231 | T: “Vascular” | “Vascular”; `["vascular injury", "arterial injury", "vascular repair"]` | These are added contextual search terms under Trauma. |
| **Low** | 244–245 | E: “Appendicitis” | “Appendicitis”; `["appy", "appendectomy", "perforated appendix"]` | These are added search terms; the source duration cell itself discusses appendectomy and perforation. |
| **Medium** | 263–264 | E: “Diverticulitis with Source Control” | “Diverticulitis — with source control”; `["tics", "diverticular abscess drained", "sigmoid colectomy"]` | “Sigmoid colectomy” does not by itself establish diverticulitis as the indication. |
| **Medium** | 275–276 | E: “Diverticulitis without Source Control” | “Diverticulitis — without source control”; `["tics", "complicated diverticulitis", "diverticular abscess"]` | The aliases do not establish absence of source control. |
| **Medium** | 287–288 | E: “Cholecystitis” | “Cholecystitis”; `["chole", "gallbladder", "cholecystostomy", "PCT", "biliary"]` | “Gallbladder” and “biliary” are broader than the printed diagnosis; PCT does occur in this row’s source-control text. |
| **Medium** | 303–304 | E: “Small bowel Obstruction with Necrosis or Bowel Resection” | “SBO — with necrosis or bowel resection”; `["SBO", "small bowel obstruction", "ischemic bowel", "dead bowel", "bowel resection", "strangulated"]` | Generic SBO aliases do not distinguish this row from the separate row without necrosis or resection. |
| **Medium** | 315–316 | E: “Small bowel Obstruction without Necrosis or Bowel Resection” | “SBO — without necrosis or bowel resection”; `["SBO", "small bowel obstruction", "adhesiolysis", "lysis of adhesions"]` | The aliases do not establish the source’s “without” condition. |
| **Low** | 330–331 | E: “Nectrotizing Soft Tissue Infection” in the extraction | “Necrotizing soft tissue infection”; `["NSTI", "nec fasc", "necrotizing fasciitis", "Fournier", "gas gangrene", "myonecrosis"]` | These disease-name mappings are app-authored and are not established by the supplied source. |
| **Medium** | 346–347 | E: “Perforated Peptic Ulcer Disease” | “Perforated peptic ulcer”; `["PUD", "perforated ulcer", "perforated viscus", "free air", "duodenal ulcer", "gastric ulcer", "Graham patch"]` | Several aliases omit either perforation or the peptic-ulcer origin. |
| **Low** | 365–366 | EL: “Cholecystectomy” | “Cholecystectomy”; `["lap chole", "elective chole"]` | These are app-authored search terms under the source’s Elective Surgery section. |
| **Medium** | 377–378 | EL: “Inguinal Hernia” | “Inguinal hernia”; `["hernia repair", "herniorrhaphy"]` | The aliases do not preserve the inguinal location. |
| **Medium** | 389–390 | EL: “Ventral Hernia” | “Ventral hernia”; `["incisional hernia", "umbilical hernia", "hernia repair"]` | The generic “hernia repair” alias does not distinguish this from the inguinal row. |
| **Medium** | 401–402 | EL: “Colectomy” | “Colectomy”; `["colon resection", "hemicolectomy", "bowel prep"]` | “Bowel prep” describes a different action from the printed operation and could retrieve this regimen out of context. |
| **Low** | 416–417 | EL: “Colostomy/Ileostomy Reversal” | “Colostomy / ileostomy reversal”; `["ostomy takedown", "Hartmann reversal", "stoma reversal"]` | These are app-authored procedure mappings; no conflicting qualification is apparent in the packet. |
| **Low** | 431–432 | EL: “Cardiac & Thoracic” | “Cardiac & thoracic”; `["thoracotomy", "VATS", "sternotomy", "lobectomy"]` | The source does not enumerate these procedures within its broad category. |
| **Medium** | 443–444 | EL: “Skin & Soft Tissue” | “Skin & soft tissue”; `["SSTI procedure", "I&D", "soft tissue excision", "skin procedure"]` | The infection/procedure aliases do not preserve the source’s elective context by themselves. |
| **Medium** | 457–458 | I: “Hospital Acquired or Ventilator Associated Pneumonia (HAP/VAP)” | “HAP / VAP”; `["HAP", "VAP", "pneumonia", "ventilator", "nosocomial pneumonia"]` | “Pneumonia” and “ventilator” alone do not establish either printed diagnostic qualification. |
| **Medium** | 472–473 | I: “Bacteremia” | “Bacteremia”; `["positive blood culture", "sepsis", "line infection", "CLABSI", "bloodstream infection"]` | “Sepsis” and “line infection” are broader search concepts than the printed indication. |
| **Medium** | 492–493 | I: “Complicated Urinary Tract Infection/CAUTI/Urologic Instr” | “Complicated UTI / CAUTI / urologic instrumentation”; `["CAUTI", "complicated UTI", "catheter", "Foley", "urosepsis", "pyelonephritis", "instrumentation"]` | Device and procedure terms do not themselves establish an infection, and the short label repeats the inferred completion in F4. |
| **Medium** | 504–505 | I: “Uncomplicated Urinary Tract Infection” | “Uncomplicated UTI”; `["UTI", "cystitis", "simple UTI", "Bactrim"]` | Generic “UTI” and the drug-name alias do not preserve the uncomplicated qualification. |
| **Medium** | 516–517 | I: “Sinusitis” | “Sinusitis”; `["sinus", "nosocomial sinusitis", "NG tube sinusitis"]` | The source does not supply the added hospital-onset or NG-tube context. |
| **Medium** | 528–529 | I: “Cellulitis - Purulent (or MRSA risk factors)” | “Cellulitis — purulent / MRSA risk”; `["abscess", "MRSA", "purulent cellulitis", "SSTI", "skin infection"]` | Generic SSTI/skin-infection terms do not preserve the purulence-or-risk-factor distinction. |
| **Medium** | 540–541 | I: “Cellulitis - Non-Purulent” | “Cellulitis — non-purulent”; `["erysipelas", "simple cellulitis", "SSTI", "skin infection"]` | Generic SSTI/skin-infection terms do not establish nonpurulent cellulitis. |

Other app-authored labels are:

| Severity | Lines | PDF page/image and exact source wording | Exact app wording | Assessment |
|---|---|---|---|---|
| **Low** | 33 | p1, `p1-full.png`: “ACUTE CARE SURGERY MU HEALTH ANTIBIOTIC PRACTICE MANAGEMENT GUIDELINE” | “ACS Antibiotic PMG” | This is an app-created abbreviation. |
| **Low** | 34 | p1, `p1-full.png`: “Acute Care Surgery at the University of Missouri” and “MU HEALTH” | “Acute Care Surgery, University of Missouri Health Care” | This is an expanded institutional label, not a verbatim source phrase. |
| **Low** | 58 | p2, `p2-top-left.png`: “Emergency General Surgery” | “Diagnosis” | This row-heading label is supplied by the app. |
| **Low** | 66 | p2, `p2-full.png`: “Elective Surgery” | “Procedure” | This row-heading label is supplied by the app. |
| **Low** | 74 | p2, `p2-bottom-left.png`: “ICU & General Floor” | “Infection” | This row-heading label is supplied by the app. |

**Drug brands and classes**

The packet does not supply evidence sufficient to validate the brand/class pairings. Accordingly, these are **Low-severity provenance additions, not established pharmacologic errors**. Treating them as verified would go beyond the permitted sources.

| Lines | PDF page/image and exact drug text | Exact app-added metadata | Finding |
|---|---|---|---|
| 881 | p1, `p1-table-left.png`: “Cefazolin” | `brand: "Ancef", class: "1st-generation cephalosporin"` | Neither the brand mapping nor class is supplied by the PDF. |
| 882 | p1, `p1-table-left.png`: “Metronidazole” | `brand: "Flagyl", class: "Nitroimidazole"` | Neither the brand mapping nor class is supplied by the PDF. |
| 883 | p1, `p1-table-left.png`: “Ceftriaxone” | `brand: "Rocephin", class: "3rd-generation cephalosporin"` | Neither the brand mapping nor class is supplied by the PDF. |
| 884 | p1, `p1-table-left.png`: “Ampicillin-sulbactam” | `brand: "Unasyn", class: "Aminopenicillin + β-lactamase inhibitor"` | Neither the brand mapping nor class is supplied by the PDF. |
| 885 | p2, `p2-top-left.png`: “Piperacillin-tazobactam”; p1, `p1-table-right.png`: “consider monotherapy Zosyn” | `brand: "Zosyn", class: "Antipseudomonal penicillin + β-lactamase inhibitor"` | The brand word appears, but the PDF does not explicitly provide this generic/brand mapping or class. |
| 886 | p2, `p2-top-left.png`: “Linezolid” | `brand: "Zyvox", class: "Oxazolidinone"` | Neither the brand mapping nor class is supplied by the PDF. |
| 887 | p2, `p2-bottom-left.png`: “Vancomycin” | `brand: "Vancocin", class: "Glycopeptide"` | Neither the brand mapping nor class—including any formulation-specific applicability—is established by this packet. |
| 888 | p2, `p2-bottom-left.png`: “Sulfamethoxazole-TMP” | `brand: "Bactrim", class: "Sulfonamide + trimethoprim"` | Neither the brand mapping nor class is supplied by the PDF. |
| 889 | p4, `p4-top.png`: “Cefepime*” | `brand: "Maxipime", class: "4th-generation cephalosporin"` | Neither the brand mapping nor class is supplied by the PDF. |
| 890 | p1, `p1-table-right.png`: “Levofloxacin” | `brand: "Levaquin", class: "Fluoroquinolone"` | Neither the brand mapping nor class is supplied by the PDF. |
| 891 | p2, `p2-top-right.png`: “Ertapenem” | `brand: "Invanz", class: "Carbapenem"` | Neither the brand mapping nor class is supplied by the PDF. |
| 892 | p1, `p1-table-right.png`: “Clindamycin” | `brand: "Cleocin", class: "Lincosamide"` | Neither the brand mapping nor class is supplied by the PDF. |
| 893 | p2, `p2-top-right.png`: “micafungin” | `brand: "Mycamine", class: "Echinocandin"` | Neither the brand mapping nor class is supplied by the PDF. |

No specific incorrect pairing can be established **from this packet alone**. That is an unverified area, not a pass.

**Audit of every `transcription.flags` entry**

| Line | File wording being checked | Source evidence | Result |
|---|---|---|---|
| 915 | “the text gives Cefepime 2 g q8 hours with no age qualifier” and “pediatric Cefepime at Q12h (≥40 kg: 2 g IV Q12h)” | p3, `p3-bottom.png`: “Cefepime* 2g q8 hours”; p4, `p4-top.png`: “< 40 kg: 50 mg/kg/dose IV Q12h” and “≥ 40 kg: 2 g IV Q12h” | **Accurate source description.** Both pediatric weight bands are Q12h; the prose has no age qualifier. |
| 916 | “500 mg Q12H in the trauma and emergency general surgery tables, 500 mg IV Q8h in the open-fracture contamination regimen and the page 4 dosing table” | p1, `p1-table-left.png`; p2, `p2-top-left.png`; p4, `p4-top.png`: the respective dose/frequency pairs are printed as described | **Accurate.** |
| 917 | “24 hours OR 4 days after source control (consider monotherapy Zosyn)” and “the PDF does not say which applies when” | p1, `p1-table-right.png`: “24 hours OR 4 days after source control (consider monotherapy Zosyn)” | **Accurate.** The supplied cell does not assign the two alternatives to separate circumstances. |
| 918 | “≥ 10⁴ CFU/mL” versus “≤ 10⁴ CFU/mL”; “> 10 WBC” versus “< 10 WBC” | p5, `p5-top.png`: those four signs are shown | **Accurate threshold description.** The supplied extraction also lacks the flowchart text; the verification script’s capabilities cannot independently be tested here. |
| 919 | “< 60 kg” / “≥ 60 kg” “and so on” | p4, `p4-top.png`: `< 60` / `≥ 60`, `< 40` / `≥ 40`, `< 37.5` / `≥ 37.5` | **Accurate source signs.** The separate claim that a script compares them is not verifiable from the packet. |
| 920 | “Reference 9 … ‘1404–141’. Reproduced as printed.” | p12, `p12-bottom.png`: “Intensive Care Medicine, 46(7), 1404–141” | **Accurate.** No terminal digit or period is visible; the packet does not establish why the range is incomplete. |
| 921 | “Brand names and drug classes on the By-drug page are app-authored search aids; they are not in the PMG and are not checked by the script.” | p1, `p1-table-right.png`: “consider monotherapy Zosyn” | **Low-severity imprecision:** the metadata table is app-authored, but the blanket statement that its brand names are absent is literally too broad because “Zosyn” appears in the PDF; script behavior remains unverified. |
| 922 | “Pages 6–11 (antibiogram) are January–December 2024 data; the MUHC Antibiogram app has 2025 data, so they are linked rather than reproduced.” | Pages 6–11 are excluded; the user identifies them as a 2024 antibiogram | **Partially supported, otherwise unchecked.** The packet supports the 2024 characterization but contains no evidence of the linked app’s 2025 contents. |

The same external-data limitation applies to lines 802–811, particularly:

> “Current data (2025 isolates), searchable by organism, drug and unit.”

That is an app-authored claim; it cannot be confirmed against the supplied pages.

**Reference standards and citation checks**

All three printed reference-standard labels match:

| Lines | PDF p5, `p5-bottom.png`: exact label | Data URL | Check result |
|---|---|---|---|
| 788–789 | “NHSN Hospital Acquired Pneumonia & VAP” | `https://www.cdc.gov/nhsn/pdfs/pscmanual/6pscvapcurrent.pdf` | Label matches; hyperlink destination cannot be determined from the image or supplied extraction. |
| 792–793 | “NHSN Catheter Associated Urinary Tract Infection” | `https://www.cdc.gov/nhsn/pdfs/pscmanual/7psccauticurrent.pdf` | Label matches; hyperlink destination cannot be determined from the image or supplied extraction. |
| 796–797 | “NHSN Central Line Associated Blood Stream Infection” | `https://www.cdc.gov/clabsi/about/index.html` | Label matches; hyperlink destination cannot be determined from the image or supplied extraction. |

The assertion at lines 723–724 that these destinations were decoded from Bing tracking links cannot be independently checked: the packet does not include the PDF’s link annotations.

For **all 13 references**, I compared the supplied authors, year/date, title, journal or institution, volume, issue, page range, and any printed DOI/URL against lines 815–875. No substantive citation mismatch was found. Reference 10 has the space correction listed above. The unusual spellings and incomplete range—including “Eaterer,” “Schoreppel,” “Bery,” and “1404–141”—are retained rather than silently repaired.

**Coverage**

“Matched” below means the clinical or bibliographic content agrees, allowing the separately reported harmless spelling and formatting changes. It does not mean identical typography.

| PDF part | Items compared | Matched | Exceptions and limits |
|---|---:|---:|---|
| Trauma table | **12 indication rows**, including every regimen, duration, redose, alternative, name, and section assignment | **12 clinical rows** | Three declared redose spelling changes; the extra “t” in the extracted “transfustion” was not independently resolved visually. App labels/aliases and section wording are assessed separately. |
| Emergency General Surgery table | **8 indication rows**, all columns | **8 clinical rows** | Two “Ertapenum” corrections and the declared NSTI spelling correction; the extra letter in the latter was not independently resolved visually. |
| Elective Surgery table | **7 indication rows**, all columns | **7 clinical rows** | “Every 4 hour” becomes “Every 4 hours.” The source alternatives themselves match; the app’s “added” interpretation is separate. |
| ICU & General Floor table | **7 indication rows**, all columns | **7 regimens; 6 fully recoverable indication labels** | The complicated-UTI label is completed beyond the visible truncation; HAP/VAP spacing and the clipped pharmacy-dose word are corrected. |
| Open fractures, excluding dosing table | **20 content units:** 5 classifications; 2 timing/screening instructions; 4 antimicrobial instruction groups; 2 duration rules; 3 debridement heading/instruction units; 4 femoral-shaft heading/instruction units | **20** | Drug combinations, routes where printed, asterisks, pharmacy instructions, timing, durations, stability conditions, and operative timing all match substantively. |
| Adult/pediatric dosing table | **19 units:** 4 drug/asterisk entries, 4 adult regimens, 7 pediatric bands/regimens, 2 population headings, 2 footnotes | **19** | All doses, routes, frequencies, maxima, age qualification, weight boundaries, and comparison signs match. |
| Page-5 flowchart | **42 textual units:** 2 global; 16 pneumonia; 5 central-line; 19 UTI; connections traced separately | **39 textual units match clinically** | Two separately printed UTI bullets are merged, and the UA box gains “culture”; one incoming connection is not explicit in the data; the repeat-UA asterisk is omitted. Other typography changes are listed above. |
| Reference standards | **3 labels + 3 destination fields** | **3 labels** | All three hyperlink destinations are unverified because annotations are absent from the packet. |
| References | **13 complete entries** | **13 substantively** | Reference 10 gains a space; reference 9’s incomplete range is preserved. No external bibliographic validation was performed. |
| Introductory prose | **2 paragraphs** | **One sentence retained from paragraph 2** | Paragraph 1 and the final sentence of paragraph 2 are absent. |
| Declared corrections | **7 categories / 10 affected rows** | All applications accounted for | Four original typo instances are extraction-supported but visually unresolved; “Instrumentation” remains an inference. |
| Declared flags | **8 entries** | Source assertions assessed individually above | Brand-name absence is imprecise; external app contents and verifier behavior cannot be confirmed. |
| App-authored short labels and aliases | **34 short labels + 34 alias arrays** | All inventoried | Broad or qualification-dropping searches are identified individually; actual search/rendering behavior was not supplied. |
| App-authored drug metadata | **13 brand/class entries** | **0 independently validated from the packet** | The PDF does not provide the necessary brand/class reference information. |

Pages 6–11 were excluded as instructed. File hashes, verifier implementation, external website contents, and actual UI behavior were not checked.
---

## Dispositions

*(Written before the rulings below, which supersede it.)* Pending Thiago's decisions (2026-10-08). `src/data/pmg.js` was not changed in response to this
review. The page-5 findings F1, F2, F3 and F5 were re-read against the rendered page by Claude and
the PDF shows what Codex describes: "Unexplained" and "Hypotension" are separate bullets; the UA box
reads "Obtain Urinalysis with Reflexive"; the "<100,000 CFU/mL … discontinue antibiotics" box hangs
below "Start empiric antibiotics"; the repeat-UA box ends in an asterisk with no footnote on the page.


**Thiago's rulings (2026-10-08, v0.7.5).** F1: keep "Unexplained hypotension". F2: keep "culture". F3: "make > 10 WBC --> start empiric antibiotics and repeat UA if >2 squamous cells" (done; the "<100,000 CFU/mL" outcome is unchanged). F5: leave out the asterisk. A1, A2, A7: "look good". A3: "that assumption is correct". A4: "is correct". He then asked for the pending-verification notice to be removed (done) and the Indications intro shortened (done). The other Medium and Low findings (F5, Low, was ruled on) were not ruled on, and nothing else in `src/data/pmg.js` changed. See `docs/HISTORY.md`, v0.7.5.
