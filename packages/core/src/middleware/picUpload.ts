import { GithubPicBedOption, Next, NodeContext, TVisitor, UploadImg } from "@/lib/types";
import { ProcessorContext } from "@/lib/core";
import path from "node:path";
import fs from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { getCache, getProjectRootPath, isFunction, log, normalizedPath, relativePathImgRegex, writeCache } from "@/lib/utils";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);
const axios = require("axios");

async function uploadToGithub(filePath: string, picBedOption: GithubPicBedOption) {
  const extension = path.extname(filePath);
  const content = await fs.readFile(filePath);
  const contentBase64 = content.toString("base64");
  const fileName = Date.now();
  const githubPath = `${picBedOption.dir}/${fileName}${extension}`;

  const commitData = JSON.stringify({
    message: "commit image",
    committer: {
      name: picBedOption.commit_author,
      email: picBedOption.commit_email,
    },
    content: contentBase64,
  });

  const type = await fileTypeFromBuffer(content);
  const config = {
    method: "put",
    url: `https://api.github.com/repos/${picBedOption.owner}/${picBedOption.repo}/contents/${githubPath}`,
    headers: {
      Authorization: `Bearer ${picBedOption.token}`,
      "Content-Type": type?.mime,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github+json",
    },
    data: commitData,
  };

  try {
    const response = await axios(config);
    if (response.status == 201) {
      return response.data.content.download_url;
    }
  } catch (error) {
    log.error("upload a image fail !", error);
  }
  return null;
}

export default async function picUpload(context: ProcessorContext, visit: TVisitor, next: Next) {
  const {
    option: { uploadImgOption },
  } = context;
  const picBedOption = uploadImgOption as GithubPicBedOption;
  const cachePath = normalizedPath(path.resolve(getProjectRootPath(), ".artipub/cache/uploadCache.json"));
  const caches = await getCache(cachePath);
  const matchNodes: NodeContext[] = [];

  visit("image", async (_node, _index, parent) => {
    const node = _node as any;
    if (node.url) {
      const url = decodeURIComponent(node.url);
      const regex = relativePathImgRegex;
      if (regex.test(url)) {
        matchNodes.push({
          node,
          parent,
        });
      }
    }
  });

  async function handle(nodes: NodeContext[]) {
    for (const nodeContext of nodes) {
      const node = nodeContext.node as any;
      const url = decodeURIComponent(node.url);
      if (url) {
        if (caches.has(url)) {
          node.url = caches.get(url);
          continue;
        }
        const regex = relativePathImgRegex;
        if (regex.test(url)) {
          const rootDir = path.resolve(path.dirname(context.filePath));
          const filePath = path.resolve(path.join(rootDir, url));
          try {
            await fs.access(filePath, fs.constants.R_OK);
          } catch (error) {
            log.error(`upload image fail filePath:${filePath},error:${error}`);
            continue;
          }
          let res: string | null = null;
          res = await (isFunction(uploadImgOption) ? (uploadImgOption as UploadImg)(filePath) : uploadToGithub(filePath, picBedOption));
          if (res) {
            node.url = res;
            caches.set(url, res);
          } else {
            log.error("upload image fail", filePath);
          }
        }
      }
    }
  }

  await handle(matchNodes);
  await writeCache(cachePath, caches);
  next();
}
