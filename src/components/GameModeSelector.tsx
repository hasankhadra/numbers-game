'use client';

type GameMode = 'ai' | 'computer' | 'practice' | 'multiplayer';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

export default function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  return (
    <div className="game-card w-full max-w-md mx-auto p-8 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-blue-100 mb-4">
        Choose Your Mode
      </h2>
      <div className="space-y-4">
        <button
          onClick={() => onSelectMode('computer')}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
        >
          Play Against Computer
          <p className="text-sm opacity-80 mt-1">Systematic opponent that tries all possibilities</p>
        </button>
        <button
          onClick={() => onSelectMode('practice')}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
        >
          Practice Mode
          <p className="text-sm opacity-80 mt-1">Play solo and try to guess the computer&apos;s number</p>
        </button>
        <button
          onClick={() => onSelectMode('ai')}
          className="relative w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
        >
          <div className="absolute -top-3 right-3 bg-orange-500 text-xs px-2 py-1 rounded-full animate-pulse">
            Experimental
          </div>
          Play Against AI
          <p className="text-sm opacity-80 mt-1">Strategic opponent that learns from feedback</p>
        </button>
        <button
          onClick={() => onSelectMode('multiplayer')}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
        >
          Play Against Friends
          <p className="text-sm opacity-80 mt-1">Challenge your friends in real-time matches</p>
        </button>
      </div>
    </div>
  );
} 