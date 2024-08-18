import { expect, describe, test, vi } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { PostMapRecorder } from "../src";

describe("PostMapRecorder", () => {
  test("convertRecordStructure", () => {
    const configPath = path.resolve(__dirname, "fixtures/utils/old.postMapRecords.json");
    const newConfigPath = path.resolve(__dirname, "fixtures/utils/postMapRecords.json");
    const postMapRecorder = new PostMapRecorder(configPath);
    const records = postMapRecorder.getRecords();
    const newRecords = JSON.parse(fs.readFileSync(newConfigPath, { encoding: "utf8" }));
    expect(records).toEqual(newRecords);
  });

  test("add record", () => {
    const configPath = path.resolve(__dirname, "fixtures/utils/postMapRecords.json");
    const postMapRecorder = new PostMapRecorder(configPath);
    postMapRecorder.addOrUpdate("aaaaaa", "NotionPublisherPlugin", "123456");

    const records = postMapRecorder.getRecords();
    expect(records).toEqual({
      jr1x8pn1: "p:NotionPublisherPlugin,k:ff8756c1-c815-4bfc-a357-xxx;p:DevToPublisherPlugin,k:33;",
      y605zk0s: "p:NotionPublisherPlugin,k:f3ff6887-206d-4c20-9a81-ttt;p:DevToPublisherPlugin,k:123;",
      aaaaaa: "p:NotionPublisherPlugin,k:123456;",
    });
  });

  test("update record", () => {
    const configPath = path.resolve(__dirname, "fixtures/utils/postMapRecords.json");
    const postMapRecorder = new PostMapRecorder(configPath);
    postMapRecorder.addOrUpdate("y605zk0s", "NotionPublisherPlugin", "123456");

    const records = postMapRecorder.getRecords();
    expect(records).toEqual({
      jr1x8pn1: "p:NotionPublisherPlugin,k:ff8756c1-c815-4bfc-a357-xxx;p:DevToPublisherPlugin,k:33;",
      y605zk0s: "p:NotionPublisherPlugin,k:123456;p:DevToPublisherPlugin,k:123;",
    });
  });
});
