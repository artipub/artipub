import fs from "node:fs/promises";
import { ArticleProcessResult, ArticleProcessorOption, Middleware, Next, TVisitor } from "@/types";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { picCompress, picUpload } from "@/middleware";
import { createVisitor, getUniqueId } from "@/utils";
import { Paragraph, Text } from "mdast";
import { Node } from "unified/lib";

const defaultCompressedOptions = {
  quality: 80,
  compressed: true,
};

export interface ProcessorContext {
  option: ArticleProcessorOption;
  /**
   * The `filePath` property in the `ProcessorContext` interface is a string that represents the path to the Markdown file that you want to process.
   */
  filePath: string;
}

async function injectArticleUniqueId(context: ProcessorContext, visit: TVisitor, next: Next) {
  let articleUniqueID = null;
  visit("paragraph", (_node, _index, parent) => {
    const node = _node as Paragraph;
    if (parent?.type === "root" && _index === 1 && node && node.children[0] && node.children[0].type === "text") {
      let value = (node.children[0] as Text).value ?? "";
      const match = value.match(/id:\s+(\w+)$/im);
      if (match) {
        articleUniqueID = match[1];
        return true;
      } else {
        articleUniqueID = getUniqueId();
        value = `id: ${articleUniqueID}\n${value}`;
        node.children[0].value = value;
        return true;
      }
    }
  });

  next();
}

export class ArticleProcessor {
  public readonly option: ArticleProcessorOption;
  private middlewares: Middleware[];
  constructor(option: ArticleProcessorOption) {
    this.option = Object.assign({ compressedOptions: defaultCompressedOptions }, option);
    this.middlewares = [];
  }

  use(middleware: Middleware) {
    if (this.middlewares.includes(middleware)) {
      return this;
    }
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * The function processMarkdown takes a file path as input and returns a Promise that resolves with
   * the content of the markdown file.
   * @param {string} filePath - The `filePath` parameter in the `processMarkdown` function is a string
   * that represents the path to the Markdown file that you want to process.
   * @returns In the `processMarkdown` function, a `Promise` is being returned. This promise will
   * eventually resolve with a string value once the asynchronous operation inside the promise is
   * completed.
   */
  processMarkdown(filePath: string): Promise<ArticleProcessResult> {
    this.middlewares.push(picCompress);
    this.middlewares.push(picUpload);
    this.middlewares.push(injectArticleUniqueId);
    const articleProcessor = this;
    const context: ProcessorContext = {
      filePath,
      option: this.option,
    };

    function customMiddleware() {
      return (tree: Node) => {
        return new Promise<Node>((resolve) => {
          let i = 0;
          const next = async () => {
            if (i < articleProcessor.middlewares.length) {
              const middleware = articleProcessor.middlewares[i];
              i++;
              await middleware(context, createVisitor(tree), next);
            } else {
              resolve(tree);
            }
          };
          next();
        });
      };
    }

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding: "utf8" })
        .then((fileContent) => {
          return unified()
            .use(remarkParse, { encoding: "utf8" })
            .use(customMiddleware)
            .use(remarkStringify, { rule: "-", bullet: "-" })
            .process(fileContent);
        })
        .then((desContent) => {
          resolve({ content: desContent.toString() });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export { type Parent, type Node } from "unist";
