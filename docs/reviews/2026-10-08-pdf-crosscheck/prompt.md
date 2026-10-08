# Independent transcription check: MU Health Acute Care Surgery Antibiotic PMG (Dec 2025) vs the app's data file

DO NOT USE ANY TOOLS. Do not read files, run commands or browse. Answer only from the content of this message and the attached page images.

## Who you are checking for, and what this is not

The ACS Antibiotic Guide is a mobile web app that ED and surgical clinicians at MU Health read at the bedside. Every clinical value it shows comes from one file, `src/data/pmg.js` (embedded below with line numbers), transcribed by hand from the hospital's 12-page PDF guideline. A wrong drug, dose, frequency, duration or redosing rule in that file reaches a prescriber.

Your job: compare the data file with the PDF, item by item, in both directions, and report every place they differ. You are a transcription-error detector. You are NOT judging whether the guideline is clinically right; the app deliberately shows the PDF's values even where the PDF disagrees with itself or with other guidance. A physician will read the source; your report tells them where to look.

## What you are given

1. **17 page images** rendered from the PDF (attached; white background, vector text rendered at 2–4×). File names say which page and region:
   - `p1-full`, `p1-table-left`, `p1-table-right` — page 1 (landscape): intro text and the Trauma table. The left crop covers Injury · Antibiotic · Dose · Frequency · start of Duration; the right crop covers Duration · Redose · PNC Allergy/Alternative. They overlap.
   - `p2-full`, `p2-top-left`, `p2-top-right`, `p2-bottom-left`, `p2-bottom-right` — page 2 (landscape): Emergency General Surgery, Elective Surgery and ICU & General Floor tables, in four overlapping quarters.
   - `p3-top`, `p3-bottom`, `p4-top`, `p4-bottom` — pages 3–4 (portrait): open fractures (classification, antimicrobials by type, duration, debridement, femoral shaft) and the adult/pediatric dosing table.
   - `p5-full`, `p5-top`, `p5-bottom` — page 5: the "Infectious Workup and Antimicrobial Guideline" fever flowchart. **It is a picture in the PDF; the text extraction below has almost nothing from it, so the images are your only source for page 5.**
   - `p12-top`, `p12-bottom` — page 12: references.
   Pages 6–11 (a 2024 antibiogram) are deliberately NOT transcribed into the app; ignore them.
2. **A machine text extraction** of pages 1–5 and 12 (pdf.js). Each line is one baseline, left to right, with `  |  ` at a horizontal gap. Multi-line table cells come out interleaved across lines, so use the images to decide which text belongs to which row and column. Where the images and the extraction disagree on a character, say so.
3. **`src/data/pmg.js`, all 924 lines, with line numbers.** Read its header comment: it explains the column semantics (`regimen` = Antibiotic + Dose + Frequency, entries joined by "plus"; `duration`; `redose`; `alternative` = the PDF's "PNC Allergy/Alternative" column; `null` = the PDF prints "N/A"). Near the end, `transcription.corrections` lists the typos the file deliberately corrects, and `transcription.flags` lists places where the PDF contradicts itself and the file deliberately keeps the PDF's values.

## What to do

For every indication row and every other clinical statement, compare: the row's name and which table/section it is under; each antibiotic; dose and unit; frequency; route where given; duration; redose rule; the alternative column, including conditions ("if known MRSA colonization", "Contamination: …", weight or age qualifiers); footnotes and asterisks; the open-fracture classification, antimicrobials by type, timing, duration, debridement and femoral-shaft rules; every cell of the dosing table, including the comparison signs (<, ≤, ≥) and the weight/age bands; every box, arrow, threshold and branch of the page-5 flowchart, including which outcome follows which answer; the reference standards; and every reference (authors, year, title, journal, volume, issue, pages, DOI/URL).

Then go the other way: list anything printed on pages 1–5 or 12 that the data file leaves out, or anything in the data file that the PDF does not say.

Also check:
- Each entry in `transcription.corrections`: is it really a typo in the PDF, and does the corrected text change the meaning?
- Each entry in `transcription.flags`: is the description of the PDF accurate?
- Text in the file that is NOT from the PDF (the `drugs` brand names and classes, `aliases`, `short` labels, section `blurb`s, and any other app-authored wording): say whether any of it is wrong or claims something the PDF does not say. Brand/class errors matter: a clinician may search by brand.

## Rules for your report

- **Do not soften, merge or skip.** One finding per discrepancy. If the same error repeats in several rows, list each row.
- Every finding gives: severity; the pmg.js line number(s); the PDF page, and which image you read it in; the PDF's exact text in quotes; the data file's exact text in quotes; one sentence on what differs.
- Severity: **Critical** — a drug, dose, unit, frequency, duration or redose rule differs from the PDF, or a value sits under the wrong indication or section. **High** — a clinical statement, qualifier, condition, threshold or flowchart branch is missing, added or changed. **Medium** — wording that could change how a reader acts. **Low** — spelling, punctuation or labels with no clinical effect.
- If you cannot read something in the images, say exactly what and where. Never guess a value.
- **Silence is not a pass.** After the findings, give a coverage table: for each part of the PDF (Trauma table, EGS table, Elective table, ICU & General Floor table, open fractures, dosing table, page-5 flowchart, reference standards, references), how many items you compared, how many matched, and anything you did not check.

## Start your answer with this receipt, before any findings

1. How many images you received, and their names.
2. The last line number of the embedded pmg.js and the text on that line.
3. The first line of the PDF text extraction for page 12.
If any of the three is missing or truncated, stop and say so instead of reviewing.

---

## PDF text extraction (pages 1–5 and 12)

PDF: MU-ACS-Antibiotic-PMG-2025-12-d30e2ba07845.pdf — 12 pages. Lines are grouped by baseline (y, in PDF points from the bottom) and ordered left to right; x is the left edge of the first item; "  |  " marks a horizontal gap of more than 6pt between items (a likely cell boundary). This is a machine extraction: table rows that wrap over several lines appear as several lines.

===== PAGE 1 (792×612 pt, 125 text items) =====
[y=568 x=73] Original Publication Date: December 2025 | Practice Management Guidelines
[y=526 x=291] ACUTE CARE SURGERY MU HEALTH
[y=510 x=247] ANTIBIOTIC PRACTICE MANAGEMENT GUIDELINE
[y=478 x=50] Acute Care Surgery at the University of Missouri is committed to delivering safe, evidence-based, and cost-conscious care across the continuum
[y=462 x=50] of trauma, emergency general surgery, critical care, and elective surgical practice. As antimicrobial resistance continues to rise and practice
[y=447 x=50] variation persists nationally, establishing a unified antibiotic stewardship framework is essential to optimizing patient outcomes and preserving
[y=431 x=50] the effectiveness of critical therapies.
[y=399 x=50] This Practice Management Guideline provides standardized, diagnosis-specific antibiotic recommendations derived from contemporary national
[y=383 x=50] guidance including the Infectious Disease Society of America, Surgical Infection Society, the American Association for the Surgery of Trauma,
[y=367 x=50] and other authoritative bodies—and aligned with our institution’s local microbiologic trends and antibiogram. By creating consistent
[y=351 x=50] expectations for antibiotic selection, timing, dosing, and duration, this PMG aims to reduce unnecessary variation, promote judicious
[y=336 x=50] antimicrobial use, and ensure that every patient treated within our trauma and surgical care system receives the safest and most appropriate
[y=320 x=50] therapy.
[y=236 x=256] Acute Care Surgery MUHEALTH Antibiotic Practice Management Guideline
[y=217 x=384] Trauma
[y=208 x=13] Injury | Antibiotic | Dose | Frequency | Duration | Redose | PNC Allergy/Alternative
[y=199 x=186] Cefazolin | 2 g | Q8H | 24 hours | Every 4 hours or with
[y=192 x=14] Abdominal Trauma with/or without Hollow Viscus Injury | OR | Levofloxacin and Metronidazole
[y=190 x=186] plus | >1500ml blood loss or > 10
[y=184 x=366] 4 days after source control (consider monotherapy Zosyn)
[y=182 x=186] Metronidazole | 500 mg | Q12H | units blood transfustion
[y=172 x=14] Chest Tubes | N/A | N/A | N/A | N/A | N/A | N/A
[y=163 x=14] Craniotomy | Cefazolin | 2 g | Q8H | 24 hours | N/A | N/A
[y=153 x=630] Contamination: ceftriaxone and Metronidazole x 72
[y=149 x=14] Open Skull Fracture | Ceftriaxone | 2 g | Q12H | 24 hours after closure or 72 hours total, whichever is shortest | N/A
[y=145 x=630] hours
[y=135 x=630] Contamination: ceftriaxone and Metronidazole x 72
[y=131 x=14] Penetrating Brain/CNS Injury | Ceftriaxone | 2 g | Q12H | 24 hours after closure or 72 hours total, whichever is shortest | N/A
[y=127 x=630] hours
[y=118 x=14] Ventriculostomy or ICP Monitor | N/A | N/A | N/A | N/A | N/A | N/A
[y=109 x=14] Pneumocephaly | N/A | N/A | N/A | N/A | N/A | N/A
[y=100 x=14] CSF Leak | N/A | N/A | N/A | N/A | N/A | N/A
[y=91 x=14] Open Face Fracture/Mandible Fracture | Ampicillin-sulbactam | 3 g | Q6H | 24 hours after closure or 72 hours total, whichever is shortest | N/A | Clindamycin 600mg q8 hours
[y=82 x=14] Closed or Non-operative Face Fracture | N/A | N/A | N/A | N/A | N/A | N/A
[y=72 x=186] Cefazolin | 2 g | Q8H | Every 4 hours or with
[y=64 x=14] GU Trauma | plus | 24 hours | >1500ml blood loss or > 10 | Levofloxacin and Metronidazole
[y=56 x=186] Metronidazole | 500 mg | Q12H | units blood transfustion
[y=45 x=551] Every 4 hours or with
[y=37 x=14] Vascular | Cefazolin | 2 g | Q8H | 24 hours | >1500ml blood loss or > 10 | Vancomycin – Pharmacy to dose
[y=29 x=551] units blood transfustion

===== PAGE 2 (792×612 pt, 220 text items) =====
[y=568 x=73] Original Publication Date: December 2025 | Practice Management Guidelines
[y=546 x=351] Emergency General Surgery
[y=536 x=186] Ceftriaxone | 2 g | Q24H | Post Appendectomy, non-perforated: 24 hours | Levofloxacin plus Metronidazole
[y=528 x=14] Appendicitis | plus | Perforated with source control: 4 days OR 8 days in Critical | N/A | or
[y=520 x=186] Metronidazole | 500 mg | Q12H | Illness | Ertapenem 1 g Q24H
[y=510 x=367] Perforated without source control: 8 days
[y=502 x=630] Levofloxacin and Metronidazole | or
[y=497 x=14] Diverticulitis with Source Control | Piperacillin-tazobactam | 4.5 g | Q8H | 4 days after source control OR 8 days in Critical Illness | N/A
[y=493 x=630] Ertapenum
[y=484 x=630] Levofloxacin and Metronidazole | or
[y=479 x=14] Diverticulitis without Source Control | Piperacillin-tazobactam | 4.5 g | Q8H | 8 days | N/A
[y=475 x=630] Ertapenum
[y=465 x=367] Post Cholecystectomy with local inflammation: 24 hours
[y=457 x=14] Cholecystitis | Piperacillin-tazobactam | 4.5 g | Q8H | Perforated with source control (includes PCT): 4 days | N/A | Levofloxacin and Metronidazole
[y=449 x=367] Perforated without source control: 8 days
[y=439 x=14] Small bowel Obstruction with Necrosis or Bowel Resection | Piperacillin-tazobactam | 4.5 g | Q8H | 4 days after source control OR 8 days in Critical Illness | N/A | Levofloxacin and Metronidazole
[y=429 x=186] Cefazolin | 2 g | Q8H
[y=421 x=14] Small bowel Obstruction without Necrosis or Bowel Resection | plus | 24 hours | N/A | Levofloxacin and Metronidazole
[y=413 x=186] Metronidazole | 500 mg | Q12H
[y=402 x=186] Linezolid | 600 mg | Q12H | The addition of clindamycin is recommended when
[y=394 x=14] Nectrotizing Soft Tissue Infection | plus | 48-72 hours after source control is achieved | N/A | there is strong suspicion for Group A Streptococcus
[y=386 x=186] Piperacillin-tazobactam | 4.5 g | Q8H | or Toxic Shock Syndrome.
[y=370 x=186] Piperacillin-tazobactam +/-
[y=366 x=630] Levofloxacin and Metronidazole | +/-
[y=361 x=186] Antifungal Coverage in | 4 days after source control OR 8 days in Critical Illness
[y=357 x=14] Perforated Peptic Ulcer Disease | 4.5 g | Q8H | N/A | Antifungal Coverage in high risk/immunocompromised
[y=353 x=186] high
[y=349 x=630] patients: micafungin 100 mg Q24H
[y=345 x=186] risk/immunocompromised
[y=336 x=186] patients
[y=327 x=370] Elective Surgery
[y=317 x=14] Cholecystectomy | Cefazolin | 2 g | One-time dose | 1 dose | Every 4 hours | N/A
[y=303 x=14] Inguinal Hernia | Cefazolin | 2 g | One-time dose | 1 dose | Every 4 hours | Vancomycin x 1 dose if known MRSA colonization
[y=288 x=14] Ventral Hernia | Cefazolin | 2 g | One-time dose | 1 dose | Every 4 hours | Vancomycin x 1 dose if known MRSA colonization
[y=273 x=186] Cefazolin | 2 g
[y=264 x=14] Colectomy | plus | One-time dose | 1 dose | N/A | N/A
[y=256 x=186] Metronidazole | 500 mg
[y=241 x=186] Cefazolin | 2 g | Vancomycin x 1 dose if known MRSA colonization
[y=234 x=14] Colostomy/Ileostomy Reversal | plus | One-time dose | 1 dose | N/A | plus
[y=226 x=630] Metronidazole
[y=223 x=186] Metronidazole | 500 mg
[y=214 x=14] Cardiac & Thoracic | Cefazolin | 2 g | One-time dose | 1 dose | Every 4 hours | Vancomycin x 1 dose if known MRSA colonization
[y=200 x=14] Skin & Soft Tissue | Cefazolin | 2 g | One-time dose | 1 dose | Every 4 hour
[y=196 x=630] Vancomycin x 1 dose if known MRSA colonization
[y=180 x=361] ICU & General Floor
[y=170 x=253] Pharmacy to
[y=162 x=174] Vancomycin | dose | Pharmacy to dose
[y=156 x=12] Hospital Acquired or Ventilator Associated Pneumonia
[y=152 x=174] plus | 7days | N/A | Linezolid
[y=147 x=12] (HAP/VAP)
[y=145 x=174] Piperacillin-tazobactam | 4.5 g | Q8H
[y=119 x=253] Pharmacy to
[y=114 x=174] Vancomycin | Pharmacy to dose | Linezolid
[y=110 x=253] dose
[y=106 x=12] Bacteremia | plus | Depends on Source and Isolated Bacteria | N/A | Antifungal Coverage in high risk/immunocompromised
[y=98 x=174] Piperacillin-tazobactam | Q8H | patients: micafungin 100 mg Q24H
[y=94 x=255] 4.5 g
[y=85 x=12] Complicated Urinary Tract Infection/CAUTI/Urologic Instr Ceftriaxone | 2 g | Q24H | 7 days | N/A | N/A
[y=75 x=12] Uncomplicated Urinary Tract Infection | Sulfamethoxazole-TMP | 800 mg/160 mg Q12H | 3 days | N/A | N/A
[y=65 x=12] Sinusitis | Ampicillin-sulbactam | 3 g | Q6H | 5 days | N/A | N/A
[y=55 x=12] Cellulitis - Purulent (or MRSA risk factors) | Vancomycin | Pharmacy to dos Pharmacy to dose | 5-10 days | N/A | Linezolid
[y=46 x=12] Cellulitis - Non-Purulent | Cefazolin | 2 g | Q8H | 5 days | N/A | N/A

===== PAGE 3 (612×792 pt, 61 text items) =====
[y=748 x=28] Original Publication Date: December 2025 | Practice Management Guidelines
[y=695 x=204] Musculoskeletal Open extremity fractures
[y=669 x=17] Timing and sequence for the treatment of femoral diaphyseal fractures in multiply injured patients:
[y=642 x=17] Hemodynamically stable patients
[y=615 x=35] • | External fixation vs definitive internal fixation within 24 hours of clearance by the trauma team.
[y=589 x=17] Hemodynamically unstable patients
[y=562 x=35] • | Temporary traction vs reduction/splinting for all fractures in the Emergency Department
[y=549 x=35] • | External fixation at first OR visit or once cleared by the trauma team
[y=523 x=17] Open extremity fractures:
[y=496 x=17] Classification:
[y=469 x=53] Gustilo-Anderson | Description
[y=456 x=43] Classification of Open
[y=444 x=72] Fractures
[y=431 x=81] Type I | Open fracture with a wound <1cm long, low energy, without gross
[y=418 x=179] contamination
[y=405 x=79] Type II | Open fracture with a wound 1-10cm long, low energy, without
[y=392 x=179] gross contamination or extensive soft-tissue damage, flaps, or
[y=379 x=179] avulsions
[y=366 x=77] Type III | IIIA: Open fracture with a wound greater than 10cm with adequate
[y=354 x=179] soft-tissue coverage, or any open fracture due to high-energy
[y=341 x=179] trauma or with gross contamination, regardless of the size of the
[y=328 x=179] wound
[y=302 x=179] IIIB: Open fracture with extensive soft-tissue injury or loss, with
[y=289 x=179] periosteal stripping and bone exposure that requires soft-tissue
[y=276 x=179] coverage in the form of muscle rotation or transfer.
[y=250 x=179] IIIC: Open fracture associated with arterial injury requiring repair.
[y=222 x=17] Antibiotics:
[y=195 x=35] • | Timing: Administer within 30 min of arrival to the ED & all patients to have MRSA nasal screen
[y=155 x=35] • | Antimicrobial:
[y=142 x=71] o | Type I & II - Cefazolin 2g IV q8 hours
[y=130 x=71] o | If penicillin allergy: Vancomycin** 15mg/kg IV q12 hours, Pharmacy To Dose Consult
[y=90 x=71] o | Type III - Treatment for ALL Type III: : Cefepime* 2g q8 hours & Vancomycin** 15mg/kg IV q12 hours
[y=78 x=89] Pharmacy To Dose Consult

===== PAGE 4 (612×792 pt, 51 text items) =====
[y=748 x=28] Original Publication Date: December 2025 | Practice Management Guidelines
[y=722 x=35] • | Antimicrobial Cont.
[y=683 x=71] o | Soil, Fecal Contamination, and standing water contamination – Cefepime* 2g q8 hours, Vancomycin**
[y=670 x=89] 15mg/kg IV q12 hours Pharmacy To Dose Consult, & Metronidazole 500mg IV Q8h
[y=630 x=67] Antimicrobial | Adult Dosing (age ≥15 | Pediatric Dosing
[y=617 x=161] years)
[y=603 x=67] Cefazolin* | 2 g IV Q8h | < 60 kg: 33 mg/kg/dose IV Q8h
[y=589 x=294] ≥ 60 kg: 2 g IV Q8h
[y=575 x=67] Cefepime* | 2 g IV Q8h | < 40 kg: 50 mg/kg/dose IV Q12h
[y=562 x=294] ≥ 40 kg: 2 g IV Q12h
[y=548 x=67] Metronidazole | 500 mg IV Q8h | < 37.5 kg: 13.3 mg/kg/dose IV Q8h
[y=534 x=294] ≥ 37.5 kg: 500 mg IV Q8h
[y=507 x=67] Vancomycin** | 15 mg/kg IV Q12h (max | 20 mg/kg/dose IV Q8h (max 1.5g/dose) Vancomycin
[y=494 x=161] 1.5g/dose) | IV - Pharmacy to Dose
[y=480 x=161] Vancomycin IV - Pharmacy
[y=467 x=161] to Dose
[y=453 x=53] *Pharmacy to dose adjust per renal dosing protocol
[y=439 x=53] **Order Vancomycin IV – Pharmacy to Dose for adult and pediatric patients. Suggested dosing listed above. Pharmacy
[y=426 x=53] to adjust based on renal function.
[y=385 x=35] • | Duration:
[y=372 x=71] o | Type I & Type II Fractures – 24 hours
[y=347 x=71] o | Type III – 24 hours after closure or 72 hours (whichever precedes)
[y=308 x=35] • | Operative debridement within 24 hours:
[y=295 x=71] o | Gustilo and Anderson IIIC (vascular injury requiring repair) constitutes an emergency, should be at OR staging
[y=283 x=89] within 2 hours.
[y=257 x=71] o | Type I to IIIB within 12 – 24hrs based on OR availability and patient stability.

===== PAGE 5 (612×792 pt, 6 text items) =====
[y=748 x=28] Original Publication Date: December 2025 | Practice Management Guidelines
[y=274 x=17] Reference Standards:
[y=261 x=17] NHSN Hospital Acquired Pneumonia & VAP
[y=235 x=17] NHSN Catheter Associated Urinary Tract Infection
[y=208 x=17] NHSN Central Line Associated Blood Stream Infection

(pages 6–11, the 2024 antibiogram, omitted: not transcribed into the app)

===== PAGE 12 (612×792 pt, 116 text items) =====
[y=746 x=28] Original Publication Date: December 2025 | Practice Management Guidelines
[y=703 x=276] Reference
[y=686 x=24] 1. | Jones, B. E., Ramirez, J. A., Oren, E., et al. (2025). Diagnosis and management of community-acquired
[y=672 x=42] pneumonia: An official American Thoracic Society clinical practice guideline. | American Journal of
[y=658 x=42] Respiratory and Critical Care Medicine. https://doi.org/10.1164/rccm.202507-1692ST
[y=642 x=24] 2. | Metlay, J. P., Eaterer, G. W., Long, A. C., et al. (2019). Diagnosis and treatment of adults with community-
[y=628 x=42] acquired pneumonia: An official clinical practice guideline of the American Thoracic Society and Infectious
[y=614 x=42] Diseases Society of America. American Journal of Respiratory and Critical Care Medicine, 200(7), e45–e67.
[y=597 x=24] 3. | Fagon, J. Y., Chastre, J., Wolff, M., et al. (2000). Invasive and noninvasive strategies for management of
[y=583 x=42] suspected ventilator-associated pneumonia: A randomized trial. Annals of Internal Medicine, 132, 621–630.
[y=567 x=24] 4. | Guidry, C. A., Mallicote, M. U., Petroze, R. T., Hranjec, T., Rosenberger, L. H., Davies, S. W., & Sawyer, R.
[y=553 x=42] G. (2014). Influence of bronchoscopy on the diagnosis of and outcomes from ventilator-associated pneumonia.
[y=539 x=42] Surgical Infections, 15(5), 527–532.
[y=522 x=24] 5. | Kalil, A. C., Metersky, M. L., Klompas, M., et al. (2016). Management of adults with hospital-acquired and
[y=508 x=42] ventilator-associated pneumonia: 2016 clinical practice guidelines by the Infectious Diseases Society of
[y=495 x=42] America and the American Thoracic Society. Clinical Infectious Diseases, 63(5), e61–e111.
[y=478 x=24] 6. | Sharp, J. P., Magnotti, L. J., Weinberg, J. A., Swanson, J. M., Schoreppel, T. J., Clement, L. P., Wood, G. C.,
[y=464 x=42] Fabian, T. C., & Croce, M. A. (2015). Adherence to an established diagnostic threshold for ventilator-
[y=450 x=42] associated pneumonia contributes to low false-negative rates in trauma patients. The Journal of Trauma and
[y=436 x=42] Acute Care Surgery, 78(3), 468–474.
[y=420 x=24] 7. | Younan, D., Delozier, S. J., Adamski, J., Loudon, A., Violette, A., Ustin, J., Tinkoff, G., Moorman, M. L.,
[y=406 x=42] McQuay, | N., | & | UHRISES | Research | Consortium. | (2020). | Factors | predictive | of | ventilator-associated
[y=392 x=42] pneumonia | in | critically | ill | trauma | patients. | World | Journal | of | Surgery, | 44(4), | 1121–1125.
[y=378 x=42] https://doi.org/10.1007/s00268-019-05286-3
[y=361 x=24] 8. | Joung, M. K., Lee, J., Moon, S. Y., et al. (2011). Impact of de-escalation therapy on clinical outcomes for
[y=348 x=42] intensive care unit-acquired pneumonia. Critical Care, 15(2), R79.
[y=331 x=24] 9. | De Bus, L., Depuydt, P., Steen, J., et al. (2020). Antimicrobial de-escalation in the critically ill patient and
[y=317 x=42] assessment of clinical cure: The DIANA study. Intensive Care Medicine, 46(7), 1404–141
[y=300 x=24] 10. Bultas, A. C., Bery, A. I., Deal, E. N., Hartmann, A. P., Richter, S. K., & Call, W. B. (2019). Predictors of
[y=286 x=42] treatment | failure | following | de-escalation | to | a | fluoroquinolone | in | culture-negative | nosocomial
[y=273 x=42] pneumonia.Annals of Pharmacotherapy, 53(12), 1207–1219.
[y=256 x=24] 11. Raman, K., Nailor, M. D., Nicolau, D. P., Aslanzadeh, J., Nadeau, M., & Kuti, J. L. (2013). Early antibiotic
[y=242 x=42] discontinuation in patients with clinically suspected ventilator-associated pneumonia and negative quantitative
[y=228 x=42] bronchoscopy | cultures. | Critical | Care | Medicine, | 41(7), | 1656–1663.
[y=214 x=42] https://doi.org/10.1097/CCM.0b013e318287f713
[y=198 x=24] 12. Vanderbilt University Medical Center, Division of Acute Care Surgery. (2025). Infectious workup and
[y=184 x=42] antimicrobial stewardship guideline. https://www.vumc.org
[y=167 x=24] 13. UTHealth Houston. (2022, February). Antibiotic therapy. McGovern Medical School, Department of Surgery.
[y=153 x=42] https://med.uth.edu/surgery/antibiotic-therapy/
[y=29 x=301] 11

---

## src/data/pmg.js (924 lines, git HEAD 1f1f450, sha256 e788ad0f…)

```js
   1  // Acute Care Surgery MU Health — Antibiotic Practice Management Guideline
   2  // (original publication date December 2025), transcribed for bedside use.
   3  //
   4  // EVERY VALUE IN THIS FILE IS CLINICAL CONTENT. It was transcribed from the
   5  // source PDF (public/MU-ACS-Antibiotic-PMG-2025-12-<hash>.pdf) page by page,
   6  // with the rendered page images open beside the extracted text. `npm run verify`
   7  // (scripts/verify-pmg.mjs) re-reads the PDF and compares, cell by cell and in
   8  // both directions, everything it can read: the four indication tables (pages
   9  // 1–2, including which section each row sits under), the open-fracture
  10  // statements and the regimens displayed for them (pages 3–4), the dosing table
  11  // (page 4), the three link targets on page 5 and the 13 references. It cannot
  12  // read the page-5 flowchart (an image), does not judge the `short` labels or
  13  // `aliases`, and cannot tell whether the PDF itself is right. A physician still
  14  // has to read the source.
  15  //
  16  // Spelling in `name`, `duration`, `redose` and `alternative` follows the PDF,
  17  // except for the typos listed in `transcription.corrections` below — the
  18  // verifier applies the same corrections to the PDF text before comparing.
  19  //
  20  // Column semantics follow the PDF's own headers:
  21  //   regimen      "Antibiotic" + "Dose" + "Frequency" (entries joined by "plus")
  22  //   duration     "Duration"
  23  //   redose       "Redose" (intra-operative redosing)
  24  //   alternative  "PNC Allergy/Alternative" — in the PDF this column carries the
  25  //                penicillin-allergy regimen for most rows, but also contamination
  26  //                escalation (skull fractures), MRSA-colonization add-ons (elective
  27  //                surgery) and the NSTI clindamycin note. It is kept as one field
  28  //                with the PDF's own label so nothing is re-interpreted here.
  29  //   null         the PDF prints "N/A" in that cell.
  30  
  31  export const source = {
  32    title: "Acute Care Surgery MU Health Antibiotic Practice Management Guideline",
  33    shortTitle: "ACS Antibiotic PMG",
  34    publisher: "Acute Care Surgery, University of Missouri Health Care",
  35    publicationDate: "December 2025",
  36    // The filename carries the first 12 hex digits of sha256, so a new edition of
  37    // the PDF is a new URL — nothing can serve a stale copy under a reused name.
  38    file: "MU-ACS-Antibiotic-PMG-2025-12-d30e2ba07845.pdf",
  39    sha256: "d30e2ba07845d5882f31a2903c3f1efc1ed2ebf36bd83637871abe81a7b5538d",
  40    pages: 12,
  41    // The PDF's own framing, page 1.
  42    intro:
  43      "This Practice Management Guideline provides standardized, diagnosis-specific antibiotic recommendations derived from contemporary national guidance including the Infectious Disease Society of America, Surgical Infection Society, the American Association for the Surgery of Trauma, and other authoritative bodies — and aligned with our institution's local microbiologic trends and antibiogram.",
  44  };
  45  
  46  export const sections = [
  47    {
  48      id: "trauma",
  49      title: "Trauma",
  50      rowLabel: "Injury",
  51      page: 1,
  52      hue: "trauma",
  53      blurb: "Prophylaxis by injury pattern, with intra-operative redosing triggers.",
  54    },
  55    {
  56      id: "egs",
  57      title: "Emergency General Surgery",
  58      rowLabel: "Diagnosis",
  59      page: 2,
  60      hue: "egs",
  61      blurb: "Empiric therapy and duration by source-control status.",
  62    },
  63    {
  64      id: "elective",
  65      title: "Elective Surgery",
  66      rowLabel: "Procedure",
  67      page: 2,
  68      hue: "elective",
  69      blurb: "One-time dose; vancomycin added if known MRSA colonization.",
  70    },
  71    {
  72      id: "inpatient",
  73      title: "ICU & General Floor",
  74      rowLabel: "Infection",
  75      page: 2,
  76      hue: "inpatient",
  77      blurb: "Hospital-onset infections treated by the surgical services.",
  78    },
  79  ];
  80  
  81  // Intra-operative redose rule that several trauma rows share, verbatim from the PDF
  82  // (one typo corrected: "transfustion").
  83  const TRAUMA_REDOSE = "Every 4 hours or with >1500ml blood loss or > 10 units blood transfusion";
  84  
  85  export const indications = [
  86    // ───────────────────────────── Trauma (page 1) ─────────────────────────────
  87    {
  88      id: "abdominal-trauma",
  89      section: "trauma",
  90      page: 1,
  91      name: "Abdominal Trauma with/or without Hollow Viscus Injury",
  92      short: "Abdominal trauma ± hollow viscus injury",
  93      aliases: ["abdominal injury", "hollow viscus", "bowel injury", "penetrating abdomen", "laparotomy"],
  94      regimen: [
  95        { drug: "Cefazolin", dose: "2 g", frequency: "Q8H" },
  96        { drug: "Metronidazole", dose: "500 mg", frequency: "Q12H" },
  97      ],
  98      duration: ["24 hours", "OR", "4 days after source control (consider monotherapy Zosyn)"],
  99      redose: TRAUMA_REDOSE,
 100      alternative: "Levofloxacin and Metronidazole",
 101    },
 102    {
 103      id: "chest-tubes",
 104      section: "trauma",
 105      page: 1,
 106      name: "Chest Tubes",
 107      short: "Chest tubes",
 108      aliases: ["tube thoracostomy", "thoracostomy", "pigtail", "hemothorax", "pneumothorax"],
 109      regimen: null,
 110      duration: null,
 111      redose: null,
 112      alternative: null,
 113    },
 114    {
 115      id: "craniotomy",
 116      section: "trauma",
 117      page: 1,
 118      name: "Craniotomy",
 119      short: "Craniotomy",
 120      aliases: ["crani", "neurosurgery"],
 121      regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "Q8H" }],
 122      duration: ["24 hours"],
 123      redose: null,
 124      alternative: null,
 125    },
 126    {
 127      id: "open-skull-fracture",
 128      section: "trauma",
 129      page: 1,
 130      name: "Open Skull Fracture",
 131      short: "Open skull fracture",
 132      aliases: ["depressed skull fracture", "skull fx"],
 133      regimen: [{ drug: "Ceftriaxone", dose: "2 g", frequency: "Q12H" }],
 134      duration: ["24 hours after closure or 72 hours total, whichever is shortest"],
 135      redose: null,
 136      alternative: "Contamination: ceftriaxone and Metronidazole x 72 hours",
 137    },
 138    {
 139      id: "penetrating-brain-injury",
 140      section: "trauma",
 141      page: 1,
 142      name: "Penetrating Brain/CNS Injury",
 143      short: "Penetrating brain / CNS injury",
 144      aliases: ["GSW head", "penetrating head injury", "TBI"],
 145      regimen: [{ drug: "Ceftriaxone", dose: "2 g", frequency: "Q12H" }],
 146      duration: ["24 hours after closure or 72 hours total, whichever is shortest"],
 147      redose: null,
 148      alternative: "Contamination: ceftriaxone and Metronidazole x 72 hours",
 149    },
 150    {
 151      id: "ventriculostomy",
 152      section: "trauma",
 153      page: 1,
 154      name: "Ventriculostomy or ICP Monitor",
 155      short: "Ventriculostomy / ICP monitor",
 156      aliases: ["EVD", "external ventricular drain", "bolt", "ICP"],
 157      regimen: null,
 158      duration: null,
 159      redose: null,
 160      alternative: null,
 161    },
 162    {
 163      id: "pneumocephaly",
 164      section: "trauma",
 165      page: 1,
 166      name: "Pneumocephaly",
 167      short: "Pneumocephaly",
 168      aliases: ["pneumocephalus", "intracranial air"],
 169      regimen: null,
 170      duration: null,
 171      redose: null,
 172      alternative: null,
 173    },
 174    {
 175      id: "csf-leak",
 176      section: "trauma",
 177      page: 1,
 178      name: "CSF Leak",
 179      short: "CSF leak",
 180      aliases: ["rhinorrhea", "otorrhea", "basilar skull fracture"],
 181      regimen: null,
 182      duration: null,
 183      redose: null,
 184      alternative: null,
 185    },
 186    {
 187      id: "open-face-fracture",
 188      section: "trauma",
 189      page: 1,
 190      name: "Open Face Fracture/Mandible Fracture",
 191      short: "Open facial / mandible fracture",
 192      aliases: ["mandible", "facial fracture", "maxillofacial", "Le Fort", "open facial fracture"],
 193      regimen: [{ drug: "Ampicillin-sulbactam", dose: "3 g", frequency: "Q6H" }],
 194      duration: ["24 hours after closure or 72 hours total, whichever is shortest"],
 195      redose: null,
 196      alternative: "Clindamycin 600mg q8 hours",
 197    },
 198    {
 199      id: "closed-face-fracture",
 200      section: "trauma",
 201      page: 1,
 202      name: "Closed or Non-operative Face Fracture",
 203      short: "Closed / non-operative facial fracture",
 204      aliases: ["orbital fracture", "nasal fracture", "zygoma", "closed facial fracture"],
 205      regimen: null,
 206      duration: null,
 207      redose: null,
 208      alternative: null,
 209    },
 210    {
 211      id: "gu-trauma",
 212      section: "trauma",
 213      page: 1,
 214      name: "GU Trauma",
 215      short: "GU trauma",
 216      aliases: ["genitourinary", "bladder injury", "renal laceration", "kidney injury", "urethral injury"],
 217      regimen: [
 218        { drug: "Cefazolin", dose: "2 g", frequency: "Q8H" },
 219        { drug: "Metronidazole", dose: "500 mg", frequency: "Q12H" },
 220      ],
 221      duration: ["24 hours"],
 222      redose: TRAUMA_REDOSE,
 223      alternative: "Levofloxacin and Metronidazole",
 224    },
 225    {
 226      id: "vascular-trauma",
 227      section: "trauma",
 228      page: 1,
 229      name: "Vascular",
 230      short: "Vascular",
 231      aliases: ["vascular injury", "arterial injury", "vascular repair"],
 232      regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "Q8H" }],
 233      duration: ["24 hours"],
 234      redose: TRAUMA_REDOSE,
 235      alternative: "Vancomycin – Pharmacy to dose",
 236    },
 237  
 238    // ───────────────────── Emergency General Surgery (page 2) ─────────────────────
 239    {
 240      id: "appendicitis",
 241      section: "egs",
 242      page: 2,
 243      name: "Appendicitis",
 244      short: "Appendicitis",
 245      aliases: ["appy", "appendectomy", "perforated appendix"],
 246      regimen: [
 247        { drug: "Ceftriaxone", dose: "2 g", frequency: "Q24H" },
 248        { drug: "Metronidazole", dose: "500 mg", frequency: "Q12H" },
 249      ],
 250      duration: [
 251        "Post Appendectomy, non-perforated: 24 hours",
 252        "Perforated with source control: 4 days OR 8 days in Critical Illness",
 253        "Perforated without source control: 8 days",
 254      ],
 255      redose: null,
 256      alternative: ["Levofloxacin plus Metronidazole", "or", "Ertapenem 1 g Q24H"],
 257    },
 258    {
 259      id: "diverticulitis-source-control",
 260      section: "egs",
 261      page: 2,
 262      name: "Diverticulitis with Source Control",
 263      short: "Diverticulitis — with source control",
 264      aliases: ["tics", "diverticular abscess drained", "sigmoid colectomy"],
 265      regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
 266      duration: ["4 days after source control OR 8 days in Critical Illness"],
 267      redose: null,
 268      alternative: ["Levofloxacin and Metronidazole", "or", "Ertapenem"],
 269    },
 270    {
 271      id: "diverticulitis-no-source-control",
 272      section: "egs",
 273      page: 2,
 274      name: "Diverticulitis without Source Control",
 275      short: "Diverticulitis — without source control",
 276      aliases: ["tics", "complicated diverticulitis", "diverticular abscess"],
 277      regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
 278      duration: ["8 days"],
 279      redose: null,
 280      alternative: ["Levofloxacin and Metronidazole", "or", "Ertapenem"],
 281    },
 282    {
 283      id: "cholecystitis",
 284      section: "egs",
 285      page: 2,
 286      name: "Cholecystitis",
 287      short: "Cholecystitis",
 288      aliases: ["chole", "gallbladder", "cholecystostomy", "PCT", "biliary"],
 289      regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
 290      duration: [
 291        "Post Cholecystectomy with local inflammation: 24 hours",
 292        "Perforated with source control (includes PCT): 4 days",
 293        "Perforated without source control: 8 days",
 294      ],
 295      redose: null,
 296      alternative: "Levofloxacin and Metronidazole",
 297    },
 298    {
 299      id: "sbo-necrosis",
 300      section: "egs",
 301      page: 2,
 302      name: "Small bowel Obstruction with Necrosis or Bowel Resection",
 303      short: "SBO — with necrosis or bowel resection",
 304      aliases: ["SBO", "small bowel obstruction", "ischemic bowel", "dead bowel", "bowel resection", "strangulated"],
 305      regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
 306      duration: ["4 days after source control OR 8 days in Critical Illness"],
 307      redose: null,
 308      alternative: "Levofloxacin and Metronidazole",
 309    },
 310    {
 311      id: "sbo-no-necrosis",
 312      section: "egs",
 313      page: 2,
 314      name: "Small bowel Obstruction without Necrosis or Bowel Resection",
 315      short: "SBO — without necrosis or bowel resection",
 316      aliases: ["SBO", "small bowel obstruction", "adhesiolysis", "lysis of adhesions"],
 317      regimen: [
 318        { drug: "Cefazolin", dose: "2 g", frequency: "Q8H" },
 319        { drug: "Metronidazole", dose: "500 mg", frequency: "Q12H" },
 320      ],
 321      duration: ["24 hours"],
 322      redose: null,
 323      alternative: "Levofloxacin and Metronidazole",
 324    },
 325    {
 326      id: "nsti",
 327      section: "egs",
 328      page: 2,
 329      name: "Necrotizing Soft Tissue Infection",
 330      short: "Necrotizing soft tissue infection",
 331      aliases: ["NSTI", "nec fasc", "necrotizing fasciitis", "Fournier", "gas gangrene", "myonecrosis"],
 332      regimen: [
 333        { drug: "Linezolid", dose: "600 mg", frequency: "Q12H" },
 334        { drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" },
 335      ],
 336      duration: ["48-72 hours after source control is achieved"],
 337      redose: null,
 338      alternative:
 339        "The addition of clindamycin is recommended when there is strong suspicion for Group A Streptococcus or Toxic Shock Syndrome.",
 340    },
 341    {
 342      id: "perforated-pud",
 343      section: "egs",
 344      page: 2,
 345      name: "Perforated Peptic Ulcer Disease",
 346      short: "Perforated peptic ulcer",
 347      aliases: ["PUD", "perforated ulcer", "perforated viscus", "free air", "duodenal ulcer", "gastric ulcer", "Graham patch"],
 348      regimen: [{ drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" }],
 349      regimenNote: "+/- Antifungal Coverage in high risk/immunocompromised patients",
 350      duration: ["4 days after source control OR 8 days in Critical Illness"],
 351      redose: null,
 352      alternative: [
 353        "Levofloxacin and Metronidazole",
 354        "+/-",
 355        "Antifungal Coverage in high risk/immunocompromised patients: micafungin 100 mg Q24H",
 356      ],
 357    },
 358  
 359    // ─────────────────────────── Elective Surgery (page 2) ───────────────────────────
 360    {
 361      id: "cholecystectomy",
 362      section: "elective",
 363      page: 2,
 364      name: "Cholecystectomy",
 365      short: "Cholecystectomy",
 366      aliases: ["lap chole", "elective chole"],
 367      regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
 368      duration: ["1 dose"],
 369      redose: "Every 4 hours",
 370      alternative: null,
 371    },
 372    {
 373      id: "inguinal-hernia",
 374      section: "elective",
 375      page: 2,
 376      name: "Inguinal Hernia",
 377      short: "Inguinal hernia",
 378      aliases: ["hernia repair", "herniorrhaphy"],
 379      regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
 380      duration: ["1 dose"],
 381      redose: "Every 4 hours",
 382      alternative: "Vancomycin x 1 dose if known MRSA colonization",
 383    },
 384    {
 385      id: "ventral-hernia",
 386      section: "elective",
 387      page: 2,
 388      name: "Ventral Hernia",
 389      short: "Ventral hernia",
 390      aliases: ["incisional hernia", "umbilical hernia", "hernia repair"],
 391      regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
 392      duration: ["1 dose"],
 393      redose: "Every 4 hours",
 394      alternative: "Vancomycin x 1 dose if known MRSA colonization",
 395    },
 396    {
 397      id: "colectomy",
 398      section: "elective",
 399      page: 2,
 400      name: "Colectomy",
 401      short: "Colectomy",
 402      aliases: ["colon resection", "hemicolectomy", "bowel prep"],
 403      regimen: [
 404        { drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" },
 405        { drug: "Metronidazole", dose: "500 mg", frequency: "One-time dose" },
 406      ],
 407      duration: ["1 dose"],
 408      redose: null,
 409      alternative: null,
 410    },
 411    {
 412      id: "ostomy-reversal",
 413      section: "elective",
 414      page: 2,
 415      name: "Colostomy/Ileostomy Reversal",
 416      short: "Colostomy / ileostomy reversal",
 417      aliases: ["ostomy takedown", "Hartmann reversal", "stoma reversal"],
 418      regimen: [
 419        { drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" },
 420        { drug: "Metronidazole", dose: "500 mg", frequency: "One-time dose" },
 421      ],
 422      duration: ["1 dose"],
 423      redose: null,
 424      alternative: ["Vancomycin x 1 dose if known MRSA colonization", "plus", "Metronidazole"],
 425    },
 426    {
 427      id: "cardiac-thoracic",
 428      section: "elective",
 429      page: 2,
 430      name: "Cardiac & Thoracic",
 431      short: "Cardiac & thoracic",
 432      aliases: ["thoracotomy", "VATS", "sternotomy", "lobectomy"],
 433      regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
 434      duration: ["1 dose"],
 435      redose: "Every 4 hours",
 436      alternative: "Vancomycin x 1 dose if known MRSA colonization",
 437    },
 438    {
 439      id: "skin-soft-tissue",
 440      section: "elective",
 441      page: 2,
 442      name: "Skin & Soft Tissue",
 443      short: "Skin & soft tissue",
 444      aliases: ["SSTI procedure", "I&D", "soft tissue excision", "skin procedure"],
 445      regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "One-time dose" }],
 446      duration: ["1 dose"],
 447      redose: "Every 4 hours",
 448      alternative: "Vancomycin x 1 dose if known MRSA colonization",
 449    },
 450  
 451    // ───────────────────────── ICU & General Floor (page 2) ─────────────────────────
 452    {
 453      id: "hap-vap",
 454      section: "inpatient",
 455      page: 2,
 456      name: "Hospital Acquired or Ventilator Associated Pneumonia (HAP/VAP)",
 457      short: "HAP / VAP",
 458      aliases: ["HAP", "VAP", "pneumonia", "ventilator", "nosocomial pneumonia"],
 459      regimen: [
 460        { drug: "Vancomycin", dose: "Pharmacy to dose", frequency: "Pharmacy to dose" },
 461        { drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" },
 462      ],
 463      duration: ["7 days"],
 464      redose: null,
 465      alternative: "Linezolid",
 466    },
 467    {
 468      id: "bacteremia",
 469      section: "inpatient",
 470      page: 2,
 471      name: "Bacteremia",
 472      short: "Bacteremia",
 473      aliases: ["positive blood culture", "sepsis", "line infection", "CLABSI", "bloodstream infection"],
 474      regimen: [
 475        { drug: "Vancomycin", dose: "Pharmacy to dose", frequency: "Pharmacy to dose" },
 476        { drug: "Piperacillin-tazobactam", dose: "4.5 g", frequency: "Q8H" },
 477      ],
 478      duration: ["Depends on Source and Isolated Bacteria"],
 479      redose: null,
 480      alternative: [
 481        "Linezolid",
 482        "Antifungal Coverage in high risk/immunocompromised patients: micafungin 100 mg Q24H",
 483      ],
 484    },
 485    {
 486      id: "complicated-uti",
 487      section: "inpatient",
 488      page: 2,
 489      // The PDF cell is cut off at "Urologic Instr"; the intended word is
 490      // instrumentation. The verifier matches on the printed prefix.
 491      name: "Complicated Urinary Tract Infection/CAUTI/Urologic Instrumentation",
 492      short: "Complicated UTI / CAUTI / urologic instrumentation",
 493      aliases: ["CAUTI", "complicated UTI", "catheter", "Foley", "urosepsis", "pyelonephritis", "instrumentation"],
 494      regimen: [{ drug: "Ceftriaxone", dose: "2 g", frequency: "Q24H" }],
 495      duration: ["7 days"],
 496      redose: null,
 497      alternative: null,
 498    },
 499    {
 500      id: "uncomplicated-uti",
 501      section: "inpatient",
 502      page: 2,
 503      name: "Uncomplicated Urinary Tract Infection",
 504      short: "Uncomplicated UTI",
 505      aliases: ["UTI", "cystitis", "simple UTI", "Bactrim"],
 506      regimen: [{ drug: "Sulfamethoxazole-TMP", dose: "800 mg/160 mg", frequency: "Q12H" }],
 507      duration: ["3 days"],
 508      redose: null,
 509      alternative: null,
 510    },
 511    {
 512      id: "sinusitis",
 513      section: "inpatient",
 514      page: 2,
 515      name: "Sinusitis",
 516      short: "Sinusitis",
 517      aliases: ["sinus", "nosocomial sinusitis", "NG tube sinusitis"],
 518      regimen: [{ drug: "Ampicillin-sulbactam", dose: "3 g", frequency: "Q6H" }],
 519      duration: ["5 days"],
 520      redose: null,
 521      alternative: null,
 522    },
 523    {
 524      id: "cellulitis-purulent",
 525      section: "inpatient",
 526      page: 2,
 527      name: "Cellulitis - Purulent (or MRSA risk factors)",
 528      short: "Cellulitis — purulent / MRSA risk",
 529      aliases: ["abscess", "MRSA", "purulent cellulitis", "SSTI", "skin infection"],
 530      regimen: [{ drug: "Vancomycin", dose: "Pharmacy to dose", frequency: "Pharmacy to dose" }],
 531      duration: ["5-10 days"],
 532      redose: null,
 533      alternative: "Linezolid",
 534    },
 535    {
 536      id: "cellulitis-nonpurulent",
 537      section: "inpatient",
 538      page: 2,
 539      name: "Cellulitis - Non-Purulent",
 540      short: "Cellulitis — non-purulent",
 541      aliases: ["erysipelas", "simple cellulitis", "SSTI", "skin infection"],
 542      regimen: [{ drug: "Cefazolin", dose: "2 g", frequency: "Q8H" }],
 543      duration: ["5 days"],
 544      redose: null,
 545      alternative: null,
 546    },
 547  ];
 548  
 549  // ─────────────────── Musculoskeletal: open extremity fractures (pages 3–4) ───────────────────
 550  export const openFractures = {
 551    title: "Musculoskeletal Open extremity fractures",
 552    pages: [3, 4],
 553    timing: "Administer within 30 min of arrival to the ED & all patients to have MRSA nasal screen",
 554    classification: {
 555      title: "Gustilo-Anderson Classification of Open Fractures",
 556      types: [
 557        {
 558          type: "Type I",
 559          description: "Open fracture with a wound <1cm long, low energy, without gross contamination",
 560        },
 561        {
 562          type: "Type II",
 563          description:
 564            "Open fracture with a wound 1-10cm long, low energy, without gross contamination or extensive soft-tissue damage, flaps, or avulsions",
 565        },
 566        {
 567          type: "Type III",
 568          subtypes: [
 569            {
 570              code: "IIIA",
 571              description:
 572                "Open fracture with a wound greater than 10cm with adequate soft-tissue coverage, or any open fracture due to high-energy trauma or with gross contamination, regardless of the size of the wound",
 573            },
 574            {
 575              code: "IIIB",
 576              description:
 577                "Open fracture with extensive soft-tissue injury or loss, with periosteal stripping and bone exposure that requires soft-tissue coverage in the form of muscle rotation or transfer.",
 578            },
 579            {
 580              code: "IIIC",
 581              description: "Open fracture associated with arterial injury requiring repair.",
 582            },
 583          ],
 584        },
 585      ],
 586    },
 587    // "Antimicrobial" bullets, pages 3–4. `text` is the PDF's wording under the
 588    // printed label `applies`; `regimen` is the same content split for display.
 589    // The verifier checks `applies` + `text` against the page as one phrase, and
 590    // requires `regimen` (drug + footnote mark + dose + route + frequency + note,
 591    // in order) to re-state `text` exactly — so the displayed tuples cannot drift
 592    // from the verified prose. `footnote` keys point into dosingTable.footnotes
 593    // ("*" renal adjustment, "**" pharmacy-to-dose), as the PDF marks them.
 594    antimicrobial: [
 595      {
 596        id: "type-1-2",
 597        page: 3,
 598        applies: "Type I & II",
 599        text: "Cefazolin 2g IV q8 hours",
 600        regimen: [{ drug: "Cefazolin", dose: "2 g", route: "IV", frequency: "q8 hours" }],
 601      },
 602      {
 603        id: "pcn-allergy",
 604        page: 3,
 605        applies: "If penicillin allergy",
 606        text: "Vancomycin** 15mg/kg IV q12 hours, Pharmacy To Dose Consult",
 607        regimen: [
 608          {
 609            drug: "Vancomycin",
 610            footnote: "pharmacy",
 611            dose: "15 mg/kg",
 612            route: "IV",
 613            frequency: "q12 hours",
 614            note: "Pharmacy To Dose Consult",
 615          },
 616        ],
 617      },
 618      {
 619        id: "type-3",
 620        page: 3,
 621        applies: "Type III — treatment for ALL Type III",
 622        text: "Cefepime* 2g q8 hours & Vancomycin** 15mg/kg IV q12 hours Pharmacy To Dose Consult",
 623        regimen: [
 624          { drug: "Cefepime", footnote: "renal", dose: "2 g", frequency: "q8 hours" },
 625          {
 626            drug: "Vancomycin",
 627            footnote: "pharmacy",
 628            dose: "15 mg/kg",
 629            route: "IV",
 630            frequency: "q12 hours",
 631            note: "Pharmacy To Dose Consult",
 632          },
 633        ],
 634      },
 635      {
 636        id: "contamination",
 637        page: 4,
 638        applies: "Soil, fecal contamination, and standing water contamination",
 639        text: "Cefepime* 2g q8 hours, Vancomycin** 15mg/kg IV q12 hours Pharmacy To Dose Consult, & Metronidazole 500mg IV Q8h",
 640        regimen: [
 641          { drug: "Cefepime", footnote: "renal", dose: "2 g", frequency: "q8 hours" },
 642          {
 643            drug: "Vancomycin",
 644            footnote: "pharmacy",
 645            dose: "15 mg/kg",
 646            route: "IV",
 647            frequency: "q12 hours",
 648            note: "Pharmacy To Dose Consult",
 649          },
 650          { drug: "Metronidazole", dose: "500 mg", route: "IV", frequency: "Q8h" },
 651        ],
 652      },
 653    ],
 654    duration: [
 655      { applies: "Type I & Type II Fractures", value: "24 hours" },
 656      { applies: "Type III", value: "24 hours after closure or 72 hours (whichever precedes)" },
 657    ],
 658    debridement: {
 659      heading: "Operative debridement within 24 hours",
 660      items: [
 661        "Gustilo and Anderson IIIC (vascular injury requiring repair) constitutes an emergency, should be at OR staging within 2 hours.",
 662        "Type I to IIIB within 12 – 24hrs based on OR availability and patient stability.",
 663      ],
 664    },
 665    femoralShaft: {
 666      heading: "Timing and sequence for the treatment of femoral diaphyseal fractures in multiply injured patients",
 667      stable: {
 668        label: "Hemodynamically stable patients",
 669        items: ["External fixation vs definitive internal fixation within 24 hours of clearance by the trauma team."],
 670      },
 671      unstable: {
 672        label: "Hemodynamically unstable patients",
 673        items: [
 674          "Temporary traction vs reduction/splinting for all fractures in the Emergency Department",
 675          "External fixation at first OR visit or once cleared by the trauma team",
 676        ],
 677      },
 678    },
 679  };
 680  
 681  // Dosing table printed on page 4 (open-fracture antimicrobials).
 682  export const dosingTable = {
 683    page: 4,
 684    adultLabel: "Adult Dosing (age ≥15 years)",
 685    pediatricLabel: "Pediatric Dosing",
 686    rows: [
 687      {
 688        drug: "Cefazolin",
 689        footnote: "renal",
 690        adult: ["2 g IV Q8h"],
 691        pediatric: ["< 60 kg: 33 mg/kg/dose IV Q8h", "≥ 60 kg: 2 g IV Q8h"],
 692      },
 693      {
 694        drug: "Cefepime",
 695        footnote: "renal",
 696        adult: ["2 g IV Q8h"],
 697        pediatric: ["< 40 kg: 50 mg/kg/dose IV Q12h", "≥ 40 kg: 2 g IV Q12h"],
 698      },
 699      {
 700        drug: "Metronidazole",
 701        footnote: null,
 702        adult: ["500 mg IV Q8h"],
 703        pediatric: ["< 37.5 kg: 13.3 mg/kg/dose IV Q8h", "≥ 37.5 kg: 500 mg IV Q8h"],
 704      },
 705      {
 706        drug: "Vancomycin",
 707        footnote: "pharmacy",
 708        adult: ["15 mg/kg IV Q12h (max 1.5g/dose)", "Vancomycin IV - Pharmacy to Dose"],
 709        pediatric: ["20 mg/kg/dose IV Q8h (max 1.5g/dose)", "Vancomycin IV - Pharmacy to Dose"],
 710      },
 711    ],
 712    footnotes: {
 713      renal: { mark: "*", text: "Pharmacy to dose adjust per renal dosing protocol" },
 714      pharmacy: {
 715        mark: "**",
 716        text: "Order Vancomycin IV – Pharmacy to Dose for adult and pediatric patients. Suggested dosing listed above. Pharmacy to adjust based on renal function.",
 717      },
 718    },
 719  };
 720  
 721  // Page 5 is a flowchart embedded as an IMAGE — no text layer. This is a reading
 722  // of that image, structured as steps, and cannot be machine-verified. The three
 723  // "Reference Standards" links below ARE verified: the PDF's link annotations are
 724  // Bing click-tracking URLs whose encoded target decodes to these CDC pages.
 725  export const feverWorkup = {
 726    page: 5,
 727    title: "Infectious Workup and Antimicrobial Guideline",
 728    trigger: "Temp >38.0 °C or 100.4 °F",
 729    transcribedFromImage: true,
 730    branches: [
 731      {
 732        id: "pneumonia",
 733        title: "Suspected pneumonia",
 734        criteria: {
 735          lead: "New, persistent, or progressive infiltrate PLUS any TWO of the following:",
 736          items: [
 737            "Purulent secretions",
 738            "Decline in pulmonary status such as: worsening hypoxemia, ventilator compliance, elevated inspiratory pressures",
 739            "Fever (>38.0)",
 740            "Unexplained leukocytosis",
 741            "New onset delirium",
 742          ],
 743        },
 744        steps: [
 745          "ETT or tracheostomy → perform bronchoscopy with BAL or obtain QTL",
 746          "Start empiric pneumonia antibiotics",
 747          "Adjust / de-escalate therapy per culture and sensitivity:",
 748        ],
 749        outcomes: [
 750          "≥ 10⁴ CFU/mL → narrow spectrum × 7 days (total)",
 751          "≤ 10⁴ CFU/mL, negative cultures, or oropharyngeal flora → stop antibiotic therapy",
 752        ],
 753      },
 754      {
 755        id: "central-line",
 756        title: "Suspected central line",
 757        criteria: { lead: "Central line >72 h with purulence at site?", items: [] },
 758        steps: [],
 759        outcomes: ["YES → D/C CVC and replace at new site if indicated", "NO → Stop"],
 760        note: "Blood cultures should only be obtained when other potential sources have been ruled out.",
 761      },
 762      {
 763        id: "uti",
 764        title: "Suspected UTI",
 765        preface: "For uncomplicated UTI, use AgileMD Pathway for diagnosis & antibiotic selection.",
 766        criteria: {
 767          lead: "ONE of the following (unless signs of sepsis):",
 768          items: [
 769            "Fever >38.5",
 770            "Unexplained hypotension",
 771            "New urinary frequency, urgency, dysuria",
 772            "Suprapubic pain",
 773            "Flank pain",
 774            "Spasticity or autonomic dysreflexia",
 775            "Unexplained rising leukocytosis",
 776          ],
 777        },
 778        steps: ["YES → obtain urinalysis with reflexive culture", "NO → no UA indicated; investigate other sources"],
 779        outcomes: [
 780          "> 10 WBC → (repeat UA if >2 squamous cells) → start empiric antibiotics",
 781          "< 10 WBC → investigate other source",
 782          "<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics",
 783        ],
 784      },
 785    ],
 786    referenceStandards: [
 787      {
 788        label: "NHSN Hospital Acquired Pneumonia & VAP",
 789        url: "https://www.cdc.gov/nhsn/pdfs/pscmanual/6pscvapcurrent.pdf",
 790      },
 791      {
 792        label: "NHSN Catheter Associated Urinary Tract Infection",
 793        url: "https://www.cdc.gov/nhsn/pdfs/pscmanual/7psccauticurrent.pdf",
 794      },
 795      {
 796        label: "NHSN Central Line Associated Blood Stream Infection",
 797        url: "https://www.cdc.gov/clabsi/about/index.html",
 798      },
 799    ],
 800  };
 801  
 802  // Pages 6–11 reproduce the MU Health University Hospital antibiogram for
 803  // January–December 2024 (gram-positive, gram-negative, ED, ICU, Candida and
 804  // Children's Hospital tables). The live MUHC Antibiogram app carries the newer
 805  // 2025 dataset, so this app links to it instead of re-typing superseded tables.
 806  export const antibiogram = {
 807    pages: [6, 11],
 808    period: "January 1 – December 31, 2024 (Candida and Children's tables: 2021–2024)",
 809    appUrl: "https://muhc-antibiogram.web.app",
 810    appName: "MUHC Antibiogram",
 811    appNote: "Current data (2025 isolates), searchable by organism, drug and unit.",
 812  };
 813  
 814  // Page 12 ("11" in the PDF's own numbering).
 815  export const references = [
 816    {
 817      n: 1,
 818      text: "Jones, B. E., Ramirez, J. A., Oren, E., et al. (2025). Diagnosis and management of community-acquired pneumonia: An official American Thoracic Society clinical practice guideline. American Journal of Respiratory and Critical Care Medicine.",
 819      url: "https://doi.org/10.1164/rccm.202507-1692ST",
 820    },
 821    {
 822      n: 2,
 823      text: "Metlay, J. P., Eaterer, G. W., Long, A. C., et al. (2019). Diagnosis and treatment of adults with community-acquired pneumonia: An official clinical practice guideline of the American Thoracic Society and Infectious Diseases Society of America. American Journal of Respiratory and Critical Care Medicine, 200(7), e45–e67.",
 824    },
 825    {
 826      n: 3,
 827      text: "Fagon, J. Y., Chastre, J., Wolff, M., et al. (2000). Invasive and noninvasive strategies for management of suspected ventilator-associated pneumonia: A randomized trial. Annals of Internal Medicine, 132, 621–630.",
 828    },
 829    {
 830      n: 4,
 831      text: "Guidry, C. A., Mallicote, M. U., Petroze, R. T., Hranjec, T., Rosenberger, L. H., Davies, S. W., & Sawyer, R. G. (2014). Influence of bronchoscopy on the diagnosis of and outcomes from ventilator-associated pneumonia. Surgical Infections, 15(5), 527–532.",
 832    },
 833    {
 834      n: 5,
 835      text: "Kalil, A. C., Metersky, M. L., Klompas, M., et al. (2016). Management of adults with hospital-acquired and ventilator-associated pneumonia: 2016 clinical practice guidelines by the Infectious Diseases Society of America and the American Thoracic Society. Clinical Infectious Diseases, 63(5), e61–e111.",
 836    },
 837    {
 838      n: 6,
 839      text: "Sharp, J. P., Magnotti, L. J., Weinberg, J. A., Swanson, J. M., Schoreppel, T. J., Clement, L. P., Wood, G. C., Fabian, T. C., & Croce, M. A. (2015). Adherence to an established diagnostic threshold for ventilator-associated pneumonia contributes to low false-negative rates in trauma patients. The Journal of Trauma and Acute Care Surgery, 78(3), 468–474.",
 840    },
 841    {
 842      n: 7,
 843      text: "Younan, D., Delozier, S. J., Adamski, J., Loudon, A., Violette, A., Ustin, J., Tinkoff, G., Moorman, M. L., McQuay, N., & UHRISES Research Consortium. (2020). Factors predictive of ventilator-associated pneumonia in critically ill trauma patients. World Journal of Surgery, 44(4), 1121–1125.",
 844      url: "https://doi.org/10.1007/s00268-019-05286-3",
 845    },
 846    {
 847      n: 8,
 848      text: "Joung, M. K., Lee, J., Moon, S. Y., et al. (2011). Impact of de-escalation therapy on clinical outcomes for intensive care unit-acquired pneumonia. Critical Care, 15(2), R79.",
 849    },
 850    {
 851      n: 9,
 852      // The PDF prints the page range cut off as "1404–141" (no closing digit or
 853      // period). Reproduced as printed; see transcription.flags.
 854      text: "De Bus, L., Depuydt, P., Steen, J., et al. (2020). Antimicrobial de-escalation in the critically ill patient and assessment of clinical cure: The DIANA study. Intensive Care Medicine, 46(7), 1404–141",
 855    },
 856    {
 857      n: 10,
 858      text: "Bultas, A. C., Bery, A. I., Deal, E. N., Hartmann, A. P., Richter, S. K., & Call, W. B. (2019). Predictors of treatment failure following de-escalation to a fluoroquinolone in culture-negative nosocomial pneumonia. Annals of Pharmacotherapy, 53(12), 1207–1219.",
 859    },
 860    {
 861      n: 11,
 862      text: "Raman, K., Nailor, M. D., Nicolau, D. P., Aslanzadeh, J., Nadeau, M., & Kuti, J. L. (2013). Early antibiotic discontinuation in patients with clinically suspected ventilator-associated pneumonia and negative quantitative bronchoscopy cultures. Critical Care Medicine, 41(7), 1656–1663.",
 863      url: "https://doi.org/10.1097/CCM.0b013e318287f713",
 864    },
 865    {
 866      n: 12,
 867      text: "Vanderbilt University Medical Center, Division of Acute Care Surgery. (2025). Infectious workup and antimicrobial stewardship guideline.",
 868      url: "https://www.vumc.org",
 869    },
 870    {
 871      n: 13,
 872      text: "UTHealth Houston. (2022, February). Antibiotic therapy. McGovern Medical School, Department of Surgery.",
 873      url: "https://med.uth.edu/surgery/antibiotic-therapy/",
 874    },
 875  ];
 876  
 877  // Drug metadata for the "By drug" view and search. APP-AUTHORED — this table is
 878  // not in the PMG and the verifier cannot check it. Brand names are search
 879  // synonyms only; nothing clinical is derived from this table.
 880  export const drugs = {
 881    Cefazolin: { brand: "Ancef", class: "1st-generation cephalosporin" },
 882    Metronidazole: { brand: "Flagyl", class: "Nitroimidazole" },
 883    Ceftriaxone: { brand: "Rocephin", class: "3rd-generation cephalosporin" },
 884    "Ampicillin-sulbactam": { brand: "Unasyn", class: "Aminopenicillin + β-lactamase inhibitor" },
 885    "Piperacillin-tazobactam": { brand: "Zosyn", class: "Antipseudomonal penicillin + β-lactamase inhibitor" },
 886    Linezolid: { brand: "Zyvox", class: "Oxazolidinone" },
 887    Vancomycin: { brand: "Vancocin", class: "Glycopeptide" },
 888    "Sulfamethoxazole-TMP": { brand: "Bactrim", class: "Sulfonamide + trimethoprim" },
 889    Cefepime: { brand: "Maxipime", class: "4th-generation cephalosporin" },
 890    Levofloxacin: { brand: "Levaquin", class: "Fluoroquinolone" },
 891    Ertapenem: { brand: "Invanz", class: "Carbapenem" },
 892    Clindamycin: { brand: "Cleocin", class: "Lincosamide" },
 893    Micafungin: { brand: "Mycamine", class: "Echinocandin" },
 894  };
 895  
 896  // Everything a reader (or a reviewing physician) should know about how this
 897  // file relates to the PDF. Rendered on the Source page.
 898  export const transcription = {
 899    corrections: [
 900      { pdf: "transfustion", here: "transfusion", where: "Trauma redose column (three rows)" },
 901      { pdf: "Nectrotizing Soft Tissue Infection", here: "Necrotizing Soft Tissue Infection", where: "Emergency General Surgery" },
 902      { pdf: "Ertapenum", here: "Ertapenem", where: "Diverticulitis alternatives (two rows)" },
 903      { pdf: "7days", here: "7 days", where: "HAP/VAP duration" },
 904      { pdf: "Every 4 hour", here: "Every 4 hours", where: "Skin & Soft Tissue redose" },
 905      { pdf: "Pharmacy to dos", here: "Pharmacy to dose", where: "Purulent cellulitis dose cell (cut off in the PDF)" },
 906      {
 907        pdf: "Complicated Urinary Tract Infection/CAUTI/Urologic Instr",
 908        here: "…/Urologic Instrumentation",
 909        where: "ICU & General Floor — the PDF cell is truncated",
 910      },
 911    ],
 912    // Things a physician reviewer should look at. These are observations about
 913    // the source document, not corrections — the app shows the PDF's values.
 914    flags: [
 915      "Open fractures, Type III: the text gives Cefepime 2 g q8 hours with no age qualifier, while the dosing table on page 4 lists pediatric Cefepime at Q12h (≥40 kg: 2 g IV Q12h). Both are reproduced as printed.",
 916      "Metronidazole frequency differs by context in the PDF: 500 mg Q12H in the trauma and emergency general surgery tables, 500 mg IV Q8h in the open-fracture contamination regimen and the page 4 dosing table.",
 917      "Abdominal trauma duration reads \"24 hours OR 4 days after source control (consider monotherapy Zosyn)\" — the PDF does not say which applies when.",
 918      "Page 5 (fever workup flowchart) is an image in the PDF. Its text here was read from the picture and cannot be checked by the verification script. Its thresholds meet at the boundary exactly as drawn — \"≥ 10⁴ CFU/mL\" versus \"≤ 10⁴ CFU/mL\" (both apply at 10⁴), and \"> 10 WBC\" versus \"< 10 WBC\" (neither applies at exactly 10).",
 919      "The dosing-table thresholds (\"< 60 kg\" / \"≥ 60 kg\" and so on) are compared with the PDF including the comparison signs, but the sign at exactly the boundary weight is the document's choice, not the app's.",
 920      "Reference 9 (De Bus et al., DIANA) is printed with its page range cut off: \"1404–141\". Reproduced as printed.",
 921      "Brand names and drug classes on the By-drug page are app-authored search aids; they are not in the PMG and are not checked by the script.",
 922      "Pages 6–11 (antibiogram) are January–December 2024 data; the MUHC Antibiogram app has 2025 data, so they are linked rather than reproduced.",
 923    ],
 924  };
```

END OF PACKET. The last line of pmg.js above is line 924.
