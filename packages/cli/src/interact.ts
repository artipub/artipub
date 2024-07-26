import Ajv, { JSONSchemaType } from "ajv";
import inquirer from "inquirer";

const basePlatformSchema: JSONSchemaType<{ name: string; destination?: string }> = {
  type: "object",
  properties: {
    name: { type: "string" },
    destination: { type: "string", nullable: true },
  },
  required: ["name"],
  additionalProperties: false,
};

const notionPlatformSchema: JSONSchemaType<{ name: "notion"; api_key: string; data_base_id: string; page_id: string }> = {
  properties: {
    name: { type: "string", const: "notion" },
    api_key: { type: "string" },
    data_base_id: { type: "string" },
    page_id: { type: "string" },
  },
  required: ["name", "api_key", "data_base_id", "page_id"],
};

const devToPlatformSchema: JSONSchemaType<{
  name: "dev.to";
  api_key: string;
  published?: boolean;
  series?: string;
  main_image?: string;
  description?: string;
  organization_id?: number;
}> = {
  ...basePlatformSchema,
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

const schema = {
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

function validateConfig(config: any) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(config);
  if (!valid) {
    throw new Error(validate.errors?.map((e) => e.message).join("\n"));
  }
  return true;
}

const platformPrompts = {
  "native blog": [
    {
      type: "input",
      name: "destination",
      message: "Enter the destination path for the native blog:",
    },
  ],
  notion: [
    {
      type: "input",
      name: "api_key",
      message: "Enter the Notion API key:",
    },
    {
      type: "input",
      name: "data_base_id",
      message: "Enter the Notion database ID:",
    },
    {
      type: "input",
      name: "page_id",
      message: "Enter the Notion page ID:",
    },
  ],
  "dev.to": [
    {
      type: "input",
      name: "api_key",
      message: "Enter the Dev.to API key:",
    },
    {
      type: "confirm",
      name: "published",
      message: "Is the article published?",
      default: false,
    },
    {
      type: "input",
      name: "series",
      message: "Enter the series name (optional):",
    },
    {
      type: "input",
      name: "main_image",
      message: "Enter the main image URL (optional):",
    },
    {
      type: "input",
      name: "description",
      message: "Enter the description (optional):",
    },
    {
      type: "number",
      name: "organization_id",
      message: "Enter the organization ID (optional):",
    },
  ],
};

export default async function interactPrompt() {
  const { platform } = await inquirer.prompt([
    {
      type: "",
    },
    {
      type: "list",
      name: "platform",
      message: "Select the platform:",
      choices: Object.keys(platformPrompts),
    },
  ]);

  const platformSpecificPrompts = platformPrompts[platform];
  const platformDetails = await inquirer.prompt(platformSpecificPrompts);

  return {
    platform,
    ...platformDetails,
  };
}
