import { Command } from "commander";
import { createCommonJS } from "mlly";
import interactPrompt, { promptForPlatform } from "./interact";
import { schema } from "./constant";
import { getConfigPath, loadConfig } from "./config";
import fs from "fs-extra";
import { ArticleProcessor, ArticleProcessResult, PublisherManager, PublisherPlugin, publisherPlugins } from "@artipub/core";
import { normalizePath, resolvePath } from "@artipub/shared";
import os from "node:os";
import path from "node:path";
import useLogger from "./logger";

import type { ActionType, AddOrUpdateCommandOptions, ArticleConfig } from "./types";

type InteractPrompt = Awaited<ReturnType<typeof interactPrompt>>;
const userHomeDir = os.homedir();
const userHomeDirDefaultConfigName = "artipub.config.mjs";
const logger = useLogger("cli");

const { require } = createCommonJS(import.meta.url);
const Ajv = require("Ajv");
const program = new Command();

export function help() {
  logger.info(`
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

async function updateArticle(
  type: ActionType,
  articlePath: string,
  config: ArticleConfig,
  pluginNameMapConfigPropertyName?: Record<string, string>
) {
  if (!validateConfig(config)) {
    throw new Error("Invalid configuration");
  }

  if (type == "Add") {
    return await addArticleToPlatform(articlePath, config, pluginNameMapConfigPropertyName);
  } else if (type === "Update") {
    return await updateArticleToPlatform(articlePath, config, pluginNameMapConfigPropertyName);
  } else {
    throw new Error("Invalid action type");
  }
}

async function addArticleToPlatform(articlePath: string, config: ArticleConfig, pluginNameMapConfigPropertyName?: Record<string, string>) {
  const processor = new ArticleProcessor({
    uploadImgOption: {
      ...config.githubOption,
    },
  });

  return processor.processMarkdown(articlePath).then(async ({ content }: ArticleProcessResult) => {
    const publisher = new PublisherManager(content);

    for (const publisherKey of Object.keys(publisherPlugins)) {
      const options = config.platforms[publisherKey as keyof typeof publisherPlugins];
      const plugin = publisherPlugins[publisherKey as keyof typeof publisherPlugins] as any;
      if (options) {
        const publishPlugin = plugin({ articlePath, ...options }) as PublisherPlugin;
        publisher.addPlugin(publishPlugin);
        if (pluginNameMapConfigPropertyName) {
          pluginNameMapConfigPropertyName[publishPlugin.name] = publisherKey;
        }
      }
    }

    const res = await publisher.publish();
    logger.info("publish res:", res);
    return res;
  });
}

function updateArticleToPlatform(_articlePath: string, _config: ArticleConfig, _pluginNameMapConfigPropertyName?: Record<string, string>) {
  //TODO:
  /* 
  1. 提取ArticlePath内容中的唯一串article_unique_id
  2. 根据article_unique_id 从缓存文章中获取文章之前被发布至哪些平台的信息
  3. 根据平台信息，将文章更新至对应平台
  */
}

function validateConfig(config: any) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(config);
  if (!valid) {
    throw new Error(validate.errors?.map((e: any) => e.message).join("\n"));
  }
  return true;
}

function saveConfigToUserHome(saveConfig: ArticleConfig) {
  if (!fs.existsSync(userHomeDir)) {
    fs.mkdirSync(userHomeDir);
  }

  const defaultConfigPath = path.resolve(userHomeDir, userHomeDirDefaultConfigName);
  if (fs.existsSync(defaultConfigPath)) {
    fs.removeSync(defaultConfigPath);
  }

  fs.writeFileSync(defaultConfigPath, `export default ${JSON.stringify(saveConfig, null, 2)}`);
}

function resolveConfigPath(configPath: string | undefined) {
  configPath = normalizePath(configPath);
  configPath = configPath ? resolvePath(configPath) : getConfigPath(process.cwd());
  if (!configPath && fs.existsSync(userHomeDir)) {
    configPath = getConfigPath(userHomeDir);
  }
  return configPath;
}

async function confirmConfig(config: ArticleConfig) {
  const platforms: string[] = Object.keys(config.platforms);
  if (Object.keys(platforms).length === 0) {
    throw new Error("No platform is configured.");
  }
  if (platforms.length === 1) {
    return;
  }
  const choicePlatforms = await promptForPlatform(platforms);
  if (choicePlatforms.length === 0) {
    throw new Error("No platform is selected.");
  }
  logger.info("Selected platforms:", choicePlatforms);
  for (const platform of Object.keys(config.platforms)) {
    if (!choicePlatforms.includes(platform)) {
      delete (config.platforms as any)[platform];
    }
  }
}

async function handleAddOrUpdate(type: ActionType, articlePath: string, options: AddOrUpdateCommandOptions) {
  articlePath = resolvePath(articlePath);
  if (!fs.existsSync(articlePath)) {
    throw new Error("Article path does not exist.");
  }

  const configPath = resolveConfigPath(options.config);
  if (configPath) {
    const config = await loadConfig(configPath);
    await confirmConfig(config);
    return updateArticle(type, articlePath, config);
  } else {
    const answers = await interactPrompt();
    const config = answersToConfig(answers);
    const pluginNameMapConfigPropertyName: Record<string, string> = {};
    const publishResults = await updateArticle(type, articlePath, config, pluginNameMapConfigPropertyName);
    if (publishResults) {
      for (const result of publishResults) {
        if (result.success || !result.name || !pluginNameMapConfigPropertyName[result.name]) {
          continue;
        }
        const configKey = pluginNameMapConfigPropertyName[result.name] as string;
        delete (config.platforms as any)[configKey];
      }
      saveConfigToUserHome(config);
    }
  }
}

export function registerCommands(resolve: (value?: unknown) => void) {
  program
    .command("add")
    .argument("<string>", "article path")
    .option("-c, --config [path]", "config file path, note: the path must be wrapped with quotation marks to avoid reporting that the path does not exist")
    .description("add an existing article")
    .action(async (articlePath: string, options: AddOrUpdateCommandOptions) => {
      await handleAddOrUpdate("Add", articlePath, options);
      resolve();
    });

  program
    .command("update")
    .argument("<string>", "article path")
    .option("-c, --config [path]", "config file path, note: the path must be wrapped with quotation marks to avoid reporting that the path does not exist")
    .description("Update an existing article")
    .action(async (articlePath: string, options: AddOrUpdateCommandOptions) => {
      await handleAddOrUpdate("Update", articlePath, options);
      resolve();
    });

  program
    .command("clear")
    .description("Clear the cache")
    .action(() => {
      logger.info("Cache cleared.");
      resolve();
    });

  if (process.argv.length <= 2) {
    help();
  } else {
    program.parse(process.argv);
  }
}
