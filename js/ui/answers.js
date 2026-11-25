/* Each disclosure row and the global Show All / Hide All action. */
function toggleItemAnswer(button){
 const answer=document.getElementById(button.getAttribute('aria-controls'));
 if(!answer)return;
 const willShow=answer.hidden;
 answer.hidden=!willShow;
 button.setAttribute('aria-expanded',String(willShow));
 button.setAttribute('aria-label',CadetI18n.t(willShow?'hideAnswer':'showAnswer'));
 button.title=CadetI18n.t(willShow?'hideAnswer':'showAnswer');
 updateShowAllLabel();
}
function updateShowAllLabel(){
 const answers=[...document.querySelectorAll('#questions .answer, #atc .answer')];
 const translation=document.getElementById('translationPanel');
 const allOpen=answers.length>0 && answers.every(answer=>!answer.hidden) && (!translation || !translation.hidden);
 $('showAll').textContent=allOpen?CadetI18n.t('hideAll'):CadetI18n.t('showAll');
}

$('showAll').addEventListener('click', () => {
  const answers = [...document.querySelectorAll(
    '#questions .answer, #atc .answer'
  )];

  const translation=document.getElementById('translationPanel');
  const show = answers.some(answer => answer.hidden) || (translation && translation.hidden);

  answers.forEach(answer => {
    answer.hidden = !show;
  });

  document.querySelectorAll('.answer-disclosure').forEach(button => {
    button.setAttribute('aria-expanded', String(show));
    button.setAttribute('aria-label',
      CadetI18n.t(show ? 'hideAnswer' : 'showAnswer'));
    button.title = CadetI18n.t(show ? 'hideAnswer' : 'showAnswer');
  });

  // Include the Chinese translation in the same Show All / Hide All action.
  // Reuse the existing eye button so aria-expanded, tooltip and animation stay in sync.
  const translationToggle=document.getElementById('translationToggle');
  if(translation && translationToggle && translation.hidden===show){
    translationToggle.click();
  }

  updateShowAllLabel();
});

// A manual translation-eye click must also update the global button label.
document.getElementById('translationToggle')?.addEventListener('click',updateShowAllLabel);
