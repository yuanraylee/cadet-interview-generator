/* User-selected display language. ATC source text stays in English. */
window.CadetI18n = (() => {
  const strings = {
    'zh-TW': {
      subtitle: '培訓機師面試練習',
      articleLength: '文章長度',
      difficulty: 'ATC 難度',
      generate: '產生題目',
      copy: '複製',
      print: '列印',
      reading: '英文閱讀',
      atc: '航管通訊練習',
      five: '連續五問',
      translationToggle: '中文翻譯',
      vocabularyToggle: '重點單字',
      showAll: '顯示全部答案',
      hideAll: '隱藏全部答案',
      disclaimer: '僅供面試練習；所有 ATC 指令均為模擬內容，不能作為實際飛行許可。',
      candidate: '考生編號',
      articleNumber: '文章編號',
      showAnswer: '顯示答案',
      hideAnswer: '隱藏答案',
      answer: '答案',
      explanation: '解析',
      source: '原創英文練習文章',
      copied: '已複製完整試卷與答案。',
      copyBlocked: '瀏覽器阻擋複製；請改用列印或手動選取。',
      error: '出題失敗：',
      words: '字',
      keyVocab: '重點單字',
      notTranslated: '這篇文章尚未完成逐段中文翻譯。英文原文仍可閱讀，文中的單字查詢仍可使用。',
      noVocab: '目前尚無匹配的精選單字。'
    },
    en: {
      subtitle: 'Pilot Interview Preparation',
      articleLength: 'Article Length',
      difficulty: 'ATC Difficulty',
      generate: 'Generate',
      copy: 'Copy',
      print: 'Print',
      reading: 'Reading Article',
      atc: 'ATC Communications',
      five: 'Five Questions',
      translationToggle: 'Chinese Translation',
      vocabularyToggle: 'Key Vocabulary',
      showAll: 'Show All',
      hideAll: 'Hide All',
      disclaimer: 'For interview practice only. ATC instructions are simulated, not operational clearances.',
      candidate: 'Candidate No.',
      articleNumber: 'Article No.',
      showAnswer: 'Show Answer',
      hideAnswer: 'Hide Answer',
      answer: 'Answer',
      explanation: 'Explanation',
      source: 'Original educational practice passage',
      copied: 'The full practice paper and answer key have been copied.',
      copyBlocked: 'Copy was blocked by your browser. Use Print or select the text manually.',
      error: 'Unable to generate the practice paper: ',
      words: 'words',
      keyVocab: 'Key Vocabulary',
      notTranslated: 'A reviewed Chinese translation is not available for this article yet. The original English text and in-article word lookups remain available.',
      noVocab: 'No curated vocabulary matches this article yet.'
    }
  };

  let currentLanguage = 'zh-TW';

  try {
    if (localStorage.getItem('cadet_language') === 'en') {
      currentLanguage = 'en';
    }
  } catch (error) {
    // Storage can be disabled in private browsing or embedded contexts.
  }

  function translate(key) {
    return strings[currentLanguage][key] || key;
  }

  function setLanguage(language) {
    currentLanguage = language === 'en' ? 'en' : 'zh-TW';

    try {
      localStorage.setItem('cadet_language', currentLanguage);
    } catch (error) {
      // Language selection still works for the current page session.
    }
  }

  return {
    t: translate,
    get: () => currentLanguage,
    set: setLanguage
  };
})();
