#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { readLibrary } = require('./validate-articles.js');

const ROOT = path.resolve(__dirname, '..');
const LIBRARY = path.join(ROOT, 'data', 'article-library');
const GENERATED_NOTICE = '// GENERATED FILE. Edit data/article-library/*.json then run: node scripts/build-article-bank.js\n';

function renderOutputs(articles) {
  const primary = [];
  const extra = [];
  const translations = {};

  for (const record of articles) {
    const article = {
      category: record.category,
      title: record.title,
      body: record.paragraphs.map((paragraph) => paragraph.en).join('\n\n')
    };
    if (record.source) article.source = record.source;
    if (record.bank === 'extra') extra.push(article);
    else primary.push(article);
    translations[record.title] = record.paragraphs.map((paragraph) => paragraph.zh);
  }

  return new Map([
    [
      path.join(ROOT, 'data', 'articles.js'),
      GENERATED_NOTICE +
        `window.OFFLINE_ARTICLES = ${JSON.stringify(primary, null, 2)};\n` +
        `window.CADET_EXTRA_ARTICLES = ${JSON.stringify(extra, null, 2)};\n`
    ],
    [
      path.join(ROOT, 'data', 'reading-translations.js'),
      GENERATED_NOTICE +
        `window.CADET_ARTICLE_TRANSLATIONS = ${JSON.stringify(translations, null, 2)};\n`
    ]
  ]);
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const result = readLibrary(LIBRARY);
  if (result.errors.length) {
    console.error(`Article validation failed with ${result.errors.length} error(s):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  const outputs = renderOutputs(result.articles);
  const stale = [];
  for (const [filename, expected] of outputs) {
    const current = fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : null;
    if (current !== expected) stale.push(path.relative(ROOT, filename));
    if (!checkOnly) fs.writeFileSync(filename, expected);
  }

  if (checkOnly && stale.length) {
    console.error(`Generated article output is stale: ${stale.join(', ')}`);
    console.error('Run npm run articles:build and commit the regenerated files.');
    process.exitCode = 1;
    return;
  }

  const primary = result.articles.filter((article) => article.bank === 'primary').length;
  if (checkOnly) console.log(`Generated article bank is current (${result.articles.length} articles).`);
  else console.log(`Built ${result.articles.length} bilingual articles (${primary} primary, ${result.articles.length - primary} extra).`);
}

if (require.main === module) main();

module.exports = { renderOutputs };
