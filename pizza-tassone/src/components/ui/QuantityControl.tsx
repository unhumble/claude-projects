'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: QuantityControlProps) {
  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const numSize = size === 'sm' ? 'text-sm w-8' : 'text-base w-10';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center rounded-full bg-bg-tertiary border border-border text-text-warm hover:bg-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
          btnSize
        )}
        aria-label="Weniger"
      >
        <Minus size={size === 'sm' ? 12 : 14} />
      </button>

      <span className={cn('text-center font-bold text-text-warm tabular-nums', numSize)}>
        {value}
      </span>

      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          'flex items-center justify-center rounded-full bg-brand-red hover:bg-brand-red-dark text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
          btnSize
        )}
        aria-label="Mehr"
      >
        <Plus size={size === 'sm' ? 12 : 14} />
      </button>
    </div>
  );
}
