interface GuessResult {
  number: string;
  exact_matches: number;
  partial_matches: number;
}

function isValidNumber(num: string): boolean {
  if (num.length !== 4) return false;
  const digits = new Set(num.split(''));
  return digits.size === 4;
}

function calculateMatches(guess: string, target: string): { exact: number; partial: number } {
  let exact = 0;
  let partial = 0;
  
  // Calculate exact matches
  for (let i = 0; i < 4; i++) {
    if (guess[i] === target[i]) exact++;
  }
  
  // Calculate partial matches
  const guessDigits = guess.split('');
  const targetDigits = target.split('');
  for (const digit of guessDigits) {
    if (targetDigits.includes(digit)) {
      if (guess.indexOf(digit) !== target.indexOf(digit)) {
        partial++;
      }
    }
  }
  
  return { exact, partial };
}

function matchesPreviousGuesses(candidate: string, previousGuesses: GuessResult[]): boolean {
  for (const prevGuess of previousGuesses) {
    const matches = calculateMatches(candidate, prevGuess.number);
    if (matches.exact !== prevGuess.exact_matches || matches.partial !== prevGuess.partial_matches) {
      return false;
    }
  }
  return true;
}

export function generateNextGuess(previousGuesses: GuessResult[]): string {
  const usedNumbers = new Set(previousGuesses.map(g => g.number));
  const validGuesses: string[] = [];
  
  // Collect all valid possible guesses
  for (let i = 123; i <= 9876; i++) {
    const numStr = i.toString().padStart(4, '0');
    
    // Skip if not valid or already used
    if (!isValidNumber(numStr) || usedNumbers.has(numStr)) continue;
    
    // Check if this number matches all previous guess feedbacks
    if (matchesPreviousGuesses(numStr, previousGuesses)) {
      validGuesses.push(numStr);
    }
  }
  
  if (validGuesses.length === 0) {
    throw new Error("No valid guess found that matches all previous feedbacks");
  }
  
  // Pick a random guess from the valid ones
  const randomIndex = Math.floor(Math.random() * validGuesses.length);
  return validGuesses[randomIndex];
} 