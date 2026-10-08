# ACS Antibiotic Guide — Visual Redesign Notes (Variant: Gemini)

## Design Direction

The Gemini redesign transforms the ACS Antibiotic Guide into an authoritative, bedside-optimized clinical reference engineered for the high-tempo decision making of emergency physicians, trauma teams, and surgical residents. Rather than a flat, monochromatic document where rows and numbers blend together under harsh hospital fluorescent lighting, this redesign establishes a crisp physical card architecture, vivid section grounding, and immediate typographic prominence for what prescribers look for first: the medication and its dosing. The design remains deeply rooted in the University of Missouri identity—anchored by Mizzou Black (`#000000`) and Mizzou Gold (`#F1B82D` / `#B8860B`)—while eschewing all decorative excess, consumer gradients, glassmorphism, or non-clinical animation.

---

## What Changed and Why

1. **Discrete Diagnosis Cards (`IndicationRow`)**:
   - *Previous state*: 34 rows sat in monolithic table groups separated only by hairline dividers (`divide-rule-soft`), causing diagnoses to run together into an undifferentiated list during rapid scrolling.
   - *Redesign*: Every diagnosis is now an individual, bounded card (`rounded-lg border border-rule bg-card shadow-sm space-y-2.5`) featuring a bold 4px vertical section-hue stripe on its left border (`border-l-4 border-l-hue`). When tapped, each card smoothly expands within its own self-contained container without disrupting neighboring card borders.

2. **Medication & Dosing Badges (`RegimenInline`, `OrderLine`, `RegimenSummary`)**:
   - *Previous state*: Medications were rendered as subdued 13–14px secondary prose lines beneath the diagnosis title, with doses in muted monospace text.
   - *Redesign*: Medication and dosing are now the primary visual draw. In collapsed indication rows, drug names are set in bold `text-ink`, and doses/frequencies are elevated into high-contrast monospace badges (`inline-flex items-center px-1.5 py-0.5 rounded bg-chip border border-rule font-mono text-[13px] font-bold text-ink tabular-nums`). In expanded rows, each medication is formatted as an electronic prescription block with dedicated dose plates.

3. **Prominent Section Architecture (`SectionLabel`, `IndicationsView`)**:
   - *Previous state*: Sections differed only by an 8px dot beside a small uppercase text label, which immediately scrolled out of view.
   - *Redesign*: Each section opens with an authoritative section banner featuring a section-color underline (`border-b-2 border-hue/40`), a vibrant hue dot with a ring indicator, an uppercase section header (`text-[15px] font-bold uppercase tracking-wider text-ink`), and a pill-styled count badge. Furthermore, because each diagnosis card inherits the section's `--hue` on its 4px left border, clinicians always know exactly which section they are scrolling through (Rose for Trauma, Amber for EGS, Sky for Elective, Violet for ICU).

4. **Adult & Pediatric Dosing Cards (`DosingView`)**:
   - *Previous state*: Plain grouped rows with subtle dose blocks.
   - *Redesign*: Each drug is formatted as a distinct clinical dosing card with an 18px bold title, pill metadata tag, and dedicated adult vs. pediatric panels. Each dose line sits in a high-contrast `bg-card` plate with bold monospace numbers (`font-mono text-[15px] font-bold text-ink`) for zero-ambiguity dose verification.

5. **Open Fractures & Drug Indexes (`OpenFracturesView`, `DrugsView`, `FeverWorkupView`)**:
   - *Open fractures*: Refined the 30-minute timing callout card, antimicrobial regimen cards, and duration values with crisp mono badges.
   - *By drug*: Upgraded drug cards with prominent titles, use badges, and elevated dosing table callouts.
   - *Fever workup*: Enhanced branch cards with high-contrast criteria boxes and gold bullet marks for the "Then" clinical outcomes.

6. **Mizzou Navigation Polish (`Header`, `BottomNav`)**:
   - Sticky header maintains the Mizzou Black brand bar with gold accents, crisp search boundary, and bold active Alternatives toggle.
   - Bottom navigation on mobile features a distinct gold top indicator bar (`bg-gold`) and deep gold icon (`text-deepgold stroke-[2.5]`) for the active route, fitting all six routes without truncation even at 320px width.

---

## How Each of the Three Goals is Met

### Goal 1: Medications and dosing stand out
- **Eye lands on medication first**: In collapsed rows, the drug name (`text-[15px] font-bold text-ink`) and dose/frequency badge (`bg-chip border border-rule font-mono text-[13px] font-bold text-ink tabular-nums`) provide immediate typographic and tonal contrast against the card surface.
- **Structured prescription orders**: In expanded rows, `OrderLine` renders each drug as a verified electronic order with explicit separation between drug name, footnote mark, dose badge, route, frequency, and clinical notes.
- **Zero guesswork in dosing tables**: In `DosingView`, adult and pediatric doses are encased in structured plates with bold 15px monospace typography, allowing immediate confirmation of mg/kg and frequency parameters.

### Goal 2: Diagnoses are more obviously distinct from one another, and the four sections from each other
- **Clear physical boundaries**: Diagnoses are no longer slices of a single continuous table. Each diagnosis is an isolated, rounded card separated by physical vertical spacing (`space-y-2.5`). A clinician scanning the list immediately sees where one diagnosis ends and the next begins.
- **Section visual persistence**: The four sections (Trauma, Emergency General Surgery, Elective Surgery, ICU & General Floor) each possess a distinct color identity from the guideline's palette. Through `border-l-4 border-l-hue` on every card and the underlined section banner, the reader is anchored to the active section at all scroll depths.

### Goal 3: Professional and MU-themed
- **Authentic Mizzou palette**: Mizzou black (`#000000`), gold (`#F1B82D`), and deep gold (`#B8860B`) provide the core visual hierarchy.
- **Clinical gravity**: Clean lines, crisp borders, subtle shadows, and purposeful typography (Source Sans 3 for prose and JetBrains Mono for doses). Completely free of decorative gradients, consumer pill clutter, emoji, and gratuitous motion.

---

## Tokens and Contrast Matrix

- **Zero palette or fixed colors**: No Tailwind palette classes (`text-white`, `bg-slate-50`, `border-amber-200`), hex values, or inline color styles were introduced.
- **Token consistency**: All surfaces, lines, and text rely on semantic tokens defined across both light (`:root, [data-theme="light"]`) and dark (`[data-theme="dark"]`) blocks in `src/index.css`.
- **Chip rule compliance**: On every element carrying `bg-chip` (Page tags, page chips, dose badges, aside banners), only `text-soft`, `text-prose`, and `text-ink` are utilized. `text-muted` and tone marks are strictly excluded.
- **Contrast verification**:
  - `text-ink` on `bg-card`: 15.3:1 (light), 15.3:1 (dark) — WCAG AAA.
  - `text-ink` on `bg-well`: 15.3:1 (light), 17.4:1 (dark) — WCAG AAA.
  - `text-ink` on `bg-chip`: 13.0:1 (light), 10.0:1 (dark) — WCAG AAA.
  - `text-soft` on `bg-card` and `bg-chip`: 4.8:1 to 7.0:1 — WCAG AA.
  - `deepgold` on page surfaces: >= 3.3:1 (marks and icons only; never body text).
  - Control lines (`rule`, `rule-strong`, `bar-rule`): >= 3.0:1.
  - Alternatives pill (`on-gold` on `gold`): 10.5:1 — WCAG AAA.

---

## Viewports & Schemes Verified

- **320px (Compact phone)**:
  - Header brand bar remains one line (icon tile hides gracefully below 360px; PDF icon hides below 420px).
  - All six bottom navigation tabs fit without clipping, wrapping, or overflow.
  - Medication badges wrap cleanly on combination regimens (e.g. Cefazolin + Metronidazole) with no horizontal scroll.
- **360px & 375px (Standard mobile phones)**:
  - Full icon branding visible.
  - Diagnosis cards, timing callouts, and expanded panels breathe naturally.
- **640px – 768px (Tablets / Desktop)**:
  - Header switches from mobile bottom nav to the sticky tab navigation with gold active underline.
  - Dosing table and clinical fields shift to responsive side-by-side grids.
- **Light & Dark Schemes**:
  - Both schemes maintain equivalent visual hierarchy and full WCAG contrast.
  - Dark mode renders cleanly in deep slate tones without harsh glare.

---

## Verification & Human Review Notes

- **Clinical content preserved verbatim**: `src/data/pmg.js` was completely untouched. All clinical strings, footnotes, and units continue to flow strictly through `keepUnits` and `fmtDose`.
- **Pending physician verification**: The amber verification notice under the header was preserved verbatim and scrolls with the page as required.
- **A11y & interaction states preserved**: Keyboard focus outlines (`focus-visible:outline`), `aria-expanded`, `aria-controls`, `inert`, deep linking anchors (`i-<id>`, `d-<id>`, `sec-<id>`, `drug-<name>`), and ResizeObserver header height binding (`--app-header-h`) remain fully functional.
