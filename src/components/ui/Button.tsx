import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent-cyan' | 'accent-pink' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isAnimated?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    icon,
    iconPosition = 'left',
    isAnimated = true,
    className,
    ...props 
  }, ref) => {
    const baseClasses = 'btn focus-ring';
    const variantClasses = `btn-${variant}`;
    const sizeClasses = `btn-${size}`;
    
    const classes = cn(baseClasses, variantClasses, sizeClasses, className);

    const content = (
      <>
        {icon && iconPosition === 'left' && (
          <span className={isLoading ? 'animate-spin' : ''}>{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className={isLoading ? 'animate-spin' : ''}>{icon}</span>
        )}
      </>
    );

    if (isAnimated) {
      return (
        <motion.button
          ref={ref}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={classes}
          disabled={isLoading || props.disabled}
          {...(props as HTMLMotionProps<'button'>)}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
