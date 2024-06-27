import { ArticleProcessor, PublisherManager, NotionPublisherPlugin, DevToPublisherPlugin } from "@pup007/artipub"
import path from "path";
import { fileURLToPath } from "url";

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env;
let {
	GITHUB_OWNER,
	GITHUB_REPO,
	GITHUB_DIR,
	GITHUB_BRANCH,
	GITHUB_TOKEN,
	GITHUB_COMMIT_AUTHOR,
	GITHUB_COMMIT_EMAIL,
} = process.env;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化文章处理器和发布管理器
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

articleProcessor.processMarkdown(path.resolve(__dirname, "../doc/xxx.md")).then(async ({ content }) => {
	let publisherManager = new PublisherManager(content);
	publisherManager.addPlugin(NotionPublisherPlugin({
		api_key: NOTION_API_KEY ?? "",
		page_id: NOTION_PAGE_ID ?? "",
	}));
	let res = await publisherManager.publish();
	console.log("publish res:", res);
});

