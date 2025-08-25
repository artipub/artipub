---
outline: deep
title: Dev.to 插件
---

# DevToPublisherPlugin - Dev.to 发布插件

DevToPublisherPlugin 能够将文章发布到 Dev.to 和其他基于 Forem 的社区平台。它支持草稿、系列、标签和组织发布。

## 安装

该插件包含在 `@artipub/core` 包中：

```bash
npm install @artipub/core
```

## 配置

```ts
interface DevToPublisherPluginOption {
  /**
   * Dev.to API 密钥
   * 必需：是
   */
  api_key: string;

  /**
   * 用于更新现有文章的文章 ID
   * 必需：否
   */
  article_id?: string;

  /**
   * 是否立即发布或保存为草稿
   * 必需：否
   * @default false
   */
  published?: boolean;

  /**
   * 文章系列名称
   * 必需：否
   */
  series?: string;

  /**
   * 封面图片 URL（必须是绝对 URL）
   * 必需：否
   * 推荐尺寸：1000x420px 以获得最佳效果
   */
  main_image?: string;

  /**
   * 用于 SEO 和预览的文章描述
   * 必需：否
   * 最大长度：150 个字符
   */
  description?: string;

  /**
   * 在组织下发布的组织 ID
   * 必需：否
   */
  organization_id?: number;
}
```

## 重要说明：标签处理

标签是从您的 Markdown 内容的 frontmatter 中**自动提取**的。您不能通过插件配置传递标签。

### 如何为文章添加标签

在您的 Markdown frontmatter 中添加 tags 部分：

```markdown
---
tags:
  - javascript
  - webdev
  - tutorial
  - beginners
---

# 您的文章标题

文章内容...
```

插件将自动提取这些标签并在发布到 Dev.to 时包含它们。

## 设置指南

### 步骤 1：生成 API 密钥

1. 登录您的 Dev.to 账户
2. 导航到 [设置 → 扩展](https://dev.to/settings/extensions)
3. 向下滚动到"DEV API 密钥"部分
4. 为您的密钥输入描述（如"ArtiPub 发布器"）
5. 点击"生成 API 密钥"
6. 立即复制生成的密钥（它不会再次显示）

![Dev.to API 密钥生成](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200945604.png)

### 步骤 2：查找组织 ID（可选）

如果在组织下发布：

1. 转到您组织的仪表板
2. 检查 URL：`https://dev.to/dashboard/organization/{org_id}`
3. 或使用 API 列出组织：

```bash
curl -H "api-key: YOUR_API_KEY" https://dev.to/api/organizations
```

## 使用方法

### 基础示例

```ts
import { ArticleProcessor, PublisherManager, DevToPublisherPlugin } from "@artipub/core";

// 首先处理您的文章
const processor = new ArticleProcessor({
  uploadImgOption: {
    // 您的图片上传配置
  },
});

const { content } = await processor.processMarkdown("./article.md");

// 创建发布器并添加 Dev.to 插件
const publisher = new PublisherManager(content);

publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    published: false, // 保存为草稿
  })
);

// 发布到 Dev.to
const results = await publisher.publish();
console.log(results);
// 输出: [{ name: 'DevToPublisher', success: true, info: '...', pid: '...' }]
```

### 完整配置示例

```ts
publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    published: false, // 开始为草稿
    series: "JavaScript 深入探讨", // 添加到系列
    main_image: "https://example.com/cover.jpg",
    description: "通过实际示例学习高级 JavaScript 概念",
    // 注意：标签是从文章内容中自动提取的
    organization_id: 12345, // 在组织下发布
  })
);
```

### 发布策略

#### 草稿优先策略

```ts
// 1. 发布为草稿以供审查
const draftPlugin = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  published: false,
  // 注意：标签是从文章内容中自动提取的
});

publisher.addPlugin(draftPlugin);
const results = await publisher.publish();

// 2. 稍后通过 Dev.to UI 或 API 更新为已发布
```

#### 立即发布

```ts
// 立即发布（谨慎使用）
const livePlugin = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  published: true,
  // 注意：标签是从文章内容中自动提取的
});

publisher.addPlugin(livePlugin);
await publisher.publish();
```

#### 系列管理

```ts
// 将文章添加到现有系列
const seriesPlugin = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  series: "构建 REST API", // 准确的系列名称
  published: false,
});

// 同一系列中的文章将链接在一起
publisher.addPlugin(seriesPlugin);
```

## 功能特性

### 支持的 Markdown 元素

Dev.to 支持带有一些扩展的标准 Markdown：

| 元素      | 支持    | 说明                   |
| --------- | ------- | ---------------------- |
| 标题      | ✅ 完全 | h1-h6                  |
| 粗体/斜体 | ✅ 完全 | 标准 markdown          |
| 链接      | ✅ 完全 | 内联和引用             |
| 图片      | ✅ 完全 | 从 markdown 自动上传   |
| 代码块    | ✅ 完全 | 带语法高亮             |
| 内联代码  | ✅ 完全 | 反引号语法             |
| 列表      | ✅ 完全 | 有序和无序             |
| 表格      | ✅ 完全 | GitHub 风格的 markdown |
| 引用块    | ✅ 完全 | 标准 markdown          |
| 水平线    | ✅ 完全 | --- 或 \*\*\*          |
| HTML      | ⚠️ 有限 | 允许某些标签           |

### Dev.to 特殊功能

#### Liquid 标签

Dev.to 支持用于嵌入的 Liquid 标签：

```markdown
{% embed https://github.com/user/repo %}
{% youtube VIDEO_ID %}
{% twitter 1234567890 %}
{% codepen https://codepen.io/... %}
```

#### 目录

从标题自动生成。使用 `{:toc}` 标记进行自定义放置。

#### 语法高亮

支持 100+ 种语言并自动检测：

````markdown
```javascript
const example = "语法高亮有效！";
```

```python
def hello_world():
    print("来自 Python 的问候！")
```
````

### 文章更新

插件跟踪已发布的文章以进行更新：

```ts
// 首次发布 - 创建新文章
const results = await publisher.publish();
const articleId = results[0].pid; // 保存此 ID

// 稍后更新 - 更新现有文章
// 插件自动使用保存的 ID
await publisher.publish();
```

## 高级用法

### 自定义 Frontmatter 处理

Dev.to 文章可以包含插件自动处理的 frontmatter：

```ts
const content = `---
title: 我的文章标题
published: false
# 标签是从文章内容中自动提取的
series: 我的系列
---

# 文章内容
...`;

// 插件提取并使用 frontmatter 值
const publisher = new PublisherManager(content);
```

### 速率限制

Dev.to API 有速率限制（每 30 秒 30 个请求）。相应处理：

```ts
async function publishMultipleArticles(articles: string[]) {
  for (const article of articles) {
    const publisher = new PublisherManager(article);
    publisher.addPlugin(devtoPlugin);

    try {
      await publisher.publish();
      // 遵守速率限制
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      if (error.response?.status === 429) {
        console.log("速率限制，等待中...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }
  }
}
```

### 使用组织

```ts
// 列出您的组织
async function getOrganizations(apiKey: string) {
  const response = await fetch("https://dev.to/api/organizations", {
    headers: { "api-key": apiKey },
  });
  return response.json();
}

// 在组织下发布
const orgs = await getOrganizations(process.env.DEVTO_API_KEY!);
const orgId = orgs[0].id;

publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    organization_id: orgId,
    published: false,
  })
);
```

## 故障排除

### 常见问题

#### 1. "401 未授权"错误

**原因**：无效或缺少 API 密钥

**解决方案**：

- 验证 API 密钥是否正确
- 确保密钥中没有多余的空格
- 如有必要，重新生成密钥

#### 2. "422 无法处理的实体"错误

**原因**：无效的文章数据

**常见原因**：

- 标签过多（最多 4 个）
- 无效的标签格式（使用小写，无空格）
- 描述过长（最多 150 个字符）
- 无效的系列名称

**解决方案**：

```ts
// 发布前验证
const validTags = tags
  .slice(0, 4) // 最多 4 个标签
  .map((tag) => tag.toLowerCase().replace(/\s+/g, "")); // 清理标签

const validDescription = description.slice(0, 150); // 如需要则截断
```

#### 3. "429 请求过多"错误

**原因**：超过速率限制

**解决方案**：

- 实现指数退避
- 在请求之间添加延迟
- 在可能的情况下缓存响应

#### 4. 图片未显示

**原因**：无效的图片 URL 或格式

**解决方案**：

- 使用绝对 URL 作为图片
- 确保图片可公开访问
- 支持的格式：JPG、PNG、GIF、WebP

### 调试模式

启用详细日志记录：

```ts
const plugin = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  published: false,
});

// 包装日志记录
const originalProcess = plugin.process;
plugin.process = async (title, visit, toMarkdown) => {
  console.log("发布到 Dev.to:", { title });

  try {
    const result = await originalProcess(title, visit, toMarkdown);
    console.log("Dev.to 响应:", result);
    return result;
  } catch (error) {
    console.error("Dev.to 错误:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
```

## 最佳实践

### 1. 标签策略

使用有意义、可搜索的标签：

```ts
const tagStrategy = {
  language: "javascript", // 主要技术
  level: "beginners", // 受众级别
  category: "tutorial", // 内容类型
  topic: "webdev", // 一般主题
};

publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    tags: Object.values(tagStrategy).slice(0, 4),
  })
);
```

### 2. SEO 优化

```ts
// 优化可发现性
const seoOptimized = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  description: "清晰、引人注目的带关键词的描述", // SEO 描述
  main_image: "https://example.com/eye-catching-cover.jpg", // 吸引人的封面
  // 注意：标签是从文章内容中自动提取的
});
```

### 3. 系列组织

```ts
// 组织相关内容
const seriesArticles = [
  { title: "第 1 部分：介绍", content: "..." },
  { title: "第 2 部分：深入探讨", content: "..." },
  { title: "第 3 部分：高级主题", content: "..." },
];

for (const article of seriesArticles) {
  const publisher = new PublisherManager(article.content);
  publisher.addPlugin(
    DevToPublisherPlugin({
      api_key: process.env.DEVTO_API_KEY!,
      series: "我的教程系列", // 相同的系列名称
      published: false,
    })
  );
  await publisher.publish();
}
```

### 4. 环境配置

```ts
// 每个环境的不同设置
const devtoConfig = {
  api_key: process.env.DEVTO_API_KEY!,
  published: process.env.NODE_ENV === "production",
  // 注意：标签是从文章内容中自动提取的
};

publisher.addPlugin(DevToPublisherPlugin(devtoConfig));
```

## API 端点参考

### 文章

- `POST /api/articles` - 创建文章
- `PUT /api/articles/{id}` - 更新文章
- `GET /api/articles/{id}` - 获取文章
- `GET /api/articles` - 列出文章

### 组织

- `GET /api/organizations` - 列出组织
- `GET /api/organizations/{username}` - 获取组织

### 用户

- `GET /api/users/me` - 获取已认证用户

## 相关资源

- [Dev.to API 文档](https://developers.forem.com/api/v1)
- [Dev.to Markdown 指南](https://dev.to/p/markdown_basics)
- [Liquid 标签参考](https://dev.to/p/liquid_tags)
- [API 速率限制](https://developers.forem.com/api/#section/Rate-limiting)

## 另请参阅

- [ArticleProcessor API](../processor.md)
- [PublisherManager API](../publisher.md)
- [自定义插件开发](./custom.md)
