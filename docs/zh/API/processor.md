---
outline: deep
sidebar:
  title: 文章处理器
---

# ArticleProcessor - 文章处理器

ArticleProcessor 是 ArtiPub 的核心处理引擎，提供文章预处理功能，包括图片压缩、图片上传和自定义中间件处理。它通过管道架构处理 Markdown 文件，允许开发者通过中间件扩展功能。

## 概述

ArticleProcessor 类负责在发布前转换 Markdown 内容。它会自动：

- 压缩图片以减小文件大小
- 上传图片到云存储（GitHub 或自定义）
- 注入唯一文章 ID 用于跟踪
- 通过自定义中间件处理内容

## 构造函数

```ts
class ArticleProcessor {
  constructor(option: ArticleProcessorOption);
}
```

### ArticleProcessorOption

```ts
interface ArticleProcessorOption {
  /**
   * 图片压缩设置
   * @default { quality: 80, compressed: true }
   */
  compressedOptions?: {
    /**
     * 是否压缩图片
     * @default true
     */
    compressed?: boolean;
    /**
     * 压缩质量 (1-100)
     * @default 80
     */
    quality?: number;
  };

  /**
   * 图片上传配置
   * 可以是 GitHub 配置或自定义上传函数
   */
  uploadImgOption: UploadImgOption;
}
```

### UploadImgOption 类型

```ts
/**
 * GitHub 图床配置
 */
interface GithubPicBedOption {
  owner: string; // GitHub 用户名或组织名
  repo: string; // 仓库名称
  dir: string; // 仓库中的目录路径
  branch: string; // 目标分支（通常是 'main' 或 'master'）
  token: string; // GitHub Personal Access Token
  commit_author: string; // 提交作者名称
  commit_email: string; // 提交作者邮箱
}

/**
 * 自定义上传函数
 * @param imgFilePath - 本地图片文件路径
 * @returns Promise 返回上传后的图片 URL
 */
type UploadImg = (imgFilePath: string) => Promise<string>;

/**
 * 上传选项可以是 GitHub 配置或自定义函数
 */
type UploadImgOption = GithubPicBedOption | UploadImg;
```

## 方法

### processMarkdown

处理 Markdown 文件并通过配置的管道。

```ts
processMarkdown(filePath: string): Promise<ArticleProcessResult>
```

**参数：**

- `filePath` (string): Markdown 文件的绝对路径

**返回值：**

- `Promise<ArticleProcessResult>`: 处理后的内容

```ts
interface ArticleProcessResult {
  content: string; // 处理后的 Markdown 内容
}
```

### use

添加自定义中间件到处理管道。

```ts
use(middleware: Middleware): ArticleProcessor
```

**参数：**

- `middleware` (Middleware): 自定义中间件函数

**返回值：**

- `ArticleProcessor`: 返回自身以支持链式调用

## 中间件

中间件允许您通过操作 Markdown AST（抽象语法树）来自定义处理管道。

### 中间件类型定义

```ts
type Middleware = (context: ProcessorContext, visitor: TVisitor, next: Next) => Promise<void>;

interface ProcessorContext {
  option: ArticleProcessorOption;
  filePath: string;
}

type Next = () => void;
type TVisitor = (
  testOrVisitor: Visitor | Test,
  visitorOrReverse: Visitor | boolean | null | undefined,
  maybeReverse?: boolean | null | undefined
) => void;
```

### 编写自定义中间件

```ts
const customMiddleware: Middleware = async (context, visit, next) => {
  // 访问 AST 中的特定节点类型
  visit("heading", (node, index, parent) => {
    // 修改标题节点
    if (node.depth === 1) {
      // 处理 h1 标题
      console.log("找到标题:", node.children[0].value);
    }
  });

  // 访问图片节点
  visit("image", (node) => {
    // 处理图片 URL
    console.log("找到图片:", node.url);
  });

  // 重要：始终调用 next() 以继续管道
  next();
};
```

## 完整示例

### 基础使用 - GitHub 图片托管

```ts
import { ArticleProcessor } from "@artipub/core";
import path from "path";

// 使用环境变量配置
const processor = new ArticleProcessor({
  compressedOptions: {
    quality: 85,
    compressed: true,
  },
  uploadImgOption: {
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    dir: "blog/images",
    branch: "main",
    token: process.env.GITHUB_TOKEN!,
    commit_author: "ArtiPub Bot",
    commit_email: "bot@example.com",
  },
});

// 处理 Markdown 文件
const result = await processor.processMarkdown(path.resolve(__dirname, "./articles/my-post.md"));

console.log("处理后的内容:", result.content);
```

### 自定义图片上传函数

```ts
import { ArticleProcessor } from "@artipub/core";
import { uploadToS3 } from "./utils/s3-upload";

const processor = new ArticleProcessor({
  uploadImgOption: async (imgFilePath: string) => {
    // 自定义上传逻辑（如：AWS S3、Cloudinary 等）
    const url = await uploadToS3(imgFilePath);
    return url;
  },
});
```

### 高级用法：使用多个中间件

```ts
import { ArticleProcessor } from "@artipub/core";
import { Heading, Text, Image } from "mdast";

const processor = new ArticleProcessor({
  uploadImgOption: {
    /* ... */
  },
});

// 中间件 1：添加阅读时间估算
processor.use(async (context, visit, next) => {
  let wordCount = 0;

  visit("text", (node: Text) => {
    wordCount += node.value.split(/\s+/).length;
  });

  const readingTime = Math.ceil(wordCount / 200); // 每分钟 200 字

  // 在文档开头添加阅读时间
  visit("root", (node) => {
    const readingTimeNode = {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: `⏱️ 阅读时间：${readingTime} 分钟`,
        },
      ],
    };
    node.children.unshift(readingTimeNode);
  });

  next();
});

// 中间件 2：为图片添加水印
processor.use(async (context, visit, next) => {
  visit("image", (node: Image) => {
    // 为图片 URL 添加水印参数
    if (!node.url.includes("?")) {
      node.url += "?watermark=artipub";
    }
  });

  next();
});

// 中间件 3：将相对链接转换为绝对链接
processor.use(async (context, visit, next) => {
  const baseUrl = "https://myblog.com";

  visit("link", (node) => {
    if (node.url.startsWith("./") || node.url.startsWith("../")) {
      node.url = new URL(node.url, baseUrl).href;
    }
  });

  next();
});
```

## 节点类型参考

中间件中可以访问的常见节点类型：

| 节点类型     | 描述         | 属性                    |
| ------------ | ------------ | ----------------------- |
| `root`       | 文档根节点   | `children[]`            |
| `heading`    | 标题 (h1-h6) | `depth`, `children[]`   |
| `paragraph`  | 段落         | `children[]`            |
| `text`       | 文本内容     | `value`                 |
| `image`      | 图片         | `url`, `alt`, `title`   |
| `link`       | 链接         | `url`, `children[]`     |
| `code`       | 代码块       | `lang`, `value`         |
| `inlineCode` | 内联代码     | `value`                 |
| `blockquote` | 引用         | `children[]`            |
| `list`       | 列表         | `ordered`, `children[]` |
| `listItem`   | 列表项       | `children[]`            |
| `table`      | 表格         | `children[]`            |
| `emphasis`   | 斜体文本     | `children[]`            |
| `strong`     | 粗体文本     | `children[]`            |

## 最佳实践

1. **始终调用 `next()`**：在中间件中忘记调用 `next()` 会停止管道。

2. **顺序很重要**：中间件按添加顺序执行。图片处理中间件应在发布之前执行。

3. **错误处理**：在 try-catch 块中包装异步操作：

   ```ts
   processor.use(async (context, visit, next) => {
     try {
       // 您的异步操作
       await someAsyncOperation();
     } catch (error) {
       console.error("中间件错误:", error);
       // 决定是继续还是抛出异常
     }
     next();
   });
   ```

4. **性能**：避免在中间件中进行繁重操作。在可能的情况下考虑缓存结果。

5. **测试**：在添加到处理器之前独立测试中间件：

   ```ts
   // 单独测试中间件
   const testMiddleware = async () => {
     const mockContext = {
       /* ... */
     };
     const mockVisit = jest.fn();
     const mockNext = jest.fn();

     await myMiddleware(mockContext, mockVisit, mockNext);

     expect(mockNext).toHaveBeenCalled();
   };
   ```

## API 参考

有关访问者模式和 AST 操作的更多详细信息：

- [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) - 访问者工具文档
- [mdast](https://github.com/syntax-tree/mdast) - Markdown AST 规范
- [unified](https://github.com/unifiedjs/unified) - 内容处理生态系统
