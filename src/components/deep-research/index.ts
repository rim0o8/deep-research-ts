export * from './ErrorDisplay';
export * from './ProgressIndicator';
export * from './ResearchForm';
export * from './ResearchReport';

// Deep Research用の型定義
export interface ResearchParams {
  topic: string;
  depthLevel?: string;
  targetAudience?: string;
  additionalInstructions?: string;
}
