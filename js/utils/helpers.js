/* Shared DOM, random and formatting helpers; application state. */
'use strict';
const $ = id => document.getElementById(id);
const pick = xs => xs[Math.floor(Math.random()*xs.length)];
const range = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const mix = xs => {let a=[...xs];for(let i=a.length-1;i>0;i--){const j=range(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
const fmt3 = n => String(n).padStart(3,'0');
const fmt2 = n => String(n).padStart(2,'0');
const fmtFeet = n => n.toLocaleString('en-US');
const WORD_RANGES = {short:[100,199],medium:[200,299],long:[300,500]};
const articleBank = [...(window.OFFLINE_ARTICLES||[]),...(window.CADET_EXTRA_ARTICLES||[])];
let usedArticleKeys={short:new Set(),medium:new Set(),long:new Set()};
let currentPaper=null;
