/**
 * search result interface
 */
export interface SearchResult {
  title: string;
  url: string;
  content: string;
  metadata?: Record<string, unknown>;
}
