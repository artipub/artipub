import { PublishResult, PublisherPlugin, TVisitor, ToMarkdown, ExtendsParam } from "@/types";
import { pickTagNode, removeArticleDescPart } from "@/utils";
import { DevToPublisherPluginOption } from "@artipub/shared";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);
const axios = require("axios");

export default function DevToPublisherPlugin(option: DevToPublisherPluginOption): PublisherPlugin {
  let extendsParam: ExtendsParam = {};
  let tags: string[] = [];
  return {
    name: "DevToPublisherPlugin",
    isTraceUpdate: true,
    extendsParam(params: ExtendsParam) {
      extendsParam = params;
      return this;
    },
    async process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> {
      tags = pickTagNode(visit);
      removeArticleDescPart(visit);

      const { content } = toMarkdown();
      const article_id = option.article_id ?? extendsParam.pid;
      try {
        await this.update!(article_id, articleTitle, content);
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
    async update(article_id: string | undefined, articleTitle: string, content: string) {
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
    },
  };
}
