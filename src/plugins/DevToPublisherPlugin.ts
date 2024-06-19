import { PublishResult } from "@/types";

export function DevToPublisherPlugin(option: any) {
  return () => {
    let res: PublishResult = {
      success: true,
      info: "Published to Dev.to",
    };
    return res;
  };
}
