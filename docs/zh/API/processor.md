---
outline: deep
---

# ArticleProcessor

文章处理器：内置图片压缩、图片上传中间件、提供中间件处理函数、自动执行中间件等

## ArticleProcessor

```ts
class ArticleProcessor {
  readonly option: ArticleProcessorOption;
  private middlewares;
  constructor(option: ArticleProcessorOption);
  use(middleware: Middleware): this;
  /**
   * 处理markdown文件
   * @param {string} filePath - markdown 文件路径
   * @returns 返回处理后的markdown文件内容
   */
  processMarkdown(filePath: string): Promise<ArticleProcessResult>;
}
```

### ArticleProcessorOption

```ts
interface ArticleProcessorOption {
  /**
   * default: { quality: 80, compressed:true }
   */
  compressedOptions?: {
    compressed?: boolean;
    quality?: number;
  };
  uploadImgOption: UploadImgOption;
}

type UploadImg = (imgFilePath: string) => Promise<string>;
interface GithubPicBedOption {
  owner: string;
  repo: string;
  dir: string;
  branch: string;
  token: string;
  commit_author: string;
  commit_email: string;
}

/**
 * 可以是Github图床上传配置Option 或者 一个自定义上传接口函数，返回对应的上传地址
 */
type UploadImgOption = GithubPicBedOption | UploadImg;
```

### use

ArticleProcessor可以通过use添加处理中间件

```ts
class ArticleProcessor {
    ...
    use(middleware: Middleware): this;
    ...
}

type TVisitor = (testOrVisitor: Visitor | Test, visitorOrReverse: Visitor | boolean | null | undefined, maybeReverse?: boolean | null | undefined) => void;
type Middleware = (context: ProcessorContext, visitor: TVisitor, next: Next) => Promise<void>;
```

::: details 示例

```ts
const articleProcessor = new ArticleProcessor({
  uploadImgOption: {
    owner: GITHUB_OWNER ?? "",
    repo: GITHUB_REPO ?? "",
    dir: GITHUB_DIR ?? "",
    branch: GITHUB_BRANCH ?? "",
    token: GITHUB_TOKEN ?? "",
    commit_author: GITHUB_COMMIT_AUTHOR ?? "",
    commit_email: GITHUB_COMMIT_EMAIL ?? "",
  },
});

articleProcessor.use(async (context: ProcessorContext, visit: TVisitor, next: Next) => {
  visit("heading", (_node, _index, parent) => {
    let node = _node as Heading;
    //TODO: 对节点进行处理
  });

  //注意：处理完后记得调用next，否则会导致一直卡在这过程不会继续往后处理了
  next();
});
```

> 提示：了解visit更详细的api: [visit](https://github.com/syntax-tree/unist-util-visit?tab=readme-ov-file#visittree-test-visitor-reverse)

:::
