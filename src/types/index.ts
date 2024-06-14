import { Node } from "unist";

export interface ArticleProcessorOption {
	/**
	 * default: { quality: 80, compressed:true }
	 */
	compressedOptions?: {
		compressed?: boolean,
		quality?: number,
	}
}

export type Middleware = (node: Node, next: Next) => void
export type Next = (node: Node) => void
