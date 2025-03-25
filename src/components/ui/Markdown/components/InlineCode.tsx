"use client";

import { ReactNode } from 'react';

interface InlineCodeProps {
  children: ReactNode;
  [key: string]: any;
}

export function InlineCode({ children, ...props }: InlineCodeProps) {
  return <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>;
} 