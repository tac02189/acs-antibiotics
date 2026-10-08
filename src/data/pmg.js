// Acute Care Surgery MU Health — Antibiotic Practice Management Guideline
// (original publication date December 2025), transcribed for bedside use.
//
// EVERY VALUE IN THIS FILE IS CLINICAL CONTENT. It was transcribed from the
// source PDF (public/MU-ACS-Antibiotic-PMG-2025-12-<hash>.pdf) page by page,
// with the rendered page images open beside the extracted text. `npm run verify`
// (scripts/verify-pmg.mjs) re-reads the PDF and compares, cell by cell and in
// both directions, everything it can read: the four indication tables (pages
// 1–2, including which section each row sits under), the open-fracture
// statements and the regimens displayed for them (pages 3–4), the dosing table
// (page 4), the three link targets on page 5 and the 13 references. It cannot
// read the page-5 flowchart (an image), does not judge the `short` labels or
// `aliases`, and cannot tell whether the PDF itself is right. A physician still
// has to read the source.
//
// Spelling in `name`, `duration`, `redose` and `alternative` follows the PDF,
// except for the typos listed in `transcription.corrections` below — the
// verifier applies the same corrections to the PDF text before comparing.
//
// Column semantics follow the PDF's own headers:
//   regimen      "Antibiotic" + "Dose" + "Frequency" (entries joined by "plus")
//   duration     "Duration"
//   redose       "Redose" (intra-operative redosing)
//   alternative  "PNC Allergy/Alternative" — in the PDF this column carries the
//                penicillin-allergy regimen for most rows, but also contamination
//                escalation (skull fractures), MRSA-colonization add-ons (elective
//                surgery) and the NSTI clindamycin note. It is kept as one field
//                with the PDF's own label so nothing is re-interpreted here.
//   null         the PDF prints "N/A" in that cell.

export const source = {
  title: "Acute Care Surgery MU Health Antibiotic Practice Management Guideline",
  shortTitle: "ACS Antibiotic PMG",
  publisher: "Acute Care Surgery, University of Missouri Health Care",
  publicationDate: "December 2025",
  // The filename carries the first 12 hex digits of sha256, so a new edition of
  // the PDF is a new URL — nothing can serve a stale copy under a reused name.
  file: "MU-ACS-Antibiotic-PMG-2025-12-d30e2ba07845.pdf",
  sha256: "d30e2ba07845d5882f31a2903c3f1efc1ed2ebf36bd83637871abe81a7b5538d",
  pages: 12,
  // The PDF's own framing, page 1.
  intro:
    "This Practice Management Guideline provides standardized, diagnosis-specific antibiotic recommendations derived from contemporary national guidance including the Infectious Disease Society of America, Surgical Infection Society, the American Association for the Surgery of Trauma, and other authoritative bodies — and aligned with our institution's local microbiologic trends and antibiogram.",
};

export const sections = [
  {
    id: "trauma",
    title: "Trauma",
    rowLabel: "Injury",
    page: 1,
    hue: "trauma",
    blurb: "Prophylaxis by injury pattern, with intra-operative redosing triggers.",
  },
  {
    id: "egs",
    title: "Emergency General Surgery",
    rowLabel: "Diagnosis",
    page: 2,
    hue: "egs",
    blurb: "Empiric therapy and duration by source-control status.",
  },
  {
    id: "elective",
    title: "Elective Surgery",
    rowLabel: "Procedure",
    page: 2,
    hue: "elective",
    blurb: "One-time dose; vancomycin added if known MRSA colonization.",
  },
  {
    id: "inpatient",
    title: "ICU & General Floor",
    rowLabel: "Infection",
    page: 2,
    hue: "inpatient",
    blurb: "Hospital-onset infections treated by the surgical services.",
  },
];

// Intra-operative redose rule that several trauma rows share, verbatim from the PDF
// (one typo corrected: "transfustion").
const TRAUMA_REDOSE = "Every 4 hours or with >1500ml blood loss or > 10 units blood transfusion";

export const indications = [
  // ───────────────────────────── Trauma (page 1) ─────────────────────────────
  {
    id: "abdominal-trauma",
    section: "trauma",
    page: 1,
    name: "Abdominal Trauma with/or without Hollow Viscus Injury",
    short: "Abdominal trauma ± hollow viscus injury",
    aliases: ["abdominal injury", "hollow viscus", "bowel injury", "penetrating abdomen", "laparotomy"],
    regimen: [
      { drug: "Cefazolin", dose: "2 g", frequency: "Q8H" },
      { drug: "Metronidazole", dose: "500 mg", frequency: "Q12H" },
    ],
    duration: ["24 hours", "OR", "4 days after source control (consider monotherapy Zosyn)"],
    redose: TRAUMA_REDOSE,
    alternative: "Levofloxacin and Metronidazole",
  },
  {
    id: "chest-tubes",
    section: "trauma",
    page: 1,
    name: "Chest Tubes",
    short: "Chest tubes",
    aliases: ["tube thoracostomy", "thoracostomy", "pigtail", "hemothorax", "pneumothorax"],
    regimen: null,
    duration: null,
    redose: null,
    alternative: null,
  },
  {
    id: "craniotomy",
    section: "trauma",
    page: 1,
    name: "Craniotomy",
    short: "Craniotomy",
    aliases: ["crani", "neurosurgery"],
    regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "Q8H" }],
    duration: ["24 hours"],
    redose: null,
    alternative: null,
  },
  {
    id: "open-skull-fracture",
    section: "trauma",
    page: 1,
    name: "Open Skull Fracture",
    short: "Open skull fracture",
    aliases: ["depressed skull fracture", "skull fx"],
    regimen: [{ drug: "Ceftriaxone", dose: "2 g", frequency: "Q12H" }],
    duration: ["24 hours after closure or 72 hours total, whichever is shortest"],
    redose: null,
    alternative: "Contamination: ceftriaxone and Metronidazole x 72 hours",
  },
  {
    id: "penetrating-brain-injury",
    section: "trauma",
    page: 1,
    name: "Penetrating Brain/CNS Injury",
    short: "Penetrating brain / CNS injury",
    aliases: ["GSW head", "penetrating head injury", "TBI"],
    regimen: [{ drug: "Ceftriaxone", dose: "2 g", frequency: "Q12H" }],
    duration: ["24 hours after closure or 72 hours total, whichever is shortest"],
    redose: null,
    alternative: "Contamination: ceftriaxone and Metronidazole x 72 hours",
  },
  {
    id: "ventriculostomy",
    section: "trauma",
    page: 1,
    name: "Ventriculostomy or ICP Monitor",
    short: "Ventriculostomy / ICP monitor",
    aliases: ["EVD", "external ventricular drain", "bolt", "ICP"],
    regimen: null,
    duration: null,
    redose: null,
    alternative: null,
  },
  {
    id: "pneumocephaly",
    section: "trauma",
    page: 1,
    name: "Pneumocephaly",
    short: "Pneumocephaly",
    aliases: ["pneumocephalus", "intracranial air"],
    regimen: null,
    duration: null,
    redose: null,
    alternative: null,
  },
  {
    id: "csf-leak",
    section: "trauma",
    page: 1,
    name: "CSF Leak",
    short: "CSF leak",
    aliases: ["rhinorrhea", "otorrhea", "basilar skull fracture"],
    regimen: null,
    duration: null,
    redose: null,
    alternative: null,
  },
  {
    id: "open-face-fracture",
    section: "trauma",
    page: 1,
    name: "Open Face Fracture/Mandible Fracture",
    short: "Open facial / mandible fracture",
    aliases: ["mandible", "facial fracture", "maxillofacial", "Le Fort", "open facial fracture"],
    regimen: [{ drug: "Ampicillin-sulbactam", dose: "3 g", frequency: "Q6H" }],
    duration: ["24 hours after closure or 72 hours total, whichever is shortest"],
    redose: null,
    alternative: "Clindamycin 600mg q8 hours",
  },
  {
    id: "closed-face-fracture",
    section: "trauma",
    page: 1,
    name: "Closed or Non-operative Face Fracture",
    short: "Closed / non-operative facial fracture",
    aliases: ["orbital fracture", "nasal fracture", "zygoma", "closed facial fracture"],
    regimen: null,
    duration: null,
    redose: null,
    alternative: null,
  },
  {
    id: "gu-trauma",
    section: "trauma",
    page: 1,
    name: "GU Trauma",
    short: "GU trauma",
    aliases: ["genitourinary", "bladder injury", "renal laceration", "kidney injury", "urethral injury"],
    regimen: [
      { drug: "Cefazolin", dose: "2 g", frequency: "Q8H" },
      { drug: "Metronidazole", dose: "500 mg", frequency: "Q12H" },
    ],
    duration: ["24 hours"],
    redose: TRAUMA_REDOSE,
    alternative: "Levofloxacin and Metronidazole",
  },
  {
    id: "vascular-trauma",
    section: "trauma",
    page: 1,
    name: "Vascular",
    short: "Vascular",
    aliases: ["vascular injury", "arterial injury", "vascular repair"],
    regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "Q8H" }],
    duration: ["24 hours"],
    redose: TRAUMA_REDOSE,
    alternative: "Vancomycin – Pharmacy to dose",
  },

  // ───────────────────── Emergency General Surgery (page 2) ─────────────────────
  {
    id: "appendicitis",
    section: "egs",
    page: 2,
    name: "Appendicitis",
    short: "Appendicitis",
    aliases: ["appy", "appendectomy", "perforated appendix"],
    regimen: [
      { drug: "Ceftriaxone", dose: "2 g", frequency: "Q24H" },
      { drug: "Metronidazole", dose: "500 mg", frequency: "Q12H" },
    ],
    duration: [
      "Post Appendectomy, non-perforated: 24 hours",
      "Perforated with source control: 4 days OR 8 days in Critical Illness",
      "Perforated without source control: 8 days",
    ],
    redose: null,
    alternative: ["Levofloxacin plus Metronidazole", "or", "Ertapenem 1 g Q24H"],
  },
  {
    id: "diverticulitis-source-control",
    section: "egs",
    page: 2,
    name: "Diverticulitis with Source Control",
    short: "Diverticulitis — with source control",
    aliases: ["tics", "diverticular abscess drained", "sigmoid colectomy"],
    regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
    duration: ["4 days after source control OR 8 days in Critical Illness"],
    redose: null,
    alternative: ["Levofloxacin and Metronidazole", "or", "Ertapenem"],
  },
  {
    id: "diverticulitis-no-source-control",
    section: "egs",
    page: 2,
    name: "Diverticulitis without Source Control",
    short: "Diverticulitis — without source control",
    aliases: ["tics", "complicated diverticulitis", "diverticular abscess"],
    regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
    duration: ["8 days"],
    redose: null,
    alternative: ["Levofloxacin and Metronidazole", "or", "Ertapenem"],
  },
  {
    id: "cholecystitis",
    section: "egs",
    page: 2,
    name: "Cholecystitis",
    short: "Cholecystitis",
    aliases: ["chole", "gallbladder", "cholecystostomy", "PCT", "biliary"],
    regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
    duration: [
      "Post Cholecystectomy with local inflammation: 24 hours",
      "Perforated with source control (includes PCT): 4 days",
      "Perforated without source control: 8 days",
    ],
    redose: null,
    alternative: "Levofloxacin and Metronidazole",
  },
  {
    id: "sbo-necrosis",
    section: "egs",
    page: 2,
    name: "Small bowel Obstruction with Necrosis or Bowel Resection",
    short: "SBO — with necrosis or bowel resection",
    aliases: ["SBO", "small bowel obstruction", "ischemic bowel", "dead bowel", "bowel resection", "strangulated"],
    regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
    duration: ["4 days after source control OR 8 days in Critical Illness"],
    redose: null,
    alternative: "Levofloxacin and Metronidazole",
  },
  {
    id: "sbo-no-necrosis",
    section: "egs",
    page: 2,
    name: "Small bowel Obstruction without Necrosis or Bowel Resection",
    short: "SBO — without necrosis or bowel resection",
    aliases: ["SBO", "small bowel obstruction", "adhesiolysis", "lysis of adhesions"],
    regimen: [
      { drug: "Cefazolin", dose: "2 g", frequency: "Q8H" },
      { drug: "Metronidazole", dose: "500 mg", frequency: "Q12H" },
    ],
    duration: ["24 hours"],
    redose: null,
    alternative: "Levofloxacin and Metronidazole",
  },
  {
    id: "nsti",
    section: "egs",
    page: 2,
    name: "Necrotizing Soft Tissue Infection",
    short: "Necrotizing soft tissue infection",
    aliases: ["NSTI", "nec fasc", "necrotizing fasciitis", "Fournier", "gas gangrene", "myonecrosis"],
    regimen: [
      { drug: "Linezolid", dose: "600 mg", frequency: "Q12H" },
      { drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" },
    ],
    duration: ["48-72 hours after source control is achieved"],
    redose: null,
    alternative:
      "The addition of clindamycin is recommended when there is strong suspicion for Group A Streptococcus or Toxic Shock Syndrome.",
  },
  {
    id: "perforated-pud",
    section: "egs",
    page: 2,
    name: "Perforated Peptic Ulcer Disease",
    short: "Perforated peptic ulcer",
    aliases: ["PUD", "perforated ulcer", "perforated viscus", "free air", "duodenal ulcer", "gastric ulcer", "Graham patch"],
    regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
    regimenNote: "+/- Antifungal Coverage in high risk/immunocompromised patients",
    duration: ["4 days after source control OR 8 days in Critical Illness"],
    redose: null,
    alternative: [
      "Levofloxacin and Metronidazole",
      "+/-",
      "Antifungal Coverage in high risk/immunocompromised patients: micafungin 100 mg Q24H",
    ],
  },

  // ─────────────────────────── Elective Surgery (page 2) ───────────────────────────
  {
    id: "cholecystectomy",
    section: "elective",
    page: 2,
    name: "Cholecystectomy",
    short: "Cholecystectomy",
    aliases: ["lap chole", "elective chole"],
    regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
    duration: ["1 dose"],
    redose: "Every 4 hours",
    alternative: null,
  },
  {
    id: "inguinal-hernia",
    section: "elective",
    page: 2,
    name: "Inguinal Hernia",
    short: "Inguinal hernia",
    aliases: ["hernia repair", "herniorrhaphy"],
    regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
    duration: ["1 dose"],
    redose: "Every 4 hours",
    alternative: "Vancomycin x 1 dose if known MRSA colonization",
  },
  {
    id: "ventral-hernia",
    section: "elective",
    page: 2,
    name: "Ventral Hernia",
    short: "Ventral hernia",
    aliases: ["incisional hernia", "umbilical hernia", "hernia repair"],
    regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
    duration: ["1 dose"],
    redose: "Every 4 hours",
    alternative: "Vancomycin x 1 dose if known MRSA colonization",
  },
  {
    id: "colectomy",
    section: "elective",
    page: 2,
    name: "Colectomy",
    short: "Colectomy",
    aliases: ["colon resection", "hemicolectomy", "bowel prep"],
    regimen: [
      { drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" },
      { drug: "Metronidazole", dose: "500 mg", frequency: "One-time dose" },
    ],
    duration: ["1 dose"],
    redose: null,
    alternative: null,
  },
  {
    id: "ostomy-reversal",
    section: "elective",
    page: 2,
    name: "Colostomy/Ileostomy Reversal",
    short: "Colostomy / ileostomy reversal",
    aliases: ["ostomy takedown", "Hartmann reversal", "stoma reversal"],
    regimen: [
      { drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" },
      { drug: "Metronidazole", dose: "500 mg", frequency: "One-time dose" },
    ],
    duration: ["1 dose"],
    redose: null,
    alternative: ["Vancomycin x 1 dose if known MRSA colonization", "plus", "Metronidazole"],
  },
  {
    id: "cardiac-thoracic",
    section: "elective",
    page: 2,
    name: "Cardiac & Thoracic",
    short: "Cardiac & thoracic",
    aliases: ["thoracotomy", "VATS", "sternotomy", "lobectomy"],
    regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
    duration: ["1 dose"],
    redose: "Every 4 hours",
    alternative: "Vancomycin x 1 dose if known MRSA colonization",
  },
  {
    id: "skin-soft-tissue",
    section: "elective",
    page: 2,
    name: "Skin & Soft Tissue",
    short: "Skin & soft tissue",
    aliases: ["SSTI procedure", "I&D", "soft tissue excision", "skin procedure"],
    regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
    duration: ["1 dose"],
    redose: "Every 4 hours",
    alternative: "Vancomycin x 1 dose if known MRSA colonization",
  },

  // ───────────────────────── ICU & General Floor (page 2) ─────────────────────────
  {
    id: "hap-vap",
    section: "inpatient",
    page: 2,
    name: "Hospital Acquired or Ventilator Associated Pneumonia (HAP/VAP)",
    short: "HAP / VAP",
    aliases: ["HAP", "VAP", "pneumonia", "ventilator", "nosocomial pneumonia"],
    regimen: [
      { drug: "Vancomycin", dose: "Pharmacy to dose", frequency: "Pharmacy to dose" },
      { drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" },
    ],
    duration: ["7 days"],
    redose: null,
    alternative: "Linezolid",
  },
  {
    id: "bacteremia",
    section: "inpatient",
    page: 2,
    name: "Bacteremia",
    short: "Bacteremia",
    aliases: ["positive blood culture", "sepsis", "line infection", "CLABSI", "bloodstream infection"],
    regimen: [
      { drug: "Vancomycin", dose: "Pharmacy to dose", frequency: "Pharmacy to dose" },
      { drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" },
    ],
    duration: ["Depends on Source and Isolated Bacteria"],
    redose: null,
    alternative: [
      "Linezolid",
      "Antifungal Coverage in high risk/immunocompromised patients: micafungin 100 mg Q24H",
    ],
  },
  {
    id: "complicated-uti",
    section: "inpatient",
    page: 2,
    // The PDF cell is cut off at "Urologic Instr"; the intended word is
    // instrumentation. The verifier matches on the printed prefix.
    name: "Complicated Urinary Tract Infection/CAUTI/Urologic Instrumentation",
    short: "Complicated UTI / CAUTI / urologic instrumentation",
    aliases: ["CAUTI", "complicated UTI", "catheter", "Foley", "urosepsis", "pyelonephritis", "instrumentation"],
    regimen: [{ drug: "Ceftriaxone", dose: "2 g", frequency: "Q24H" }],
    duration: ["7 days"],
    redose: null,
    alternative: null,
  },
  {
    id: "uncomplicated-uti",
    section: "inpatient",
    page: 2,
    name: "Uncomplicated Urinary Tract Infection",
    short: "Uncomplicated UTI",
    aliases: ["UTI", "cystitis", "simple UTI", "Bactrim"],
    regimen: [{ drug: "Sulfamethoxazole-TMP", dose: "800 mg/160 mg", frequency: "Q12H" }],
    duration: ["3 days"],
    redose: null,
    alternative: null,
  },
  {
    id: "sinusitis",
    section: "inpatient",
    page: 2,
    name: "Sinusitis",
    short: "Sinusitis",
    aliases: ["sinus", "nosocomial sinusitis", "NG tube sinusitis"],
    regimen: [{ drug: "Ampicillin-sulbactam", dose: "3 g", frequency: "Q6H" }],
    duration: ["5 days"],
    redose: null,
    alternative: null,
  },
  {
    id: "cellulitis-purulent",
    section: "inpatient",
    page: 2,
    name: "Cellulitis - Purulent (or MRSA risk factors)",
    short: "Cellulitis — purulent / MRSA risk",
    aliases: ["abscess", "MRSA", "purulent cellulitis", "SSTI", "skin infection"],
    regimen: [{ drug: "Vancomycin", dose: "Pharmacy to dose", frequency: "Pharmacy to dose" }],
    duration: ["5-10 days"],
    redose: null,
    alternative: "Linezolid",
  },
  {
    id: "cellulitis-nonpurulent",
    section: "inpatient",
    page: 2,
    name: "Cellulitis - Non-Purulent",
    short: "Cellulitis — non-purulent",
    aliases: ["erysipelas", "simple cellulitis", "SSTI", "skin infection"],
    regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "Q8H" }],
    duration: ["5 days"],
    redose: null,
    alternative: null,
  },
];

// ─────────────────── Musculoskeletal: open extremity fractures (pages 3–4) ───────────────────
export const openFractures = {
  title: "Musculoskeletal Open extremity fractures",
  pages: [3, 4],
  timing: "Administer within 30 min of arrival to the ED & all patients to have MRSA nasal screen",
  classification: {
    title: "Gustilo-Anderson Classification of Open Fractures",
    types: [
      {
        type: "Type I",
        description: "Open fracture with a wound <1cm long, low energy, without gross contamination",
      },
      {
        type: "Type II",
        description:
          "Open fracture with a wound 1-10cm long, low energy, without gross contamination or extensive soft-tissue damage, flaps, or avulsions",
      },
      {
        type: "Type III",
        subtypes: [
          {
            code: "IIIA",
            description:
              "Open fracture with a wound greater than 10cm with adequate soft-tissue coverage, or any open fracture due to high-energy trauma or with gross contamination, regardless of the size of the wound",
          },
          {
            code: "IIIB",
            description:
              "Open fracture with extensive soft-tissue injury or loss, with periosteal stripping and bone exposure that requires soft-tissue coverage in the form of muscle rotation or transfer.",
          },
          {
            code: "IIIC",
            description: "Open fracture associated with arterial injury requiring repair.",
          },
        ],
      },
    ],
  },
  // "Antimicrobial" bullets, pages 3–4. `text` is the PDF's wording under the
  // printed label `applies`; `regimen` is the same content split for display.
  // The verifier checks `applies` + `text` against the page as one phrase, and
  // requires `regimen` (drug + footnote mark + dose + route + frequency + note,
  // in order) to re-state `text` exactly — so the displayed tuples cannot drift
  // from the verified prose. `footnote` keys point into dosingTable.footnotes
  // ("*" renal adjustment, "**" pharmacy-to-dose), as the PDF marks them.
  antimicrobial: [
    {
      id: "type-1-2",
      page: 3,
      applies: "Type I & II",
      text: "Cefazolin 2g IV q8 hours",
      regimen: [{ drug: "Cefazolin", dose: "2 g", route: "IV", frequency: "q8 hours" }],
    },
    {
      id: "pcn-allergy",
      page: 3,
      applies: "If penicillin allergy",
      text: "Vancomycin** 15mg/kg IV q12 hours, Pharmacy To Dose Consult",
      regimen: [
        {
          drug: "Vancomycin",
          footnote: "pharmacy",
          dose: "15 mg/kg",
          route: "IV",
          frequency: "q12 hours",
          note: "Pharmacy To Dose Consult",
        },
      ],
    },
    {
      id: "type-3",
      page: 3,
      applies: "Type III — treatment for ALL Type III",
      text: "Cefepime* 2g q8 hours & Vancomycin** 15mg/kg IV q12 hours Pharmacy To Dose Consult",
      regimen: [
        { drug: "Cefepime", footnote: "renal", dose: "2 g", frequency: "q8 hours" },
        {
          drug: "Vancomycin",
          footnote: "pharmacy",
          dose: "15 mg/kg",
          route: "IV",
          frequency: "q12 hours",
          note: "Pharmacy To Dose Consult",
        },
      ],
    },
    {
      id: "contamination",
      page: 4,
      applies: "Soil, fecal contamination, and standing water contamination",
      text: "Cefepime* 2g q8 hours, Vancomycin** 15mg/kg IV q12 hours Pharmacy To Dose Consult, & Metronidazole 500mg IV Q8h",
      regimen: [
        { drug: "Cefepime", footnote: "renal", dose: "2 g", frequency: "q8 hours" },
        {
          drug: "Vancomycin",
          footnote: "pharmacy",
          dose: "15 mg/kg",
          route: "IV",
          frequency: "q12 hours",
          note: "Pharmacy To Dose Consult",
        },
        { drug: "Metronidazole", dose: "500 mg", route: "IV", frequency: "Q8h" },
      ],
    },
  ],
  duration: [
    { applies: "Type I & Type II Fractures", value: "24 hours" },
    { applies: "Type III", value: "24 hours after closure or 72 hours (whichever precedes)" },
  ],
  debridement: {
    heading: "Operative debridement within 24 hours",
    items: [
      "Gustilo and Anderson IIIC (vascular injury requiring repair) constitutes an emergency, should be at OR staging within 2 hours.",
      "Type I to IIIB within 12 – 24hrs based on OR availability and patient stability.",
    ],
  },
  femoralShaft: {
    heading: "Timing and sequence for the treatment of femoral diaphyseal fractures in multiply injured patients",
    stable: {
      label: "Hemodynamically stable patients",
      items: ["External fixation vs definitive internal fixation within 24 hours of clearance by the trauma team."],
    },
    unstable: {
      label: "Hemodynamically unstable patients",
      items: [
        "Temporary traction vs reduction/splinting for all fractures in the Emergency Department",
        "External fixation at first OR visit or once cleared by the trauma team",
      ],
    },
  },
};

// Dosing table printed on page 4 (open-fracture antimicrobials).
export const dosingTable = {
  page: 4,
  adultLabel: "Adult Dosing (age ≥15 years)",
  pediatricLabel: "Pediatric Dosing",
  rows: [
    {
      drug: "Cefazolin",
      footnote: "renal",
      adult: ["2 g IV Q8h"],
      pediatric: ["< 60 kg: 33 mg/kg/dose IV Q8h", "≥ 60 kg: 2 g IV Q8h"],
    },
    {
      drug: "Cefepime",
      footnote: "renal",
      adult: ["2 g IV Q8h"],
      pediatric: ["< 40 kg: 50 mg/kg/dose IV Q12h", "≥ 40 kg: 2 g IV Q12h"],
    },
    {
      drug: "Metronidazole",
      footnote: null,
      adult: ["500 mg IV Q8h"],
      pediatric: ["< 37.5 kg: 13.3 mg/kg/dose IV Q8h", "≥ 37.5 kg: 500 mg IV Q8h"],
    },
    {
      drug: "Vancomycin",
      footnote: "pharmacy",
      adult: ["15 mg/kg IV Q12h (max 1.5g/dose)", "Vancomycin IV - Pharmacy to Dose"],
      pediatric: ["20 mg/kg/dose IV Q8h (max 1.5g/dose)", "Vancomycin IV - Pharmacy to Dose"],
    },
  ],
  footnotes: {
    renal: { mark: "*", text: "Pharmacy to dose adjust per renal dosing protocol" },
    pharmacy: {
      mark: "**",
      text: "Order Vancomycin IV – Pharmacy to Dose for adult and pediatric patients. Suggested dosing listed above. Pharmacy to adjust based on renal function.",
    },
  },
};

// Page 5 is a flowchart embedded as an IMAGE — no text layer. This is a reading
// of that image, structured as steps, and cannot be machine-verified. The three
// "Reference Standards" links below ARE verified: the PDF's link annotations are
// Bing click-tracking URLs whose encoded target decodes to these CDC pages.
//
// Thiago's decisions on the 2026-10-08 Codex cross-check
// (docs/reviews/2026-10-08-codex-pdf-crosscheck.md). Do not "restore" the PDF's
// wording here:
//   - "Unexplained hypotension" stays one criterion; the PDF prints "Unexplained"
//     and "Hypotension" as two bullets (F1).
//   - "with reflexive culture" stays; the PDF's box reads "Obtain Urinalysis with
//     Reflexive" (F2).
//   - "> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells"
//     replaces the drawn sequence, which puts the repeat-UA box before "Start
//     empiric antibiotics" (F3). The "<100,000 CFU/mL … discontinue antibiotics"
//     box is that outcome's later step (`then`), as in the drawing, where it
//     hangs below "Start empiric antibiotics"; not a third outcome, and not
//     chained on with another arrow, which read as if it depended on the repeat
//     UA (v0.7.6). An outcome is a string, or { text, then } for one with a
//     later step; FeverWorkupView indents `then` under its outcome.
//   - The repeat-UA box's asterisk is left out; the page has no footnote for it (F5).
export const feverWorkup = {
  page: 5,
  title: "Infectious Workup and Antimicrobial Guideline",
  trigger: "Temp >38.0 °C or 100.4 °F",
  transcribedFromImage: true,
  branches: [
    {
      id: "pneumonia",
      title: "Suspected pneumonia",
      criteria: {
        lead: "New, persistent, or progressive infiltrate PLUS any TWO of the following:",
        items: [
          "Purulent secretions",
          "Decline in pulmonary status such as: worsening hypoxemia, ventilator compliance, elevated inspiratory pressures",
          "Fever (>38.0)",
          "Unexplained leukocytosis",
          "New onset delirium",
        ],
      },
      steps: [
        "ETT or tracheostomy → perform bronchoscopy with BAL or obtain QTL",
        "Start empiric pneumonia antibiotics",
        "Adjust / de-escalate therapy per culture and sensitivity:",
      ],
      outcomes: [
        "≥ 10⁴ CFU/mL → narrow spectrum × 7 days (total)",
        "≤ 10⁴ CFU/mL, negative cultures, or oropharyngeal flora → stop antibiotic therapy",
      ],
    },
    {
      id: "central-line",
      title: "Suspected central line",
      criteria: { lead: "Central line >72 h with purulence at site?", items: [] },
      steps: [],
      outcomes: ["YES → D/C CVC and replace at new site if indicated", "NO → Stop"],
      note: "Blood cultures should only be obtained when other potential sources have been ruled out.",
    },
    {
      id: "uti",
      title: "Suspected UTI",
      preface: "For uncomplicated UTI, use AgileMD Pathway for diagnosis & antibiotic selection.",
      criteria: {
        lead: "ONE of the following (unless signs of sepsis):",
        items: [
          "Fever >38.5",
          "Unexplained hypotension",
          "New urinary frequency, urgency, dysuria",
          "Suprapubic pain",
          "Flank pain",
          "Spasticity or autonomic dysreflexia",
          "Unexplained rising leukocytosis",
        ],
      },
      steps: ["YES → obtain urinalysis with reflexive culture", "NO → no UA indicated; investigate other sources"],
      outcomes: [
        {
          text: "> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells",
          then: "<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics",
        },
        "< 10 WBC → investigate other source",
      ],
    },
  ],
  referenceStandards: [
    {
      label: "NHSN Hospital Acquired Pneumonia & VAP",
      url: "https://www.cdc.gov/nhsn/pdfs/pscmanual/6pscvapcurrent.pdf",
    },
    {
      label: "NHSN Catheter Associated Urinary Tract Infection",
      url: "https://www.cdc.gov/nhsn/pdfs/pscmanual/7psccauticurrent.pdf",
    },
    {
      label: "NHSN Central Line Associated Blood Stream Infection",
      url: "https://www.cdc.gov/clabsi/about/index.html",
    },
  ],
};

// Pages 6–11 reproduce the MU Health University Hospital antibiogram for
// January–December 2024 (gram-positive, gram-negative, ED, ICU, Candida and
// Children's Hospital tables). The live MUHC Antibiogram app carries the newer
// 2025 dataset, so this app links to it instead of re-typing superseded tables.
export const antibiogram = {
  pages: [6, 11],
  period: "January 1 – December 31, 2024 (Candida and Children's tables: 2021–2024)",
  appUrl: "https://muhc-antibiogram.web.app",
  appName: "MUHC Antibiogram",
  appNote: "Current data (2025 isolates), searchable by organism, drug and unit.",
};

// Page 12 ("11" in the PDF's own numbering).
export const references = [
  {
    n: 1,
    text: "Jones, B. E., Ramirez, J. A., Oren, E., et al. (2025). Diagnosis and management of community-acquired pneumonia: An official American Thoracic Society clinical practice guideline. American Journal of Respiratory and Critical Care Medicine.",
    url: "https://doi.org/10.1164/rccm.202507-1692ST",
  },
  {
    n: 2,
    text: "Metlay, J. P., Eaterer, G. W., Long, A. C., et al. (2019). Diagnosis and treatment of adults with community-acquired pneumonia: An official clinical practice guideline of the American Thoracic Society and Infectious Diseases Society of America. American Journal of Respiratory and Critical Care Medicine, 200(7), e45–e67.",
  },
  {
    n: 3,
    text: "Fagon, J. Y., Chastre, J., Wolff, M., et al. (2000). Invasive and noninvasive strategies for management of suspected ventilator-associated pneumonia: A randomized trial. Annals of Internal Medicine, 132, 621–630.",
  },
  {
    n: 4,
    text: "Guidry, C. A., Mallicote, M. U., Petroze, R. T., Hranjec, T., Rosenberger, L. H., Davies, S. W., & Sawyer, R. G. (2014). Influence of bronchoscopy on the diagnosis of and outcomes from ventilator-associated pneumonia. Surgical Infections, 15(5), 527–532.",
  },
  {
    n: 5,
    text: "Kalil, A. C., Metersky, M. L., Klompas, M., et al. (2016). Management of adults with hospital-acquired and ventilator-associated pneumonia: 2016 clinical practice guidelines by the Infectious Diseases Society of America and the American Thoracic Society. Clinical Infectious Diseases, 63(5), e61–e111.",
  },
  {
    n: 6,
    text: "Sharp, J. P., Magnotti, L. J., Weinberg, J. A., Swanson, J. M., Schoreppel, T. J., Clement, L. P., Wood, G. C., Fabian, T. C., & Croce, M. A. (2015). Adherence to an established diagnostic threshold for ventilator-associated pneumonia contributes to low false-negative rates in trauma patients. The Journal of Trauma and Acute Care Surgery, 78(3), 468–474.",
  },
  {
    n: 7,
    text: "Younan, D., Delozier, S. J., Adamski, J., Loudon, A., Violette, A., Ustin, J., Tinkoff, G., Moorman, M. L., McQuay, N., & UHRISES Research Consortium. (2020). Factors predictive of ventilator-associated pneumonia in critically ill trauma patients. World Journal of Surgery, 44(4), 1121–1125.",
    url: "https://doi.org/10.1007/s00268-019-05286-3",
  },
  {
    n: 8,
    text: "Joung, M. K., Lee, J., Moon, S. Y., et al. (2011). Impact of de-escalation therapy on clinical outcomes for intensive care unit-acquired pneumonia. Critical Care, 15(2), R79.",
  },
  {
    n: 9,
    // The PDF prints the page range cut off as "1404–141" (no closing digit or
    // period). Reproduced as printed; see transcription.flags.
    text: "De Bus, L., Depuydt, P., Steen, J., et al. (2020). Antimicrobial de-escalation in the critically ill patient and assessment of clinical cure: The DIANA study. Intensive Care Medicine, 46(7), 1404–141",
  },
  {
    n: 10,
    text: "Bultas, A. C., Bery, A. I., Deal, E. N., Hartmann, A. P., Richter, S. K., & Call, W. B. (2019). Predictors of treatment failure following de-escalation to a fluoroquinolone in culture-negative nosocomial pneumonia. Annals of Pharmacotherapy, 53(12), 1207–1219.",
  },
  {
    n: 11,
    text: "Raman, K., Nailor, M. D., Nicolau, D. P., Aslanzadeh, J., Nadeau, M., & Kuti, J. L. (2013). Early antibiotic discontinuation in patients with clinically suspected ventilator-associated pneumonia and negative quantitative bronchoscopy cultures. Critical Care Medicine, 41(7), 1656–1663.",
    url: "https://doi.org/10.1097/CCM.0b013e318287f713",
  },
  {
    n: 12,
    text: "Vanderbilt University Medical Center, Division of Acute Care Surgery. (2025). Infectious workup and antimicrobial stewardship guideline.",
    url: "https://www.vumc.org",
  },
  {
    n: 13,
    text: "UTHealth Houston. (2022, February). Antibiotic therapy. McGovern Medical School, Department of Surgery.",
    url: "https://med.uth.edu/surgery/antibiotic-therapy/",
  },
];

// Drug metadata for the "By drug" view and search. APP-AUTHORED — this table is
// not in the PMG and the verifier cannot check it. Brand names are search
// synonyms only; nothing clinical is derived from this table.
export const drugs = {
  Cefazolin: { brand: "Ancef", class: "1st-generation cephalosporin" },
  Metronidazole: { brand: "Flagyl", class: "Nitroimidazole" },
  Ceftriaxone: { brand: "Rocephin", class: "3rd-generation cephalosporin" },
  "Ampicillin-sulbactam": { brand: "Unasyn", class: "Aminopenicillin + β-lactamase inhibitor" },
  "Piperacillin-tazobactam": { brand: "Zosyn", class: "Antipseudomonal penicillin + β-lactamase inhibitor" },
  Linezolid: { brand: "Zyvox", class: "Oxazolidinone" },
  Vancomycin: { brand: "Vancocin", class: "Glycopeptide" },
  "Sulfamethoxazole-TMP": { brand: "Bactrim", class: "Sulfonamide + trimethoprim" },
  Cefepime: { brand: "Maxipime", class: "4th-generation cephalosporin" },
  Levofloxacin: { brand: "Levaquin", class: "Fluoroquinolone" },
  Ertapenem: { brand: "Invanz", class: "Carbapenem" },
  Clindamycin: { brand: "Cleocin", class: "Lincosamide" },
  Micafungin: { brand: "Mycamine", class: "Echinocandin" },
};

// Everything a reader (or a reviewing physician) should know about how this
// file relates to the PDF. Rendered on the Source page.
export const transcription = {
  corrections: [
    { pdf: "transfustion", here: "transfusion", where: "Trauma redose column (three rows)" },
    { pdf: "Nectrotizing Soft Tissue Infection", here: "Necrotizing Soft Tissue Infection", where: "Emergency General Surgery" },
    { pdf: "Ertapenum", here: "Ertapenem", where: "Diverticulitis alternatives (two rows)" },
    { pdf: "7days", here: "7 days", where: "HAP/VAP duration" },
    { pdf: "Every 4 hour", here: "Every 4 hours", where: "Skin & Soft Tissue redose" },
    { pdf: "Pharmacy to dos", here: "Pharmacy to dose", where: "Purulent cellulitis dose cell (cut off in the PDF)" },
    {
      pdf: "Complicated Urinary Tract Infection/CAUTI/Urologic Instr",
      here: "…/Urologic Instrumentation",
      where: "ICU & General Floor — the PDF cell is truncated",
    },
  ],
  // Things a physician reviewer should look at. These are observations about
  // the source document, not corrections — the app shows the PDF's values.
  flags: [
    "Open fractures, Type III: the text gives Cefepime 2 g q8 hours with no age qualifier, while the dosing table on page 4 lists pediatric Cefepime at Q12h (≥40 kg: 2 g IV Q12h). Both are reproduced as printed.",
    "Metronidazole frequency differs by context in the PDF: 500 mg Q12H in the trauma and emergency general surgery tables, 500 mg IV Q8h in the open-fracture contamination regimen and the page 4 dosing table.",
    "Abdominal trauma duration reads \"24 hours OR 4 days after source control (consider monotherapy Zosyn)\" — the PDF does not say which applies when.",
    "Page 5 (fever workup flowchart) is an image in the PDF. Its text here was read from the picture and cannot be checked by the verification script. Its thresholds meet at the boundary exactly as drawn — \"≥ 10⁴ CFU/mL\" versus \"≤ 10⁴ CFU/mL\" (both apply at 10⁴), and \"> 10 WBC\" versus \"< 10 WBC\" (neither applies at exactly 10).",
    "The dosing-table thresholds (\"< 60 kg\" / \"≥ 60 kg\" and so on) are compared with the PDF including the comparison signs, but the sign at exactly the boundary weight is the document's choice, not the app's.",
    "Reference 9 (De Bus et al., DIANA) is printed with its page range cut off: \"1404–141\". Reproduced as printed.",
    "Brand names and drug classes on the By-drug page are app-authored search aids; they are not in the PMG and are not checked by the script.",
    "Pages 6–11 (antibiogram) are January–December 2024 data; the MUHC Antibiogram app has 2025 data, so they are linked rather than reproduced.",
  ],
};
