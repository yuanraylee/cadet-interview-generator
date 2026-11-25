/* Shared DOM, random, and formatting helpers; application state. */
'use strict';

const $ = (id) => document.getElementById(id);
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const range = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const mix = (items) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = range(0, index);
    [shuffled[index], shuffled[otherIndex]] = [
      shuffled[otherIndex],
      shuffled[index]
    ];
  }

  return shuffled;
};

const fmt3 = (value) => String(value).padStart(3, '0');
const fmt2 = (value) => String(value).padStart(2, '0');
const fmtFeet = (value) => value.toLocaleString('en-US');
const WORD_RANGES = {
  short: [100, 199],
  medium: [200, 299],
  long: [300, 500]
};

const articleBank = [
  ...(window.OFFLINE_ARTICLES || []),
  ...(window.CADET_EXTRA_ARTICLES || [])
];

let usedArticleKeys = {
  short: new Set(),
  medium: new Set(),
  long: new Set()
};
let currentPaper = null;
