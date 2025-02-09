export function generateSecretNumber(): string {
  const digits = Array.from({ length: 10 }, (_, i) => i);
  const secret: number[] = [];
  
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    secret.push(digits[randomIndex]);
    digits.splice(randomIndex, 1);
  }
  
  return secret.join('');
}

export function evaluateGuess(guess: string, secret: string): {
  exactMatches: number;
  partialMatches: number;
} {
  let exactMatches = 0;
  let partialMatches = 0;
  
  const secretArray = secret.split('');
  const guessArray = guess.split('');
  
  // Check for exact matches
  for (let i = 0; i < 4; i++) {
    if (guessArray[i] === secretArray[i]) {
      exactMatches++;
      secretArray[i] = 'X';
      guessArray[i] = 'Y';
    }
  }
  
  // Check for partial matches
  for (let i = 0; i < 4; i++) {
    if (guessArray[i] !== 'Y') {
      const index = secretArray.indexOf(guessArray[i]);
      if (index !== -1) {
        partialMatches++;
        secretArray[index] = 'X';
      }
    }
  }
  
  return { exactMatches, partialMatches };
}

export function isValidGuess(guess: string): boolean {
  if (guess.length !== 4) return false;
  if (!/^\d+$/.test(guess)) return false;
  
  const digits = new Set(guess.split(''));
  return digits.size === 4;
} 