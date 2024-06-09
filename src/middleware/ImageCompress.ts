import { Middleware } from "../types";
import { Node } from "unist";

export function ImageCompress(node: Node, next: Middleware) {
	console.log("ImageCompress");
	return next(node, next);
}
