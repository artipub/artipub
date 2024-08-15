import { Command } from "commander";
import { createCommonJS } from "mlly";
import interact from "./interact";
import { getHelpInfo, schema } from "./constant";
import configHandler from "./config";
import fs from "fs-extra";
import { ArticleProcessor, ArticleProcessResult, PublisherManager, PublisherPlugin, publisherPlugins, PublishResult } from "@artipub/core";
import { normalizePath, resolvePath } from "@artipub/shared";
import os from "node:os";
import path from "node:path";
import useLogger from "./logger";

import type { ActionType, AddOrUpdateCommandOptions, ArticleConfig, RunResult } from "./types";

type InteractPrompt = Awaited<ReturnType<typeof interact.interactPrompt>>;
const userHomeDir = os.homedir();
const userHomeDirDefaultConfigName = "artipub.config.mjs";
const logger = useLogger("cli");

const { require } = createCommonJS(import.meta.url);
const Ajv = require("Ajv");
const program = new Command();

export default {
  help() {
    logger.info(getHelpInfo());
  },
  answersToConfig(answers: InteractPrompt): ArticleConfig {
    const { githubAnswers, platformAnswers } = answers;
    const config: ArticleConfig = {
      githubOption: githubAnswers,
      platforms: platformAnswers,
    };
    return config;
  },
  async updateArticle(
    type: ActionType,
    articlePath: string,
    config: ArticleConfig,
    pluginNameMapConfigPropertyName?: Record<string, string>
  ) {
    if (!this.validateConfig(config)) {
      throw new Error("Invalid configuration");
    }

    if (type == "Add") {
      return await this.addArticleToPlatform(articlePath, config, pluginNameMapConfigPropertyName);
    } else if (type === "Update") {
      return await this.updateArticleToPlatform(articlePath, config, pluginNameMapConfigPropertyName);
    } else {
      throw new Error("Invalid action type");
    }
  },
  async addArticleToPlatform(articlePath: string, config: ArticleConfig, pluginNameMapConfigPropertyName?: Record<string, string>) {
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
      logger.info("publish res:", JSON.stringify(res, null, 2));
      return res;
    });
  },
  updateArticleToPlatform(_articlePath: string, _config: ArticleConfig, _pluginNameMapConfigPropertyName?: Record<string, string>) {
    //TODO:
    /* 
    1. 提取ArticlePath内容中的唯一串article_unique_id
    2. 根据article_unique_id 从缓存文章中获取文章之前被发布至哪些平台的信息
    3. 根据平台信息，将文章更新至对应平台
    */
  },
  validateConfig(config: any) {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(config);
    if (!valid) {
      throw new Error(validate.errors?.map((e: any) => e.message).join("\n"));
    }
    return true;
  },
  saveConfigToUserHome(saveConfig: ArticleConfig) {
    if (!fs.existsSync(userHomeDir)) {
      fs.mkdirSync(userHomeDir);
    }

    const defaultConfigPath = path.resolve(userHomeDir, userHomeDirDefaultConfigName);
    if (fs.existsSync(defaultConfigPath)) {
      fs.removeSync(defaultConfigPath);
    }

    fs.writeFileSync(defaultConfigPath, `export default ${JSON.stringify(saveConfig, null, 2)}`);
  },
  resolveConfigPath(configPath: string | undefined) {
    configPath = normalizePath(configPath);
    configPath = configPath ? resolvePath(configPath) : configHandler.getConfigPath(process.cwd());
    if (!configPath && fs.existsSync(userHomeDir)) {
      configPath = configHandler.getConfigPath(userHomeDir);
    }
    return configPath;
  },
  async confirmConfig(config: ArticleConfig) {
    const platforms: string[] = Object.keys(config.platforms);
    if (Object.keys(platforms).length === 0) {
      throw new Error("No platform is configured.");
    }
    if (platforms.length === 1) {
      return;
    }
    const choicePlatforms = await interact.promptForPlatform(platforms);
    if (choicePlatforms.length === 0) {
      throw new Error("No platform is selected.");
    }
    logger.info("Selected platforms:", choicePlatforms);
    for (const platform of Object.keys(config.platforms)) {
      if (!choicePlatforms.includes(platform)) {
        delete (config.platforms as any)[platform];
      }
    }
  },
  async handleAddOrUpdate(type: ActionType, articlePath: string, options: AddOrUpdateCommandOptions): Promise<RunResult> {
    articlePath = resolvePath(articlePath);
    if (!fs.existsSync(articlePath)) {
      throw new Error("Article path does not exist.");
    }

    const configPath = this.resolveConfigPath(options.config);
    if (configPath) {
      const config = await configHandler.loadConfig(configPath);
      await this.confirmConfig(config);
      return this.updateArticle(type, articlePath, config);
    } else {
      const answers = await interact.interactPrompt();
      const config = this.answersToConfig(answers);
      const pluginNameMapConfigPropertyName: Record<string, string> = {};
      const publishResults = await this.updateArticle(type, articlePath, config, pluginNameMapConfigPropertyName);
      if (publishResults) {
        for (const result of publishResults) {
          if (result.success || !result.name || !pluginNameMapConfigPropertyName[result.name]) {
            continue;
          }
          const configKey = pluginNameMapConfigPropertyName[result.name] as string;
          delete (config.platforms as any)[configKey];
        }
        this.saveConfigToUserHome(config);
      }
      return publishResults;
    }
  },
  registerCommands(resolve: (value?: RunResult) => RunResult, reject: (message: string) => void, args: any = process.argv) {
    program
      .command("add")
      .argument("<string>", "article path")
      .option(
        "-c, --config [path]",
        "config file path, note: the path must be wrapped with quotation marks to avoid reporting that the path does not exist"
      )
      .description("add an existing article")
      .action(async (articlePath: string, options: AddOrUpdateCommandOptions) => {
        this.handleAddOrUpdate("Add", articlePath, options).then(resolve).catch(reject);
      });

    program
      .command("update")
      .argument("<string>", "article path")
      .option(
        "-c, --config [path]",
        "config file path, note: the path must be wrapped with quotation marks to avoid reporting that the path does not exist"
      )
      .description("Update an existing article")
      .action(async (articlePath: string, options: AddOrUpdateCommandOptions) => {
        this.handleAddOrUpdate("Update", articlePath, options).then(resolve).catch(reject);
      });

    program
      .command("clear")
      .description("Clear the cache")
      .action(() => {
        logger.info("Cache cleared.");
        resolve(null);
      });

    if (args.length <= 2) {
      this.help();
    } else {
      program.parse(args);
    }
  },
};
