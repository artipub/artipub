import { PostMapRecord } from "@/types";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { isString } from "./utils";
import { log } from "./log";

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
          if (key && value && value !== "undefined") {
            data[key] = value;
          }
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
    if (!pid) {
      log.warn(`addOrUpdate: PID is empty for articleUniqueID: ${articleUniqueID}, platformName: ${platformName}`);
      return;
    }
    if (!this.postMapRecords[articleUniqueID]) {
      this.postMapRecords[articleUniqueID] = {};
    }
    if (!this.postMapRecords[articleUniqueID][platformName] && !pid) {
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
  getRecords() {
    const records: Map<string, string> = new Map<string, string>();
    for (const articleUniqueID of Object.keys(this.postMapRecords)) {
      const record = this.encode(this.postMapRecords[articleUniqueID]);
      records.set(articleUniqueID, record);
    }
    return records.size > 0 ? Object.fromEntries(records.entries()) : null;
  }
  solidToNative() {
    const records = this.getRecords();
    if (records) {
      writeFileSync(this.filePath, JSON.stringify(records, null, 2), { encoding: "utf8" });
    }
  }
}
