'use client';

import { useState } from 'react';
import NumberInput from './NumberInput';

interface GameBoardProps {
  onMakeGuess: (guess: string) => void;
  isUserTurn: boolean;
  gameStatus: 'active' | 'completed';
  winner?: 'user' | 'ai' | null;
  aiSecret?: string;
  onNewGame?: () => void;
  userSecret: string;
}

export default function GameBoard({ 
  onMakeGuess, 
  isUserTurn, 
  gameStatus, 
  winner, 
  aiSecret,
  onNewGame,
  userSecret
}: GameBoardProps) {
  const [error, setError] = useState('');

  const handleComplete = (guess: string) => {
    if (!isUserTurn || gameStatus === 'completed') return;
    setError('');
    onMakeGuess(guess);
  };

  return (
    <div className={`game-card w-full  mx-auto p-6 rounded-xl shadow-lg ${!isUserTurn ? 'disabled' : ''}`}>
      {gameStatus === 'completed' && winner ? (
        <div className={`rounded-lg p-4 ${
          winner === 'user' 
            ? 'bg-emerald-900/30 border border-emerald-500/20' 
            : 'bg-purple-900/30 border border-purple-500/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {winner === 'user' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center">
                    <div className="animate-victory-bounce">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-400">Victory!</h3>
                    <p className="text-emerald-200/80">You've cracked the code!</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                    <div className="animate-defeat-pulse">
                      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-400">Game Over</h3>
                    <p className="text-purple-200/80">The AI has won!</p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onNewGame}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-all hover:scale-[1.02] ${
                winner === 'user'
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
              }`}
            >
              Play Again
            </button>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-900/20 border border-blue-500/10">
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-300">Your Number:</span>
              <div className="flex gap-1">
                {userSecret.split('').map((digit, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 flex items-center justify-center text-base font-mono font-medium bg-blue-900/30 rounded text-blue-200"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
            {winner === 'ai' && aiSecret && (
              <div className="flex items-center ml-auto gap-2">
                <span className="text-sm text-purple-300">AI's Number:</span>
                <div className="flex gap-1">
                  {aiSecret.split('').map((digit, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 bg-purple-900/40 rounded flex items-center justify-center text-purple-200 font-mono text-base animate-reveal"
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
      ) : (
        <>
          <div className="mb-6">
            <div 
              className={`text-center p-3 rounded-lg mb-2 transition-all duration-300 ${
                isUserTurn 
                  ? 'bg-emerald-500 bg-opacity-20 text-emerald-300 animate-glow'
                  : 'bg-amber-500 bg-opacity-20 text-amber-300'
              }`}
            >
              {isUserTurn ? (
                <span className="flex items-center justify-center space-x-2">
                  <span>Your Turn</span>
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Opponent is thinking...</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-2 p-2 rounded-lg bg-blue-900/20 border border-blue-500/10">
              <span className="text-sm text-blue-300">Your Number:</span>
              <div className="flex gap-1">
                {userSecret.split('').map((digit, i) => (
                  <span
                    key={i}
                    className="w-6 h-6 flex items-center justify-center text-sm font-mono font-medium bg-blue-900/30 rounded text-blue-200"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <NumberInput 
              onComplete={handleComplete}
              disabled={!isUserTurn || gameStatus === 'completed'}
              showSubmit={true}
            />
            {error && (
              <p className="text-red-400 text-sm mt-2 flex items-center justify-center animate-fadeIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
} 