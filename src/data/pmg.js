// Acute Care Surgery MU Health — Antibiotic Surgical Prophylaxis and Empiric
// Treatment Practice Management Guideline (review date October 2026),
// transcribed for bedside use.
//
// EVERY VALUE IN THIS FILE IS CLINICAL CONTENT. It was transcribed from the
// source PDF (public/MU-ACS-Antibiotic-PMG-2026-10-<hash>.pdf) page by page,
// with the rendered page images open beside the extracted text. `npm run verify`
// (scripts/verify-pmg.mjs) re-reads the PDF and compares, cell by cell and in
// both directions, everything in it: page 1's title and introduction, the four
// indication tables (pages 2–4, including which section each row sits under and
// the column headers), the two dosing tables (pages 3–4), the re-dosing rules
// (page 3), the open-fracture page (page 5) and the 35 references (pages 6–8).
// It does not judge the `short` labels or `aliases`, and cannot tell whether
// the PDF itself is right. A physician still has to read the source.
//
// This edition replaced the December 2025 one on 2026-10-16 (v0.8.0). It is a
// different document, not an update of the same tables: the indication tables
// now name the drugs only, and the doses live in two dosing tables of their own.
// The app shows each drug's dose beside it on an indication row by looking it
// up in the table that matches the row's section (src/lib/dosing.js; Thiago,
// 2026-10-16), or in the empiric table for a drug the prophylaxis table does not
// list (Thiago, 2026-10-19), and says so where it does.
//
// Column semantics follow the PDF's own headers (each section's `columns`):
//   preferred    "Preferred Antibiotic(s)" / "Preferred Empiric Antibiotic(s)":
//                drug names, joined by "+" in the PDF.
//   alternative  "Alternative Antibiotic(s) if Allergy to Preferred": lines, each
//                optionally for one preferred drug ("Linezolid alternative: …"),
//                each a choice of combinations ("A or B").
//   duration     "Duration of Post-Operative Antibiotic(s)" / "Duration of
//                Antibiotic(s)": the printed lines.
//   null         the PDF prints "N/A" in that cell.

export const source = {
  title: "Acute Care Surgery MU Health Antibiotic Surgical Prophylaxis and Empiric Treatment Practice Management Guideline",
  shortTitle: "ACS Antibiotic PMG",
  publisher: "Acute Care Surgery, University of Missouri Health Care",
  // Every page's running header: "Review Date: October 2026".
  reviewDate: "October 2026",
  // The filename carries the first 12 hex digits of sha256, so a new edition of
  // the PDF is a new URL — nothing can serve a stale copy under a reused name.
  file: "MU-ACS-Antibiotic-PMG-2026-10-3c9cf8625cea.pdf",
  sha256: "3c9cf8625ceafb48cadbdc094233db36dc9182daeb8588406c3d3bfffb9305cc",
  pages: 8,
  // Page 1, the four paragraphs under the title.
  intro: [
    "Acute Care Surgery at the University of Missouri is committed to delivering safe, evidence-based, and cost-conscious care across the continuum of trauma, emergency general surgery, critical care, and elective surgical practice. As antimicrobial resistance and practice variation remain ongoing challenges, a unified antibiotic stewardship framework is essential to optimizing patient-centered outcomes and preserving the effectiveness of critical therapies.",
    "This Practice Management Guideline incorporates the principles of the MUHC Adult Surgical Antibiotic Prophylaxis Guidelines and provides diagnosis-specific recommendations informed by contemporary national guidance, specialty-specific literature, local microbiologic trends, and our institutional antibiogram. The Division of Acute Care Surgery has worked collaboratively with the institution’s Department of Infectious Diseases and Antimicrobial Stewardship Program to align these recommendations with hospital standards while accounting for the clinical nuances of trauma, emergency general surgery, and critically ill patients.",
    "Consistent with MUHC guidance, surgical antibiotic prophylaxis is one component of a broader strategy to prevent surgical site infection. Appropriate antimicrobial use must complement infection-prevention practices and perioperative optimization, with attention to the anticipated pathogens, patient-specific risks, and potential harms of therapy. This PMG distinguishes prophylaxis from treatment of established infection and recognizes that active infection, prior colonization, multidrug-resistant organisms, and other unique circumstances may warrant individualized management and consultation with Infectious Diseases or the Antimicrobial Stewardship Program.",
    "These recommendations apply to adult patients under the care of the Acute Care Surgery team. By establishing consistent expectations for antibiotic selection, timing, dosing, and duration, this PMG seeks to reduce unnecessary variation, promote judicious antimicrobial use, and align divisional practice with institutional recommendations while preserving sound clinical judgment. Our shared priority is safe, appropriate care directed toward meaningful, patient-centered outcomes.",
  ],
};

// `printedTitle` and `columns` are the PDF's own; the verifier finds each table
// by them. `kind` says which dosing table a row's doses come from. `title` and
// `blurb` are the app's.
const PROPHYLAXIS_COLUMNS = [
  "Preferred Antibiotic(s)",
  "Alternative Antibiotic(s) if Allergy to Preferred",
  "Duration of Post-Operative Antibiotic(s)",
];

export const sections = [
  {
    id: "trauma",
    title: "Trauma",
    printedTitle: "Trauma: Antibiotic Surgical Prophylaxis",
    kind: "prophylaxis",
    columns: ["Injury/Procedure", ...PROPHYLAXIS_COLUMNS],
    page: 2,
    hue: "trauma",
    blurb: "Surgical prophylaxis. Doses from the PMG's prophylaxis dosing table; one drug it does not list, from the empiric table.",
  },
  {
    id: "egs",
    title: "Emergency General Surgery",
    printedTitle: "Emergency General Surgery: Antibiotic Surgical Prophylaxis",
    kind: "prophylaxis",
    columns: ["Procedure", ...PROPHYLAXIS_COLUMNS],
    page: 2,
    hue: "egs",
    blurb: "Surgical prophylaxis. Doses from the PMG's prophylaxis dosing table; three drugs it does not list, from the empiric table.",
  },
  {
    id: "elective",
    title: "Elective Surgery",
    printedTitle: "Elective Surgery: Antibiotic Surgical Prophylaxis",
    kind: "prophylaxis",
    columns: ["Injury/Procedure", ...PROPHYLAXIS_COLUMNS],
    page: 3,
    hue: "elective",
    blurb: "Surgical prophylaxis. Doses from the PMG's prophylaxis dosing table.",
  },
  {
    id: "empiric",
    title: "Empiric Therapy",
    printedTitle: "Empiric Antimicrobial Therapy for Acute Infections",
    kind: "empiric",
    columns: [
      "Acute Infection",
      "Preferred Empiric Antibiotic(s)",
      "Alternative Antibiotic(s) if Allergy to Preferred",
      "Duration of Antibiotic(s)",
    ],
    page: 4,
    hue: "empiric",
    blurb: "Acute infections. Doses from the PMG's empiric dosing table.",
  },
];

// Durations several rows print word for word.
const CLOSURE_OR_72 = "24 hours after closure or 72 hours total, whichever is shortest";
const SOURCE_CONTROL = "4 days after source control or up to 8 days in critical illness";
const NSTI_DURATION = "48-72 hours after final debridement, clinical improvement, and fever has been absent";
const VARIABLE = "Variable based on organism and patient specific factors";

// One alternative line: a choice of combinations, optionally standing in for
// one preferred drug ("Linezolid alternative: Clindamycin + Vancomycin").
const alt = (...options) => ({ options });
const altFor = (drug, ...options) => ({ for: drug, options });
const LEVO_METRO = [alt(["Levofloxacin", "Metronidazole"])];
const NSTI_ALTERNATIVE = [
  altFor("Linezolid", ["Clindamycin", "Vancomycin"]),
  altFor("Piperacillin-tazobactam", ["Cefepime", "Metronidazole"]),
];

// An N/A row: the PDF prints N/A in every column.
const NA = { preferred: null, alternative: null, duration: null };

export const indications = [
  // ───────────────────── Trauma: surgical prophylaxis (page 2) ─────────────────────
  {
    id: "abdominal-trauma",
    section: "trauma",
    page: 2,
    name: "Abdominal Trauma with or without Hollow Viscus Injury",
    short: "Abdominal trauma ± hollow viscus injury",
    aliases: ["abdominal injury", "hollow viscus", "bowel injury", "penetrating abdomen", "laparotomy", "ex lap"],
    preferred: ["Cefazolin", "Metronidazole"],
    alternative: LEVO_METRO,
    duration: ["24 hours"],
  },
  {
    id: "chest-tube",
    section: "trauma",
    page: 2,
    name: "Chest Tube Placement",
    short: "Chest tube placement",
    aliases: ["chest tubes", "tube thoracostomy", "thoracostomy", "pigtail", "hemothorax", "pneumothorax"],
    ...NA,
  },
  {
    id: "craniotomy",
    section: "trauma",
    page: 2,
    name: "Craniotomy",
    short: "Craniotomy",
    aliases: ["crani", "neurosurgery"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Vancomycin"])],
    duration: ["24 hours"],
  },
  {
    id: "open-skull-fracture",
    section: "trauma",
    page: 2,
    name: "Open Skull Fracture",
    short: "Open skull fracture",
    aliases: ["depressed skull fracture", "skull fx"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Levofloxacin"])],
    duration: [CLOSURE_OR_72],
  },
  {
    id: "open-skull-fracture-contamination",
    section: "trauma",
    page: 2,
    name: "Open Skull Fracture with Significant Contamination",
    short: "Open skull fracture with significant contamination",
    aliases: ["contaminated skull fracture", "skull fx", "contaminated"],
    preferred: ["Cefazolin", "Metronidazole"],
    alternative: LEVO_METRO,
    duration: [CLOSURE_OR_72],
  },
  {
    id: "penetrating-brain-injury",
    section: "trauma",
    page: 2,
    name: "Penetrating Brain/CNS Injury",
    short: "Penetrating brain / CNS injury",
    aliases: ["GSW head", "penetrating head injury", "TBI"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Levofloxacin"])],
    duration: [CLOSURE_OR_72],
  },
  {
    id: "penetrating-brain-injury-contamination",
    section: "trauma",
    page: 2,
    name: "Penetrating Brain/CNS Injury with Significant Contamination",
    short: "Penetrating brain / CNS injury with significant contamination",
    aliases: ["GSW head", "penetrating head injury", "contaminated"],
    preferred: ["Ceftriaxone", "Metronidazole"],
    alternative: LEVO_METRO,
    duration: [CLOSURE_OR_72],
  },
  {
    id: "ventriculostomy",
    section: "trauma",
    page: 2,
    name: "Ventriculostomy or ICP Monitor",
    short: "Ventriculostomy or ICP monitor",
    aliases: ["EVD", "external ventricular drain", "bolt", "ICP"],
    ...NA,
  },
  {
    id: "pneumocephaly",
    section: "trauma",
    page: 2,
    name: "Pneumocephaly",
    short: "Pneumocephaly",
    aliases: ["pneumocephalus"],
    ...NA,
  },
  {
    id: "csf-leak",
    section: "trauma",
    page: 2,
    name: "CSF Leak",
    short: "CSF leak",
    aliases: ["otorrhea", "rhinorrhea", "basilar skull fracture"],
    ...NA,
  },
  {
    id: "open-face-fracture",
    section: "trauma",
    page: 2,
    name: "Open Face/Mandible Fracture",
    short: "Open face / mandible fracture",
    aliases: ["facial fracture", "jaw fracture", "open mandible", "maxillofacial"],
    preferred: ["Cefazolin", "Metronidazole"],
    alternative: [alt(["Doxycycline"])],
    duration: [CLOSURE_OR_72],
  },
  {
    id: "closed-face-fracture",
    section: "trauma",
    page: 2,
    name: "Closed or Non-Operative Face Fracture",
    short: "Closed / non-operative face fracture",
    aliases: ["facial fracture", "face fx", "nonoperative facial", "maxillofacial"],
    ...NA,
  },
  {
    id: "gu-trauma",
    section: "trauma",
    page: 2,
    name: "Genitourinary Trauma",
    short: "Genitourinary trauma",
    aliases: ["GU trauma", "kidney injury", "renal injury", "bladder injury"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Levofloxacin"])],
    duration: ["24 hours"],
  },
  {
    id: "vascular-trauma",
    section: "trauma",
    page: 2,
    name: "Vascular Trauma",
    short: "Vascular trauma",
    aliases: ["vascular injury", "vessel repair", "arterial injury"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Vancomycin"])],
    duration: ["24 hours"],
  },

  // ─────────────── Emergency General Surgery: surgical prophylaxis (page 2) ───────────────
  {
    id: "appendectomy",
    section: "egs",
    page: 2,
    name: "Appendectomy",
    short: "Appendectomy",
    aliases: ["appy", "appendicitis", "appendix", "perforated appendicitis"],
    preferred: ["Ceftriaxone", "Metronidazole"],
    alternative: LEVO_METRO,
    // The PDF prints the third line without its colon; the app adds it (Thiago,
    // 2026-10-19), a listed correction in transcription.corrections and the
    // verifier's CELL_CORRECTIONS.
    duration: ["Non-perforated: 24 hours", "Perforated with source control: 4 days", "Perforated without source control: 8 days"],
  },
  {
    id: "colectomy",
    section: "egs",
    page: 2,
    name: "Colectomy or Bowel Resection",
    short: "Colectomy or bowel resection",
    aliases: ["colon resection", "hemicolectomy", "Hartmann"],
    preferred: ["Cefazolin", "Metronidazole"],
    alternative: LEVO_METRO,
    duration: null,
  },
  {
    id: "sbo-necrosis",
    section: "egs",
    page: 2,
    name: "Small Bowel Obstruction with Necrosis or Bowel Resection",
    short: "SBO with necrosis or bowel resection",
    aliases: ["bowel obstruction", "strangulated", "ischemic bowel", "dead bowel"],
    preferred: ["Piperacillin-tazobactam"],
    alternative: LEVO_METRO,
    duration: [SOURCE_CONTROL],
  },
  {
    id: "sbo-no-necrosis",
    section: "egs",
    page: 2,
    name: "Small Bowel Obstruction without Necrosis or Bowel Resection",
    short: "SBO without necrosis or bowel resection",
    aliases: ["bowel obstruction", "adhesive SBO", "lysis of adhesions", "LOA"],
    preferred: ["Cefazolin", "Metronidazole"],
    alternative: LEVO_METRO,
    duration: ["24 hours"],
  },
  {
    id: "perforated-pud",
    section: "egs",
    page: 2,
    name: "Perforated Peptic Ulcer Disease Patch Repair",
    short: "Perforated peptic ulcer disease — patch repair",
    aliases: ["perforated ulcer", "PUD", "Graham patch", "perf ulcer"],
    preferred: ["Piperacillin-tazobactam"],
    alternative: LEVO_METRO,
    duration: [SOURCE_CONTROL],
  },
  {
    id: "nsti-debridement",
    section: "egs",
    page: 2,
    name: "Necrotizing Soft Tissue Infection Debridement",
    short: "Necrotizing soft tissue infection — debridement",
    aliases: ["nec fasc", "necrotizing fasciitis", "NSTI", "Fournier"],
    preferred: ["Linezolid", "Piperacillin-tazobactam"],
    alternative: NSTI_ALTERNATIVE,
    duration: [NSTI_DURATION],
  },

  // ───────────────────── Elective Surgery: surgical prophylaxis (page 3) ─────────────────────
  {
    id: "cholecystectomy",
    section: "elective",
    page: 3,
    name: "Cholecystectomy",
    short: "Cholecystectomy",
    aliases: ["lap chole", "gallbladder"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Vancomycin"])],
    duration: null,
  },
  {
    id: "inguinal-hernia",
    section: "elective",
    page: 3,
    name: "Inguinal Hernia",
    short: "Inguinal hernia",
    aliases: ["hernia repair", "IHR", "groin hernia"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Vancomycin"])],
    duration: null,
  },
  {
    id: "ventral-hernia",
    section: "elective",
    page: 3,
    name: "Ventral Hernia",
    short: "Ventral hernia",
    aliases: ["hernia repair", "incisional hernia", "VHR"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Vancomycin"])],
    duration: null,
  },
  {
    id: "ostomy-reversal",
    section: "elective",
    page: 3,
    name: "Colostomy/Ileostomy Reversal",
    short: "Colostomy / ileostomy reversal",
    aliases: ["ostomy takedown", "stoma reversal", "colostomy takedown", "ileostomy takedown"],
    preferred: ["Cefazolin", "Metronidazole"],
    alternative: [alt(["Vancomycin", "Metronidazole"])],
    duration: null,
  },
  {
    id: "cardiac-thoracic",
    section: "elective",
    page: 3,
    name: "Cardiac & Thoracic",
    short: "Cardiac & thoracic",
    aliases: ["thoracotomy", "VATS", "sternotomy", "cardiothoracic"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Vancomycin"])],
    duration: null,
  },
  {
    id: "skin-soft-tissue",
    section: "elective",
    page: 3,
    name: "Skin & Soft Tissue",
    short: "Skin & soft tissue",
    aliases: ["soft tissue excision", "skin procedure", "excision"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Vancomycin"])],
    duration: null,
  },

  // ─────────────── Empiric antimicrobial therapy for acute infections (page 4) ───────────────
  {
    id: "cap",
    section: "empiric",
    page: 4,
    name: "Community Acquired Pneumonia (CAP)",
    short: "Community acquired pneumonia (CAP)",
    aliases: ["pneumonia", "community pneumonia"],
    preferred: ["Amoxicillin-clavulanate", "Azithromycin"],
    alternative: [altFor("Amoxicillin-clavulanate", ["Ceftriaxone"]), altFor("Azithromycin", ["Doxycycline"])],
    duration: ["5 days", "Azithromycin: 3 days"],
  },
  {
    id: "hap-vap",
    section: "empiric",
    page: 4,
    name: "Hospital Acquired or Ventilator Associated Pneumonia (HAP/VAP)",
    short: "HAP / VAP",
    aliases: ["pneumonia", "ventilator", "nosocomial pneumonia", "hospital pneumonia"],
    preferred: ["Vancomycin", "Piperacillin-tazobactam"],
    alternative: [altFor("Vancomycin", ["Linezolid"]), altFor("Piperacillin-tazobactam", ["Cefepime"])],
    duration: ["7 days"],
  },
  {
    id: "diverticulitis-source-control",
    section: "empiric",
    page: 4,
    name: "Diverticulitis with Source Control",
    short: "Diverticulitis with source control",
    aliases: ["perforated diverticulitis", "diverticular abscess"],
    preferred: ["Piperacillin-tazobactam"],
    alternative: LEVO_METRO,
    duration: [SOURCE_CONTROL],
  },
  {
    id: "diverticulitis-no-source-control",
    section: "empiric",
    page: 4,
    name: "Diverticulitis without Source Control",
    short: "Diverticulitis without source control",
    aliases: ["diverticular abscess"],
    preferred: ["Piperacillin-tazobactam"],
    alternative: LEVO_METRO,
    duration: ["8 days"],
  },
  {
    id: "cholecystitis",
    section: "empiric",
    page: 4,
    name: "Cholecystitis",
    short: "Cholecystitis",
    aliases: ["gallbladder", "acute cholecystitis", "PCT", "cholecystostomy", "chole"],
    preferred: ["Piperacillin-tazobactam"],
    alternative: LEVO_METRO,
    duration: [
      "Post-Cholecystectomy with local inflammation: 24 hours",
      "Perforated with source control (includes PCT): 4 days",
      "Perforated without source control: 8 days",
    ],
  },
  {
    id: "bacteremia-gram-positive",
    section: "empiric",
    page: 4,
    name: "Bacteremia (Gram Positive Organism)",
    short: "Bacteremia (gram positive organism)",
    aliases: ["positive blood culture", "GPC", "gram-positive", "bloodstream infection"],
    preferred: ["Vancomycin"],
    alternative: [alt(["Linezolid"])],
    duration: [VARIABLE],
  },
  {
    id: "bacteremia-gram-negative",
    section: "empiric",
    page: 4,
    name: "Bacteremia (Gram Negative Organism)",
    short: "Bacteremia (gram negative organism)",
    aliases: ["positive blood culture", "GNR", "gram-negative", "bloodstream infection"],
    preferred: ["Piperacillin-tazobactam"],
    alternative: [alt(["Cefepime"])],
    duration: [VARIABLE],
  },
  {
    id: "fungemia",
    section: "empiric",
    page: 4,
    name: "Fungemia",
    short: "Fungemia",
    aliases: ["candidemia", "candida", "yeast", "fungal", "positive blood culture"],
    preferred: ["Micafungin"],
    alternative: null,
    duration: [VARIABLE],
  },
  {
    id: "complicated-uti",
    section: "empiric",
    page: 4,
    name: "Complicated Urinary Tract Infection (Pyelonephritis)",
    short: "Complicated UTI (pyelonephritis)",
    aliases: ["pyelo", "complicated UTI", "upper UTI", "urosepsis"],
    preferred: ["Ceftriaxone"],
    alternative: [alt(["Sulfamethoxazole-trimethoprim"], ["Ciprofloxacin"])],
    duration: ["7 days"],
  },
  {
    id: "uncomplicated-uti",
    section: "empiric",
    page: 4,
    name: "Uncomplicated Urinary Tract Infection (Cystitis)",
    short: "Uncomplicated UTI (cystitis)",
    aliases: ["UTI", "simple UTI", "bladder infection"],
    preferred: ["Nitrofurantoin"],
    alternative: [alt(["Sulfamethoxazole-trimethoprim"], ["Fosfomycin"])],
    duration: ["Females: 3 days", "Males: 5 days"],
  },
  {
    id: "sinusitis",
    section: "empiric",
    page: 4,
    name: "Sinusitis",
    short: "Sinusitis",
    aliases: ["sinus", "nosocomial sinusitis"],
    preferred: ["Ampicillin-sulbactam"],
    alternative: LEVO_METRO,
    duration: ["5 days"],
  },
  {
    id: "cellulitis-purulent",
    section: "empiric",
    page: 4,
    name: "Cellulitis - Purulent (or MRSA risk factors)",
    short: "Cellulitis — purulent (or MRSA risk factors)",
    aliases: ["abscess", "MRSA", "purulent cellulitis", "SSTI", "skin infection"],
    preferred: ["Vancomycin"],
    alternative: [alt(["Doxycycline"], ["Sulfamethoxazole-trimethoprim"])],
    duration: ["5-10 days"],
  },
  {
    id: "cellulitis-nonpurulent",
    section: "empiric",
    page: 4,
    name: "Cellulitis - Non-Purulent",
    short: "Cellulitis — non-purulent",
    aliases: ["erysipelas", "simple cellulitis", "SSTI", "skin infection"],
    preferred: ["Cefazolin"],
    alternative: [alt(["Cephalexin"], ["Sulfamethoxazole-trimethoprim"])],
    duration: ["5 days"],
  },
  {
    id: "nsti",
    section: "empiric",
    page: 4,
    name: "Necrotizing Soft Tissue Infection",
    short: "Necrotizing soft tissue infection",
    aliases: ["nec fasc", "necrotizing fasciitis", "NSTI", "Fournier"],
    preferred: ["Linezolid", "Piperacillin-tazobactam"],
    alternative: NSTI_ALTERNATIVE,
    duration: [NSTI_DURATION],
  },
];

// ─────────────── Dosing and redosing for surgical prophylaxis (page 3) ───────────────
// The PDF prints Cefazolin's "≥" as an underlined ">"; the verifier reads the
// underline (scripts/verify-pmg.mjs, readPdf).
export const prophylaxisDosing = {
  page: 3,
  title: "Dosing and Redosing of Intravenous Antibiotics for Surgical Prophylaxis",
  columns: {
    drug: "Antibiotic",
    dose: "Dose",
    redose: "Redosing Interval for OR Only (hours)",
    infusion: "Infusion Time for OR Only (min)",
  },
  rows: [
    { drug: "Ampicillin-sulbactam", dose: ["3 g"], redose: "2", infusion: "30" },
    { drug: "Cefazolin", dose: ["2 g if < 120 kg,", "3 g if ≥ 120 kg"], redose: "3", infusion: "IV push 3-5" },
    { drug: "Ceftriaxone", dose: ["2 g"], redose: "12", infusion: "IV push 4-5" },
    { drug: "Ciprofloxacin", dose: ["400 mg"], redose: "8", infusion: "60" },
    { drug: "Levofloxacin", dose: ["750 mg"], redose: "Not recommended", infusion: "90" },
    { drug: "Metronidazole", dose: ["500 mg"], redose: "8", infusion: "30" },
    { drug: "Piperacillin-tazobactam", dose: ["4.5 g"], redose: "2", infusion: "30" },
    { drug: "Vancomycin", dose: ["15-20 mg/kg"], redose: "Not recommended", infusion: "60 min per 1000 mg" },
  ],
};

// The two headed lists printed left of the prophylaxis dosing table (page 3).
export const redosingRules = [
  {
    heading: "Intra-operative re-dosing",
    items: [
      "Re-dosing of antibiotic intra-operatively is indicated if the duration of surgery exceeds 2 half-lives of the antibiotic or for every 1,500 mL (or >25ml/kg or > 30% blood volume loss for patients < 40kg) of blood loss (regardless of the agent used)",
      "For prolonged surgeries, re-dose the antibiotic(s) at the indicated redosing interval",
    ],
  },
  {
    heading: "For patients already receiving antibiotic treatment before surgery",
    items: [
      "If treatment antibiotic is the SAME as the preferred antibiotic for surgical prophylaxis, re-dose antibiotic prior to incision if time since last dose exceeds intraoperative re-dosing interval listed",
      "If the treatment antibiotic is DIFFERENT from the preferred antibiotic for surgical prophylaxis, then administer the preferred pre-operative antibiotic as listed for the procedure, within the appropriate administration window",
    ],
  },
];

// ─────────────── Dosing and frequency of empiric antimicrobials (page 4) ───────────────
// Printed as two halves side by side; listed here in the PDF's order, the left
// half top to bottom, then the right.
export const empiricDosing = {
  page: 4,
  title: "Dosing and Frequency of Empiric Antimicrobials for Acute Infections",
  columns: { drug: "Antibiotic", dose: "Dose", route: "Route", frequency: "Frequency" },
  rows: [
    { drug: "Amoxicillin-clavulanate", dose: "875 mg / 125 mg", route: "PO/per tube", frequency: "Q12H" },
    { drug: "Ampicillin-sulbactam", dose: "3 g", route: "IV", frequency: "Q6H" },
    { drug: "Azithromycin", dose: "500 mg", route: "IV or PO/per tube", frequency: "Q24H" },
    { drug: "Cefazolin", dose: "2 g", route: "IV", frequency: "Q8H" },
    { drug: "Cefepime", dose: "2 g", route: "IV", frequency: "Q8H" },
    { drug: "Ceftriaxone", dose: "2 g", route: "IV", frequency: "Q24H" },
    { drug: "Cephalexin", dose: "500 mg", route: "PO/per tube", frequency: "Q6H" },
    { drug: "Ciprofloxacin", dose: "400 mg (IV), 500 mg (PO)", route: "IV or PO/per tube", frequency: "Q12H" },
    { drug: "Clindamycin", dose: "900 mg", route: "IV", frequency: "Q8H" },
    { drug: "Doxycycline", dose: "100 mg", route: "IV or PO/per tube", frequency: "Q12H" },
    { drug: "Fosfomycin", dose: "3 g", route: "PO/per tube", frequency: "Once" },
    { drug: "Levofloxacin", dose: "750 mg", route: "IV or PO/per tube", frequency: "Q24H" },
    { drug: "Linezolid", dose: "600 mg", route: "IV or PO/per tube", frequency: "Q12H" },
    { drug: "Metronidazole", dose: "500 mg", route: "IV or PO/per tube", frequency: "Q8H or Q12H" },
    { drug: "Micafungin", dose: "100 mg", route: "IV", frequency: "Q24H" },
    { drug: "Nitrofurantoin", dose: "100 mg", route: "PO/per tube", frequency: "Q12H" },
    { drug: "Piperacillin-tazobactam", dose: "4.5 g", route: "IV", frequency: "Q8H" },
    { drug: "Sulfamethoxazole-trimethoprim", dose: "800 mg / 160 mg", route: "PO/per tube", frequency: "Q12H" },
    { drug: "Vancomycin", dose: "Pharmacy to dose", route: "IV", frequency: "Pharmacy to dose" },
  ],
  footnote:
    "The antimicrobial dosing and frequencies listed above is standard dosing for adult patients with normal renal function; Dose adjustments may be necessary in specific patient scenarios",
};

// ─────────────────── Musculoskeletal open extremity fractures (page 5) ───────────────────
// Each regimen's `text` is the PDF's bullet as printed (after the label and its
// dash); `regimen` is the same content split for display. The PDF prints no
// route in these bullets; every entry carries "IV" (Thiago, 2026-10-16: "They
// are all IV"), listed in transcription.corrections. The verifier requires the
// regimen, route set aside, to re-state `text` exactly, and tests/pmg.test.js
// pins the route. Each "If penicillin allergy" sub-bullet is the `allergy` of
// the bullet it is printed under, as the PDF nests it.
export const openFractures = {
  title: "Musculoskeletal Open Extremity Fractures",
  page: 5,
  classification: {
    heading: "Open Extremity Fracture Classification",
    columns: ["Gustilo-Anderson Classification", "Open Fracture Description"],
    types: [
      {
        type: "Type I",
        description: "Open fracture with a wound < 1 cm long, low energy, without gross contamination",
      },
      {
        type: "Type II",
        description:
          "Open fracture with a wound 1-10 cm long, low energy, without gross contamination or extensive soft-tissue damage, flaps, or avulsions",
      },
      {
        type: "Type III",
        subtypes: [
          {
            code: "IIIA",
            description:
              "Open fracture with a wound greater than 10 cm with adequate soft-tissue coverage, or any open fracture due to high-energy trauma or with gross contamination, regardless of the size of the wound",
          },
          {
            code: "IIIB",
            description:
              "Open fracture with extensive soft-tissue injury or loss, with periosteal stripping and bone exposure that requires soft-tissue coverage in the form of muscle rotation or transfer",
          },
          {
            code: "IIIC",
            description: "Open fracture associated with arterial injury requiring repair",
          },
        ],
      },
    ],
  },
  timing: "Administer within 30 min of arrival to the ED & all patients to have MRSA nasal screen",
  selection: [
    {
      id: "type-1-2",
      applies: "Type I & Type II Fractures",
      text: "Cefazolin 2 g Q8H",
      regimen: [{ drug: "Cefazolin", dose: "2 g", route: "IV", frequency: "Q8H" }],
      allergy: {
        applies: "If penicillin allergy",
        text: "Vancomycin: pharmacy to dose",
        regimen: [{ drug: "Vancomycin", route: "IV", note: "pharmacy to dose" }],
      },
    },
    {
      id: "type-3",
      applies: "Type III Fractures",
      text: "Ceftriaxone 2 g Q24H + Vancomycin: pharmacy to dose",
      regimen: [
        { drug: "Ceftriaxone", dose: "2 g", route: "IV", frequency: "Q24H" },
        { drug: "Vancomycin", route: "IV", note: "pharmacy to dose" },
      ],
      allergy: {
        applies: "If penicillin allergy",
        text: "Levofloxacin 500 mg Q24H",
        regimen: [{ drug: "Levofloxacin", dose: "500 mg", route: "IV", frequency: "Q24H" }],
      },
    },
  ],
  contamination: {
    heading: "Open Fracture Contamination",
    scope: "Applies to type I, II, & III fractures",
    items: [
      {
        id: "contamination",
        applies: "Soil, fecal matter, standing water contamination",
        text: "Cefepime 2 g Q8H + Metronidazole 500 mg Q12H + Vancomycin: pharmacy to dose",
        regimen: [
          { drug: "Cefepime", dose: "2 g", route: "IV", frequency: "Q8H" },
          { drug: "Metronidazole", dose: "500 mg", route: "IV", frequency: "Q12H" },
          { drug: "Vancomycin", route: "IV", note: "pharmacy to dose" },
        ],
        allergy: {
          applies: "If penicillin allergy",
          text: "Levofloxacin 500 mg Q24H + Metronidazole 500 mg Q12H",
          regimen: [
            { drug: "Levofloxacin", dose: "500 mg", route: "IV", frequency: "Q24H" },
            { drug: "Metronidazole", dose: "500 mg", route: "IV", frequency: "Q12H" },
          ],
        },
      },
    ],
  },
  duration: [
    { applies: "Type I & Type II Fractures", value: "24 hours total" },
    { applies: "Type III Fractures", value: "24 hours after closure or 72 hours total, whichever duration is shorter" },
  ],
};

// Pages 6–8, under the heading "Reference". `page` is where each entry starts.
export const references = [
  {
    n: 1,
    page: 6,
    text: "Anderson, P. A., Savage, J. W., Vaccaro, A. R., Radcliff, K., Arnold, P. M., Lawrence, B. D., & Shamji, M. F. (2017). Prevention of surgical site infection in spine surgery. Neurosurgery, 80(3S), S114–S123.",
    url: "https://doi.org/10.1093/neuros/nyw066",
  },
  {
    n: 2,
    page: 6,
    text: "Appelbaum, R. D., Farrell, M. S., Gelbard, R. B., Hoth, J. J., Jawa, R. S., Kirsch, J. M., Mandell, S., Nohra, E. A., Rinderknecht, T., Rowell, S., Cuschieri, J., & Stein, D. M. (2024). Antibiotic prophylaxis in injury: An American Association for the Surgery of Trauma Critical Care Committee clinical consensus document. Trauma Surgery & Acute Care Open, 9(1), Article e001304.",
    url: "https://doi.org/10.1136/tsaco-2023-001304",
  },
  {
    n: 3,
    page: 6,
    text: "Ban, K. A., Minei, J. P., Laronga, C., Harbrecht, B. G., Jensen, E. H., Fry, D. E., Itani, K. M. F., Dellinger, E. P., Ko, C. Y., & Duane, T. M. (2017). American College of Surgeons and Surgical Infection Society: Surgical site infection guidelines, 2016 update. Journal of the American College of Surgeons, 224(1), 59–74.",
    url: "https://doi.org/10.1016/j.jamcollsurg.2016.10.029",
  },
  {
    n: 4,
    page: 6,
    text: "Berríos-Torres, S. I., Umscheid, C. A., Bratzler, D. W., Leas, B., Stone, E. C., Kelz, R. R., Reinke, C. E., Morgan, S., Solomkin, J. S., Mazuski, J. E., Dellinger, E. P., Itani, K. M. F., Berbari, E. F., Segreti, J., Parvizi, J., Blanchard, J., Allen, G., Kluytmans, J. A. J. W., Donlan, R., & Schecter, W. P. (2017). Centers for Disease Control and Prevention guideline for the prevention of surgical site infection, 2017. JAMA Surgery, 152(8), 784–791.",
    url: "https://doi.org/10.1001/jamasurg.2017.0904",
  },
  {
    n: 5,
    page: 6,
    text: "Branch-Elliman, W., O’Brien, W., Strymish, J., Itani, K., Wyatt, C., & Gupta, K. (2019). Association of duration and type of surgical prophylaxis with antimicrobial-associated adverse events. JAMA Surgery, 154(7), 590–598.",
    url: "https://doi.org/10.1001/jamasurg.2019.0569",
  },
  {
    n: 6,
    page: 6,
    text: "Bratzler, D. W., Dellinger, E. P., Olsen, K. M., Perl, T. M., Auwaerter, P. G., Bolon, M. K., Fish, D. N., Napolitano, L. M., Sawyer, R. G., Slain, D., Steinberg, J. P., & Weinstein, R. A. (2013). Clinical practice guidelines for antimicrobial prophylaxis in surgery. American Journal of Health-System Pharmacy, 70(3), 195–283.",
    url: "https://doi.org/10.2146/ajhp120568",
  },
  {
    n: 7,
    page: 6,
    text: "Bultas, A. C., Bery, A. I., Deal, E. N., Hartmann, A. P., Richter, S. K., & Call, W. B. (2019). Predictors of treatment failure following de-escalation to a fluoroquinolone in culture-negative nosocomial pneumonia. Annals of Pharmacotherapy, 53(12), 1207–1213.",
    url: "https://doi.org/10.1177/1060028019867114",
  },
  {
    n: 8,
    page: 6,
    text: "Chauv, S., Fontaine, G. V., Hoang, Q. P., McKinney, C. B., Baldwin, M., Buckel, W. R., Collingridge, D. S., Majercik, S., & Wohlt, P. D. (2016). Risk of resistant organisms and Clostridium difficile with prolonged systemic antibiotic prophylaxis for central nervous system devices. Neurocritical Care, 25(1), 128–132.",
    url: "https://doi.org/10.1007/s12028-016-0254-x",
  },
  {
    n: 9,
    page: 6,
    text: "Coccolini, F., Sartelli, M., Sawyer, R., Rasa, K., Ceresoli, M., Viaggi, B., Catena, F., Damaskos, D., Cicuttin, E., Cremonini, C., Moore, E. E., Biffl, W. L., & Coimbra, R. (2024). Antibiotic prophylaxis in trauma: Global Alliance for Infection in Surgery, Surgical Infection Society Europe, World Surgical Infection Society, American Association for the Surgery of Trauma, and World Society of Emergency Surgery guidelines. Journal of Trauma and Acute Care Surgery, 96(4), 674–682.",
    url: "https://doi.org/10.1097/TA.0000000000004233",
  },
  {
    n: 10,
    page: 6,
    text: "Corsini Campioli, C., Challener, D., Comba, I. Y., Shah, A., Wilson, W. R., Sohail, M. R., Van Gompel, J. J., & O’Horo, J. C. (2022). Overview and risk factors for postcraniotomy surgical site infection: A four-year experience. Antimicrobial Stewardship & Healthcare Epidemiology, 2(1), Article e14.",
    url: "https://doi.org/10.1017/ash.2021.258",
  },
  {
    n: 11,
    page: 6,
    text: "De Bus, L., Depuydt, P., Steen, J., Dhaese, S., De Smet, K., Tabah, A., Akova, M., Cotta, M. O., De Pascale, G., Dimopoulos, G., Fujitani, S., Garnacho-Montero, J., Leone, M., Lipman, J., Ostermann, M., Paiva, J.-A., Schouten, J., Sjövall, F., Timsit, J.-F., . . . De Waele, J. J. (2020). Antimicrobial de-escalation in the critically ill patient and assessment of clinical cure: The DIANA study. Intensive Care Medicine, 46(7), 1404–1417.",
    url: "https://doi.org/10.1007/s00134-020-06111-5",
  },
  {
    n: 12,
    page: 7,
    text: "Fagon, J.-Y., Chastre, J., Wolff, M., Gervais, C., Parer-Aubas, S., Stéphan, F., Similowski, T., Mercat, A., Diehl, J.-L., Sollet, J.-P., & Tenaillon, A. (2000). Invasive and noninvasive strategies for management of suspected ventilator-associated pneumonia: A randomized trial. Annals of Internal Medicine, 132(8), 621–630.",
    url: "https://doi.org/10.7326/0003-4819-132-8-200004180-00004",
  },
  {
    n: 13,
    page: 7,
    text: "Farrell, M. S., Agapian, J. V., Appelbaum, R. D., Filiberto, D. M., Gelbard, R., Hoth, J., Jawa, R., Kirsch, J., Kutcher, M. E., Nohra, E., Pathak, A., Paul, J., Robinson, B., Cuschieri, J., & Stein, D. M. (2024). Surgical and procedural antibiotic prophylaxis in the surgical ICU: An American Association for the Surgery of Trauma Critical Care Committee clinical consensus document. Trauma Surgery & Acute Care Open, 9(1), Article e001305.",
    url: "https://doi.org/10.1136/tsaco-2023-001305",
  },
  {
    n: 14,
    page: 7,
    text: "Fried, H. I., Nathan, B. R., Rowe, A. S., Zabramski, J. M., Andaluz, N., Bhimraj, A., Guanci, M. M., Seder, D. B., & Singh, J. M. (2016). The insertion and management of external ventricular drains: An evidence-based consensus statement: A statement for healthcare professionals from the Neurocritical Care Society. Neurocritical Care, 24(1), 61–81.",
    url: "https://doi.org/10.1007/s12028-015-0224-8",
  },
  {
    n: 15,
    page: 7,
    text: "Guidry, C. A., Mallicote, M. U., Petroze, R. T., Hranjec, T., Rosenberger, L. H., Davies, S. W., & Sawyer, R. G. (2014). Influence of bronchoscopy on the diagnosis of and outcomes from ventilator-associated pneumonia. Surgical Infections, 15(5), 527–532.",
    url: "https://doi.org/10.1089/sur.2013.142",
  },
  {
    n: 16,
    page: 7,
    text: "Gupta, S., Heman-Ackah, S. E., & Lalwani, A. K. (2012). Are prophylactic antibiotics necessary for otologic surgery? The Laryngoscope, 122(6), 1183–1184.",
    url: "https://doi.org/10.1002/lary.23302",
  },
  {
    n: 17,
    page: 7,
    text: "Hospenthal, D. R., Murray, C. K., Andersen, R. C., Bell, R. B., Calhoun, J. H., Cancio, L. C., Cho, J. M., Chung, K. K., Clasper, J. C., Colyer, M. H., Conger, N. G., Costanzo, G. P., Crouch, H. K., Curry, T. K., D’Avignon, L. C., Dorlac, W. C., Dunne, J. R., Eastridge, B. J., Ficke, J. R., . . . Wortmann, G. W. (2011). Guidelines for the prevention of infections associated with combat-related injuries: 2011 update: Endorsed by the Infectious Diseases Society of America and the Surgical Infection Society. The Journal of Trauma: Injury, Infection, and Critical Care, 71(2 Suppl. 2), S210–S234.",
    url: "https://doi.org/10.1097/TA.0b013e318227ac4b",
  },
  {
    n: 18,
    page: 7,
    text: "Jones, B. E., Ramirez, J. A., Oren, E., Soni, N. J., Sullivan, L. R., Restrepo, M. I., Musher, D. M., Erstad, B. L., Pickens, C., Vaughn, V. M., Helgeson, S. A., Crothers, K., Metlay, J. P., Bissell Turpin, B. D., Cao, B., Chalmers, J. D., Dela Cruz, C. S., Gendlina, I., Hojat, L. S., . . . Wilson, K. (2026). Diagnosis and management of community-acquired pneumonia: An official American Thoracic Society clinical practice guideline. American Journal of Respiratory and Critical Care Medicine, 212(1), 24–44.",
    url: "https://doi.org/10.1164/rccm.202507-1692ST",
  },
  {
    n: 19,
    page: 7,
    text: "Joung, M. K., Lee, J.-a., Moon, S.-y., Cheong, H. S., Joo, E.-J., Ha, Y.-E., Sohn, K. M., Chung, S. M., Suh, G. Y., Chung, D. R., Song, J.-H., & Peck, K. R. (2011). Impact of de-escalation therapy on clinical outcomes for intensive care unit-acquired pneumonia. Critical Care, 15(2), Article R79.",
    url: "https://doi.org/10.1186/cc10072",
  },
  {
    n: 20,
    page: 7,
    text: "Kalil, A. C., Metersky, M. L., Klompas, M., Muscedere, J., Sweeney, D. A., Palmer, L. B., Napolitano, L. M., O’Grady, N. P., Bartlett, J. G., Carratalà, J., El Solh, A. A., Ewig, S., Fey, P. D., File, T. M., Jr., Restrepo, M. I., Roberts, J. A., Waterer, G. W., Cruse, P., Knight, S. L., & Brozek, J. L. (2016). Management of adults with hospital-acquired and ventilator-associated pneumonia: 2016 clinical practice guidelines by the Infectious Diseases Society of America and the American Thoracic Society. Clinical Infectious Diseases, 63(5), e61–e111.",
    url: "https://doi.org/10.1093/cid/ciw353",
  },
  {
    n: 21,
    page: 7,
    text: "Kullar, R., Frisenda, J., & Nassif, P. S. (2018). The more the merrier? Should antibiotics be used for rhinoplasty and septorhinoplasty?—A review. Plastic and Reconstructive Surgery—Global Open, 6(10), Article e1972.",
    url: "https://doi.org/10.1097/GOX.0000000000001972",
  },
  {
    n: 22,
    page: 7,
    text: "López Pereira, P., Díaz-Agero Pérez, C., López Fresneña, N., Las Heras Mosteiro, J., Palancar Cabrera, A., Rincón Carlavilla, Á. L., & Aranaz Andrés, J. M. (2017). Epidemiology of surgical site infection in a neurosurgery department. British Journal of Neurosurgery, 31(1), 10–15.",
    url: "https://doi.org/10.1080/02688697.2016.1260687",
  },
  {
    n: 23,
    page: 8,
    text: "Metlay, J. P., Waterer, G. W., Long, A. C., Anzueto, A., Brozek, J., Crothers, K., Cooley, L. A., Dean, N. C., Fine, M. J., Flanders, S. A., Griffin, M. R., Metersky, M. L., Musher, D. M., Restrepo, M. I., & Whitney, C. G. (2019). Diagnosis and treatment of adults with community-acquired pneumonia: An official clinical practice guideline of the American Thoracic Society and Infectious Diseases Society of America. American Journal of Respiratory and Critical Care Medicine, 200(7), e45–e67.",
    url: "https://doi.org/10.1164/rccm.201908-1581ST",
  },
  {
    n: 24,
    page: 8,
    text: "Nagy, Z., Szabó, D., Agócs, G., Szilágyi, K., Rojcsik, Z., Budai, J., Papp, Z., Padányi, C., Erőss, L., Sipos, L., & Banczerowski, P. (2025). Antibiotic prophylaxis in instrumented lumbar spine surgery: Cefazolin outperforms clindamycin regardless of duration. Antibiotics, 14(8), Article 830.",
    url: "https://doi.org/10.3390/antibiotics14080830",
  },
  {
    n: 25,
    page: 8,
    text: "North American Spine Society. (2013). Antibiotic prophylaxis in spine surgery: Evidence-based clinical guidelines for multidisciplinary spine care (Revised ed.).",
    url: "https://www.spine.org/Portals/0/Assets/Downloads/ResearchClinicalCare/Guidelines/AntibioticProphylaxis.pdf",
  },
  {
    n: 26,
    page: 8,
    text: "Patel, P. N., Jayawardena, A. D. L., Walden, R. L., Penn, E. B., & Francis, D. O. (2018). Evidence-based use of perioperative antibiotics in otolaryngology. Otolaryngology–Head and Neck Surgery, 158(5), 783–800.",
    url: "https://doi.org/10.1177/0194599817753610",
  },
  {
    n: 27,
    page: 8,
    text: "Raman, K., Nailor, M. D., Nicolau, D. P., Aslanzadeh, J., Nadeau, M., & Kuti, J. L. (2013). Early antibiotic discontinuation in patients with clinically suspected ventilator-associated pneumonia and negative quantitative bronchoscopy cultures. Critical Care Medicine, 41(7), 1656–1663.",
    url: "https://doi.org/10.1097/CCM.0b013e318287f713",
  },
  {
    n: 28,
    page: 8,
    text: "Saeed, O., Tribble, D. R., Biever, K. A., Crouch, H. K., & Kavanaugh, M. (2018). Infection prevention in combat-related injuries. Military Medicine, 183(Suppl. 2), 137–141.",
    url: "https://doi.org/10.1093/milmed/usy077",
  },
  {
    n: 29,
    page: 8,
    text: "Sanabria, A., Valdivieso, E., Gomez, G., & Echeverry, G. (2006). Prophylactic antibiotics in chest trauma: A meta-analysis of high-quality studies. World Journal of Surgery, 30(10), 1843–1847.",
    url: "https://doi.org/10.1007/s00268-005-0672-y",
  },
  {
    n: 30,
    page: 8,
    // Printed with no DOI or URL.
    text: "Sharp, J. P., Magnotti, L. J., Weinberg, J. A., Swanson, J. M., Schoreppel, T. J., Clement, L. P., Wood, G. C., Fabian, T. C., & Croce, M. A. (2015). Adherence to an established diagnostic threshold for ventilator-associated pneumonia contributes to low false-negative rates in trauma patients. Journal of Trauma and Acute Care Surgery, 78(3), 468–474.",
  },
  {
    n: 31,
    page: 8,
    text: "Tan, T., Lee, H., Huang, M. S., Rutges, J., Marion, T. E., Mathew, J., Fitzgerald, M., Gonzalvo, A., Hunn, M. K., Kwon, B. K., Dvorak, M. F., & Tee, J. (2020). Prophylactic postoperative measures to minimize surgical site infections in spine surgery: Systematic review and evidence summary. The Spine Journal, 20(3), 435–447.",
    url: "https://doi.org/10.1016/j.spinee.2019.09.013",
  },
  {
    n: 32,
    page: 8,
    text: "Trubiano, J. A., Vogrin, S., Chua, K. Y. L., Bourke, J., Yun, J., Douglas, A., Stone, C. A., Yu, R., Groenendijk, L., Holmes, N. E., & Phillips, E. J. (2020). Development and validation of a penicillin allergy clinical decision rule. JAMA Internal Medicine, 180(5), 745–752.",
    url: "https://doi.org/10.1001/jamainternmed.2020.0403",
  },
  {
    n: 33,
    page: 8,
    text: "UTHealth Houston. (2022, February). Antibiotic therapy. McGovern Medical School, Department of Surgery.",
    url: "https://med.uth.edu/surgery/antibiotic-therapy/",
  },
  {
    n: 34,
    page: 8,
    text: "Vanderbilt University Medical Center, Division of Acute Care Surgery. (2025). Infectious workup and antimicrobial stewardship guideline.",
    url: "https://www.vumc.org/trauma-and-scc/sites/default/files/public_files/Protocols/Infectious-Workup-and-Antimicrobial-Stewardship-PMG-7.18.25.pdf",
  },
  {
    n: 35,
    page: 8,
    text: "Younan, D., Delozier, S. J., Adamski, J., Loudon, A., Violette, A., Ustin, J., Tinkoff, G., Moorman, M. L., McQuay, N., & UHRISES Research Consortium. (2020). Factors predictive of ventilator-associated pneumonia in critically ill trauma patients. World Journal of Surgery, 44(4), 1121–1125.",
    url: "https://doi.org/10.1007/s00268-019-05286-3",
  },
];

// Drug metadata for the "By drug" view and search. APP-AUTHORED — this table is
// not in the PMG and the verifier cannot check it. Brand names are search
// synonyms only; nothing clinical is derived from this table.
export const drugs = {
  Cefazolin: { brand: "Ancef", class: "1st-generation cephalosporin" },
  Metronidazole: { brand: "Flagyl", class: "Nitroimidazole" },
  Ceftriaxone: { brand: "Rocephin", class: "3rd-generation cephalosporin" },
  Cefepime: { brand: "Maxipime", class: "4th-generation cephalosporin" },
  Cephalexin: { brand: "Keflex", class: "1st-generation cephalosporin" },
  "Ampicillin-sulbactam": { brand: "Unasyn", class: "Aminopenicillin + β-lactamase inhibitor" },
  "Amoxicillin-clavulanate": { brand: "Augmentin", class: "Aminopenicillin + β-lactamase inhibitor" },
  "Piperacillin-tazobactam": { brand: "Zosyn", class: "Antipseudomonal penicillin + β-lactamase inhibitor" },
  Vancomycin: { brand: "Vancocin", class: "Glycopeptide" },
  Linezolid: { brand: "Zyvox", class: "Oxazolidinone" },
  Clindamycin: { brand: "Cleocin", class: "Lincosamide" },
  Doxycycline: { brand: "Vibramycin", class: "Tetracycline" },
  Azithromycin: { brand: "Zithromax", class: "Macrolide" },
  Levofloxacin: { brand: "Levaquin", class: "Fluoroquinolone" },
  Ciprofloxacin: { brand: "Cipro", class: "Fluoroquinolone" },
  "Sulfamethoxazole-trimethoprim": { brand: "Bactrim", class: "Sulfonamide + trimethoprim" },
  Nitrofurantoin: { brand: "Macrobid", class: "Nitrofuran" },
  Fosfomycin: { brand: "Monurol", class: "Phosphonic acid antibiotic" },
  Micafungin: { brand: "Mycamine", class: "Echinocandin" },
};

// Everything a reader (or a reviewing physician) should know about how this
// file relates to the PDF. Neither list is rendered: the corrections since
// v0.8.1, the flags since v0.8.6 (Thiago, 2026-10-22, removed the Source page's
// "For the reviewing physician" card). Both are kept as the record, and the
// tests still check them.
export const transcription = {
  // The route the app adds to each open-fracture regimen: the PDF prints none
  // there (Thiago, 2026-10-16: "They are all IV"). `pdf` is the bullet as
  // printed, `here` as the app shows it, `where` the bullet it is (heading, label,
  // sub-bullet label); tests/pmg.test.js checks that every open-fracture regimen
  // has exactly one entry here and that all three match it. Not rendered since
  // v0.8.1 (Thiago, 2026-10-19, removed the Source page's "Corrected from the
  // PDF" card). The flag below that disclosed the route to the reader is not
  // rendered either since v0.8.6.
  corrections: [
    { kind: "route", pdf: "Cefazolin 2 g Q8H", here: "Cefazolin 2 g IV Q8H", where: "Open fractures — Type I & Type II Fractures" },
    {
      kind: "route",
      pdf: "Vancomycin: pharmacy to dose",
      here: "Vancomycin IV: pharmacy to dose",
      where: "Open fractures — Type I & Type II Fractures — If penicillin allergy",
    },
    {
      kind: "route",
      pdf: "Ceftriaxone 2 g Q24H + Vancomycin: pharmacy to dose",
      here: "Ceftriaxone 2 g IV Q24H + Vancomycin IV: pharmacy to dose",
      where: "Open fractures — Type III Fractures",
    },
    {
      kind: "route",
      pdf: "Levofloxacin 500 mg Q24H",
      here: "Levofloxacin 500 mg IV Q24H",
      where: "Open fractures — Type III Fractures — If penicillin allergy",
    },
    {
      kind: "route",
      pdf: "Cefepime 2 g Q8H + Metronidazole 500 mg Q12H + Vancomycin: pharmacy to dose",
      here: "Cefepime 2 g IV Q8H + Metronidazole 500 mg IV Q12H + Vancomycin IV: pharmacy to dose",
      where: "Open Fracture Contamination — Soil, fecal matter, standing water contamination",
    },
    {
      kind: "route",
      pdf: "Levofloxacin 500 mg Q24H + Metronidazole 500 mg Q12H",
      here: "Levofloxacin 500 mg IV Q24H + Metronidazole 500 mg IV Q12H",
      where: "Open Fracture Contamination — Soil, fecal matter, standing water contamination — If penicillin allergy",
    },
    // The one punctuation fix (Thiago, 2026-10-19: "add colon"), mirrored in the
    // verifier's CELL_CORRECTIONS, which requires the data's line to carry it.
    {
      kind: "cell",
      pdf: "Perforated without source control 8 days",
      here: "Perforated without source control: 8 days",
      where: "Appendectomy duration, third line",
    },
  ],
  // Things a physician reviewer should look at. Most are observations about the
  // source document, where the app shows the PDF's values as printed; four say
  // where the app departs from the printed page: the dose lookup on indication
  // rows and its empiric-table fallback (the first two), the open-fracture IV
  // route and the appendectomy colon, the changes listed in `corrections` above.
  // `reviewed` is the date a physician reviewed the note (Thiago, 2026-10-19,
  // all eleven); the Source page marked it until v0.8.6 took the notes off the
  // page. A new or reworded note gets none until he has read it.
  flags: [
    { text: "The indication tables (pages 2–4) name drugs only. The dose shown beside each drug on an indication row is the app's lookup in the dosing table that matches the row's section: the surgical-prophylaxis table (page 3) for Trauma, Emergency General Surgery and Elective Surgery, the empiric table (page 4) for acute infections, with the exception in the next note. The PDF does not print those doses on the rows.", reviewed: "2026-10-19" },
    { text: "Four drugs named on surgical-prophylaxis rows are not in the prophylaxis dosing table: Doxycycline (open face / mandible fracture alternative), Linezolid (necrotizing soft tissue infection debridement), and Clindamycin and Cefepime (its alternatives). On those rows the app shows their dose, route and frequency from the empiric table (page 4), marked as such, at a physician's direction. That table's frequency is a treatment interval; the PMG gives these four no OR redosing interval.", reviewed: "2026-10-19" },
    { text: "The prophylaxis table's redosing interval is printed for the OR only. The PMG gives no post-operative dosing frequency for the prophylaxis rows that list a post-operative duration.", reviewed: "2026-10-19" },
    { text: "Levofloxacin differs by context: 500 mg Q24H in the open-fracture penicillin-allergy regimens (page 5), 750 mg in both dosing tables (pages 3 and 4).", reviewed: "2026-10-19" },
    { text: "Metronidazole frequency differs by context: Q12H in the open-fracture regimens (page 5), \"Q8H or Q12H\" in the empiric dosing table (page 4), and an 8-hour OR redosing interval in the prophylaxis table (page 3).", reviewed: "2026-10-19" },
    { text: "Vancomycin is 15-20 mg/kg in the prophylaxis table (page 3) and \"Pharmacy to dose\" in the empiric table and the open-fracture regimens.", reviewed: "2026-10-19" },
    { text: "Cefazolin is \"2 g if < 120 kg, 3 g if ≥ 120 kg\" in the prophylaxis table (page 3; the PDF draws the ≥ as an underlined >) and 2 g in the empiric table and the open-fracture Type I & II regimen.", reviewed: "2026-10-19" },
    { text: "The open-fracture bullets print no route; the app shows IV for every drug in them, at a physician's direction.", reviewed: "2026-10-19" },
    { text: "The appendectomy duration's third line is printed without a colon after \"Perforated without source control\"; the app adds it, at a physician's direction.", reviewed: "2026-10-19" },
    { text: "This edition carries no pediatric dosing; page 1 says the recommendations apply to adult patients, and the empiric dosing footnote describes standard adult dosing with normal renal function.", reviewed: "2026-10-19" },
    { text: "Brand names and drug classes on the By-drug page are app-authored search aids; they are not in the PMG and are not checked by the script.", reviewed: "2026-10-19" },
  ],
};
