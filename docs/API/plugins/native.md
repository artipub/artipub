---
outline: deep
title: Native Plugin
---

# NativePublisherPlugin

The NativePublisherPlugin publishes articles to the local file system, perfect for static site generators like Hugo, Jekyll, Gatsby, or custom blog systems. It handles image URL transformations for CDN optimization.

## Installation

The plugin is included in the `@artipub/core` package:

```bash
npm install @artipub/core
```

## Configuration

```ts
interface NativePublisherOption {
  /**
   * Absolute path where the article will be saved
   * Required: Yes
   */
  destination_path: string;

  /**
   * CDN prefix for transforming GitHub raw URLs
   * Required: No
   * @default "https://cdn.jsdelivr.net/gh"
   */
  cdn_prefix?: string;

  /**
   * Domain to replace for image URLs
   * Required: No
   * @default "raw.githubusercontent.com"
   */
  res_domain?: string;
}
```

## Usage Examples

### Basic File System Publishing

```ts
import { PublisherManager, NativePublisherPlugin } from "@artipub/core";

const publisher = new PublisherManager(processedContent);

publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "/home/user/blog/content/posts",
  })
);

await publisher.publish();
// Creates: /home/user/blog/content/posts/Article Title.md
```

### With CDN URL Transformation

```ts
publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "./content/posts",
    cdn_prefix: "https://cdn.jsdelivr.net/gh",
    res_domain: "raw.githubusercontent.com",
  })
);

// Transforms GitHub raw URLs to CDN URLs in the output file
// Before: https://raw.githubusercontent.com/user/repo/main/image.png
// After: https://cdn.jsdelivr.net/gh/user/repo@main/image.png
```

## Static Site Generator Integration

The plugin saves articles as standard Markdown files that can be used with any static site generator:

### Hugo
Place files in `./content/posts/` directory

### Jekyll
Place files in `./_posts/` directory

### Gatsby
Place files in `./src/content/blog/` directory

### Next.js
Place files in `./posts/` or configured content directory

## Image URL Transformation

The plugin automatically transforms GitHub raw image URLs to use CDN for better performance:

### Default Transformation
- **Source Domain**: `raw.githubusercontent.com`
- **Target CDN**: `https://cdn.jsdelivr.net/gh`

### Custom CDN Configuration

```ts
publisher.addPlugin(
  NativePublisherPlugin({
    destination_path: "./output",
    cdn_prefix: "https://custom-cdn.com",
    res_domain: "my-image-host.com",
  })
);

// Transforms: https://my-image-host.com/image.png
// To: https://custom-cdn.com/image.png
```

## Complete Example

```ts
import { ArticleProcessor, PublisherManager, NativePublisherPlugin } from "@artipub/core";
import path from "path";

// Process article
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

// Publish to local file system
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

## Output Format

The plugin saves articles as plain Markdown files with:
- Filename: `{articleTitle}.md`
- Content: Processed Markdown with transformed image URLs
- Encoding: UTF-8

## Best Practices

1. **Use Absolute Paths**: Always provide absolute paths for `destination_path`
   ```ts
   path.resolve(__dirname, "./content/posts")
   ```

2. **Create Directory First**: Ensure the destination directory exists
   ```ts
   import fs from "fs";
   fs.mkdirSync("./content/posts", { recursive: true });
   ```

3. **CDN Optimization**: Use CDN transformation for better image loading performance

4. **Error Handling**: Wrap publish calls in try-catch blocks
   ```ts
   try {
     await publisher.publish();
   } catch (error) {
     console.error("Failed to save article:", error);
   }
   ```

## Limitations

- Files are saved with the article title as filename
- No automatic front matter generation (use your SSG's scripts for this)
- Directory must exist before publishing
- No update tracking support - files are always overwritten
- Cannot update existing articles by ID (only overwrites by title)

## See Also

- [PublisherManager API](../publisher.md)
- [ArticleProcessor API](../processor.md)
- [Plugin Development Guide](./custom.md)