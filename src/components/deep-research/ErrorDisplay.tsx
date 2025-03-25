import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  handleNewSearch: () => void;
}

export function ErrorDisplay({ error, handleNewSearch }: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto mt-6 border-red-200 bg-red-50/70 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-700">エラーが発生しました</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white/50 p-3 rounded-md border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button
            onClick={handleNewSearch}
            variant="outline"
            className="gap-2 hover:bg-red-100 border-red-200 text-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            新しい調査を開始
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
