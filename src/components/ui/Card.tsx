import React from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'glass-surface-strong',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-mixed hover:border-white/[0.15]',
        className
      )}
    >
      {children}
    </div>
  );
}
