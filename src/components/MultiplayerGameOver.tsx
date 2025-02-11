'use client';

import { MultiplayerGame } from "@/types/multiplayer";

interface Winner {
  playerId: string | undefined;  // Allow undefined
  name?: string | null;  // Allow null
}

interface MultiplayerGameOverProps {
  winner: Winner;
  myPlayerId: string;
  playerSecrets: {
    player1Secret: string;
    player2Secret: string;
    player1Name?: string | null;
    player2Name?: string | null;
  };
  game: MultiplayerGame;
  onNewGame: () => void;
}

export function MultiplayerGameOver({ winner, myPlayerId, playerSecrets, game, onNewGame }: MultiplayerGameOverProps) {
  const didIWin = winner.playerId === myPlayerId;
  const { player1Secret, player2Secret, player1Name, player2Name } = playerSecrets;
  
  const mySecret = myPlayerId === game.player1_id ? player1Secret : player2Secret;
  const opponentSecret = myPlayerId === game.player1_id ? player2Secret : player1Secret;
  const opponentName = myPlayerId === game.player1_id ? player2Name : player1Name;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="mb-6 scale-in-center">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center
              ${didIWin ? 'bg-emerald-900/30' : 'bg-purple-900/30'}`}
            >
              <div className="animate-victory-bounce">
                {didIWin ? (
                  <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${didIWin ? 'text-emerald-400' : 'text-purple-400'}`}>
              {didIWin ? 'You Won!' : 'Game Over'}
            </h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Your Number</p>
              <div className="flex gap-2 justify-center">
                {mySecret.split('').map((digit, i) => (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded flex items-center justify-center text-lg font-mono animate-reveal
                      ${didIWin ? 'bg-emerald-900/40 text-emerald-200' : 'bg-purple-900/40 text-purple-200'}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">
                {opponentName || 'Opponent'}&apos;s Number
              </p>
              <div className="flex gap-2 justify-center">
                {opponentSecret.split('').map((digit, i) => (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded flex items-center justify-center text-lg font-mono animate-reveal
                      ${didIWin ? 'bg-purple-900/40 text-purple-200' : 'bg-emerald-900/40 text-emerald-200'}`}
                    style={{ animationDelay: `${i * 0.1 + 0.4}s` }}
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onNewGame}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
} 