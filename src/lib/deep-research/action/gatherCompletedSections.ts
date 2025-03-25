import { formatSections } from '@/lib/deep-research/util';

import type { ReportState } from '@/lib/deep-research/state';

/**
 * Format completed sections as context for writing final sections.
 */
export function gatherCompletedSections(state: ReportState) {
  const completedReportSections = formatSections(state.completed_sections);
  return { report_sections_from_research: completedReportSections };
}
