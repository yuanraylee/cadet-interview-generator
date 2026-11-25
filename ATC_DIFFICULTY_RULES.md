# ATC Difficulty and Validation

## Accepted memory load (excluding callsign)

| Mode | Required independently recallable elements | Actual V13 sources |
|---|---:|---|
| Easy | 2–3 | Explicitly vetted short templates |
| Normal | 4–5 | Explicitly vetted 4–5-item templates |
| Hard | 5–6 | Five six-item synthetic catalog families (0, 1, 2, 3, 7) |

One instruction or information element counts once; a heading number, its turn direction and its verb are generally one bundled parameterized action (e.g., **turn left heading 270**). Similarly, a single complete QNH assignment is one item. The callsign does not count. Commas, clause counts, or mere word count are *not* the metric. Conditions can be counted separately only when they require independent memory (the CDO example includes `when ready`).

## Implementation

1. `js/generators/atc-validation.js` owns difficulty bounds, scenario profiles, required phrase patterns, and the Hard-family allowlist.
2. `js/generators/atc.js` selects three scenarios from certified profiles, prefers phase diversity, and retries invalid generated outputs within fixed limits.
3. `tests/atc-difficulty.test.cjs` generates 18,000 randomized transmissions plus negative cases. Run it after changing an ATC template, especially `fields`, `spoken`, `readback`, or difficulty logic.

## Important distinctions

- These checks cover **memory load and selected structural patterns**. They are not a substitute for phraseology review by a qualified instructor or validation against current ICAO provisions and the relevant local AIP.
- The 80,000 catalog is an address space of synthetic variations, not 80,000 validated operational clearances. Hard uses a conservative subset, and even that subset is not operationally validated.
- The RCTP CDO sample is based on Taiwan CAA eAIP AD 2.22.4. Most other generated scenarios use generic or hypothetical context. See the scope statement in `README.md`.
- Not all information must be fully read back (e.g. traffic advisories). This generator trains comprehension as well as readback; do not assume every item is mandatory readback content.
- Do not add irrelevant or dangerous constraints just to hit a numeric target. An inherently short but realistic clearance should appear only in an appropriate short-transmission mode or a separate safety drill.
