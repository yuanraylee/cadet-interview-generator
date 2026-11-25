/* Render article, ATC messages and questions; escape text before injecting HTML. */
function escapeHTML(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
function paragraphs(s){return escapeHTML(s).split(/\n\s*\n/).map(s=>`<p>${s.replace(/\n/g,'<br>')}</p>`).join('');}
function explanationHTML(s){return escapeHTML(s||'').split('\n').map(line=>`<div class="solution-step">${line}</div>`).join('');}
function displayPaper(p){$('showAll').textContent = 'Show All';
 $('paper').hidden=false;
 $('nums').innerHTML=`<div class="number"><span>Candidate No.</span><strong>${fmt2(p.candidate)}</strong></div><div class="number"><span>Article No.</span><strong>${fmt2(p.articleNo)}</strong></div>`;
 $('articleCategory').textContent=p.article.category+' · '+p.article.words+' words · '+'Curated article';
 $('articleTitle').textContent=p.article.title;
 $('articleBody').innerHTML=paragraphs(p.article.body);
 $('articleSource').textContent=p.article.source||'Original educational practice passage';
 const eyeIcon=`<img src="./assets/icons/eye.svg" alt="" aria-hidden="true">`;
 $('questions').innerHTML=p.questions.map((q,i)=>`<li><div class="item-head"><div class="item-body"><span class="qType">${escapeHTML(q.type)}</span><div>${escapeHTML(q.question)}</div></div><button type="button" class="reveal-icon" aria-label="Show answer to question ${i+1}" title="Show answer" aria-expanded="false" aria-controls="question-answer-${i}">${eyeIcon}</button></div><div class="answer" id="question-answer-${i}" hidden><strong>Answer: ${escapeHTML(q.answer)}</strong><div class="solution-label">Explanation</div>${explanationHTML(q.explanation)}</div></li>`).join('');
  $('atc').innerHTML=p.atc.map((q,i)=>`<div class="atcItem"><div class="item-head"><div class="atcMeta"><b>ATC ${fmt2(i+1)}</b><span>${escapeHTML(q.procedure)} · ${escapeHTML(q.airline)}</span></div><button type="button" class="reveal-icon" aria-label="Show answer to ATC ${i+1}" title="Show answer" aria-expanded="false" aria-controls="atc-answer-${i}">${eyeIcon}</button></div><p class="atcText">${escapeHTML(q.spoken)}</p><div class="answer" id="atc-answer-${i}" hidden>${window.CadetAtcTeaching.atcTeachingHTML(q,escapeHTML)}</div></div>`).join('');
 $('generatedAt').textContent=new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short'}).format(new Date());
 $('paperMode').textContent='Offline article';
 $('showLength').textContent=p.article.words+' words';
}
