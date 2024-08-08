import { ArticleProcessor, PublisherManager, publisherPlugins } from "@artipub/core";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env;
const { DEV_TO_API_KEY } = process.env;
const { GITHUB_OWNER, GITHUB_REPO, GITHUB_DIR, GITHUB_BRANCH, GITHUB_TOKEN, GITHUB_COMMIT_AUTHOR, GITHUB_COMMIT_EMAIL } = process.env;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化文章处理器和发布管理器
const articleProcessor = new ArticleProcessor({
  uploadImgOption: {
    owner: GITHUB_OWNER ?? "",
    repo: GITHUB_REPO ?? "",
    dir: GITHUB_DIR ?? "",
    branch: GITHUB_BRANCH ?? "",
    token: GITHUB_TOKEN ?? "",
    commit_author: GITHUB_COMMIT_AUTHOR ?? "",
    commit_email: GITHUB_COMMIT_EMAIL ?? "",
  },
});

articleProcessor.processMarkdown(path.resolve(__dirname, "../doc/xxx.md")).then(async ({ content }) => {
  const publisherManager = new PublisherManager(content);
  publisherManager.addPlugin(
    publisherPlugins.notion({
      api_key: NOTION_API_KEY ?? "",
      page_id: NOTION_PAGE_ID ?? "",
    })
  );
  publisherManager.addPlugin(
    DevToPublisherPlugin({
      api_key: DEV_TO_API_KEY ?? "",
      published: false,
    })
  );
  const res = await publisherManager.publish();
  console.log("publish res:", res);
});
