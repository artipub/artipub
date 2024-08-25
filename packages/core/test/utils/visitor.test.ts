import { describe, test, expect } from "vitest";
import { createVisitor, pickRelativeImgNode, pickTagNode, removeArticleDescPart, removeTitle, replaceImgUrlToCDN } from "../../src";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { cloneDeep } from "lodash-es";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("visitor", async () => {
  const md = fs.readFileSync(path.join(__dirname, "../fixtures/core/draft.md"), "utf8");
  const tree = await unified().use(remarkParse).parse(md);

  test("pickRelativeImgNode", () => {
    const visit = createVisitor(cloneDeep(tree));
    const nodes = pickRelativeImgNode(visit);
    expect(nodes[0].node.url).toEqual("./img/artiPub.jpg");
  });

  test("removeArticleDescPart", () => {
    const visit = createVisitor(cloneDeep(tree));
    removeArticleDescPart(visit);
    expect(tree.children).not.contain("heading");
  });

  test("replaceImgUrlToCDN", () => {
    const visit = createVisitor(cloneDeep(tree));
    const nodes1 = pickRelativeImgNode(visit);
    for (const node of nodes1) {
      node.node.url = `https://example.com/${node.node.url}`;
    }

    replaceImgUrlToCDN(visit, "https://cdn.example.com", "example.com");
    const nodes = pickRelativeImgNode(visit);
    for (const node of nodes) {
      expect(node.node.url.startsWith("https://cdn.example.com")).toBeTruthy();
    }
  });

  test("removeTitle", () => {
    const clone = cloneDeep(tree);
    const visit = createVisitor(clone);
    removeTitle(visit);
    const nodes = clone.children;
    for (const node of nodes) {
      if (node.type !== "heading" || node.children.length === 0 || node.children[0].type !== "text") {
        continue;
      }
      expect(node.children[0].value).not.toEqual("h1");
    }
  });

  test("pickTagNode", () => {
    const visit = createVisitor(cloneDeep(tree));
    const tags = pickTagNode(visit);
    expect(tags).toEqual(["tag1", "tag2", "tag3"]);
  });
});
