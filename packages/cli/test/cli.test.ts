import type { SyncOptions, SyncResult } from "execa";
import { execaCommandSync } from "execa";
import path from "node:path";
import fs from "node:fs";
import { afterEach, beforeAll, expect, test, vi } from "vitest";

import CLI from "../src";
import type { ActionType, AddOrUpdateCommandOptions } from "../src";

const { getHelpInfo, command } = CLI;
const CLI_PATH = path.join(__dirname, "..", "bin/index.js");

const runDetach = <SO extends SyncOptions>(args: string[], options?: SO): SyncResult<SO> => {
  return execaCommandSync(`node ${CLI_PATH} ${args.join(" ")}`, options);
};

const projectName = "test-temp";
const genPath = path.join(__dirname, projectName);

const cleanGenPath = () => fs.rmSync(genPath, { recursive: true, force: true });
beforeAll(() => cleanGenPath());
afterEach(() => cleanGenPath());

test("output artipub help", () => {
  const { stdout } = runDetach([]);
  expect(stdout).toContain(getHelpInfo());
});

test("invalid command", () => {
  try {
    runDetach(["abc"]);
  } catch (error) {
    expect(error.message).toContain(`error: unknown command 'abc'`);
  }
});

test("Article path does not exist.", () => {
  try {
    runDetach(["add", "./ddd.md"]);
  } catch (error) {
    expect(error.message).toContain("Article path does not exist.");
  }
});

test("Add an existing article", async () => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(genPath);
    const testFilePath = path.join(genPath, "test.md");
    const configPath = path.join(__dirname, "fixtures/article/artipub.config.mjs");
    const rs = fs.createReadStream(path.join(__dirname, "fixtures/article/test.md"));
    const ws = fs.createWriteStream(testFilePath);
    rs.pipe(ws);

    ws.on("close", async () => {
      const handleAddOrUpdateMock = vi
        .spyOn(command, "handleAddOrUpdate")
        .mockImplementation(async (type: ActionType, articlePath: string, options: AddOrUpdateCommandOptions) => {
          const res = [
            {
              name: "DevToPublisherPlugin",
              success: true,
              id: "123",
              info: "Published to Dev.to",
            },
          ];
          console.log("publish res:", JSON.stringify(res, null, 2));
          return res;
        });

      CLI.run(["node", "--", "add", testFilePath, "-c", configPath])
        .then((publishRes) => {
          expect(publishRes).toMatchObject([
            {
              name: "DevToPublisherPlugin",
              success: true,
              info: "Published to Dev.to",
            },
          ]);
          resolve(null);
        })
        .catch((error_) => {
          reject(error_);
        })
        .finally(() => {
          handleAddOrUpdateMock.mockRestore();
        });
    });
  });
});

test("Clear cache", () => {
  const rootDir = path.join(__dirname, "../.artipub");
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir);
  }
  const cacheDir = path.join(rootDir, "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  runDetach(["clear"]);
  expect(fs.existsSync(cacheDir)).toBe(false);
});
