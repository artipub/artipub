---
outline: deep
title: Custom Plugins
---

# Custom Plugin Development

Learn how to create custom publisher plugins for ArtiPub to integrate with any platform or service.

## Plugin Architecture

### Core Interface

Every plugin must implement the `PublisherPlugin` interface:

```ts
interface PublisherPlugin {
  /**
   * Unique identifier for the plugin
   */
  name: string;

  /**
   * Enable article update tracking
   * When true, ArtiPub saves post IDs for future updates
   */
  isTraceUpdate?: boolean;

  /**
   * Receive tracked data for updates
   * Called before process() if article was previously published
   * Returns itself for method chaining
   */
  extendsParam?: (param: { pid?: string }) => PublisherPlugin;

  /**
   * Main processing function
   * Transforms and publishes the article
   */
  process: (articleTitle: string, visit: TVisitor, toMarkdown: () => { content: string }) => Promise<PublishResult>;
}

interface PublishResult {
  success: boolean;
  info?: string; // Success/error message
  pid?: string; // Platform post ID for tracking
}
```

### Process Function Parameters

| Parameter      | Type       | Description                            |
| -------------- | ---------- | -------------------------------------- |
| `articleTitle` | `string`   | Extracted from first H1 heading        |
| `visit`        | `TVisitor` | AST visitor for content transformation |
| `toMarkdown`   | `Function` | Converts AST back to Markdown string   |

## Basic Plugin Template

```ts
import { PublisherPlugin, PublishResult } from "@artipub/core";

interface MyPluginOptions {
  apiKey: string;
  endpoint?: string;
  // Add your configuration options
}

export function MyPublisherPlugin(options: MyPluginOptions): PublisherPlugin {
  // Validate options
  if (!options.apiKey) {
    throw new Error("API key is required");
  }

  // Default values
  const config = {
    endpoint: "https://api.example.com",
    ...options,
  };

  return {
    name: "MyPublisher",
    isTraceUpdate: true, // Enable update tracking

    async process(articleTitle, visit, toMarkdown) {
      try {
        // 1. Transform content if needed
        transformContent(visit);

        // 2. Convert to markdown
        const { content } = toMarkdown();

        // 3. Publish to platform
        const result = await publishToPlatform(articleTitle, content, config);

        // 4. Return result
        return {
          success: true,
          info: `Published to ${result.url}`,
          pid: result.id, // Save for updates
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

## Real-World Examples

### Medium Publisher Plugin

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
        // Transform for Medium's requirements
        visit("code", (node) => {
          // Medium doesn't support language hints
          if (node.lang) {
            node.lang = null;
          }
        });

        // Remove HTML (Medium doesn't support it)
        visit("html", (node, index, parent) => {
          parent.children.splice(index, 1);
        });

        // Add Medium-specific formatting
        visit("image", (node) => {
          // Ensure alt text exists
          if (!node.alt) {
            node.alt = "Image";
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
          // Update existing post (Note: Medium API doesn't support updates)
          return {
            success: false,
            info: "Medium API doesn't support post updates",
          };
        } else {
          // Create new post
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
          info: `Published to Medium: ${response.data.data.url}`,
          pid: response.data.data.id,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            success: false,
            info: `Medium API error: ${error.response?.data?.errors?.[0]?.message || error.message}`,
          };
        }
        return {
          success: false,
          info: `Unexpected error: ${error.message}`,
        };
      }
    },
  };
}
```

### WordPress Publisher Plugin

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
        // Transform content for WordPress
        let featuredImageUrl: string | undefined;

        // Extract first image as featured
        visit("image", (node, index, parent) => {
          if (!featuredImageUrl) {
            featuredImageUrl = node.url;
          }
        });

        // Convert markdown to HTML (WordPress prefers HTML)
        const { content: markdownContent } = toMarkdown();

        // You might want to convert to HTML here
        // const htmlContent = await markdownToHtml(markdownContent);

        const postData = {
          title: articleTitle,
          content: markdownContent, // or htmlContent
          status: options.status || "draft",
          categories: options.categories || [],
          tags: options.tags || [],
          featured_media: options.featuredMedia,
        };

        let response;
        const endpoint = `${options.siteUrl}/wp-json/wp/v2/posts`;

        if (existingPostId) {
          // Update existing post
          response = await axios.put(`${endpoint}/${existingPostId}`, postData, {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          // Create new post
          response = await axios.post(endpoint, postData, {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
          });
        }

        return {
          success: true,
          info: `Published to WordPress: ${response.data.link}`,
          pid: response.data.id.toString(),
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            success: false,
            info: `WordPress API error: ${error.response?.data?.message || error.message}`,
          };
        }
        return {
          success: false,
          info: `Unexpected error: ${error.message}`,
        };
      }
    },
  };
}
```

### Ghost Publisher Plugin

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

  // Parse the Admin API key
  const [id, secret] = options.adminApiKey.split(":");

  // Create JWT token for authentication
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
        // Transform content
        const { content } = toMarkdown();

        // Convert markdown to Mobiledoc (Ghost's format)
        // You might need a markdown-to-mobiledoc converter

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
          // Update existing post
          response = await axios.put(`${endpoint}/${existingPostId}`, postData, {
            headers: {
              Authorization: `Ghost ${token}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          // Create new post
          response = await axios.post(endpoint, postData, {
            headers: {
              Authorization: `Ghost ${token}`,
              "Content-Type": "application/json",
            },
          });
        }

        return {
          success: true,
          info: `Published to Ghost: ${response.data.posts[0].url}`,
          pid: response.data.posts[0].id,
        };
      } catch (error) {
        return {
          success: false,
          info: `Ghost API error: ${error.message}`,
        };
      }
    },
  };
}
```

## AST Transformation

### Understanding the Visitor Pattern

The `visit` function allows you to traverse and modify the Markdown AST:

```ts
// Visit all nodes of a specific type
visit("heading", (node, index, parent) => {
  console.log("Found heading:", node);
});

// Visit with test function
visit(
  (node) => node.type === "heading" && node.depth === 1,
  (node) => {
    console.log("Found H1:", node);
  }
);

// Remove nodes
visit("html", (node, index, parent) => {
  parent.children.splice(index, 1);
});

// Modify nodes
visit("image", (node) => {
  node.url = transformImageUrl(node.url);
  node.alt = node.alt || "Image";
});
```

### Common Node Types

```ts
// Text node
interface Text {
  type: 'text';
  value: string;
}

// Heading node
interface Heading {
  type: 'heading';
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: Array<Text | Link | ...>;
}

// Image node
interface Image {
  type: 'image';
  url: string;
  alt?: string;
  title?: string;
}

// Code block node
interface Code {
  type: 'code';
  lang?: string;
  value: string;
}

// Link node
interface Link {
  type: 'link';
  url: string;
  children: Array<Text | ...>;
}
```

### Transformation Examples

```ts
function transformContent(visit: TVisitor) {
  // Add IDs to headings
  let headingCounter = 0;
  visit("heading", (node) => {
    headingCounter++;
    const id = `heading-${headingCounter}`;
    // Add ID as HTML comment (platform-specific)
    const idComment = {
      type: "html",
      value: `<!-- id="${id}" -->`,
    };
    node.children.unshift(idComment);
  });

  // Transform relative URLs to absolute
  const baseUrl = "https://example.com";
  visit("link", (node) => {
    if (node.url.startsWith("./") || node.url.startsWith("../")) {
      node.url = new URL(node.url, baseUrl).href;
    }
  });

  // Add lazy loading to images
  visit("image", (node) => {
    node.data = node.data || {};
    node.data.hProperties = node.data.hProperties || {};
    node.data.hProperties.loading = "lazy";
  });

  // Convert emoji shortcodes
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

## Advanced Features

### Update Tracking

Implement article update support:

```ts
export function MyPlugin(options: MyOptions): PublisherPlugin {
  let existingPostId: string | undefined;

  return {
    name: "MyPlatform",
    isTraceUpdate: true, // Enable tracking

    extendsParam(params) {
      // Receive existing post ID
      existingPostId = params.pid;
      console.log("Updating existing post:", existingPostId);
    },

    async process(articleTitle, visit, toMarkdown) {
      const { content } = toMarkdown();

      if (existingPostId) {
        // Update existing post
        const result = await updatePost(existingPostId, {
          title: articleTitle,
          content: content,
        });

        return {
          success: true,
          info: `Updated post: ${result.url}`,
          pid: existingPostId, // Keep the same ID
        };
      } else {
        // Create new post
        const result = await createPost({
          title: articleTitle,
          content: content,
        });

        return {
          success: true,
          info: `Created post: ${result.url}`,
          pid: result.id, // Save new ID
        };
      }
    },
  };
}
```

### Error Handling Patterns

```ts
async process(articleTitle, visit, toMarkdown) {
  try {
    // Validate input
    if (!articleTitle || articleTitle.trim().length === 0) {
      throw new Error('Article title is required');
    }

    // Transform content
    const { content } = toMarkdown();

    if (!content || content.trim().length === 0) {
      throw new Error('Article content is empty');
    }

    // API call with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ title: articleTitle, content }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        info: `Published: ${data.url}`,
        pid: data.id
      };
    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    // Categorize errors
    if (error.name === 'AbortError') {
      return {
        success: false,
        info: 'Request timeout - platform took too long to respond'
      };
    }

    if (error.message.includes('API error')) {
      return {
        success: false,
        info: error.message
      };
    }

    // Log unexpected errors
    console.error('Unexpected error in plugin:', error);

    return {
      success: false,
      info: `Failed to publish: ${error.message}`
    };
  }
}
```

### Rate Limiting

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
      // Wait for rate limit token
      await limiter.removeTokens(1);

      // Continue with publishing
      return publish(articleTitle, toMarkdown());
    },
  };
}
```

### Caching

```ts
const cache = new Map<string, PublishResult>();

export function CachedPlugin(options: Options): PublisherPlugin {
  return {
    name: "Cached",

    async process(articleTitle, visit, toMarkdown) {
      const { content } = toMarkdown();
      const cacheKey = `${articleTitle}-${hashContent(content)}`;

      // Check cache
      if (cache.has(cacheKey)) {
        const cachedResult = cache.get(cacheKey)!;
        console.log("Using cached result");
        return cachedResult;
      }

      // Publish
      const result = await publish(articleTitle, content);

      // Cache successful results
      if (result.success) {
        cache.set(cacheKey, result);
      }

      return result;
    },
  };
}
```

## Testing Your Plugin

### Unit Testing

```ts
import { describe, it, expect, vi } from "vitest";
import { MyPublisherPlugin } from "./my-plugin";

describe("MyPublisherPlugin", () => {
  it("should create plugin with valid config", () => {
    const plugin = MyPublisherPlugin({
      apiKey: "test-key",
    });

    expect(plugin.name).toBe("MyPublisher");
    expect(plugin.isTraceUpdate).toBe(true);
    expect(plugin.process).toBeInstanceOf(Function);
  });

  it("should throw error without API key", () => {
    expect(() => MyPublisherPlugin({})).toThrow("API key is required");
  });

  it("should publish article successfully", async () => {
    const plugin = MyPublisherPlugin({
      apiKey: "test-key",
    });

    const mockVisit = vi.fn();
    const mockToMarkdown = () => ({ content: "# Test\nContent" });

    const result = await plugin.process("Test Article", mockVisit, mockToMarkdown);

    expect(result.success).toBe(true);
    expect(result.pid).toBeDefined();
  });

  it("should handle API errors gracefully", async () => {
    const plugin = MyPublisherPlugin({
      apiKey: "invalid-key",
    });

    const result = await plugin.process("Test Article", vi.fn(), () => ({ content: "Content" }));

    expect(result.success).toBe(false);
    expect(result.info).toContain("error");
  });
});
```

### Integration Testing

```ts
import { ArticleProcessor, PublisherManager } from "@artipub/core";
import { MyPublisherPlugin } from "./my-plugin";

describe("Integration Tests", () => {
  it("should work with PublisherManager", async () => {
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

## Publishing Your Plugin

### Package Structure

```
my-artipub-plugin/
├── src/
│   ├── index.ts         # Main plugin export
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
├── test/
│   └── plugin.test.ts   # Tests
├── package.json
├── tsconfig.json
└── README.md
```

### Package.json

```json
{
  "name": "artipub-plugin-myplatform",
  "version": "1.0.0",
  "description": "MyPlatform publisher plugin for ArtiPub",
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

### Export Pattern

```ts
// src/index.ts
export { MyPublisherPlugin } from "./plugin";
export type { MyPluginOptions } from "./types";

// Usage by consumers
import { MyPublisherPlugin } from "artipub-plugin-myplatform";
```

## Best Practices

1. **Validate Options Early**: Check required fields in the factory function
2. **Handle Errors Gracefully**: Always return `PublishResult` even on failure
3. **Use TypeScript**: Provide type definitions for better developer experience
4. **Document Platform Requirements**: List supported features and limitations
5. **Test Thoroughly**: Include unit and integration tests
6. **Version Compatibility**: Use peerDependencies for @artipub/core
7. **Logging**: Add optional debug logging for troubleshooting
8. **Respect Rate Limits**: Implement proper rate limiting for APIs
9. **Security**: Never log sensitive data like API keys
10. **Idempotency**: Make operations idempotent when possible

## Resources

- [ArtiPub Core API](../processor.md)
- [AST Documentation](https://github.com/syntax-tree/mdast)
- [unified Documentation](https://github.com/unifiedjs/unified)
- [Publisher Plugin Examples](https://github.com/artipub/artipub/tree/main/packages/core/src/plugins)
