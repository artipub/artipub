import { Plugin, PublishResult, TVisitor, ToMarkdown } from "@/types";
import { createVisitor, isFunction } from "@/utils";
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
      const content = unified()
        .use(remarkStringify, { rule: "-" })
        .stringify(tree);
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
    let tasks: Promise<PublishResult>[] = [];
    for (let plugin of this.plugins) {
      let cloneTree = cloneDeep(tree);
      tasks.push(
        plugin(
          articleTitle,
          createVisitor(cloneTree),
          toMarkdown.bind(null, cloneTree)
        )
      );
    }
    return await Promise.all(tasks);
  }
}
