import { expect, describe, test, vi, beforeAll, afterEach } from "vitest";
import path from "node:path";
import fs from "node:fs";
import pfs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  ArticleProcessor,
  PublisherManager,
  publisherPlugins,
  ProcessorContext,
  TVisitor,
  Next,
  relativePathImgRegex,
  articleUniqueIdRegex,
} from "../../src";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectName = "test-temp";
const genPath = path.join(__dirname, projectName);
const fixturesPath = path.join(__dirname, "..", "fixtures", "core");

const cleanGenPath = async () => {
  if (fs.existsSync(genPath)) {
    const filePaths = await pfs.readdir(genPath);
    for (const file of filePaths) {
      const curPath = path.join(genPath, file);
      await (fs.lstatSync(curPath).isDirectory() ? pfs.rmdir(curPath, { recursive: true }) : pfs.unlink(curPath));
    }
    await pfs.rmdir(genPath);
  }
};
const copyFixturesToGenPath = () => fs.cpSync(fixturesPath, genPath, { recursive: true });

beforeAll(() => {
  cleanGenPath();
  copyFixturesToGenPath();
});

afterEach(async () => {
  await cleanGenPath();
});

describe("processor", () => {
  test("base", async () => {
    return new Promise((resolve) => {
      const imgURL = "https://test.com/xxx.png";
      const processor = new ArticleProcessor({
        uploadImgOption: () => {
          return Promise.resolve(imgURL);
        },
      });

      processor.processMarkdown(path.join(genPath, "draft.md")).then(({ content }) => {
        expect(content).toContain(imgURL);
        expect(articleUniqueIdRegex.test(content)).toBeTruthy();

        resolve(null);
      });
    });
  });
});
