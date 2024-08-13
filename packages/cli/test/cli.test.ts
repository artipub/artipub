import type { SyncOptions, SyncResult } from "execa";
import { execaCommandSync } from "execa";
import path from "node:path";
import { expect, test } from "vitest";
import { getHelpInfo } from "../src/constant";

const CLI_PATH = path.join(__dirname, "..", "bin/index.js");

const run = <SO extends SyncOptions>(args: string[], options?: SO): SyncResult<SO> => {
  return execaCommandSync(`node ${CLI_PATH} ${args.join(" ")}`, options);
};

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
