import React, { createContext, useState, useContext, useEffect } from 'react';

const GameContext = createContext({
  difficulty: 'normal', 
  changeDifficulty: () => {},

  currentGuess: '',
  guesses: [],
  addLetter: () => {},
  delLetter: () => {},
  submitGuess: () => {},
});

const loadWordList = async (difficulty) => {
  const url = difficulty === 'hard' ? '/hard.json' : '/normal.json';
  try {
    const response = await fetch(url);
    const words = await response.json();
    return words;
  } catch (error) {
    console.error('Failed to load word list:', error);
    return [];
  }
};

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [difficulty, setDifficulty] = useState('normal');
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuess] = useState([]);
  const [validWords, setValidWords] = useState([]);
  const [answerWord, setAnswerWord] = useState('');
  const [guessesWithClues, setGuessesWithClues] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [guessesLeft, setGuessesLeft] = useState(difficulty === 'hard' ? 5 : 6);
  const [submitStatus, setSubmitStatus] = useState('');



  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setCurrentGuess('');
    setGuess([]);
  };

  const maxGuessLength = difficulty === 'hard' ? 7 : 6;

  useEffect(() => {
    loadWordList(difficulty).then(setValidWords);
  }, [difficulty]);

  useEffect(() => {
    if (validWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * validWords.length);
      setAnswerWord(validWords[randomIndex]);
    }
  }, [validWords]);



  useEffect(() => {
    const newGuessesWithClues = guesses.map((guess) => {
      return guess === answerWord
        ? { guess, clues: Array(guess.length).fill({ letter: guess, status: 'correct' }) }
        : { guess, clues: checkGuess(guess, answerWord) };
    });
    setGuessesWithClues(newGuessesWithClues);
    console.log(newGuessesWithClues);
  }, [guesses, answerWord]);

  

  const addLetter = (letter) => {
    if (gameOver) {
      console.log('Game is over.');
      return;
    }

    if (currentGuess.length < maxGuessLength) {
      setCurrentGuess(currentGuess + letter);
    }
  };

  const delLetter = () => {
    if (gameOver) {
      console.log('Game is over.');
      return;
    }

    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const submitGuess = () => {
    if (gameOver) {
      console.log('Game is over.');
      return;
    }

    if (currentGuess.length !== maxGuessLength) {
      setSubmitStatus('short');
      console.log('Word length is invalid.');
      return;
    }

    if (!validWords.includes(currentGuess.toLowerCase())) {
      setSubmitStatus('invalid');
      console.log('Word is invalid.');

      return;
    }

    if (currentGuess.toLowerCase() === answerWord) {
      setSubmitStatus('win');
      console.log('Congratulations!');
      setGameOver(true);
      return;
    } else {
      setGuessesLeft(guessesLeft - 1);

      const clues = checkGuess(currentGuess.toLowerCase(), answerWord);
      clues.forEach(clue => {
        console.log(`${clue.letter}: ${clue.color}`);
      });
      
    }

    if (guessesLeft <= 1) {
      setGameOver(true);
      console.log('Game over.');
      return;
    }
  
    setGuess([...guesses, currentGuess]);
    setCurrentGuess('');
    setSubmitStatus('');

    console.log("Enter was pressed, currentGuess:", currentGuess);
    console.log("The answer word is:", answerWord);
  };

  const checkGuess = (guess, answerWord) => {
    const result = new Array(guess.length).fill(null);    const answerLetters = answerWord.split('');
    const guessLetters = guess.toLowerCase().split('');
  
    const letterCount = answerLetters.reduce((acc, letter) => {
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {});
    console.log(answerLetters);
    guessLetters.forEach((letter, i) => {
      console.log(i, answerLetters[i]);

      if (letter === answerLetters[i]) {
        result[i] = { letter, status: 'correct' };

        console.log("1st check", i, letter, 'green');
        letterCount[letter]--;
      }
    });
  
    guessLetters.forEach((letter, i) => {

      if (result[i] !== null) return;
  
      if (letterCount[letter] > 0) {
        result[i] = { letter, status: 'present' };
        console.log("2nd check", i, letter, 'yellow');
        letterCount[letter]--;
      } else {
        result[i] = { letter, status: 'absent' };
        console.log("3rd check", i, letter, 'grey');
      }
    });
    
    return result.filter(clue => clue !== null);
  };


  const resetGame = () => {
    setCurrentGuess('');
    setGuess([]);
    setValidWords([]);
    setAnswerWord('');
    setGuessesWithClues([]);
    setGameOver(false);
    setGuessesLeft(difficulty === 'hard' ? 5 : 6);
    setSubmitStatus('');
  
    loadWordList(difficulty).then(words => {
      setValidWords(words);
      const randomIndex = Math.floor(Math.random() * words.length);
      setAnswerWord(words[randomIndex]);
    });
  };
  

  return (
    <GameContext.Provider value={{ 
      difficulty, 
      changeDifficulty,
      currentGuess,
      guesses,
      addLetter,
      delLetter,
      submitGuess,
      guessesWithClues,
      checkGuess,
      submitStatus,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};