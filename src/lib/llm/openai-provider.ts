import OpenAI from 'openai';
import type { LLMConfig, LLMProvider, Message } from './types';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    
    if (!key) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    this.client = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: process.env.NODE_ENV !== 'production',
    });
  }

  async sendMessage(messages: Message[], config: LLMConfig = { model: 'gpt-4o' }): Promise<Message> {
    try {
      const chatMessages = messages.map(msg => {
        const role = msg.role as "system" | "user" | "assistant";
        return {
          role,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        };
      });

      const response = await this.client.chat.completions.create({
        model: config.model,
        messages: chatMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2000,
        top_p: config.topP ?? 1,
      });

      return {
        role: 'assistant',
        content: response.choices[0]?.message.content || '',
      };
    } catch (error) {
      console.error('OpenAI API エラー:', error);
      throw new Error('メッセージの生成に失敗しました');
    }
  }

  async *streamMessage(messages: Message[], config: LLMConfig = { model: 'gpt-4o' }): AsyncGenerator<Message> {
    try {
      const chatMessages = messages.map(msg => {
        const role = msg.role as "system" | "user" | "assistant";
        return {
          role,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        };
      });

      const stream = await this.client.chat.completions.create({
        model: config.model,
        messages: chatMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2000,
        top_p: config.topP ?? 1,
        stream: true,
      });

      let accumulatedContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        accumulatedContent += content;
        
        yield {
          role: 'assistant',
          content: accumulatedContent,
        };
      }
    } catch (error) {
      console.error('OpenAI API ストリームエラー:', error);
      throw new Error('ストリーミングメッセージの生成に失敗しました');
    }
  }
} 