import type { Visitor, Test } from "unist-util-visit";
import { Node, Parent, ProcessorContext } from "@/core";
import type { GithubPicBedOption } from "@artipub/shared";

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

export interface ExtendsParam {
  pid?: string;
}

export interface PublisherPlugin {
  extendsParam?(extendsParam: ExtendsParam): PublisherPlugin;
  process(articleTitle: string, visit: TVisitor, toMarkdown: ToMarkdown): Promise<PublishResult>;
  name: string;
}

export interface PublishResult {
  pid?: string;
  name?: string;
  success: boolean;
  info?: string;
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
