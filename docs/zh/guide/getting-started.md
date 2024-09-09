# 快速开始

## 📦 安装

::: code-group

```bash [npm]
npm install -D @artipub/core
```

```bash [yarn]
yarn add -D @artipub/core
```

```bash [pnpm]
pnpm add -D @artipub/core
```

:::

## 🚀 示例

以下是一个简单的示例，展示如何使用 ArtiPub 发布一篇文章到指定平台：

### CommonJS

```javascript
const { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin, NativePublisherPlugin } = require("@artipub/core");
```

### ES Module

```javascript
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin, NativePublisherPlugin } from "@artipub/core";
```

### Example

```js
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin, NativePublisherPlugin } from "@artipub/core";
import path from "path";
import { fileURLToPath } from "url";

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env;
const { DEV_TO_API_KEY } = process.env;
let { GITHUB_OWNER, GITHUB_REPO, GITHUB_DIR, GITHUB_BRANCH, GITHUB_TOKEN, GITHUB_COMMIT_AUTHOR, GITHUB_COMMIT_EMAIL } = process.env;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const articleProcessor = new ArticleProcessor({
  //tips: 如果不想用github图床， uploadImgOption也可以是一个异步图片上传函数，最后返回上传后的图片url也可以
  uploadImgOption: {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    dir: GITHUB_DIR,
    branch: GITHUB_BRANCH,
    token: GITHUB_TOKEN,
    commit_author: GITHUB_COMMIT_AUTHOR,
    commit_email: GITHUB_COMMIT_EMAIL,
  },
});

articleProcessor.processMarkdown(path.resolve(__dirname, "../doc/xxx.md")).then(async ({ content }) => {
  let publisherManager = new PublisherManager(content);
  publisherManager.addPlugin(
    NativePublisherPlugin({
      //tips: 本地目录，比如：发布至自己blog，其实就是将文章保存至博客项目的某个目录下
      targetDir: "",
    })
  );
  publisherManager.addPlugin(
    NotionPublisherPlugin({
      api_key: NOTION_API_KEY,
      page_id: NOTION_PAGE_ID,
    })
  );
  publisherManager.addPlugin(
    DevToPublisherPlugin({
      api_key: DEV_TO_API_KEY ?? "",
      published: false,
    })
  );
  let res = await publisherManager.publish();
  // output: [ { success: true, info: 'Published to Notion successfully!' } ]
});
```
