import { NextResponse } from 'next/server';
import { OpenAIResponse, GuessHistory } from '@/types/openai';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

function validateGuessAgainstHistory(guess: string, previousGuesses: any[]) {
  for (const prevGuess of previousGuesses) {
    let exactMatches = 0;
    let partialMatches = 0;
    
    // Count exact matches
    for (let i = 0; i < 4; i++) {
      if (guess[i] === prevGuess.number[i]) {
        exactMatches++;
      }
    }
    
    // Count partial matches
    const guessDigits = guess.split('');
    const prevDigits = prevGuess.number.split('');
    for (const digit of guessDigits) {
      if (prevDigits.includes(digit)) {
        if (guess.indexOf(digit) !== prevGuess.number.indexOf(digit)) {
          partialMatches++;
        }
      }
    }

    if (exactMatches !== prevGuess.exact_matches || partialMatches !== prevGuess.partial_matches) {
      return {
        isValid: false,
        reason: `Your guess ${guess} contradicts the feedback from previous guess ${prevGuess.number} which had ${prevGuess.exact_matches} exact and ${prevGuess.partial_matches} partial matches. Your guess would have ${exactMatches} exact and ${partialMatches} partial matches instead.`
      };
    }
  }
  
  return { isValid: true };
}

export async function POST(request: Request) {
  const body = await request.json();
  const previousGuesses: GuessHistory[] = body.previousGuesses;

  const systemPrompt = `
  You are playing a number guessing game. Generate a 4-digit number guess where all digits are different.
  Previous guesses and their feedback are provided as: number, exact matches (correct digit in correct position), and partial matches (correct digit in wrong position).
  You must generate a guess that is different from the previous guesses.

  Rules to follow:
  - The guess must be a 4-digit number where all digits are different.
  - The guess must be different from any previous guesses.
  - The guess must be a number between 0000 and 9999.
  - Only respond with the guess, no other text.
  - Don't guess a number that contradicts the previous guesses results. In other words, always take a guess that gives the maxmimum number of information.
  - You need to guess the number in the least number of guesses.
  `;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: JSON.stringify(previousGuesses)
        }
      ],
    }),
  });

  const data: OpenAIResponse = await response.json();
  const aiGuess = data.choices[0].message.content.trim();

  // Validate the guess against previous history
  const validation = validateGuessAgainstHistory(aiGuess, previousGuesses);
  if (!validation.isValid) {
    // Ask AI to try again with explanation
    const retryResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: JSON.stringify(previousGuesses)
          },
          {
            role: 'assistant',
            content: aiGuess
          },
          {
            role: 'user',
            content: `${validation.reason} Please make a different guess that doesn't contradict the previous feedback.`
          }
        ],
      }),
    });

    return NextResponse.json(await retryResponse.json());
  }

  return NextResponse.json(data);
} 