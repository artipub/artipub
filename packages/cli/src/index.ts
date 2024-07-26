import { Command } from "commander";
import inquirer from "inquirer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import interactPrompt from "./interact";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();

function answersToConfig(answers: any) {}

async function updateArticle(articlePath: string, config: any) {}

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

function registerCommands() {
  program
    .command("add <article path>")
    .description("add an existing article")
    .option("--config <path>", "Path to the configuration file")
    .action(async (articlePath: string, options: any) => {
      handleAddOrUpdate(articlePath, options);
    });

  program
    .command("update <article path>")
    .description("Update an existing article")
    .option("--config <path>", "Path to the configuration file")
    .action(async (articlePath: string, options: any) => {
      handleAddOrUpdate(articlePath, options);
    });

  program
    .command("clear cache")
    .description("Clear the cache")
    .action(() => {
      console.log("Cache cleared.");
      //TODO:
    });

  program
    .command("-h")
    .description("Display help")
    .action(() => {
      program.help();
    });
}

export function run() {
  return new Promise((resolve, reject) => {
    try {
      registerCommands();
      resolve(void 0);
    } catch (error) {
      reject(error);
    }
  });
}

export default run;
