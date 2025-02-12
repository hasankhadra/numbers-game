'use client';

import { useRef, useState } from 'react';

interface NumberInputProps {
  onComplete: (value: string) => void;
  disabled?: boolean;
  showSubmit?: boolean;
}

export default function NumberInput({ onComplete, disabled = false, showSubmit = false }: NumberInputProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), 
                     useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleSubmit = () => {
    const fullNumber = digits.join('');
    if (fullNumber.length === 4 && new Set(fullNumber).size === 4) {
      onComplete(fullNumber);
      setDigits(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (!showSubmit && newDigits.every(d => d !== '')) {
      const fullNumber = newDigits.join('');
      const uniqueDigits = new Set(fullNumber).size;
      if (uniqueDigits === 4) {
        onComplete(fullNumber);
        setDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d{4}$/.test(pastedData)) return;
    
    const uniqueDigits = new Set(pastedData).size;
    if (uniqueDigits === 4) {
      const newDigits = pastedData.split('');
      setDigits(newDigits);
      onComplete(pastedData);
      setDigits(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 justify-center">
        {digits.map((digit, index) => (
          <div key={index} className="relative">
            <input
              ref={inputRefs[index]}
              type="text"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-14 h-14 text-center text-2xl font-mono border-2 rounded-lg 
                ${disabled 
                  ? 'bg-gray-900/50 border-gray-700 text-gray-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-gray-900'
                } 
                transition-all duration-200 outline-none`}
              maxLength={1}
            />
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 transform scale-x-0 
              transition-transform duration-300 ${digit ? 'scale-x-100' : ''}`} />
          </div>
        ))}
      </div>
      {showSubmit && (
        <button
          onClick={handleSubmit}
          disabled={disabled || digits.some(d => d === '') || new Set(digits).size !== 4}
          className={`w-full p-3 rounded-lg text-white font-medium text-lg transition-all transform hover:scale-[1.02] 
            ${disabled || digits.some(d => d === '') || new Set(digits).size !== 4
              ? 'bg-gray-900/50 border border-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg'
            }`}
        >
          Make Guess
        </button>
      )}
    </div>
  );
} 