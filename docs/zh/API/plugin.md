---
outline: deep
sidebar:
  title: 发布插件
---

# 发布插件 - Publisher Plugins

发布插件是 ArtiPub 与各种发布平台之间的桥梁。它们处理平台特定的转换和 API 交互。

## 概述

ArtiPub 使用基于插件的架构，允许您：

- 同时发布到多个平台
- 为平台特定需求转换内容
- 跟踪已发布的文章以便后续更新
- 创建与任何平台的自定义集成

## 内置插件

ArtiPub 提供三个生产就绪的插件：

### [NotionPublisherPlugin](./plugins/notion.md)

直接发布文章到 Notion 页面或数据库。

**主要功能：**

- 自动将 Markdown 转换为 Notion 块
- 支持嵌套页面和数据库
- 图片上传和嵌入
- 完整的格式保留

**快速开始：**

```ts
import { NotionPublisherPlugin } from "@artipub/core";

publisher.addPlugin(
  NotionPublisherPlugin({
    api_key: process.env.NOTION_API_KEY!,
    page_id: process.env.NOTION_PAGE_ID!,
  })
);
```

[查看完整文档 →](./plugins/notion.md)

### [DevToPublisherPlugin](./plugins/devto.md)

发布文章到 Dev.to 和其他基于 Forem 的社区。

**主要功能：**

- 草稿和已发布状态
- 系列组织
- SEO 优化
- 组织发布

**快速开始：**

```ts
import { DevToPublisherPlugin } from "@artipub/core";

publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    published: false,
  })
);
```

[查看完整文档 →](./plugins/devto.md)

### [NativePublisherPlugin](./plugins/native.md)

将文章保存到本地文件系统，适用于静态站点生成器。

**主要功能：**

- 本地文件系统保存
- GitHub 图片的 CDN URL 转换
- UTF-8 编码
- 与静态站点生成器简单集成

**快速开始：**

```ts
import { NativePublisherPlugin } from "@artipub/core";

publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "./content/posts",
  })
);
```

[查看完整文档 →](./plugins/native.md)

## 插件接口

所有插件都实现 `PublisherPlugin` 接口：

```ts
interface PublisherPlugin {
  extendsParam?(extendsParam: ExtendsParam): PublisherPlugin; // 接收跟踪数据
  process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult>; // 主处理函数
  update?(article_id: string | undefined, articleTitle: string, content: string): Promise<void>; // 更新现有文章
  name: string; // 插件标识符
  isTraceUpdate?: boolean; // 启用更新跟踪
}

interface PublishResult {
  pid?: string; // 平台文章 ID
  name?: string; // 插件名称
  success: boolean; // 发布状态
  info?: string; // 状态消息
}

interface ExtendsParam {
  pid?: string; // 跟踪中的现有文章 ID
}

type ToMarkdown = () => { content: string };
```

## 创建自定义插件

构建您自己的插件以集成任何平台：

```ts
import { PublisherPlugin } from "@artipub/core";

function MyPlatformPlugin(options: MyOptions): PublisherPlugin {
  return {
    name: "MyPlatform",
    isTraceUpdate: true,

    async process(articleTitle, visit, toMarkdown) {
      // 转换内容
      visit("image", (node) => {
        node.url = transformUrl(node.url);
      });

      // 获取最终内容
      const { content } = toMarkdown();

      // 发布到平台
      const result = await publishToAPI(articleTitle, content);

      return {
        success: true,
        info: `已发布: ${result.url}`,
        pid: result.id,
      };
    },
  };
}
```

[查看自定义插件指南 →](./plugins/custom.md)

## 使用插件

### 单个平台

```ts
import { PublisherManager, NotionPublisherPlugin } from "@artipub/core";

const publisher = new PublisherManager(processedContent);

publisher.addPlugin(
  NotionPublisherPlugin({
    api_key: "your-api-key",
    page_id: "your-page-id",
  })
);

const results = await publisher.publish();
```

### 多个平台

```ts
import { PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin, NativePublisherPlugin } from "@artipub/core";

const publisher = new PublisherManager(processedContent);

// 添加多个插件
publisher.addPlugin(
  NotionPublisherPlugin({
    /* ... */
  })
);
publisher.addPlugin(
  DevToPublisherPlugin({
    /* ... */
  })
);
publisher.addPlugin(
  NativePublisherPlugin({
    /* ... */
  })
);

// 同时发布到所有平台
const results = await publisher.publish();

// 处理结果
results.forEach((result) => {
  console.log(`${result.name}: ${result.success ? "✅" : "❌"} ${result.info}`);
});
```

## 插件功能

### 内容转换

插件可以修改内容以满足平台特定的要求：

```ts
process(articleTitle, visit, toMarkdown) {
  // 删除不支持的元素
  visit('html', (node, index, parent) => {
    parent.children.splice(index, 1);
  });

  // 修改图片
  visit('image', (node) => {
    node.url = cdnUrl(node.url);
  });

  // 获取转换后的内容
  const { content } = toMarkdown();
}
```

### 更新跟踪

设置 `isTraceUpdate: true` 的插件可以更新现有文章：

```ts
{
  name: "MyPlatform",
  isTraceUpdate: true,

  extendsParam(params) {
    this.postId = params.pid; // 接收现有文章 ID
  },

  async process(/* ... */) {
    if (this.postId) {
      // 更新现有文章
    } else {
      // 创建新文章
    }
  }
}
```

### 错误处理

插件应始终返回结果，即使失败时也是如此：

```ts
async process(articleTitle, visit, toMarkdown) {
  try {
    // 发布逻辑
    return {
      success: true,
      info: "发布成功"
    };
  } catch (error) {
    return {
      success: false,
      info: error.message
    };
  }
}
```

## 最佳实践

1. **环境变量**：安全地存储敏感数据

   ```ts
   NotionPublisherPlugin({
     api_key: process.env.NOTION_API_KEY!,
     page_id: process.env.NOTION_PAGE_ID!,
   });
   ```

2. **错误恢复**：优雅地处理失败

   ```ts
   const results = await publisher.publish();
   const failed = results.filter((r) => !r.success);

   if (failed.length > 0) {
     // 重试或回退逻辑
   }
   ```

3. **速率限制**：遵守 API 限制

   ```ts
   for (const article of articles) {
     await publisher.publish();
     await delay(1000); // 防止速率限制
   }
   ```

4. **验证**：发布前检查内容

   ```ts
   if (!content || content.trim().length === 0) {
     throw new Error("内容为空");
   }
   ```

## 插件开发资源

- [自定义插件开发指南](./plugins/custom.md)
- [AST 转换参考](https://github.com/syntax-tree/mdast)
- [示例插件](https://github.com/artipub/artipub/tree/main/packages/core/src/plugins)

## API 参考

- [PublisherManager API](./publisher.md)
- [ArticleProcessor API](./processor.md)
- [平台 API 文档](#platform-apis)

### 平台 API

- [Notion API](https://developers.notion.com/)
- [Dev.to API](https://developers.forem.com/api)
- [Medium API](https://github.com/Medium/medium-api-docs)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Ghost API](https://ghost.org/docs/content-api/)

## 社区插件

> 与社区分享您的自定义插件！提交 PR 将您的插件添加到此列表。

## 支持

- [GitHub Issues](https://github.com/artipub/artipub/issues)
- [讨论](https://github.com/artipub/artipub/discussions)
- [贡献指南](../guide/contribute.md)
