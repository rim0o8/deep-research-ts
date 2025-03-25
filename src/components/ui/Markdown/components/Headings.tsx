"use client";

import type { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
}

export function H1({ children }: HeadingProps) {
  return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>;
}

export function H2({ children }: HeadingProps) {
  return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
}

export function H3({ children }: HeadingProps) {
  return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
} 