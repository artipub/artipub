import { PublishResult, ToMarkdown, TVisitor, ExtendsParam, PublisherPlugin } from "@/types";
import { NativePublisherOption } from "@artipub/shared";
import path from "node:path";
import fs from "node:fs/promises";
import { replaceImgUrlToCDN } from "@/utils";

export default function NativePublisherPlugin(options: NativePublisherOption): PublisherPlugin {
  let { cdn_prefix, res_domain } = options;
  const { destination_path } = options;
  if (!cdn_prefix) {
    cdn_prefix = "https://cdn.jsdelivr.net/gh";
  }
  if (!res_domain) {
    res_domain = "raw.githubusercontent.com";
  }
  let extendsParam: ExtendsParam = {};
  return {
    name: "NativePublisherPlugin",
    extendsParam(params: ExtendsParam) {
      extendsParam = params;
      return this;
    },
    async process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> {
      replaceImgUrlToCDN(visit, cdn_prefix, res_domain);
      const { content } = toMarkdown();
      const targetPath = path.join(destination_path, `${articleTitle}.md`);
      await fs.writeFile(targetPath, content, { encoding: "utf8" });

      return {
        success: true,
        info: `Published [${articleTitle}] to Blog successfully!`,
      };
    },
  };
}
