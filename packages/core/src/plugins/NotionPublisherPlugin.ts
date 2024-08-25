import { PublishResult, TVisitor, ToMarkdown, ExtendsParam, PublisherPlugin } from "@/types";
import { removeTitle } from "@/utils";
import { NotionPublisherPluginOption } from "@artipub/shared";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);
const { Client } = require("@notionhq/client");
const { markdownToBlocks } = require("@tryfabric/martian");

export default function NotionPublisherPlugin(option: NotionPublisherPluginOption): PublisherPlugin {
  let extendsParam: ExtendsParam = {};
  return {
    name: "NotionPublisherPlugin",
    isTraceUpdate: true,
    extendsParam(params: ExtendsParam) {
      extendsParam = params;
      return this;
    },
    async process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> {
      removeTitle(visit);
      const { content } = toMarkdown();
      const article_id = option.update_page_id ?? extendsParam.pid;
      try {
        this.update!(article_id, articleTitle, content);
      } catch (error: any) {
        return {
          pid: article_id,
          success: false,
          info: error,
        };
      }

      const res: PublishResult = {
        pid: article_id,
        success: true,
        info: `Published [${articleTitle}] to Notion successfully!`,
      };
      return res;
    },
    async update(articleId: string | undefined, articleTitle: string, content: string) {
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

        return res;
      }

      async function deleteChildren(childrenIds: string[]) {
        return childrenIds.reduce((pre, cur) => {
          return pre.then(() => notion.blocks.delete({ block_id: cur }));
        }, Promise.resolve());
      }

      async function updateArticle(pageId: string) {
        const childrenResponse = await notion.blocks.children.list({
          block_id: pageId,
          page_size: 100,
        });

        const children = childrenResponse.results;
        const childrenIds = children.map((child: any) => child.id);
        await deleteChildren(childrenIds);

        await notion.blocks.children.append({
          block_id: pageId,
          children: blocks,
        });
      }

      if (articleId) {
        await updateArticle(articleId);
      } else {
        const res = await postArticle();
        if (res.id) {
          articleId = res.id;
        } else {
          throw new Error(`Failed to publish [${articleTitle}] to Notion!`);
        }
      }
    },
  };
}
