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
  
  // First count exact matches
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      exactMatches++;
    }
  }
  
  // Then count partial matches
  const guessDigits = guess.split('');
  const secretDigits = secret.split('');
  
  for (let i = 0; i < 4; i++) {
    if (secretDigits.includes(guessDigits[i])) {
      if (guess[i] !== secret[i]) { // Only count if not already counted as exact match
        partialMatches++;
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