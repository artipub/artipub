---
outline: deep
---


# DevToPublisherPlugin

```ts
function NotionPublisherPlugin(option: NotionPublisherPluginOption): (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown) => Promise<PublishResult>
```

## NotionPublisherPluginOption

```ts
interface NotionPublisherPluginOption {
    /**
     * notion api key
     */
    api_key: string;
    /**
     * 发布至notion的页面id
     */
    page_id: string;
}
```

# DevToPublisherPlugin

```ts
declare function DevToPublisherPlugin(option: DevToPublisherPluginOption): (articleTitle: string, _visit: TVisitor, _toMarkdown: ToMarkdown) => Promise<PublishResult>;
```

## DevToPublisherPluginOption

```ts
interface DevToPublisherPluginOption {
  /**
   * dev.to api key
   */
  api_key: string;
  /**
   * 是否发布，default: false
   */
  published?: boolean;
  /**
   * 文章系列
   */
  series?: string;
  /**
   * 文章封面图
   */
  main_image?: string;
  /**
   * 文章描述
   */
  description?: string;
  /**
   * dev.to 组织id
   */
  organization_id?: number;
}
```
