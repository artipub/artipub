# ArtiPub
English | [简体中文](./README_zh-CN.md)

ArtiPub (article release assistant) is a tool library aimed at simplifying content creators to publish the article process.It provides a simple API that allows you to easily publish the article to multiple platforms, such as blogs, social media, etc., without manual operation of each platform.

## Features

- **Cross platform support**：Supports multiple major content platforms, including but not limited to Medium, Dev.to, etc
- **Simple and easy to use**：Provides a concise API, only a few lines of code to achieve article publishing.
- **Custom flow**：Plugins and middleware can be used to give users more control over the processing and publishing process.
- **Open Source**：Encourage community contributions and continue to add new platform support and features.

## Install

npm：

```bash
npm install -D @pup007/artipub
```

yarn：

```bash
yarn add -D @pup007/artipub
```

pnpm：

```bash
pnpm add -D @pup007/artipub
```

## Quick Start

Here is a simple example showing how to publish an article to a given platform using ArtiPub

### CommonJS 

```javascript
const { ArticleProcessor, PublisherManager, NotionPublisherPlugin } = require('@pup007/artipub');
```

### ES Module 

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

## Contribution

We welcome contributions in all forms, whether it's new features, bug fixes, or documentation improvements.

## License

ArtiPub is released under the MIT license. See the [LICENSE](./LICENSE) file for details.

## Thanks

Thank you to all the developers who contributed to ArtiPub, and everyone who used and supported the project.
