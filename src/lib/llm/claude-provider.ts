import Anthropic from '@anthropic-ai/sdk';
import type { LLMConfig, LLMProvider, Message } from './types';

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    
    if (!key) {
      throw new Error('Anthropic APIキーが設定されていません');
    }

    this.client = new Anthropic({
      apiKey: key,
    });
  }

  async sendMessage(messages: Message[], config: LLMConfig = { model: 'claude-3-opus-20240229' }): Promise<Message> {
    try {
      // システムメッセージとその他のメッセージを分離
      const systemMessages = messages.filter(m => m.role === 'system');
      const nonSystemMessages = messages.filter(m => m.role !== 'system');
      
      // システムメッセージを結合
      const systemPrompt = systemMessages.length > 0
        ? systemMessages.map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content)).join('\n')
        : undefined;

      // ユーザーとアシスタントのメッセージを変換
      const convertedMessages = nonSystemMessages.map(msg => {
        const role = msg.role === 'user' ? 'user' as const : 'assistant' as const;
        return {
          role,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        };
      });

      const response = await this.client.messages.create({
        model: config.model,
        messages: convertedMessages,
        system: systemPrompt,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2000,
        top_p: config.topP ?? 1,
      });

      return {
        role: 'assistant',
        content: response.content.filter(c => c.type === 'text').map(c => c.text).join(''),
      };
    } catch (error) {
      console.error('Claude API エラー:', error);
      throw new Error('メッセージの生成に失敗しました');
    }
  }

  async *streamMessage(messages: Message[], config: LLMConfig = { model: 'claude-3-opus-20240229' }): AsyncGenerator<Message> {
    try {
      // システムメッセージとその他のメッセージを分離
      const systemMessages = messages.filter(m => m.role === 'system');
      const nonSystemMessages = messages.filter(m => m.role !== 'system');
      
      // システムメッセージを結合
      const systemPrompt = systemMessages.length > 0
        ? systemMessages.map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content)).join('\n')
        : undefined;

      // ユーザーとアシスタントのメッセージを変換
      const convertedMessages = nonSystemMessages.map(msg => {
        const role = msg.role === 'user' ? 'user' as const : 'assistant' as const;
        return {
          role,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        };
      });

      const stream = await this.client.messages.create({
        model: config.model,
        messages: convertedMessages,
        system: systemPrompt,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2000,
        top_p: config.topP ?? 1,
        stream: true,
      });

      let accumulatedContent = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          accumulatedContent += chunk.delta.text;
          
          yield {
            role: 'assistant',
            content: accumulatedContent,
          };
        }
      }
    } catch (error) {
      console.error('Claude API ストリームエラー:', error);
      throw new Error('ストリーミングメッセージの生成に失敗しました');
    }
  }
} 