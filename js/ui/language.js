/* Re-render visible content in place while preserving open controls. */
(function () {
  function paintButtons() {
    const isEnglish = CadetI18n.get() === 'en';
    document.documentElement.lang = isEnglish ? 'en' : 'zh-Hant';

    document.querySelectorAll('[data-lang]').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.lang === CadetI18n.get())
      );
    });

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = CadetI18n.t(node.dataset.i18n);
    });

    const articleLengths = {
      random: isEnglish ? 'Random · 100–500 words' : '隨機 · 100–500 字',
      short: isEnglish ? 'Short · 100–199 words' : '短篇 · 100–199 字',
      medium: isEnglish ? 'Medium · 200–299 words' : '中篇 · 200–299 字',
      long: isEnglish ? 'Long · 300–500 words' : '長篇 · 300–500 字'
    };

    document.querySelectorAll('#articleLength option').forEach((option) => {
      option.textContent = articleLengths[option.value] || option.textContent;
    });

    const atcDifficulties = {
      easy: isEnglish ? 'Easy · 2–3 items' : '簡單 · 2–3 項',
      normal: isEnglish ? 'Normal · 4–5 items' : '一般 · 4–5 項',
      hard: isEnglish ? 'Hard · 5–6 items' : '困難 · 5–6 項'
    };

    document.querySelectorAll('#atcDifficulty option').forEach((option) => {
      option.textContent = atcDifficulties[option.value] || option.textContent;
    });
  }

  function setLanguage(language) {
    if (language === CadetI18n.get()) return;

    const revealedAnswers = [
      ...document.querySelectorAll('#questions .answer, #atc .answer')
    ].map((answer) => !answer.hidden);
    const expandedPanels = ['translationPanel', 'vocabularyPanel'].map(
      (id) => !$(id).hidden
    );
    const glossaryState = CadetReading.getActive();
    const expandedAtcDetails = [
      ...document.querySelectorAll('.atc-extra-toggle')
    ].map((button) => button.getAttribute('aria-expanded') === 'true');

    CadetI18n.set(language);
    paintButtons();

    if (typeof currentPaper === 'undefined' || !currentPaper) return;

    displayPaper(currentPaper);
    document
      .querySelectorAll('#questions .answer, #atc .answer')
      .forEach((answer, index) => {
        answer.hidden = !revealedAnswers[index];
        const button = document.querySelector(
          `[aria-controls="${answer.id}"]`
        );

        if (!button) return;
        button.setAttribute(
          'aria-expanded',
          String(Boolean(revealedAnswers[index]))
        );

        const label = button.querySelector('span');
        if (label && button.closest('#questions')) {
          label.textContent = CadetI18n.t('answer');
        }
      });

    ['translationPanel', 'vocabularyPanel'].forEach((id, index) => {
      $(id).hidden = !expandedPanels[index];
      $(index === 0 ? 'translationToggle' : 'vocabularyToggle').setAttribute(
        'aria-expanded',
        String(expandedPanels[index])
      );
    });

    document.querySelectorAll('.atc-extra-toggle').forEach((button, index) => {
      const isExpanded = Boolean(expandedAtcDetails[index]);
      const panel = document.getElementById(
        button.getAttribute('aria-controls')
      );

      if (panel) panel.hidden = !isExpanded;
      button.setAttribute('aria-expanded', String(isExpanded));
    });

    updateShowAllLabel();
    CadetReading.restoreActive(glossaryState);
    CadetEyeControls.syncTranslation();
  }

  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });

  paintButtons();
  window.CadetLanguage = { setLanguage };
})();
