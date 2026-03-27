import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    label,
    error,
    success,
    helperText,
    ...props 
  }, ref) => {
    const baseClasses = 'input-base';
    const errorClass = error ? 'error' : '';
    const successClass = success && !error ? 'success' : '';
    
    const inputClasses = cn(baseClasses, errorClass, successClass, className);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold uppercase mb-2 text-black">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`${inputClasses} focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2`}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-xs font-bold uppercase mt-1">
            ❌ {error}
          </p>
        )}
        {success && !error && (
          <p className="text-green-500 text-xs font-bold uppercase mt-1">
            ✓ {helperText}
          </p>
        )}
        {helperText && !error && !success && (
          <p className="text-gray-600 text-xs font-mono mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
