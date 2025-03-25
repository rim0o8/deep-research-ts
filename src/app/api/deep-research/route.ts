import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5分のタイムアウト

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic,
      writerModel = 'claude-3-5-sonnet-latest',
      plannerModel = 'claude-3-7-sonnet-latest',
      maxSearchDepth = 2,
      numberOfQueries = 3,
      useMock = false, // デフォルト値をfalseに変更
    } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'トピックは必須で、文字列である必要があります' },
        { status: 400 }
      );
    }

    console.log('受信パラメータ:', {
      topic,
      writerModel,
      plannerModel,
      maxSearchDepth,
      numberOfQueries,
      useMock,
    });

    // ストリーミングレスポンスを設定
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // 進捗更新関数
    const updateProgress = async (message: string, percent?: number) => {
      const data = {
        type: 'progress',
        message,
        percent: percent || null,
      };
      await writer.write(encoder.encode(`${JSON.stringify(data)}\n`));
    };

    // 設定オブジェクトを作成 - フォームパラメータを使用
    const config = {
      configurable: {
        maxSearchDepth: Number(maxSearchDepth),
        numberOfQueries: Number(numberOfQueries),
        writerModel: writerModel,
        writerProvider: 'anthropic', // GPTモデルの場合は自動的に"openai"に切り替え
        plannerModel: plannerModel,
        plannerProvider: 'anthropic', // GPTモデルの場合は自動的に"openai"に切り替え
        searchApi: 'tavily', // 常にtavilyを使用
        progressCallback: updateProgress,
      },
    };

    // プロバイダーを自動検出
    if (writerModel.startsWith('gpt-')) {
      config.configurable.writerProvider = 'openai';
    }
    if (plannerModel.startsWith('gpt-')) {
      config.configurable.plannerProvider = 'openai';
    }

    // レポート生成プロセスを開始
    console.log(`Deep Researchレポートの生成を開始: "${topic}"`);

    // レポート生成処理を非同期で実行
    (async () => {
      try {
        await updateProgress('リサーチプランを作成中...', 10);

        // 実際のレポート生成処理
        console.log(`executeReport関数を呼び出し中... トピック: "${topic}"`);
        console.log(
          '設定パラメータ:',
          JSON.stringify(
            {
              ...config.configurable,
              writerModel: config.configurable.writerModel,
              plannerModel: config.configurable.plannerModel,
              searchApi: config.configurable.searchApi,
              // コールバック関数はJSONシリアライズできないため除外
              progressCallback: 'function(message, percent){...}',
            },
            null,
            2
          )
        );

        // ここでReportモジュールをインポート
        const { runResearch } = await import('@/lib/deep-research');

        await updateProgress('レポート生成を開始します...', 20);
        const report = await runResearch(topic, config);
        console.log(`レポート生成完了. 文字数: ${report.length}`);

        // レポート完了を通知
        const completionData = {
          type: 'complete',
          report,
        };
        await writer.write(encoder.encode(`${JSON.stringify(completionData)}\n`));
      } catch (error) {
        console.error('Deep Researchエラー:', error);
        // エラー通知
        const errorData = {
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        await writer.write(encoder.encode(`${JSON.stringify(errorData)}\n`));
      } finally {
        await writer.close();
      }
    })();

    // ストリーミングレスポンスを返す
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'レポート処理の開始中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
