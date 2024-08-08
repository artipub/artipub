import { PublishResult, PublisherPlugin, TVisitor, ToMarkdown, ExtendsParam } from "@/types";
import { DevToPublisherPluginOption } from "@artipub/shared";
import { Heading } from "mdast";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);
const axios = require("axios");

export default function DevToPublisherPlugin(option: DevToPublisherPluginOption): PublisherPlugin {
  let extendsParam: ExtendsParam = {};
  return {
    name: "DevToPublisherPlugin",
    extendsParam(params: ExtendsParam) {
      extendsParam = params;
      return this;
    },
    async process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> {
      const tags: string[] = [];

      //Get tags
      visit("list", (_node, index, parent) => {
        const node = _node as any;
        const prevSibling = parent?.children[Number(index) - 1] as any;
        if (prevSibling && prevSibling?.children && prevSibling.children[0].value === "tags:") {
          node.children.forEach((child: any) => {
            tags.push(child.children[0].children[0].value);
          });
          return true;
        }
      });

      //Remove article description part
      visit("heading", (_node, _index, parent) => {
        const node = _node as Heading;
        if (parent && node.depth === 1) {
          parent.children.splice(0, (_index ?? 0) + 1);
          return true;
        }
      });

      const { content } = toMarkdown();

      async function postArticle() {
        return await axios.post(
          "https://dev.to/api/articles",
          {
            article: {
              title: articleTitle,
              body_markdown: content,
              published: option.published,
              series: option.series,
              main_image: option.main_image,
              organization_id: option.organization_id,
              description: option.description ?? articleTitle,
              tags: tags,
            },
          },
          {
            headers: {
              accept: "application/vnd.forem.api-v1+json",
              "Content-Type": "application/json",
              "api-key": option.api_key,
            },
          }
        );
      }

      async function updateArticle(article_id: string) {
        await axios.put(
          `https://dev.to/api/articles/${article_id}`,
          {
            article: {
              title: articleTitle,
              body_markdown: content,
              published: option.published,
              series: option.series,
              main_image: option.main_image,
              organization_id: option.organization_id,
              description: option.description ?? articleTitle,
              tags: tags,
            },
          },
          {
            headers: {
              accept: "application/vnd.forem.api-v1+json",
              "Content-Type": "application/json",
              "api-key": option.api_key,
            },
          }
        );
      }

      let article_id = option.article_id ?? extendsParam.pid;
      try {
        if (article_id) {
          await updateArticle(article_id);
        } else {
          const res = await postArticle();
          if (res.status >= 200 && res.status < 300) {
            article_id = res.data.id;
          } else {
            throw new Error(res?.data?.error);
          }
        }
      } catch (error: any) {
        return {
          pid: article_id,
          success: false,
          info: error.message,
        };
      }
      return {
        pid: article_id,
        success: true,
        info: "Published to Dev.to",
      };
    },
  };
}
