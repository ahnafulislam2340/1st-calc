
import React from 'react';
import { Theme } from '../types';

interface CalcButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'action' | 'special' | 'sci';
  theme?: Theme;
  className?: string;
  span?: number;
}

const CalcButton: React.FC<CalcButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'number', 
  theme = 'dark',
  className = '',
  span = 1
}) => {
  const isDark = theme === 'dark';

  const getVariantStyles = () => {
    switch (variant) {
      case 'operator':
        return 'bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20';
      case 'action':
        return isDark 
          ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700' 
          : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300';
      case 'special':
        return 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20';
      case 'sci':
        return isDark
          ? 'bg-zinc-900 text-indigo-400 hover:bg-zinc-800 hover:text-indigo-300 border border-zinc-800'
          : 'bg-zinc-50 text-indigo-600 hover:bg-zinc-100 border border-zinc-200 shadow-sm';
      default: // 'number'
        return isDark 
          ? 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800' 
          : 'bg-white text-zinc-900 hover:bg-zinc-50 shadow-sm border border-zinc-100';
    }
  };

  return (
    <button
      onClick={onClick}
      style={{ gridColumn: `span ${span}` }}
      className={`
        calc-btn theme-transition
        h-14 sm:h-16 w-full rounded-2xl text-lg sm:text-xl font-medium transition-transform duration-150
        flex items-center justify-center select-none overflow-hidden
        ${getVariantStyles()}
        ${className}
      `}
    >
      <span className={variant === 'sci' ? 'scientific-label' : ''}>
        {label}
      </span>
    </button>
  );
};

export default CalcButton;
