import chalk from "chalk";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

export const log = {
  info(...args: any) {
    console.error(chalk.green.bold("[INFO]:", ...args));
  },
  warn(...args: any) {
    console.error(chalk.yellow.bold("[WARN]:", ...args));
  },
  error(...args: any) {
    console.error(chalk.red.bold("[ERROR]:", ...args));
  },
};

export function isFunction(val: any) {
  return typeof val === "function";
}

export function getProjectRootPath() {
  return process.cwd();
}

export function normalizedPath(filePath: string) {
  return path.posix.normalize(filePath).replace(/\\/g, "/");
}

export async function getCache(cachePath: string) {
  let res = new Map<string, string>();
  try {
    if (!existsSync(cachePath)) {
      return res;
    }

    let cache = await fs.readFile(cachePath, { encoding: "utf-8" });
    let cacheArr = JSON.parse(cache);
    for (let key of Object.keys(cacheArr)) {
      res.set(key, cacheArr[key]);
    }
  } catch (error) {
    log.error(`read cache file fail ! cachePath:${cachePath}, error:${error}`);
  }
  return res;
}

export async function writeCache(
  cachePath: string,
  caches: Map<string, string>
) {
  let cacheObj: any = {};
  for (let [key, value] of caches) {
    cacheObj[key] = value;
  }
  try {
    let dir = cachePath.split("/").slice(0, -1).join("/");
    if (!existsSync(cachePath)) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(cachePath, JSON.stringify(cacheObj), {
      encoding: "utf-8",
    });
  } catch (error) {
    log.error(`write cache file fail ! cachePath:${cachePath}, error:${error}`);
  }
}
