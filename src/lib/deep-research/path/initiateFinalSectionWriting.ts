import { Send } from '@langchain/langgraph';
import type { ReportState } from '../state';

/**
 * Create parallel tasks for writing non-research sections.
 */
export function initiateFinalSectionWriting(state: ReportState) {
  const nonResearchSections = state.sections.filter((s) => !s.research);

  const completedSectionNames = state.completed_sections.map((s) => s.name.toLowerCase());

  const sectionsToProcess = nonResearchSections.filter(
    (s) => !completedSectionNames.includes(s.name.toLowerCase())
  );

  if (sectionsToProcess.length === 0) {
    return ['compile_final_report'];
  }

  const commands = sectionsToProcess.map((s) => {
    return new Send('write_final_sections', {
      topic: state.topic,
      section: s,
      report_sections_from_research: state.report_sections_from_research,

      completed_sections: [...state.completed_sections],
    });
  });

  return commands;
}
