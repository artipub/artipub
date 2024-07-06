# 🎉 ArtiPub
简体中文 | [English](./README.md)

![GitHub top language](https://img.shields.io/github/languages/top/Pup007/artipub)
![GitHub License](https://img.shields.io/github/license/Pup007/artipub)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Pup007/artipub/release.yml)
![NPM Version](https://img.shields.io/npm/v/%40pup007%2Fartipub)

ArtiPub（文章发布助手）是一个旨在简化内容创作者跨平台发布文章过程的工具库。它提供了一套简单的API，可以让你轻松地将文章发布到多个平台，如博客、社交媒体等，无需手动操作每个平台。

## ❓ 为什么需要ArtiPub?
1. markdown中引用的本地图片，需要手动压缩图片，然后上传至图床，最后在把图片链接替换掉
2. markdown写完文章后，想发布至其他平台避免手动copy
3. markdown写完文章后，我需要修改markdown中的一些内容，让其重新生成markdown内容
4. ...

> 说明：ArtiPub全部帮你自动解决这些问题，未来将拓展更多内容

## ✨ 特点

- 🌐 **多平台发布**：支持将markdown文章发布至多个主流内容平台，包括但不限于Notion、Medium、Dev.to等。
- ✨ **简单易用**：提供了简洁的API，只需几行代码即可实现文章的发布。
- 🔌 **支持中间件和插件**：通过插件和中间件，让用户更细粒度的控制处理和发布流程。
- 📖 **完全开源**：鼓励社区贡献，持续增加新的平台支持和功能。

## 📌 TODO
- [x] DevToPublisherPlugin
- [ ] Document Site

## 🔧 内置

### 处理中间件
|名称|支持|描述|
|--|--|--|
|picCompress|√|图片自动压缩|
|picUpload|√|图片上传|

### 发布插件
|名称|支持|描述|
|--|--|--|
|NotionPublisherPlugin|√|发布至notion|
|DevToPublisherPlugin|doing|发布至dev.to|


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

## 🚀 快速开始

以下是一个简单的示例，展示如何使用 ArtiPub 发布一篇文章到指定平台：

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
 let res = await publisherManager.publish();
 // output: [ { success: true, info: 'Published to Notion successfully!' } ]
});

```

## 💻 开发

> 特别注意：请基于master创建一个新分支，在新分支上开发，开发完后创建PR至master

- 安装依赖
  ```bash
  pnpm install
  ```

- 新增处理中间件
  ```typescript
  export default async function customMiddleware(
    context: ProcessorContext,
    visit: TVisitor,
    next: Next) {
    //visit：深度优先遍历markdown ast的接口，方便用户修改node，注意此过程是同步的，如果想要异步处理，就先找到对应node，然后再添加异步处理，最后调用next。
    //next: 处理完后调用next，否则会导致一直卡住不会往下执行
  }
  ```
- 新增添加插件
  ```typescript
  export function XXXPublisherPlugin(option: any) {
    return async (
    articleTitle: string,
    visit: TVisitor,
    toMarkdown: ToMarkdown
  ): Promise<PublishResult> => {
      //visit: 深度优先遍历markdown ast的接口，方便用户修改node，注意此过程是同步的
      //toMarkdown: 会将修改后的ast 重新生成markdown, content 就是markdown 内容
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

- 打包
  ```bash
  pnpm build
  ```

- 测试: 
  1. 先pnpm build 打包artipub
  2. cd playground 进行验证测试(注意：playground中的任务东西都不要提交，仅本地测试)

## 📄 许可证

ArtiPub 是在 MIT 许可证下发布的。详情请见 [`LICENSE`](./LICENSE) 文件。

## 🙏 致谢

感谢所有为 ArtiPub 贡献的开发者，以及所有使用和支持此项目的人。如果这个库对您有帮助，烦请赠予一个⭐️作为支持，您的鼓励是我们持续进步的最大动力，衷心感谢！🌹
