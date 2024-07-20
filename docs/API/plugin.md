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
     * page_id posted to notion page place
     */
    page_id: string;
}
```

- Question 1: How to get API_KEY?

  > To obtain API_KEY, we need to build your own notion integration.Related tutorial：[Build your first integration](https://developers.notion.com/docs/create-a-notion-integration)。Create the connection address: https://www.notion.so/profile/integrations, wait for you to create it, click on the integration you created, and the following is the API_KEY API_KEY
  ![](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200927324.png)

- Question 2: How to get page_id?
  1. First create a page in NOTION, and understand it as you will upload an article through Artipub to the note in this page. Similar to a workspace, we name them: inbox, and then the Inbox Connect is created to what we created.Integrating is fine.As shown below:
  ![](https://cdn.jsdelivr.net/gh/yxw007/blogpicbed@master/img/20240720093939.png)
  2. In fact, Inbox is a page of notion. You can get PAGE_ID through the following ways
    ![](https://cdn.jsdelivr.net/gh/yxw007/blogpicbed@master/img/202407200948924.png)
  The paste results are similar to the following, the selected part is Page_id
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
   * Whether to publish，default: false
   */
  published?: boolean;
  /**
   * Article series
   */
  series?: string;
  /**
   * Article cover map
   */
  main_image?: string;
  /**
   * Article description
   */
  description?: string;
  /**
   * dev.to organization id
   */
  organization_id?: number;
}

```

More info：https://developers.forem.com/api/v1#tag/articles

- Question 1: How to get api_key?
  
  You can generate your own on this page api_key：https://dev.to/settings/extensions If you slide the page to the bottom, you can see some of the content as shown in the figure below：
  ![](https://cdn.jsdelivr.net/gh/yxw007/BlogPicBed@master/img/202407200945604.png)

 
