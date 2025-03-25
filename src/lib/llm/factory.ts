import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import type { LLMProvider } from './types';

// サポートされるモデルとそのプロバイダー
const MODEL_PROVIDERS = {
  // OpenAIモデル
  'gpt-4o': 'openai',
  'gpt-4-turbo': 'openai',
  'gpt-4': 'openai',
  'gpt-3.5-turbo': 'openai',

  // Anthropicモデル
  'claude-3-opus-20240229': 'anthropic',
  'claude-3-sonnet-20240229': 'anthropic',
  'claude-3-haiku-20240307': 'anthropic',
} as const;

export type SupportedModel = keyof typeof MODEL_PROVIDERS;

/**
 * モデル名からプロバイダータイプを取得
 */
function getProviderType(model: string): 'openai' | 'anthropic' | 'unknown' {
  return (MODEL_PROVIDERS as Record<string, string>)[model] as 'openai' | 'anthropic' | 'unknown' || 'unknown';
}

/**
 * モデル名に基づいて適切なLLMプロバイダーを作成
 */
export function createLLMProvider(model: string, apiKey?: string): LLMProvider {
  const providerType = getProviderType(model);
  
  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'anthropic':
      return new ClaudeProvider(apiKey);
    default:
      throw new Error(`サポートされていないモデル: ${model}`);
  }
}

/**
 * サポートされているモデルの一覧を返す
 */
export function getSupportedModels(): { id: string; name: string; provider: string }[] {
  return [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  ];
} 