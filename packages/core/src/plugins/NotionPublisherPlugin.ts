import { PublishResult, TVisitor, ToMarkdown } from "@/types";
import { NotionPublisherPluginOption } from "@artipub/shared";
import { Heading } from "mdast";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);
const { Client } = require("@notionhq/client");
const { markdownToBlocks } = require("@tryfabric/martian");

export default function NotionPublisherPlugin(option: NotionPublisherPluginOption) {
  return {
    name: "NotionPublisherPlugin",
    async process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> {
      visit("heading", (_node, _index, parent) => {
        const node = _node as Heading;
        if (parent && node.depth === 1) {
          parent.children.splice(0, (_index ?? 0) + 1);
          return true;
        }
      });

      const { content } = toMarkdown();
      const blocks = markdownToBlocks(content);
      const notion = new Client({ auth: option.api_key });

      async function postArticle() {
        const res = await notion.pages.create({
          parent: {
            type: "page_id",
            page_id: option.page_id,
          },
          properties: {
            title: [
              {
                text: {
                  content: articleTitle,
                },
              },
            ],
          },
          children: blocks,
        });

        if (res.status !== 200) {
          throw new Error(`Failed to publish [${articleTitle}] to Notion!`);
        }
      }

      function updateArticle() {
        //TODO: Implement update article
        throw new Error(`Failed to publish [${articleTitle}] to Notion, The Notion does not support updated articles at this time !`);
      }

      try {
        await (option.update_page_id ? updateArticle() : postArticle());
      } catch (error: any) {
        return {
          success: false,
          info: error,
        };
      }

      const res: PublishResult = {
        success: true,
        info: `Published [${articleTitle}] to Notion successfully!`,
      };
      return res;
    },
  };
}
