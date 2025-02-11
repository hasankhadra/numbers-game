'use client';

interface GameStatusProps {
  winner: 'user' | 'ai';
  onNewGame: () => void;
  aiSecret?: string;
}

export default function GameStatus({ winner, onNewGame, aiSecret }: GameStatusProps) {
  return (
    <div className="game-card w-full max-w-md mx-auto p-6 rounded-xl mb-8">
      <div className={`rounded-lg p-4 ${
        winner === 'user' 
          ? 'bg-emerald-900/30 border border-emerald-500/20' 
          : 'bg-purple-900/30 border border-purple-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {winner === 'user' ? (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center">
                  <div className="animate-victory-bounce">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-400">Victory!</h3>
                  <p className="text-sm text-emerald-200/80">You&apos;ve cracked the code!</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <div className="animate-defeat-pulse">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-purple-400">Game Over</h3>
                  <p className="text-sm text-purple-200/80">The AI has won this round!</p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onNewGame}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] ${
              winner === 'user'
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
            }`}
          >
            Play Again
          </button>
        </div>
        {winner === 'ai' && aiSecret && (
          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <p className="text-sm text-purple-200/60 mb-2">The AI&apos;s number was:</p>
            <div className="flex gap-2">
              {aiSecret.split('').map((digit, i) => (
                <span
                  key={i}
                  className="w-8 h-8 bg-purple-900/40 rounded flex items-center justify-center text-purple-200 font-mono text-lg animate-reveal"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 