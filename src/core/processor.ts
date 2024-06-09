import fs from "fs/promises"
import { ArticleProcessorOption, Middleware } from '../types';
import { remark } from "remark"
import remarkRehype from 'remark-rehype';
import stringify from 'remark-stringify';


export class ArticleProcessor {
	private option: ArticleProcessorOption;
	private middlewares: Middleware[];
	constructor(option: ArticleProcessorOption) {
		this.option = option;
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
		let i = 0;
		let next = (tree: any) => {
			if (i < this.middlewares.length) {
				let middleware = this.middlewares[i];
				return middleware(tree, next);
			}
			return tree;
		}

		return new Promise(async (resolve) => {
			const fileContent = await fs.readFile(filePath, { encoding: "utf8" });
			const processContent = await remark()
				.use(remarkRehype)
				.use(() => {
					return async (tree: any, file: any) => {
						await next(tree);
					}
				})
				.use(stringify)
				.process(fileContent);

			resolve(processContent.toString());
		});
	}
}
