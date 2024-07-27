import { createCommonJS } from "mlly";
import type { QuestionCollection } from "@types/inquirer";

const { require } = createCommonJS(import.meta.url);
const inquirer = require("inquirer").default;

const platformPrompts: Record<string, QuestionCollection[]> = {
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
  console.log("Please enter the following GitHub related information:");

  const githubQuestions = [
    {
      type: "input",
      name: "github_owner",
      message: "Enter GitHub owner:",
      validate: (input: string) => (input ? true : "GitHub owner is required."),
    },
    {
      type: "input",
      name: "github_repo",
      message: "Enter GitHub repository:",
      validate: (input: string) => (input ? true : "GitHub repository is required."),
    },
    {
      type: "input",
      name: "github_dir",
      message: "Enter GitHub directory:",
      validate: (input: string) => (input ? true : "GitHub directory is required."),
    },
    {
      type: "input",
      name: "github_branch",
      message: "Enter GitHub branch:",
      validate: (input: string) => (input ? true : "GitHub branch is required."),
    },
    {
      type: "input",
      name: "github_token",
      message: "Enter GitHub token:",
      validate: (input: string) => (input ? true : "GitHub token is required."),
    },
    {
      type: "input",
      name: "github_cdn_prefix",
      message: "Enter GitHub CDN prefix:",
      validate: (input: string) => (input ? true : "GitHub CDN prefix is required."),
    },
    {
      type: "input",
      name: "github_commit_author",
      message: "Enter GitHub commit author:",
      validate: (input: string) => (input ? true : "GitHub commit author is required."),
    },
    {
      type: "input",
      name: "github_commit_email",
      message: "Enter GitHub commit email:",
      validate: (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) ? true : "Please enter a valid email address.";
      },
    },
  ];
  const githubAnswers = await inquirer.prompt(githubQuestions);

  console.log("GitHub information entered successfully. Now, please select the platform:");
  const checkPlatformAnswers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "platform",
      message: "Select the platform:",
      choices: Object.keys(platformPrompts),
    },
  ]);

  const platformAnswers: any = {};
  for (const platform of checkPlatformAnswers.platform) {
    console.log(`Please enter the following information for ${platform}:`);
    const answers = await inquirer.prompt(platformPrompts[platform]);
    platformAnswers[platform] = answers;
  }

  return {
    githubAnswers,
    platformAnswers,
  };
}
