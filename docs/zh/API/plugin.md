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

- 疑问1：如何获取api_key?

  > 要获得api_key，我们需要构建你自己的一个notion集成。相关教程：[Build your first integration](https://developers.notion.com/docs/create-a-notion-integration)。创建连接地址：https://www.notion.so/profile/integrations，等你创建完毕后，点开你创建的integration, 如下框出来的就是api_key
  ![](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200927324.png)

- 疑问2：如何获取page_id?
  1. 先在notion随便创建一个页面，把它理解成你以后要通过artipub上传文章至notion就放置在这个页面中，类似于一个workspace, 咋们将其命名成：Inbox，然后将Inbox connect至我们创建的Integration就可以了。如下图所示：
  ![](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200933939.png)
  2. 其实Inbox就是notion的一个page，通过以下方式就可以拿到page_id
    ![](https://cdn.rjsdelivr.net/gh/yxw007/blogpicbed@master/img/202407200948924.png)
    粘贴出来的结果类似以下的样子, 选中的部分就是page_id
    ![](https://cdn.jsdelivr.net/gh/yxw007/blogpicbed@master/img/202407200949155.png)

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

More info：https://developers.forem.com/api/v1#tag/articles

- 疑问1：如何获得api_key?
  
  可以在此页面生成自己的api_key：https://dev.to/settings/extensions 将页面滑动至最底下就可以看到如下图所示部分内容：
  ![](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200945604.png)
