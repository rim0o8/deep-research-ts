import { compileFinalReport } from '@/lib/deep-research/action/compileFinalReport';
import { gatherCompletedSections } from '@/lib/deep-research/action/gatherCompletedSections';
import { processSections } from '@/lib/deep-research/action/processSections';
import { StateGraph } from '@langchain/langgraph';
import { generateReportPlan } from '../action/generateReportPlan';
import { humanFeedback } from '../action/humanFeedback';
import { writeFinalSections } from '../action/writeFinalSections';
import { initiateFinalSectionWriting } from '../path/initiateFinalSectionWriting';
import type { Section } from '../state';

export function buildResearchGraph() {
  type StateType = {
    topic: string;
    feedback_on_report_plan: string;
    sections: Section[];
    completed_sections: Section[];
    report_sections_from_research: string;
    final_report: string;
  };

  const graph = new StateGraph<StateType>({
    channels: {
      topic: { value: (x: string, y: string) => y },
      feedback_on_report_plan: { value: (x: string, y: string) => y },
      sections: { value: (x: Section[], y: Section[]) => y },
      completed_sections: {
        value: (x: Section[], y: Section[]) => y,
        default: () => [],
      },
      report_sections_from_research: { value: (x: string, y: string) => y },
      final_report: { value: (x: string, y: string) => y },
    },
  });

  graph
    .addNode('generate_report_plan', generateReportPlan)
    .addNode('human_feedback', humanFeedback)
    .addNode('process_sections', processSections)
    .addNode('gather_completed_sections', gatherCompletedSections)
    .addNode('write_final_sections', writeFinalSections)
    .addNode('compile_final_report', compileFinalReport)
    .addEdge('__start__', 'generate_report_plan')
    .addEdge('generate_report_plan', 'human_feedback')
    .addEdge('human_feedback', 'process_sections')
    .addEdge('process_sections', 'gather_completed_sections')
    .addConditionalEdges('gather_completed_sections', initiateFinalSectionWriting, {
      write_final_sections: 'write_final_sections',
      compile_final_report: 'compile_final_report',
    })
    .addEdge('write_final_sections', 'compile_final_report')
    .addEdge('compile_final_report', '__end__');

  return graph.compile();
}
