/* Select reading articles within the requested word range. */
function lengthMode(){return $('articleLength').value;}
function chooseOfflineArticle(){
 const sel=lengthMode(),tier=sel==='random'?pick(['short','medium','long']):sel;
 const [lo,hi]=WORD_RANGES[tier];const candidates=articleBank.map((a,i)=>({a,i,words:a.body.trim().split(/\s+/).length})).filter(o=>o.words>=lo&&o.words<=hi);
 if(!candidates.length)throw new Error('No article available for length '+tier);
 const available=candidates.filter(o=>!usedArticleKeys[tier].has(o.i));
 if(!available.length){usedArticleKeys[tier].clear();}
 const chosen=pick(available.length?available:candidates);usedArticleKeys[tier].add(chosen.i);
 return {...chosen.a,words:chosen.words,mode:'offline'};
}
