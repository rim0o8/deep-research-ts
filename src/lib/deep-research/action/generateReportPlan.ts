import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { RunnableConfig } from '@langchain/core/runnables';
import { Configuration } from '../configuration';
import { initChatModel } from '../helper/llm';
import { reportPlannerInstructions, reportPlannerQueryWriterInstructions } from '../prompts';
import { formatSearchResults, getConfigValue, selectAndExecuteSearch } from '../searchEngine';
import type { ReportState } from '../state';
import { safeJsonParse } from '../util';

/**
 * Generate the initial report plan with sections.
 *
 * This node:
 * 1. Gets configuration for the report structure and search parameters
 * 2. Generates search queries to gather context for planning
 * 3. Performs web searches using those queries
 * 4. Uses an LLM to generate a structured plan with sections
 */
export async function generateReportPlan(state: ReportState, config: RunnableConfig) {
  const topic = state.topic;
  const feedback = state.feedback_on_report_plan || '';

  const configurable = Configuration.fromRunnableConfig(config);
  const reportStructure = configurable.reportStructure;
  const numberOfQueries = configurable.numberOfQueries;
  const searchApi = getConfigValue(configurable.searchApi);
  const searchApiConfig = configurable.searchApiConfig || {};
  const progressCallback = configurable.progressCallback;

  if (progressCallback) {
    await progressCallback('レポート計画を生成中...', 15);
  }

  const writerProvider = getConfigValue(configurable.writerProvider);
  const writerModelName = getConfigValue(configurable.writerModel);
  const writerModel = initChatModel(writerModelName, writerProvider);

  const systemInstructionsQuery = reportPlannerQueryWriterInstructions
    .replace('{topic}', topic)
    .replace('{reportStructure}', reportStructure)
    .replace('{numberOfQueries}', numberOfQueries.toString());

  if (progressCallback) {
    await progressCallback('検索クエリを生成しています...', 20);
  }

  const queriesResult = await writerModel.invoke([
    new SystemMessage(systemInstructionsQuery),
    new HumanMessage('Generate search queries on the provided topic.'),
  ]);

  const queriesText =
    typeof queriesResult.content === 'string'
      ? queriesResult.content
      : JSON.stringify(queriesResult.content);

  let queries: unknown[] = [];
  try {
    const queriesData = safeJsonParse<Record<string, unknown> | unknown[]>(queriesText);

    if (queriesData === null) {
      throw new Error('Query parsing failed');
    }

    if (Array.isArray(queriesData)) {
      queries = queriesData;
    } else if (typeof queriesData === 'object' && queriesData !== null) {
      const recordData = queriesData as Record<string, unknown>;
      if (Array.isArray(recordData.queries)) {
        queries = recordData.queries;
      } else {
        for (const key in recordData) {
          const value = recordData[key];
          if (Array.isArray(value) && value.length > 0) {
            queries = value;
            break;
          }
        }
      }
    }

    if (queries.length > 0) {
      if (typeof queries[0] === 'string') {
        queries = queries.map((q) => {
          const queryStr = q as string;
          return { search_query: queryStr };
        });
      } else if (typeof queries[0] === 'object') {
        const validFields = ['search_query', 'searchQuery', 'query', 'text', 'q'];
        queries = queries.map((item) => {
          const queryObj = item as Record<string, unknown>;
          for (const field of validFields) {
            if (queryObj[field]) {
              return { search_query: queryObj[field] as string };
            }
          }
          return { search_query: JSON.stringify(item) };
        });
      }
    }

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      throw new Error('Query is empty');
    }
  } catch {
    throw new Error('Query parsing failed');
  }

  const queryList = queries
    .map((q) => {
      const queryObj = q as { search_query: string };
      return queryObj.search_query;
    })
    .filter(Boolean);

  if (progressCallback) {
    await progressCallback('トピックに関する情報を検索しています...', 25);
  }
  const results = await selectAndExecuteSearch(searchApi, queryList, searchApiConfig);

  const formattedResults = formatSearchResults(results);

  const systemInstructions = reportPlannerInstructions
    .replace('{topic}', topic)
    .replace('{reportStructure}', reportStructure)
    .replace('{context}', formattedResults)
    .replace('{feedback}', feedback || 'No feedback provided.');

  if (progressCallback) {
    await progressCallback('リサーチプランを作成しています...', 30);
  }

  // Generate report plan
  const plannerProvider = getConfigValue(configurable.plannerProvider);
  const plannerModelName = getConfigValue(configurable.plannerModel);
  const plannerModel = initChatModel(plannerModelName, plannerProvider);

  const plannerMessage =
    "Generate the sections of the report. Your response must include a 'sections' field containing a list of sections. " +
    'Each section must have: name, description, plan, research, and content fields.';

  console.log(`Planer LLM model: ${plannerModelName}`);
  const sectionsResult = await plannerModel.invoke([
    new SystemMessage(systemInstructions),
    new HumanMessage(plannerMessage),
  ]);

  // Extract content from the result
  const contentStr =
    typeof sectionsResult.content === 'string'
      ? sectionsResult.content
      : JSON.stringify(sectionsResult.content);

  const contentData = safeJsonParse<Record<string, unknown> | unknown[]>(contentStr);

  if (contentData === null) {
    throw new Error('Content parsing failed');
  }

  let sectionsArray: unknown[] = [];

  if (Array.isArray(contentData)) {
    sectionsArray = contentData;
  } else if (typeof contentData === 'object' && contentData !== null) {
    const objData = contentData as Record<string, unknown>;
    if (objData.sections && Array.isArray(objData.sections)) {
      sectionsArray = objData.sections;
    } else {
      for (const key in objData) {
        const value = objData[key];
        if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0] as Record<string, unknown>;
          if (
            firstItem &&
            (typeof firstItem.name === 'string' ||
              typeof firstItem.title === 'string' ||
              typeof firstItem.description === 'string')
          ) {
            sectionsArray = value;
            break;
          }
        }
      }
    }
  }

  if (sectionsArray.length === 0) {
    throw new Error('Sections not found');
  }

  const normalizedSections = sectionsArray.map((sectionData: unknown) => {
    const sectionObj =
      typeof sectionData === 'object' && sectionData !== null
        ? (sectionData as Record<string, unknown>)
        : {};

    const name =
      (typeof sectionObj.name === 'string' && sectionObj.name) ||
      (typeof sectionObj.title === 'string' && sectionObj.title) ||
      '無題のセクション';

    const description =
      (typeof sectionObj.description === 'string' && sectionObj.description) ||
      `${name}に関する情報`;

    const plan =
      (typeof sectionObj.plan === 'string' && sectionObj.plan) || `${name}に関する情報を収集する`;

    const research = sectionObj.research !== undefined ? Boolean(sectionObj.research) : true;

    const content = (typeof sectionObj.content === 'string' && sectionObj.content) || '';

    return {
      name,
      description,
      plan,
      research,
      content,
    };
  });

  return {
    ...state,
    sections: normalizedSections,
  };
}
