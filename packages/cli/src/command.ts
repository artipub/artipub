import { Command } from "commander";
import { createCommonJS } from "mlly";
import interactPrompt from "./interact";
import { schema } from "./constant";
import { getConfigPath, loadConfig } from "./config";
import fs from "fs-extra";
import { ArticleProcessor, ArticleProcessResult, Plugin, PublisherManager, publisherPlugins } from "@artipub/core";

import type { ActionType, AddOrUpdateCommandOptions, ArticleConfig } from "./types";
import { normalizePath, resolvePath } from "@artipub/shared";

type InteractPrompt = Awaited<ReturnType<typeof interactPrompt>>;

const { require } = createCommonJS(import.meta.url);
const Ajv = require("Ajv");
const program = new Command();

export function help() {
  console.log(`
Usage: artipub [command]

Commands:
  add    <article path>  add an existing article
  update <article path>  update an existing article
  clear                  clear the cache

Options:
  -h, --help  display help for command
  -c, --config <path> config file path
  `);
}

function answersToConfig(answers: InteractPrompt): ArticleConfig {
  const { githubAnswers, platformAnswers } = answers;
  const config: ArticleConfig = {
    githubOption: githubAnswers,
    platforms: platformAnswers,
  };
  return config;
}

async function updateArticle(type: ActionType, articlePath: string, config: ArticleConfig) {
  if (!validateConfig(config)) {
    throw new Error("Invalid configuration");
  }

  if (type == "Add") {
    addArticleToPlatform(articlePath, config);
  } else if (type === "Update") {
    updateArticleToPlatform(articlePath, config);
  }
}

function addArticleToPlatform(articlePath: string, config: ArticleConfig) {
  const processor = new ArticleProcessor({
    uploadImgOption: {
      ...config.githubOption,
    },
  });

  processor.processMarkdown(articlePath).then(async ({ content }: ArticleProcessResult) => {
    const publisher = new PublisherManager(content);

    for (const publisherKey of Object.keys(publisherPlugins)) {
      const options = (config as any)[publisherKey];
      const plugin = publisherPlugins[publisherKey as keyof typeof publisherPlugins] as any;
      if (options) {
        publisher.addPlugin(plugin(...options));
      }
    }
    
    const res = await publisher.publish();
    console.log("publish res:", res);
  });
}

function updateArticleToPlatform(articlePath: string, config: ArticleConfig) {}

function validateConfig(config: any) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(config);
  if (!valid) {
    throw new Error(validate.errors?.map((e: any) => e.message).join("\n"));
  }
  return true;
}

async function handleAddOrUpdate(type: ActionType, articlePath: string, options: AddOrUpdateCommandOptions) {
  articlePath = resolvePath(articlePath);
  if (!fs.existsSync(articlePath)) {
    throw new Error("Article path does not exist.");
  }

  let configPath: string | undefined = normalizePath(options.config);
  configPath = configPath ? resolvePath(configPath) : getConfigPath(process.cwd());

  if (configPath) {
    const config = await loadConfig(configPath);
    return updateArticle(type, articlePath, config);
  } else {
    const answers = await interactPrompt();
    const config = answersToConfig(answers);
    return updateArticle(type, articlePath, config);
  }
}

export function registerCommands(resolve: (value?: unknown) => void) {
  program
    .command("add")
    .argument("<string>", "article path")
    .option("-c, --config [path]", "config file path")
    .description("add an existing article")
    .action(async (articlePath: string, options: AddOrUpdateCommandOptions) => {
      await handleAddOrUpdate("Add", articlePath, options);
      resolve();
    });

  program
    .command("update")
    .argument("<string>", "article path")
    .option("-c, --config [path]", "config file path")
    .description("Update an existing article")
    .action(async (articlePath: string, options: AddOrUpdateCommandOptions) => {
      await handleAddOrUpdate("Update", articlePath, options);
      resolve();
    });

  program
    .command("clear")
    .description("Clear the cache")
    .action(() => {
      console.log("Cache cleared.");
      resolve();
    });

  if (process.argv.length <= 2) {
    help();
  } else {
    program.parse(process.argv);
  }
}
