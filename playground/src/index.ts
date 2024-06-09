import { ArticleProcessor, NotionPublisherPlugin, DevToPublisherPlugin, Middleware } from "artipub"

// // 初始化文章处理器和发布管理器
// const articleProcessor = new ArticleProcessor({
// 	compressImages: true
// });

// articleProcessor.use((node: any, next: Middleware) => {
// 	//...
// 	next(node, next);
// });


// /* const publisherManager = new PublisherManager({});

// // 注册发布平台插件
// publisherManager.registerPublisher(NotionPublisherPlugin({}));
// publisherManager.registerPublisher(DevToPublisherPlugin({})); */

// // 处理 Markdown 文件
// const filePath = "path/to/markdown.md";
// let finalMarkdown: any;
// articleProcessor.processMarkdown(filePath).then((markdown: any) => {
// 	finalMarkdown = markdown;
// 	console.log(finalMarkdown);

// 	// publisherManager.publish(finalMarkdown);
// });
