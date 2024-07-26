# 贡献

> 特别注意：请基于master创建一个新分支，在新分支上开发，开发完后创建PR至master

- 安装依赖

  ```bash
  pnpm install
  ```

- 新增处理中间件
  ```typescript
  export default async function customMiddleware(context: ProcessorContext, visit: TVisitor, next: Next) {
    //visit：深度优先遍历markdown ast的接口，方便用户修改node，注意此过程是同步的，如果想要异步处理，就先找到对应node，然后再添加异步处理，最后调用next。
    //next: 处理完后调用next，否则会导致一直卡住不会往下执行
  }
  ```
- 新增添加插件

  ```typescript
  export function XXXPublisherPlugin(option: any) {
    return async (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult> => {
      //visit: 深度优先遍历markdown ast的接口，方便用户修改node，注意此过程是同步的
      //toMarkdown: 会将修改后的ast 重新生成markdown, content 就是markdown 内容
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

- 打包

  ```bash
  pnpm build
  ```

- 测试:
  1. 先pnpm build 打包artipub
  2. cd playground 进行验证测试(注意：playground中的任务东西都不要提交，仅本地测试)
