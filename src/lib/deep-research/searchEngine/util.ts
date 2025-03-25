import type { SearchResult } from '@/lib/deep-research/searchEngine/interface';

/**
 * format search results to readable text
 * @param results search results
 * @returns formatted text
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (!results.length) {
    return '検索結果はありません。';
  }

  return results
    .map((result, index) => {
      return `【検索結果 ${index + 1}】
タイトル: ${result.title}
URL: ${result.url}
コンテンツ:
${result.content}
---------------------`;
    })
    .join('\n\n');
}
