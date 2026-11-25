/* Render paper content. Escape all generated text before inserting HTML. */
function escapeHTML(value) {
  const escapedCharacters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return String(value).replace(/[&<>"']/g, (character) =>
    escapedCharacters[character]
  );
}

function paragraphs(text) {
  return escapeHTML(text)
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function explanationHTML(text) {
  return escapeHTML(text || '')
    .split('\n')
    .map((line) => `<div class="solution-step">${line}</div>`)
    .join('');
}

function answerEyeIcon() {
  return `<svg class="eye-glyph" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>`;
}

function questionHTML(question, index, eyeIcon) {
  const answerId = `question-answer-${index}`;
  const showAnswer = CadetI18n.t('showAnswer');

  return `<li>
    <div class="item-head">
      <div class="item-body">
        <span class="qType">${escapeHTML(question.type)}</span>
        <div>${escapeHTML(question.question)}</div>
      </div>
      <button type="button" class="answer-disclosure eye-control"
        aria-expanded="false" aria-controls="${answerId}"
        aria-label="${showAnswer}" title="${showAnswer}">${eyeIcon}</button>
    </div>
    <div class="answer" id="${answerId}" hidden>
      <strong>${escapeHTML(question.answer)}</strong>
      <div class="solution-label">${CadetI18n.t('explanation')}</div>
      ${explanationHTML(question.explanation)}
    </div>
  </li>`;
}

function atcItemHTML(scenario, index, eyeIcon) {
  const answerId = `atc-answer-${index}`;
  const showAnswer = CadetI18n.t('showAnswer');
  const scenarioName = escapeHTML(scenario.procedure);
  const airline = escapeHTML(scenario.airline);
  const teaching = window.CadetAtcTeaching.atcTeachingHTML(
    scenario,
    escapeHTML,
    index
  );

  return `<div class="atcItem">
    <div class="item-head">
      <div class="atcMeta">
        <b>ATC ${fmt2(index + 1)}</b>
        <span>${scenarioName} · ${airline}</span>
      </div>
      <button type="button" class="answer-disclosure eye-control"
        aria-expanded="false" aria-controls="${answerId}"
        aria-label="${showAnswer}" title="${showAnswer}">${eyeIcon}</button>
    </div>
    <p class="atcText">${escapeHTML(scenario.spoken)}</p>
    <div class="answer" id="${answerId}" hidden>${teaching}</div>
  </div>`;
}

function displayPaper(paper) {
  $('showAll').textContent = CadetI18n.t('showAll');
  $('paper').hidden = false;

  $('nums').innerHTML = `
    <div class="number">
      <span>${CadetI18n.t('candidate')}</span>
      <strong>${fmt2(paper.candidate)}</strong>
    </div>
    <div class="number">
      <span>${CadetI18n.t('articleNumber')}</span>
      <strong>${fmt2(paper.articleNo)}</strong>
    </div>`;

  $('articleCategory').textContent =
    `${paper.article.category} · ${paper.article.words} words · Curated article`;
  $('articleTitle').textContent = paper.article.title;
  $('articleBody').innerHTML = paragraphs(paper.article.body);
  $('articleSource').textContent = paper.article.source || CadetI18n.t('source');
  CadetReading.render(paper.article);

  const eyeIcon = answerEyeIcon();
  $('questions').innerHTML = paper.questions
    .map((question, index) => questionHTML(question, index, eyeIcon))
    .join('');
  $('atc').innerHTML = paper.atc
    .map((scenario, index) => atcItemHTML(scenario, index, eyeIcon))
    .join('');

  $('generatedAt').textContent = new Intl.DateTimeFormat(
    CadetI18n.get() === 'en' ? 'en-US' : 'zh-TW',
    { dateStyle: 'medium', timeStyle: 'short' }
  ).format(new Date());
  $('paperMode').textContent = 'Offline article';
  $('showLength').textContent = `${paper.article.words} words`;
}
