/** Default report structure */
export const DEFAULT_REPORT_STRUCTURE = `Use this structure to create a report on the user-provided topic:

1. Introduction (no research needed)
   - Brief overview of the topic area

2. Main Body Sections:
   - Each section should focus on a sub-topic of the user-provided topic

3. Conclusion
   - Aim for 1 structural element (either a list of table) that distills the main body sections
   - Provide a concise summary of the report`;

/** Available search APIs */
export enum SearchAPI {
  MOCK = 'mock',
  TAVILY = 'tavily',
  // PERPLEXITY = 'perplexity',
  // EXA = 'exa',
  // ARXIV = 'arxiv',
  // PUBMED = 'pubmed',
  // LINKUP = 'linkup',
  // DUCKDUCKGO = 'duckduckgo',
  // GOOGLESEARCH = 'googlesearch',
}

/** Search API config options type */
export type SearchApiConfigOptions = {
  maxResults?: number;
  includeRawContent?: boolean;
  maxCharacters?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  subpages?: number;
  depth?: string;
  email?: string;
  apiKey?: string;
};

/** Progress callback function type */
export type ProgressCallback = (message: string, percent?: number) => Promise<void>;

/** Runnable config options */
export interface RunnableConfig {
  configurable?: Record<string, unknown>;
}

/**
 * Configuration class for Deep Research
 */
export class Configuration {
  reportStructure: string; /** Report structure template */
  numberOfQueries: number; /** Number of search queries to generate per iteration */
  maxSearchDepth: number; /** Maximum search depth (maximum number of iterations + search iterations) */
  plannerProvider: string; /** Planner provider */
  plannerModel: string; /** Planner model */
  writerProvider: string; /** Writer provider */
  writerModel: string; /** Writer model */
  searchApi: SearchAPI; /** Search API to use */
  searchApiConfig?: SearchApiConfigOptions; /** Additional settings for the search API */
  progressCallback?: ProgressCallback; /** Progress status notification callback function */

  /**
   * Configuration class constructor
   */
  constructor({
    reportStructure = DEFAULT_REPORT_STRUCTURE,
    numberOfQueries = 2,
    maxSearchDepth = 2,
    plannerProvider = 'anthropic',
    plannerModel = 'claude-3-7-sonnet-latest',
    writerProvider = 'anthropic',
    writerModel = 'claude-3-5-sonnet-latest',
    searchApi = SearchAPI.TAVILY,
    searchApiConfig = undefined,
    progressCallback = undefined,
  }: Partial<Configuration> = {}) {
    this.reportStructure = reportStructure;
    this.numberOfQueries = numberOfQueries;
    this.maxSearchDepth = maxSearchDepth;
    this.plannerProvider = plannerProvider;
    this.plannerModel = plannerModel;
    this.writerProvider = writerProvider;
    this.writerModel = writerModel;
    this.searchApi = searchApi;
    this.searchApiConfig = searchApiConfig;
    this.progressCallback = progressCallback;
  }

  /**
   * Create a configuration instance from RunnableConfig
   * @param config Runnable config
   * @returns Configuration instance
   */
  static fromRunnableConfig(config?: RunnableConfig): Configuration {
    const configurable = config?.configurable || {};

    let searchApiValue: SearchAPI | undefined;
    if (process.env.SEARCH_API) {
      const envValue = process.env.SEARCH_API;
      if (Object.values(SearchAPI).includes(envValue as SearchAPI)) {
        searchApiValue = envValue as SearchAPI;
      }
    } else {
      searchApiValue = configurable.searchApi as SearchAPI;
    }

    const values: Partial<Configuration> = {
      reportStructure: process.env.REPORT_STRUCTURE || (configurable.reportStructure as string),
      numberOfQueries: process.env.NUMBER_OF_QUERIES
        ? Number.parseInt(process.env.NUMBER_OF_QUERIES, 10)
        : (configurable.numberOfQueries as number),
      maxSearchDepth: process.env.MAX_SEARCH_DEPTH
        ? Number.parseInt(process.env.MAX_SEARCH_DEPTH, 10)
        : (configurable.maxSearchDepth as number),
      plannerProvider: process.env.PLANNER_PROVIDER || (configurable.plannerProvider as string),
      plannerModel: process.env.PLANNER_MODEL || (configurable.plannerModel as string),
      writerProvider: process.env.WRITER_PROVIDER || (configurable.writerProvider as string),
      writerModel: process.env.WRITER_MODEL || (configurable.writerModel as string),
      searchApi: searchApiValue,
      searchApiConfig: configurable.searchApiConfig as SearchApiConfigOptions,
      progressCallback: configurable.progressCallback as ProgressCallback,
    };

    const keys = Object.keys(values) as Array<keyof Configuration>;
    for (const key of keys) {
      if (values[key] === undefined) {
        delete values[key];
      }
    }

    return new Configuration(values);
  }
}
