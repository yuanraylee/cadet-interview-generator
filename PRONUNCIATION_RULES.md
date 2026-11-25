# ATC Pronunciation Rules and Scope

## Source priority

1. Use the current local AIP for local procedures, facility names, and regional conventions.
2. Use ICAO Doc 9432 (4th edition, 2007) as the project's published radiotelephony reference for spelling and number-reading patterns. It is not a current local procedure database.
3. If the module cannot identify a token confidently, leave it unchanged rather than inventing a pronunciation.

## Implemented cues

- ICAO spelling alphabet, including **Alfa** and **Juliett**.
- Individual digits for headings, flight levels, runways, squawk codes, callsigns, and frequencies. Every frequency digit after the decimal point is retained.
- Whole hundreds and thousands for altitude, visibility, RVR, and cloud-height values; other feet/metres values are read digit by digit.
- Runway side suffixes: `L` = left, `R` = right, `C` = centre.
- Procedure suffixes: `DRAKE 1B` becomes `DRAKE wun Bravo`; the fix name remains unchanged.
- Common abbreviations with documented or conventional spoken forms. Unknown forms are not guessed.
- Taiwan's **See-Dee-Oh** rendering only when the text indicates the RCTP/Taipei CDO context. The current CAA eAIP example explicitly gives `C-D-O` as “See-Dee-Oh.” A context-free `C-D-O` is spelled with the ICAO alphabet instead.
- Taiwan navaid references distinguish a published facility name from spelling the identifier. A bare code is not automatically interpreted as a navaid; for example, `TNN` may have more than one meaning.

## Verification boundary

The module creates written pronunciation hints. It does not synthesize or certify audio, validate every airline callsign, confirm a route or runway pairing, or prove that a full readback is operationally correct. Its navaid list is curated rather than exhaustive and must be checked against the effective AIP before operational use.

The CDO pronunciation and RCTP example were cross-checked against Taiwan CAA eAIP RCTP AD 2.22.4 in AIRAC AIP AMDT 05/26, effective 29 October 2026. That page gives the exact example `C-D-O approved and cleared DRAKE 1B RNAV Arrival, when ready descend and maintain FL140` and labels C-D-O as “See-Dee-Oh.” See the [current CAA eAIP](https://ais.caa.gov.tw/eaip/) and its [RCTP AD 2 page for AIRAC 05/26](https://ais.caa.gov.tw/eaip/AIRAC%20AIP%20AMDT%2005-26_2026_10_29/eAIP/RC-AD%202%20RCTP%20%E8%87%BA%E7%81%A3%E6%A1%83%E5%9C%92%E5%9C%8B%E9%9A%9BTAIPEI-TAIWAN%20TAOYUAN%20INTL-en-GB.html).

## Check

```bash
npm run test:pronunciation
```
