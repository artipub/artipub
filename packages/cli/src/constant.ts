import type { JSONSchemaType } from "ajv";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);
const pkg = require("../package.json");
export const projectName = pkg.name;

export function getHelpInfo() {
  return `
Usage: artipub [command]

Commands:
  add    <article path>  add an existing article
  update <article path>  update an existing article
  clear                  clear the cache
  config 
    --edit               edit the configuration file

Options:
  -h, --help  display help for command
  -c, --config <path> config file path
  -v, --version  output the version number
  `;
}

type NativePlatformData = { destination_path: string; cdn_prefix?: string; res_domain?: string };
export const nativePlatformSchema: JSONSchemaType<NativePlatformData> = {
  type: "object",
  properties: {
    destination_path: { type: "string" },
    cdn_prefix: { type: "string", nullable: true },
    res_domain: { type: "string", nullable: true },
  },
  required: ["destination_path"],
  additionalProperties: false,
};

type NotionPlatformData = { api_key: string; data_base_id?: string; page_id: string };
export const notionPlatformSchema: JSONSchemaType<NotionPlatformData> = {
  type: "object",
  properties: {
    api_key: { type: "string" },
    data_base_id: { type: "string", nullable: true },
    page_id: { type: "string" },
  },
  required: ["api_key", "page_id"],
};

type DevToPlatformData = {
  api_key: string;
  published?: boolean;
  series?: string;
  main_image?: string;
  description?: string;
  organization_id?: number;
};

export const devToPlatformSchema: JSONSchemaType<DevToPlatformData> = {
  type: "object",
  properties: {
    api_key: { type: "string" },
    published: { type: "boolean", nullable: true },
    series: { type: "string", nullable: true },
    main_image: { type: "string", nullable: true },
    description: { type: "string", nullable: true },
    organization_id: { type: "number", nullable: true },
  },
  required: ["api_key"],
};

type GithubOptionData = {
  owner: string;
  repo: string;
  dir: string;
  branch: string;
  token: string;
  cdn_prefix: string;
  commit_author: string;
  commit_email: string;
};

const githubOptionSchema: JSONSchemaType<GithubOptionData> = {
  type: "object",
  properties: {
    owner: { type: "string" },
    repo: { type: "string" },
    dir: { type: "string" },
    branch: { type: "string" },
    token: { type: "string" },
    cdn_prefix: { type: "string" },
    commit_author: { type: "string" },
    commit_email: { type: "string" },
  },
  required: ["owner", "repo", "dir", "branch", "token", "cdn_prefix", "commit_author", "commit_email"],
  additionalProperties: false,
};

export const schema: JSONSchemaType<{
  githubOption: GithubOptionData;
  platforms: {
    native?: NativePlatformData;
    notion?: NotionPlatformData;
    "dev.to"?: DevToPlatformData;
  };
}> = {
  type: "object",
  properties: {
    githubOption: githubOptionSchema,
    platforms: {
      type: "object",
      properties: {
        native: {
          ...nativePlatformSchema,
          nullable: true,
        },
        notion: {
          ...notionPlatformSchema,
          nullable: true,
        },
        "dev.to": {
          ...devToPlatformSchema,
          nullable: true,
        },
      },
    },
  },
  required: ["platforms"],
};
