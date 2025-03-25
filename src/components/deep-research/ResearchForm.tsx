import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Loader2, Search, Settings } from 'lucide-react';
import { useState } from 'react';

export interface ResearchParams {
  topic: string;
  writerModel: string;
  plannerModel: string;
  maxSearchDepth: number;
  numberOfQueries: number;
}

interface ResearchFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  handleSubmit: (e: React.FormEvent, params: ResearchParams) => Promise<void>;
  loading: boolean;
}

export function ResearchForm({ topic, setTopic, handleSubmit, loading }: ResearchFormProps) {
  // フォームの状態を管理
  const [writerModel, setWriterModel] = useState('gpt-4o');
  const [plannerModel, setPlannerModel] = useState('gpt-4o');
  const [maxSearchDepth, setMaxSearchDepth] = useState(2);
  const [numberOfQueries, setNumberOfQueries] = useState(3);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 利用可能なモデルのリスト
  const availableModels = [
    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    { id: 'claude-3-7-sonnet-latest', name: 'Claude 3.7 Sonnet' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ];

  // フォーム送信時に全パラメータを渡す
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: ResearchParams = {
      topic,
      writerModel,
      plannerModel,
      maxSearchDepth,
      numberOfQueries,
    };
    handleSubmit(e, params);
  };

  return (
    <Card className="max-w-2xl mx-auto border-blue-100 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
        <CardDescription className="mt-2 text-muted-foreground">
          調査したいトピックを入力すると、AIが包括的なレポートを作成します。
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="pt-6">
          <div className="grid w-full items-center gap-6">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="topic" className="font-medium">
                調査トピック
              </Label>
              <Textarea
                id="topic"
                placeholder="例：「宇宙望遠鏡の最新技術」「気候変動の経済的影響」「量子コンピューティングの未来」"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="min-h-20 resize-none bg-muted/40 focus:bg-background border-muted-foreground/20"
              />
            </div>

            {/* 詳細設定のトグルボタン */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{showAdvanced ? '詳細設定を隠す' : '詳細設定を表示'}</span>
              </Button>
            </div>

            {/* 詳細設定（トグルで表示/非表示） */}
            {showAdvanced && (
              <motion.div
                className="space-y-5 bg-muted/30 p-4 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="writer-model" className="text-sm font-medium">
                      執筆モデル
                    </Label>
                    <Select value={writerModel} onValueChange={setWriterModel} disabled={loading}>
                      <SelectTrigger id="writer-model" className="bg-background/50">
                        <SelectValue placeholder="執筆モデルを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="planner-model" className="text-sm font-medium">
                      プランナーモデル
                    </Label>
                    <Select value={plannerModel} onValueChange={setPlannerModel} disabled={loading}>
                      <SelectTrigger id="planner-model" className="bg-background/50">
                        <SelectValue placeholder="プランナーモデルを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-depth" className="text-sm font-medium">
                      検索深度
                    </Label>
                    <Select
                      value={maxSearchDepth.toString()}
                      onValueChange={(value) => setMaxSearchDepth(Number(value))}
                      disabled={loading}
                    >
                      <SelectTrigger id="max-depth" className="bg-background/50">
                        <SelectValue placeholder="検索深度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1回 (最小)</SelectItem>
                        <SelectItem value="2">2回 (推奨)</SelectItem>
                        <SelectItem value="3">3回 (詳細)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="num-queries" className="text-sm font-medium">
                      検索クエリ数
                    </Label>
                    <Select
                      value={numberOfQueries.toString()}
                      onValueChange={(value) => setNumberOfQueries(Number(value))}
                      disabled={loading}
                    >
                      <SelectTrigger id="num-queries" className="bg-background/50">
                        <SelectValue placeholder="クエリ数を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1個 (最小)</SelectItem>
                        <SelectItem value="3">3個 (推奨)</SelectItem>
                        <SelectItem value="5">5個 (詳細)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-b-lg">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                調査中...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                調査を開始
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
