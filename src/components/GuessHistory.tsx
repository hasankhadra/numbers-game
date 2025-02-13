interface BaseGuess {
  id: string;
  number: string;
  exact_matches: number;
  partial_matches: number;
  player: string;
}

interface GuessHistoryProps {
  guesses: BaseGuess[];
  title: string;
  description: string;
  type?: 'multiplayer' | 'ai';
  isOpponentHistory?: boolean;
}

export default function GuessHistory({ guesses, title, description, type = 'ai', isOpponentHistory = false }: GuessHistoryProps) {
  
  return (
    <div className="game-card w-full p-6 rounded-xl">
      <div className={`flex items-center justify-between mb-2 border-b pb-1 ${
        isOpponentHistory ? 'border-purple-800' : 'border-blue-800'
      }`}>
        <h2 className={`text-xl font-bold ${
          isOpponentHistory ? 'text-purple-300' : 'text-blue-300'
        }`}>{title}</h2>
        <span className={`text-sm px-2 py-0.5 rounded-full ${
          isOpponentHistory 
            ? 'bg-purple-900/40 text-purple-200'
            : 'bg-blue-900/40 text-blue-200'
        }`}>
          {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{description}</p>
      <div className="space-y-1.5">
        {[...guesses].reverse().map((guess, index) => (
          <div
            key={guess.id}
            className={`p-2 rounded-lg transition-all hover:shadow-md ${
              type === 'multiplayer' 
                ? 'bg-blue-900 bg-opacity-40 border-l-4 border-blue-500'
                : guess.player === 'user'
                  ? 'bg-blue-900 bg-opacity-40 border-l-4 border-blue-500' 
                  : 'bg-purple-900 bg-opacity-40 border-l-4 border-purple-500'
            }`}
            style={{
              animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {guess.number.split('').map((digit, i) => (
                  <span 
                    key={i} 
                    className="text-base font-mono bg-opacity-20 bg-white w-7 h-7 flex items-center justify-center rounded shadow-inner text-white animate-reveal"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <div className="flex space-x-3 text-sm">
                <div className="flex items-center">
                  <span className="text-emerald-400 font-medium">{guess.exact_matches}</span>
                  <span className="ml-1 text-xs text-gray-400">exact</span>
                </div>
                <div className="flex items-center">
                  <span className="text-amber-400 font-medium">{guess.partial_matches}</span>
                  <span className="ml-1 text-xs text-gray-400">partial</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {guesses.length === 0 && (
          <div className="text-center text-gray-500 py-4 animate-pulse">
            No guesses yet
          </div>
        )}
      </div>
    </div>
  );
} 