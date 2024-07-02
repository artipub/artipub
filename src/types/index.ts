import type { Visitor, Test } from "unist-util-visit";
import { Node, Parent, ProcessorContext } from "@/core";

export interface GithubPicBedOption {
  owner: string;
  repo: string;
  dir: string;
  branch: string;
  token: string;
  commit_author: string;
  commit_email: string;
}

export type UploadImg = (imgFilePath: string) => Promise<string>;

export type UploadImgOption = GithubPicBedOption | UploadImg;

export interface ArticleProcessorOption {
  /**
   * default: { quality: 80, compressed:true }
   */
  compressedOptions?: {
    compressed?: boolean;
    quality?: number;
  };
  uploadImgOption: UploadImgOption;
}

export type ToMarkdown = () => { content: string };

export interface ArticleProcessResult {
  content: string;
}

export type TVisitor = (
  testOrVisitor: Visitor | Test,
  visitorOrReverse: Visitor | boolean | null | undefined,
  maybeReverse?: boolean | null | undefined
) => void;
export type Middleware = (context: ProcessorContext, visitor: TVisitor, next: Next) => Promise<void>;
export type Next = () => void;
export type ImageExtension = "png" | "jpeg" | "gif";

export type Plugin = (articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown) => Promise<PublishResult>;
export interface PublishResult {
  success: boolean;
  info?: string;
}

export interface NotionPublisherPluginOption {
  api_key: string;
  page_id: string;
}

export interface NodeContext {
  node: Node;
  parent: Parent | undefined;
}

export type TVt = (
  testOrVisitor: Visitor | Test,
  visitorOrReverse: Visitor | boolean | null | undefined,
  maybeReverse: boolean | null | undefined
) => void;
