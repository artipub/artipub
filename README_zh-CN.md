# ArtiPub
简体中文 | [English](./README.md)

ArtiPub（文章发布助手）是一个旨在简化内容创作者跨平台发布文章过程的工具库。它提供了一套简单的API，可以让你轻松地将文章发布到多个平台，如博客、社交媒体等，无需手动操作每个平台。

## 特点

- **跨平台支持**：支持多个主流内容平台，包括但不限于Medium、Dev.to等。
- **简单易用**：提供了简洁的API，只需几行代码即可实现文章的发布。
- **自定义流程**：可以通过插件和中间件，让用户更好的控制处理和发布流程。
- **开源社区**：鼓励社区贡献，持续增加新的平台支持和功能。

## 安装

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

## 快速开始

以下是一个简单的示例，展示如何使用 ArtiPub 发布一篇文章到指定平台：

### CommonJS 方式导入

如果您的项目使用 CommonJS 模块系统，可以按照以下方式导入 ArtiPub：

```javascript
const { ArticleProcessor, PublisherManager, NotionPublisherPlugin } = require('@pup007/artipub');
```

### ES Module 方式导入

```javascript
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin } from "@pup007/artipub"
```

### Example

```js
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin } from "@pup007/artipub"
import path from "path";
import { fileURLToPath } from "url";

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env;
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

articleProcessor.processMarkdown(path.resolve(__dirname, "../doc/xxx.md")).then(async ({ filePath, content }) => {
 let publisherManager = new PublisherManager();
 publisherManager.addPlugin(NotionPublisherPlugin({
  api_key: NOTION_API_KEY,
  page_id: NOTION_PAGE_ID
 }));
 let res = await publisherManager.publish(filePath, content);
 // output: [ { success: true, info: 'Published to Notion successfully!' } ]
});

```

## 贡献

我们欢迎所有形式的贡献，无论是新功能、bug修复还是文档改进。

## 许可证

ArtiPub 是在 MIT 许可证下发布的。详情请见 [`LICENSE`](./LICENSE) 文件。

## 致谢

感谢所有为 ArtiPub 贡献的开发者，以及所有使用和支持此项目的人。
