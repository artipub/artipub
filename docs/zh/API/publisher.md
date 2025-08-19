---
outline: deep
sidebar:
  title: 发布管理器
---

# PublisherManager - 发布管理器

PublisherManager 负责协调处理后的文章同时发布到多个平台。它管理发布插件并协调发布工作流程。

## 概述

PublisherManager 类：

- 管理多个发布插件
- 并行发布内容到所有注册的平台
- 跟踪已发布的文章以便后续更新
- 提供统一的错误处理和结果报告

## 构造函数

```ts
class PublisherManager {
  constructor(content: string);
}
```

**参数：**

- `content` (string): 来自 ArticleProcessor 的处理后的 Markdown 内容

## 方法

### addPlugin

为特定平台注册发布插件。

```ts
addPlugin(plugin: PublisherPlugin): void
```

**参数：**

- `plugin` (PublisherPlugin): 平台特定的发布插件

**示例：**

```ts
const manager = new PublisherManager(content);
manager.addPlugin(NotionPublisherPlugin({ api_key: "...", page_id: "..." }));
manager.addPlugin(DevToPublisherPlugin({ api_key: "...", published: false }));
```

### publish

同时将文章发布到所有注册的平台。

```ts
publish(): Promise<PublishResult[]>
```

**返回值：**

- `Promise<PublishResult[]>`: 每个平台的结果数组

```ts
interface PublishResult {
  pid?: string; // 平台特定的文章 ID
  name?: string; // 插件名称
  success: boolean; // 发布是否成功
  info?: string; // 成功/错误消息
}
```

## PublisherPlugin 接口

所有发布插件必须实现此接口：

```ts
interface PublisherPlugin {
  extendsParam?(extendsParam: ExtendsParam): PublisherPlugin; // 接收跟踪的文章数据
  process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult>;
  update?(article_id: string | undefined, articleTitle: string, content: string): Promise<void>; // 更新现有文章
  name: string; // 插件标识符
  isTraceUpdate?: boolean; // 跟踪以便后续更新
}

interface ExtendsParam {
  pid?: string; // 跟踪中的现有文章 ID
}

type ToMarkdown = () => { content: string };
```

### 插件参数

- `articleTitle`: 从第一个 H1 标题提取的文章标题
- `visit`: 用于平台特定内容转换的 AST 访问器
- `toMarkdown`: 将修改后的 AST 转换回 Markdown 的函数

## 完整示例

### 基础多平台发布

```ts
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin, NativePublisherPlugin } from "@artipub/core";
import path from "path";

// 步骤 1：处理文章
const processor = new ArticleProcessor({
  uploadImgOption: {
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    dir: "images",
    branch: "main",
    token: process.env.GITHUB_TOKEN!,
    commit_author: "Bot",
    commit_email: "bot@example.com",
  },
});

const { content } = await processor.processMarkdown(path.resolve(__dirname, "./articles/my-post.md"));

// 步骤 2：设置发布器
const publisher = new PublisherManager(content);

// 添加 Notion 发布器
publisher.addPlugin(
  NotionPublisherPlugin({
    api_key: process.env.NOTION_API_KEY!,
    page_id: process.env.NOTION_PAGE_ID!,
  })
);

// 添加 Dev.to 发布器
publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    published: false, // 保存为草稿
    series: "我的教程系列",
    main_image: "https://example.com/cover.jpg",
    description: "文章描述用于 SEO",
  })
);

// 添加本地文件发布器
publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "/home/user/blog/content/posts",
    cdn_prefix: "https://cdn.jsdelivr.net/gh",
    res_domain: "raw.githubusercontent.com",
  })
);

// 步骤 3：发布到所有平台
const results = await publisher.publish();

// 步骤 4：处理结果
results.forEach((result) => {
  if (result.success) {
    console.log(`✅ ${result.name}: ${result.info}`);
  } else {
    console.error(`❌ ${result.name}: ${result.info}`);
  }
});
```

### 高级：自定义发布插件

```ts
import { PublisherPlugin, PublishResult } from "@artipub/core";
import axios from "axios";

// 为您的平台创建自定义发布器
function CustomBlogPublisher(options: CustomBlogOptions): PublisherPlugin {
  return {
    name: "CustomBlog",
    isTraceUpdate: true, // 启用更新跟踪

    extendsParam(params) {
      // 扩展现有文章 ID 以进行更新
      if (params.pid) {
        options.postId = params.pid;
      }
    },

    async process(articleTitle, visit, toMarkdown) {
      try {
        // 为您的平台转换内容
        visit("image", (node) => {
          // 将图片 URL 转换为您的 CDN
          node.url = `https://mycdn.com/proxy?url=${encodeURIComponent(node.url)}`;
        });

        // 删除您的平台不支持的元素
        visit("html", (node, index, parent) => {
          parent.children.splice(index, 1);
        });

        // 获取转换后的内容
        const { content } = toMarkdown();

        // 发布到您的平台
        const endpoint = options.postId ? `https://api.myblog.com/posts/${options.postId}` : "https://api.myblog.com/posts";

        const response = await axios({
          method: options.postId ? "PUT" : "POST",
          url: endpoint,
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
          },
          data: {
            title: articleTitle,
            content: content,
            tags: options.tags,
            draft: options.draft,
          },
        });

        return {
          success: true,
          info: `发布到 CustomBlog: ${response.data.url}`,
          pid: response.data.id, // 保存以便后续更新
        };
      } catch (error) {
        return {
          success: false,
          info: `发布失败: ${error.message}`,
        };
      }
    },
  };
}

// 使用自定义发布器
const publisher = new PublisherManager(content);
publisher.addPlugin(
  CustomBlogPublisher({
    apiKey: process.env.CUSTOM_BLOG_API_KEY!,
    tags: ["教程", "javascript"],
    draft: false,
  })
);
```

## 文章更新跟踪

当 `isTraceUpdate` 启用时，ArtiPub 会自动跟踪已发布的文章以便更新：

1. **首次发布**：

   - 生成唯一的文章 ID
   - 在 `postMapRecords.json` 中存储平台特定的文章 ID

2. **后续更新**：
   - 检索现有的文章 ID
   - 更新现有文章而不是创建重复项

### postMapRecords.json 结构

```json
{
  "article_unique_id_123": {
    "NotionPublisher": {
      "k": "notion-page-id-456"
    },
    "DevToPublisher": {
      "k": "devto-article-id-789"
    }
  }
}
```

## 错误处理

### 单个插件失败

默认情况下，如果一个插件失败，其他插件会继续发布：

```ts
const results = await publisher.publish();

const successful = results.filter((r) => r.success);
const failed = results.filter((r) => !r.success);

console.log(`成功发布到 ${successful.length}/${results.length} 个平台`);

if (failed.length > 0) {
  console.error(
    "失败的平台:",
    failed.map((f) => f.name)
  );
}
```

### 快速失败策略

在第一次失败时停止：

```ts
class StrictPublisherManager extends PublisherManager {
  async publish() {
    const results = [];

    for (const plugin of this.plugins) {
      const result = await plugin.process(/* ... */);

      if (!result.success) {
        throw new Error(`发布失败: ${result.info}`);
      }

      results.push(result);
    }

    return results;
  }
}
```

## 性能优化

### 并行发布

默认情况下，PublisherManager 并行发布到所有平台以获得最佳性能：

```ts
// 所有平台同时发布
const results = await publisher.publish();
```

### 顺序发布

对于有速率限制的 API 或有序依赖：

```ts
async function publishSequentially(publisher: PublisherManager) {
  const results = [];

  // 逐个发布
  for (const plugin of publisher.plugins) {
    const result = await plugin.process(/* ... */);
    results.push(result);

    // 如果需要，添加延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
```

## 最佳实践

1. **环境变量**：将 API 密钥和敏感数据存储在环境变量中

   ```bash
   NOTION_API_KEY=secret_xxx
   DEVTO_API_KEY=xxx
   ```

2. **错误恢复**：为暂时性故障实现重试逻辑

   ```ts
   async function publishWithRetry(publisher, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       const results = await publisher.publish();
       const failed = results.filter((r) => !r.success);

       if (failed.length === 0) return results;

       console.log(`重试 ${i + 1}/${maxRetries} 失败的平台...`);
       await new Promise((resolve) => setTimeout(resolve, 2000));
     }
   }
   ```

3. **日志记录**：实现全面的日志记录以便调试

   ```ts
   publisher.addPlugin(withLogging(NotionPublisherPlugin(options), "Notion"));

   function withLogging(plugin, name) {
     const original = plugin.process;
     plugin.process = async (...args) => {
       console.log(`发布到 ${name}...`);
       const start = Date.now();

       try {
         const result = await original(...args);
         console.log(`${name} 在 ${Date.now() - start}ms 内完成`);
         return result;
       } catch (error) {
         console.error(`${name} 失败:`, error);
         throw error;
       }
     };
     return plugin;
   }
   ```

4. **验证**：发布前验证内容

   ```ts
   if (!content || content.trim().length === 0) {
     throw new Error("内容为空");
   }

   if (!content.includes("# ")) {
     console.warn("内容中未找到标题");
   }
   ```

## API 参考

- [Notion API 文档](https://developers.notion.com/)
- [Dev.to API 文档](https://developers.forem.com/api)
- [GitHub API 文档](https://docs.github.com/en/rest)
