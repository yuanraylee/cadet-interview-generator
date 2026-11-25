#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_LIBRARY = path.join(ROOT, 'data', 'article-library');
const ARTICLE_FILENAME = /^article-[0-9]{3}\.json$/;
const SCHEMA = require(path.join(ROOT, 'schemas', 'article.schema.json'));

function countWords(text) {
  const trimmed = String(text || '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function normalizedText(text) {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function unknownKeys(value, allowed) {
  if (!isPlainObject(value)) return [];
  return Object.keys(value).filter((key) => !allowed.includes(key));
}

function validateArticle(article, filename = '<article>') {
  const errors = [];
  const add = (field, message) => errors.push(`${filename}: ${field} ${message}`);
  const props = SCHEMA.properties;

  if (!isPlainObject(article)) return [`${filename}: root must be an object`];

  for (const key of SCHEMA.required) {
    if (!(key in article)) add(key, 'is required');
  }
  for (const key of unknownKeys(article, Object.keys(props))) add(key, 'is not allowed');

  if (typeof article.id !== 'string' || !new RegExp(props.id.pattern).test(article.id)) {
    add('id', 'must match article-000');
  }
  if (filename !== '<article>' && article.id && filename !== `${article.id}.json`) {
    add('id', `must match filename (${filename})`);
  }
  if (typeof article.title !== 'string' || !article.title.trim()) add('title', 'must not be blank');
  if (typeof article.title === 'string' && article.title.length > props.title.maxLength) {
    add('title', `must be at most ${props.title.maxLength} characters`);
  }
  if (typeof article.category !== 'string' || !article.category.trim()) add('category', 'must not be blank');
  if (typeof article.category === 'string' && article.category.length > props.category.maxLength) {
    add('category', `must be at most ${props.category.maxLength} characters`);
  }
  if (!props.bank.enum.includes(article.bank)) add('bank', 'must be primary or extra');
  if (!props.reviewStatus.enum.includes(article.reviewStatus)) {
    add('reviewStatus', 'uses an unsupported value');
  }
  if (typeof article.source !== 'string') {
    add('source', 'must be a string');
  } else {
    if (article.source.length > props.source.maxLength) {
      add('source', `must be at most ${props.source.maxLength} characters`);
    }
    if (['reviewed', 'published'].includes(article.reviewStatus) && !article.source.trim()) {
      add('source', `must not be blank when reviewStatus is ${article.reviewStatus}`);
    }
  }

  if (!Array.isArray(article.paragraphs) || article.paragraphs.length === 0) {
    add('paragraphs', 'must contain at least one paragraph');
  } else {
    if (article.paragraphs.length > props.paragraphs.maxItems) {
      add('paragraphs', `must contain at most ${props.paragraphs.maxItems} paragraphs`);
    }
    article.paragraphs.forEach((paragraph, index) => {
      const field = `paragraphs[${index}]`;
      if (!isPlainObject(paragraph)) {
        add(field, 'must be an object');
        return;
      }
      for (const key of unknownKeys(paragraph, ['en', 'zh'])) add(`${field}.${key}`, 'is not allowed');
      for (const language of ['en', 'zh']) {
        if (!(language in paragraph)) add(`${field}.${language}`, 'is required');
        else if (typeof paragraph[language] !== 'string' || !paragraph[language].trim()) {
          add(`${field}.${language}`, 'must not be blank');
        }
      }
    });
  }

  const englishBody = Array.isArray(article.paragraphs)
    ? article.paragraphs.map((paragraph) => paragraph && paragraph.en || '').join('\n\n')
    : '';
  const words = countWords(englishBody);
  if (words < 100 || words > 500) {
    add('paragraphs', `contains ${words} English words; expected 100–500`);
  }

  return errors;
}

function validateManifest(manifest, filename = 'index.json') {
  const errors = [];
  const add = (field, message) => errors.push(`${filename}: ${field} ${message}`);
  if (!isPlainObject(manifest)) return [`${filename}: root must be an object`];

  for (const key of ['version', 'description', 'articles']) {
    if (!(key in manifest)) add(key, 'is required');
  }
  for (const key of unknownKeys(manifest, ['version', 'description', 'articles'])) add(key, 'is not allowed');
  if (manifest.version !== 1) add('version', 'must be 1');
  if (typeof manifest.description !== 'string' || !manifest.description.trim()) {
    add('description', 'must not be blank');
  }
  if (!Array.isArray(manifest.articles) || manifest.articles.length === 0) {
    add('articles', 'must contain at least one entry');
    return errors;
  }

  manifest.articles.forEach((item, index) => {
    const field = `articles[${index}]`;
    if (!isPlainObject(item)) {
      add(field, 'must be an object');
      return;
    }
    for (const key of ['id', 'file', 'title', 'category']) {
      if (!(key in item)) add(`${field}.${key}`, 'is required');
    }
    for (const key of unknownKeys(item, ['id', 'file', 'title', 'category'])) {
      add(`${field}.${key}`, 'is not allowed');
    }
    if (typeof item.id !== 'string' || !/^article-[0-9]{3}$/.test(item.id)) {
      add(`${field}.id`, 'must match article-000');
    }
    if (item.file !== `${item.id}.json`) add(`${field}.file`, 'must match the entry id');
    if (typeof item.title !== 'string' || !item.title.trim()) add(`${field}.title`, 'must not be blank');
    if (typeof item.category !== 'string' || !item.category.trim()) add(`${field}.category`, 'must not be blank');
  });

  return errors;
}

function readJson(fullPath, label, errors) {
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    errors.push(`${label}: invalid JSON (${error.message})`);
    return null;
  }
}

function addDuplicateErrors(entries, errors, label, select) {
  const seen = new Map();
  for (const entry of entries) {
    const key = normalizedText(select(entry.article));
    if (!key) continue;
    if (seen.has(key)) errors.push(`${entry.filename}: duplicate ${label}; already used by ${seen.get(key)}`);
    else seen.set(key, entry.filename);
  }
}

function readLibrary(libraryDir = DEFAULT_LIBRARY) {
  const errors = [];
  if (!fs.existsSync(libraryDir)) {
    return { articles: [], entries: [], errors: [`Article library not found: ${libraryDir}`], manifest: null };
  }

  const manifestPath = path.join(libraryDir, 'index.json');
  const manifest = readJson(manifestPath, 'index.json', errors);
  if (manifest) errors.push(...validateManifest(manifest));

  const diskFiles = fs.readdirSync(libraryDir).filter((name) => ARTICLE_FILENAME.test(name)).sort();
  const manifestItems = manifest && Array.isArray(manifest.articles) ? manifest.articles : [];
  const entries = [];
  const listedFiles = new Set();

  for (const item of manifestItems) {
    if (!isPlainObject(item) || typeof item.file !== 'string') continue;
    if (listedFiles.has(item.file)) {
      errors.push(`index.json: duplicate file entry (${item.file})`);
      continue;
    }
    listedFiles.add(item.file);
    const fullPath = path.join(libraryDir, item.file);
    if (!fs.existsSync(fullPath)) {
      errors.push(`index.json: listed article file does not exist (${item.file})`);
      continue;
    }
    const article = readJson(fullPath, item.file, errors);
    if (!article) continue;
    errors.push(...validateArticle(article, item.file));
    for (const key of ['id', 'title', 'category']) {
      if (item[key] !== article[key]) errors.push(`${item.file}: ${key} does not match index.json`);
    }
    entries.push({ filename: item.file, article });
  }

  for (const filename of diskFiles) {
    if (!listedFiles.has(filename)) errors.push(`${filename}: article file is not listed in index.json`);
  }

  addDuplicateErrors(entries, errors, 'id', ({ id }) => id);
  addDuplicateErrors(entries, errors, 'title', ({ title }) => title);
  addDuplicateErrors(
    entries,
    errors,
    'English content',
    ({ paragraphs }) => Array.isArray(paragraphs) ? paragraphs.map((paragraph) => paragraph.en).join(' ') : ''
  );

  return {
    articles: entries.map((entry) => entry.article),
    entries,
    errors,
    manifest
  };
}

function main() {
  const libraryArg = process.argv[2];
  const libraryDir = libraryArg ? path.resolve(process.cwd(), libraryArg) : DEFAULT_LIBRARY;
  const result = readLibrary(libraryDir);
  if (result.errors.length) {
    console.error(`Article validation failed with ${result.errors.length} error(s):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  const primary = result.articles.filter((article) => article.bank === 'primary').length;
  const translatedParagraphs = result.articles.reduce((total, article) => total + article.paragraphs.length, 0);
  console.log(
    `Validated ${result.articles.length} bilingual article(s): ` +
    `${primary} primary, ${result.articles.length - primary} extra, ${translatedParagraphs} aligned paragraph pair(s).`
  );
}

if (require.main === module) main();

module.exports = {
  countWords,
  normalizedText,
  readLibrary,
  validateArticle,
  validateManifest
};
