# Contribute

> Note: Please create a new branch based on the master, develop on the new branch, and create PR to Master after development

- Install dependency

  ```bash
  pnpm install
  ```

- Add process middleware
  ```typescript
  export default async function customMiddleware(context: ProcessorContext, visit: TVisitor, next: Next) {
    //visit：In depth priority traversing Markdown AST's interface, which is convenient for users to modify node. Note that this process is synchronized. If you want to process it asynchronous, find the corresponding Node first, then add asynchronous processing.
    //next: Call next after processing, otherwise it will cause stuck and will not execute
  }
  ```
- Add publish plugin

  ```typescript
  export function XXXPublisherPlugin(option: any) {
    return async (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> => {
      //visit:In depth priority traversing Markdown AST's interface, which is convenient for users to modify node. Note that this process is synchronized.
      //toMarkdown: The modified AST will regenerate markdown. Content is Markdown content
      let { content } = toMarkdown();
      let res: PublishResult = {
        success: true,
        info: "Published to XXX",
      };
      //TODO:
      return res;
    };
  }
  ```

- build

  ```bash
  pnpm build
  ```

- playground:

1. First pnpm Build package artipub
2. cd playground for verification test (Note: Do not submit the file in playground, only local tests)
