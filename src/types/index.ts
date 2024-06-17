import type { Visitor, Test } from "unist-util-visit"
import { ProcessorContext } from "..";

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
export type Middleware = (context: ProcessorContext, visitor: TVisitor, next: Next) => void
export type Next = () => void
export type ImageExtension = "png" | "jpeg" | "gif";
