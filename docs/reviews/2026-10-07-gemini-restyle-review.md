# Gemini peer review — v0.5.0 restyle, the two checks Codex could not finish (2026-10-07)

**Engine:** Google Gemini `gemini-3.8-flash-high` through the Antigravity CLI (`agy`), headless, plan
mode + sandbox, no tools (the step types were `user_input` and `agent_response` only). **Single
engine** for these two checks: the Codex run that was to make them was killed by Codex's usage limit
(`2026-10-07-codex-restyle-review.md`), so nothing here is cross-checked. **Scope:** the uncommitted
working tree against HEAD `94e0edb` (`main`), after the five Codex findings had been fixed. **Packet:**
113,190 bytes (110.5 KB), one run: the "UI invariants" section of `CLAUDE.md` (lines 72–197),
`shared.jsx` and `IndicationsView.jsx` both as at HEAD and as restyled, and the restyled
`OpenFracturesView.jsx`, `DosingView.jsx`, `DrugsView.jsx`, `FeverWorkupView.jsx` and
`SourceView.jsx`. Gemini's packet receipt named the correct last line of all ten blocks. Run with the
`gemini-review` agent from the scratchpad; the relay below is that agent's report, verbatim.
Dispositions follow at the end.

The two checks: (1) for every place a restyled component renders a clinical value, whether the
displayed text or its association to its label could differ from the data field and from what
v0.4.0 displayed; (2) compliance with the `CLAUDE.md` invariants (type scale, no fixed colours, the
16px search input, no clinical paraphrase, no invented labels, nothing muted on a chip, the PDF's
own alternative-column label).

---

## Relay (the gemini-review agent's report)

**Gemini peer review via agy (`gemini-3.8-flash-high`): Check 1 (clinical-value display) and Check 2 (CLAUDE.md "UI invariants"), ACS Antibiotics v0.4.0 → v0.5.0 restyle, uncommitted working tree**

This is Gemini (`gemini-3.8-flash-high` via `agy`), a single engine for these two checks. Codex did not complete them, so nothing here is cross-checked.

**Run notes**
- **Packet:** 10 blocks, 113,190 bytes (110.5 KB), sent as one run with no split.
- **Full receipt:** Gemini reported input_tokens 50,923; agy adds its own system prompt, which is why that exceeds the bytes/4 estimate of about 28K. Its PACKET RECEIPT lists the correct last line for all 10 blocks, so the whole packet arrived.
- **One turn, SUCCESS.** The only step types were `user_input` and `agent_response`, so no tool was used. stderr held only the benign `--mode plan has no effect` warning.
- **Scope change:** I embedded the whole CLAUDE.md "UI invariants" section, lines 72–197, not 72–188. CLAUDE.md was edited at 15:28:47, after your brief. Line 188 now falls mid-bullet and would have cut "No invented labels", which Check 2 names. Gemini's `CLAUDE.md:194` and `:172` citations use the new numbering.
- **Stable inputs:** I snapshotted the embedded files at 15:31 and built the packet from the copies. At 15:41 all eight were unchanged, and `src/data/pmg.js` was still identical to HEAD (blob `df1df84`).
- **Secrets scan:** I scanned the packet before sending. The only hits were the word "token" (design tokens, `tokens(query)`).
- **Repo untouched:** I ran `agy` from the scratchpad, not the repo, because another session is live there. I wrote nothing into the repo, and the `.git/index` mtime is unchanged (12:03:40).

### Gemini's output, verbatim

````markdown
### 1. FINDINGS

**F1** · [CHECK 1] · **HIGH**
- **Citation**: `NEW shared.jsx:180`
- **Code relied on**: `<span className="font-mono text-[13px] text-prose tabular-nums whitespace-nowrap">{fmtDose(r.dose)} {r.frequency}</span>`
- **Rendered / Violated**: In `RegimenInline`, `whitespace-nowrap` is applied across the combined dose and frequency string. In v0.4.0 (`OLD shared.jsx:135–136`), doses carried `break-words` and frequency wrapped normally. In v0.5.0, `RegimenInline` is rendered inside collapsed indication rows (`NEW IndicationsView.jsx:266`) and By-drug usage lists (`NEW DrugsView.jsx:93`), which sit inside `Group` elements styled with `overflow-hidden` (`NEW shared.jsx:36`). On phone screens (320–375px), where available width is reduced by row padding, page chips, and chevron controls, forcing dose and frequency to stay on a single non-wrapping line risks clipping and hiding the dose and frequency behind `overflow-hidden`.
- **Could not see**: Runtime pixel rendering across specific phone viewport dimensions and specific drug string lengths from `src/data/pmg.js`.

---

**F2** · [CHECK 1] · **MEDIUM**
- **Citation**: `NEW FeverWorkupView.jsx:53–54`
- **Code relied on**: `<ToneCard tone="good">` with `<div className="eyebrow text-good-mark mb-1">Then</div>` wrapping `b.outcomes`
- **Rendered / Violated**: Management outcomes and directives from the fever-workup flowchart (`b.outcomes`, e.g., initiating empiric antimicrobials, removing central lines, collecting cultures) are wrapped inside an emerald/good tone card (`bg-good-bg border-good-line text-good-ink`) with an emerald label (`text-good-mark`). In clinical context, a "good" tone signifies a favorable/negative finding or a primary prophylactic regimen. Using it on infectious workup directives for febrile patients implies a benign outcome or convalescence rather than active diagnostic/therapeutic intervention steps.
- **Could not see**: `OLD FeverWorkupView.jsx` was not supplied; cannot compare with v0.4.0. Assessed from data field semantics and `CLAUDE.md` tone-card definitions.

---

**F3** · [CHECK 2] · **MEDIUM**
- **Citation**: `NEW IndicationsView.jsx:386–388`
- **Code relied on**:
  ```jsx
  <div className="eyebrow text-good-mark mb-1.5 flex items-center gap-1">
    <Check className="size-3.5" aria-hidden="true" /> Regimen
  </div>
  ```
- **Rendered / Violated**: In v0.4.0 (`OLD IndicationsView.jsx:408`), the field was neutrally labeled: `<div className="eyebrow text-muted mb-2">Regimen</div>`. Prepending a `<Check />` icon and setting the label in emerald `text-good-mark` violates the `CLAUDE.md:194` invariant ("No invented labels. ... Keep interface strings editorial-neutral; clinical wording comes from the data"). The checkmark and "good" tone transform a neutral data label into an affirmative "approved/recommended" visual directive, echoing the prototype's rejected "Recommended Regimen" pattern.
- **Could not see**: None; both OLD and NEW code are fully visible inline.

---

**F4** · [CHECK 1] · **MEDIUM**
- **Citation**: `NEW IndicationsView.jsx:401`
- **Code relied on**: `<Field label={ALT_LABEL} tone="warn" highlight={pcn}>` and `Field` definition at line 290: `<dt className={`eyebrow break-words ${t === "warn" ? "text-warn-mark" : "text-muted"}`}>{label}</dt>`
- **Rendered / Violated**: In v0.4.0 (`OLD IndicationsView.jsx:296`), the label was `text-muted` when unhighlighted, and only `text-hazard-amber` when `highlight` was true. In v0.5.0, because `tone="warn"` is passed unconditionally to `Field`, the label "PNC allergy / alternative" is permanently rendered in amber (`text-warn-mark`), regardless of whether the reader toggled the penicillin allergy highlight (`pcn`). This displays an alert tone mark on the alternative row during routine viewing, falsely implying an active warning state when no allergy has been selected.
- **Could not see**: None; both OLD and NEW code are fully visible inline.

---

**F5** · [CHECK 2] · **MEDIUM**
- **Citation**: `NEW DrugsView.jsx:119`
- **Code relied on**: `<sup className="text-[11px] font-bold text-warn-mark">{fn[r.footnote].mark}</sup>`
- **Rendered / Violated**: Violates the `CLAUDE.md:172` type-scale invariant for size roles: "12px: eyebrows that say who a regimen or dose applies to or give a timing rule; footnotes and their marks, the PDF button, small meta." Footnote marks across all other components are sized `text-[12px]` (`NEW shared.jsx:115`, `NEW DosingView.jsx:23`), but here the open-fracture regimen footnote mark is styled as `text-[11px]`.
- **Could not see**: `OLD DrugsView.jsx` was not supplied.

---

**F6** · [CHECK 1] · **LOW**
- **Citation**: `NEW DrugsView.jsx:138`
- **Code relied on**: `<DoseBox label={dosingTable.pediatricLabel} lines={d.dosing.pediatric} />` (compare line 137: `label={keepUnits(dosingTable.adultLabel)}` and `DosingView.jsx:59`: `{keepUnits(label)}`)
- **Rendered / Violated**: In `DosingView.jsx:59`, `keepUnits` is applied inside `DoseBlock` to both adult and pediatric labels. In `DrugsView.jsx`, `DoseBox` renders `{label}` verbatim (line 182); the caller applies `keepUnits` to `dosingTable.adultLabel` on line 137, but omits `keepUnits` for `dosingTable.pediatricLabel` on line 138. If `pediatricLabel` contains age thresholds or comparison signs (e.g., "< 15 years"), numbers and units are not joined with no-break spaces and can wrap across lines.
- **Could not see**: `OLD DrugsView.jsx` and the string content of `dosingTable.pediatricLabel` in `src/data/pmg.js` were not supplied; cannot compare with v0.4.0.

---

### 2. CHECK 1 BY VIEW

- **Indications**: F1, F4
- **Open fractures**: no change (cannot compare with v0.4.0)
- **Dosing**: no change (cannot compare with v0.4.0)
- **By drug**: F1, F6 (cannot compare with v0.4.0)
- **Fever workup**: F2 (cannot compare with v0.4.0)
- **Source**: no change (cannot compare with v0.4.0)

---

### 3. CHECK 2 BY FILE

- **shared.jsx**: no violation
- **IndicationsView.jsx**: F3
- **OpenFracturesView.jsx**: no violation
- **DosingView.jsx**: no violation
- **DrugsView.jsx**: F5
- **FeverWorkupView.jsx**: no violation
- **SourceView.jsx**: no violation
- **Search-input assessment**: `Header.jsx` (which contains the search input) is not included in this packet, so search-input compliance (`text-[16px]`) cannot be assessed from this packet.

---

### 4. PACKET RECEIPT

- **Block 1**: line 197 | `   data.`
- **Block 2**: line 156 | `}`
- **Block 3**: line 203 | `}`
- **Block 4**: line 441 | `}`
- **Block 5**: line 418 | `}`
- **Block 6**: line 150 | `}`
- **Block 7**: line 69 | `}`
- **Block 8**: line 209 | `}`
- **Block 9**: line 99 | `}`
- **Block 10**: line 171 | `}`
````

---

### Claude's assessment (mine, not Gemini's, and not a peer review)

**Nothing is dismissed, softened or downgraded.** I checked every cited line against the files, and all six citations resolve to the code Gemini quotes. The facts below come from the unchanged `pmg.js`, from HEAD's files, or from the source.

- **F1 (HIGH) stands, and it is yours to rule on.**
  - **The data makes it concrete.** `pmg.js` gives Vancomycin `dose: "Pharmacy to dose"` and `frequency: "Pharmacy to dose"` in hap-vap, bacteremia and cellulitis-purulent. The nowrap span at `shared.jsx:180` therefore holds `Pharmacy to dose Pharmacy to dose`, 33 characters.
  - **My arithmetic, not a browser measurement.**
    - The string is about 257 px at 13px mono.
    - A collapsed row has roughly W−132 px of text column: about 188 px at 320, 228 at 360, 243 at 375 and 258 at 390.
    - The By-drug list has about W−88 px, which is 232 at 320.
    - So those rows look to overflow below about 390 px. v0.4.0 wrapped this text (`break-words`, OLD `shared.jsx:135`).
  - **The mechanism may differ from Gemini's.** By my arithmetic the text runs under the page chip and chevron rather than reaching the Group's clip edge. Either way characters are hidden, and today the hidden part is the duplicated second "Pharmacy to dose".
  - **The next-longest nowrap string is 20 characters** (about 156 px), which fits.
  - **The existing phone check cannot see this.** "No horizontal scroll" passes when text is hidden, because `overflow-hidden` hides rather than scrolls. A preview check at 320, 360 and 375 px is the real test.
- **F2 (MEDIUM): accurate on the code.**
  - Gemini's examples were guesses, since `pmg.js` was not in the packet.
  - The real outcomes mix start and stop branches: "→ start empiric antibiotics" and "D/C CVC and replace at new site if indicated" alongside "→ stop antibiotic therapy", "NO → Stop", "< 10 WBC → investigate other source" and "→ discontinue antibiotics".
  - In v0.4.0 the card was neutral (`bg-well`, `border-rule`) with only the "Then" label emerald (`text-dose`, which v0.4.0's `tailwind.config.js` calls the emerald readout colour). v0.5.0 washes the whole card emerald.
  - The text and its association are unchanged (`keepUnits(o)` before and after). Whether emerald fits that mix is a design call.
- **F3 (MEDIUM): the citations and the OLD/NEW comparison are correct, but I read the rule differently.**
  - The cited bullet (`CLAUDE.md:194–197`) governs interface strings. The string "Regimen" is unchanged, and that bullet lists it as allowed.
  - Your brief's problem case is an emerald label on something that is not the primary regimen. Here the label is on the primary regimen.
  - The real question is the same tone question as F2.
  - I did not rule against it. If you want an independent ruling, the route is a fresh, neutrally worded Gemini run. I did not spend quota on one.
- **F4 (MEDIUM): accurate.**
  - `Field` now colours the label amber whenever `tone="warn"` is passed (`IndicationsView.jsx:290` and `:401`). v0.4.0 did so only when highlighted (OLD `:296`).
  - The code comment at NEW `:280–282` says the tone colours the label, so it looks intentional, but it is a change from v0.4.0.
- **F5 (MEDIUM): accurate on the code, but not new.**
  - HEAD `DrugsView.jsx:133` already had `text-[11px]` on this `<sup>`. v0.5.0 added only the bold weight and the colour.
  - The 12px role for footnote marks is in the v0.5.0 role list (`CLAUDE.md:172–173`). 11 is a legal step, so the build would not flag it as off-scale. I did not check whether `type.test.js` enforces per-element roles.
- **F6 (LOW): accurate as an asymmetry, and not new.**
  - The asymmetry is at NEW `DrugsView.jsx:137` versus `:138`, and also at HEAD `:157` versus `:165`.
  - It has no display effect today: `dosingTable.pediatricLabel` is "Pediatric Dosing", which `keepUnits` leaves unchanged. The adult label ("Adult Dosing (age ≥15 years)") is the one with a number.

**Claude-only observations that Gemini did not raise**
1. **Frequency case.**
   - v0.4.0 forced `uppercase` on frequency (OLD `shared.jsx:80` and `:136`). v0.5.0 does not (NEW `:137` and `:181`).
   - Five of the nine frequency strings in the data are not already upper case: "One-time dose", "Pharmacy to dose", "q8 hours", "q12 hours", "Q8h".
   - v0.4.0 therefore showed "ONE-TIME DOSE", "PHARMACY TO DOSE", "Q8 HOURS", "Q12 HOURS" and "Q8H". v0.5.0 shows them as stored.
   - The meaning is the same. It is still a difference from what v0.4.0 displayed on a field Check 1 named.
2. **Chip wording.**
   - `CLAUDE.md:130–131` says a chip carries "ink, prose or soft" text.
   - `tests/theme.test.js:94` also lists `accent` on chip, and the guard at `:219` forbids only `text-muted` and the tone marks.
   - Two uses exist: `FeverWorkupView.jsx:91` and `SourceView.jsx:22`. They pass the test; the prose is narrower than the test.
3. **The doubled "Pharmacy to dose"** comes from the data, not the restyle. v0.4.0 showed it twice too.

**What "no change" covers.**
- Per your brief, the five views other than Indications had no OLD file in the packet. Gemini's "no change" there means no mis-binding visible in the new code, not a comparison with v0.4.0.
- For F2, F5 and F6 I did compare against HEAD myself, as above.
- Adding the five OLD views would bring the packet to about 149 KB, over the ~130 KB ceiling, so it would need two self-contained runs.

**My mechanical re-check of Check 2** over the seven files agrees with Gemini's "no violation" calls except the two flags above.
- All 12 distinct `text-[Npx]` values are on the scale. There are no Tailwind named sizes, no shaded palette classes, no `white` or `black` classes, and no hex or rgb literals.
- All three `<sup>` elements carry a size.
- There is no `truncate`, and `overflow-hidden` appears only in `Group` (`shared.jsx:36`).
- The only `whitespace-nowrap` that can hold a clinical string is `shared.jsx:180`, so F1 is the only candidate. The other uses are page chips.
- The only "penicillin-allergy regimens" text is the sanctioned intro prose at `IndicationsView.jsx:137`. The Alternatives label is `ALT_LABEL = "PNC allergy / alternative"`.
- The search input has `text-[16px]` at `Header.jsx:113`. Gemini could not assess it, so this is my grep only.

**No clinical value was verified by this review.** Doses, frequencies and thresholds in `pmg.js` still need a human to check them against the PDF.

---
Reviewed: the uncommitted working tree on `main` (HEAD 94e0edb) in `C:\Thiago\OneDrive\[3] Claude\ACS Antibiotics`. The embedded files were the invariants section (lines 72–197), `shared.jsx` and `IndicationsView.jsx` both old (HEAD) and new, and the other five views new. Check 1 and Check 2 only.

Agreement: single engine (Gemini). Codex did not complete these checks. Neither engine's view is verification, and nothing here is "confirmed safe".

---

## Dispositions (Claude, the session that made the change)

All six findings were applied the same day; none was dismissed. The fixes were checked by the
tests and in Chrome, not re-reviewed by Gemini.

| # | Finding | Disposition |
|---|---|---|
| F1 | `whitespace-nowrap` on the collapsed regimen line can hide "Pharmacy to dose Pharmacy to dose" on phones | **Fixed.** The span wraps again (`break-words`, as v0.4.0); numbers still keep their units through the no-break spaces `fmtDose` and `keepUnits` insert. Checked in Chrome at 320px on the ICU & General Floor section: the three Vancomycin rows wrap to two lines inside their column, no collapsed-row column overflows (`scrollWidth` ≤ `clientWidth` for all), and the page has no horizontal scroll. The "no horizontal scroll" check in *Phone layout invariants* indeed cannot see hidden overflow inside a clipped group; the column-overflow check above is the one to repeat. |
| F2 | Fever-workup "Then" outcomes in an emerald "good" card | **Fixed.** A neutral well with a muted "Then" label, as v0.4.0 had it; the outcomes mix starting, stopping and investigating and the PDF grades none of them. |
| F3 | A check mark and emerald label on the PDF's regimen column | **Fixed, as a judgment call.** The relaying session read the "no invented labels" rule as governing strings only; the fix follows Gemini's wider reading, because the same reasoning as F2 applies: the regimen column is transcribed, not recommended. The label is muted with no icon, and the regimen's left rule is grey. The Antibiogram's green "first-line" convention was deliberately not carried over; Thiago can reverse this. Recorded under *UI invariants* (*Tone cards and tone marks never grade clinical content*). |
| F4 | The alternative label amber even with the Alternatives toggle off | **Fixed.** `Field` colours the label amber only while highlighted; the open-fracture allergy regimen's label and left rule likewise follow the toggle. With it off, the PDF's own labels ("PNC allergy / alternative", "If penicillin allergy") identify those rows, as in v0.4.0 for the Indications field. |
| F5 | The By-drug fracture block's footnote mark at 11px (the role says 12px) | **Fixed** (12px). Pre-existing at HEAD; the type test checks the scale, not the roles. |
| F6 | `keepUnits` applied to the adult dosing label but not the pediatric one in By drug | **Fixed.** `DoseBox` applies `keepUnits` to its label itself, like `DosingView`'s `DoseBlock`; the callers pass the raw labels. No display effect today, since the pediatric label has no number. |

The relaying session's own observations: (1) frequencies now show in the PDF's own case ("One-time
dose", "q8 hours", "Q8H") where v0.4.0 forced capitals — **kept as stored**, which is the more
faithful display and what the data rule in `CLAUDE.md` asks for; (2) the chip wording in
`CLAUDE.md` now says "ink, prose, soft or accent", matching the test; (3) the doubled "Pharmacy to
dose" on three rows is the PDF's own two cells (dose and frequency), displayed since v0.1.0 —
**left as it is** and noted for Thiago, who may want the display to say it once.
