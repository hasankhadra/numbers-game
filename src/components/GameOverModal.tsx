'use client';


interface GameOverModalProps {
  winner: 'user' | 'ai';
  onNewGame: () => void;
  aiSecret?: string;  // Add this to show AI's number when user loses
}

export default function GameOverModal({ winner, onNewGame, aiSecret }: GameOverModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        <div className="text-center">
          {winner === 'user' ? (
            <div className="mb-6 scale-in-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-emerald-900/30 rounded-full flex items-center justify-center">
                <div className="animate-victory-bounce">
                  <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">Victory!</h2>
              <p className="text-emerald-200/80">You&apos;ve cracked the code!</p>
            </div>
          ) : (
            <div className="mb-6 scale-in-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-purple-900/30 rounded-full flex items-center justify-center">
                <div className="animate-defeat-pulse">
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">Game Over</h2>
              <p className="text-purple-200/80">The AI has won this round!</p>
              {aiSecret && (
                <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-200/60 mb-2">The AI&apos;s number was:</p>
                  <div className="flex justify-center gap-2">
                    {aiSecret.split('').map((digit, i) => (
                      <span
                        key={i}
                        className="w-10 h-10 bg-purple-900/40 rounded flex items-center justify-center text-purple-200 font-mono text-lg animate-reveal"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={onNewGame}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg mt-4"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
} 