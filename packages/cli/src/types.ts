import type { DevToPublisherPluginOption, GithubPicBedOption, NativeBlogOption, NotionPublisherPluginOption } from "@artipub/shared";

export type PlatformOptions = {
  nativeBlog?: NativeBlogOption;
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
