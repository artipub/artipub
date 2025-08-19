---
outline: deep
title: PublisherManager
---

# PublisherManager

PublisherManager is responsible for orchestrating the publication of processed articles to multiple platforms simultaneously. It manages publisher plugins and coordinates the publishing workflow.

## Overview

The PublisherManager class:

- Manages multiple publisher plugins
- Publishes content to all registered platforms in parallel
- Tracks published articles for future updates
- Provides unified error handling and result reporting

## Constructor

```ts
class PublisherManager {
  constructor(content: string);
}
```

**Parameters:**

- `content` (string): Processed Markdown content from ArticleProcessor

## Methods

### addPlugin

Registers a publisher plugin for a specific platform.

```ts
addPlugin(plugin: PublisherPlugin): void
```

**Parameters:**

- `plugin` (PublisherPlugin): Platform-specific publisher plugin

**Example:**

```ts
const manager = new PublisherManager(content);
manager.addPlugin(NotionPublisherPlugin({ api_key: "...", page_id: "..." }));
manager.addPlugin(DevToPublisherPlugin({ api_key: "...", published: false }));
```

### publish

Publishes the article to all registered platforms simultaneously.

```ts
publish(): Promise<PublishResult[]>
```

**Returns:**

- `Promise<PublishResult[]>`: Array of results from each platform

```ts
interface PublishResult {
  pid?: string; // Platform-specific post ID
  name?: string; // Plugin name
  success: boolean; // Whether publication succeeded
  info?: string; // Success/error message
}
```

## PublisherPlugin Interface

All publisher plugins must implement this interface:

```ts
interface PublisherPlugin {
  extendsParam?(extendsParam: ExtendsParam): PublisherPlugin; // Receive tracked article data
  process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult>;
  update?(article_id: string | undefined, articleTitle: string, content: string): Promise<void>; // Update existing articles
  name: string; // Plugin identifier
  isTraceUpdate?: boolean; // Track for future updates
}

interface ExtendsParam {
  pid?: string; // Existing post ID from tracking
}

type ToMarkdown = () => { content: string };
```

### Plugin Parameters

- `articleTitle`: Extracted article title from the first H1 heading
- `visit`: AST visitor for platform-specific content transformations
- `toMarkdown`: Function to convert modified AST back to Markdown

## Complete Example

### Basic Multi-Platform Publishing

```ts
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin, NativePublisherPlugin } from "@artipub/core";
import path from "path";

// Step 1: Process the article
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

// Step 2: Setup publisher
const publisher = new PublisherManager(content);

// Add Notion publisher
publisher.addPlugin(
  NotionPublisherPlugin({
    api_key: process.env.NOTION_API_KEY!,
    page_id: process.env.NOTION_PAGE_ID!,
  })
);

// Add Dev.to publisher
publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    published: false, // Save as draft
    series: "My Tutorial Series",
    main_image: "https://example.com/cover.jpg",
    description: "Article description for SEO",
  })
);

// Add local file publisher
publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "/home/user/blog/content/posts",
    cdn_prefix: "https://cdn.jsdelivr.net/gh",
    res_domain: "raw.githubusercontent.com",
  })
);

// Step 3: Publish to all platforms
const results = await publisher.publish();

// Step 4: Handle results
results.forEach((result) => {
  if (result.success) {
    console.log(`✅ ${result.name}: ${result.info}`);
  } else {
    console.error(`❌ ${result.name}: ${result.info}`);
  }
});
```

### Advanced: Custom Publisher Plugin

```ts
import { PublisherPlugin, PublishResult } from "@artipub/core";
import axios from "axios";

// Create a custom publisher for your platform
function CustomBlogPublisher(options: CustomBlogOptions): PublisherPlugin {
  return {
    name: "CustomBlog",
    isTraceUpdate: true, // Enable update tracking

    extendsParam(params) {
      // Extend with existing post ID for updates
      if (params.pid) {
        options.postId = params.pid;
      }
    },

    async process(articleTitle, visit, toMarkdown) {
      try {
        // Transform content for your platform
        visit("image", (node) => {
          // Convert image URLs to your CDN
          node.url = `https://mycdn.com/proxy?url=${encodeURIComponent(node.url)}`;
        });

        // Remove elements not supported by your platform
        visit("html", (node, index, parent) => {
          parent.children.splice(index, 1);
        });

        // Get the transformed content
        const { content } = toMarkdown();

        // Publish to your platform
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
          info: `Published to CustomBlog: ${response.data.url}`,
          pid: response.data.id, // Save for future updates
        };
      } catch (error) {
        return {
          success: false,
          info: `Failed to publish: ${error.message}`,
        };
      }
    },
  };
}

// Use the custom publisher
const publisher = new PublisherManager(content);
publisher.addPlugin(
  CustomBlogPublisher({
    apiKey: process.env.CUSTOM_BLOG_API_KEY!,
    tags: ["tutorial", "javascript"],
    draft: false,
  })
);
```

## Article Update Tracking

ArtiPub automatically tracks published articles for updates when `isTraceUpdate` is enabled:

1. **First Publication**:

   - Generates unique article ID
   - Stores platform-specific post IDs in `postMapRecords.json`

2. **Subsequent Updates**:
   - Retrieves existing post IDs
   - Updates existing posts instead of creating duplicates

### postMapRecords.json Structure

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

## Error Handling

### Individual Plugin Failures

By default, if one plugin fails, others continue publishing:

```ts
const results = await publisher.publish();

const successful = results.filter((r) => r.success);
const failed = results.filter((r) => !r.success);

console.log(`Published to ${successful.length}/${results.length} platforms`);

if (failed.length > 0) {
  console.error(
    "Failed platforms:",
    failed.map((f) => f.name)
  );
}
```

### Fail-Fast Strategy

To stop on first failure:

```ts
class StrictPublisherManager extends PublisherManager {
  async publish() {
    const results = [];

    for (const plugin of this.plugins) {
      const result = await plugin.process(/* ... */);

      if (!result.success) {
        throw new Error(`Publishing failed: ${result.info}`);
      }

      results.push(result);
    }

    return results;
  }
}
```

## Performance Optimization

### Parallel Publishing

By default, PublisherManager publishes to all platforms in parallel for optimal performance:

```ts
// All platforms publish simultaneously
const results = await publisher.publish();
```

### Sequential Publishing

For rate-limited APIs or ordered dependencies:

```ts
async function publishSequentially(publisher: PublisherManager) {
  const results = [];

  // Publish one by one
  for (const plugin of publisher.plugins) {
    const result = await plugin.process(/* ... */);
    results.push(result);

    // Add delay if needed
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
```

## Best Practices

1. **Environment Variables**: Store API keys and sensitive data in environment variables

   ```bash
   NOTION_API_KEY=secret_xxx
   DEVTO_API_KEY=xxx
   ```

2. **Error Recovery**: Implement retry logic for transient failures

   ```ts
   async function publishWithRetry(publisher, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       const results = await publisher.publish();
       const failed = results.filter((r) => !r.success);

       if (failed.length === 0) return results;

       console.log(`Retry ${i + 1}/${maxRetries} for failed platforms...`);
       await new Promise((resolve) => setTimeout(resolve, 2000));
     }
   }
   ```

3. **Logging**: Implement comprehensive logging for debugging

   ```ts
   publisher.addPlugin(withLogging(NotionPublisherPlugin(options), "Notion"));

   function withLogging(plugin, name) {
     const original = plugin.process;
     plugin.process = async (...args) => {
       console.log(`Publishing to ${name}...`);
       const start = Date.now();

       try {
         const result = await original(...args);
         console.log(`${name} completed in ${Date.now() - start}ms`);
         return result;
       } catch (error) {
         console.error(`${name} failed:`, error);
         throw error;
       }
     };
     return plugin;
   }
   ```

4. **Validation**: Validate content before publishing

   ```ts
   if (!content || content.trim().length === 0) {
     throw new Error("Content is empty");
   }

   if (!content.includes("# ")) {
     console.warn("No title found in content");
   }
   ```

## API Reference

- [Notion API Documentation](https://developers.notion.com/)
- [Dev.to API Documentation](https://developers.forem.com/api)
- [GitHub API Documentation](https://docs.github.com/en/rest)
