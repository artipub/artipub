import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import { log } from "./log";

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
