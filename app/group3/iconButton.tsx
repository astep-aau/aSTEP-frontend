"use client";

import type { ReactNode, MouseEvent } from 'react';

interface IconButtonProps {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export function IconButton({ label, children, className = '', onClick, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex items-center justify-center p-1 rounded-full cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}


