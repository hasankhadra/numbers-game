import { NextResponse } from 'next/server';

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
  try {
    const { previousGuesses } = await request.json();

    const systemPrompt = `You are playing a number guessing game. The rules are:
1. Each player has a secret 4-digit number where all digits are unique (0-9)
2. Players take turns guessing each other's number
3. After each guess, the player learns:
   - How many digits are in the correct position (exact matches)
   - How many digits exist in the number but in wrong positions (partial matches)
4. Use the feedback from previous guesses to make intelligent guesses
5. Respond ONLY with a valid 4-digit number as your guess

Your previous guesses and their results:
${previousGuesses
  .map((g: any) => `Your guess ${g.number}: ${g.exact_matches} exact, ${g.partial_matches} partial`)
  .join('\n')}

Based on this feedback, make an intelligent guess. Remember very well the following and stick to them:
- All digits must be unique
- Only respond with a 4-digit number. It can't be a one digit number, and you can't have repeated digits.
- Use the feedback from previous guesses to narrow down possibilities
- You need to guess the number in the minimum number of guesses to win
- Your main goal is to win the game
- You can't guess the same number twice
- Don't guess a number that contradicts the feedback you got from the previous guesses
- Make guesses that gives you the most information

The most important thing, only respond with a 4-digit number.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: 'What is your next guess?'
          }
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    const aiGuess = data.choices[0].message.content.trim();

    // Validate the guess against previous history
    const validation = validateGuessAgainstHistory(aiGuess, previousGuesses);
    if (!validation.isValid) {
      // Ask AI to try again with explanation
      const retryResponse = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: 'What is your next guess?'
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
          temperature: 0.7,
        })
      });

      return NextResponse.json(await retryResponse.json());
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
} 