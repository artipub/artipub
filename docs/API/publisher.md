---
outline: deep
---

# PublisherManager

What platforms are published by the management article

```ts
class PublisherManager {
  private plugins;
  private content;
  constructor(content: string);
  addPlugin(plugin: Plugin): void;
  publish(): Promise<PublishResult[]>;
}
```

## addPlugin

Add the release platform plug -in

```ts
export type Plugin = (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown) => Promise<PublishResult>;
export interface PublishResult {
  success: boolean;
  info?: string;
}
```
- articleTitle: Article title
- visit：markdown ast Traversal method
- toMarkdown: Turn AST to Markdown string content


## publish

Publish MarkDown to all registered plugin platforms

```ts
export interface PublishResult {
  success: boolean;
  info?: string;
}
```
