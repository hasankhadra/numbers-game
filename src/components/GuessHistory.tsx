interface Guess {
  id: string;
  number: string;
  exact_matches: number;
  partial_matches: number;
  player: 'user' | 'ai';
}

interface GuessHistoryProps {
  guesses: Guess[];
  title: string;
  description: string;
}

export default function GuessHistory({ guesses, title, description }: GuessHistoryProps) {
  return (
    <div className="game-card w-full p-6 rounded-xl">
      <div className="flex items-center justify-between mb-2 border-b border-blue-800 pb-2">
        <h2 className="text-xl font-bold text-blue-300">{title}</h2>
        <span className="text-sm px-2 py-1 bg-blue-900/40 rounded-full text-blue-200">
          {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <div className="space-y-3">
        {[...guesses].reverse().map((guess, index) => (
          <div
            key={guess.id}
            className={`p-4 rounded-lg transition-all hover:shadow-md transform hover:-translate-y-1 ${
              guess.player === 'user' 
                ? 'bg-blue-900 bg-opacity-40 border-l-4 border-blue-500' 
                : 'bg-purple-900 bg-opacity-40 border-l-4 border-purple-500'
            }`}
            style={{
              animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {guess.number.split('').map((digit, i) => (
                    <span 
                      key={i} 
                      className="text-lg font-mono bg-opacity-20 bg-white w-8 h-8 flex items-center justify-center rounded shadow-inner text-white animate-reveal"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <span className="text-emerald-400 font-medium">{guess.exact_matches}</span>
                  <span className="ml-1 text-sm text-gray-400">exact</span>
                </div>
                <div className="flex items-center">
                  <span className="text-amber-400 font-medium">{guess.partial_matches}</span>
                  <span className="ml-1 text-sm text-gray-400">partial</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {guesses.length === 0 && (
          <div className="text-center text-gray-500 py-8 animate-pulse">
            No guesses yet
          </div>
        )}
      </div>
    </div>
  );
} 