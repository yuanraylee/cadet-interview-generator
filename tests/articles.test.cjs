'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const LIBRARY = path.join(ROOT, 'data', 'article-library');
const HASH_FIXTURE = require(path.join(ROOT, 'tests', 'fixtures', 'article-library-hashes.json'));
const { readLibrary, validateArticle } = require(path.join(ROOT, 'scripts', 'validate-articles.js'));

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function digest(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function loadBrowserData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', 'articles.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', 'reading-translations.js'), 'utf8'), context);
  return JSON.parse(JSON.stringify(context.window));
}

test('all bilingual article files and the manifest pass validation', () => {
  const result = readLibrary(LIBRARY);
  assert.deepEqual(result.errors, []);
  assert.equal(result.articles.length, 27);
  assert.equal(result.articles.filter((article) => article.bank === 'primary').length, 5);
  assert.equal(result.articles.filter((article) => article.bank === 'extra').length, 22);
  assert.ok(result.articles.every((article) => article.paragraphs.every((paragraph) => paragraph.en && paragraph.zh)));
});

test('the 27 migrated article records retain their reviewed desktop content', () => {
  const result = readLibrary(LIBRARY);
  const actual = result.articles.map((article) => ({ id: article.id, sha256: digest(article) }));
  assert.deepEqual(actual, HASH_FIXTURE.articles);
});

test('generated browser data matches the JSON source without changing UI globals', () => {
  const result = readLibrary(LIBRARY);
  const browserData = loadBrowserData();
  const expectedPrimary = [];
  const expectedExtra = [];
  const expectedTranslations = {};

  for (const record of result.articles) {
    const article = {
      category: record.category,
      title: record.title,
      body: record.paragraphs.map((paragraph) => paragraph.en).join('\n\n')
    };
    if (record.source) article.source = record.source;
    if (record.bank === 'extra') expectedExtra.push(article);
    else expectedPrimary.push(article);
    expectedTranslations[record.title] = record.paragraphs.map((paragraph) => paragraph.zh);
  }

  assert.deepEqual(browserData.OFFLINE_ARTICLES, expectedPrimary);
  assert.deepEqual(browserData.CADET_EXTRA_ARTICLES, expectedExtra);
  assert.deepEqual(browserData.CADET_ARTICLE_TRANSLATIONS, expectedTranslations);
});

test('generated article files are committed and current', () => {
  const result = spawnSync(process.execPath, ['scripts/build-article-bank.js', '--check'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test('validator rejects a missing paragraph translation', () => {
  const article = JSON.parse(fs.readFileSync(path.join(LIBRARY, 'article-001.json'), 'utf8'));
  article.paragraphs[0].zh = '';
  const errors = validateArticle(article, 'article-001.json');
  assert.ok(errors.some((error) => error.includes('paragraphs[0].zh must not be blank')));
});

test('library validation rejects duplicate titles and English content', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cadet-articles-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const first = JSON.parse(fs.readFileSync(path.join(LIBRARY, 'article-001.json'), 'utf8'));
  const second = structuredClone(first);
  second.id = 'article-002';
  fs.writeFileSync(path.join(directory, 'article-001.json'), JSON.stringify(first));
  fs.writeFileSync(path.join(directory, 'article-002.json'), JSON.stringify(second));
  fs.writeFileSync(path.join(directory, 'index.json'), JSON.stringify({
    version: 1,
    description: 'Duplicate validation fixture.',
    articles: [first, second].map((article) => ({
      id: article.id,
      file: `${article.id}.json`,
      title: article.title,
      category: article.category
    }))
  }));

  const result = readLibrary(directory);
  assert.ok(result.errors.some((error) => error.includes('duplicate title')));
  assert.ok(result.errors.some((error) => error.includes('duplicate English content')));
});
