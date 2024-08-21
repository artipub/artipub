import { Test, Visitor } from "unist-util-visit/lib";
import { visit } from "unist-util-visit";
import { Node } from "unified/lib";

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
