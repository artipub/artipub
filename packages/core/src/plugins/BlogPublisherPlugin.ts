import { PublishResult, ToMarkdown, TVisitor } from "@/types";
import { NativeBlogOption } from "@artipub/shared";
import path from "node:path";
import fs from "node:fs/promises";

export function BlogPublisherPlugin(options: NativeBlogOption) {
  let { cdn_prefix, res_domain } = options;
  const { destination_path } = options;
  if (!cdn_prefix) {
    cdn_prefix = "https://cdn.jsdelivr.net/gh";
  }
  if (!res_domain) {
    res_domain = "raw.githubusercontent.com";
  }
  return async function (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> {
    const regex = new RegExp(`/https://(${res_domain})/(.*?)/(.*?)/(.*?)(.png|.jpg|jpeg|svg|jif)`, "im");
    visit("image", (node: any) => {
      if (node.url && regex.test(node.url)) {
        regex.lastIndex = 0;
        const match = regex.exec(node.url);
        const [, , p3, p4, p5, p6] = match as string[];
        const cdnUrl = `${cdn_prefix}/${p3}/${p4}@${p5}${p6}`;
        node.url = cdnUrl;
      }
    });
    const { content } = toMarkdown();
    const targetPath = path.join(destination_path, `${articleTitle}.md`);
    await fs.writeFile(targetPath, content, { encoding: "utf8" });
    return {
      success: true,
      info: `Published [${articleTitle}] to Blog successfully!`,
    };
  };
}
