import type { ReportState, Section } from '@/lib/deep-research/state';

/**
 * Compile all sections into the final report.
 */
export function compileFinalReport(state: ReportState) {
  const sections = state.sections;

  const completedSectionNames = state.completed_sections.map((s) => s.name.toLowerCase());
  const additionalSections: Section[] = [];

  for (const section of sections) {
    if (!completedSectionNames.includes(section.name.toLowerCase())) {
      if (section.content) {
        additionalSections.push({
          ...section,
          content: section.content,
        });
      }
    }
  }

  const allCompletedSections = [...state.completed_sections, ...additionalSections];

  const completedSectionsMap = new Map<string, Section>();
  for (const section of allCompletedSections) {
    if (section.content && section.content.trim().length > 0) {
      completedSectionsMap.set(section.name.toLowerCase(), section);
    }
  }

  const updatedSections = sections
    .map((section) => {
      // 完了セクションから対応するセクションを取得（大文字小文字を無視）
      const completedSection = completedSectionsMap.get(section.name.toLowerCase());

      // 対応するセクションがあれば更新、なければnullを返す
      if (completedSection?.content) {
        return {
          ...section,
          content: completedSection.content,
        };
      }
      return null;
    })
    .filter((section) => section !== null) as Section[]; // nullを除外

  const allSections = updatedSections.map((s) => `# ${s.name}\n\n${s.content}`).join('\n\n');

  return { final_report: allSections };
}
