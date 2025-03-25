"use client";

import { ReactNode } from 'react';

interface BlockquoteProps {
  children: ReactNode;
}

export function Blockquote({ children }: BlockquoteProps) {
  return (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-4 italic text-gray-700 dark:text-gray-300">
      {children}
    </blockquote>
  );
} 