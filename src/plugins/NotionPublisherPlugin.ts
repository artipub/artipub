import { NotionPublisherPluginOption, PublishResult } from "@/types";
import path from "path";
const { Client } = require("@notionhq/client");
const { markdownToBlocks } = require("@tryfabric/martian");

export function NotionPublisherPlugin(option: NotionPublisherPluginOption) {
  return async (filePath: string, content: string): Promise<PublishResult> => {
    const articleName = path.basename(filePath);
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
              content: articleName,
            },
          },
        ],
      },
      children: blocks,
    });

    let res: PublishResult = {
      success: true,
      info: "Published to Notion successfully!",
    };
    return res;
  };
}
