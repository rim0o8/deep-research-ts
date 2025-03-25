"use client";

import { ReactNode } from 'react';

interface LinkProps {
  href?: string;
  children: ReactNode;
}

export function Link({ href, children }: LinkProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {children}
    </a>
  );
} 