import type { SyncOptions, SyncResult } from "execa";
import { execaCommandSync } from "execa";
import path from "node:path";
import fs from "node:fs";
import { afterEach, beforeAll, expect, test, vi } from "vitest";

import { getHelpInfo } from "../src/constant";
import { handleAddOrUpdate } from "../src/command";
import { ActionType, AddOrUpdateCommandOptions } from "../src/types";

const CLI_PATH = path.join(__dirname, "..", "bin/index.js");

const run = <SO extends SyncOptions>(args: string[], options?: SO): SyncResult<SO> => {
  return execaCommandSync(`node ${CLI_PATH} ${args.join(" ")}`, options);
};

const projectName = "test-temp";
const genPath = path.join(__dirname, projectName);

const cleanGenPath = () => fs.rmSync(genPath, { recursive: true, force: true });
beforeAll(() => cleanGenPath());
afterEach(() => cleanGenPath());

test("output artipub help", () => {
  const { stdout } = run([]);
  expect(stdout).toContain(getHelpInfo());
});

test("invalid command", () => {
  try {
    run(["abc"]);
  } catch (error) {
    expect(error.message).toContain(`error: unknown command 'abc'`);
  }
});

test("Article path does not exist.", () => {
  try {
    run(["add", "./ddd.md"]);
  } catch (error) {
    expect(error.message).toContain("Article path does not exist.");
  }
});

test("Add an existing article", async () => {
  return new Promise((resolve) => {
    fs.mkdirSync(genPath);
    const rs = fs.createReadStream(path.join(__dirname, "fixtures/article/test.md"));
    const ws = fs.createWriteStream(path.join(genPath, "test.md"));
    rs.pipe(ws);

    ws.on("close", async () => {
      const handleAddOrUpdateMock = vi
        .fn(handleAddOrUpdate)
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

      const { stdout } = run(["add", "test.md"], { cwd: genPath, stdout: "pipe" });
      const mark = "publish res:";
      const output = stdout
        .slice(Math.max(0, stdout.indexOf(mark) + mark.length))
        .replace(/\n/gm, "")
        .trim();
      const result = JSON.parse(output);

      const result = await handleAddOrUpdateMock("Add", "test.md", {});

      expect(result).toMatchObject([
        {
          name: "DevToPublisherPlugin",
          success: true,
          info: "Published to Dev.to",
        },
      ]);
      resolve(null);
      handleAddOrUpdateMock.mockRestore();
    });
  });
});
