/* Select an offline reading article in the requested word range. */
function lengthMode() {
  return $('articleLength').value;
}

function articleWordCount(article) {
  return article.body.trim().split(/\s+/).length;
}

function chooseOfflineArticle() {
  const selection = lengthMode();
  const tier = selection === 'random' ? pick(['short', 'medium', 'long']) : selection;
  const [minimumWords, maximumWords] = WORD_RANGES[tier];

  const candidates = articleBank
    .map((article, index) => ({
      article,
      index,
      words: articleWordCount(article)
    }))
    .filter(
      ({ words }) => words >= minimumWords && words <= maximumWords
    );

  if (candidates.length === 0) {
    throw new Error(`No article available for length ${tier}`);
  }

  const available = candidates.filter(
    ({ index }) => !usedArticleKeys[tier].has(index)
  );

  if (available.length === 0) {
    usedArticleKeys[tier].clear();
  }

  const chosen = pick(available.length > 0 ? available : candidates);
  usedArticleKeys[tier].add(chosen.index);

  return {
    ...chosen.article,
    words: chosen.words,
    mode: 'offline'
  };
}
