#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_LIBRARY = path.join(ROOT, 'data', 'article-library');
const SCHEMA = require(path.join(ROOT, 'schemas', 'article.schema.json'));

function countWords(text) {
  const trimmed = String(text || '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function normalizedText(text) {
  return String(text || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function unknownKeys(value, allowed) {
  if (!isPlainObject(value)) return [];
  return Object.keys(value).filter((key) => !allowed.includes(key));
}

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
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

  if (article.schemaVersion !== props.schemaVersion.const) {
    add('schemaVersion', `must be ${props.schemaVersion.const}`);
  }
  if (typeof article.id !== 'string' || !new RegExp(props.id.pattern).test(article.id)) {
    add('id', 'must match AV-0000');
  }
  if (typeof article.title !== 'string' || !article.title.trim()) add('title', 'must not be blank');
  if (typeof article.title === 'string' && article.title.length > 200) add('title', 'must be at most 200 characters');
  if (!props.category.enum.includes(article.category)) add('category', 'uses an unsupported value');
  if (typeof article.subcategory !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.subcategory)) {
    add('subcategory', 'must be a lowercase kebab-case value');
  }
  if (typeof article.displayCategory !== 'string' || !article.displayCategory.trim()) {
    add('displayCategory', 'must not be blank');
  }
  if (!props.difficulty.enum.includes(article.difficulty)) add('difficulty', 'uses an unsupported value');
  if (!props.status.enum.includes(article.status)) add('status', 'uses an unsupported value');

  if (!isPlainObject(article.source)) {
    add('source', 'must be an object');
  } else {
    const sourceProps = props.source.properties;
    for (const key of props.source.required) {
      if (!(key in article.source)) add(`source.${key}`, 'is required');
    }
    for (const key of unknownKeys(article.source, Object.keys(sourceProps))) add(`source.${key}`, 'is not allowed');
    if (!sourceProps.type.enum.includes(article.source.type)) add('source.type', 'uses an unsupported value');
    if (typeof article.source.name !== 'string' || !article.source.name.trim()) add('source.name', 'must not be blank');
    if (article.source.url !== null && (typeof article.source.url !== 'string' || !isUrl(article.source.url))) {
      add('source.url', 'must be null or an HTTP(S) URL');
    }
    for (const key of ['publishedDate', 'accessedDate']) {
      const value = article.source[key];
      if (value !== null && (typeof value !== 'string' || !isDate(value))) add(`source.${key}`, 'must be null or YYYY-MM-DD');
    }
    if (typeof article.source.rightsNote !== 'string' || !article.source.rightsNote.trim()) {
      add('source.rightsNote', 'must not be blank');
    }
  }

  let paragraphs = [];
  if (!isPlainObject(article.content)) {
    add('content', 'must be an object');
  } else {
    for (const key of unknownKeys(article.content, ['paragraphs'])) add(`content.${key}`, 'is not allowed');
    if (!Array.isArray(article.content.paragraphs) || article.content.paragraphs.length === 0) {
      add('content.paragraphs', 'must contain at least one paragraph');
    } else {
      paragraphs = article.content.paragraphs;
      paragraphs.forEach((paragraph, index) => {
        const field = `content.paragraphs[${index}]`;
        if (!isPlainObject(paragraph)) {
          add(field, 'must be an object');
          return;
        }
        for (const key of unknownKeys(paragraph, ['en', 'zh'])) add(`${field}.${key}`, 'is not allowed');
        if (!('en' in paragraph)) add(`${field}.en`, 'is required');
        if (!('zh' in paragraph)) add(`${field}.zh`, 'is required');
        if (typeof paragraph.en !== 'string' || !paragraph.en.trim()) add(`${field}.en`, 'must not be blank');
        if (paragraph.zh !== null && (typeof paragraph.zh !== 'string' || !paragraph.zh.trim())) {
          add(`${field}.zh`, 'must be null or a non-blank string');
        }
      });
    }
  }

  const body = paragraphs.map((paragraph) => paragraph && paragraph.en || '').join('\n\n');
  const words = countWords(body);
  if (words < 100 || words > 500) add('content.paragraphs', `contains ${words} English words; expected 100–500`);

  if (!Array.isArray(article.tags) || article.tags.length === 0) {
    add('tags', 'must contain at least one tag');
  } else {
    const seenTags = new Set();
    article.tags.forEach((tag, index) => {
      if (typeof tag !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) {
        add(`tags[${index}]`, 'must be lowercase kebab-case');
      }
      if (seenTags.has(tag)) add(`tags[${index}]`, 'is duplicated');
      seenTags.add(tag);
    });
  }

  if (!isPlainObject(article.review)) {
    add('review', 'must be an object');
  } else {
    const reviewKeys = ['english', 'translation', 'facts', 'copyright'];
    for (const key of reviewKeys) {
      if (typeof article.review[key] !== 'boolean') add(`review.${key}`, 'must be a boolean');
    }
    for (const key of unknownKeys(article.review, reviewKeys)) add(`review.${key}`, 'is not allowed');

    const translations = paragraphs.map((paragraph) => paragraph && paragraph.zh);
    const translatedCount = translations.filter((value) => typeof value === 'string' && value.trim()).length;
    if (translatedCount > 0 && translatedCount !== paragraphs.length) {
      add('content.paragraphs', 'must translate every paragraph or leave every zh value null');
    }
    if (article.review.translation && translatedCount !== paragraphs.length) {
      add('review.translation', 'cannot be true until every paragraph has a translation');
    }
    if (!article.review.translation && translatedCount === paragraphs.length && paragraphs.length > 0) {
      add('review.translation', 'must be true when a complete translation is present');
    }
    if (article.status === 'published') {
      for (const key of ['english', 'facts', 'copyright']) {
        if (article.review[key] !== true) add(`review.${key}`, 'must be true for a published article');
      }
    }
  }

  return errors;
}

function readLibrary(libraryDir = DEFAULT_LIBRARY) {
  if (!fs.existsSync(libraryDir)) throw new Error(`Article library not found: ${libraryDir}`);
  const filenames = fs.readdirSync(libraryDir)
    .filter((name) => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b, 'en'));
  if (!filenames.length) throw new Error(`No article JSON files found in ${libraryDir}`);

  const articles = [];
  const errors = [];
  for (const filename of filenames) {
    const fullPath = path.join(libraryDir, filename);
    try {
      const article = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      errors.push(...validateArticle(article, filename));
      if (article && article.id && filename !== `${article.id}.json`) {
        errors.push(`${filename}: filename must match article id (${article.id}.json)`);
      }
      articles.push({ filename, article });
    } catch (error) {
      errors.push(`${filename}: invalid JSON (${error.message})`);
    }
  }

  const indexes = [
    ['id', (article) => normalizedText(article.id)],
    ['title', (article) => normalizedText(article.title)],
    ['English content', (article) => normalizedText(article.content && article.content.paragraphs
      ? article.content.paragraphs.map((paragraph) => paragraph.en).join(' ')
      : '')]
  ];
  for (const [label, select] of indexes) {
    const seen = new Map();
    for (const { filename, article } of articles) {
      const key = select(article);
      if (!key) continue;
      if (seen.has(key)) errors.push(`${filename}: duplicate ${label}; already used by ${seen.get(key)}`);
      else seen.set(key, filename);
    }
  }

  return { articles: articles.map((entry) => entry.article), errors, filenames };
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
  const published = result.articles.filter((article) => article.status === 'published').length;
  console.log(`Validated ${result.articles.length} article(s): ${published} published, ${result.articles.length - published} not published.`);
}

if (require.main === module) main();

module.exports = { countWords, normalizedText, readLibrary, validateArticle };
