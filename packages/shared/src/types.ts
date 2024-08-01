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
  /**
   * this is local absolute path
   */
  destination_path: string;
  /**
   * default is https://cdn.jsdelivr.net/gh
   */
  cdn_prefix?: string;
  /**
   * this is article's resource image domain
   * default is raw.githubusercontent.com
   */
  res_domain?: string;
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
