import type { SectionState } from '@/lib/deep-research/state';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { RunnableConfig } from '@langchain/core/runnables';
import { Configuration } from '../configuration';
import { initChatModel } from '../helper/llm';
import { queryWriterInstructions } from '../prompts';
import { getConfigValue } from '../searchEngine';
import { safeJsonParse } from '../util';
/**
 * Generate search queries for researching a specific section.
 */
export async function generateQueries(state: SectionState, config: RunnableConfig) {
  const topic = state.topic;
  const section = state.section;

  const configurable = Configuration.fromRunnableConfig(config);
  const numberOfQueries = configurable.numberOfQueries;

  const writerProvider = getConfigValue(configurable.writerProvider);
  const writerModelName = getConfigValue(configurable.writerModel);
  const writerModel = initChatModel(writerModelName, writerProvider);

  const systemInstructions = queryWriterInstructions
    .replace('{topic}', topic)
    .replace('{sectionName}', section.name)
    .replace('{sectionDescription}', section.description)
    .replace('{currentFindings}', state.source_str || 'No current findings yet.')
    .replace('{numberOfQueries}', numberOfQueries.toString());

  const queriesResult = await writerModel.invoke([
    new SystemMessage(systemInstructions),
    new HumanMessage(
      `Generate ${numberOfQueries} search queries about ${topic}, focusing on the section "${section.name}". Return as JSON with a "queries" array containing objects with "search_query" field. Format must be: {"queries": [{"search_query": "query text"}, ...]}`
    ),
  ]);

  const queriesText =
    typeof queriesResult.content === 'string'
      ? queriesResult.content
      : JSON.stringify(queriesResult.content);

  const queriesData = safeJsonParse<Record<string, unknown> | unknown[]>(queriesText);

  if (queriesData === null) {
    throw new Error('Failed to parse query');
  }

  let queryItems: unknown[] = [];

  if (Array.isArray(queriesData)) {
    queryItems = queriesData;
  } else if (typeof queriesData === 'object' && queriesData !== null) {
    const recordData = queriesData as Record<string, unknown>;
    if (Array.isArray(recordData.queries)) {
      queryItems = recordData.queries;
    } else {
      for (const key in recordData) {
        const value = recordData[key];
        if (Array.isArray(value) && value.length > 0) {
          queryItems = value;
          break;
        }
      }
    }
  }

  if (queryItems.length > 0) {
    const normalizedQueries: { search_query: string }[] = [];

    for (const item of queryItems) {
      if (typeof item === 'string') {
        normalizedQueries.push({ search_query: item });
      } else if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        const validFields = ['search_query', 'searchQuery', 'query', 'text', 'q'];

        let foundQueryField = false;
        for (const field of validFields) {
          if (field in obj && typeof obj[field] === 'string') {
            normalizedQueries.push({ search_query: obj[field] as string });
            foundQueryField = true;
            break;
          }
        }

        if (!foundQueryField) {
          normalizedQueries.push({ search_query: JSON.stringify(obj) });
        }
      } else if (item !== null && item !== undefined) {
        normalizedQueries.push({ search_query: String(item) });
      }
    }

    if (normalizedQueries.length > 0) {
      return { search_queries: normalizedQueries };
    }
  }
}
