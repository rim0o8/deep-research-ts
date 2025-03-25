import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Download, FileText, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';

interface ResearchReportProps {
  report: string;
  handleNewSearch: () => void;
}

export function ResearchReport({ report, handleNewSearch }: ResearchReportProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-report-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  };

  const copyReportToClipboard = () => {
    if (!reportContentRef.current) return;
    navigator.clipboard.writeText(report).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
    setIsMenuOpen(false);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  // カスタムMarkdownコンポーネント - シンプル化して型エラーを回避
  const MarkdownComponents: Components = {
    // 画像の表示
    img: ({ node, ...props }) => (
      <img
        {...props}
        alt={props.alt || 'レポートの画像'}
        className="max-w-full rounded-md border border-muted shadow-sm hover:shadow-md transition-shadow"
        loading="lazy"
      />
    ),
    // リンクをスタイリング
    a: ({ node, ...props }) => (
      <a
        {...props}
        className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/50 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
    // 見出しをスタイリング
    h1: ({ node, ...props }) => <h1 {...props} className="text-xl font-bold my-4 pb-2 border-b" />,
    h2: ({ node, ...props }) => <h2 {...props} className="text-lg font-bold my-3 pb-1" />,
    // リストをスタイリング
    ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-3 space-y-1" />,
  };

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'mb-4 shadow-md overflow-hidden border dark:border-border relative transition-all duration-300',
          isExpanded ? 'max-w-5xl mx-auto' : ''
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-card sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2">
            <motion.div
              className="flex h-8 w-8 rounded-full bg-primary items-center justify-center shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FileText className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <CardTitle>調査結果</CardTitle>
          </div>

          <div className="flex items-center space-x-1">
            <motion.button
              type="button"
              className="p-1.5 rounded-full hover:bg-muted/80 focus:outline-none transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="レポートオプション"
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          </div>
        </CardHeader>

        <CardContent
          ref={reportContentRef}
          className={cn(
            'prose prose-sm md:prose-base dark:prose-invert max-w-none pt-4',
            'bg-card text-card-foreground rounded-b-lg',
            isExpanded ? 'max-h-[80vh] overflow-y-auto px-6' : ''
          )}
          onClick={handleOutsideClick}
        >
          <ReactMarkdown components={MarkdownComponents}>{report}</ReactMarkdown>
        </CardContent>

        {/* メニュー */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              className="absolute top-16 right-4 bg-popover text-popover-foreground shadow-lg rounded-lg overflow-hidden z-10 border"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 w-full text-left text-sm hover:bg-muted transition-colors"
                onClick={copyReportToClipboard}
              >
                <Copy className="h-4 w-4" />
                <span>{isCopied ? 'コピーしました' : 'レポートをコピー'}</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 w-full text-left text-sm hover:bg-muted transition-colors"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                <span>レポートをダウンロード</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 w-full text-left text-sm hover:bg-muted transition-colors"
                onClick={handleNewSearch}
              >
                <RefreshCw className="h-4 w-4" />
                <span>新しい調査</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
