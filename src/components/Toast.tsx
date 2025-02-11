'use client';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 animate-slide-up">
      <div className="bg-emerald-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          ×
        </button>
      </div>
    </div>
  );
} 