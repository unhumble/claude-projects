import React from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'red' | 'orange' | 'green' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-bg-tertiary text-text-muted border border-border',
    red:     'bg-brand-red/10 text-brand-red border border-brand-red/20',
    orange:  'bg-brand-orange/10 text-brand-orange border border-brand-orange/20',
    green:   'bg-green-500/10 text-green-400 border border-green-500/20',
    muted:   'bg-bg-secondary text-text-faint border border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const TAG_VARIANTS: Record<string, BadgeProps['variant']> = {
  'vegetarisch': 'green',
  'vegan':       'green',
  'scharf':      'red',
  'neu':         'orange',
  'beliebt':     'orange',
  'premium':     'red',
};

export function MenuTag({ tag }: { tag: string }) {
  const variant = TAG_VARIANTS[tag] ?? 'default';
  return <Badge variant={variant}>{tag}</Badge>;
}
