/* Each eye button and the global Show All / Hide All action. */
function toggleItemAnswer(button){
 const answer=document.getElementById(button.getAttribute('aria-controls'));
 if(!answer)return;
 const willShow=answer.hidden;
 answer.hidden=!willShow;
 button.setAttribute('aria-expanded',String(willShow));
 button.setAttribute('aria-label',(willShow?'Hide':'Show')+' answer');
 button.title=(willShow?'Hide':'Show')+' answer';
 updateShowAllLabel();
}
function updateShowAllLabel(){
 const answers=[...document.querySelectorAll('#questions .answer, #atc .answer')];
 $('showAll').textContent=answers.length && answers.every(answer=>!answer.hidden)?'Hide All':'Show All';
}

$('showAll').addEventListener('click', () => {
  const answers = [...document.querySelectorAll(
    '#questions .answer, #atc .answer'
  )];

  const show = answers.some(answer => answer.hidden);

  answers.forEach(answer => {
    answer.hidden = !show;
  });

  document.querySelectorAll('.reveal-icon').forEach(button => {
    button.setAttribute('aria-expanded', String(show));
    button.setAttribute('aria-label',
      show ? 'Hide answer' : 'Show answer');
    button.title = show ? 'Hide answer' : 'Show answer';
  });

  updateShowAllLabel();
});
