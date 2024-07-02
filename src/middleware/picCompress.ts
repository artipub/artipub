import { ImageExtension, Next, NodeContext, TVisitor } from "@/types";
import { ProcessorContext } from "@/core";
import path from "path";
import fs from "fs/promises";
import {
  getCache,
  getProjectRootPath,
  normalizedPath,
  relativePathImgRegex,
  writeCache,
} from "@/utils";
const sharp = require("sharp");

export default async function picCompress(
  context: ProcessorContext,
  visit: TVisitor,
  next: Next
) {
  const { option } = context;
  if (option.compressedOptions?.compressed === false) {
    return next();
  }
  const cachePath = normalizedPath(
    path.resolve(getProjectRootPath(), ".artipub/cache/compressCache.json")
  );
  let caches = await getCache(cachePath);
  let matchNodes: NodeContext[] = [];

  visit("image", async (_node, _index, parent) => {
    let { url } = _node as any;
    if (url) {
      matchNodes.push({ node: _node, parent: parent as any });
      url = decodeURIComponent(url);
      let regex = relativePathImgRegex;
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
      let node = nodeContext.node as any;
      let url = decodeURIComponent(node.url);
      if (caches.has(url)) {
        continue;
      }
      if (url) {
        let rootDir = path.resolve(path.dirname(context.filePath));
        let filePath = path.resolve(path.join(rootDir, url));
        let extension: any = path
          .extname(filePath)
          .slice(1)
          .toLocaleLowerCase();
        if (extension === "jpg") {
          extension = "jpeg";
        }
        try {
          await fs.access(filePath, fs.constants.R_OK);
        } catch (error) {
          continue;
        }
        let buff = await fs.readFile(filePath);
        let sharpInstance = sharp(buff)[extension as ImageExtension]({
          quality: option.compressedOptions?.quality || 80,
        });
        try {
          await sharpInstance.toFile(filePath);
          caches.set(url, filePath);
          console.log("compress success ! res path:", filePath);
        } catch (error) {
          console.log("compress fail ! res path:", filePath);
        }
      }
    }
  }

  await handle(matchNodes);
  await writeCache(cachePath, caches);
  next();
}
