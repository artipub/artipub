import { Test, Visitor } from "unist-util-visit/lib";
import { visit } from "unist-util-visit";
import { Node } from "unified/lib";
import { NodeContext, TVisitor } from "@/types";
import { nodeImgRelativePathRegex } from "./utils";
import { Heading } from "mdast";

export function createVisitor(tree: Node) {
  return function visitor(
    testOrVisitor: Visitor | Test,
    visitorOrReverse: Visitor | boolean | null | undefined,
    maybeReverse: boolean | null | undefined
  ): void {
    let reverse;
    let vt;
    let test;
    if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
      test = undefined;
      vt = testOrVisitor;
      reverse = visitorOrReverse;
    } else {
      test = testOrVisitor;
      vt = visitorOrReverse;
      reverse = maybeReverse;
    }
    visit(tree, test, vt, reverse);
  };
}

export function pickRelativeImgNode(visit: TVisitor) {
  const matchNodes: NodeContext[] = [];
  visit("image", async (_node, _index, parent) => {
    let { url } = _node as any;
    if (url) {
      matchNodes.push({ node: _node, parent: parent as any });
      url = decodeURIComponent(url);
      const regex = nodeImgRelativePathRegex;
      if (regex.test(url)) {
        matchNodes.push({
          node: _node,
          parent: parent,
        });
      }
    }
  });
  return matchNodes;
}

export function replaceImgUrlToCDN(visit: TVisitor, cdn_prefix: string, res_domain: string) {
  const regex = new RegExp(`/https://(${res_domain})/(.*?)/(.*?)/(.*?)(.png|.jpg|jpeg|svg|jif)`, "im");
  visit("image", (node: any) => {
    if (node.url && regex.test(node.url)) {
      regex.lastIndex = 0;
      const match = regex.exec(node.url);
      const [, , p3, p4, p5, p6] = match as string[];
      const cdnUrl = `${cdn_prefix}/${p3}/${p4}@${p5}${p6}`;
      node.url = cdnUrl;
    }
  });
}

export function pickTagNode(visit: TVisitor) {
  const tags: string[] = [];
  visit("list", (_node, index, parent) => {
    const node = _node as any;
    const prevSibling = parent?.children[Number(index) - 1] as any;
    if (prevSibling && prevSibling?.children && prevSibling.children[0].value === "tags:") {
      node.children.forEach((child: any) => {
        tags.push(child.children[0].children[0].value);
      });
      return true;
    }
  });
  return tags;
}

/**
 * Remove article description part
 * @param visit
 */
export function removeArticleDescPart(visit: TVisitor) {
  visit("heading", (_node, _index, parent) => {
    const node = _node as Heading;
    if (parent && node.depth === 1) {
      parent.children.splice(0, (_index ?? 0) + 1);
      return true;
    }
  });
}

export function removeTitle(visit: TVisitor) {
  visit("heading", (_node, _index, parent) => {
    const node = _node as Heading;
    if (parent && node.depth === 1) {
      parent.children.splice(0, (_index ?? 0) + 1);
      return true;
    }
  });
}
