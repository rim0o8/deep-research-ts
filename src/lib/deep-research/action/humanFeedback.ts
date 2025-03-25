import type { ReportState } from '@/lib/deep-research/state';
import { Command } from '@langchain/langgraph';

/**
 * Process human feedback on the report plan.
 */
export function humanFeedback(state: ReportState) {
  const sections = state.sections;

  if (state.feedback_on_report_plan) {
    return new Command({
      goto: 'generate_report_plan',
      update: {
        feedback_on_report_plan: state.feedback_on_report_plan,
      },
    });
  }

  const researchSections = sections.filter((s) => s.research);

  if (researchSections.length === 0) {
    return new Command({
      goto: 'gather_completed_sections',
    });
  }

  return new Command({
    goto: 'process_sections',
  });
}
