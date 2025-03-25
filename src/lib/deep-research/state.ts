import { z } from 'zod';

/**
 * Report section interface
 */
export interface Section {
  /** Section name */
  name: string;
  /** Section description */
  description: string;
  /** Plan for this section */
  plan?: string;
  /** Whether to perform web research for this section */
  research: boolean;
  /** Section content */
  content: string;
}

/**
 * Section Zod schema
 */
export const SectionSchema = z.object({
  name: z.string().describe('Name for this section of the report.'),
  description: z
    .string()
    .describe('Brief overview of the main topics and concepts to be covered in this section.'),
  plan: z.string().optional().describe('Plan for this section of the report.'),
  research: z.boolean().describe('Whether to perform web research for this section of the report.'),
  content: z.string().describe('The content of the section.'),
});

/**
 * Zod schema for array of sections
 */
export const SectionsSchema = z.object({
  sections: z.array(SectionSchema).describe('Sections of the report.'),
});

/**
 * Interface representing a search query
 */
export interface SearchQuery {
  /** Query for web search */
  search_query: string;
}

/**
 * Zod schema for search query
 */
export const SearchQuerySchema = z.object({
  search_query: z.string().nullable().describe('Query for web search.'),
});

/**
 * Zod schema for array of search queries
 */
export const QueriesSchema = z.object({
  queries: z.array(SearchQuerySchema).describe('List of search queries.'),
});

/**
 * Type for feedback grade
 */
export type GradeType = 'pass' | 'fail';

/**
 * Interface representing feedback
 */
export interface Feedback {
  /** Evaluation result indicating whether the response meets requirements ('pass') or needs revision ('fail') */
  grade: GradeType;
  /** List of follow-up search queries */
  follow_up_queries: SearchQuery[];
}

/**
 * Zod schema for feedback
 */
export const FeedbackSchema = z.object({
  grade: z
    .enum(['pass', 'fail'])
    .describe(
      "Evaluation result indicating whether the response meets requirements ('pass') or needs revision ('fail')."
    ),
  follow_up_queries: z.array(SearchQuerySchema).describe('List of follow-up search queries.'),
});

/**
 * Report state input interface
 */
export interface ReportStateInput {
  /** Report topic */
  topic: string;
}

/**
 * Report state output interface
 */
export interface ReportStateOutput {
  /** Final report */
  final_report: string;
}

/**
 * Interface representing report state
 */
export interface ReportState {
  topic: string /** Report topic */;
  feedback_on_report_plan: string /** Feedback on report plan */;
  sections: Section[] /** List of report sections */;
  completed_sections: Section[] /** Completed sections (this array is incrementally updated) */;
  report_sections_from_research: string /** String of completed sections from research */;
  final_report: string /** Final report */;
}

/**
 * Interface representing section state
 */
export interface SectionState {
  topic: string /** Report topic */;
  section: Section /** Report section */;
  search_iterations: number /** Number of search iterations executed */;
  search_queries: SearchQuery[];
  source_str: string /** Formatted source content from web search */;
  report_sections_from_research: string /** String of completed sections from research */;
  completed_sections: Section[] /** Completed sections (duplicated to sync with external state) */;
  grade_result?: string /** Grade result */;
}

/**
 * Interface representing section output state
 */
export interface SectionOutputState {
  /** Completed sections (duplicated to sync with external state) */
  completed_sections: Section[];
}

/**
 * Interface representing deep research state
 */
export interface ResearchState {
  topic: string /** Report topic */;
  planModel: string /** Model used for plan generation */;
  planModelProvider: string /** Model provider used for plan generation */;
  queryModel?: string /** Model used for query generation */;
  queryModelProvider?: string /** Model provider used for query generation */;
  writeModel?: string /** Model used for section writing */;
  writeModelProvider?: string /** Model provider used for section writing */;
  sections: Section[] /** List of report sections */;
  currentStep: string /** Current process step */;
  error?: string /** Error message (if exists) */;
  queries?: SearchQuery[] /** List of search queries */;
  completedSections?: Section[] /** Completed sections */;
  finalReport?: string /** Final report content */;
}
