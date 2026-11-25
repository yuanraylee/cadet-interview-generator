/* Entry point. Keep this file loaded after the other JavaScript files. */
function generate(){
 $('generate').disabled=true;$('message').textContent='';
 const p={candidate:range(1,10),articleNo:range(1,10),questions:makeQuestions(),atc:makeAtcSet($('atcDifficulty').value)};
 try{
  p.article=chooseOfflineArticle();
  currentPaper=p;displayPaper(p);$('paper').scrollIntoView({block:'start',behavior:'smooth'});
 }catch(e){$('message').textContent='Unable to generate the practice paper: '+e.message;}
 finally{$('generate').disabled=false;$('generate').innerHTML='Generate <span aria-hidden="true">→</span>';}
}
$('generate').addEventListener('click',generate);
$('paper').addEventListener('click',event=>{const button=event.target.closest('.reveal-icon');if(button)toggleItemAnswer(button);});

/* Public test interface for logic-only smoke tests. */
window.CadetTest={makeAtcSet,makeQuestions,chooseOfflineArticle,articleBank,PROCEDURES,WORD_RANGES};
