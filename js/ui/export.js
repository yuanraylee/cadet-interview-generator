/* Copy complete paper including answers; print the currently expanded answers. */
function getPaperText(){
 const p=currentPaper;if(!p)return'';
 return [`Candidate No. ${fmt2(p.candidate)} | Article No. ${fmt2(p.articleNo)}`,`Reading: ${p.article.title} (${p.article.words} words)`,p.article.body,`Source: ${p.article.source||'Practice passage'}`,'ATC Communications',...p.atc.map((q,i)=>`${i+1}. ${q.spoken}`),'Five Consecutive Questions',...p.questions.map((q,i)=>`${i+1}. ${q.question}`),'--- Answers ---',...p.questions.map((q,i)=>`${i+1}. ${q.answer}\n${q.explanation||''}`),...p.atc.map((q,i)=>`ATC ${i+1}: ${q.readback}\nChecklist: ${q.fields.join(' / ')}`)].join('\n\n');
}

$('print').addEventListener('click',()=>window.print());
async function copyPaper(){
 const content=getPaperText();
 if(!content)return;
 try{
  if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(content);}
  else{throw new Error('Clipboard API unavailable');}
 }catch(error){
  const textarea=document.createElement('textarea');
  textarea.value=content;textarea.style.position='fixed';textarea.style.top='-1000px';
  document.body.appendChild(textarea);textarea.focus();textarea.select();
  const copied=document.execCommand('copy');textarea.remove();
  if(!copied){$('message').textContent='Copy was blocked by your browser. Use Print or select the text manually.';return;}
 }
 $('message').textContent='The full practice paper and answer key have been copied.';
}
$('copy').addEventListener('click',copyPaper);
