---
outline: deep
title: Native 插件
---

# NativePublisherPlugin - 本地文件系统发布插件

NativePublisherPlugin 将文章发布到本地文件系统，非常适合静态站点生成器如 Hugo、Jekyll、Gatsby 或自定义博客系统。它能处理图片 URL 转换以优化 CDN 性能。

## 安装

该插件包含在 `@artipub/core` 包中：

```bash
npm install @artipub/core
```

## 配置

```ts
interface NativePublisherOption {
  /**
   * 文章将保存的绝对路径
   * 必需：是
   */
  destination_path: string;

  /**
   * 用于转换 GitHub raw URL 的 CDN 前缀
   * 必需：否
   * @default "https://cdn.jsdelivr.net/gh"
   */
  cdn_prefix?: string;

  /**
   * 要替换的图片 URL 域名
   * 必需：否
   * @default "raw.githubusercontent.com"
   */
  res_domain?: string;
}
```

## 使用示例

### 基本文件系统发布

```ts
import { PublisherManager, NativePublisherPlugin } from "@artipub/core";

const publisher = new PublisherManager(processedContent);

publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "/home/user/blog/content/posts",
  })
);

await publisher.publish();
// 创建文件：/home/user/blog/content/posts/文章标题.md
```

### 配置 CDN URL 转换

```ts
publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "./content/posts",
    cdn_prefix: "https://cdn.jsdelivr.net/gh",
    res_domain: "raw.githubusercontent.com",
  })
);

// 转换输出文件中的 GitHub raw URL 为 CDN URL
// 转换前：https://raw.githubusercontent.com/user/repo/main/image.png
// 转换后：https://cdn.jsdelivr.net/gh/user/repo@main/image.png
```

## 静态站点生成器集成

插件保存的是标准 Markdown 文件，可用于任何静态站点生成器：

### Hugo
将文件放在 `./content/posts/` 目录

### Jekyll
将文件放在 `./_posts/` 目录

### Gatsby
将文件放在 `./src/content/blog/` 目录

### Next.js
将文件放在 `./posts/` 或配置的内容目录

## 图片 URL 转换

插件会自动将 GitHub raw 图片 URL 转换为使用 CDN 以获得更好的性能：

### 默认转换
- **源域名**：`raw.githubusercontent.com`
- **目标 CDN**：`https://cdn.jsdelivr.net/gh`

### 自定义 CDN 配置

```ts
publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "./output",
    cdn_prefix: "https://custom-cdn.com",
    res_domain: "my-image-host.com",
  })
);

// 转换：https://my-image-host.com/image.png
// 为：https://custom-cdn.com/image.png
```

## 完整示例

```ts
import { ArticleProcessor, PublisherManager, NativePublisherPlugin } from "@artipub/core";
import path from "path";

// 处理文章
const processor = new ArticleProcessor({
  uploadImgOption: {
    owner: "username",
    repo: "blog-images",
    dir: "images",
    branch: "main",
    token: process.env.GITHUB_TOKEN!,
    commit_author: "Bot",
    commit_email: "bot@example.com",
  },
});

const result = await processor.processMarkdown("./article.md");

// 发布到本地文件系统
const publisher = new PublisherManager(result.content);

publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: path.resolve("./blog/content/posts"),
    cdn_prefix: "https://cdn.jsdelivr.net/gh",
    res_domain: "raw.githubusercontent.com",
  })
);

const publishResults = await publisher.publish();
console.log(publishResults);
```

## 输出格式

插件保存的文章为纯 Markdown 文件，包含：
- 文件名：`{文章标题}.md`
- 内容：处理后的 Markdown，包含转换后的图片 URL
- 编码：UTF-8

## 最佳实践

1. **使用绝对路径**：始终为 `destination_path` 提供绝对路径
   ```ts
   path.resolve(__dirname, "./content/posts")
   ```

2. **预先创建目录**：确保目标目录存在
   ```ts
   import fs from "fs";
   fs.mkdirSync("./content/posts", { recursive: true });
   ```

3. **CDN 优化**：使用 CDN 转换以获得更好的图片加载性能

4. **错误处理**：在 try-catch 块中包装发布调用
   ```ts
   try {
     await publisher.publish();
   } catch (error) {
     console.error("保存文章失败:", error);
   }
   ```

## 限制

- 文件以文章标题作为文件名保存
- 不自动生成 front matter（使用您的 SSG 脚本来实现）
- 发布前目录必须存在
- 不支持更新跟踪 - 文件总是被覆盖
- 无法通过 ID 更新现有文章（仅按标题覆盖）

## 另请参阅

- [PublisherManager API](../publisher.md)
- [ArticleProcessor API](../processor.md)
- [插件开发指南](./custom.md)