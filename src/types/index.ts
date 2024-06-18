import type { Visitor, Test } from "unist-util-visit"
import { ProcessorContext } from "@/core";

export interface GithubPicBedOption {
	owner: string,
	repo: string,
	dir: string,
	branch: string,
	token: string,
	commit_author: string,
	commit_email: string,
}

export type UploadImg = (imgFilePath: string) => string;

export type UploadImgOption = GithubPicBedOption | UploadImg;

export interface ArticleProcessorOption {
	/**
	 * default: { quality: 80, compressed:true }
	 */
	compressedOptions?: {
		compressed?: boolean,
		quality?: number,
	},
	uploadImgOption: UploadImgOption
}

export interface ArticleProcessResult {
	filePath: string,
	content: string
}

export type TVisitor = (
	testOrVisitor: Visitor | Test,
	visitorOrReverse: Visitor | boolean | null | undefined,
	maybeReverse?: boolean | null | undefined
) => Promise<void>;
export type Middleware = (context: ProcessorContext, visitor: TVisitor, next: Next) => Promise<void>
export type Next = () => void
export type ImageExtension = "png" | "jpeg" | "gif";

export type Plugin = (filePath: string, content: string) => PublishResult
export interface PublishResult {
	success: boolean,
	info?: string
}

export interface NotionPublisherPluginOption {
	api_key: string,
	page_id: string
}
