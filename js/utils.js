/**
 * Utility function(s) we want to be able to use this code in our application code
 */

// returns a random list/array item
function getRandomListItem(list = []) {
  if (list.length > 0) {
    let randomIndex = Math.floor(Math.random() * list.length);
    // console.log('randomIndex: ', randomIndex);
    return list[randomIndex];
  }

  return;
}

export default {
  getRandomListItem,
};
