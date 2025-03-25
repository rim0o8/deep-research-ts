import { buildResearchGraph } from './builder';
import type { RunnableConfig } from './configuration';
import { Configuration } from './configuration';
/**
 * Execute report generation for a given topic.
 */
export async function runResearch(topic: string, config?: RunnableConfig): Promise<string> {
  // Initialize the graph
  console.log('Initializing report graph for topic:', topic);
  const reportGraph = buildResearchGraph();

  // Get configuration for progress callback
  const configurable = config ? Configuration.fromRunnableConfig(config) : new Configuration();
  const progressCallback = configurable.progressCallback;

  // Prepare initial state
  const initialState = {
    topic,
    feedback_on_report_plan: '',
    sections: [],
    completed_sections: [],
    report_sections_from_research: '',
    final_report: '',
  };

  try {
    console.log('Executing report graph...');
    if (progressCallback) {
      await progressCallback('レポート生成を開始しています...', 5);
    }

    const result = await reportGraph.invoke(initialState, config);

    if (!result.final_report || result.final_report.trim() === '') {
      throw new Error('Empty report generated');
    }

    if (progressCallback) {
      await progressCallback('レポート生成が完了しました', 100);
    }

    return result.final_report;
  } catch (error) {
    // エラー発生時も進捗状況を通知
    if (progressCallback) {
      await progressCallback('レポート生成中にエラーが発生しました', 0);
    }
    throw error;
  }
}
