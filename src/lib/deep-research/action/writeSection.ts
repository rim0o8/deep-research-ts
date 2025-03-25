import type { AIMessage } from '@langchain/core/messages';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { RunnableConfig } from '@langchain/core/runnables';
import { Command, END } from '@langchain/langgraph';
import { Configuration } from '../configuration';
import { initChatModel } from '../helper/llm';
import { sectionWriterInstructions } from '../prompts';
import { getConfigValue } from '../searchEngine';
import type { SectionState } from '../state';
import { safeJsonParse } from '../util';

/**
 * Write a section based on search results.
 */
export async function writeSection(state: SectionState, config: RunnableConfig) {
  const topic = state.topic;
  const section = state.section;
  const sourceText = state.source_str;

  const configurable = Configuration.fromRunnableConfig(config);

  const systemInstructions = sectionWriterInstructions
    .replace('{topic}', topic)
    .replace('{sectionName}', section.name)
    .replace('{sectionDescription}', section.description);

  const writerProvider = getConfigValue(configurable.writerProvider);
  const writerModelName = getConfigValue(configurable.writerModel);
  const writerModel = initChatModel(writerModelName, writerProvider);

  let contentResult: AIMessage;
  try {
    contentResult = await writerModel.invoke([
      new SystemMessage(systemInstructions),
      new HumanMessage(`Write the "${
        section.name
      }" section based on the sources provided below. Include a JSON field named "content" with your response.

Sources:
${sourceText || 'No sources provided. Generate content based on general knowledge.'}`),
    ]);
  } catch (error) {
    console.error(error);

    const defaultSection = {
      ...section,
      content: `${section.name}に関する情報が見つかりませんでした。`,
    };

    // 既存の完了セクションを維持
    const updatedCompletedSections = [...state.completed_sections, defaultSection];

    return new Command({
      update: {
        section: defaultSection,
        completed_sections: updatedCompletedSections,
      },
      goto: END,
    });
  }

  // Extract the content
  const contentStr =
    typeof contentResult.content === 'string'
      ? contentResult.content
      : JSON.stringify(contentResult.content);

  try {
    const contentData = safeJsonParse<Record<string, unknown> | unknown[]>(contentStr);

    if (contentData === null) {
      const updatedSection = {
        ...section,
        content: contentStr,
      };

      const updatedCompletedSections = [...state.completed_sections, updatedSection];

      return new Command({
        update: {
          section: updatedSection,
          completed_sections: updatedCompletedSections,
        },
        goto: END,
      });
    }

    if (typeof contentData === 'string') {
      const updatedSection = {
        ...section,
        content: contentData,
      };

      const updatedCompletedSections = [...state.completed_sections];
      const existingIndex = updatedCompletedSections.findIndex(
        (s) => s.name.toLowerCase() === section.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        updatedCompletedSections[existingIndex] = updatedSection;
      } else {
        updatedCompletedSections.push(updatedSection);
      }

      return new Command({
        update: {
          section: updatedSection,
          completed_sections: updatedCompletedSections,
        },
        goto: END,
      });
    }

    // JSONオブジェクトの場合
    if (typeof contentData === 'object' && !Array.isArray(contentData)) {
      if (contentData.content && typeof contentData.content === 'string') {
        const updatedSection = {
          ...section,
          content: contentData.content,
        };

        // 既存の完了セクションとマージ
        const updatedCompletedSections = [...state.completed_sections];
        const existingIndex = updatedCompletedSections.findIndex(
          (s) => s.name.toLowerCase() === section.name.toLowerCase()
        );

        if (existingIndex >= 0) {
          updatedCompletedSections[existingIndex] = updatedSection;
        } else {
          updatedCompletedSections.push(updatedSection);
        }

        return new Command({
          update: {
            section: updatedSection,
            completed_sections: updatedCompletedSections,
          },
          goto: END,
        });
      }
    }

    // 配列の場合
    if (Array.isArray(contentData)) {
      // 最初の要素がcontentを持っているか確認
      if (contentData.length > 0 && typeof contentData[0] === 'object' && contentData[0] !== null) {
        const firstItem = contentData[0] as Record<string, unknown>;
        if (firstItem.content && typeof firstItem.content === 'string') {
          const updatedSection = {
            ...section,
            content: firstItem.content,
          };

          // 既存の完了セクションとマージ
          const updatedCompletedSections = [...state.completed_sections];
          const existingIndex = updatedCompletedSections.findIndex(
            (s) => s.name.toLowerCase() === section.name.toLowerCase()
          );

          if (existingIndex >= 0) {
            updatedCompletedSections[existingIndex] = updatedSection;
          } else {
            updatedCompletedSections.push(updatedSection);
          }

          return new Command({
            update: {
              section: updatedSection,
              completed_sections: updatedCompletedSections,
            },
            goto: END,
          });
        }
      }

      // 配列全体を文字列化して使用
      const updatedSection = {
        ...section,
        content: JSON.stringify(contentData, null, 2),
      };

      // 既存の完了セクションとマージ
      const updatedCompletedSections = [...state.completed_sections];
      const existingIndex = updatedCompletedSections.findIndex(
        (s) => s.name.toLowerCase() === section.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        updatedCompletedSections[existingIndex] = updatedSection;
      } else {
        updatedCompletedSections.push(updatedSection);
      }

      return new Command({
        update: {
          section: updatedSection,
          completed_sections: updatedCompletedSections,
        },
        goto: END,
      });
    }

    // それでもコンテンツが見つからない場合は元のテキストを使用
    const updatedSection = {
      ...section,
      content: contentStr,
    };

    // 既存の完了セクションとマージ
    const updatedCompletedSections = [...state.completed_sections];
    const existingIndex = updatedCompletedSections.findIndex(
      (s) => s.name.toLowerCase() === section.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      updatedCompletedSections[existingIndex] = updatedSection;
    } else {
      updatedCompletedSections.push(updatedSection);
    }

    return new Command({
      update: {
        section: updatedSection,
        completed_sections: updatedCompletedSections,
      },
      goto: END,
    });
  } catch (error) {
    console.error(`セクション内容の処理中にエラーが発生: ${error}`);

    // エラー時はデフォルトのメッセージを使用
    const updatedSection = {
      ...section,
      content: `${section.name}に関する情報の処理中にエラーが発生しました。`,
    };

    // 既存の完了セクションとマージ
    const updatedCompletedSections = [...state.completed_sections, updatedSection];

    return new Command({
      update: {
        section: updatedSection,
        completed_sections: updatedCompletedSections,
      },
      goto: END,
    });
  }
}
