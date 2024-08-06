# Quick Start

## 📦 Install

npm：

```bash
npm install -D @artipub/core
```

yarn：

```bash
yarn add -D @artipub/core
```

pnpm：

```bash
pnpm add -D @artipub/core
```

## 🚀 Example

Here is a simple example showing how to publish an article to a given platform using ArtiPub

### CommonJS

```javascript
const { ArticleProcessor, PublisherManager, NotionPublisherPlugin } = require("@artipub/core");
```

### ES Module

```javascript
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin } from "@artipub/core";
```

### Usage

```js
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin } from "@artipub/core";
import path from "path";
import { fileURLToPath } from "url";

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env;
const { DEV_TO_API_KEY } = process.env;
let { GITHUB_OWNER, GITHUB_REPO, GITHUB_DIR, GITHUB_BRANCH, GITHUB_TOKEN, GITHUB_COMMIT_AUTHOR, GITHUB_COMMIT_EMAIL } = process.env;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const articleProcessor = new ArticleProcessor({
  //tips: If you don’t want to use a github bed, uploadImgOption can also be an aspect upload function, and finally returned to the uploaded picture URL
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
      //tips: local directory，example：publish to your blog is to save the article to a directory in your blog project
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
