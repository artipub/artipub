---
outline: deep
title: Publisher Plugins
---

# Publisher Plugins

Publisher plugins are the bridge between ArtiPub and various publishing platforms. They handle platform-specific transformations and API interactions.

## Overview

ArtiPub uses a plugin-based architecture that allows you to:

- Publish to multiple platforms simultaneously
- Transform content for platform-specific requirements
- Track published articles for future updates
- Create custom integrations with any platform

## Built-in Plugins

ArtiPub provides three production-ready plugins:

### [NotionPublisherPlugin](./plugins/notion.md)

Publish articles directly to Notion pages or databases.

**Key Features:**

- Automatic Markdown to Notion blocks conversion
- Support for nested pages and databases
- Image upload and embedding
- Full formatting preservation

**Quick Start:**

```ts
import { NotionPublisherPlugin } from "@artipub/core";

publisher.addPlugin(
  NotionPublisherPlugin({
    api_key: process.env.NOTION_API_KEY!,
    page_id: process.env.NOTION_PAGE_ID!,
  })
);
```

[View Full Documentation →](./plugins/notion.md)

### [DevToPublisherPlugin](./plugins/devto.md)

Publish articles to Dev.to and other Forem-based communities.

**Key Features:**

- Draft and published states
- Series organization
- SEO optimization
- Organization publishing

**Quick Start:**

```ts
import { DevToPublisherPlugin } from "@artipub/core";

publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    published: false,
  })
);
```

[View Full Documentation →](./plugins/devto.md)

### [NativePublisherPlugin](./plugins/native.md)

Save articles to the local file system for static site generators.

**Key Features:**

- Local file system saving
- CDN URL transformation for GitHub images
- UTF-8 encoding
- Simple integration with static site generators

**Quick Start:**

```ts
import { NativePublisherPlugin } from "@artipub/core";

publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "./content/posts",
  })
);
```

[View Full Documentation →](./plugins/native.md)

## Plugin Interface

All plugins implement the `PublisherPlugin` interface:

```ts
interface PublisherPlugin {
  extendsParam?(extendsParam: ExtendsParam): PublisherPlugin; // Receive tracked data
  process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult>; // Main processing function
  update?(article_id: string | undefined, articleTitle: string, content: string): Promise<void>; // Update existing articles
  name: string; // Plugin identifier
  isTraceUpdate?: boolean; // Enable update tracking
}

interface PublishResult {
  pid?: string; // Platform post ID
  name?: string; // Plugin name
  success: boolean; // Publication status
  info?: string; // Status message
}

interface ExtendsParam {
  pid?: string; // Existing post ID from tracking
}

type ToMarkdown = () => { content: string };
```

## Creating Custom Plugins

Build your own plugin to integrate with any platform:

```ts
import { PublisherPlugin } from "@artipub/core";

function MyPlatformPlugin(options: MyOptions): PublisherPlugin {
  return {
    name: "MyPlatform",
    isTraceUpdate: true,

    async process(articleTitle, visit, toMarkdown) {
      // Transform content
      visit("image", (node) => {
        node.url = transformUrl(node.url);
      });

      // Get final content
      const { content } = toMarkdown();

      // Publish to platform
      const result = await publishToAPI(articleTitle, content);

      return {
        success: true,
        info: `Published: ${result.url}`,
        pid: result.id,
      };
    },
  };
}
```

[View Custom Plugin Guide →](./plugins/custom.md)

## Using Plugins

### Single Platform

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

### Multiple Platforms

```ts
import { PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin, NativePublisherPlugin } from "@artipub/core";

const publisher = new PublisherManager(processedContent);

// Add multiple plugins
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

// Publish to all platforms simultaneously
const results = await publisher.publish();

// Handle results
results.forEach((result) => {
  console.log(`${result.name}: ${result.success ? "✅" : "❌"} ${result.info}`);
});
```

## Plugin Features

### Content Transformation

Plugins can modify content for platform-specific requirements:

```ts
process(articleTitle, visit, toMarkdown) {
  // Remove unsupported elements
  visit('html', (node, index, parent) => {
    parent.children.splice(index, 1);
  });

  // Modify images
  visit('image', (node) => {
    node.url = cdnUrl(node.url);
  });

  // Get transformed content
  const { content } = toMarkdown();
}
```

### Update Tracking

Plugins with `isTraceUpdate: true` can update existing posts:

```ts
{
  name: "MyPlatform",
  isTraceUpdate: true,

  extendsParam(params) {
    this.postId = params.pid; // Receive existing post ID
  },

  async process(/* ... */) {
    if (this.postId) {
      // Update existing post
    } else {
      // Create new post
    }
  }
}
```

### Error Handling

Plugins should always return a result, even on failure:

```ts
async process(articleTitle, visit, toMarkdown) {
  try {
    // Publishing logic
    return {
      success: true,
      info: "Published successfully"
    };
  } catch (error) {
    return {
      success: false,
      info: error.message
    };
  }
}
```

## Best Practices

1. **Environment Variables**: Store sensitive data securely

   ```ts
   NotionPublisherPlugin({
     api_key: process.env.NOTION_API_KEY!,
     page_id: process.env.NOTION_PAGE_ID!,
   });
   ```

2. **Error Recovery**: Handle failures gracefully

   ```ts
   const results = await publisher.publish();
   const failed = results.filter((r) => !r.success);

   if (failed.length > 0) {
     // Retry or fallback logic
   }
   ```

3. **Rate Limiting**: Respect API limits

   ```ts
   for (const article of articles) {
     await publisher.publish();
     await delay(1000); // Prevent rate limiting
   }
   ```

4. **Validation**: Check content before publishing

   ```ts
   if (!content || content.trim().length === 0) {
     throw new Error("Content is empty");
   }
   ```

## Plugin Development Resources

- [Custom Plugin Development Guide](./plugins/custom.md)
- [AST Transformation Reference](https://github.com/syntax-tree/mdast)
- [Example Plugins](https://github.com/artipub/artipub/tree/main/packages/core/src/plugins)

## API References

- [PublisherManager API](./publisher.md)
- [ArticleProcessor API](./processor.md)
- [Platform API Documentation](#platform-apis)

### Platform APIs

- [Notion API](https://developers.notion.com/)
- [Dev.to API](https://developers.forem.com/api)
- [Medium API](https://github.com/Medium/medium-api-docs)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Ghost API](https://ghost.org/docs/content-api/)

## Community Plugins

> Share your custom plugins with the community! Submit a PR to add your plugin to this list.

## Support

- [GitHub Issues](https://github.com/artipub/artipub/issues)
- [Discussions](https://github.com/artipub/artipub/discussions)
- [Contributing Guide](../guide/contribute.md)
