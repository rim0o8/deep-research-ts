import type { SearchResult } from '@/lib/deep-research/searchEngine/interface';
import axios from 'axios';
import { normalizeSearchResults } from './index';

/**
 * tavily search
 * @param query search query
 * @param params additional params
 * @returns search results
 */
export async function searchWithTavily(
  query: string,
  params: Record<string, unknown>
): Promise<SearchResult[]> {
  console.log(`Tavilyで検索: "${query}"`);

  if (!query || query.trim() === '') {
    throw new Error('Tavily検索エラー: 空のクエリが指定されました');
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('Tavily API key is not set');
  }

  const requestBody = {
    api_key: apiKey,
    query: query,
    search_depth: 'advanced',
    include_domains: params.include_domains || [],
    exclude_domains: params.exclude_domains || [],
    max_results: params.max_results || 10,
    include_answer: true,
    include_raw_content: false,
  };

  const response = await axios.post('https://api.tavily.com/search', requestBody);

  if (!response.data) {
    throw new Error('Tavily API エラー: レスポンスデータがありません');
  }

  const data = response.data;
  const results = data.results || [];

  if (results.length === 0) {
    throw new Error('No results found');
  }

  // 検索結果を標準形式に変換
  const normalizedResults = normalizeSearchResults(
    results.map((result: Record<string, unknown>) => ({
      title: (result.title as string) || 'タイトルなし',
      url: (result.url as string) || '',
      content: (result.content as string) || (result.snippet as string),
      metadata: {
        score: result.score as number,
        year: result.year as number,
        published_date: result.published_date as string,
        source: 'tavily',
      },
    }))
  );

  return normalizedResults;
}
