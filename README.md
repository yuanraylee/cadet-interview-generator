# Cadet Interview Generator

A static practice website for cadet-pilot interview preparation. It generates an English reading passage, three ATC listening/readback exercises, and five interview questions. The page runs without an account, server-side database, or API key.

## Run the website

Open `index.html` in a browser, or open the project folder in VS Code and start Live Server. No build step is required to use the site.

## Run the checks

Node.js is required for the checks and article-bank builder. From the project root:

```bash
npm test
```

This runs the article-library regression tests, randomized ATC checks, and pronunciation checks. The article tests validate all 27 bilingual source files, compare them with the migration hashes, and confirm that the generated browser files still expose the globals used by the existing UI. The ATC and pronunciation checks do not certify a real-world clearance or replace review against current aviation publications.

Validate the editable article source and confirm that generated files are current:

```bash
npm run articles:check
```

Rebuild the browser article files after editing the article JSON:

```bash
npm run articles:build
```

## Project map

| Path | Purpose |
|---|---|
| `index.html` | Page structure and ordered script/style loading |
| `css/` | Page, card, language, reading-aid, and print styles |
| `js/app.js` | Generate button and application entry point |
| `js/generators/` | Article, question, and ATC generation and validation |
| `js/ui/` | Rendering, answer controls, language, reading aids, and export |
| `js/utils/helpers.js` | Shared random, DOM, formatting, and application state helpers |
| `data/article-library/*.json` | Editable source articles and paragraph-aligned translations |
| `data/article-library/index.json` | Ordered article manifest and metadata cross-check |
| `data/articles.js`, `data/reading-translations.js` | Generated browser data; do not edit by hand |
| `schemas/article.schema.json` | Article record contract for IDs, review state, banks, and bilingual paragraphs |
| `scripts/validate-articles.js` | Cross-file, manifest, duplicate-content, and word-count validation |
| `scripts/build-article-bank.js` | Validates sources and rebuilds the existing browser globals |
| `data/atc*.js` | ATC scenario templates and the synthetic Hard scenario catalog |
| `data/aviation-glossary*.js`, `data/reading-vocabulary.js` | Curated reading aids and aviation glossary content |
| `tests/` | Node-based ATC and pronunciation checks |
| `ATC_DIFFICULTY_RULES.md` | Difficulty counts and validation scope |
| `PRONUNCIATION_RULES.md` | Pronunciation rules, sources, and limits |
| `CHANGELOG.md` | Notable project changes |

Scripts in `index.html` use classic browser globals, so their order matters. Keep data files before the code that reads them, and generators before the UI and application entry point.

## Update the article library

The JSON files in `data/article-library/` are the source of truth. `data/articles.js` and `data/reading-translations.js` remain browser-compatible generated outputs so the current static UI does not need a server or a runtime build step.

1. Edit or add `article-NNN.json` using `schemas/article.schema.json` as the contract.
2. Add the matching ID, filename, title, and category to `data/article-library/index.json` in display order.
3. Keep every English paragraph paired with a non-empty Traditional Chinese paragraph at the same array index.
4. Use `reviewStatus: "draft"` while editing. `legacy-imported` identifies the migrated desktop collection; `reviewed` and `published` require a non-empty source.
5. Run `npm run articles:validate`, then `npm run articles:build`.
6. Run `npm test` before committing. The generated files must also pass `npm run articles:check`.

IDs and titles must be unique. Article filenames must match their IDs, English articles must contain 100–500 words, every JSON file must appear exactly once in the manifest, and normalized duplicate English content is rejected. Titles should remain stable because curated vocabulary entries refer to article titles.

## ATC content and accuracy scope

The difficulty selector uses **Easy: 2–3**, **Normal: 4–5**, and **Hard: 5–6** independently recallable information items, excluding the callsign. ATC templates are selected only when their item count and expected spoken phrases match the corresponding validation profile.

The CDO example is based on the current Taiwan CAA eAIP RCTP AD 2.22.4 example. The active eAIP (AIRAC AIP AMDT 05/26, effective 29 October 2026) gives the phrase “C-D-O approved and cleared DRAKE 1B RNAV Arrival, when ready descend and maintain FL140” and explicitly gives its pronunciation as “See-Dee-Oh.” The eAIP also ties DRAKE 1B to the applicable arrival context. See the [current Taiwan CAA eAIP](https://ais.caa.gov.tw/eaip/) and the [RCTP AD 2 page for AIRAC 05/26](https://ais.caa.gov.tw/eaip/AIRAC%20AIP%20AMDT%2005-26_2026_10_29/eAIP/RC-AD%202%20RCTP%20%E8%87%BA%E7%81%A3%E6%A1%83%E5%9C%92%E5%9C%8B%E9%9A%9BTAIPEI-TAIWAN%20TAOYUAN%20INTL-en-GB.html).

Most other ATC exercises are **generic or synthetic training scenarios**. Their counts and selected phrase patterns are validated, but their route, airport, frequency, traffic, weather, and operational feasibility are not comprehensively checked against current charts or an active AIP. They must not be presented or used as live clearances. For operational procedures, consult current ICAO publications and the relevant State AIP; ICAO emphasizes using complete, unambiguous SID/STAR phraseology and assigned levels.

## Development notes

- Use two-space indentation in hand-written JavaScript and keep one logical operation per line.
- Update the generator, validation profile, test expectations, and documentation together when changing an ATC template or difficulty count.
- Treat generated article files as outputs. Make source-of-truth changes in the JSON library.
- `package.json` keeps the existing Playwright development dependency/configuration; the current automated checks are Node scripts, not browser-driven Playwright specs.
