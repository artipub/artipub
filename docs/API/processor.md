---
outline: deep
title: ArticleProcessor
---

# ArticleProcessor

ArticleProcessor is the core processing engine of ArtiPub, providing article preprocessing capabilities including image compression, image upload, and custom middleware processing. It processes Markdown files through a pipeline architecture, allowing developers to extend functionality through middleware.

## Overview

The ArticleProcessor class handles the transformation of Markdown content before publishing. It automatically:

- Compresses images to reduce file size
- Uploads images to cloud storage (GitHub or custom)
- Injects unique article IDs for tracking
- Processes content through custom middleware

## Constructor

```ts
class ArticleProcessor {
  constructor(option: ArticleProcessorOption);
}
```

### ArticleProcessorOption

```ts
interface ArticleProcessorOption {
  /**
   * Image compression settings
   * @default { quality: 80, compressed: true }
   */
  compressedOptions?: {
    /**
     * Whether to compress images
     * @default true
     */
    compressed?: boolean;
    /**
     * Compression quality (1-100)
     * @default 80
     */
    quality?: number;
  };

  /**
   * Image upload configuration
   * Can be GitHub configuration or custom upload function
   */
  uploadImgOption: UploadImgOption;
}
```

### UploadImgOption Types

```ts
/**
 * GitHub Picture Bed Configuration
 */
interface GithubPicBedOption {
  owner: string; // GitHub username or organization
  repo: string; // Repository name
  dir: string; // Directory path in repository
  branch: string; // Target branch (usually 'main' or 'master')
  token: string; // GitHub Personal Access Token
  commit_author: string; // Commit author name
  commit_email: string; // Commit author email
}

/**
 * Custom Upload Function
 * @param imgFilePath - Local image file path
 * @returns Promise resolving to the uploaded image URL
 */
type UploadImg = (imgFilePath: string) => Promise<string>;

/**
 * Upload option can be either GitHub config or custom function
 */
type UploadImgOption = GithubPicBedOption | UploadImg;
```

## Methods

### processMarkdown

Processes a Markdown file through the configured pipeline.

```ts
processMarkdown(filePath: string): Promise<ArticleProcessResult>
```

**Parameters:**

- `filePath` (string): Absolute path to the Markdown file

**Returns:**

- `Promise<ArticleProcessResult>`: Processed content

```ts
interface ArticleProcessResult {
  content: string; // Processed Markdown content
}
```

### use

Adds custom middleware to the processing pipeline.

```ts
use(middleware: Middleware): ArticleProcessor
```

**Parameters:**

- `middleware` (Middleware): Custom middleware function

**Returns:**

- `ArticleProcessor`: Returns itself for method chaining

## Middleware

Middleware allows you to customize the processing pipeline by manipulating the Markdown AST (Abstract Syntax Tree).

### Middleware Type Definition

```ts
type Middleware = (context: ProcessorContext, visitor: TVisitor, next: Next) => Promise<void>;

interface ProcessorContext {
  option: ArticleProcessorOption;
  filePath: string;
}

type Next = () => void;
type TVisitor = (
  testOrVisitor: Visitor | Test,
  visitorOrReverse: Visitor | boolean | null | undefined,
  maybeReverse?: boolean | null | undefined
) => void;
```

### Writing Custom Middleware

```ts
const customMiddleware: Middleware = async (context, visit, next) => {
  // Visit specific node types in the AST
  visit("heading", (node, index, parent) => {
    // Modify heading nodes
    if (node.depth === 1) {
      // Process h1 headings
      console.log("Found title:", node.children[0].value);
    }
  });

  // Visit image nodes
  visit("image", (node) => {
    // Process image URLs
    console.log("Found image:", node.url);
  });

  // IMPORTANT: Always call next() to continue the pipeline
  next();
};
```

## Complete Examples

### Basic Usage with GitHub Image Hosting

```ts
import { ArticleProcessor } from "@artipub/core";
import path from "path";

// Configure with environment variables
const processor = new ArticleProcessor({
  compressedOptions: {
    quality: 85,
    compressed: true,
  },
  uploadImgOption: {
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    dir: "blog/images",
    branch: "main",
    token: process.env.GITHUB_TOKEN!,
    commit_author: "ArtiPub Bot",
    commit_email: "bot@example.com",
  },
});

// Process a Markdown file
const result = await processor.processMarkdown(path.resolve(__dirname, "./articles/my-post.md"));

console.log("Processed content:", result.content);
```

### Custom Image Upload Function

```ts
import { ArticleProcessor } from "@artipub/core";
import { uploadToS3 } from "./utils/s3-upload";

const processor = new ArticleProcessor({
  uploadImgOption: async (imgFilePath: string) => {
    // Custom upload logic (e.g., to AWS S3, Cloudinary, etc.)
    const url = await uploadToS3(imgFilePath);
    return url;
  },
});
```

### Advanced: Using Multiple Middleware

```ts
import { ArticleProcessor } from "@artipub/core";
import { Heading, Text, Image } from "mdast";

const processor = new ArticleProcessor({
  uploadImgOption: {
    /* ... */
  },
});

// Middleware 1: Add reading time estimate
processor.use(async (context, visit, next) => {
  let wordCount = 0;

  visit("text", (node: Text) => {
    wordCount += node.value.split(/\s+/).length;
  });

  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  // Add reading time to the beginning of the document
  visit("root", (node) => {
    const readingTimeNode = {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: `⏱️ Reading time: ${readingTime} min`,
        },
      ],
    };
    node.children.unshift(readingTimeNode);
  });

  next();
});

// Middleware 2: Add watermark to images
processor.use(async (context, visit, next) => {
  visit("image", (node: Image) => {
    // Add watermark parameter to image URLs
    if (!node.url.includes("?")) {
      node.url += "?watermark=artipub";
    }
  });

  next();
});

// Middleware 3: Convert relative links to absolute
processor.use(async (context, visit, next) => {
  const baseUrl = "https://myblog.com";

  visit("link", (node) => {
    if (node.url.startsWith("./") || node.url.startsWith("../")) {
      node.url = new URL(node.url, baseUrl).href;
    }
  });

  next();
});
```

## Node Types Reference

Common node types you can visit in middleware:

| Node Type    | Description     | Properties              |
| ------------ | --------------- | ----------------------- |
| `root`       | Document root   | `children[]`            |
| `heading`    | Headers (h1-h6) | `depth`, `children[]`   |
| `paragraph`  | Paragraphs      | `children[]`            |
| `text`       | Text content    | `value`                 |
| `image`      | Images          | `url`, `alt`, `title`   |
| `link`       | Links           | `url`, `children[]`     |
| `code`       | Code blocks     | `lang`, `value`         |
| `inlineCode` | Inline code     | `value`                 |
| `blockquote` | Quotes          | `children[]`            |
| `list`       | Lists           | `ordered`, `children[]` |
| `listItem`   | List items      | `children[]`            |
| `table`      | Tables          | `children[]`            |
| `emphasis`   | Italic text     | `children[]`            |
| `strong`     | Bold text       | `children[]`            |

## Best Practices

1. **Always call `next()`**: Forgetting to call `next()` in middleware will stop the pipeline.

2. **Order matters**: Middleware executes in the order they are added. Image processing middleware should come before publishing.

3. **Error handling**: Wrap async operations in try-catch blocks:

   ```ts
   processor.use(async (context, visit, next) => {
     try {
       // Your async operations
       await someAsyncOperation();
     } catch (error) {
       console.error("Middleware error:", error);
       // Decide whether to continue or throw
     }
     next();
   });
   ```

4. **Performance**: Avoid heavy operations in middleware. Consider caching results when possible.

5. **Testing**: Test middleware independently before adding to the processor:

   ```ts
   // Test middleware separately
   const testMiddleware = async () => {
     const mockContext = {
       /* ... */
     };
     const mockVisit = jest.fn();
     const mockNext = jest.fn();

     await myMiddleware(mockContext, mockVisit, mockNext);

     expect(mockNext).toHaveBeenCalled();
   };
   ```

## API Reference

For more details on the visitor pattern and AST manipulation:

- [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) - Visitor utility documentation
- [mdast](https://github.com/syntax-tree/mdast) - Markdown AST specification
- [unified](https://github.com/unifiedjs/unified) - Content processing ecosystem
