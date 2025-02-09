'use client';

interface GameLayoutProps {
  children: React.ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  return (
    <main className="min-h-screen animated-background p-8">
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          Numbers Game
        </h1>
        <p className="text-center text-blue-200 mb-4">
          Each player chooses a secret 4-digit number (all digits must be different).
          Take turns guessing each other&apos;s number. After each guess, you&apos;ll learn:
        </p>
        <div className="text-center text-blue-200 mb-8 space-y-1">
          <p>• How many digits are in the correct position (Exact matches)</p>
          <p>• How many digits exist in the number but in wrong positions (Partial matches)</p>
        </div>
        {children}
      </div>
    </main>
  );
} 