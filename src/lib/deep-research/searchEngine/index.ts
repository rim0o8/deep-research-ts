import type { SearchResult } from '@/lib/deep-research/searchEngine/interface';
import { SearchAPI, type SearchApiConfigOptions } from '../configuration';
import { searchMock } from './mock';
import { searchWithTavily } from './tavily';
import { formatSearchResults } from './util';

export { formatSearchResults, type SearchResult };

/**
 * get config value
 * @param value config value (string or enum)
 * @returns string config value
 */
export function getConfigValue(value: string | SearchAPI): string {
  return typeof value === 'string' ? value : String(value);
}

/**
 * filter search api config by accepted params
 * @param searchApi search api identifier
 * @param searchApiConfig search api config
 * @returns params for search function
 */
export function getSearchParams(
  searchApi: string,
  searchApiConfig?: SearchApiConfigOptions
): Record<string, unknown> {
  if (!searchApiConfig) return {};

  const SEARCH_API_PARAMS: Record<string, string[]> = {
    exa: ['maxCharacters', 'numResults', 'includeDomains', 'excludeDomains', 'subpages'],
    tavily: [], // Tavilyは現在追加パラメータを受け付けない
    perplexity: [], // Perplexityは追加パラメータを受け付けない
    arxiv: ['loadMaxDocs', 'getFullDocuments', 'loadAllAvailableMeta'],
    pubmed: ['topKResults', 'email', 'apiKey', 'docContentCharsMax'],
    linkup: ['depth'],
  };

  const acceptedParams = SEARCH_API_PARAMS[searchApi] || [];

  const filteredConfig: Record<string, unknown> = {};
  for (const key of acceptedParams) {
    const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const paramValue = searchApiConfig[key as keyof SearchApiConfigOptions];
    if (paramValue !== undefined) {
      filteredConfig[snakeCaseKey] = paramValue;
    }
  }

  return filteredConfig;
}

/**
 * select and execute search
 * @param searchApi search api
 * @param query search query
 * @param searchApiConfig search api config
 * @returns search results
 */
export async function selectAndExecuteSearch(
  searchApi: string,
  query: string | string[],
  searchApiConfig?: SearchApiConfigOptions
): Promise<SearchResult[]> {
  const envSearchApi = process.env.SEARCH_API;
  const effectiveSearchApi = envSearchApi || searchApi;

  const params = getSearchParams(effectiveSearchApi, searchApiConfig);

  const effectiveQuery = Array.isArray(query) ? query[0] : query;

  switch (effectiveSearchApi) {
    case SearchAPI.TAVILY:
      return await searchWithTavily(effectiveQuery, params);
    case SearchAPI.MOCK:
      return await searchMock(effectiveQuery, params);
    default:
      throw new Error(`サポートされていない検索API: ${effectiveSearchApi}`);
  }
}

/**
 * normalize search results from external search provider
 * @param results search results from external search provider
 * @returns normalized search results
 */
export function normalizeSearchResults(results: Record<string, unknown>[]): SearchResult[] {
  return results.map((result) => ({
    title: (result.title as string) || 'タイトルなし',
    url: (result.url as string) || '',
    content:
      (result.content as string) || (result.snippet as string) || (result.text as string) || '',
    metadata: (result.metadata as Record<string, unknown>) || {},
  }));
}
