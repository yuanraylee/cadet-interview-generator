/* One shared vocabulary source across article text, curated vocabulary, and concept details. */
(function(){
  const e=s=>escapeHTML(String(s??''));
  const $id=id=>document.getElementById(id);
  let currentArticle=null, activeKey=null, activeLocation=null;
  const dictionary=()=>window.CADET_AVIATION_GLOSSARY||{};
  const curated=()=>window.CADET_ARTICLE_VOCABULARY||{};
  const isZh=()=>CadetI18n.get()!=='en';
  const text=(en,zh)=>isZh()?zh:en;
  const normal=s=>String(s).toLocaleLowerCase('en').trim();
  function selectedEntries(article){return curated()[article.title]||[];}
  function lookup(key){
    if(!currentArticle)return null;
    const entry=selectedEntries(currentArticle).find(v=>normal(v.word)===normal(key));
    const term=dictionary()[normal(key)];
    if(!entry&&!term)return null;
    return {entry,term,key:normal(key)};
  }
  function section(label,value){return value?`<p class="word-detail-line"><strong>${e(label)}: </strong>${e(value)}</p>`:'';}
  function detailsHtml(word,entry,term){
    if(!term){return `<div class="word-simple-definition">${e(entry?.meaning||'')}</div><p class="word-disclaimer">${e(text('Curated article vocabulary · No paid translation API used.','文章精選單字 · 不使用付費翻譯 API。'))}</p>`;}
    const zh=isZh();
    let result=section('English Definition',term.en);
    result+=section('中文定義',term.zh);
    result+=section(zh?'運作原理':'Operating principle',zh?(term.principleZh||term.principleEn):term.principleEn);
    result+=section(zh?'影響因素':'Factors',zh?(term.factorsZh||term.factorsEn):term.factorsEn);
    result+=section(zh?'公式／適用條件':'Formula / conditions',term.formula);
    result+=section(zh?'實際例子':'Example',zh?(term.exampleZh||term.exampleEn):term.exampleEn);
    result+=section(zh?'常見誤解':'Common misconception',zh?(term.misconceptionZh||term.noteZh||term.misconceptionEn||term.noteEn):(term.misconceptionEn||term.noteEn));
    if(term.related?.length){
      const related=term.related.filter(k=>dictionary()[normal(k)]);
      if(related.length)result+=`<p class="word-detail-line"><strong>${zh?'相關術語':'Related terms'}：</strong>${related.map(k=>`<button type="button" class="word-related" data-word="${e(k)}">${e(k)}</button>`).join(' · ')}</p>`;
    }
    result+=section(zh?'參考來源':'Reference',term.source);
    if(!term.principleEn)result+=`<p class="word-disclaimer">${e(text('Concise glossary entry; the extended technical explanation is pending review.','此詞條目前是精簡版；完整技術說明尚待逐條校訂。'))}</p>`;
    return result;
  }
  // There is only one disclosure location: the vocabulary list beneath the article.
  // Clicking a term in the article opens that list and focuses the corresponding row.
  let selectedKey=null, expandedKey=null;
  const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Keep the panel in normal document flow. Never animate its height:
  // an inline height animation can become stale when a nested glossary expands.
  function motion(node, show){
    if(node._readingAnimation){
      node._readingAnimation.cancel();
      node._readingAnimation=null;
    }
    if(reducedMotion()||!node.animate){node.hidden=!show;return;}
    if(show){
      node.hidden=false;
      const anim=node.animate(
        [{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:190,easing:'ease-out'}
      );
      node._readingAnimation=anim;
      anim.finished.then(()=>{if(node._readingAnimation===anim){anim.cancel();node._readingAnimation=null;}}).catch(()=>{});
    }else{
      // Collapse immediately so following sections move naturally, with no
      // stale fixed-height animation or hidden overflow.
      node.hidden=true;
    }
  }
  function setPanel(id,open,animate=true){
    const node=$id(id),button=$id(id==='vocabularyPanel'?'vocabularyToggle':'translationToggle');
    if(animate)motion(node,open);else {if(node._readingAnimation)node._readingAnimation.cancel();node._readingAnimation=null;node.hidden=!open;}
    button.setAttribute('aria-expanded',String(open));
    if(id==='translationPanel')syncTranslation();
  }
  function syncTranslation(){
    const b=$id('translationToggle');
    const expanded=b.getAttribute('aria-expanded')==='true';
    const label=CadetI18n.get()==='en'?(expanded?'Hide translation':'Show translation'):(expanded?'隱藏翻譯':'顯示翻譯');
    b.setAttribute('aria-label',label);b.title=label;
  }
  function syncRows(){
    $id('vocabularyPanel').querySelectorAll('.magazine-vocab-row').forEach(row=>{
      const key=normal(row.dataset.vocabKey||'');
      const chosen=key===selectedKey,expanded=key===expandedKey;
      row.classList.toggle('is-selected',chosen);
      row.classList.toggle('is-expanded',expanded);
      const control=row.querySelector('.vocab-entry-trigger');
      if(control)control.setAttribute('aria-expanded',String(expanded));
      const detail=row.querySelector('.vocab-detail-motion');
      if(detail){detail.classList.toggle('is-open',expanded);detail.setAttribute('aria-hidden',String(!expanded));detail.inert=!expanded;}
    });
  }
  function chooseWord(key,{expand=false,scroll=true}={}){
    const record=lookup(key);if(!record)return;
    const row=[...$id('vocabularyPanel').querySelectorAll('.magazine-vocab-row')].find(r=>normal(r.dataset.vocabKey)===record.key);
    if(!row)return;
    selectedKey=record.key;
    expandedKey=expand&&record.term?record.key:null;
    if($id('vocabularyPanel').hidden)setPanel('vocabularyPanel',true,true);
    syncRows();
    if(scroll){
      // First allow the panel to enter the layout, then scroll to the exact row.
      requestAnimationFrame(()=>requestAnimationFrame(()=>row.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'center'})));
    }
  }
  function toggleRow(key){
    const record=lookup(key);if(!record)return;
    selectedKey=record.key;
    expandedKey=expandedKey===record.key?null:record.key;
    syncRows();
  }
  function closeWord(){expandedKey=null;selectedKey=null;syncRows();}
  function refreshInline(){syncRows();}
  function inlineArticle(body,entries){
    // Only link words chosen for this exact article, avoiding blind matching of
    // ambiguous words such as bank, pitch, or stall in unrelated contexts.
    const terms=[...new Set(entries.map(v=>v.word).filter(Boolean))].sort((a,b)=>b.length-a.length);
    if(!terms.length)return paragraphs(body);
    const escaped=terms.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    const regex=new RegExp('(?<![A-Za-z])('+escaped.join('|')+')(?![A-Za-z])','gi');
    return body.trim().split(/\n\s*\n/).map(par=>{
      let result='',start=0,match;regex.lastIndex=0;
      while((match=regex.exec(par))!==null){
        result+=e(par.slice(start,match.index)).replace(/\n/g,'<br>');
        const found=entries.find(v=>normal(v.word)===normal(match[0]));
        result+=`<a class="article-word" href="https://www.google.com/search?q=${encodeURIComponent("define:"+(found?.word||match[0]))}" target="_blank" rel="noopener noreferrer" title="${e(text('Look up in Google Dictionary','使用 Google 查詢單字'))}">${e(match[0])}</a>`;
        start=match.index+match[0].length;
      }
      return '<p>'+result+e(par.slice(start)).replace(/\n/g,'<br>')+'</p>';
    }).join('');
  }
  function setButton(id,shown){$id(id).setAttribute('aria-expanded',String(shown));}
  function render(article){
    currentArticle=article;
    const lang=CadetI18n.get(),tr=window.CADET_ARTICLE_TRANSLATIONS?.[article.title];
    const enParagraphs=article.body.trim().split(/\n\s*\n/);
    const valid=Array.isArray(tr)&&tr.length===enParagraphs.length;
    const entries=selectedEntries(article), glossary=dictionary();
    // Avoid stale selection on newly generated article.
    selectedKey=null;expandedKey=null;
    $id('articleBody').innerHTML=inlineArticle(article.body,entries);
    setPanel('translationPanel',false,false);setPanel('vocabularyPanel',false,false);
    setButton('translationToggle',false);setButton('vocabularyToggle',false);syncTranslation();
    $id('translationPanel').innerHTML=valid?`<h3>${e(lang==='en'?'Traditional Chinese Translation':'繁體中文逐段翻譯')}</h3>${tr.map((p,i)=>`<p><span class="study-note">${lang==='en'?'Paragraph':'第'} ${i+1}${lang==='en'?'':' 段'}：</span>${e(p)}</p>`).join('')}`:`<p class="study-note">${e(CadetI18n.t('notTranslated'))}</p>`;
    $id('vocabularyPanel').innerHTML=`<div class="vocab-heading"><h3>${e(CadetI18n.t('keyVocab'))} (${entries.length})</h3>`+
      `<span class="vocab-legend"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></svg>${e(text('Aviation terms · Click for details','航空術語 · 點擊查看詳解'))}</span></div>`+
      `<div class="magazine-vocab">${entries.map((v,i)=>{
        const technical=!!glossary[normal(v.word)];
        const label=`<span class="vocab-index">${String(i+1).padStart(2,'0')}</span>`+
          `<span class="vocab-copy"><span class="vocab-inline"><strong>${e(v.word)}</strong><em>${e(v.pos)}</em><span class="vocab-meaning">${e(v.meaning)}</span></span></span>`;
        const info='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></svg>';
        return `<div class="magazine-vocab-row" data-vocab-key="${e(normal(v.word))}">`+
          (technical?`<button class="vocab-entry-trigger" type="button" data-word="${e(v.word)}" aria-expanded="false" aria-controls="vocab-detail-${i}" aria-label="${e(text('Details for','查看詳解'))} ${e(v.word)}">${label}<span class="vocab-info-mark">${info}</span></button>`:
             `<div class="vocab-entry-static">${label}</div>`)+
          (technical?`<div class="vocab-detail-motion" id="vocab-detail-${i}" aria-hidden="true"><div class="vocab-detail-content">${detailsHtml(v.word,v,glossary[normal(v.word)])}</div></div>`:'')+
          `</div>`;
      }).join('')}</div>`;
  }
  document.addEventListener('click',event=>{
    const rowButton=event.target.closest('#vocabularyPanel .vocab-entry-trigger');
    if(rowButton){toggleRow(rowButton.dataset.word);return;}
    const related=event.target.closest('#vocabularyPanel .word-related');
    if(related){chooseWord(related.dataset.word,{expand:true,scroll:true});}
  });
  $id('translationToggle').addEventListener('click',()=>setPanel('translationPanel',$id('translationToggle').getAttribute('aria-expanded')!=='true'));
  $id('vocabularyToggle').addEventListener('click',()=>setPanel('vocabularyPanel',$id('vocabularyToggle').getAttribute('aria-expanded')!=='true'));
  window.CadetEyeControls={syncTranslation};
  window.CadetReading={
    render,openWord:(key)=>chooseWord(key,{expand:false}),closeWord,refreshInline,
    getActive:()=>({selectedKey,expandedKey}),
    restoreActive:state=>{
      if(!state)return;
      selectedKey=state.selectedKey||null;
      expandedKey=state.expandedKey||null;
      syncRows();
    }
  };
})();
