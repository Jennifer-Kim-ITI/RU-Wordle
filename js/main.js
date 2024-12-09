console.clear();

/**
 *
 * WORDLE game description:
 *  -- Players have six attempts to guess a five-letter word
 *  -- Feedback is given for each guess in the form of colored tiles
 *     indicating when letters match or occupy the correct position.
 *
 * TODO:
 *
 * 1. Fetch all necessary JSON word data for our game
 *    -- get json data of 5-letter words in the english language (dictionary)
 *    -- get json data of "common" 5-letter words from dictionary (gameWords)
 *
 * 2. Once we have all the required JSON data
 *    -- assign a RANDOM targetWord from our chosen gameWords
 *
 * 3. Start our game by adding event listeners for physical keyboard keypresses
 *    and clicks on the virtual keyboard in order to recieve input from the user
 *    -- check for "Enter" keypress or click to handle submission of a 5-letter word
 *    -- check for "Delete" keypress or click in order to handle deleting last
 *       guessed letter
 *    -- use a Regular Expression to check for case in-sensitive letters a-z
 *    -- RegEx passed into the built-in match() method: event.key.match(/^[a-z]$/i)
 *
 * 4. Add a letter to the gameboard:
 *    -- ONLY IF the current row has an empty tile available
 *    -- add a data-state="has-letter" and a data-letter="{{letter}}" attributes
 *       to empty tile element and set it's text to {{letter}}
 *    -- STOP adding letters when the current row has 5 tiles that contain letters
 *
 * 5. Remove/delete the last letter entered from the gameboard:
 *    -- ONLY from the current row of letters
 *    -- STOP removing/deleting when there are 5 empty tiles on a row
 *
 * 6. Submit a word guess
 *     -- ONLY allow submission when the current row has 5 tiles that contain letters
 *     -- If row has < 5 tiles that contains letters alert user "not enough letters"
 *     -- Check the position of each letter again the letters in our targetWord
 *     -- If correct word is guessed, alert the user and end the game (7);
 *     -- If incorrect word is guessed, then continue to next row and word guess
 *
 * 7. End our game by removing event listeners
 *
 */

 let dictionary, gameWords;
 let gameboard = document.querySelector('.gameboard');
 let keyboard = document.querySelector('.keyboard');

 function getTodayDate() {
   return new Date().toISOString().split('T')[0];
 }
 
 let gameState = {
   date: getTodayDate(),
   solution: '',
   boardState: [],
   status: 'in_progress',
 };
 
 function getDailyWord() {
   const date = getTodayDate();
   return gameWords[Math.abs(hashCode(date)) % gameWords.length];
 }
 
 function hashCode(str) {
   return str.split('').reduce((hash, char) => {
     return hash * 31 + char.charCodeAt(0);
   }, 0);
 }
 
 function saveGameState() {
   localStorage.setItem('ruWordleGameState', JSON.stringify(gameState));
 }
 
 function loadGameState() {
   const savedState = localStorage.getItem('ruWordleGameState');
   if (savedState) {
     const parsedState = JSON.parse(savedState);
     if (parsedState.date === getTodayDate()) {
       gameState = parsedState;
 
       if (gameState.status === 'won' || gameState.status === 'lost') {
         alert(`You've already ${gameState.status === 'won' ? 'won' : 'lost'} today's game. Please come back tomorrow for a new word!`);
         endGame(); 
       }
     } else {
       gameState = {
         date: getTodayDate(),
         solution: getDailyWord(),
         boardState: [],
         status: 'in_progress'
       };
       saveGameState();
     }
   } else {
     gameState.solution = getDailyWord();
     saveGameState();
   }
 }
 
 async function getData() {
   try {
     let dictResponse = await fetch('/data/dictionary.json');
     let dictArray = await dictResponse.json();
     let gamewordsResponse = await fetch('/data/game_words.json');
     let gamewordsArray = await gamewordsResponse.json();
     dictionary = [...dictArray];
     gameWords = [...gamewordsArray];
     loadGameState();
     return true;
   } catch (err) {
     console.error(`getData Error: ${err}`);
     return false;
   }
 }
 
 async function initGame() {
   try {
     let dataLoaded = await getData();
     if (dataLoaded) {
       console.log(`Daily solution: ${gameState.solution}`);
       startGame();
     }
   } catch (err) {
     console.error(`initGame Error: ${err}`);
   }
 }
 
 initGame();
 
 function startGame() {
   document.addEventListener('keyup', keypressHandler);
   document.addEventListener('click', clickHandler);
 }
 
 function endGame() {
   document.removeEventListener('keyup', keypressHandler);
   document.removeEventListener('click', clickHandler);
 }
 
 function keypressHandler(event) {
   if (event.key === 'Enter') {
     submitGuess();
   }
   if (event.key === 'Backspace' || event.key === 'Delete') {
     removeLetter();
   }
   if (event.key.match(/^[a-z]$/i)) {
     let lowercaseLetter = event.key.toLowerCase();
     addLetter(lowercaseLetter);
   }
 }
 
 function clickHandler(event) {
   let dataKey = event.target.dataset.key;
   let dataEnter = event.target.dataset.enter;
   let dataDelete = event.target.dataset.delete;
 
   if (dataEnter === 'enter') {
     submitGuess();
   }
   if (dataDelete === 'delete') {
     removeLetter();
   }
   if (dataKey === event.target.innerText.toLowerCase()) {
     addLetter(dataKey.toLowerCase());
   }
 }
 
 function addLetter(letter) {
   let tilesWithLetter = gameboard.querySelectorAll(
     'div.tile[data-state="has-letter"]'
   );
 
   if (tilesWithLetter.length === gameState.solution.length) {
     return false;
   }
 
   let nextEmptyTile = gameboard.querySelector('div.tile:not([data-state])');
   nextEmptyTile.dataset.letter = letter;
   nextEmptyTile.dataset.state = 'has-letter';
   nextEmptyTile.innerText = letter;
 }
 
 function removeLetter() {
   let tilesWithLetter = gameboard.querySelectorAll(
     'div.tile[data-state="has-letter"]'
   );
 
   if (tilesWithLetter.length === 0) {
     return false;
   }
 
   let lastLetterIndex = tilesWithLetter.length - 1;
   let lastTileWithLetter = tilesWithLetter[lastLetterIndex];
 
   delete lastTileWithLetter.dataset.letter;
   delete lastTileWithLetter.dataset.state;
   lastTileWithLetter.innerText = '';
 }
 
 function submitGuess() {
   let tilesWithLetter = gameboard.querySelectorAll(
     'div.tile[data-state="has-letter"]'
   );
 
   if (tilesWithLetter.length !== gameState.solution.length) {
     return alert(`Not enough letters! Your guess must contain 5 letters!`);
   }
 
   let wordGuess = '';
   tilesWithLetter.forEach(function (tile) {
     wordGuess += tile.dataset.letter;
   });
 
   if (!dictionary.includes(wordGuess)) {
     return alert(
       `Your guess is not a valid 5-letter word in the English Dictionary! Try again!`
     );
   }
 
   tilesWithLetter.forEach(function (tile, index, nodeList) {
     checkLetterState(tile, index, nodeList, wordGuess);
   });
 }
 
 function checkLetterState(tile, index, tilesWithLetter, wordGuess) {
   let currentLetter = tile.dataset.letter;
   let virtualKey = keyboard.querySelector(
     `button[data-key="${currentLetter}"]`
   );
   let state = '';
 
   if (gameState.solution[index] === currentLetter) {
     state = 'correct';
   } else if (gameState.solution.includes(currentLetter)) {
     state = 'found';
   } else {
     state = 'wrong';
   }
 
   tile.dataset.state = state;
   if (virtualKey.dataset.state !== 'correct') {
     virtualKey.dataset.state = state;
   }
 
   if (index === tilesWithLetter.length - 1) {
     checkGameResult(wordGuess);
   }
 }
 
 function checkGameResult(wordGuess) {
   if (wordGuess === gameState.solution) {
     gameState.status = 'won';
     saveGameState();
     setTimeout(function () {
       alert(`You WON! The correct solution was: ${gameState.solution}`);
     }, 200);
     return endGame();
   }
 
   let remainingEmptyTiles = gameboard.querySelectorAll(
     'div.tile:not([data-state])'
   );
   if (remainingEmptyTiles.length === 0) {
     gameState.status = 'lost';
     saveGameState();
     setTimeout(function () {
       alert(`Sorry, you've run out of guesses and lost the game!`);
     }, 200);
     return endGame();
   }
 }