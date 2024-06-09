import { Node } from "unist";

export interface ArticleProcessorOption {
	/**
	 * default：true
	 */
	compressed?: boolean
}

export type Middleware = (node: Node, next: Middleware) => void
