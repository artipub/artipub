import { ArticleProcessor, NotionPublisherPlugin, DevToPublisherPlugin, Middleware, Node, Next } from "artipub"
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化文章处理器和发布管理器
const articleProcessor = new ArticleProcessor();

articleProcessor.use((node: Node, next: Next) => {
	console.log("middleware 1 delay 1s");
	setTimeout(() => {
		console.log("middleware 1");
		next(node);
	}, 1000);
});

articleProcessor.processMarkdown(path.resolve(__dirname, "../doc/index.md")).then((markdown: any) => {
	console.log(markdown);
});

