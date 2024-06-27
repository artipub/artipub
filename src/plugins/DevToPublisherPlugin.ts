import { PublishResult, TVisitor, ToMarkdown } from "@/types";

export function DevToPublisherPlugin(option: any) {
  return async (articleTitle: string, _visit: TVisitor, _toMarkdown: ToMarkdown): Promise<PublishResult> => {
    let res: PublishResult = {
      success: true,
      info: "Published to Dev.to",
    };
    return res;
  };
}
