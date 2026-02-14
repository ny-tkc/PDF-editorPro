import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
  tooltip?: string;
}

export function IconButton({ children, active, tooltip, className = '', ...props }: IconButtonProps) {
  return (
    <button
      title={tooltip}
      className={`
        relative flex items-center justify-center w-9 h-9 rounded-lg
        transition-colors duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${active
          ? 'bg-blue-500 text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
