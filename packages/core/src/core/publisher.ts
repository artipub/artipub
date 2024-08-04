import { PublisherPlugin, PublishResult } from "@/types";
import { createVisitor, isFunction } from "@/utils";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { cloneDeep } from "lodash-es";
import { Root } from "remark-stringify/lib";
import { visit } from "unist-util-visit";
import { Heading, Text } from "mdast";

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

    const tree = await unified().use(remarkParse).parse(this.content);

    const articleTitle = getArticleTitle(tree);
    const tasks: Promise<PublishResult>[] = [];
    for (const plugin of this.plugins) {
      const cloneTree = cloneDeep(tree);
      const result = plugin
        .process(articleTitle, createVisitor(cloneTree), () => toMarkdown(cloneTree))
        .then((res) => Object.assign({ name: plugin.name }, res));
      tasks.push(result);
    }
    if (tasks.length === 0) {
      throw new Error("No plugins were added, please add plugin before publish.");
    }
    return await Promise.all(tasks);
  }
}
