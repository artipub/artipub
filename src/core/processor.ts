import fs from "fs/promises"
import { ArticleProcessResult, ArticleProcessorOption, Middleware } from '@/types';
import { unified } from 'unified'
import type { Node, Parent } from "unist";
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { visit } from "unist-util-visit";
import type { Visitor, Test } from "unist-util-visit"
import { picCompress, picUpload } from "@/middleware";

const defaultCompressedOptions = {
	quality: 80,
	compressed: true
}

export interface ProcessorContext {
	option: ArticleProcessorOption,
	/**
	 * The `filePath` property in the `ProcessorContext` interface is a string that represents the path to the Markdown file that you want to process.
	 */
	filePath: string
}

export { Node, Parent }
export class ArticleProcessor {
	public readonly option: ArticleProcessorOption;
	private middlewares: Middleware[];
	constructor(option: ArticleProcessorOption) {
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
	processMarkdown(filePath: string): Promise<ArticleProcessResult> {
		this.middlewares.push(picCompress);
		this.middlewares.push(picUpload);
		let articleProcessor = this;
		let context: ProcessorContext = {
			filePath,
			option: this.option,
		}

		function customMiddleware() {
			return (tree: Node) => {
				return new Promise<Node>((resolve) => {
					let i = 0;
					let next = async () => {
						if (i < articleProcessor.middlewares.length) {
							let middleware = articleProcessor.middlewares[i];
							i++;
							function visitor(testOrVisitor: Visitor | Test, visitorOrReverse: Visitor | boolean | null | undefined, maybeReverse: boolean | null | undefined): void {
								let reverse;
								let vt;
								let test;
								if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
									test = undefined;
									vt = testOrVisitor;
									reverse = visitorOrReverse;
								} else {
									test = testOrVisitor;
									vt = visitorOrReverse;
									reverse = maybeReverse;
								}
								visit(tree, test, vt, reverse);
							}
							await middleware(context, visitor, next);
						} else {
							resolve(tree);
						}
					}
					next();
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

			resolve({ filePath, content: desContent.toString() });
		});
	}
}
