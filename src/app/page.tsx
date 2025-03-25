'use client';

import type { ResearchParams } from '@/components/deep-research';
import {
  ErrorDisplay,
  ProgressIndicator,
  ResearchForm,
  ResearchReport,
} from '@/components/deep-research';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';

export default function DeepResearchPage() {
  const [topic, setTopic] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const [currentParams, setCurrentParams] = useState<ResearchParams | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // コンポーネントがアンマウントされたときにストリームをクリーンアップ
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel().catch(console.error);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent, params: ResearchParams) => {
    e.preventDefault();
    if (!params.topic.trim()) return;

    setLoading(true);
    setError('');
    setReport('');
    setProgressSteps([]);
    setProgressPercent(5); // 初期進捗を5%に設定
    setCurrentParams(params);
    addProgressStep('リクエストを送信中...');

    try {
      const response = await fetch('/api/deep-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok || !response.body) {
        throw new Error('サーバーからのレスポンスが無効です');
      }

      // レスポンスボディからリーダーを取得
      const reader = response.body.getReader();
      readerRef.current = reader;

      // 読み取りループ
      const processStream = async () => {
        let receivedData = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('Stream complete');
            setProgressPercent(100); // 完了時には100%
            break;
          }

          // 受信したデータをデコード
          const chunk = new TextDecoder().decode(value);
          receivedData += chunk;

          console.log('受信データチャンク:', `${chunk.substring(0, 100)}...`);

          // 改行で区切られたJSONオブジェクトを処理
          const lines = receivedData.split('\n');
          // 最後の不完全な行を保持
          receivedData = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);
              console.log('処理中のデータ:', data.type, data.percent ? `(${data.percent}%)` : '');

              // メッセージタイプによって処理を分岐
              switch (data.type) {
                case 'progress':
                  addProgressStep(data.message);
                  // APIから送信された進捗率を使用
                  if (typeof data.percent === 'number') {
                    setProgressPercent(data.percent);
                  } else {
                    // フォールバック: メッセージに応じて進捗率を更新
                    updateProgressBasedOnMessage(data.message);
                  }
                  break;
                case 'complete':
                  if (data.report?.trim()) {
                    const reportText = data.report;
                    setReport(reportText);
                    addProgressStep('レポートの生成が完了しました');
                    setProgressPercent(100);
                  } else {
                    setError('レポートを生成できませんでした。別のトピックで試してください。');
                    addProgressStep('レポート生成に失敗しました');
                  }
                  setLoading(false);
                  break;
                case 'error':
                  throw new Error(data.error || '処理中にエラーが発生しました');
                default:
                  console.warn('未知のメッセージタイプ:', data.type);
              }
            } catch (err) {
              console.error('JSON解析エラー:', err, line);
              setError(err instanceof Error ? err.message : 'データの解析中にエラーが発生しました');
              setLoading(false);
              return;
            }
          }
        }
      };

      // ストリーム処理を開始
      processStream().catch((err) => {
        console.error('ストリーム処理エラー:', err);
        setError(err instanceof Error ? err.message : 'ストリーム処理中にエラーが発生しました');
        setLoading(false);
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      addProgressStep('エラーが発生しました');
      setLoading(false);
    }
  };

  // メッセージ内容に基づいて進捗状況を更新する（フォールバック用）
  const updateProgressBasedOnMessage = (message: string) => {
    // メッセージの内容に基づいた進捗の設定
    if (message.includes('プラン')) {
      setProgressPercent(20);
    } else if (message.includes('検索')) {
      setProgressPercent(40);
    } else if (message.includes('情報収集')) {
      setProgressPercent(60);
    } else if (message.includes('レポート')) {
      setProgressPercent(80);
    } else if (progressPercent < 90) {
      // その他のメッセージの場合は少しずつ進める
      setProgressPercent((prev) => Math.min(prev + 5, 90));
    }
  };

  const addProgressStep = (step: string) => {
    setProgressSteps((prev) => [...prev, step]);
  };

  const handleNewSearch = () => {
    // 現在のストリームがあればキャンセル
    if (readerRef.current) {
      readerRef.current.cancel().catch(console.error);
      readerRef.current = null;
    }

    setReport('');
    setError('');
    setProgressSteps([]);
    setProgressPercent(0);
    setCurrentParams(null);
    setShowHistory(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Deep Research</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container">
          <Card className="mx-auto max-w-4xl">
            <CardContent>
              <div className="flex flex-col gap-6">
                {!report && (
                  <ResearchForm
                    topic={topic}
                    setTopic={setTopic}
                    handleSubmit={handleSubmit}
                    loading={loading}
                  />
                )}

                {loading && (
                  <ProgressIndicator
                    progressSteps={progressSteps}
                    progressPercent={progressPercent}
                  />
                )}

                {error && <ErrorDisplay error={error} handleNewSearch={handleNewSearch} />}

                {report && <ResearchReport report={report} handleNewSearch={handleNewSearch} />}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
