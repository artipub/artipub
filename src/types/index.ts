import type { Visitor, Test } from "unist-util-visit"

export interface ArticleProcessorOption {
	/**
	 * default: { quality: 80, compressed:true }
	 */
	compressedOptions?: {
		compressed?: boolean,
		quality?: number,
	}
}
export type TVisitor = (
	testOrVisitor: Visitor | Test,
	visitorOrReverse: Visitor | boolean | null | undefined,
	maybeReverse?: boolean | null | undefined
) => void;
export type Middleware = (visitor: TVisitor, next: Next) => void
export type Next = () => void
