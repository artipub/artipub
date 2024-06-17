import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin, Next, TVisitor, ProcessorContext } from "artipub"
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化文章处理器和发布管理器
const articleProcessor = new ArticleProcessor();

articleProcessor.use((context: ProcessorContext, visit: TVisitor, next: Next) => {
	console.log("middleware: filepath=", context.filePath);
	visit("text", (node, index, parent) => {
		if (parent && parent.type === "paragraph") {
			let n = node as any;
			if (n.value === "h2") {
				n.value = "~h2~"
			}
		}
	});
	next();
});

articleProcessor.processMarkdown(path.resolve(__dirname, "../doc/index.md")).then((markdown: any) => {
	
});

