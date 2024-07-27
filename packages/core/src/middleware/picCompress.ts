import { ImageExtension, Next, NodeContext, TVisitor } from "@/types";
import { ProcessorContext } from "@/core";
import path from "node:path";
import fs from "node:fs/promises";
import { getCache, getProjectRootPath, normalizedPath, relativePathImgRegex, writeCache } from "@/utils";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);

export default async function picCompress(context: ProcessorContext, visit: TVisitor, next: Next) {
  const { option } = context;
  if (option.compressedOptions?.compressed === false) {
    return next();
  }
  const cachePath = normalizedPath(path.resolve(getProjectRootPath(), ".artipub/cache/compressCache.json"));
  const caches = await getCache(cachePath);
  const matchNodes: NodeContext[] = [];

  visit("image", async (_node, _index, parent) => {
    let { url } = _node as any;
    if (url) {
      matchNodes.push({ node: _node, parent: parent as any });
      url = decodeURIComponent(url);
      const regex = relativePathImgRegex;
      if (regex.test(url)) {
        matchNodes.push({
          node: _node,
          parent: parent,
        });
      }
    }
  });

  async function handle(nodes: NodeContext[]) {
    for (const nodeContext of nodes) {
      const node = nodeContext.node as any;
      const url = decodeURIComponent(node.url);
      if (caches.has(url)) {
        continue;
      }
      if (url) {
        const rootDir = path.resolve(path.dirname(context.filePath));
        const filePath = path.resolve(path.join(rootDir, url));
        let extension: any = path.extname(filePath).slice(1).toLocaleLowerCase();
        if (extension === "jpg") {
          extension = "jpeg";
        }
        try {
          await fs.access(filePath, fs.constants.R_OK);
        } catch {
          continue;
        }
        const buff = await fs.readFile(filePath);
        const sharp = require("sharp");
        const sharpInstance = sharp(buff)[extension as ImageExtension]({
          quality: option.compressedOptions?.quality || 80,
        });
        try {
          await sharpInstance.toFile(filePath);
          caches.set(url, filePath);
          console.log("compress success ! res path:", filePath);
        } catch {
          console.log("compress fail ! res path:", filePath);
        }
      }
    }
  }

  await handle(matchNodes);
  await writeCache(cachePath, caches);
  next();
}
