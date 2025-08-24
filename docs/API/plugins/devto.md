---
outline: deep
title: Dev.to Plugin
---

# DevToPublisherPlugin

The DevToPublisherPlugin enables publishing articles to Dev.to and other Forem-based community platforms. It supports drafts, series, tags, and organization publishing.

## Installation

The plugin is included in the `@artipub/core` package:

```bash
npm install @artipub/core
```

## Configuration

```ts
interface DevToPublisherPluginOption {
  /**
   * Dev.to API key
   * Required: Yes
   */
  api_key: string;

  /**
   * Article ID for updating existing articles
   * Required: No
   */
  article_id?: string;

  /**
   * Whether to publish immediately or save as draft
   * Required: No
   * @default false
   */
  published?: boolean;

  /**
   * Article series name
   * Required: No
   */
  series?: string;

  /**
   * Cover image URL (must be absolute URL)
   * Required: No
   * Recommended: 1000x420px for best results
   */
  main_image?: string;

  /**
   * Article description for SEO and preview
   * Required: No
   * Max length: 150 characters
   */
  description?: string;

  /**
   * Organization ID for publishing under an organization
   * Required: No
   */
  organization_id?: number;
}
```

## Important: Tags Handling

Tags are **automatically extracted** from your Markdown content's frontmatter. You cannot pass tags through the plugin configuration.

### How to Add Tags to Your Article

Add a tags section in your Markdown frontmatter:

```markdown
---
tags:
  - javascript
  - webdev
  - tutorial
  - beginners
---

# Your Article Title

Article content...
```

The plugin will automatically extract these tags and include them when publishing to Dev.to.

## Setup Guide

### Step 1: Generate API Key

1. Log in to your Dev.to account
2. Navigate to [Settings → Extensions](https://dev.to/settings/extensions)
3. Scroll down to the "DEV API Keys" section
4. Enter a description for your key (e.g., "ArtiPub Publisher")
5. Click "Generate API Key"
6. Copy the generated key immediately (it won't be shown again)

![Dev.to API Key Generation](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200945604.png)

### Step 2: Find Organization ID (Optional)

If publishing under an organization:

1. Go to your organization's dashboard
2. Check the URL: `https://dev.to/dashboard/organization/{org_id}`
3. Or use the API to list organizations:

```bash
curl -H "api-key: YOUR_API_KEY" https://dev.to/api/organizations
```

## Usage

### Basic Example

```ts
import { ArticleProcessor, PublisherManager, DevToPublisherPlugin } from "@artipub/core";

// Process your article first
const processor = new ArticleProcessor({
  uploadImgOption: {
    // Your image upload configuration
  },
});

const { content } = await processor.processMarkdown("./article.md");

// Create publisher and add Dev.to plugin
const publisher = new PublisherManager(content);

publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    published: false, // Save as draft
  })
);

// Publish to Dev.to
const results = await publisher.publish();
console.log(results);
// Output: [{ name: 'DevToPublisher', success: true, info: '...', pid: '...' }]
```

### Complete Configuration Example

```ts
publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    published: false, // Start as draft
    series: "JavaScript Deep Dive", // Add to series
    main_image: "https://example.com/cover.jpg",
    description: "Learn advanced JavaScript concepts with practical examples",
    // Note: tags are automatically extracted from article content
    organization_id: 12345, // Publish under organization
  })
);
```

### Publishing Strategies

#### Draft First Strategy

```ts
// 1. Publish as draft for review
const draftPlugin = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  published: false,
  // Note: tags are automatically extracted from article content
});

publisher.addPlugin(draftPlugin);
const results = await publisher.publish();

// 2. Later, update to published via Dev.to UI or API
```

#### Immediate Publishing

```ts
// Publish immediately (use with caution)
const livePlugin = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  published: true,
  // Note: tags are automatically extracted from article content
});

publisher.addPlugin(livePlugin);
await publisher.publish();
```

#### Series Management

```ts
// Add article to an existing series
const seriesPlugin = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  series: "Building a REST API", // Exact series name
  published: false,
});

// Articles in the same series will be linked together
publisher.addPlugin(seriesPlugin);
```

## Features

### Supported Markdown Elements

Dev.to supports standard Markdown with some extensions:

| Element          | Support    | Notes                       |
| ---------------- | ---------- | --------------------------- |
| Headings         | ✅ Full    | h1-h6                       |
| Bold/Italic      | ✅ Full    | Standard markdown           |
| Links            | ✅ Full    | Inline and reference        |
| Images           | ✅ Full    | Auto-uploaded from markdown |
| Code blocks      | ✅ Full    | With syntax highlighting    |
| Inline code      | ✅ Full    | Backtick syntax             |
| Lists            | ✅ Full    | Ordered and unordered       |
| Tables           | ✅ Full    | GitHub-flavored markdown    |
| Blockquotes      | ✅ Full    | Standard markdown           |
| Horizontal rules | ✅ Full    | --- or \*\*\*               |
| HTML             | ⚠️ Limited | Some tags allowed           |

### Special Dev.to Features

#### Liquid Tags

Dev.to supports Liquid tags for embeds:

```markdown
{% embed https://github.com/user/repo %}
{% youtube VIDEO_ID %}
{% twitter 1234567890 %}
{% codepen https://codepen.io/... %}
```

#### Table of Contents

Automatically generated from headings. Use `{:toc}` marker for custom placement.

#### Syntax Highlighting

Supports 100+ languages with automatic detection:

````markdown
```javascript
const example = "Syntax highlighting works!";
```

```python
def hello_world():
    print("Hello from Python!")
```
````

### Article Updates

The plugin tracks published articles for updates:

```ts
// First publish - creates new article
const results = await publisher.publish();
const articleId = results[0].pid; // Save this ID

// Later update - updates existing article
// The plugin automatically uses the saved ID
await publisher.publish();
```

## Advanced Usage

### Custom Frontmatter Handling

Dev.to articles can include frontmatter that the plugin handles automatically:

```ts
const content = `---
title: My Article Title
published: false
tags: javascript, webdev
series: My Series
---

# Article Content
...`;

// The plugin extracts and uses frontmatter values
const publisher = new PublisherManager(content);
```

### Rate Limiting

Dev.to API has rate limits (30 requests per 30 seconds). Handle accordingly:

```ts
async function publishMultipleArticles(articles: string[]) {
  for (const article of articles) {
    const publisher = new PublisherManager(article);
    publisher.addPlugin(devtoPlugin);

    try {
      await publisher.publish();
      // Respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      if (error.response?.status === 429) {
        console.log("Rate limited, waiting...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }
  }
}
```

### Working with Organizations

```ts
// List your organizations
async function getOrganizations(apiKey: string) {
  const response = await fetch("https://dev.to/api/organizations", {
    headers: { "api-key": apiKey },
  });
  return response.json();
}

// Publish under organization
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

## Troubleshooting

### Common Issues

#### 1. "401 Unauthorized" Error

**Cause**: Invalid or missing API key

**Solution**:

- Verify API key is correct
- Ensure no extra spaces in the key
- Regenerate key if necessary

#### 2. "422 Unprocessable Entity" Error

**Cause**: Invalid article data

**Common reasons**:

- Too many tags (max 4)
- Invalid tag format (use lowercase, no spaces)
- Description too long (max 150 chars)
- Invalid series name

**Solution**:

```ts
// Validate before publishing
const validTags = tags
  .slice(0, 4) // Max 4 tags
  .map((tag) => tag.toLowerCase().replace(/\s+/g, "")); // Clean tags

const validDescription = description.slice(0, 150); // Truncate if needed
```

#### 3. "429 Too Many Requests" Error

**Cause**: Rate limit exceeded

**Solution**:

- Implement exponential backoff
- Add delays between requests
- Cache responses when possible

#### 4. Images Not Displaying

**Cause**: Invalid image URLs or format

**Solution**:

- Use absolute URLs for images
- Ensure images are publicly accessible
- Supported formats: JPG, PNG, GIF, WebP

### Debug Mode

Enable detailed logging:

```ts
const plugin = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  published: false,
});

// Wrap with logging
const originalProcess = plugin.process;
plugin.process = async (title, visit, toMarkdown) => {
  console.log("Publishing to Dev.to:", { title });

  try {
    const result = await originalProcess(title, visit, toMarkdown);
    console.log("Dev.to response:", result);
    return result;
  } catch (error) {
    console.error("Dev.to error:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
```

## Best Practices

### 1. Tag Strategy

Use meaningful, searchable tags:

```ts
const tagStrategy = {
  language: "javascript", // Primary technology
  level: "beginners", // Audience level
  category: "tutorial", // Content type
  topic: "webdev", // General topic
};

publisher.addPlugin(
  DevToPublisherPlugin({
    api_key: process.env.DEVTO_API_KEY!,
    tags: Object.values(tagStrategy).slice(0, 4),
  })
);
```

### 2. SEO Optimization

```ts
// Optimize for discoverability
const seoOptimized = DevToPublisherPlugin({
  api_key: process.env.DEVTO_API_KEY!,
  description: "Clear, compelling description with keywords", // SEO description
  main_image: "https://example.com/eye-catching-cover.jpg", // Attractive cover
  // Note: tags are automatically extracted from article content
});
```

### 3. Series Organization

```ts
// Organize related content
const seriesArticles = [
  { title: "Part 1: Introduction", content: "..." },
  { title: "Part 2: Deep Dive", content: "..." },
  { title: "Part 3: Advanced Topics", content: "..." },
];

for (const article of seriesArticles) {
  const publisher = new PublisherManager(article.content);
  publisher.addPlugin(
    DevToPublisherPlugin({
      api_key: process.env.DEVTO_API_KEY!,
      series: "My Tutorial Series", // Same series name
      published: false,
    })
  );
  await publisher.publish();
}
```

### 4. Environment Configuration

```ts
// Different settings per environment
const devtoConfig = {
  api_key: process.env.DEVTO_API_KEY!,
  published: process.env.NODE_ENV === "production",
  // Note: tags are automatically extracted from article content
};

publisher.addPlugin(DevToPublisherPlugin(devtoConfig));
```

## API Endpoints Reference

### Articles

- `POST /api/articles` - Create article
- `PUT /api/articles/{id}` - Update article
- `GET /api/articles/{id}` - Get article
- `GET /api/articles` - List articles

### Organizations

- `GET /api/organizations` - List organizations
- `GET /api/organizations/{username}` - Get organization

### Users

- `GET /api/users/me` - Get authenticated user

## Related Resources

- [Dev.to API Documentation](https://developers.forem.com/api/v1)
- [Dev.to Markdown Guide](https://dev.to/p/markdown_basics)
- [Liquid Tags Reference](https://dev.to/p/liquid_tags)
- [API Rate Limits](https://developers.forem.com/api/#section/Rate-limiting)

## See Also

- [ArticleProcessor API](../processor.md)
- [PublisherManager API](../publisher.md)
- [Custom Plugin Development](./custom.md)
