# Codex peer reviews — the UTI culture step (v0.7.6), 2026-10-08

Two single-engine Codex runs on this release. Codex CLI 0.160.1, model `gpt-6-astra`, `codex exec
--sandbox read-only` (header confirmed `sandbox: read-only` both times), reasoning effort `high`,
packet on stdin, no tools; relayed by the `codex-review` bridge agent. Gemini reviewed the first
draft separately (`2026-10-08-gemini-v076-review.md`).

- **Run 1** reviewed the first draft, which joined the culture step to the "> 10 WBC" outcome with a
  third " → ".
- **Run 2** reviewed the final version, after Thiago chose an indented sub-step.
- **Nothing below was dismissed or softened.** Both answers follow verbatim; dispositions at the end.

---

## Run 1 — first draft (one joined string)

1. Findings

Medium — src/data/pmg.js:794; FeverWorkupView.jsx:58–61
The chain connects the culture outcome to the initial treatment outcome, but leaves timing and conditional scope implicit. A reader could interpret the culture/discontinuation step as dependent on repeating the UA, and therefore on “>2 squamous cells.” A reader scanning the arrows could also miss that discontinuation is conditional on subsequent results and interpret it as an immediate instruction. The owner should decide whether this sufficiently conveys “as a later step.” This is a reading ambiguity, not a judgment of clinical correctness.

Low — docs/HISTORY.md:440–441, Block A hunk @@ -432,3 +432,15
“No words were added or removed” is accurate; “only the line break” is not. The change adds a spaced arrow, merges two array items/list items, and brings the formerly third outcome ahead of the “< 10 WBC” outcome. Describe it as joining the two unchanged strings with “ → ” into one outcome.

2. Per-check verdicts

(1) Strings: Pass.
Comparing the minus and plus lines in Block A, the new string is exactly the previous first string + “ → ” + the previous third string. The connector contains U+2192 with one ordinary space on each side. All original characters, including comparison signs, “100,000”, uppercase “OR”, capitalization and punctuation, are preserved. The “< 10 WBC → investigate other source” string is unchanged. No other clinical value, URL, page number or trigger text changes in the supplied diff. The relationship between the outcomes does change.

(2) Rendering: No defect established by the supplied code.
Applying text.js:14–24 produces exactly three U+00A0 substitutions. With [NBSP] marking each substitution:

> [shown without the following explanatory space]: the actual beginning is >[NBSP]10[NBSP]WBC

The complete transformed string is:

>[NBSP]10[NBSP]WBC → start empiric antibiotics and repeat UA if >2 squamous cells → <100,000[NBSP]CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics

“<100,000” and “>2” already have no internal spaces. The space between “>2” and “squamous” remains ordinary. All spaces around the arrows remain ordinary, and no other character changes. There are three arrows in the joined string.

These substitutions bind short groups rather than the whole sentence; many wrapping opportunities remain. They do not inherently prevent sensible phone-width wrapping. Actual overflow at 320–375px cannot be verified without the effective CSS, font metrics, container dimensions or rendered output.

The two UTI outcome keys are distinct, the list is nonempty, and the other supplied outcome lists also have distinct sibling keys. React renders the comparison signs as text. One long list item is valid list markup, but arrows alone do not explicitly communicate temporal structure, and their screen-reader announcement can vary.

tests/text.test.js:13–19 and 29–32 also consume the outcomes indirectly through the recursive data walk. No other supplied code consumes them. Repository-wide consumers are not supplied. Also missing is shared.jsx, through which the view imports keepUnits; its re-export wiring cannot be checked.

(3) Reading: Partially achieves the intent.
The natural reading is: for “> 10 WBC”, start empiric antibiotics and repeat UA if “>2 squamous cells”; later, discontinue antibiotics if the culture is below 100,000 CFU/mL with nonspecific UTI symptoms, OR the culture is negative. The separate “< 10 WBC” outcome directs investigation of another source.

Joining the strings makes their association clearer. It does not explicitly say “later” or identify when results become available, leaving the ambiguity described above.

(4) Documentation: One definite inaccuracy; several unverified claims.
The quoted owner phrases accurately reproduce excerpts of the supplied instruction. Keeping the disclosure unchanged matches his instruction and the diff.

The “only the line break” claim is inaccurate. Claims that the box hangs below “Start empiric antibiotics” and represents the later step in the drawing cannot be verified because the PDF image is absent.

CLAUDE.md’s Block A hunk @@ -377,6 +379,8 claims both engines reviewed v0.7.6. Those review artifacts and dispositions are absent, so completion cannot be verified. “Single engine each time, both separately” can describe separate single-engine reviews; it is not necessarily contradictory.

HISTORY.md:444–446 records preview checks without supplying screenshots, browser output or logs. Test/verifier success is owner-reported; execution output and verifier source are absent. These claims are unverified here, not demonstrated false.

The v0.7.5 “stays a separate line” statement at HISTORY.md:408–409 describes that historical release and is superseded by the v0.7.6 entry; it need not be rewritten. No other new contradiction is established in the supplied surrounding documentation.

Other checks: All three version fields consistently change to 0.7.6. No mismatched supplied line reference or additional definite defect was found.

CLINICAL VALUES TOUCHED (for a human to check against the PDF)

All entries below are unverifiable by code review, not flagged as clinically suspicious:

- “> 10 WBC” → start empiric antibiotics.
- Repeat UA if “>2 squamous cells”; its relationship to starting antibiotics, including the restated claim that the drawing places repeat UA before starting.
- “<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative” → discontinue antibiotics.
- Linking that culture/discontinuation instruction as a later step of the first outcome.
- “< 10 WBC” → investigate other source, restated in the new history entry.
- Omission of the repeat-UA asterisk and the restated claim that the page supplies no corresponding footnote.

No named drug, dose, frequency, duration or redose rule is changed or newly restated in the changed lines.
---

## Run 2 — final version (indented sub-step)

- **Medium — `src/components/FeverWorkupView.jsx:64–74`; `src/data/pmg.js:798–799`: Temporal relationship remains ambiguous.** Indentation associates the culture step with the entire first outcome, which ends with “repeat UA if >2 squamous cells.” A reader could still interpret the child as conditional on that clause or as the immediately following action. The presentation suggests continuation, but does not unambiguously communicate “later.” This is a communication concern for the owner, not a judgment about clinical correctness.

- **Medium — `src/components/FeverWorkupView.jsx:59–74`: Screen-reader hierarchy is not assured.** With Tailwind preflight removing list markers, VoiceOver/Safari can omit list semantics. Neither list has an explicit list role, and the corner arrow is correctly hidden from assistive technology. Reading order remains correct, but the culture step can be announced as consecutive text without its nested relationship or any temporal cue. The comment at lines 62–63 overstates the assurance that it “is announced” as part of that outcome.

- **Info — `src/data/pmg.js:798–801`: Human source verification remains necessary.** The touched content includes `> 10 WBC`, starting empiric antibiotics, repeating UA if `>2 squamous cells`, `<100,000 CFU/mL` with nonspecific UTI symptoms **OR** a negative culture leading to discontinuation, and the repositioned `< 10 WBC → investigate other source` alternative. No specific drug is named. These claims and their new relationship are flagged as **unverifiable from code, not suspicious**.

(1) **No string-content issue.** I compared the string contents in section A line 141 against line 143, and line 147 against line 144, character by character as supplied:

```text
> 10 WBC → start empiric antibiotics and repeat UA if >2 squamous cells
<100,000 CFU/mL with nonspecific UTI symptoms OR culture negative → discontinue antibiotics
```

Both match their removed versions exactly in the packet: the ordinary spaces, `→` characters, capitalization, punctuation, digits, `>` followed by a space before `10`, `>2` without a space, and `<100,000` without a space. Section B lines 798–799 also match these strings.

No other clinical string or value changes in the diff, excluding comments. The `< 10 WBC` string is unchanged. Its reading position changes because the former third outcome now precedes it as a child of the first outcome. This is a comparison of the supplied text; filesystem bytes were not independently inspected.

(2) **No issue for the supplied data.**

- Every outcome’s `text` is unique within its sibling list. These keys remain stable across renders and reordering. The fixed nested `li` does not require a key.
- Accessing `o.then` on a string primitive is safe: property access boxes the primitive and returns `undefined` here. Consequently, string outcomes render no nested content.
- Object outcomes render `o.text`, followed by their truthy `then`. Both pass through `keepUnits`.
- There is no crash path for the supplied string/object values. Given the stated sole consumer, no other outcome reader requires adaptation.
- The test walker at section E lines 13–19 traverses arrays recursively and uses `Object.values` for objects. It reaches both `text` and `then` inside the outcomes array without throwing or skipping either.

These tests establish the helper’s space-only transformations, not the clinical source accuracy or the accessibility of the rendered hierarchy.

(3) **Partially achieved; the two Medium findings apply.** The child has its own line, added indentation, a down-right icon, and normal rather than medium font weight. These distinguish it from a parallel top-level outcome and suggest continuation.

However, nesting expresses subordination more directly than elapsed time. It does not resolve whether the child attaches to starting antibiotics, repeating UA, or the entire combined statement. A conditional or immediate interpretation remains possible.

DOM reading order is first-outcome text → culture step → `< 10 WBC` alternative. That order is coherent with the intended grouping. The icon contributes no spoken information because it is `aria-hidden`. Even when list semantics survive, a nested unordered list conveys hierarchy rather than explicitly conveying “later.” Actual screen-reader behavior was not tested.

(4) **No demonstrated theme, type, print, or overflow defect.**

All component colour classes shown use theme-token names. The added colours are `text-prose` and `text-muted`, explicitly confirmed as tokens in the packet. Explicit font sizes in the component are 13, 14, 15, and 18 px, all permitted.

The nested `ul`, `li`, and `span` inherit **15 px** from the outer list at section C line 59. `font-normal` changes weight, and `size-4` sizes the icon; neither sets a font size.

The print block preserves the nested text, flex layout, padding, spacing, and icon. Its universal colour override makes text and the icon’s `currentColor` stroke black. No applicable rule hides this content or removes its indentation. The `.no-print` rule does not match it; the `section > ol > li` selector does not target these unordered lists. The enclosing article receives `break-inside: avoid`. The fixed print colours are in stylesheet overrides, outside the stated prohibition on component colour classes.

For narrow layouts, the text can wrap at ordinary spaces alongside the nonshrinking icon. `keepUnits` binds `<100,000 CFU/mL` into an unbroken segment, and the span’s automatic flex minimum width means sufficiently narrow available space could overflow. The packet does not demonstrate such overflow at the requested widths. The reported 320/375/768 px previews, dark/light results, and actual print output cannot be confirmed here.

(5) **Docs mostly match the implementation, with limits on their assurances.**

- **“No words were added or removed”** is accurate for the clinical outcome strings. It does not mean their ordering or structural relationship stayed unchanged.
- The descriptions of an object with `text` and `then`, a nested list item, indentation, and a down-right arrow match the code.
- Describing the step categorically as reading “later” overstates what the presentation guarantees, for the reasons above.
- **“As in the drawing, where it hangs below Start empiric antibiotics”** at section B lines 736–737 is **unverifiable from this packet**. The drawing is absent.
- **The view’s “read from the picture” note is unchanged:** supported by the complete diff and its presence at section C lines 106–115.
- The documented first-draft review history and owner’s choice agree with the supplied history. Original review records are absent, so reviewer identities, exact dispositions, and the broader claim about reviews before every release cannot be independently verified. “Single engine each time, both separately” is compatible with separate reviews.
- Section A lines 34–36 contain an existing **v0.7.5** verification statement. The added v0.7.6 history entry contains no fresh test-count claim. The current 87 passing tests and verifier success are reported context, not independently confirmed results. Section E defines four tests; it cannot substantiate the full-suite total.

No additional definite defect or React warning is evident from the supplied code.

## Packet receipt

Counts include numbered content lines and exclude section delimiters.

**A — 150 lines.** First and last:

```text
1	diff --git a/CLAUDE.md b/CLAUDE.md
150	   ],
```

**B — 99 lines (721–819).** First and last:

```text
721	// Page 5 is a flowchart embedded as an IMAGE — no text layer. This is a reading
819	};
```

**C — 119 lines.** First and last:

```text
1	import { ArrowRight, CornerDownRight, ExternalLink, ImageIcon } from "lucide-react";
119	}
```

**D — 24 lines.** First and last:

```text
1	// Display-only text helpers for clinical strings. They change spaces, never the
24	  typeof text === "string" ? text.replace(NUMBER_UNIT, "$1\u00A0").replace(SIGN_NUMBER, "$1\u00A0") : text;
```

**E — 69 lines.** First and last:

```text
1	// Number-and-unit binding (src/lib/text.js). The helpers are display only: they may
69	});
```

**F — 67 lines (263–329).** First and last:

```text
263	/* ─── Print: black on white in either scheme, every row fully expanded, tools
329	}
```
---

## Dispositions

- **Run 1, Medium (the three-arrow chain is ambiguous) — put to Thiago,** with Gemini's High on the
  same point. He chose the indented sub-step, which Run 2 reviewed.
- **Run 1, Low ("only the line break") — fixed** in `docs/HISTORY.md`.
- **Run 2, Medium 1 (nesting shows hierarchy, not time) — accepted as Thiago's choice,** made after
  both reviewers had raised the same concern about the arrow chain; relayed to him.
- **Run 2, Medium 2 (VoiceOver may drop list semantics) — fixed:** both lists carry `role="list"`,
  and the component comment no longer promises how the step "is announced".
- **Run 2, Info (clinical claims touched) — relayed;** the words are unchanged from v0.7.5, only
  their structure moved, at Thiago's direction.
