import type { RunnableConfig } from '@langchain/core/runnables';
import type { SearchApiConfigOptions } from '../configuration';
import { Configuration } from '../configuration';
import {
  type SearchResult,
  formatSearchResults,
  getSearchParams,
  selectAndExecuteSearch,
} from '../searchEngine';
import type { SearchQuery, SectionState } from '../state';
/**
 * 生成されたクエリを使用してウェブ検索を実行する。
 */
export async function searchWeb(state: SectionState, config: RunnableConfig) {
  // State variables
  const search_queries = state.search_queries || [];

  // Get configuration
  const configurable = Configuration.fromRunnableConfig(config);

  // 進捗状況を通知
  const progressCallback = config.configurable?.progressCallback as
    | ((message: string) => Promise<void>)
    | undefined;

  // 進捗状況を通知
  if (progressCallback) {
    await progressCallback(
      `検索クエリ: ${search_queries.map((q: SearchQuery) => q.search_query).join(', ')}`
    );
  }

  const searchApi = configurable.searchApi || process.env.SEARCH_API || 'tavily';

  let results: SearchResult[] = [];

  try {
    if (search_queries.length > 0) {
      // 各クエリの処理
      for (const queryObj of search_queries) {
        // クエリの取得
        const query = queryObj.search_query;

        // クエリが空の場合はスキップまたはデフォルトクエリを使用
        if (!query || query.trim() === '') {
          throw new Error('Empty search query');
        }

        // 検索API用の設定パラメータを取得
        const searchParams = getSearchParams(
          searchApi,
          configurable.searchApiConfig as SearchApiConfigOptions
        );

        // 通常検索を実行
        results = await selectAndExecuteSearch(searchApi, query, searchParams);
      }
    } else {
      throw new Error('No search queries provided');
    }
  } catch (error) {
    throw new Error('Search web failed', { cause: error });
  }

  // Format results for the section writer
  const formattedResults = formatSearchResults(results);

  // 進捗状況を通知
  if (progressCallback) {
    await progressCallback(`${results.length}件の検索結果を取得しました`);
  }

  // Return search results
  return {
    source_str: formattedResults,
    search_iterations: state.search_iterations + 1,
  };
}
