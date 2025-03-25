import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  progressSteps: string[];
  progressPercent?: number;
}

export function ProgressIndicator({ progressSteps, progressPercent = 0 }: ProgressIndicatorProps) {
  // アニメーション用の状態
  const [displayValue, setDisplayValue] = useState(0);

  // progressPercentが変更されたら、アニメーションで表示を更新
  useEffect(() => {
    // 実際の進捗値が設定されている場合はそれを使用
    // 設定されていない場合はステップ数に基づいて計算
    const targetValue =
      progressPercent > 0 ? progressPercent : Math.min(progressSteps.length * 20, 95);

    // 徐々に値を更新するアニメーション
    const animateProgress = () => {
      setDisplayValue((prev) => {
        // 目標値に近づける
        if (Math.abs(prev - targetValue) < 1) return targetValue;

        // 現在値が目標値より小さい場合は増加、大きい場合は減少
        return prev < targetValue
          ? prev + Math.max(1, (targetValue - prev) * 0.2)
          : prev - Math.max(1, (prev - targetValue) * 0.2);
      });
    };

    const timer = setInterval(animateProgress, 50);
    return () => clearInterval(timer);
  }, [progressPercent, progressSteps.length]);

  // ステップアニメーションバリアント
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Card className="max-w-2xl mx-auto mt-6 border-blue-100 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <CardTitle>調査の進捗状況</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3 mb-3">
          <Progress value={displayValue} className="flex-1 h-3" />
          <span className="text-sm font-semibold w-12 text-right bg-blue-100 px-2 py-1 rounded-full">
            {Math.round(displayValue)}%
          </span>
        </div>

        <motion.ul
          className="space-y-2 mt-6 divide-y divide-blue-50"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {progressSteps.map((step, index) => (
            <motion.li
              key={`step-${index}-${step.substring(0, 10)}`}
              className="flex items-center py-2"
              variants={item}
            >
              <span className="mr-3 shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                {index + 1}
              </span>
              <span className="text-sm">{step}</span>
            </motion.li>
          ))}
        </motion.ul>
      </CardContent>
    </Card>
  );
}
