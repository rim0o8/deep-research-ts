import { normalizeSearchResults } from '@/lib/deep-research/searchEngine';
import type { SearchResult } from '@/lib/deep-research/searchEngine/interface';

/**
 * mock search
 * @param query search query
 * @param params additional params
 * @returns search results
 */
export async function searchMock(
  query: string,
  params: Record<string, unknown>
): Promise<SearchResult[]> {
  if (!query || query.trim() === '') {
    throw new Error('Tavily検索エラー: 空のクエリが指定されました');
  }

  console.log(`mock search: "${query}"`, params);
  // テスト用のモックデータ
  const mockResults = [
    {
      title: `${query}に関する情報 - Wikipedia`,
      url: 'https://ja.wikipedia.org/wiki/example',
      content: `${query}は現代社会で重要な役割を果たしています。${query}の主な応用例としては、医療分野、教育分野、ビジネス分野などが挙げられます。特に人工知能と組み合わせることで、より効果的な結果が得られることが研究により明らかになっています。`,
      metadata: {
        score: 0.95,
        year: 2024,
        published_date: '2024-03-01',
        source: 'tavily',
      },
    },
    {
      title: `${query}の最新動向 - 技術ブログ`,
      url: 'https://example.com/tech-blog',
      content: `近年の${query}の発展は目覚ましく、特に以下の分野で注目されています：\n1. 自然言語処理\n2. コンピュータビジョン\n3. 予測分析\n4. 自動化システム\nこれらの技術は日々進化しており、私たちの生活をより便利にしています。`,
      metadata: {
        score: 0.88,
        year: 2024,
        published_date: '2024-02-15',
        source: 'tavily',
      },
    },
    {
      title: `${query}と未来社会 - 研究論文`,
      url: 'https://example.org/research-paper',
      content: `本研究では、${query}が将来の社会に与える影響について分析しました。研究結果によると、${query}の普及により、労働市場、教育システム、医療サービスに大きな変革がもたらされる可能性があります。特に注目すべきは、${query}によって新たな職業が創出される一方で、一部の従来型の仕事は自動化されることが予測されています。`,
      metadata: {
        score: 0.82,
        year: 2023,
        published_date: '2023-11-30',
        source: 'tavily',
      },
    },
  ];

  return normalizeSearchResults(mockResults);
}
