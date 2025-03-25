import { Config } from '@/utils/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatOpenAI } from '@langchain/openai';

/**
 * init chat model
 *
 * @param model - model name
 * @param modelProvider - model provider (anthropic, deepseek, openai etc.)
 * @returns initialized chat model
 */
export function initChatModel(model: string, modelProvider: string) {
  console.log(`initialize model: provider=${modelProvider}, model=${model}`);
  switch (modelProvider.toLowerCase()) {
    case 'anthropic':
      return new ChatAnthropic({
        modelName: model,
        apiKey: Config.ANTHROPIC_API_KEY,
      });
    case 'deepseek':
      return new ChatDeepSeek({
        modelName: model,
        apiKey: Config.DEEPSEEK_API_KEY,
      });
    default:
      return new ChatOpenAI({
        modelName: model,
        apiKey: Config.OPENAI_API_KEY,
      });
  }
}
