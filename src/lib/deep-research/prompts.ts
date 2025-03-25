/**
 * Prompt templates for Deep Research
 */

/**
 * Report planner instructions
 */
export const reportPlannerInstructions = `You are a skilled research planner. Your task is to create a comprehensive plan for researching and writing a report on the provided topic.

Please organize the report into logical sections that cover the key aspects of the topic. For each section:
1. Provide a clear, descriptive name
2. Write a brief overview of what the section will cover
3. Indicate whether the section needs web research (true/false)

IMPORTANT: All section names MUST be written in Japanese (日本語).

TOPIC: {topic}

REPORT STRUCTURE:
{reportStructure}

FEEDBACK (if any):
{feedback}

OUTPUT FORMAT:
Return only the JSON array of sections without any additional text.
[
  {
    "name": "セクション名（日本語で）",
    "description": "Brief description of the section content",
    "research": true/false,
    "content": ""
  },
  ...
]`;

/**
 * Query writer instructions
 */
export const queryWriterInstructions = `You are a search query expert who specializes in crafting effective search queries for research.

Based on the following information, generate {numberOfQueries} search queries that will yield relevant and useful results for researching the section of a report.

TOPIC: {topic}
SECTION: {sectionName}
SECTION DESCRIPTION: {sectionDescription}
CURRENT FINDINGS: {currentFindings}

Think carefully about what specific information is needed for this section. Your queries should be:
1. Specific and focused
2. Use precise terminology
3. Include important context

FORMAT YOUR RESPONSE AS JSON:
Return only a JSON object with a 'queries' array without any additional text. Each query object must use the field name 'search_query' (NOT 'searchQuery' or other variations).

Example format:
{
  "queries": [
    {"search_query": "first search query"},
    {"search_query": "second search query"},
    ...
  ]
}`;

/**
 * Report planner query writer instructions
 */
export const reportPlannerQueryWriterInstructions = `You are a search query expert who specializes in crafting effective search queries for research.

Generate {numberOfQueries} search queries to gather information for planning a report on the following topic:

TOPIC: {topic}

Think carefully about what specific information would help create a well-structured report outline. Your queries should:
1. Cover different aspects of the topic
2. Help identify key subtopics
3. Use precise terminology

FORMAT YOUR RESPONSE AS JSON:
Return only a JSON object with a 'queries' array without any additional text. Each query object must use the field name 'search_query' (NOT 'searchQuery' or other variations).

Example format:
{
  "queries": [
    {"search_query": "first search query"},
    {"search_query": "second search query"},
    ...
  ]
}`;

/**
 * Section writer inputs
 */
export const sectionWriterInputs = `TOPIC: {topic}
SECTION NAME: {sectionName}
SECTION DESCRIPTION: {sectionDescription}
SOURCES:
{sources}

Your task is to write a comprehensive section for the report based on the provided sources.`;

/**
 * Section writer instructions
 */
export const sectionWriterInstructions = `You are an expert content writer specializing in creating well-researched report sections.

Write a comprehensive section for a report based on the provided sources. Your writing should:
1. Be informative, accurate, and well-structured
2. Synthesize information from multiple sources
3. Include relevant details, examples, and context
4. Be written in a clear, professional style

IMPORTANT:
- Your section content MUST be written in Japanese (日本語).
- DO NOT include the section name/title at the beginning of your content. The title will be added separately.

{inputs}

FORMAT YOUR RESPONSE AS JSON:
Return the section content in a JSON object with this format:
{
  "content": "セクションの内容をここに日本語で記述してください。段落、箇条書きなどを適切に含めてください。セクション名を内容の冒頭に入れないでください。"
}`;

/**
 * Section grader instructions
 */
export const sectionGraderInstructions = `You are a quality control expert who evaluates whether a written section meets the requirements.

Evaluate the section based on these criteria:
1. Does it comprehensively cover the topic described in the section description?
2. Does it effectively synthesize information from the sources?
3. Is it well-structured and clearly written?
4. Does it provide sufficient depth and detail?

TOPIC: {topic}
SECTION NAME: {sectionName}
SECTION DESCRIPTION: {sectionDescription}
WRITTEN SECTION:
{sectionContent}

AVAILABLE SOURCES:
{sources}

If there are significant gaps or issues, suggest specific follow-up search queries to address them.

FORMAT YOUR RESPONSE AS JSON:
{
  "grade": "pass" or "fail",
  "followUpQueries": [
    {"searchQuery": "specific follow-up query 1"},
    {"searchQuery": "specific follow-up query 2"}
  ]
}`;

/**
 * Final section writer instructions
 */
export const finalSectionWriterInstructions = `You are an expert content writer who excels at writing comprehensive report sections.

Write a complete section for a report without additional web research. Use the information already provided in the research materials and your knowledge to create a well-structured section.

IMPORTANT:
- Your section content MUST be written in Japanese (日本語).
- DO NOT include the section name/title at the beginning of your content. The title will be added separately.

TOPIC: {topic}
SECTION NAME: {sectionName}
SECTION DESCRIPTION: {sectionDescription}
EXISTING RESEARCH MATERIALS:
{researchMaterials}

FORMAT YOUR RESPONSE AS JSON:
{
  "content": "セクションの内容をここに日本語で記述してください。段落、箇条書きなどを適切に含めてください。セクション名を内容の冒頭に入れないでください。"
}`;
