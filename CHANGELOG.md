# Changelog

## V13 — ATC difficulty validation (2026-11-26)

- Defined Easy as 2–3, Normal as 4–5, and Hard as 5–6 independently recallable items.
- Added explicit profiles and phrase-pattern checks; invalid generated scenarios are rejected and retried.
- Limited Hard to five six-item synthetic catalog families. This validates memory-load structure, not operational route or clearance validity.

## V12 — Taiwan navaid pronunciation references

- Added a curated Taiwan navaid reference list that distinguishes a facility's published name from spelling its identifier.
- Unknown names and identifiers remain unchanged instead of being guessed.

## V11 — Pronunciation engine

- Added written pronunciation hints for aviation numbers, common abbreviations, procedure suffixes, and the Taiwan-specific CDO example.
- Added pronunciation regression coverage and documented known limits.

## V10 — Reading aids and offline article library

- Added paragraph-aligned Traditional Chinese translations and the local JSON article source library.
- Added a build script that creates the browser article and translation data files.
