import { Plugin, PublishResult } from "@/lib/types";
import { createVisitor, isFunction } from "@/lib/utils";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { cloneDeep } from "lodash-es";
import { Root } from "remark-stringify/lib";
import { visit } from "unist-util-visit";
import { Heading, Text } from "mdast";

export class PublisherManager {
  private plugins: Plugin[];
  private content: string;
  /**
   * @param content markdown's content
   */
  constructor(content: string) {
    this.content = content;
    this.plugins = [];
  }
  addPlugin(plugin: Plugin) {
    if (!isFunction(plugin)) {
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
      tasks.push(plugin(articleTitle, createVisitor(cloneTree), toMarkdown.bind(null, cloneTree)));
    }
    return await Promise.all(tasks);
  }
}
