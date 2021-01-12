/**
 * shuffle
 * @via https://css-tricks.com/snippets/javascript/shuffle-array/#technique-2
 */

function shuffle(array) {
  const sorted = [...array];
  sorted.sort(() => 0.5 - Math.random());
  return sorted;
}

module.exports.shuffle = shuffle;