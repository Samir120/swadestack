import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`${className || ''} pr-10`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors cursor-pointer" />
          ) : (
            <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors cursor-pointer" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
