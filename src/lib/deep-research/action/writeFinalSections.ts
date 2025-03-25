import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { RunnableConfig } from '@langchain/core/runnables';
import { Configuration } from '../configuration';
import { initChatModel } from '../helper/llm';
import { finalSectionWriterInstructions } from '../prompts';
import { getConfigValue } from '../searchEngine';
import type { Section, SectionState } from '../state';
import { safeJsonParse } from '../util';

/**
 * Write sections that don't require research using completed sections as context.
 */
export async function writeFinalSections(state: SectionState, config: RunnableConfig) {
  const configurable = Configuration.fromRunnableConfig(config);

  const topic = state.topic;
  const section = state.section;
  const completedReportSections = state.report_sections_from_research;
  const existingCompletedSections = state.completed_sections || [];

  const systemInstructions = finalSectionWriterInstructions
    .replace('{topic}', topic)
    .replace('{sectionName}', section.name)
    .replace('{sectionDescription}', section.description)
    .replace('{researchMaterials}', completedReportSections || 'No research materials available.');

  const writerProvider = getConfigValue(configurable.writerProvider);
  const writerModelName = getConfigValue(configurable.writerModel);
  const writerModel = initChatModel(writerModelName, writerProvider);

  const sectionContent = await writerModel.invoke([
    new SystemMessage(systemInstructions),
    new HumanMessage('Generate a report section based on the provided sources.'),
  ]);

  const contentStr =
    typeof sectionContent.content === 'string'
      ? sectionContent.content
      : JSON.stringify(sectionContent.content);

  try {
    const contentData = safeJsonParse<Record<string, unknown>>(contentStr);

    let updatedSection: Section;

    if (contentData?.content && typeof contentData.content === 'string') {
      updatedSection = {
        ...section,
        content: contentData.content,
      };
    } else {
      updatedSection = {
        ...section,
        content: contentStr,
      };
    }

    const existingIndex = existingCompletedSections.findIndex(
      (s) => s.name.toLowerCase() === updatedSection.name.toLowerCase()
    );

    const newCompletedSections = [...existingCompletedSections];

    if (existingIndex >= 0) {
      newCompletedSections[existingIndex] = updatedSection;
    } else {
      newCompletedSections.push(updatedSection);
    }

    return {
      section: updatedSection,
      completed_sections: newCompletedSections,
    };
  } catch {
    throw new Error('Failed to write final sections');
  }
}
