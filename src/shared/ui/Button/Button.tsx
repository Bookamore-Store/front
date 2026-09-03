import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  className?: string;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'disabled' | 'onClick'
>;

export const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  className,
  type = 'button',
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'w-full max-w-[342px] px-4 py-2.5 rounded-lg text-base font-medium transition-colors',
        {
          'bg-deep-blue text-white': variant === 'primary',
          'hover:bg-deep-blue-950 active:bg-deep-blue-950':
            variant === 'primary' && !isDisabled,

          'border border-deep-blue text-text-black bg-white':
            variant === 'secondary',
          'hover:bg-[#DDF3FF] active:bg-[#DDF3FF] hover:text-deep-blue':
            variant === 'secondary' && !isDisabled,

          'cursor-pointer': !isDisabled,
          'opacity-50 cursor-default': isDisabled,
        },
        className
      )}
    >
      {children}
    </button>
  );
};
