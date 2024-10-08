import { expect, describe, test, beforeAll, beforeEach, afterAll, vi } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { cleanDir, copyDir } from "@artipub/shared";
import { ArticleProcessor, PublisherManager, publisherPlugins } from "../../src";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testTempDir = path.join(__dirname, "../../test-temp");
const fixturesPath = path.join(__dirname, "..", "fixtures", "core");
const projectName = "test-temp-publisher";
const genPath = path.join(testTempDir, projectName);

beforeAll(async () => {
  await cleanDir(genPath);
});

beforeEach(async () => {
  await cleanDir(genPath);
  await copyDir(fixturesPath, genPath);
});

afterAll(async () => {
  await cleanDir(genPath);
});

describe("publisher", () => {
  test("base", () => {
    return new Promise((resolve) => {
      const imgURL = "https://test.com/xxx.png";
      const processor = new ArticleProcessor({
        uploadImgOption: () => {
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

        const notion = publisherPlugins.notion({
          page_id: "page_id",
          api_key: "api_key",
        });
        vi.spyOn(notion, "update").mockImplementation(() => Promise.resolve());

        publisher.addPlugin(notion);

        const devTo = publisherPlugins.devTo({
          api_key: "api_key",
        });
        vi.spyOn(devTo, "update").mockImplementation(() => Promise.resolve());
        publisher.addPlugin(devTo);

        const res = await publisher.publish();
        expect(res).toMatchObject([
          {
            name: publisherPlugins.native.name,
            success: true,
          },
          {
            name: publisherPlugins.notion.name,
            success: true,
          },
          {
            name: publisherPlugins.devTo.name,
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
