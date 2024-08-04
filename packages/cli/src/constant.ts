import type { JSONSchemaType } from "ajv";
import { createCommonJS } from "mlly";

const { require } = createCommonJS(import.meta.url);
const pkg = require("../package.json");
export const projectName = pkg.name;

export const nativePlatformSchema: JSONSchemaType<{ name: "blog"; destination_path: string; cdn_prefix?: string; res_domain?: string }> = {
  type: "object",
  properties: {
    name: { type: "string", const: "blog" },
    destination_path: { type: "string" },
    cdn_prefix: { type: "string", nullable: true },
    res_domain: { type: "string", nullable: true },
  },
  required: ["name", "destination_path"],
  additionalProperties: false,
};

export const notionPlatformSchema: JSONSchemaType<{ name: "notion"; api_key: string; data_base_id: string; page_id: string }> = {
  type: "object",
  properties: {
    name: { type: "string", const: "notion" },
    api_key: { type: "string" },
    data_base_id: { type: "string" },
    page_id: { type: "string" },
  },
  required: ["name", "api_key", "data_base_id", "page_id"],
};

export const devToPlatformSchema: JSONSchemaType<{
  name: "dev.to";
  api_key: string;
  published?: boolean;
  series?: string;
  main_image?: string;
  description?: string;
  organization_id?: number;
}> = {
  type: "object",
  properties: {
    name: { type: "string", const: "dev.to" },
    api_key: { type: "string" },
    published: { type: "boolean", nullable: true },
    series: { type: "string", nullable: true },
    main_image: { type: "string", nullable: true },
    description: { type: "string", nullable: true },
    organization_id: { type: "number", nullable: true },
  },
  required: ["name", "api_key"],
};

export const schema: JSONSchemaType<{
  githubOption: {
    owner: string;
    repo: string;
    dir: string;
    branch: string;
    token: string;
    cdn_prefix: string;
    commit_author: string;
    commit_email: string;
  };
  platforms: object;
}> = {
  type: "object",
  properties: {
    githubOption: {
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
    },
    platforms: {
      type: "object",
      items: {
        //TODO: 类型定义还需要调整
        anyOf: [nativePlatformSchema, notionPlatformSchema, devToPlatformSchema],
      },
    },
  },
  required: ["githubOption", "platforms"],
  additionalProperties: false,
};
