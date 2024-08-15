import { PublishResult } from "@artipub/core";
import type { DevToPublisherPluginOption, GithubPicBedOption, NativePublisherOption, NotionPublisherPluginOption } from "@artipub/shared";

export type PlatformOptions = {
  native?: NativePublisherOption;
  notion?: NotionPublisherPluginOption;
  devTo?: DevToPublisherPluginOption;
};

export type PlatformAnswers = {
  [K in keyof PlatformOptions]: PlatformOptions[K];
};

export interface ArticleConfig {
  githubOption: GithubPicBedOption;
  platforms: PlatformAnswers;
}

export interface AddOrUpdateCommandOptions {
  config?: string;
}

export type ActionType = "Add" | "Update";

export type RunResult = PublishResult[] | undefined | void | null;
