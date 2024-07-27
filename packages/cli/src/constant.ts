import type { JSONSchemaType } from "@types/ajv";

export const basePlatformSchema: JSONSchemaType<{ name: string; destination?: string }> = {
  type: "object",
  properties: {
    name: { type: "string" },
    destination: { type: "string", nullable: true },
  },
  required: ["name"],
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

export const schema = {
  type: "object",
  properties: {
    github_owner: { type: "string" },
    github_repo: { type: "string" },
    github_dir: { type: "string" },
    github_branch: { type: "string" },
    github_token: { type: "string" },
    github_cdn_prefix: { type: "string" },
    github_commit_author: { type: "string" },
    github_commit_email: { type: "string" },
    platform: {
      type: "array",
      items: {
        anyOf: [basePlatformSchema, notionPlatformSchema, devToPlatformSchema],
      },
    },
  },
  required: [
    "github_owner",
    "github_repo",
    "github_dir",
    "github_branch",
    "github_token",
    "github_cdn_prefix",
    "github_commit_author",
    "github_commit_email",
    "platform",
  ],
  additionalProperties: false,
};
