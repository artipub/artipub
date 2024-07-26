---
outline: deep
---

# PublisherManager

管理文章的发布至哪些平台

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

添加发布平台插件

```ts
export type Plugin = (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown) => Promise<PublishResult>;
export interface PublishResult {
  success: boolean;
  info?: string;
}
```

- articleTitle: 文章标题
- visit：markdown ast 遍历方法
- toMarkdown: 将ast变成markdown 字符串内容

## publish

将markdown发布至所有注册的插件平台

```ts
export interface PublishResult {
  success: boolean;
  info?: string;
}
```
