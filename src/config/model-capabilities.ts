export interface ModelCapability {
  supportsImages: boolean;
  supportsVision: boolean;
  supportsAudio: boolean;
  maxInputTokens: number;
  maxOutputTokens: number;
  contextWindow: number;
}

export type ModelCapabilities = {
  [modelId: string]: ModelCapability;
};

// モデルの機能を定義
export const MODEL_CAPABILITIES: ModelCapabilities = {
  // OpenAI モデル
  "gpt-4o-2024-08-06": {
    supportsImages: true,
    supportsVision: true,
    supportsAudio: false,
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    contextWindow: 128000
  },
  "gpt-4o-mini-2024-07-18": {
    supportsImages: true,
    supportsVision: true,
    supportsAudio: false,
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    contextWindow: 128000
  },
  "gpt-4-turbo-2024-04-09": {
    supportsImages: true,
    supportsVision: true,
    supportsAudio: false,
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    contextWindow: 128000
  },
  "gpt-4": {
    supportsImages: false,
    supportsVision: false,
    supportsAudio: false,
    maxInputTokens: 8192,
    maxOutputTokens: 4096,
    contextWindow: 8192
  },
  "gpt-3.5-turbo": {
    supportsImages: false,
    supportsVision: false,
    supportsAudio: false,
    maxInputTokens: 16385,
    maxOutputTokens: 4096,
    contextWindow: 16385
  },
  
  // Claude モデル
  "claude-3-7-sonnet-20250219": {
    supportsImages: true,
    supportsVision: true,
    supportsAudio: false,
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
    contextWindow: 200000
  },
  "claude-3-5-sonnet-20241022": {
    supportsImages: true,
    supportsVision: true,
    supportsAudio: false,
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
    contextWindow: 200000
  },
  "claude-3-opus-20240229": {
    supportsImages: true,
    supportsVision: true,
    supportsAudio: false,
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
    contextWindow: 200000
  },
  "claude-3-sonnet-20240229": {
    supportsImages: true,
    supportsVision: true,
    supportsAudio: false,
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
    contextWindow: 200000
  },
  "claude-3-haiku-20240307": {
    supportsImages: true,
    supportsVision: true,
    supportsAudio: false,
    maxInputTokens: 200000,
    maxOutputTokens: 4096,
    contextWindow: 200000
  },
  
  // DeepSeek モデル
  "deepseek-reasoner": {
    supportsImages: false,
    supportsVision: false,
    supportsAudio: false,
    maxInputTokens: 32768,
    maxOutputTokens: 4096,
    contextWindow: 32768
  },
  "deepseek-chat": {
    supportsImages: false,
    supportsVision: false,
    supportsAudio: false,
    maxInputTokens: 32768,
    maxOutputTokens: 4096,
    contextWindow: 32768
  }
};

/**
 * モデルのメタデータを取得する関数
 * @param modelId モデルID
 * @returns モデルの機能情報、存在しない場合はデフォルト値
 */
export function getModelCapabilities(modelId: string): ModelCapability {
  return MODEL_CAPABILITIES[modelId] || {
    supportsImages: false,
    supportsVision: false,
    supportsAudio: false,
    maxInputTokens: 8192,
    maxOutputTokens: 4096,
    contextWindow: 8192
  };
}

/**
 * モデルが画像入力をサポートしているかを確認する関数
 * @param modelId モデルID
 * @returns 画像入力をサポートしている場合はtrue
 */
export function supportsImageInput(modelId: string): boolean {
  return getModelCapabilities(modelId).supportsImages;
} 