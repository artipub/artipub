# 快速开始

## 📦 安装

使用 npm 安装 ：

```bash
npm install -D @pup007/artipub
```

使用 yarn 安装：

```bash
yarn add -D @pup007/artipub
```

使用pnpm 安装：

```bash
pnpm add -D @pup007/artipub
```

## 🚀 示例

以下是一个简单的示例，展示如何使用 ArtiPub 发布一篇文章到指定平台：

### CommonJS 

```javascript
const { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin } = require('@pup007/artipub');
```

### ES Module 

```javascript
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin } from "@pup007/artipub"
```

### Example

```js
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin } from "@pup007/artipub"
import path from "path";
import { fileURLToPath } from "url";

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env;
const { DEV_TO_API_KEY } = process.env;
let {
 GITHUB_OWNER,
 GITHUB_REPO,
 GITHUB_DIR,
 GITHUB_BRANCH,
 GITHUB_TOKEN,
 GITHUB_COMMIT_AUTHOR,
 GITHUB_COMMIT_EMAIL,
} = process.env;

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
  commit_email: GITHUB_COMMIT_EMAIL
 }
});

articleProcessor.processMarkdown(path.resolve(__dirname, "../doc/xxx.md")).then(async ({ content }) => {
 let publisherManager = new PublisherManager(content);
 publisherManager.addPlugin(NotionPublisherPlugin({
  api_key: NOTION_API_KEY,
  page_id: NOTION_PAGE_ID
 }));
 publisherManager.addPlugin(DevToPublisherPlugin({
	api_key: DEV_TO_API_KEY ?? "",
	published: false
 }));
 let res = await publisherManager.publish();
 // output: [ { success: true, info: 'Published to Notion successfully!' } ]
});

```
