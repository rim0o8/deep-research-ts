import { buildSectionGraph } from '@/lib/deep-research/builder/sections';
import type { RunnableConfig } from '@langchain/core/runnables';
import { Configuration } from '../configuration';
import type { ReportState, Section } from '../state';

const SECTION_START_PROGRESS = 30;
const SECTION_END_PROGRESS = 80;
const SECTION_PROGRESS_RANGE = SECTION_END_PROGRESS - SECTION_START_PROGRESS;

export async function processSections(state: ReportState, config?: RunnableConfig) {
  const completedSections: Section[] = [...state.completed_sections];

  const configurable = config ? Configuration.fromRunnableConfig(config) : new Configuration();
  const progressCallback = configurable.progressCallback;

  if (progressCallback) {
    await progressCallback('セクションの処理を開始しています...', 30);
  }

  const researchSections = state.sections.filter((s) => s.research);
  const totalSections = researchSections.length;

  let processedSectionCount = 0;

  for (let i = 0; i < state.sections.length; i++) {
    const section = state.sections[i];

    if (!section.research) {
      continue;
    }

    const existingIndex = completedSections.findIndex(
      (s) => s.name.toLowerCase() === section.name.toLowerCase() && s.content
    );
    if (existingIndex >= 0) {
      processedSectionCount++;
      continue;
    }

    const sectionStartProgress = Math.floor(
      SECTION_START_PROGRESS + (processedSectionCount / totalSections) * SECTION_PROGRESS_RANGE
    );

    if (progressCallback) {
      await progressCallback(
        `セクション「${section.name}」の調査を開始しています...`,
        sectionStartProgress
      );
    }

    const sectionConfig = { ...config };
    if (progressCallback) {
      const originalCallback = configurable.progressCallback;
      sectionConfig.configurable = {
        ...configurable,
        progressCallback: async (message: string, _percent?: number) => {
          const adjustedPercent = Math.floor(
            sectionStartProgress +
              ((_percent || 50) / 100) * (SECTION_PROGRESS_RANGE / totalSections)
          );
          if (originalCallback) {
            return originalCallback(message, adjustedPercent);
          }
        },
      };
    }
    try {
      const compiledSectionGraph = buildSectionGraph();

      const initialSectionState = {
        topic: state.topic,
        section: section,
        search_iterations: 0,
        search_queries: [],
        source_str: '',
        report_sections_from_research: state.report_sections_from_research || '',
        completed_sections: completedSections,
      };

      const sectionResult = await compiledSectionGraph.invoke(initialSectionState, sectionConfig);

      if (sectionResult.section?.content) {
        const existingIndex = completedSections.findIndex(
          (s) => s.name.toLowerCase() === sectionResult.section.name.toLowerCase()
        );
        if (existingIndex >= 0) {
          completedSections[existingIndex] = sectionResult.section;
        } else {
          completedSections.push(sectionResult.section);
        }
      }

      if (sectionResult.completed_sections && sectionResult.completed_sections.length > 0) {
        for (let j = 0; j < sectionResult.completed_sections.length; j++) {
          const completedSection = sectionResult.completed_sections[j];

          const existingIndex = completedSections.findIndex(
            (s) => s.name.toLowerCase() === completedSection.name.toLowerCase()
          );
          if (existingIndex >= 0) {
            completedSections[existingIndex] = completedSection;
          } else {
            completedSections.push(completedSection);
          }
        }

        const sectionEndProgress = Math.floor(
          SECTION_START_PROGRESS +
            ((processedSectionCount + 1) / totalSections) * SECTION_PROGRESS_RANGE
        );

        if (progressCallback) {
          await progressCallback(
            `セクション「${section.name}」の執筆を完了しました`,
            sectionEndProgress
          );
        }
      }

      processedSectionCount++;
    } catch (error) {
      console.error(error);
      if (progressCallback) {
        await progressCallback(
          `セクション「${section.name}」の処理中にエラーが発生しました`,
          sectionStartProgress
        );
      }

      const defaultSection = {
        ...section,
        content: `${section.name}に関する情報の収集中にエラーが発生しました。`,
      };
      completedSections.push(defaultSection);

      processedSectionCount++;
    }
  }

  if (progressCallback) {
    await progressCallback('すべてのセクションの処理が完了しました', 80);
  }

  return { completed_sections: completedSections };
}
