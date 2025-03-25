import { generateQueries } from '@/lib/deep-research/action/generateQueries';
import { searchWeb } from '@/lib/deep-research/action/searchWeb';
import { writeSection } from '@/lib/deep-research/action/writeSection';
import type { SearchQuery, Section, SectionState } from '@/lib/deep-research/state';
import { StateGraph } from '@langchain/langgraph';

export function buildSectionGraph() {
  const graph = new StateGraph<SectionState>({
    channels: {
      topic: { value: (x: string, y: string) => y },
      section: { value: (x: Section, y: Section) => y },
      search_queries: { value: (x: SearchQuery[], y: SearchQuery[]) => y },
      search_iterations: {
        value: (x: number, y: number) => y,
        default: () => 0,
      },
      source_str: { value: (x: string, y: string) => y },
      completed_sections: {
        value: (x: Section[], y: Section[]) => y,
        default: () => [],
      },
      report_sections_from_research: { value: (x: string, y: string) => y },
      grade_result: { value: (x: string | undefined, y: string | undefined) => y },
    },
  });

  graph
    .addNode('generate_queries', generateQueries)
    .addNode('search_web', searchWeb)
    .addNode('write_section', writeSection)

    .addEdge('__start__', 'generate_queries')
    .addEdge('generate_queries', 'search_web')
    .addEdge('search_web', 'write_section');

  const compiledSectionGraph = graph.compile();
  return compiledSectionGraph;
}
