---
outline: deep
title: Notion Plugin
---

# NotionPublisherPlugin

The NotionPublisherPlugin enables publishing articles directly to Notion pages, automatically converting Markdown content to Notion's block format.

## Installation

The plugin is included in the `@artipub/core` package:

```bash
npm install @artipub/core
```

## Configuration

```ts
interface NotionPublisherPluginOption {
  /**
   * Notion API key from your integration
   * Required: Yes
   */
  api_key: string;

  /**
   * Parent page ID where articles will be published as subpages
   * Required: Yes
   */
  page_id: string;

  /**
   * Specific page ID to update (overrides automatic tracking)
   * Required: No
   */
  update_page_id?: string;
}
```

## Setup Guide

### Step 1: Create Notion Integration

1. Navigate to [Notion Integrations](https://www.notion.so/profile/integrations)
2. Click "New integration"
3. Configure your integration:
   - **Name**: Give it a descriptive name (e.g., "ArtiPub Publisher")
   - **Associated workspace**: Select your workspace
   - **Capabilities**: Ensure "Read content", "Update content", and "Insert content" are enabled
4. Click "Submit" to create the integration
5. Copy the "Internal Integration Token" - this is your `api_key`

![Notion API Key Location](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200927324.png)

### Step 2: Connect Integration to Page

1. Create or select a page in Notion where articles will be published (e.g., "Articles Inbox")
2. Connect the integration to the page:
   - Open the page in Notion
   - Click the "..." menu in the top-right corner
   - Select "Add connections"
   - Search for and select your integration

![Connect Integration to Page](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200933939.png)

### Step 3: Get Page ID

There are two methods to obtain the page ID:

#### Method 1: From URL

1. Open the page in Notion
2. Click "Copy link" from the page menu
3. The URL format: `https://www.notion.so/Page-Name-{page_id}`
4. Extract the ID after the last hyphen

Example:

```
URL: https://www.notion.so/My-Articles-abc123def456
Page ID: abc123def456
```

#### Method 2: From Developer Tools

1. Open Notion in your browser
2. Open Developer Tools (F12)
3. Navigate to the Network tab
4. Reload the page
5. Look for requests containing the page ID

![Extract Page ID](https://cdn.jsdelivr.net/gh/yxw007/blogpicbed@master/img/202407200949155.png)

## Usage

### Basic Example

```ts
import { ArticleProcessor, PublisherManager, NotionPublisherPlugin } from "@artipub/core";

// Process your article first
const processor = new ArticleProcessor({
  uploadImgOption: {
    // Your image upload configuration
  },
});

const { content } = await processor.processMarkdown("./article.md");

// Create publisher and add Notion plugin
const publisher = new PublisherManager(content);

publisher.addPlugin(
  NotionPublisherPlugin({
    api_key: process.env.NOTION_API_KEY!,
    page_id: process.env.NOTION_PAGE_ID!,
  })
);

// Publish to Notion
const results = await publisher.publish();
console.log(results);
// Output: [{ name: 'NotionPublisher', success: true, info: '...', pid: '...' }]
```

### With Environment Variables

Create a `.env` file:

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PAGE_ID=abc123def456789
```

Use in your code:

```ts
import dotenv from "dotenv";
dotenv.config();

publisher.addPlugin(
  NotionPublisherPlugin({
    api_key: process.env.NOTION_API_KEY!,
    page_id: process.env.NOTION_PAGE_ID!,
  })
);
```

### Advanced: Publishing to Database

If your page_id points to a Notion database, articles will be created as database entries:

```ts
// Database-specific configuration
const notionPlugin = NotionPublisherPlugin({
  api_key: process.env.NOTION_API_KEY!,
  page_id: process.env.NOTION_DATABASE_ID!, // Database ID instead of page ID
});

// The plugin will automatically detect it's a database and create entries
publisher.addPlugin(notionPlugin);
```

## Features

### Supported Markdown Elements

The plugin automatically converts these Markdown elements to Notion blocks:

| Markdown Element          | Notion Block Type             |
| ------------------------- | ----------------------------- |
| Headings (h1-h3)          | Heading blocks                |
| Paragraphs                | Paragraph blocks              |
| Bold/Italic               | Rich text formatting          |
| Links                     | Link annotations              |
| Images                    | Image blocks                  |
| Code blocks               | Code blocks with language     |
| Inline code               | Code annotations              |
| Blockquotes               | Quote blocks                  |
| Lists (ordered/unordered) | Numbered/Bulleted list blocks |
| Tables                    | Table blocks                  |
| Horizontal rules          | Divider blocks                |

### Image Handling

- Local images are automatically uploaded to Notion
- External image URLs are preserved
- Images maintain their alt text as captions

### Code Block Support

Code blocks preserve syntax highlighting:

```ts
// This TypeScript code will have proper syntax highlighting in Notion
const example = "syntax highlighting works!";
```

### Article Updates

When `isTraceUpdate` is enabled (default), the plugin tracks published articles:

1. **First publish**: Creates a new Notion page and saves the page ID
2. **Subsequent publishes**: Updates the existing page instead of creating duplicates

```ts
// Article with unique ID will be tracked
const content = `# My Article
id: unique_article_123

Article content...`;

// First publish - creates new page
await publisher.publish();

// Later update - updates the same page
await publisher.publish();
```

## Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error

**Cause**: Invalid API key or integration not connected to page

**Solution**:

- Verify your API key is correct
- Ensure the integration is connected to the target page
- Check integration permissions

#### 2. "Object not found" Error

**Cause**: Invalid page ID or page doesn't exist

**Solution**:

- Double-check the page ID extraction
- Ensure the page exists and hasn't been deleted
- Verify you're using the correct workspace

#### 3. "Insufficient permissions" Error

**Cause**: Integration lacks necessary permissions

**Solution**:

- Check integration capabilities in Notion settings
- Ensure "Insert content" and "Update content" are enabled
- Re-connect the integration to the page

#### 4. Images Not Appearing

**Cause**: Image upload failed or invalid URLs

**Solution**:

- Ensure images are properly processed by ArticleProcessor
- Check that image URLs are accessible
- Verify Notion has permission to access external images

### Debug Mode

Enable debug logging to troubleshoot issues:

```ts
const plugin = NotionPublisherPlugin({
  api_key: process.env.NOTION_API_KEY!,
  page_id: process.env.NOTION_PAGE_ID!,
});

// Add custom logging
const originalProcess = plugin.process;
plugin.process = async (...args) => {
  console.log("Publishing to Notion...");
  try {
    const result = await originalProcess.apply(plugin, args);
    console.log("Notion publish result:", result);
    return result;
  } catch (error) {
    console.error("Notion publish error:", error);
    throw error;
  }
};
```

## Best Practices

### 1. Organize with Databases

Use Notion databases for better organization:

```ts
// Publish to a database with properties
const dbPlugin = NotionPublisherPlugin({
  api_key: process.env.NOTION_API_KEY!,
  page_id: process.env.NOTION_DATABASE_ID!,
});

// Articles become database entries with metadata
```

### 2. Error Handling

Always handle potential failures:

```ts
try {
  const results = await publisher.publish();
  const notionResult = results.find((r) => r.name === "NotionPublisher");

  if (!notionResult?.success) {
    console.error("Notion publish failed:", notionResult?.info);
    // Implement fallback logic
  }
} catch (error) {
  console.error("Publishing error:", error);
  // Handle critical errors
}
```

### 3. Rate Limiting

Notion API has rate limits. Implement delays for bulk publishing:

```ts
async function publishMultipleArticles(articles: string[]) {
  for (const article of articles) {
    const publisher = new PublisherManager(article);
    publisher.addPlugin(notionPlugin);

    await publisher.publish();

    // Add delay to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
```

### 4. Environment-Specific Configuration

Use different Notion pages for different environments:

```ts
const notionConfig = {
  api_key: process.env.NOTION_API_KEY!,
  page_id: process.env.NODE_ENV === "production" ? process.env.NOTION_PROD_PAGE_ID! : process.env.NOTION_DEV_PAGE_ID!,
};

publisher.addPlugin(NotionPublisherPlugin(notionConfig));
```

## API Reference

- [Notion API Documentation](https://developers.notion.com/docs)
- [Notion Integration Guide](https://developers.notion.com/docs/create-a-notion-integration)
- [Notion Block Types](https://developers.notion.com/reference/block)
- [Notion Database Properties](https://developers.notion.com/reference/database)

## Related

- [ArticleProcessor API](../processor.md)
- [PublisherManager API](../publisher.md)
- [Custom Plugin Development](./custom.md)
