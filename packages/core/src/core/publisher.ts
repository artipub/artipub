import { PublisherPlugin, PublishResult } from "@/types";
import { createVisitor, getProjectRootPath, isFunction, normalizedPath } from "@/utils";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { cloneDeep } from "lodash-es";
import { Root } from "remark-stringify/lib";
import { visit } from "unist-util-visit";
import { Heading, Paragraph, Text } from "mdast";
import path from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const postRecordsPath = normalizedPath(path.resolve(getProjectRootPath(), "postMapRecords.json"));

function getPostMapRecord() {
  let postMapRecords: Record<string, any> = {};
  if (existsSync(postRecordsPath!)) {
    postMapRecords = JSON.parse(readFileSync(postRecordsPath!, { encoding: "utf8" }));
  }
  return postMapRecords;
}

function updatePostMapRecords(postMapRecords: any) {
  if (postMapRecords) {
    return writeFileSync(postRecordsPath!, JSON.stringify(postMapRecords, null, 2), { encoding: "utf8" });
  }
}

export class PublisherManager {
  private plugins: PublisherPlugin[];
  private content: string;
  /**
   * @param content markdown's content
   */
  constructor(content: string) {
    this.content = content;
    this.plugins = [];
  }
  addPlugin(plugin: PublisherPlugin) {
    if (!isFunction(plugin.process)) {
      throw new Error("Plugin must be a function");
    }
    if (this.plugins.includes(plugin)) {
      return;
    }
    this.plugins.push(plugin);
  }
  async publish() {
    function toMarkdown(tree: Root) {
      const content = unified().use(remarkStringify, { rule: "-", bullet: "-" }).stringify(tree);
      return { content: content.toString() };
    }

    function getArticleTitle(tree: Root) {
      let articleName = "article";
      visit(tree, "heading", (node: Heading) => {
        if (node && node.depth === 1) {
          articleName = (node?.children[0] as Text).value;
          return true;
        }
      });
      return articleName;
    }

    function getArticleUniqueID(tree: Root, content: string) {
      let articleUniqueID = null;
      visit(tree, "paragraph", (node: Paragraph, index, parent) => {
        if (parent?.type === "root" && index === 1 && node && node.children[0] && node.children[0].type === "text") {
          const value = (node.children[0] as Text).value ?? "";
          const match = value.match(/id:\s+(\w+)$/im);
          if (match) {
            articleUniqueID = match[1];
            return true;
          }
        }
      });
      return articleUniqueID;
    }

    const tree = await unified().use(remarkParse).parse(this.content);
    const articleTitle = getArticleTitle(tree);
    const articleUniqueID = getArticleUniqueID(tree, this.content);
    const isNeedRecord = !!articleUniqueID;
    const postMapRecords = getPostMapRecord();
    const tasks: Promise<PublishResult>[] = [];
    for (const plugin of this.plugins) {
      const cloneTree = cloneDeep(tree);
      let postMapRecord: Record<string, any> = {};
      if (isNeedRecord) {
        postMapRecord = postMapRecords[articleUniqueID] = postMapRecords[articleUniqueID] ?? {};
      }
      if (plugin.extendsParam) {
        plugin.extendsParam({ pid: postMapRecord[plugin.name] });
      }
      const result = plugin
        .process(articleTitle, createVisitor(cloneTree), () => toMarkdown(cloneTree))
        .then((res) => {
          if (res.success && articleUniqueID) {
            postMapRecord[plugin.name] = res.pid;
          }
          return Object.assign({ name: plugin.name }, res);
        });
      tasks.push(result);
    }
    if (tasks.length === 0) {
      throw new Error("No plugins were added, please add plugin before publish.");
    }

    return await Promise.all(tasks).then((res) => {
      isNeedRecord && updatePostMapRecords(postMapRecords);
      return res;
    });
  }
}
