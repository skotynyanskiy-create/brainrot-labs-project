import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isAnimated?: boolean;
  isHoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className,
    isAnimated = false,
    isHoverable = true,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'brutalist-card';
    const classes = cn(baseClasses, className);

    if (isAnimated) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={isHoverable ? { y: -4 } : {}}
          className={classes}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
