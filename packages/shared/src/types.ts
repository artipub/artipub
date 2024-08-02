export interface GithubPicBedOption {
  owner: string;
  repo: string;
  dir: string;
  branch: string;
  token: string;
  commit_author: string;
  commit_email: string;
}

export interface NativePublisherOption {
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
  /**
   * This is parent's page id when the article was first published
   */
  page_id: string;
  /**
   * if you pass update_page_id, it will update the article
   */
  update_page_id?: string;
}

export interface DevToPublisherPluginOption {
  /**
   * if you pass article_id, it will update the article
   */
  article_id?: string;
  api_key: string;
  published?: boolean;
  series?: string;
  main_image?: string;
  description?: string;
  organization_id?: number;
}
