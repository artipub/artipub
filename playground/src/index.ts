import { ArticleProcessor, NotionPublisherPlugin, DevToPublisherPlugin, Middleware } from "artipub"
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化文章处理器和发布管理器
const articleProcessor = new ArticleProcessor();

// articleProcessor.use((node: any, next: Middleware) => {
// 	//...
// 	next(node, next);
// });

articleProcessor.processMarkdown(path.resolve(__dirname, "../doc/index.md")).then((markdown: any) => {
	console.log(markdown);
});

