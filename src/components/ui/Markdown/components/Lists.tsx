"use client";

import { ReactNode } from 'react';

interface ListProps {
  children: ReactNode;
}

export function UnorderedList({ children }: ListProps) {
  return <ul className="list-disc pl-6 my-4">{children}</ul>;
}

export function OrderedList({ children }: ListProps) {
  return <ol className="list-decimal pl-6 my-4">{children}</ol>;
} 