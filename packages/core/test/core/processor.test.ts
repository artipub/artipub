import { expect, describe, test, beforeAll, afterEach, afterAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import pfs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ArticleProcessor, articleUniqueIdRegex, getProjectRootPath, normalizedPath, imgRelativePathRegex } from "../../src";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectName = "test-temp";
const genPath = path.join(__dirname, projectName);
const fixturesPath = path.join(__dirname, "..", "fixtures", "core");
const projectCacheDir = getProjectRootPath();
const cacheDir = path.join(projectCacheDir, ".artipub/cache");

const cleanDir = async (dir: string) => {
  if (fs.existsSync(dir)) {
    const filePaths = await pfs.readdir(dir);
    for (const file of filePaths) {
      const curPath = path.join(dir, file);
      await (fs.lstatSync(curPath).isDirectory() ? pfs.rmdir(curPath, { recursive: true }) : pfs.unlink(curPath));
    }
    await pfs.rmdir(dir);
  }
};
const copyFixturesToGenPath = () => fs.cpSync(fixturesPath, genPath, { recursive: true });

beforeAll(async () => {
  await cleanDir(cacheDir);
  await cleanDir(genPath);
  await copyFixturesToGenPath();
});

afterEach(async () => {
  await cleanDir(genPath);
  await copyFixturesToGenPath();
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
        uploadImgOption: (filePath: string) => {
          uploadCount++;
          return Promise.resolve(imgURL);
        },
      });

      const draftContent = fs.readFileSync(path.join(genPath, "draft.md"), "utf8");
      const matchImgs = draftContent.match(imgRelativePathRegex);
      const imgRelativePath = matchImgs ? matchImgs[0] : null;
      expect(imgRelativePath).not.toBeNull();

      processor.processMarkdown(path.join(genPath, "draft.md")).then(({ content }) => {
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
