#!/usr/bin/env node
// Rebuild browser-compatible JS from the local JSON article library.
// Run: node scripts/build-article-bank.js
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const dbDir = path.join(root,'data','article-library');
const manifest = JSON.parse(fs.readFileSync(path.join(dbDir,'index.json'),'utf8'));
const articles = [];
const extraArticles = [];
const translations = {};
const ids = new Set(), titles = new Set();
for (const item of manifest.articles) {
  const record = JSON.parse(fs.readFileSync(path.join(dbDir,item.file),'utf8'));
  if (!record.id || ids.has(record.id) || !record.title || titles.has(record.title)) throw Error('Duplicate or missing id/title: '+record.id);
  ids.add(record.id);titles.add(record.title);
  if (!Array.isArray(record.paragraphs) || !record.paragraphs.length) throw Error('No paragraphs: '+record.id);
  if (record.paragraphs.some(p => !p.en || typeof p.en !== 'string')) throw Error('Missing English paragraph: '+record.id);
  const en = record.paragraphs.map(p=>p.en);
  const zh = record.paragraphs.map(p=>p.zh);
  if (zh.some(v=>typeof v!=='string' || !v.trim())) throw Error('Missing translation: '+record.id);
  const article = {category:record.category,title:record.title,body:en.join('\n\n')};
  if (record.source) article.source = record.source;
  // Preserve any additional metadata present in the legacy bank.
  for (const [k,v] of Object.entries(record.additionalFields || {})) article[k]=v;
  if (record.bank === "extra") extraArticles.push(article); else articles.push(article);
  translations[record.title]=zh;
}
const generated = '// GENERATED FILE. Edit data/article-library/*.json then run: node scripts/build-article-bank.js\n';
fs.writeFileSync(path.join(root,'data','articles.js'),generated+'window.OFFLINE_ARTICLES = '+JSON.stringify(articles,null,2)+';\nwindow.CADET_EXTRA_ARTICLES = '+JSON.stringify(extraArticles,null,2)+';\n');
fs.writeFileSync(path.join(root,'data','reading-translations.js'),generated+'window.CADET_ARTICLE_TRANSLATIONS = '+JSON.stringify(translations,null,2)+';\n');
console.log(`Built ${articles.length + extraArticles.length} articles and their aligned translations.`);
