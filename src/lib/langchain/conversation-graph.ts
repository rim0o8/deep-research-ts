import { DEFAULT_CONFIG } from '@/config/llm';
import { getLangfuse } from '@/lib/langfuse';
import { Config } from '@/utils/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatOpenAI } from '@langchain/openai';

// 型定義
export type MessageContent =
  | string
  | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
};

export interface ConversationState {
  messages: Message[];
  modelConfig: {
    model: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
  metadata: {
    userId: string;
    userEmail: string;
    conversationId: string;
  };
}

// LLMモデルの取得
function getLLMModel(modelName: string) {
  // モデル名からプロバイダーを判断
  if (modelName.includes('claude')) {
    // Claude モデルの場合
    return new ChatAnthropic({
      modelName: modelName,
      temperature: DEFAULT_CONFIG.temperature,
      maxTokens: DEFAULT_CONFIG.maxTokens,
      topP: DEFAULT_CONFIG.topP,
      apiKey: Config.ANTHROPIC_API_KEY,
      streaming: true,
    });
  }

  if (modelName.includes('deepseek')) {
    return new ChatDeepSeek({
      modelName: modelName,
      temperature: DEFAULT_CONFIG.temperature,
      maxTokens: DEFAULT_CONFIG.maxTokens,
      topP: DEFAULT_CONFIG.topP,
      apiKey: Config.DEEPSEEK_API_KEY,
      streaming: true,
    });
  }

  // デフォルトはOpenAI
  return new ChatOpenAI({
    modelName: modelName,
    temperature: DEFAULT_CONFIG.temperature,
    maxTokens: DEFAULT_CONFIG.maxTokens,
    topP: DEFAULT_CONFIG.topP,
    apiKey: Config.OPENAI_API_KEY,
    streaming: true,
  });
}

// メッセージをLangChainフォーマットに変換
function convertToLangChainMessages(messages: Message[]) {
  return messages.map((msg) => {
    const content = msg.content;
    if (msg.role === 'user') {
      return new HumanMessage({ content });
    }
    if (msg.role === 'assistant') {
      return new AIMessage({ content });
    }
    return new SystemMessage({ content });
  });
}

// LangChainメッセージを標準フォーマットに変換
function convertFromLangChainMessage(message: AIMessage): Message {
  return {
    role: 'assistant',
    content: message.content as MessageContent,
  };
}

// 会話ノード
async function conversationNode(state: ConversationState): Promise<ConversationState> {
  const { messages, modelConfig, metadata } = state;

  // Langfuseのトレースを開始
  const langfuse = getLangfuse();
  const trace = langfuse.trace({
    name: 'conversation',
    userId: metadata.userId,
    sessionId: metadata.conversationId,
    metadata: {
      model: modelConfig.model,
      messageCount: messages.length,
      userEmail: metadata.userEmail,
      conversationId: metadata.conversationId,
    },
  });

  // LLMモデルを取得
  const llm = getLLMModel(modelConfig.model);

  // Langfuseでジェネレーションを記録
  const generation = trace.generation({
    name: 'langchain-generation',
    model: modelConfig.model,
    modelParameters: {
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
      topP: modelConfig.topP,
    },
    input: JSON.stringify(messages),
    metadata: {
      conversationId: metadata.conversationId,
      userEmail: metadata.userEmail,
    },
  });

  // プロンプトテンプレートを作成
  const prompt = ChatPromptTemplate.fromMessages([new MessagesPlaceholder('messages')]);

  // チェーンを作成 - 別の方法でチェーンを構築
  const langchainMessages = convertToLangChainMessages(messages);
  const promptMessages = await prompt.invoke({ messages: langchainMessages });
  const result = await llm.invoke(promptMessages);

  // 結果をメッセージに追加
  const newMessage = convertFromLangChainMessage(result);
  const updatedMessages = [...messages, newMessage];

  // Langfuseでジェネレーションを完了
  generation.end({
    output: newMessage.content,
  });

  // バックグラウンドでフラッシュ
  langfuse.flushAsync().catch((err) => {
    console.error('Langfuseフラッシュエラー:', err);
  });

  return {
    ...state,
    messages: updatedMessages,
  };
}

// 会話グラフを作成
export function createConversationGraph() {
  return {
    async invoke(state: ConversationState) {
      return await conversationNode(state);
    },
  };
}

// ストリーミング用の会話グラフを作成
export async function createStreamingConversationGraph() {
  return {
    async invoke(state: ConversationState) {
      // Langfuseのトレースを開始
      const langfuse = getLangfuse();
      const trace = langfuse.trace({
        name: 'streaming-conversation',
        userId: state.metadata.userId,
        sessionId: state.metadata.conversationId,
        metadata: {
          model: state.modelConfig.model,
          messageCount: state.messages.length,
          userEmail: state.metadata.userEmail,
          conversationId: state.metadata.conversationId,
        },
      });

      // Langfuseでジェネレーションを記録
      const generation = trace.generation({
        name: 'streaming-generation',
        model: state.modelConfig.model,
        modelParameters: {
          temperature: state.modelConfig.temperature,
          maxTokens: state.modelConfig.maxTokens,
          topP: state.modelConfig.topP,
        },
        input: JSON.stringify(state.messages),
        metadata: {
          conversationId: state.metadata.conversationId,
          userEmail: state.metadata.userEmail,
        },
      });

      // LLMモデルを取得
      const llm = getLLMModel(state.modelConfig.model);

      // プロンプトテンプレートを作成
      const prompt = ChatPromptTemplate.fromMessages([new MessagesPlaceholder('messages')]);

      // チェーンを作成 - ストリーミング用の別のアプローチ
      const langchainMessages = convertToLangChainMessages(state.messages);
      const promptMessages = await prompt.invoke({ messages: langchainMessages });
      const stream = await llm.stream(promptMessages);

      // AsyncGeneratorを返す
      async function* generateStream() {
        let currentContent = '';

        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              currentContent += chunk.content;

              // 現在の状態のコピーを作成
              const updatedState = { ...state };

              // 最後のメッセージを更新または追加
              const newMessage: Message = {
                role: 'assistant',
                content: currentContent,
              };

              // 更新された状態を返す
              updatedState.messages = [...state.messages, newMessage];
              yield updatedState;
            }
          }

          // Langfuseでジェネレーションを完了
          generation.end({
            output: currentContent,
          });

          // バックグラウンドでフラッシュ
          langfuse.flushAsync().catch((err) => {
            console.error('Langfuseフラッシュエラー:', err);
          });
        } catch (error) {
          console.error('ストリーミングエラー:', error);

          // エラー情報をLangfuseに記録
          generation.end({
            output: currentContent,
          });

          // バックグラウンドでフラッシュ
          langfuse.flushAsync().catch((err) => {
            console.error('Langfuseフラッシュエラー:', err);
          });

          throw error;
        }
      }

      return generateStream();
    },
  };
}
