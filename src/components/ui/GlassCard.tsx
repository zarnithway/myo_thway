import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  interactive = false,
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`glass-panel rounded-2xl ${
        interactive ? 'glass-panel-interactive' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
