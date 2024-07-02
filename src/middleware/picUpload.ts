import { GithubPicBedOption, Next, NodeContext, TVisitor, UploadImg } from "@/types";
import { ProcessorContext } from "@/core";
import path from "path";
import fs from "fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { getCache, getProjectRootPath, isFunction, log, normalizedPath, relativePathImgRegex, writeCache } from "@/utils";

const axios = require("axios");

async function uploadToGithub(filePath: string, picBedOption: GithubPicBedOption) {
  let extension = path.extname(filePath);
  let content = await fs.readFile(filePath);
  let contentBase64 = content.toString("base64");
  let fileName = Date.now();
  let githubPath = `${picBedOption.dir}/${fileName}${extension}`;

  let commitData = JSON.stringify({
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
  let caches = await getCache(cachePath);
  let matchNodes: NodeContext[] = [];

  visit("image", async (_node, _index, parent) => {
    let node = _node as any;
    if (node.url) {
      let url = decodeURIComponent(node.url);
      let regex = relativePathImgRegex;
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
      let node = nodeContext.node as any;
      let url = decodeURIComponent(node.url);
      if (url) {
        if (caches.has(url)) {
          node.url = caches.get(url);
          continue;
        }
        let regex = relativePathImgRegex;
        if (regex.test(url)) {
          let rootDir = path.resolve(path.dirname(context.filePath));
          let filePath = path.resolve(path.join(rootDir, url));
          try {
            await fs.access(filePath, fs.constants.R_OK);
          } catch (error) {
            log.error(`upload image fail filePath:${filePath},error:${error}`);
            continue;
          }
          let res: string | null = null;
          if (isFunction(uploadImgOption)) {
            res = await (uploadImgOption as UploadImg)(filePath);
          } else {
            res = await uploadToGithub(filePath, picBedOption);
          }
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
