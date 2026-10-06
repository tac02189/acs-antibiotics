// Display-only text helpers for clinical strings. They change spaces, never the
// characters a reader sees, so what is on screen is still the PDF's wording;
// tests/text.test.js checks that for every string in the data.

// A dose's number and unit ("2 g", "500 mg", "15 mg/kg") joined by a narrow
// no-break space: in the monospace face it reads as one token, and a line can
// never end between the number and its unit. (A thin space, U+2009, looked the
// same but was a break opportunity.)
export const fmtDose = (d) => String(d).replace(/(\d) (g|mg)\b/g, "$1\u202F$2");

// Units that follow a number in the PMG's text. The lookahead after the unit
// keeps "mg" from matching the start of "mg/kg" and "h" the start of "hours",
// while "800 mg/160 mg" still counts as mg.
const UNIT = "g|mg|mcg|kg|mL|ml|L|mg/kg(?:/dose)?|hours?|hrs?|h|min|minutes|days?|weeks?|years?|doses?|units?|WBC|CFU/mL|°C|°F";
// The number may end in a superscript digit, as in "10⁴ CFU/mL".
const NUMBER_UNIT = new RegExp(`([\\d⁰¹²³⁴⁵⁶⁷⁸⁹]) (?=(?:${UNIT})(?!\\w|/[A-Za-z]))`, "g");
// A comparison or multiplication sign and the number it qualifies: "> 10", "≥ 60 kg", "× 7 days".
const SIGN_NUMBER = /([<>≤≥×]) (?=\d)/g;

// Binds a number to the unit after it ("8 days", "13.3 mg/kg/dose", "q12 hours")
// and a sign to the number after it with a no-break space, so a line never ends
// on a bare number or sign. Anything that is not a string passes through.
export const keepUnits = (text) =>
  typeof text === "string" ? text.replace(NUMBER_UNIT, "$1\u00A0").replace(SIGN_NUMBER, "$1\u00A0") : text;
