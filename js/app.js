/* Application entry point. Load this file after the data, generators, and UI. */
function generate() {
  const generateButton = $('generate');
  generateButton.disabled = true;
  $('message').textContent = '';

  try {
    const paper = {
      candidate: range(1, 10),
      articleNo: range(1, 10),
      questions: makeQuestions(),
      atc: makeAtcSet($('atcDifficulty').value)
    };

    paper.article = chooseOfflineArticle();
    currentPaper = paper;
    displayPaper(paper);
    $('paper').scrollIntoView({ block: 'start', behavior: 'smooth' });
  } catch (error) {
    $('message').textContent = CadetI18n.t('error') + error.message;
  } finally {
    generateButton.disabled = false;
    generateButton.innerHTML =
      `<span data-i18n="generate">${CadetI18n.t('generate')}</span> ` +
      '<span aria-hidden="true">→</span>';
  }
}

$('generate').addEventListener('click', generate);

// Handle nested ATC disclosures and individual answer controls.
$('paper').addEventListener('click', (event) => {
  const nestedToggle = event.target.closest('.atc-extra-toggle');

  if (nestedToggle) {
    const panel = document.getElementById(
      nestedToggle.getAttribute('aria-controls')
    );
    if (!panel) return;

    const isOpening = panel.hidden;
    panel.hidden = !isOpening;
    nestedToggle.setAttribute('aria-expanded', String(isOpening));

    const panelName = panel.id.includes('pron-')
      ? 'Pronunciation & Context'
      : 'Understand the Instructions';
    const action = isOpening ? 'Show' : 'Hide';
    nestedToggle.setAttribute('aria-label', `${action} ${panelName}`);
    nestedToggle.title = `${action} ${panelName}`;
    return;
  }

  const answerButton = event.target.closest('.answer-disclosure');
  if (answerButton) toggleItemAnswer(answerButton);
});

// Public logic interface used by integration checks and browser debugging.
window.CadetTest = {
  makeAtcSet,
  makeQuestions,
  chooseOfflineArticle,
  articleBank,
  PROCEDURES,
  WORD_RANGES
};
