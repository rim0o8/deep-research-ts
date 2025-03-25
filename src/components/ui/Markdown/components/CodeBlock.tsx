"use client";

import { useTheme } from 'next-themes';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  language: string;
  codeContent: string;
}

export function CodeBlock({ language, codeContent }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="overflow-y-hidden rounded-lg">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-xs text-white">
        <span className="font-mono font-medium">{language.toUpperCase()}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(codeContent);
          }}
          className="text-white/80 hover:text-white transition-colors duration-200"
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        style={isDark ? vscDarkPlus : vs}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1rem',
          backgroundColor: isDark ? '#1a1b26' : '#f8f9fc',
          fontSize: '0.9rem',
          fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
          lineHeight: 1.5,
        }}
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );
} 