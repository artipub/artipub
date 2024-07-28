export interface GithubPicBedOption {
  owner: string;
  repo: string;
  dir: string;
  branch: string;
  token: string;
  commit_author: string;
  commit_email: string;
}

export interface NativeBlogOption {
  dir_path: string;
}

export interface NotionPublisherPluginOption {
  api_key: string;
  page_id: string;
}

export interface DevToPublisherPluginOption {
  api_key: string;
  published?: boolean;
  series?: string;
  main_image?: string;
  description?: string;
  organization_id?: number;
}
