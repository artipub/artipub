import { expect, describe, test, beforeAll, beforeEach, afterAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import pfs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { ArticleProcessor, PublisherManager, publisherPlugins } from "../../src";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, "..", "fixtures", "core");
const projectName = "test-temp-publisher";
const genPath = path.join(__dirname, projectName);

const cleanDir = async (dir: string) => {
  if (fs.existsSync(dir)) {
    const filePaths = await pfs.readdir(dir);
    for (const file of filePaths) {
      const curPath = path.join(dir, file);
      await (fs.lstatSync(curPath).isDirectory() ? pfs.rm(curPath, { recursive: true }) : pfs.unlink(curPath));
    }
    await pfs.rm(dir, { recursive: true });
  }
};
const copyFixturesToGenPath = () => fs.cpSync(fixturesPath, genPath, { recursive: true });

beforeAll(async () => {
  await cleanDir(genPath);
});

beforeEach(async () => {
  await cleanDir(genPath);
  await copyFixturesToGenPath();
});

afterAll(async () => {
  await cleanDir(genPath);
});

describe("publisher", () => {
  test("base", () => {
    return new Promise((resolve) => {
      const imgURL = "https://test.com/xxx.png";
      const processor = new ArticleProcessor({
        uploadImgOption: (filePath: string) => {
          return Promise.resolve(imgURL);
        },
      });

      processor.processMarkdown(path.join(genPath, "draft.md")).then(async ({ content }) => {
        const publisher = new PublisherManager(content);

        publisher.addPlugin(
          publisherPlugins.native({
            destination_path: genPath,
          })
        );

        const res = await publisher.publish();
        expect(res).toMatchObject([
          {
            name: publisherPlugins.native.name,
            success: true,
          },
        ]);

        const isExist = fs.existsSync(path.join(genPath, "Example.md"));
        expect(isExist).toBeTruthy();

        resolve(null);
      });
    });
  });
});
