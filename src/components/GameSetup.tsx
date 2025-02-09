'use client';

interface GameSetupProps {
  isPracticeMode: boolean;
  userSecret: string;
  onUserSecretChange: (secret: string) => void;
  onStartGame: () => void;
  isLoading: boolean;
  isValidSecret: (secret: string) => boolean;
}

export default function GameSetup({ 
  isPracticeMode, 
  userSecret, 
  onUserSecretChange, 
  onStartGame, 
  isLoading,
  isValidSecret 
}: GameSetupProps) {
  return (
    <div className="game-card w-full max-w-md mx-auto p-8 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-blue-100 mb-4">
        {isPracticeMode ? 'Ready to Play?' : 'Start New Game'}
      </h2>
      <div className="space-y-4">
        {!isPracticeMode ? (
          <div>
            <label htmlFor="secret" className="block text-sm font-medium text-blue-200 mb-1">
              Your Secret Number
            </label>
            <input
              id="secret"
              type="text"
              value={userSecret}
              onChange={(e) => onUserSecretChange(e.target.value)}
              maxLength={4}
              placeholder="Enter your secret 4-digit number"
              className="w-full p-3 border-2 border-blue-500/30 rounded-lg bg-blue-950/30 text-white placeholder-blue-300/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none"
            />
          </div>
        ) : (
          <p className="text-blue-200 text-center">
            Try to guess the computer&apos;s 4-digit number. All digits are different!
          </p>
        )}
        <button
          onClick={onStartGame}
          disabled={isLoading || (!isPracticeMode && !isValidSecret(userSecret))}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            isPracticeMode ? 'Start Practice' : 'Start New Game'
          )}
        </button>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Starting Game...
    </span>
  );
} 