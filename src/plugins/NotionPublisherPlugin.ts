import { NotionPublisherPluginOption, PublishResult, TVisitor, ToMarkdown } from "@/types";
import { Heading } from "mdast";
const { Client } = require("@notionhq/client");
const { markdownToBlocks } = require("@tryfabric/martian");

export function NotionPublisherPlugin(option: NotionPublisherPluginOption) {
  return async (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> => {
    visit("heading", (_node, _index, parent) => {
      let node = _node as Heading;
      if (parent && node.depth === 1) {
        parent.children.splice(0, (_index ?? 0) + 1);
        return true;
      }
    });

    let { content } = toMarkdown();
    const blocks = markdownToBlocks(content);
    const notion = new Client({ auth: option.api_key });
    await notion.pages.create({
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

    let res: PublishResult = {
      success: true,
      info: `Published [${articleTitle}] to Notion successfully!`,
    };
    return res;
  };
}
