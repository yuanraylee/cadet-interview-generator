'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const LIBRARY = path.join(ROOT, 'data', 'article-library');
const { readLibrary, validateArticle } = require(path.join(ROOT, 'scripts', 'validate-articles.js'));

function loadGeneratedBank() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', 'articles.js'), 'utf8'), context);
  return [...(context.window.OFFLINE_ARTICLES || []), ...(context.window.CADET_EXTRA_ARTICLES || [])];
}

function digest(article) {
  const canonical = JSON.stringify({
    category: article.category,
    title: article.title,
    source: article.source,
    body: article.body
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

test('all article library files pass schema and collection validation', () => {
  const result = readLibrary(LIBRARY);
  assert.deepEqual(result.errors, []);
  assert.equal(result.articles.length, 27);
  assert.equal(result.articles.filter((article) => article.status === 'published').length, 27);
});

test('generated bank preserves every legacy article exactly', () => {
  const manifest = require(path.join(ROOT, 'tests', 'fixtures', 'legacy-article-manifest.json'));
  const bank = loadGeneratedBank();
  assert.equal(bank.length, manifest.articles.length);
  assert.deepEqual(
    bank.map((article) => ({ id: article.id, sha256: digest(article) })),
    manifest.articles
  );
});

test('generated article bank is committed and current', () => {
  const result = spawnSync(process.execPath, ['scripts/build-article-bank.js', '--check'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test('validator rejects incomplete paragraph translations', () => {
  const article = JSON.parse(fs.readFileSync(path.join(LIBRARY, 'AV-0001.json'), 'utf8'));
  article.content.paragraphs[0].zh = '測試翻譯';
  const errors = validateArticle(article, 'AV-0001.json');
  assert.ok(errors.some((error) => error.includes('translate every paragraph')));
});

test('library validation rejects duplicate titles and content', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cadet-articles-'));
  const first = JSON.parse(fs.readFileSync(path.join(LIBRARY, 'AV-0001.json'), 'utf8'));
  const second = structuredClone(first);
  first.id = 'AV-9001';
  second.id = 'AV-9002';
  fs.writeFileSync(path.join(directory, 'AV-9001.json'), JSON.stringify(first));
  fs.writeFileSync(path.join(directory, 'AV-9002.json'), JSON.stringify(second));
  const result = readLibrary(directory);
  assert.ok(result.errors.some((error) => error.includes('duplicate title')));
  assert.ok(result.errors.some((error) => error.includes('duplicate English content')));
});
