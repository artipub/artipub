import { PublisherPlugin, PublishResult } from "@/types";
import { articleUniqueIdRegex, createVisitor, getProjectRootPath, isFunction, isString, normalizedPath, PostMapRecorder } from "@/utils";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { cloneDeep } from "lodash-es";
import { Root } from "remark-stringify/lib";
import { visit } from "unist-util-visit";
import { Heading, Paragraph, Text } from "mdast";
import path from "node:path";

const postRecordsPath = normalizedPath(path.resolve(getProjectRootPath(), "postMapRecords.json"));

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
          const match = value.match(articleUniqueIdRegex);
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
    const postMapRecorder = new PostMapRecorder(postRecordsPath!);
    const tasks: Promise<PublishResult>[] = [];
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      const cloneTree = cloneDeep(tree);
      const postMapRecord: Record<string, any> | null = postMapRecorder.getPostRecord(articleUniqueID);
      if (plugin.extendsParam && postMapRecord) {
        plugin.extendsParam({ pid: postMapRecord[plugin.name]?.k });
      }
      const result = plugin
        .process(articleTitle, createVisitor(cloneTree), () => toMarkdown(cloneTree))
        .then((res) => {
          if (res.success && plugin?.isTraceUpdate && articleUniqueID) {
            postMapRecorder.addOrUpdate(articleUniqueID, plugin.name, res.pid);
          }
          return Object.assign({ name: plugin.name }, res);
        });
      tasks.push(result);
    }
    if (tasks.length === 0) {
      throw new Error("No plugins were added, please add plugin before publish.");
    }

    return await Promise.all(tasks).then((res) => {
      isNeedRecord && postMapRecorder.solidToNative();
      return res;
    });
  }
}
