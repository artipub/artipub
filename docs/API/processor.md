---
outline: deep
---

# ArticleProcessor

ArticleProcessor: built-in picture compression, picture upload middleware, providing middleware processing functions, automatic execution middleware, etc.

## ArticleProcessor

```ts
class ArticleProcessor {
    readonly option: ArticleProcessorOption;
    private middlewares;
    constructor(option: ArticleProcessorOption);
    use(middleware: Middleware): this;
    /**
     * Process Markdown File
     * @param {string} filePath - markdown file path
     * @returns The content of the Markdown file after returning processing
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
 * It can be uploaded by the GitHub map bed configuration Option or a customized uploading function, and returns the corresponding upload address
 */
type UploadImgOption = GithubPicBedOption | UploadImg;
```

### use

ArticleProcessor: You can add processing the middleware through the use

```ts
class ArticleProcessor {
    ...
    use(middleware: Middleware): this;
    ...
}

type TVisitor = (testOrVisitor: Visitor | Test, visitorOrReverse: Visitor | boolean | null | undefined, maybeReverse?: boolean | null | undefined) => void;
type Middleware = (context: ProcessorContext, visitor: TVisitor, next: Next) => Promise<void>;
```

::: details Example

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
    }
});

articleProcessor.use(async (context: ProcessorContext, visit: TVisitor, next: Next) => {
	visit("heading", (_node, _index, parent) => {
		let node = _node as Heading;
		//TODO: process the node
	});

  //Note: Remember to call next after processing, otherwise it will cause the process to be stuck in this process will not continue to be processed back
	next();
});
```

> Tip: Learn visit more detailed API: [visit](https://github.com/syntax-tree/unist-util-visit?tab=readme-ov-file#visittree-test-visitor-reverse)

:::
