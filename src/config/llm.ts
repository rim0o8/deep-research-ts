import type { LLMConfig } from "@/lib/llm/types";

export const DEFAULT_MODEL = "gpt-4o-2024-08-06";

export const AVAILABLE_MODELS = [
  { 
    id: "gpt-4o-2024-08-06", 
    name: "GPT-4o", 
    description: "OpenAIの最新フラッグシップモデル。テキスト、画像、音声を統合的に処理できるマルチモーダルAI。高速で低コスト。",
    costFactor: 1.1
  },
  { 
    id: "gpt-4o-mini-2024-07-18", 
    name: "GPT-4o Mini", 
    description: "GPT-4oの軽量版。高速で経済的ながら優れた性能を持ち、日常的なタスクに最適。",
    costFactor: 0.5
  },
  { 
    id: "gpt-4-turbo-2024-04-09", 
    name: "GPT-4 Turbo", 
    description: "最新のGPT-4モデルで、複雑な推論や創造的なタスクに最適。最新の知識を持ち、長文の処理も得意。",
    costFactor: 1.0
  },
  { 
    id: "gpt-4", 
    name: "GPT-4", 
    description: "高度な推論能力と正確性を持つモデル。複雑な問題解決や専門的な質問に適しています。",
    costFactor: 0.8
  },
  { 
    id: "gpt-3.5-turbo", 
    name: "GPT-3.5 Turbo", 
    description: "応答速度が速く、一般的な会話や基本的な質問応答に最適。コストパフォーマンスに優れています。",
    costFactor: 0.3
  },
  { 
    id: "deepseek-reasoner", 
    name: "DeepSeek R1", 
    description: "高度な推論能力を持つモデル。数学、コーディング、論理的思考を要するタスクに優れ、OpenAI o1と同等の性能。",
    costFactor: 0.2
  },
  { 
    id: "deepseek-chat", 
    name: "DeepSeek V3", 
    description: "バランスの取れた汎用モデル。日常会話から専門的な質問まで幅広く対応し、コストパフォーマンスに優れています。",
    costFactor: 0.1
  },
  { 
    id: "claude-3-7-sonnet-20250219", 
    name: "Claude 3.7 Sonnet", 
    description: "Anthropicの最新モデル。拡張思考モードを備え、コーディングと推論能力が大幅に向上。複雑なタスクに最適。",
    costFactor: 1.2
  },
  { 
    id: "claude-3-5-sonnet-20241022", 
    name: "Claude 3.5 Sonnet", 
    description: "高度な推論能力とコーディングスキルを持ち、視覚処理も強化。Claude 3 Opusの2倍の速度で動作します。",
    costFactor: 1.0
  },
  { 
    id: "claude-3-opus-20240229", 
    name: "Claude 3 Opus", 
    description: "複雑な分析や詳細な説明が必要なタスクに最適で、高い正確性を誇ります。",
    costFactor: 1.1
  },
  { 
    id: "claude-3-sonnet-20240229", 
    name: "Claude 3 Sonnet", 
    description: "性能とスピードのバランスが取れたモデル。ビジネス利用や中程度の複雑さのタスクに適しています。",
    costFactor: 0.7
  },
  { 
    id: "claude-3-haiku-20240307", 
    name: "Claude 3 Haiku", 
    description: "高速で軽量なモデル。日常会話や簡単な質問応答、リアルタイム対話に最適です。",
    costFactor: 0.2
  },
] as const;

export const DEFAULT_CONFIG: LLMConfig = {
  model: DEFAULT_MODEL,
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
};

// モデルプロバイダーの識別
export const MODEL_PROVIDERS = {
  GPT: [
    'gpt-4o-2024-08-06',
    'gpt-4o-mini-2024-07-18',
    'gpt-4-turbo-2024-04-09',
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo'
  ],
  CLAUDE: [
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229', 
    'claude-3-sonnet-20240229', 
    'claude-3-haiku-20240307'
  ],
  DEEPSEEK: [
    'deepseek-reasoner',
    'deepseek-chat'
  ]
} as const;

export type ModelProvider = 'openai' | 'anthropic' | 'deepseek';

export const getModelProvider = (modelId: string): ModelProvider => {
  if ((MODEL_PROVIDERS.GPT as readonly string[]).includes(modelId)) return 'openai';
  if ((MODEL_PROVIDERS.CLAUDE as readonly string[]).includes(modelId)) return 'anthropic';
  if ((MODEL_PROVIDERS.DEEPSEEK as readonly string[]).includes(modelId)) return 'deepseek';
  return 'openai'; // デフォルト
};

export const SYSTEM_PROMPTS = {
  default: "あなたは親切で丁寧なアシスタントです。",
  technical: "あなたは技術的な質問に詳しい専門家アシスタントです。",
  business: "あなたはビジネスの課題解決を支援する専門家アシスタントです。",
} as const;

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.openai.com/v1",
  timeout: 30000,
} as const; 