import JSON5 from 'json5';
import type { Section } from './state';
/**
 * format sections to json string
 * @param sections sections array
 * @returns formatted json string
 */
export function formatSections(sections: Section[]): string {
  return JSON.stringify(sections, null, 2);
}

const findBalancedBrackets = (
  text: string,
  startIdx: number,
  openChar: string,
  closeChar: string
): [number, number] | null => {
  let depth = 0;

  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === openChar) {
      depth++;
    } else if (text[i] === closeChar) {
      depth--;
      if (depth === 0) {
        return [startIdx, i];
      }
      if (depth < 0) {
        return null;
      }
    }
  }

  return null;
};

const extractJsonContent = (input: string): string => {
  const firstObjectStartIdx = input.indexOf('{');
  const firstArrayStartIdx = input.indexOf('[');

  if (firstObjectStartIdx === -1 && firstArrayStartIdx === -1) {
    throw new Error('Invalid JSON structure');
  }

  let bracketType: '{' | '[' = '{';
  let startPos = firstObjectStartIdx;

  if (
    firstArrayStartIdx !== -1 &&
    (firstObjectStartIdx === -1 || firstArrayStartIdx < firstObjectStartIdx)
  ) {
    bracketType = '[';
    startPos = firstArrayStartIdx;
  }

  const closeBracket = bracketType === '{' ? '}' : ']';
  const result = findBalancedBrackets(input, startPos, bracketType, closeBracket);

  if (result) {
    const [start, end] = result;
    const extracted = input.substring(start, end + 1);
    return extracted;
  }
  throw new Error('failed to extract/parse json');
};

/**
 * safe json parse
 *
 * @param contentStr - json string
 * @returns parsed object or null
 */
export function safeJsonParse<T>(contentStr: string): T | null {
  const extractedJson = extractJsonContent(contentStr);

  const parsedData = JSON5.parse(extractedJson);
  return parsedData as T;
}
