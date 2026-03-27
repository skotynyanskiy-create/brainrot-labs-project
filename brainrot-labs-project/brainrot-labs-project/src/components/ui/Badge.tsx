import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'info' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'secondary', 
  size = 'md',
  className,
  children,
  ...props 
}) => {
  const baseClasses = 'badge';
  const variantClasses = `badge-${variant}`;
  
  const sizeClass = {
    'sm': 'px-2 py-0.5 text-[10px]',
    'md': 'px-2 py-1 text-xs',
    'lg': 'px-3 py-1.5 text-sm'
  }[size];

  const classes = cn(baseClasses, variantClasses, sizeClass, className);

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Badge.displayName = 'Badge';
