import { expect, describe, test, beforeAll, beforeEach, afterAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ArticleProcessor, articleUniqueIdRegex, getProjectRootPath, normalizedPath, imgRelativePathRegex } from "../../src";
import { cleanDir, copyDir } from "@artipub/shared";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testTempDir = path.join(__dirname, "../../test-temp");
const projectName = "test-temp-processor";
const fixturesPath = path.join(__dirname, "..", "fixtures", "core");
const genPath = path.join(testTempDir, projectName);
const projectCacheDir = getProjectRootPath();
const cacheDir = path.join(projectCacheDir, ".artipub/cache");

beforeAll(async () => {
  await cleanDir(cacheDir);
  await cleanDir(genPath);
});

beforeEach(async () => {
  await cleanDir(genPath);
  await copyDir(fixturesPath, genPath);
});

afterAll(async () => {
  await cleanDir(cacheDir);
  await cleanDir(genPath);
});

describe("processor", () => {
  test("base", async () => {
    return new Promise((resolve) => {
      const imgURL = "https://test.com/xxx.png";
      let uploadCount = 0;
      const processor = new ArticleProcessor({
        uploadImgOption: (filePath: string) => {
          uploadCount++;
          return Promise.resolve(imgURL);
        },
      });

      processor.processMarkdown(path.join(genPath, "draft.md")).then(({ content }) => {
        expect(uploadCount).toBe(1);

        expect(content).toContain(imgURL);
        expect(articleUniqueIdRegex.test(content)).toBeTruthy();

        resolve(null);
      });
    });
  });

  test("use cache", async () => {
    return new Promise((resolve) => {
      const imgURL = "https://test.com/xxx.png";
      let uploadCount = 0;
      const processor = new ArticleProcessor({
        uploadImgOption: () => {
          uploadCount++;
          return Promise.resolve(imgURL);
        },
      });

      const draftContent = fs.readFileSync(path.join(genPath, "draft.md"), "utf8");
      const matchImgs = draftContent.match(imgRelativePathRegex);
      const imgRelativePath = matchImgs ? matchImgs[0] : null;
      expect(imgRelativePath).not.toBeNull();

      processor.processMarkdown(path.join(genPath, "draft.md")).then(() => {
        expect(uploadCount).toBe(0);

        const compressCachePath = normalizedPath(path.join(cacheDir, "compressCache.json"));
        const uploadCachePath = normalizedPath(path.join(cacheDir, "uploadCache.json"));

        expect(fs.existsSync(compressCachePath)).toBeTruthy();
        expect(fs.existsSync(uploadCachePath)).toBeTruthy();

        const compressCache = JSON.parse(fs.readFileSync(compressCachePath, "utf8"));
        const uploadCache = JSON.parse(fs.readFileSync(uploadCachePath, "utf8"));

        expect(compressCache[imgRelativePath!]).not.toBeUndefined();
        expect(uploadCache[imgRelativePath!]).not.toBeUndefined();

        resolve(null);
      });
    });
  });
});
