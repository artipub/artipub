# 🎉 ArtiPub
English | [简体中文](./README_zh-CN.md)

![GitHub top language](https://img.shields.io/github/languages/top/Pup007/artipub)
![GitHub License](https://img.shields.io/github/license/Pup007/artipub)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Pup007/artipub/release.yml)
![NPM Version](https://img.shields.io/npm/v/%40pup007%2Fartipub)


ArtiPub (article release assistant) is a tool library aimed at simplifying content creators to publish the article process.It provides a simple API that allows you to easily publish the article to multiple platforms, such as blogs, social media, etc., without manual operation of each platform.

## ❓ Why do you need artipub?
1. Local pictures cited in Markdown need to manually compress the picture, then upload to the bed, and finally replace the picture link
2. After Markdown finished writing, I want to publish it to other platforms to avoid manual Copy
3. After Markdown finished writing the article, I need to modify some of the contents of Markdown and let it regenerate the content of Markdown
4. ...

> Note: ArtiPub will help you solve these problems automatically, and will expand more in the future

## ✨ Features

- 🌐 **Multi-platform release**: Support that the Markdown article is published to multiple mainstream content platforms, including but not limited to Notion, Medium, Dev.to, etc.
- ✨ **Simple and easy to use**: Provide a simple API, and only need a few lines of code to implement the article release.
- 🔌 **Support middleware and plugin**: Through plug -in and middle parts, let users make more fine -grained control processing and release processes.
- 📖 **Complete open source**: Encourage community contributions and continue to increase new platform support and functions.

## 📌 TODO
- [x] DevToPublisherPlugin
- [ ] Document Site

## 🔧 Built-in

### Treatment middleware
| Name | Support | Description |
|-|-|-|
| piccompress | √ | Automatic compression of the picture |
| Picupload | √ | Picture Upload |

### Publish plug -in
| Name | Support | Description |
|-|-|-|
| NOTIONPUBLISHERPLUGIN | √ | Published to NOTION |
| DEVTOPUBLISHERPLUGIN | √ | Published to DEV.TO |

## 📦 Install

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

## 🚀 Quick Start

Here is a simple example showing how to publish an article to a given platform using ArtiPub

### CommonJS 

```javascript
const { ArticleProcessor, PublisherManager, NotionPublisherPlugin } = require('@pup007/artipub');
```

### ES Module 

```javascript
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin } from "@pup007/artipub"
```

### Usage

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
 //tips: If you don’t want to use a github bed, uploadImgOption can also be an aspect upload function, and finally returned to the uploaded picture URL
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

## 💻 Development

> Note: Please create a new branch based on the master, develop on the new branch, and create PR to Master after development

- Install dependency
  ```bash
  pnpm install
  ```

- Add process middleware
  ```typescript
  export default async function customMiddleware(
    context: ProcessorContext,
    visit: TVisitor,
    next: Next) {
    //visit：In depth priority traversing Markdown AST's interface, which is convenient for users to modify node. Note that this process is synchronized. If you want to process it asynchronous, find the corresponding Node first, then add asynchronous processing.
    //next: Call next after processing, otherwise it will cause stuck and will not execute
  }
  ```
- Add publish plugin
  ```typescript
  export function XXXPublisherPlugin(option: any) {
    return async (
    articleTitle: string,
    visit: TVisitor,
    toMarkdown: ToMarkdown
  ): Promise<PublishResult> => {
      //visit:In depth priority traversing Markdown AST's interface, which is convenient for users to modify node. Note that this process is synchronized.
      //toMarkdown: The modified AST will regenerate markdown. Content is Markdown content
      let { content } = toMarkdown();
      let res: PublishResult = {
        success: true,
        info: "Published to XXX",
      };
      //TODO:
      return res;
    };
  }
  ```

- build
  ```bash
  pnpm build
  ```

- playground: 
1. First pnpm Build package artipub
2. cd playground for verification test (Note: Do not submit the file in playground, only local tests)


## 📄 License

ArtiPub is released under the MIT license. See the [LICENSE](./LICENSE) file for details.

## 🙏 Thanks

Thank you to all the developers who contributed to ArtiPub, and everyone who used and supported the project. 
If this library has been useful for you, please consider giving it a ⭐️ as a way to show your support. Your encouragement is what keeps us going and improving. Thank you so much from the bottom of our hearts! 🌹
