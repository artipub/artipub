import chalk from "chalk";
import fs from "node:fs/promises";
import path from "node:path";
import { Node } from "unified/lib";
import { Test, Visitor } from "unist-util-visit/lib";
import { visit } from "unist-util-visit";
import { PostMapRecord } from "@/types";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

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

export function isString(val: any) {
  return typeof val === "string";
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

export class PostMapRecorder {
  private filePath: string;
  private postMapRecords: Record<string, PostMapRecord>;
  constructor(filePath: string) {
    this.filePath = filePath;
    this.postMapRecords = this.getPostMapRecord();
  }
  getPostMapRecord() {
    let postMapRecords: Record<string, any> = {};
    if (existsSync(this.filePath)) {
      postMapRecords = JSON.parse(readFileSync(this.filePath, { encoding: "utf8" }));
    }
    return this.convertRecordStructure(postMapRecords);
  }
  getPostRecord(articleUniqueID?: string | null) {
    if (!articleUniqueID) {
      return null;
    }
    if (!this.postMapRecords[articleUniqueID]) {
      this.postMapRecords[articleUniqueID] = {};
    }
    return this.postMapRecords[articleUniqueID];
  }
  convertRecordStructure(postMapRecords: Record<string, any>) {
    const newPostMapRecords: Record<string, PostMapRecord> = {};
    for (const articleUniqueID in postMapRecords) {
      if (postMapRecords[articleUniqueID] && !isString(postMapRecords[articleUniqueID])) {
        newPostMapRecords[articleUniqueID] = {};
        for (const platformName of Object.keys(postMapRecords[articleUniqueID])) {
          newPostMapRecords[articleUniqueID][platformName] = {
            k: postMapRecords[articleUniqueID][platformName],
          };
        }
      } else {
        newPostMapRecords[articleUniqueID] = this.decode(postMapRecords[articleUniqueID]);
      }
    }
    return newPostMapRecords;
  }
  decode(record: string) {
    const newRecord: PostMapRecord = {};
    if (record) {
      const platformArr = record.split(";");
      for (const platformData of platformArr) {
        const params = platformData.split(",");
        const data: Record<string, string> = {};
        for (const param of params) {
          const [key, value] = param.split(":");
          data[key] = value;
        }
        const platformName = data["p"];
        delete data["p"];
        if (platformName) {
          newRecord[platformName] = {
            ...data,
          };
        }
      }
    }
    return newRecord;
  }
  encode(record: PostMapRecord) {
    let recordStr = "";
    if (record) {
      for (const key in record) {
        const paramStr = this.encodeParams(record[key] as Record<string, string>);
        recordStr += `p:${key}`;
        if (paramStr && paramStr.length > 0) {
          recordStr += `,${paramStr}`;
        }
        recordStr += ";";
      }
    }
    return recordStr;
  }
  encodeParams(data: Record<string, string>) {
    let paramStr = "";
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      paramStr += i === keys.length - 1 ? `${key}:${data[key]}` : `${key}:${data[key]},`;
    }
    return paramStr;
  }
  addOrUpdate(articleUniqueID: string, platformName: string, pid?: string) {
    if (!platformName) {
      throw new Error("Platform name is required");
    }
    if (!this.postMapRecords[articleUniqueID]) {
      this.postMapRecords[articleUniqueID] = {};
    }
    if (!this.postMapRecords[articleUniqueID][platformName]) {
      this.postMapRecords[articleUniqueID][platformName] = {
        k: pid,
      };
    } else if (pid) {
      this.postMapRecords[articleUniqueID][platformName] = {
        ...this.postMapRecords[articleUniqueID][platformName],
        k: pid,
      };
    }
  }
  serialize() {
    const records: Map<string, string> = new Map<string, string>();
    for (const articleUniqueID of Object.keys(this.postMapRecords)) {
      const record = this.encode(this.postMapRecords[articleUniqueID]);
      records.set(articleUniqueID, record);
    }
    return records.size > 0 ? JSON.stringify(Object.fromEntries(records.entries()), null, 2) : null;
  }
  solidToNative() {
    const str = this.serialize();
    if (str) {
      writeFileSync(this.filePath, str, { encoding: "utf8" });
    }
  }
}
