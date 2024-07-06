import { DevToPublisherPluginOption, PublishResult, TVisitor, ToMarkdown } from "@/types";
import { Heading } from "mdast";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);
const axios = require("axios");

export function DevToPublisherPlugin(option: DevToPublisherPluginOption) {
  return async (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> => {
    let tags: string[] = [];

    //Get tags
    visit("list", (_node, index, parent) => {
      let node = _node as any;
      let prevSibling = parent?.children[Number(index) - 1] as any;
      if (prevSibling && prevSibling?.children && prevSibling.children[0].value === "tags:") {
        node.children.forEach((child: any) => {
          tags.push(child.children[0].children[0].value);
        });
        return true;
      }
    });

    //Remove article description part
    visit("heading", (_node, _index, parent) => {
      let node = _node as Heading;
      if (parent && node.depth === 1) {
        parent.children.splice(0, (_index ?? 0) + 1);
        return true;
      }
    });

    let { content } = toMarkdown();
    try {
      const response = await axios.post(
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
    } catch (error: any) {
      return {
        success: false,
        info: error.error,
      };
    }
    let res: PublishResult = {
      success: true,
      info: "Published to Dev.to",
    };
    return res;
  };
}
