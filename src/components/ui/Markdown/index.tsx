"use client";

import { tw } from '@/lib/tailwindcss';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// 言語のサポートを追加
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import mermaid from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/cjs/languages/prism/markup';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {
  Blockquote,
  CodeBlock,
  H1,
  H2,
  H3,
  InlineCode,
  Link,
  MermaidDiagram,
  OrderedList,
  Table,
  UnorderedList
} from './components';

// 言語を登録
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('mermaid', mermaid);

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [mermaidSvg, setMermaidSvg] = useState<Record<string, string>>({});

  // 空のコンテンツの場合は何も表示しない
  if (!content || content.trim() === '') {
    return null;
  }

  // Mermaidダイアグラムをレンダリング
  useEffect(() => {
    const renderMermaid = async () => {
      if (typeof window !== 'undefined') {
        try {
          const mermaidModule = await import('mermaid');
          const { default: mermaid } = mermaidModule;

          mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'sans-serif',
            flowchart: {
              curve: 'basis',
              htmlLabels: true,
            },
            themeVariables: {
              primaryColor: isDark ? '#3b82f6' : '#60a5fa',
              primaryTextColor: isDark ? '#f3f4f6' : '#1f2937',
              primaryBorderColor: isDark ? '#4b5563' : '#d1d5db',
              lineColor: isDark ? '#6b7280' : '#9ca3af',
              secondaryColor: isDark ? '#4b5563' : '#e5e7eb',
              tertiaryColor: isDark ? '#1f2937' : '#f9fafb',
            }
          });

          // コンテンツからMermaidコードブロックを抽出
          const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
          let match: RegExpExecArray | null;
          const newMermaidSvg: Record<string, string> = {};
          
          match = mermaidRegex.exec(content);
          while (match !== null) {
            const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
            const code = match[1].trim();
            
            try {
              const { svg } = await mermaid.render(id, code);
              newMermaidSvg[code] = svg;
            } catch (error) {
              console.error('Mermaid rendering error:', error);
              newMermaidSvg[code] = `<div class="text-red-500 p-4 border border-red-300 rounded">Mermaid diagram rendering error</div>`;
            }
            
            match = mermaidRegex.exec(content);
          }
          
          setMermaidSvg(newMermaidSvg);
        } catch (error) {
          console.error('Failed to load mermaid:', error);
        }
      }
    };

    renderMermaid();
  }, [content, isDark]);

  return (
    <div className={tw("prose dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, {singleDollarTextMath: false}]]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        disallowedElements={['script', 'iframe']}
        components={{
          code({ className, children, ...props }) {
            // インラインコードの場合はそのまま返す
            if (!className) {
              return <InlineCode {...props}>{children}</InlineCode>;
            }

            // language-xxxx から言語を抽出
            const match = /language-(\w+)/.exec(className);
            const language = match ? match[1] : '';
            const codeContent = useMemo(() => String(children).replace(/\n$/, ''), [children]);

            // Mermaidダイアグラムの場合
            if (language === 'mermaid' && mermaidSvg[codeContent]) {
              return <MermaidDiagram svg={mermaidSvg[codeContent]} />;
            }

            return <CodeBlock language={language} codeContent={codeContent} />;
          },
          // テーブルのスタイルを改善
          table({ children }) {
            return <Table>{children}</Table>;
          },
          // リンクを新しいタブで開く
          a({ href, children }) {
            return <Link href={href}>{children}</Link>;
          },
          // 見出しのスタイルを改善
          h1({ children }) {
            return <H1>{children}</H1>;
          },
          h2({ children }) {
            return <H2>{children}</H2>;
          },
          h3({ children }) {
            return <H3>{children}</H3>;
          },
          // リストのスタイルを改善
          ul({ children }) {
            return <UnorderedList>{children}</UnorderedList>;
          },
          ol({ children }) {
            return <OrderedList>{children}</OrderedList>;
          },
          // 引用のスタイルを改善
          blockquote({ children }) {
            return <Blockquote>{children}</Blockquote>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 