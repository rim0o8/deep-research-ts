"use client";

import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="border-collapse w-full">{children}</table>
    </div>
  );
} 