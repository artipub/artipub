import fs from "fs/promises"
import { ArticleProcessorOption, Middleware } from '../types';
import { unified } from 'unified'
import type { Node } from "unist";
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'

const defaultCompressedOptions = {
	quality: 80,
	compressed: true
}

export { Node }
export class ArticleProcessor {
	private option: ArticleProcessorOption;
	private middlewares: Middleware[];
	constructor(option?: ArticleProcessorOption) {
		this.option = Object.assign({ compressedOptions: defaultCompressedOptions }, option);
		this.middlewares = [];
	}

	use(middleware: Middleware) {
		if (this.middlewares.includes(middleware)) {
			return this;
		}
		this.middlewares.push(middleware);
		return this;
	}

	/**
	 * The function processMarkdown takes a file path as input and returns a Promise that resolves with
	 * the content of the markdown file.
	 * @param {string} filePath - The `filePath` parameter in the `processMarkdown` function is a string
	 * that represents the path to the Markdown file that you want to process.
	 * @returns In the `processMarkdown` function, a `Promise` is being returned. This promise will
	 * eventually resolve with a string value once the asynchronous operation inside the promise is
	 * completed.
	 */
	processMarkdown(filePath: string): Promise<string> {
		let articleProcessor = this;

		function customMiddleware() {
			return (tree: Node) => {
				return new Promise<Node>((resolve) => {
					let i = 0;
					let next = (tree: Node) => {
						if (i < articleProcessor.middlewares.length) {
							let middleware = articleProcessor.middlewares[i];
							i++;
							return middleware(tree, next);
						}
						resolve(tree);
					}
					next(tree);
				});
			}
		}

		return new Promise(async (resolve) => {
			const fileContent = await fs.readFile(filePath, { encoding: "utf8" });
			const desContent = await unified()
				.use(remarkParse)
				.use(customMiddleware)
				.use(remarkStringify)
				.process(fileContent);

			resolve(desContent.toString());
		});
	}
}
