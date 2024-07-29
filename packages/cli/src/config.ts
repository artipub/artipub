import path from "node:path";
import { normalizePath } from "@artipub/shared";
import { createCommonJS } from "mlly";
import url from "node:url";

import type { ArticleConfig } from "./types";

const { require } = createCommonJS(import.meta.url);
const fs = require("fs-extra");

const supportedConfigExtensions = ["js", "mjs"];

export function defineConfig(config: ArticleConfig) {
  return config;
}

export function getConfigPath(dir: string = process.cwd()) {
  dir = normalizePath(path.resolve(dir));
  const configPath = supportedConfigExtensions
    .flatMap((ext) => [path.resolve(dir, `artipub.config.${ext}`)])
    .find((it) => fs.pathExistsSync(it));
  return configPath;
}

export async function loadConfig(configPath: string) {
  if (!fs.pathExistsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  const configModule = await import(url.pathToFileURL(configPath).toString());
  return configModule.default;
}
