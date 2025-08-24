---
outline: deep
title: 自定义插件
---

# 自定义插件开发

学习如何为 ArtiPub 创建自定义发布插件，以集成任何平台或服务。

## 插件架构

### 核心接口

每个插件必须实现 `PublisherPlugin` 接口：

```ts
interface PublisherPlugin {
  /**
   * 插件的唯一标识符
   */
  name: string;

  /**
   * 启用文章更新跟踪
   * 当为 true 时，ArtiPub 会保存文章 ID 以供后续更新
   */
  isTraceUpdate?: boolean;

  /**
   * 接收用于更新的跟踪数据
   * 如果文章之前已发布，会在 process() 之前调用
   * 返回自身以支持方法链
   */
  extendsParam?: (param: { pid?: string }) => PublisherPlugin;

  /**
   * 主处理函数
   * 转换和发布文章
   */
  process: (articleTitle: string, visit: TVisitor, toMarkdown: () => { content: string }) => Promise<PublishResult>;
}

interface PublishResult {
  success: boolean;
  info?: string; // 成功/错误消息
  pid?: string; // 用于跟踪的平台文章 ID
}
```

### Process 函数参数

| 参数           | 类型       | 描述                          |
| -------------- | ---------- | ----------------------------- |
| `articleTitle` | `string`   | 从第一个 H1 标题提取          |
| `visit`        | `TVisitor` | 用于内容转换的 AST 访问器     |
| `toMarkdown`   | `Function` | 将 AST 转换回 Markdown 字符串 |

## 基础插件模板

```ts
import { PublisherPlugin, PublishResult } from "@artipub/core";

interface MyPluginOptions {
  apiKey: string;
  endpoint?: string;
  // 添加您的配置选项
}

export function MyPublisherPlugin(options: MyPluginOptions): PublisherPlugin {
  // 验证选项
  if (!options.apiKey) {
    throw new Error("需要 API 密钥");
  }

  // 默认值
  const config = {
    endpoint: "https://api.example.com",
    ...options,
  };

  return {
    name: "MyPublisher",
    isTraceUpdate: true, // 启用更新跟踪

    async process(articleTitle, visit, toMarkdown) {
      try {
        // 1. 如需要则转换内容
        transformContent(visit);

        // 2. 转换为 markdown
        const { content } = toMarkdown();

        // 3. 发布到平台
        const result = await publishToPlatform(articleTitle, content, config);

        // 4. 返回结果
        return {
          success: true,
          info: `已发布到 ${result.url}`,
          pid: result.id, // 保存以供更新
        };
      } catch (error) {
        return {
          success: false,
          info: error.message,
        };
      }
    },
  };
}
```

## 实际示例

### Medium 发布插件

```ts
import { PublisherPlugin } from "@artipub/core";
import axios from "axios";

interface MediumOptions {
  accessToken: string;
  userId: string;
  publishStatus?: "draft" | "public" | "unlisted";
  tags?: string[];
  canonicalUrl?: string;
  license?:
    | "all-rights-reserved"
    | "cc-40-by"
    | "cc-40-by-sa"
    | "cc-40-by-nd"
    | "cc-40-by-nc"
    | "cc-40-by-nc-nd"
    | "cc-40-by-nc-sa"
    | "cc-40-zero"
    | "public-domain";
}

export function MediumPublisherPlugin(options: MediumOptions): PublisherPlugin {
  let existingPostId: string | undefined;

  return {
    name: "Medium",
    isTraceUpdate: true,

    extendsParam(params) {
      existingPostId = params.pid;
      return this;
    },

    async process(articleTitle, visit, toMarkdown) {
      try {
        // 根据 Medium 的要求转换
        visit("code", (node) => {
          // Medium 不支持语言提示
          if (node.lang) {
            node.lang = null;
          }
        });

        // 删除 HTML（Medium 不支持）
        visit("html", (node, index, parent) => {
          parent.children.splice(index, 1);
        });

        // 添加 Medium 特定格式
        visit("image", (node) => {
          // 确保 alt 文本存在
          if (!node.alt) {
            node.alt = "图片";
          }
        });

        const { content } = toMarkdown();

        const postData = {
          title: articleTitle,
          contentFormat: "markdown",
          content: content,
          publishStatus: options.publishStatus || "draft",
          tags: options.tags || [],
          canonicalUrl: options.canonicalUrl,
          license: options.license || "all-rights-reserved",
        };

        let response;
        if (existingPostId) {
          // 更新现有文章（注意：Medium API 不支持更新）
          return {
            success: false,
            info: "Medium API 不支持文章更新",
          };
        } else {
          // 创建新文章
          response = await axios.post(`https://api.medium.com/v1/users/${options.userId}/posts`, postData, {
            headers: {
              Authorization: `Bearer ${options.accessToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
        }

        return {
          success: true,
          info: `已发布到 Medium: ${response.data.data.url}`,
          pid: response.data.data.id,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            success: false,
            info: `Medium API 错误: ${error.response?.data?.errors?.[0]?.message || error.message}`,
          };
        }
        return {
          success: false,
          info: `意外错误: ${error.message}`,
        };
      }
    },
  };
}
```

### WordPress 发布插件

```ts
import { PublisherPlugin } from "@artipub/core";
import axios from "axios";

interface WordPressOptions {
  siteUrl: string;
  username: string;
  applicationPassword: string;
  status?: "publish" | "draft" | "pending" | "private";
  categories?: number[];
  tags?: number[];
  featuredMedia?: number;
}

export function WordPressPublisherPlugin(options: WordPressOptions): PublisherPlugin {
  let existingPostId: string | undefined;

  const auth = Buffer.from(`${options.username}:${options.applicationPassword}`).toString("base64");

  return {
    name: "WordPress",
    isTraceUpdate: true,

    extendsParam(params) {
      existingPostId = params.pid;
      return this;
    },

    async process(articleTitle, visit, toMarkdown) {
      try {
        // 为 WordPress 转换内容
        let featuredImageUrl: string | undefined;

        // 提取第一张图片作为特色图片
        visit("image", (node, index, parent) => {
          if (!featuredImageUrl) {
            featuredImageUrl = node.url;
          }
        });

        // 将 markdown 转换为 HTML（WordPress 偏好 HTML）
        const { content: markdownContent } = toMarkdown();

        // 您可能想在这里转换为 HTML
        // const htmlContent = await markdownToHtml(markdownContent);

        const postData = {
          title: articleTitle,
          content: markdownContent, // 或 htmlContent
          status: options.status || "draft",
          categories: options.categories || [],
          tags: options.tags || [],
          featured_media: options.featuredMedia,
        };

        let response;
        const endpoint = `${options.siteUrl}/wp-json/wp/v2/posts`;

        if (existingPostId) {
          // 更新现有文章
          response = await axios.put(`${endpoint}/${existingPostId}`, postData, {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          // 创建新文章
          response = await axios.post(endpoint, postData, {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
          });
        }

        return {
          success: true,
          info: `已发布到 WordPress: ${response.data.link}`,
          pid: response.data.id.toString(),
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            success: false,
            info: `WordPress API 错误: ${error.response?.data?.message || error.message}`,
          };
        }
        return {
          success: false,
          info: `意外错误: ${error.message}`,
        };
      }
    },
  };
}
```

### Ghost 发布插件

```ts
import { PublisherPlugin } from "@artipub/core";
import jwt from "jsonwebtoken";
import axios from "axios";

interface GhostOptions {
  url: string;
  adminApiKey: string;
  status?: "published" | "draft" | "scheduled";
  tags?: string[];
  featured?: boolean;
  visibility?: "public" | "members" | "paid";
}

export function GhostPublisherPlugin(options: GhostOptions): PublisherPlugin {
  let existingPostId: string | undefined;

  // 解析 Admin API 密钥
  const [id, secret] = options.adminApiKey.split(":");

  // 创建用于认证的 JWT 令牌
  const token = jwt.sign({}, Buffer.from(secret, "hex"), {
    keyid: id,
    algorithm: "HS256",
    expiresIn: "5m",
    audience: `/v3/admin/`,
  });

  return {
    name: "Ghost",
    isTraceUpdate: true,

    extendsParam(params) {
      existingPostId = params.pid;
      return this;
    },

    async process(articleTitle, visit, toMarkdown) {
      try {
        // 转换内容
        const { content } = toMarkdown();

        // 将 markdown 转换为 Mobiledoc（Ghost 的格式）
        // 您可能需要一个 markdown-to-mobiledoc 转换器

        const postData = {
          posts: [
            {
              title: articleTitle,
              markdown: content,
              status: options.status || "draft",
              tags: options.tags,
              featured: options.featured || false,
              visibility: options.visibility || "public",
            },
          ],
        };

        let response;
        const endpoint = `${options.url}/ghost/api/v3/admin/posts`;

        if (existingPostId) {
          // 更新现有文章
          response = await axios.put(`${endpoint}/${existingPostId}`, postData, {
            headers: {
              Authorization: `Ghost ${token}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          // 创建新文章
          response = await axios.post(endpoint, postData, {
            headers: {
              Authorization: `Ghost ${token}`,
              "Content-Type": "application/json",
            },
          });
        }

        return {
          success: true,
          info: `已发布到 Ghost: ${response.data.posts[0].url}`,
          pid: response.data.posts[0].id,
        };
      } catch (error) {
        return {
          success: false,
          info: `Ghost API 错误: ${error.message}`,
        };
      }
    },
  };
}
```

## AST 转换

### 理解访问器模式

`visit` 函数允许您遍历和修改 Markdown AST：

```ts
// 访问特定类型的所有节点
visit("heading", (node, index, parent) => {
  console.log("找到标题:", node);
});

// 使用测试函数访问
visit(
  (node) => node.type === "heading" && node.depth === 1,
  (node) => {
    console.log("找到 H1:", node);
  }
);

// 删除节点
visit("html", (node, index, parent) => {
  parent.children.splice(index, 1);
});

// 修改节点
visit("image", (node) => {
  node.url = transformImageUrl(node.url);
  node.alt = node.alt || "图片";
});
```

### 常见节点类型

```ts
// 文本节点
interface Text {
  type: 'text';
  value: string;
}

// 标题节点
interface Heading {
  type: 'heading';
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: Array<Text | Link | ...>;
}

// 图片节点
interface Image {
  type: 'image';
  url: string;
  alt?: string;
  title?: string;
}

// 代码块节点
interface Code {
  type: 'code';
  lang?: string;
  value: string;
}

// 链接节点
interface Link {
  type: 'link';
  url: string;
  children: Array<Text | ...>;
}
```

### 转换示例

```ts
function transformContent(visit: TVisitor) {
  // 为标题添加 ID
  let headingCounter = 0;
  visit("heading", (node) => {
    headingCounter++;
    const id = `heading-${headingCounter}`;
    // 添加 ID 作为 HTML 注释（特定于平台）
    const idComment = {
      type: "html",
      value: `<!-- id="${id}" -->`,
    };
    node.children.unshift(idComment);
  });

  // 将相对 URL 转换为绝对 URL
  const baseUrl = "https://example.com";
  visit("link", (node) => {
    if (node.url.startsWith("./") || node.url.startsWith("../")) {
      node.url = new URL(node.url, baseUrl).href;
    }
  });

  // 为图片添加懒加载
  visit("image", (node) => {
    node.data = node.data || {};
    node.data.hProperties = node.data.hProperties || {};
    node.data.hProperties.loading = "lazy";
  });

  // 转换表情符号短代码
  visit("text", (node) => {
    node.value = node.value.replace(/:(\w+):/g, (match, emoji) => {
      const emojiMap = {
        smile: "😊",
        heart: "❤️",
        thumbsup: "👍",
      };
      return emojiMap[emoji] || match;
    });
  });
}
```

## 高级功能

### 更新跟踪

实现文章更新支持：

```ts
export function MyPlugin(options: MyOptions): PublisherPlugin {
  let existingPostId: string | undefined;

  return {
    name: "MyPlatform",
    isTraceUpdate: true, // 启用跟踪

    extendsParam(params) {
      // 接收现有文章 ID
      existingPostId = params.pid;
      console.log("更新现有文章:", existingPostId);
    },

    async process(articleTitle, visit, toMarkdown) {
      const { content } = toMarkdown();

      if (existingPostId) {
        // 更新现有文章
        const result = await updatePost(existingPostId, {
          title: articleTitle,
          content: content,
        });

        return {
          success: true,
          info: `已更新文章: ${result.url}`,
          pid: existingPostId, // 保持相同的 ID
        };
      } else {
        // 创建新文章
        const result = await createPost({
          title: articleTitle,
          content: content,
        });

        return {
          success: true,
          info: `已创建文章: ${result.url}`,
          pid: result.id, // 保存新 ID
        };
      }
    },
  };
}
```

### 错误处理模式

```ts
async process(articleTitle, visit, toMarkdown) {
  try {
    // 验证输入
    if (!articleTitle || articleTitle.trim().length === 0) {
      throw new Error('文章标题是必需的');
    }

    // 转换内容
    const { content } = toMarkdown();

    if (!content || content.trim().length === 0) {
      throw new Error('文章内容为空');
    }

    // 带超时的 API 调用
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ title: articleTitle, content }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`API 错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        info: `已发布: ${data.url}`,
        pid: data.id
      };
    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    // 分类错误
    if (error.name === 'AbortError') {
      return {
        success: false,
        info: '请求超时 - 平台响应时间过长'
      };
    }

    if (error.message.includes('API 错误')) {
      return {
        success: false,
        info: error.message
      };
    }

    // 记录意外错误
    console.error('插件中的意外错误:', error);

    return {
      success: false,
      info: `发布失败: ${error.message}`
    };
  }
}
```

### 速率限制

```ts
import { RateLimiter } from "limiter";

const limiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: "minute",
});

export function RateLimitedPlugin(options: Options): PublisherPlugin {
  return {
    name: "RateLimited",

    async process(articleTitle, visit, toMarkdown) {
      // 等待速率限制令牌
      await limiter.removeTokens(1);

      // 继续发布
      return publish(articleTitle, toMarkdown());
    },
  };
}
```

### 缓存

```ts
const cache = new Map<string, PublishResult>();

export function CachedPlugin(options: Options): PublisherPlugin {
  return {
    name: "Cached",

    async process(articleTitle, visit, toMarkdown) {
      const { content } = toMarkdown();
      const cacheKey = `${articleTitle}-${hashContent(content)}`;

      // 检查缓存
      if (cache.has(cacheKey)) {
        const cachedResult = cache.get(cacheKey)!;
        console.log("使用缓存结果");
        return cachedResult;
      }

      // 发布
      const result = await publish(articleTitle, content);

      // 缓存成功的结果
      if (result.success) {
        cache.set(cacheKey, result);
      }

      return result;
    },
  };
}
```

## 测试您的插件

### 单元测试

```ts
import { describe, it, expect, vi } from "vitest";
import { MyPublisherPlugin } from "./my-plugin";

describe("MyPublisherPlugin", () => {
  it("应该使用有效配置创建插件", () => {
    const plugin = MyPublisherPlugin({
      apiKey: "test-key",
    });

    expect(plugin.name).toBe("MyPublisher");
    expect(plugin.isTraceUpdate).toBe(true);
    expect(plugin.process).toBeInstanceOf(Function);
  });

  it("没有 API 密钥时应该抛出错误", () => {
    expect(() => MyPublisherPlugin({})).toThrow("需要 API 密钥");
  });

  it("应该成功发布文章", async () => {
    const plugin = MyPublisherPlugin({
      apiKey: "test-key",
    });

    const mockVisit = vi.fn();
    const mockToMarkdown = () => ({ content: "# 测试\n内容" });

    const result = await plugin.process("测试文章", mockVisit, mockToMarkdown);

    expect(result.success).toBe(true);
    expect(result.pid).toBeDefined();
  });

  it("应该优雅地处理 API 错误", async () => {
    const plugin = MyPublisherPlugin({
      apiKey: "invalid-key",
    });

    const result = await plugin.process("测试文章", vi.fn(), () => ({ content: "内容" }));

    expect(result.success).toBe(false);
    expect(result.info).toContain("错误");
  });
});
```

### 集成测试

```ts
import { ArticleProcessor, PublisherManager } from "@artipub/core";
import { MyPublisherPlugin } from "./my-plugin";

describe("集成测试", () => {
  it("应该与 PublisherManager 一起工作", async () => {
    const processor = new ArticleProcessor({
      uploadImgOption: async () => "https://example.com/image.jpg",
    });

    const { content } = await processor.processMarkdown("./test.md");

    const publisher = new PublisherManager(content);
    publisher.addPlugin(
      MyPublisherPlugin({
        apiKey: process.env.TEST_API_KEY!,
      })
    );

    const results = await publisher.publish();
    expect(results[0].success).toBe(true);
  });
});
```

## 发布您的插件

### 包结构

```
my-artipub-plugin/
├── src/
│   ├── index.ts         # 主插件导出
│   ├── types.ts         # TypeScript 类型
│   └── utils.ts         # 辅助函数
├── test/
│   └── plugin.test.ts   # 测试
├── package.json
├── tsconfig.json
└── README.md
```

### Package.json

```json
{
  "name": "artipub-plugin-myplatform",
  "version": "1.0.0",
  "description": "ArtiPub 的 MyPlatform 发布插件",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["artipub", "artipub-plugin", "publisher", "myplatform"],
  "peerDependencies": {
    "@artipub/core": "^1.0.0"
  },
  "devDependencies": {
    "@artipub/core": "^1.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}
```

### 导出模式

```ts
// src/index.ts
export { MyPublisherPlugin } from "./plugin";
export type { MyPluginOptions } from "./types";

// 使用者的用法
import { MyPublisherPlugin } from "artipub-plugin-myplatform";
```

## 最佳实践

1. **尽早验证选项**：在工厂函数中检查必需字段
2. **优雅地处理错误**：即使失败也始终返回 `PublishResult`
3. **使用 TypeScript**：提供类型定义以获得更好的开发体验
4. **记录平台要求**：列出支持的功能和限制
5. **彻底测试**：包括单元测试和集成测试
6. **版本兼容性**：为 @artipub/core 使用 peerDependencies
7. **日志记录**：添加可选的调试日志以便故障排除
8. **遵守速率限制**：为 API 实现适当的速率限制
9. **安全性**：永远不要记录敏感数据如 API 密钥
10. **幂等性**：尽可能使操作幂等

## 资源

- [ArtiPub Core API](../../processor.md)
- [AST 文档](https://github.com/syntax-tree/mdast)
- [unified 文档](https://github.com/unifiedjs/unified)
- [发布插件示例](https://github.com/artipub/artipub/tree/main/packages/core/src/plugins)
