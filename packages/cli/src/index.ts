import { createCommonJS } from "mlly";
import { Command } from "commander";
import fs from "node:fs";
import interactPrompt from "./interact";
import { schema } from "./constant";
import { ArticleConfig } from "./type";

type InteractPrompt = Awaited<ReturnType<typeof interactPrompt>>;

const { require } = createCommonJS(import.meta.url);
const Ajv = require("Ajv");
const program = new Command();

function answersToConfig(answers: InteractPrompt): ArticleConfig {
  const { githubAnswers, platformAnswers } = answers;
  const config: ArticleConfig = {
    githubOption: githubAnswers,
    platforms: platformAnswers,
  };
  return config;
}

async function updateArticle(articlePath: string, config: ArticleConfig) {
  if (!validateConfig(config)) {
    throw new Error("Invalid configuration");
  }
  console.log("config:", config);

  //TODO: Implement the update article logic
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

async function handleAddOrUpdate(articlePath: string, options: any) {
  if (options.config) {
    const config = JSON.parse(fs.readFileSync(options.config, "utf8"));
    return updateArticle(articlePath, config);
  } else {
    const answers = await interactPrompt();
    const config = answersToConfig(answers);
    return updateArticle(articlePath, config);
  }
}

function help() {
  console.log(`
Usage: artipub [command]

Commands:
  add    <article path>  add an existing article
  update <article path>  update an existing article
  clear                  clear the cache

Options:
  -h, --help  display help for command
  `);
}

function registerCommands(resolve: (value?: unknown) => void) {
  program
    .command("add")
    .argument("<string>", "article path")
    .description("add an existing article")
    .option("--config <path>", "Path to the configuration file")
    .action(async (articlePath: string, options: any) => {
      await handleAddOrUpdate(articlePath, options);
      resolve();
    });

  program
    .command("update")
    .argument("<string>", "article path")
    .description("Update an existing article")
    .option("--config <path>", "Path to the configuration file")
    .action(async (articlePath: string, options: any) => {
      await handleAddOrUpdate(articlePath, options);
      resolve();
    });

  program
    .command("clear")
    .description("Clear the cache")
    .action(() => {
      console.log("Cache cleared.");
      resolve();
    });
}

export function run() {
  return new Promise((resolve, reject) => {
    try {
      registerCommands(resolve);
      if (process.argv.length <= 2) {
        help();
      } else {
        program.parse(process.argv);
      }
    } catch (error) {
      reject(error);
    }
  });
}

export default run;
