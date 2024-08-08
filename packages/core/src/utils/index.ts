import chalk from "chalk";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Node } from "unified/lib";
import { Test, Visitor } from "unist-util-visit/lib";
import { visit } from "unist-util-visit";

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

export function getUniqueId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function getCache(cachePath: string) {
  const res = new Map<string, string>();
  try {
    if (!existsSync(cachePath)) {
      return res;
    }

    const cache = await fs.readFile(cachePath, { encoding: "utf8" });
    const cacheArr = JSON.parse(cache);
    for (const key of Object.keys(cacheArr)) {
      res.set(key, cacheArr[key]);
    }
  } catch (error) {
    log.error(`read cache file fail ! cachePath:${cachePath}, error:${error}`);
  }
  return res;
}

export async function writeCache(cachePath: string, caches: Map<string, string>) {
  const cacheObj: any = {};
  for (const [key, value] of caches) {
    cacheObj[key] = value;
  }
  try {
    const dir = cachePath.split("/").slice(0, -1).join("/");
    if (!existsSync(cachePath)) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(cachePath, JSON.stringify(cacheObj), {
      encoding: "utf8",
    });
  } catch (error) {
    log.error(`write cache file fail ! cachePath:${cachePath}, error:${error}`);
  }
}

export function createVisitor(tree: Node) {
  return function visitor(
    testOrVisitor: Visitor | Test,
    visitorOrReverse: Visitor | boolean | null | undefined,
    maybeReverse: boolean | null | undefined
  ): void {
    let reverse;
    let vt;
    let test;
    if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
      test = undefined;
      vt = testOrVisitor;
      reverse = visitorOrReverse;
    } else {
      test = testOrVisitor;
      vt = visitorOrReverse;
      reverse = maybeReverse;
    }
    visit(tree, test, vt, reverse);
  };
}

export const relativePathImgRegex = /^[^?hpst].+\.(png|jpg|jpeg|svg|gif)$/im;
